"""
Django management command to assign all organizations to admin users.
This is a one-time command to fix existing data.

Usage:
    python manage.py assign_orgs_to_admins
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from configuration.models import Organization
from user.models import OrganizationUser


class Command(BaseCommand):
    help = 'Assigns all organizations to all admin/superuser users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making any changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('🔍 DRY RUN MODE - No changes will be made'))
        
        # Get all admin/superuser users
        admin_users = User.objects.filter(is_superuser=True) | User.objects.filter(is_staff=True)
        admin_users = admin_users.distinct()
        
        # Get all active organizations
        all_orgs = Organization.objects.filter(is_active=True)
        
        self.stdout.write(f'\n📊 Statistics:')
        self.stdout.write(f'   - Admin users found: {admin_users.count()}')
        self.stdout.write(f'   - Active organizations: {all_orgs.count()}')
        self.stdout.write(f'   - Total assignments to create: {admin_users.count() * all_orgs.count()}\n')
        
        created_count = 0
        existing_count = 0
        
        for admin_user in admin_users:
            self.stdout.write(f'\n👤 Processing user: {admin_user.username} (ID: {admin_user.id})')
            
            for org in all_orgs:
                if dry_run:
                    # Check if exists
                    exists = OrganizationUser.objects.filter(
                        user=admin_user,
                        organization=org
                    ).exists()
                    
                    if exists:
                        self.stdout.write(f'   ✓ Already assigned to: {org.name}')
                        existing_count += 1
                    else:
                        self.stdout.write(self.style.SUCCESS(f'   ➕ Would assign to: {org.name}'))
                        created_count += 1
                else:
                    # Actually create the assignment
                    org_user, created = OrganizationUser.objects.get_or_create(
                        user=admin_user,
                        organization=org,
                        defaults={
                            'role': 'superuser',
                            'is_active': True
                        }
                    )
                    
                    if created:
                        self.stdout.write(self.style.SUCCESS(f'   ✅ Assigned to: {org.name}'))
                        created_count += 1
                    else:
                        self.stdout.write(f'   ✓ Already assigned to: {org.name}')
                        existing_count += 1
        
        # Summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('\n✅ SUMMARY:'))
        self.stdout.write(f'   - New assignments {"would be " if dry_run else ""}created: {created_count}')
        self.stdout.write(f'   - Existing assignments found: {existing_count}')
        self.stdout.write(f'   - Total: {created_count + existing_count}')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\n⚠️  This was a dry run. Run without --dry-run to apply changes.'))
        else:
            self.stdout.write(self.style.SUCCESS('\n🎉 All admin users now have access to all organizations!'))
        
        self.stdout.write('='*60 + '\n')
