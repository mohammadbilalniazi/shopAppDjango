from django.db import models
from common.date import current_shamsi_date
from configuration.models import Organization
from django.db.models import Sum, F, Q
from decimal import Decimal

def get_year():
    return int(current_shamsi_date().split("-")[0])

# ============================================
# Asset Summary Models (Existing - Enhanced)
# ============================================

bill_types=(("PURCHASE","PURCHASE"),("SELLING","SELLING"),("PAYMENT","PAYMENT"),("RECEIVEMENT","RECEIVEMENT"),("LOSSDEGRADE","LOSSDEGRADE"),("EXPENSE","EXPENSE"))

class AssetBillSummary(models.Model):
    """
    Summary of bills per organization, receiver, type, and year.
    Tracks inter-organization transactions (PURCHASE, SELLING, PAYMENT, RECEIVEMENT)
    and internal transactions (EXPENSE, LOSSDEGRADE).
    """
    bill_type=models.CharField(max_length=11,default="PURCHASE",choices=bill_types)  
    organization = models.ForeignKey(
        Organization, on_delete=models.PROTECT,null=True,
        related_name="assetbillorganization"
    )
    bill_rcvr_org = models.ForeignKey(
        Organization, on_delete=models.PROTECT,null=True,
        related_name="assetbillrcvrorg"
    )
    total=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    payment=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    year=models.SmallIntegerField(default=get_year)
    profit=models.IntegerField(default=0)
    currency=models.CharField(max_length=7,default="afg")

    class Meta:
        unique_together=("year","organization","bill_rcvr_org","bill_type")
    
    def __str__(self):
        return f"{self.organization} - {self.bill_type} - {self.year}"


bill_types_whole=(("PURCHASE","PURCHASE"),("PURCHASED_AMNT_USNG_STOCK","PURCHASED_AMNT_USNG_STOCK"),("SELLING","SELLING"),("PAYMENT","PAYMENT"),("RECEIVEMENT","RECEIVEMENT"),("LOSSDEGRADE","LOSSDEGRADE"),("EXPENSE","EXPENSE"))

class AssetWholeBillSummary(models.Model):
    """
    Aggregate summary across all years per organization and bill type.
    Used for overall financial position tracking.
    """
    bill_type=models.CharField(max_length=25,default="PURCHASE",choices=bill_types_whole)  
    organization = models.ForeignKey(
        Organization, on_delete=models.PROTECT,null=True
    )
    total=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    payment=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    profit=models.IntegerField(default=0)
    currency=models.CharField(max_length=7,default="afg")

    class Meta:
        unique_together=("organization","bill_type")
    
    def __str__(self):
        return f"{self.organization} - {self.bill_type}"


# ============================================
# NEW: Comprehensive Asset Tracking Models
# ============================================

ASSET_TYPE = (
    ('SOLID', 'Solid Asset'),  # Fixed assets: equipment, inventory, property
    ('LIQUID', 'Liquid Asset'),  # Cash and cash equivalents
)

class OrganizationAsset(models.Model):
    """
    Tracks current asset position for an organization.
    Automatically calculated from bills.
    """
    organization = models.OneToOneField(
        Organization, 
        on_delete=models.PROTECT,
        related_name="asset_summary"
    )
    
    # Solid Assets (Inventory/Products)
    inventory_value = models.DecimalField(
        max_digits=20, 
        decimal_places=5, 
        default=0,
        help_text="Total value of inventory (products in stock)"
    )
    
    # Liquid Assets (Cash)
    cash_on_hand = models.DecimalField(
        max_digits=20, 
        decimal_places=5, 
        default=0,
        help_text="Available cash (liquid asset)"
    )
    
    # Receivables (Money owed TO us)
    accounts_receivable = models.DecimalField(
        max_digits=20, 
        decimal_places=5, 
        default=0,
        help_text="Money owed by customers (SELLING - payment received)"
    )
    
    # Payables (Money we OWE)
    accounts_payable = models.DecimalField(
        max_digits=20, 
        decimal_places=5, 
        default=0,
        help_text="Money we owe to suppliers (PURCHASE - payment made)"
    )
    
    # Loans
    loans_receivable = models.DecimalField(
        max_digits=20, 
        decimal_places=5, 
        default=0,
        help_text="Money loaned out (PAYMENT - money given)"
    )
    
    loans_payable = models.DecimalField(
        max_digits=20, 
        decimal_places=5, 
        default=0,
        help_text="Money borrowed (RECEIVEMENT - money received)"
    )
    
    # Total Assets & Liabilities (Auto-calculated)
    total_assets = models.DecimalField(
        max_digits=20, 
        decimal_places=5, 
        default=0,
        help_text="inventory + cash + receivables + loans_receivable"
    )
    
    total_liabilities = models.DecimalField(
        max_digits=20, 
        decimal_places=5, 
        default=0,
        help_text="payables + loans_payable"
    )
    
    equity = models.DecimalField(
        max_digits=20, 
        decimal_places=5, 
        default=0,
        help_text="total_assets - total_liabilities"
    )
    
    # Profit & Loss
    total_revenue = models.DecimalField(
        max_digits=20, 
        decimal_places=5, 
        default=0,
        help_text="Total from SELLING bills"
    )
    
    total_cost_of_goods_sold = models.DecimalField(
        max_digits=20, 
        decimal_places=5, 
        default=0,
        help_text="Total from PURCHASE bills"
    )
    
    total_expenses = models.DecimalField(
        max_digits=20, 
        decimal_places=5, 
        default=0,
        help_text="Total from EXPENSE bills"
    )
    
    total_losses = models.DecimalField(
        max_digits=20, 
        decimal_places=5, 
        default=0,
        help_text="Total from LOSSDEGRADE bills"
    )
    
    net_profit = models.DecimalField(
        max_digits=20, 
        decimal_places=5, 
        default=0,
        help_text="revenue - COGS - expenses - losses"
    )
    
    currency = models.CharField(max_length=7, default="afg")
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Organization Asset Summary"
        verbose_name_plural = "Organization Asset Summaries"
    
    def __str__(self):
        return f"Assets: {self.organization.name}"
    
    def calculate_totals(self):
        """Calculate total assets, liabilities, and equity"""
        self.total_assets = (
            self.inventory_value + 
            self.cash_on_hand + 
            self.accounts_receivable + 
            self.loans_receivable
        )
        
        self.total_liabilities = (
            self.accounts_payable + 
            self.loans_payable
        )
        
        self.equity = self.total_assets - self.total_liabilities
        
        self.net_profit = (
            self.total_revenue - 
            self.total_cost_of_goods_sold - 
            self.total_expenses - 
            self.total_losses
        )
    
    def save(self, *args, **kwargs):
        self.calculate_totals()
        super().save(*args, **kwargs)


