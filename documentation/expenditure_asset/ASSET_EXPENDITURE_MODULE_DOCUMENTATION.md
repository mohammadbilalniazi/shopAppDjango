Asset And Expenditure Module Documentation

1. Module Scope

This module group provides:
- Financial summary aggregation
- Asset position tracking (inventory, cash, receivables, liabilities)
- Loan and profit/loss structures
- Expense bill form and insertion flow

Primary files:
- asset/models.py
- asset/views.py
- asset/views_financial.py
- expenditure/views.py
- shop/urls.py

2. Asset Summary Models

AssetBillSummary
Yearly summary by organization, receiver organization, bill type, and branch.

```python
class AssetBillSummary(models.Model):
    bill_type=models.CharField(max_length=11,default="PURCHASE",choices=bill_types)
    organization = models.ForeignKey(Organization, on_delete=models.PROTECT,null=True, related_name="assetbillorganization")
    bill_rcvr_org = models.ForeignKey(Organization, on_delete=models.PROTECT,null=True, related_name="assetbillrcvrorg")
    branch = models.ForeignKey('configuration.Branch', on_delete=models.SET_NULL, null=True, blank=True)
    total=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    payment=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    year=models.SmallIntegerField(default=get_year)
```

AssetWholeBillSummary
Cross-year aggregate by organization and bill type.

```python
class AssetWholeBillSummary(models.Model):
    bill_type=models.CharField(max_length=25,default="PURCHASE",choices=bill_types_whole)
    organization = models.ForeignKey(Organization, on_delete=models.PROTECT,null=True)
    total=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    payment=models.DecimalField(default=0.0,max_digits=20,decimal_places=5)
    profit=models.IntegerField(default=0)
```

OrganizationAsset
High-level accounting state object.

```python
class OrganizationAsset(models.Model):
    organization = models.OneToOneField(Organization, on_delete=models.PROTECT, related_name="asset_summary")
    # Solid assets
    inventory_value = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    # Liquid assets
    cash_on_hand = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    # Receivables
    accounts_receivable = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    # Payables
    accounts_payable = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    # Loans
    loans_receivable = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    loans_payable = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    # Aggregates
    total_assets = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    total_liabilities = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    equity = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    # Profit and loss
    total_revenue = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    total_cost_of_goods_sold = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    total_expenses = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    total_losses = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    net_profit = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    currency = models.CharField(max_length=7, default="afg")
    last_updated = models.DateTimeField(auto_now=True)
```

Auto-calculation:

```python
def calculate_totals(self):
    self.total_assets = (
        self.inventory_value + self.cash_on_hand +
        self.accounts_receivable + self.loans_receivable
    )
    self.total_liabilities = (self.accounts_payable + self.loans_payable)
    self.equity = self.total_assets - self.total_liabilities
    self.net_profit = (
        self.total_revenue - self.total_cost_of_goods_sold -
        self.total_expenses - self.total_losses
    )

def save(self, *args, **kwargs):
    self.calculate_totals()
    super().save(*args, **kwargs)
```

3. Loan Tracking

Loan table supports payable and receivable categories:

```python
LOAN_TYPE = (
    ('PAYABLE', 'Loan Payable'),    # money we borrowed
    ('RECEIVABLE', 'Loan Receivable'),  # money we lent
)

LOAN_STATUS = (
    ('ACTIVE', 'Active'),
    ('PAID', 'Fully Paid'),
    ('PARTIAL', 'Partially Paid'),
    ('DEFAULTED', 'Defaulted'),
)

class Loan(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.PROTECT, related_name="loans")
    counterparty = models.ForeignKey(Organization, on_delete=models.PROTECT, related_name="loan_counterparties")
    loan_type = models.CharField(max_length=15, choices=LOAN_TYPE)
    principal_amount = models.DecimalField(max_digits=20, decimal_places=5)
    amount_paid = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    amount_remaining = models.DecimalField(max_digits=20, decimal_places=5)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    loan_date = models.CharField(max_length=10, default=current_shamsi_date)
    due_date = models.CharField(max_length=10, blank=True, null=True)
    status = models.CharField(max_length=15, choices=LOAN_STATUS, default='ACTIVE')
```

4. Expenditure Integration

Expense operations in expenditure/views.py create or update Bill plus Expense type metadata.

```python
@login_required(login_url='/admin')
@api_view(['POST', 'PUT'])
def expense_insert(request):
    bill_no = int(request.data.get("bill_no", None))
    id = request.data.get("id")
    date = request.data.get("date")
    year = date.split("-")[0]
    organization_id = request.data.get("organization")
    organization = Organization.objects.get(id=int(organization_id))
    bill_type = request.data.get("bill_type", None)
    expense_type = request.data.get("expense_type")
    creator = request.user
    total = request.data.get("total", 0) or 0
    payment = request.data.get("total_payment", 0)

    if id not in ("", None):
        # Update existing bill
        bill_obj = Bill.objects.get(id=int(id))
        bill_obj.total = total
        bill_obj.payment = payment
        bill_obj.bill_type = bill_type
    else:
        # Prevent duplicate bill entry
        bill_query = Bill.objects.filter(
            bill_no=int(bill_no), year=int(year),
            bill_type=bill_type, organization=organization
        )
        if bill_query.count() > 0:
            return Response({"message": "Bill already exists", "ok": False})
        bill_obj = Bill(
            bill_type=bill_type, date=date, year=year,
            bill_no=bill_no, organization=organization,
            creator=creator, total=total, payment=payment
        )

    bill_obj.save()

    expense_query = Expense.objects.filter(bill=bill_obj)
    if expense_query.count() > 0:
        expense_query.update(bill=bill_obj, expense_type=int(expense_type))
    else:
        expense = Expense(bill=bill_obj, expense_type=int(expense_type))
        expense.save()

    return Response({"message": "Success", "ok": True, "bill_id": bill_obj.id})
```

5. Financial Dashboard Routes

Registered in asset/urls.py:

```python
path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard')
path('dashboard/', views.asset_dashboard, name='asset_dashboard')
path('balance-sheet/', views.balance_sheet_view, name='balance_sheet')
path('profit-loss/', views.profit_loss_view, name='profit_loss')
path('cash-flow/', views.cash_flow_view, name='cash_flow')
path('loans/', views.loans_view, name='loans')
path('ledger/', views_financial.organization_ledger_summary, name='organization_ledger')
path('financial/', views_financial.financial_summary_dashboard, name='financial_dashboard')
```

6. Thesis Discussion Points

1. Explain why summary tables are denormalized for dashboard speed.
2. Show how bill events feed asset summary and expenditure accounting.
3. Discuss financial statement dimensions: balance sheet, cash flow, profit-loss.
4. Explain how branch field adds operational granularity to accounting data.
