# Asset Management System - Quick Start Guide

## 🚀 What Was Implemented

A comprehensive financial management system that **automatically tracks**:

- ✅ **Solid Assets** (Inventory/Products)
- ✅ **Liquid Assets** (Cash on Hand)
- ✅ **Loans** (Receivable & Payable)
- ✅ **Profit & Loss**
- ✅ **Expenses**
- ✅ **Assets & Liabilities**

All calculations are **100% automatic** based on your bill transactions!

---

## 📊 How Bills Affect Finances

| Bill Type | Cash Impact | Inventory Impact | What It Tracks |
|-----------|-------------|------------------|----------------|
| **PURCHASE** | ↓ Cash out | ↑ Inventory up | Buying products from suppliers |
| **SELLING** | ↑ Cash in | ↓ Inventory down | Selling products to customers |
| **PAYMENT** | ↓ Cash out | - | Paying others (loans given) |
| **RECEIVEMENT** | ↑ Cash in | - | Receiving money (loans received) |
| **EXPENSE** | ↓ Cash out | - | Operating costs (rent, utilities) |
| **LOSSDEGRADE** | ↓ Cash out | ↓ Inventory down | Product damage/spoilage |

---

## 🎯 Installation Steps

### Step 1: Apply Database Migrations
```bash
python manage.py migrate asset
```

### Step 2: Update Admin (Optional)
Register models in `asset/admin.py`:
```python
from django.contrib import admin
from asset.models import OrganizationAsset, Loan, ProfitLossStatement

@admin.register(OrganizationAsset)
class OrganizationAssetAdmin(admin.ModelAdmin):
    list_display = ['organization', 'total_assets', 'total_liabilities', 'equity', 'net_profit']
    readonly_fields = ['total_assets', 'total_liabilities', 'equity', 'net_profit']

@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ['organization', 'counterparty', 'loan_type', 'principal_amount', 'amount_remaining', 'status']

@admin.register(ProfitLossStatement)
class ProfitLossStatementAdmin(admin.ModelAdmin):
    list_display = ['organization', 'year', 'period_start', 'period_end', 'net_profit']
```

### Step 3: Access the Dashboard
1. Start server: `python manage.py runserver`
2. Navigate to: `http://localhost:8000/asset/dashboard/`
3. Select your organization
4. View your financial position!

---

## 🎨 Dashboard Features

### Main Dashboard (`/asset/dashboard/`)
**Shows at a glance**:
- 💰 Total Assets
- 📊 Total Liabilities
- 🏦 Owner's Equity
- 📈 Net Profit

**Plus detailed summaries of**:
- Balance Sheet
- Profit & Loss
- Cash Flow

### Quick Navigation
- `/asset/balance-sheet/` - Full balance sheet
- `/asset/profit-loss/` - Detailed P&L statement
- `/asset/cash-flow/` - Cash flow analysis
- `/asset/loans/` - Loan management

---

## 💡 How It Works

### Automatic Calculation Example

**Scenario**: You run a shop

1. **Buy Products** (PURCHASE bill):
   - Total: 100,000 AFG
   - Payment: 60,000 AFG
   - Result:
     - ✅ Inventory = +100,000 (solid asset)
     - ✅ Cash = -60,000 (liquid asset)
     - ✅ Accounts Payable = +40,000 (liability - you owe)

2. **Sell Products** (SELLING bill):
   - Total: 150,000 AFG
   - Payment: 120,000 AFG
   - Result:
     - ✅ Inventory = -80,000 (products sold)
     - ✅ Cash = +120,000 (liquid asset)
     - ✅ Accounts Receivable = +30,000 (asset - they owe you)
     - ✅ Revenue = +150,000
     - ✅ Profit = 150,000 - 80,000 = 70,000

3. **Pay Expenses** (EXPENSE bill):
   - Total: 20,000 AFG (rent + utilities)
   - Result:
     - ✅ Cash = -20,000
     - ✅ Expenses = +20,000
     - ✅ Net Profit = 70,000 - 20,000 = 50,000

**Your Dashboard Shows**:
- Total Assets: 20,000 (inventory) + 40,000 (cash) + 30,000 (receivable) = **90,000 AFG**
- Total Liabilities: **40,000 AFG** (payable)
- Equity: 90,000 - 40,000 = **50,000 AFG**
- Net Profit: **50,000 AFG**

---

## 🔄 Manual Refresh

