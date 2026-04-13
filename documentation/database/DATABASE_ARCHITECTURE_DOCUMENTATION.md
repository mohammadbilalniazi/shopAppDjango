Database Architecture Documentation

1. Scope

This document explains the relational persistence layer used by the supermarket electronic management system. It is written for thesis use and covers schema design, data integrity, summary table denormalization, import utilities, and database-level implementation patterns.

2. Core Persistence Patterns

The system uses Django ORM models as the primary representation of tables. Key database patterns include:
- `get_or_create()` and `update_or_create()` for idempotent insert/update behavior
- `transaction.atomic()` to ensure multi-step operations either fully commit or roll back
- `select_related()` and `prefetch_related()` for reducing query counts on foreign-key traversals
- `aggregate()` and `annotate()` for database-level summary computations
- management commands for direct database import and schema maintenance

3. Main Tables and Domain Models

Product and Inventory
- `Product`: master catalog of items
- `Product_Detail`: organization- and branch-aware attributes for each product
- `Stock`: inventory quantity and valuations per organization and branch
- `Category`: product category taxonomy

Billing and Payments
- `Bill`: transactional documents representing PURCHASE, SELLING, PAYMENT, RECEIVEMENT, EXPENSE, and LOSSDEGRADE
- `Bill_Receiver2`: inter-organization receiver metadata and approval state
- `StripePayment` and `TransactionLog`: external payment records and audit events

Financial Summaries
- `AssetBillSummary`: year-level summaries by organization, receiver, bill type, and branch
- `AssetWholeBillSummary`: cross-year aggregates by organization and bill type
- `OrganizationAsset`: computed balance sheet and P&L snapshot for an organization
- `ProfitLossStatement`: persisted profit and loss statement values

Loan and Expenditure
- `Loan`: separate tracking of payable and receivable loans
- `Expense`: expense category metadata linked to an expense bill

4. Denormalization and Summary Tables

The database is intentionally denormalized for reporting performance. Examples:
- `AssetBillSummary` caches bill totals and payments by type, so ledger and dashboard pages can aggregate quickly.
- `AssetWholeBillSummary` stores cross-year totals for fast financial dashboard queries.
- `OrganizationAsset` caches computed assets, liabilities, equity, and profit values to avoid repeated recalculation from raw bills.

These summary tables are maintained by application logic and signals rather than being derived entirely on each request.

5. Data Integrity and Constraints

The schema enforces several important database-level constraints:
- `unique_together` on `Product(item_name, model)` prevents duplicate catalog entries
- `unique_together` on `AssetBillSummary(year, organization, bill_rcvr_org, bill_type, branch)` preserves unique summary rows
- `unique_together` on `AssetWholeBillSummary(organization, bill_type)` ensures one aggregate row per bill type
- Foreign keys link organizational data across branches, products, bills, and financial summaries
- model `clean()` methods validate branch belongs to organization for `Product_Detail` and `Stock`

6. Database Import and Maintenance

A dedicated database import command has been added for thesis-friendly data onboarding:
- `python manage.py import_products path/to/products.csv --organization-id <org_id>`

It supports:
- import of product catalog and category data
- organization/branch assignment per row
- `Product_Detail` and `Stock` population
- transactional dry-run validation

A separate maintenance command exists for direct schema fixes:
- `python manage.py fix_product_table`

This command can add missing columns such as `serial_no`, `barcode`, and `is_service` directly via SQL, demonstrating a pragmatic database maintenance strategy.

7. Performance and Query Strategy

Query performance is improved by:
- using database aggregation for totals instead of Python loops
- relying on cached summary rows for repetitive dashboard metrics
- applying index-friendly filters on foreign keys and bill types
- marking expensive operations behind admin or API endpoints that can be run asynchronously

8. Thesis Relevance

This database documentation is useful for thesis sections that discuss:
- relational schema design for multi-organization retail systems
- the tradeoff between normalization and reporting performance
- data quality enforcement with constraints and validation logic
- operational import workflows for master data
- how Django ORM and raw SQL can coexist in a production system
