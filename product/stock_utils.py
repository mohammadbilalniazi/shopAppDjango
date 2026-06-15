from django.db import IntegrityError, transaction

from .models import Stock


def get_stock_for_scope(product, organization, branch=None, create=True, defaults=None, align_branch=False):
    """
    Return the stock row for a product/organization/branch scope.

    Older databases in this project may still enforce uniqueness on
    (organization, product), while newer model code expects
    (organization, product, branch). This helper prefers the exact branch row,
    reuses a legacy no-branch row when present, and falls back gracefully if a
    legacy database rejects branch-specific inserts.
    """
    defaults = defaults or {}

    stock = Stock.objects.filter(
        product=product,
        organization=organization,
        branch=branch,
    ).first()

    if stock is None and branch is not None:
        stock = Stock.objects.filter(
            product=product,
            organization=organization,
            branch__isnull=True,
        ).first()

    if stock is None and create:
        stock = Stock(
            product=product,
            organization=organization,
            branch=branch,
            **defaults,
        )
        try:
            with transaction.atomic():
                stock.save()
        except IntegrityError:
            stock = Stock.objects.filter(
                product=product,
                organization=organization,
            ).order_by('-id').first()
            if stock is None:
                raise

    if stock is not None and align_branch and stock.branch_id != (branch.id if branch else None):
        stock.branch = branch

    return stock
