"""
Management command to import products into the database from a CSV file.
"""
import csv
import os
from decimal import Decimal
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from configuration.models import Branch, Organization
from product.models import Category, Product, Product_Detail, Stock, Unit


class Command(BaseCommand):
    help = 'Import products from a CSV file into product, product detail, and stock tables.'

    def add_arguments(self, parser):
        parser.add_argument('csv_path', type=str, help='Path to the CSV file to import')
        parser.add_argument('--organization-id', type=int, default=None, help='Default organization id for imported products')
        parser.add_argument('--branch-id', type=int, default=None, help='Default branch id for imported products')
        parser.add_argument('--delimiter', type=str, default=',', help='CSV delimiter')
        parser.add_argument('--encoding', type=str, default='utf-8', help='CSV file encoding')
        parser.add_argument('--dry-run', action='store_true', help='Validate import without saving changes')

    def handle(self, *args, **options):
        csv_path = options['csv_path']
        default_org_id = options['organization_id']
        default_branch_id = options['branch_id']
        delimiter = options['delimiter']
        encoding = options['encoding']
        dry_run = options['dry_run']

        if not os.path.isfile(csv_path):
            raise CommandError(f"CSV file not found: {csv_path}")

        default_org = None
        if default_org_id is not None:
            try:
                default_org = Organization.objects.get(id=default_org_id)
            except Organization.DoesNotExist:
                raise CommandError(f"Organization with id {default_org_id} does not exist")

        default_branch = None
        if default_branch_id is not None:
            try:
                default_branch = Branch.objects.get(id=default_branch_id)
            except Branch.DoesNotExist:
                raise CommandError(f"Branch with id {default_branch_id} does not exist")

        self.stdout.write(f"Importing products from {csv_path}")
        if dry_run:
            self.stdout.write(self.style.WARNING("Running in dry-run mode; no changes will be saved."))

        with open(csv_path, newline='', encoding=encoding) as csvfile:
            reader = csv.DictReader(csvfile, delimiter=delimiter)
            if not reader.fieldnames:
                raise CommandError("CSV file does not contain a header row")

            imported = 0
            updated = 0
            skipped = 0
            errors = []

            with transaction.atomic():
                for line_number, row in enumerate(reader, start=2):
                    try:
                        created = self.import_row(row, default_org, default_branch)
                        if created:
                            imported += 1
                        else:
                            updated += 1
                    except Exception as exc:
                        skipped += 1
                        errors.append((line_number, str(exc)))

                if dry_run:
                    self.stdout.write(self.style.WARNING('Dry-run complete; rolling back transaction.'))
                    raise CommandError('Dry-run mode: no database changes were committed.')

            self.stdout.write(self.style.SUCCESS(f"Imported: {imported}, Updated: {updated}, Skipped: {skipped}"))
            if errors:
                self.stdout.write(self.style.ERROR('Errors:'))
                for line, message in errors:
                    self.stdout.write(self.style.ERROR(f'  Line {line}: {message}'))

    def import_row(self, row, default_org, default_branch):
        item_name = (row.get('item_name') or '').strip()
        if not item_name:
            raise ValueError('item_name is required')

        category_name = (row.get('category') or '').strip() or 'Uncategorized'
        model_value = (row.get('model') or '').strip()
        barcode = (row.get('barcode') or '').strip() or None
        serial_no = (row.get('serial_no') or '').strip() or None
        is_service_value = (row.get('is_service') or '').strip().lower()
        is_service = is_service_value in ('1', 'true', 'yes', 'on', 'y')

        org_id = row.get('organization_id') or row.get('organization')
        branch_id = row.get('branch_id') or row.get('branch')
        unit_name = (row.get('unit_name') or '').strip() or None

        try:
            minimum_requirement = int((row.get('minimum_requirement') or 0) or 0)
        except ValueError:
            raise ValueError('minimum_requirement must be an integer')

        def parse_decimal(value):
            if value is None or str(value).strip() == '':
                return Decimal('0')
            try:
                return Decimal(str(value).strip())
            except Exception:
                raise ValueError(f'Invalid decimal value: {value}')

        purchased_price = parse_decimal(row.get('purchased_price'))
        selling_price = parse_decimal(row.get('selling_price'))
        current_amount = parse_decimal(row.get('current_amount'))
        selling_amount = parse_decimal(row.get('selling_amount'))
        purchasing_amount = parse_decimal(row.get('purchasing_amount'))
        loss_amount = parse_decimal(row.get('loss_amount'))

        organization = default_org
        if org_id:
            try:
                organization = Organization.objects.get(id=int(org_id))
            except (ValueError, Organization.DoesNotExist):
                raise ValueError(f'Invalid organization_id: {org_id}')

        if organization is None:
            raise ValueError('Organization must be provided either via --organization-id or organization_id/organization field in CSV')

        branch = default_branch
        if branch_id:
            try:
                branch = Branch.objects.get(id=int(branch_id))
            except (ValueError, Branch.DoesNotExist):
                raise ValueError(f'Invalid branch_id: {branch_id}')
        if branch and branch.organization_id != organization.id:
            raise ValueError('Branch does not belong to the selected organization')

        category, _ = Category.objects.get_or_create(name=category_name)

        product, created = Product.objects.get_or_create(
            item_name=item_name,
            model=model_value,
            defaults={
                'category': category,
                'barcode': barcode,
                'serial_no': serial_no,
                'is_service': is_service,
            }
        )

        if not created:
            updated_fields = {}
            if barcode:
                updated_fields['barcode'] = barcode
            if serial_no:
                updated_fields['serial_no'] = serial_no
            if product.category_id != category.id:
                updated_fields['category'] = category
            updated_fields['is_service'] = is_service
            if updated_fields:
                for key, value in updated_fields.items():
                    setattr(product, key, value)
                product.save()

        unit = None
        if unit_name:
            unit, _ = Unit.objects.get_or_create(name=unit_name, defaults={'organization': organization})

        product_detail_defaults = {
            'organization': organization,
            'branch': branch,
            'minimum_requirement': minimum_requirement,
            'purchased_price': purchased_price,
            'selling_price': selling_price,
            'unit': unit,
        }
        Product_Detail.objects.update_or_create(
            product=product,
            defaults=product_detail_defaults
        )

        stock_defaults = {
            'current_amount': current_amount,
            'selling_amount': selling_amount,
            'purchasing_amount': purchasing_amount,
            'loss_amount': loss_amount,
        }
        Stock.objects.update_or_create(
            product=product,
            organization=organization,
            branch=branch,
            defaults=stock_defaults
        )

        return created