LOAN_TYPE = (
    ('PAYABLE', 'Loan Payable'),  # Money we borrowed (liability)
    ('RECEIVABLE', 'Loan Receivable'),  # Money we lent (asset)
)

LOAN_STATUS = (
    ('ACTIVE', 'Active'),
    ('PAID', 'Fully Paid'),
    ('PARTIAL', 'Partially Paid'),
    ('DEFAULTED', 'Defaulted'),
)

class Loan(models.Model):
    """
    Track individual loans (both payable and receivable).
    Linked to PAYMENT and RECEIVEMENT bills.
    """
    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name="loans"
    )
    
    counterparty = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name="loan_counterparties",
        help_text="The organization we borrowed from or lent to"
    )
    
    loan_type = models.CharField(
        max_length=15,
        choices=LOAN_TYPE,
        help_text="PAYABLE=we owe, RECEIVABLE=they owe us"
    )
    
    principal_amount = models.DecimalField(
        max_digits=20,
        decimal_places=5,
        help_text="Original loan amount"
    )
    
    amount_paid = models.DecimalField(
        max_digits=20,
        decimal_places=5,
        default=0,
        help_text="Amount paid back so far"
    )
    
    amount_remaining = models.DecimalField(
        max_digits=20,
        decimal_places=5,
        help_text="Outstanding balance"
    )
    
    interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Annual interest rate (%)"
    )
    
    loan_date = models.CharField(max_length=10, default=current_shamsi_date)
    due_date = models.CharField(max_length=10, blank=True, null=True)
    
    status = models.CharField(
        max_length=15,
        choices=LOAN_STATUS,
        default='ACTIVE'
    )
    
    notes = models.TextField(blank=True)
    currency = models.CharField(max_length=7, default="afg")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-loan_date']
    
    def __str__(self):
        return f"{self.loan_type}: {self.organization} - {self.counterparty} ({self.amount_remaining})"
    
    def save(self, *args, **kwargs):
        self.amount_remaining = self.principal_amount - self.amount_paid
        
        # Update status based on payment
        if self.amount_remaining <= 0:
            self.status = 'PAID'
        elif self.amount_paid > 0:
            self.status = 'PARTIAL'
        else:
            self.status = 'ACTIVE'
        
        super().save(*args, **kwargs)


class ProfitLossStatement(models.Model):
    """
    Stores profit/loss statements per organization per period.
    Can be generated monthly, quarterly, or yearly.
    """
    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name="profit_loss_statements"
    )
    
    year = models.SmallIntegerField(default=get_year)
    period_start = models.CharField(max_length=10)
    period_end = models.CharField(max_length=10)
    
    # Revenue
    revenue_from_sales = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    other_revenue = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    total_revenue = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    
    # Cost of Goods Sold
    beginning_inventory = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    purchases = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    ending_inventory = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    cogs = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    
    # Gross Profit
    gross_profit = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    
    # Operating Expenses
    operating_expenses = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    
    # Other Losses
    loss_from_damage = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    
    # Net Profit
    net_profit = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    
    currency = models.CharField(max_length=7, default="afg")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ("organization", "year", "period_start", "period_end")
        ordering = ['-year', '-period_end']
    
    def __str__(self):
        return f"P&L: {self.organization} ({self.period_start} to {self.period_end})"
    
    def calculate(self):
        """Calculate all profit/loss values"""
        self.total_revenue = self.revenue_from_sales + self.other_revenue
        self.cogs = self.beginning_inventory + self.purchases - self.ending_inventory
        self.gross_profit = self.total_revenue - self.cogs
        self.net_profit = self.gross_profit - self.operating_expenses - self.loss_from_damage
    
    def save(self, *args, **kwargs):
        self.calculate()
        super().save(*args, **kwargs)