If you want to recalculate everything manually:

### Option 1: Dashboard Button
Click "Refresh Data" button on the dashboard

### Option 2: Python Code
```python
from asset.utils import update_organization_assets
from configuration.models import Organization

org = Organization.objects.get(id=1)
asset_summary = update_organization_assets(org)
print(f"Total Assets: {asset_summary.total_assets}")
print(f"Net Profit: {asset_summary.net_profit}")
```

### Option 3: API Call
```bash
curl -X POST http://localhost:8000/asset/api/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"organization_id": 1}'
```

---

## 📱 API Endpoints

### Get Financial Summary (JSON)
```bash
GET /asset/api/summary/<org_id>/
```

**Response**:
```json
{
  "organization": "My Shop",
  "balance_sheet": {
    "total_assets": 90000.00,
    "total_liabilities": 40000.00,
    "total_equity": 50000.00,
    "cash": 40000.00,
    "inventory": 20000.00
  },
  "profit_loss": {
    "revenue": 150000.00,
    "cogs": 80000.00,
    "gross_profit": 70000.00,
    "expenses": 20000.00,
    "net_profit": 50000.00
  },
  "cash_flow": {
    "operating_cash": 40000.00,
    "financing_cash": 0.00,
    "net_cash_flow": 40000.00
  }
}
```

---

## 🎓 Understanding Financial Terms

### Assets
Things your organization **OWNS** or is **OWED**:
- **Inventory**: Products in stock
- **Cash**: Money in hand
- **Accounts Receivable**: Money customers owe you
- **Loans Receivable**: Money you lent to others

### Liabilities
Things your organization **OWES**:
- **Accounts Payable**: Money you owe suppliers
- **Loans Payable**: Money you borrowed from others

### Equity
What's LEFT after paying all debts:
- **Formula**: Assets - Liabilities = Equity
- This is the TRUE NET WORTH of your organization

### Profit & Loss
- **Revenue**: Money from sales
- **COGS**: Cost of products sold
- **Gross Profit**: Revenue - COGS
- **Net Profit**: Gross Profit - Expenses - Losses

---

## 🔍 Troubleshooting

### Q: Dashboard shows 0 for everything?
**A**: You haven't created any bills yet. Create PURCHASE, SELLING, or other bills first.

### Q: Numbers don't match expectations?
**A**: 
1. Click "Refresh Data" button
2. Check that bills have correct totals and payments
3. Verify organization is selected correctly

### Q: Negative cash?
**A**: This is normal! It means you've paid out more than you've received. Review your PURCHASE, PAYMENT, and EXPENSE bills.

### Q: Can't see the dashboard?
**A**:
1. Make sure you ran migrations: `python manage.py migrate asset`
2. Make sure you're logged in
3. Check URL: `/asset/dashboard/`

---

## 📈 Next Steps

### Recommended Actions:

1. **Test with Sample Data**:
   - Create a PURCHASE bill
   - Create a SELLING bill
   - View the dashboard to see changes

2. **Explore Reports**:
   - Check Balance Sheet
   - Review Profit & Loss
   - Analyze Cash Flow

3. **Track Loans** (if needed):
   - Go to `/asset/loans/`
   - Track money owed and owing

4. **Set Up Regular Reviews**:
   - Weekly: Check cash position
   - Monthly: Review P&L statement
   - Quarterly: Analyze trends

---

## 🎉 Key Benefits

✅ **Automatic**: No manual calculations needed
✅ **Real-time**: Always up-to-date with latest bills
✅ **Comprehensive**: Complete financial picture
✅ **User-friendly**: Beautiful, easy-to-understand dashboard
✅ **Accurate**: Based on actual transaction data
✅ **Multi-organization**: Support for multiple organizations

---

## 📚 Additional Resources

- **Full Documentation**: See `ASSET_MANAGEMENT_SYSTEM_DOCUMENTATION.md`
- **Code Location**: 
  - Models: `asset/models.py`
  - Utilities: `asset/utils.py`
  - Views: `asset/views.py`
  - Templates: `templates/asset/`

---

## 🆘 Need Help?

1. Read the full documentation
2. Check the code comments
3. Test with small amounts first
4. Verify your bills are correct

**Remember**: The system is only as accurate as the data you input through bills!

---

**System Version**: 1.0
**Created**: November 6, 2025
**Status**: ✅ Ready to Use
