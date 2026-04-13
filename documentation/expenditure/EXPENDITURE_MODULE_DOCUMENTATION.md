Expenditure Module Documentation

1. Module Scope

The expenditure module handles expense bill creation and classification within the supermarket electronic management system. It focuses on expense capture, expense type categorization, and integration with the broader billing and financial reporting system.

This module is important for thesis work because it links operational expense entry to profit/loss reporting and cash flow management, demonstrating how expenditure records are treated as first-class financial events.

Primary files:
- expenditure/models.py
- expenditure/views.py
- bill/models.py
- bill/views_bill.py

2. Core Data Model

Expense
- One-to-one relationship with Bill via bill field.
- expense_type stores an expense category such as KERAYA, FOOD, BARQ, or HOME_EXPENSE.
- Expense bills are implemented as Bill objects with bill_type='EXPENSE'.

3. Expense Entry Flow

expense_form(request, id=None)
- Renders the expense bill form.
- Determines user organization and available organization options.
- Generates a bill number via getBillNo.
- Loads branch options for the selected organization.
- Pre-fills the current date in Jalali format.

expense_insert(request)
- Accepts POST or PUT data from the expense form.
- Reads bill_no, date, organization, bill_type, expense_type, total, and total_payment.
- Creates or updates a Bill record with bill_type='EXPENSE'.
- Prevents duplicate expense bills by checking existing bill_no/year/organization/bill_type combinations.
- Creates or updates the linked Expense record.
- Returns JSON response with success state and bill data.

4. Operational Rules

- Expense bills are treated as standard bills in the billing system, which allows them to participate in cash flow and profit-loss reporting.
- The Expense model is a lightweight extension that adds category metadata without duplicating the core billing fields.
- The form logic supports both superuser and organization-specific access patterns.
- Bill duplication guard ensures unique yearly expense numbers per organization.

5. Thesis Discussion Points

- Expense accounting: the module shows how business expenses are recorded and later reported in financial statements.
- Expense categorization: categorizing expenses supports analytical reporting by type.
- Integration with billing and financial modules: expense records are not isolated; they flow into the same bill-based financial pipeline used by sales, purchases, payments, and receivements.
- User access and branch awareness: the form logic demonstrates how expense entry adapts to organization and branch selection.
- Real-world validation: duplicate bill prevention and structured response handling are examples of operational safeguards in financial systems.
