# Niazi Shop - Practical Setup Steps

Niazi Shop has already been running for 5 years. He should not enter all old bills one by one. He should start the application from his current real business position.

## Starting Position

| Item | Amount |
| --- | ---: |
| Cash / wallet money | 100,000 |
| Money other shops should pay to Niazi Shop | 200,000 |
| Money Niazi Shop should pay to suppliers / people | 400,000 |
| Goods currently available in store | 1,200,000 |

Opening net position:

`100,000 + 200,000 + 1,200,000 - 400,000 = 1,100,000`

So Niazi Shop starts with an estimated net position of:

`1,100,000`

## Step 1: Create Organization

1. Log in as admin.
2. Open Organization Management.
3. Click Add Organization.
4. Enter:

| Field | Value |
| --- | --- |
| Organization Name | Niazi Shop |
| Owner | Niazi Shop owner user |
| Status | Active |

5. Save the organization.

## Step 2: Create Branch

1. Open Branch Management.
2. Click Add Branch.
3. Enter:

| Field | Value |
| --- | --- |
| Organization | Niazi Shop |
| Branch Name | Main Branch |
| Status | Active |

4. Save the branch.

If Niazi Shop has more than one shop/store, add each shop as a separate branch.

## Step 3: Create Or Assign User

1. Open User Management.
2. Create a user for Niazi Shop, or select an existing user.
3. Assign the user to:

| Field | Value |
| --- | --- |
| Organization | Niazi Shop |
| Branch | Main Branch |
| Role | Owner or Admin |
| Active | Yes |

4. Save.

When this user logs in, he should only work under Niazi Shop.

## Step 4: Add Products

1. Open Product Management.
2. Click Add Product.
3. For each product currently available in the store, enter:

| Field | Example |
| --- | --- |
| Product Name | Mobile Charger |
| Category | Mobile Accessories |
| Model | Optional |
| Organization | Niazi Shop |
| Branch | Main Branch |
| Unit | Piece |
| Purchase Price | Cost price |
| Selling Price | Sale price |
| Minimum Requirement | Low stock alert quantity |

4. Save the product.

Repeat this for all important products in the store.

## Step 5: Enter Current Stock

For each product, enter the quantity currently available in the shop.

Example:

| Product | Current Quantity | Purchase Price | Total Stock Value |
| --- | ---: | ---: | ---: |
| Charger | 100 | 300 | 30,000 |
| Cable | 200 | 100 | 20,000 |
| Speaker | 50 | 1,000 | 50,000 |

The total value of all product stock should approximately become:

`1,200,000`

This amount is the current goods value in the shop.

## Step 6: Enter Opening Summary

1. Open Financial Reports.
2. Open Opening Summary.
3. Select `Niazi Shop`.
4. Enter:

| Opening Summary Field | Amount |
| --- | ---: |
| Cash on hand | 100,000 |
| Inventory value | 1,200,000 |
| Accounts receivable | 200,000 |
| Accounts payable | 400,000 |
| Loans receivable | 0 |
| Loans payable | 0 |
| Total revenue | 0 |
| Total cost of goods sold | 0 |
| Total expenses | 0 |
| Total losses | 0 |

5. In note, write:

`Opening balance for Niazi Shop after 5 years of business. Started using system from this date.`

6. Save Opening Summary.

## Step 7: Add Counterpart Organizations

If Niazi Shop knows who owes him money, and who he owes money to, add each person/shop/supplier as an organization.

Example receivable shops:

| Organization Name | Meaning |
| --- | --- |
| Ahmad Market | Ahmad Market owes Niazi Shop |
| Saleem Shop | Saleem Shop owes Niazi Shop |

Example payable suppliers:

| Organization Name | Meaning |
| --- | --- |
| Kabul Supplier | Niazi Shop owes Kabul Supplier |
| Herat Wholesale | Niazi Shop owes Herat Wholesale |

## Step 8: Split Receivable Balance By Counterpart

Total receivable is:

`200,000`

Example split:

| Counterpart | They Owe Niazi Shop |
| --- | ---: |
| Ahmad Market | 80,000 |
| Saleem Shop | 70,000 |
| Nasir Store | 50,000 |
| Total | 200,000 |

In Organization Ledger, add these as manual ledger adjustments.

For each receivable counterpart:

1. Open Organization Ledger.
2. Select Organization: `Niazi Shop`.
3. Select Opposite Organization: for example `Ahmad Market`.
4. Add Manual Adjustment.
5. Enter positive amount:

`80000`

6. Note:

`Opening receivable: Ahmad Market owed Niazi Shop before system start.`

Positive amount means the opposite organization owes Niazi Shop.

## Step 9: Split Payable Balance By Counterpart

Total payable is:

`400,000`

Example split:

| Counterpart | Niazi Shop Owes Them |
| --- | ---: |
| Kabul Supplier | 150,000 |
| Herat Wholesale | 100,000 |
| Jalalabad Supplier | 150,000 |
| Total | 400,000 |

For each payable counterpart:

1. Open Organization Ledger.
2. Select Organization: `Niazi Shop`.
3. Select Opposite Organization: for example `Kabul Supplier`.
4. Add Manual Adjustment.
5. Enter negative amount:

`-150000`

6. Note:

`Opening payable: Niazi Shop owed Kabul Supplier before system start.`

Negative amount means Niazi Shop owes the opposite organization.

## Step 10: Start Daily Work From Today

After setup, use the system only for new daily work:

| Work | Use This |
| --- | --- |
| Buying goods from supplier | Purchase Bill |
| Selling goods to customer/shop | Sell Bill |
| Paying supplier old/new balance | Payment Bill |
| Receiving money from customer/shop | Receivement Bill |
| Shop expense | Expense Bill |
| Damaged/lost stock | Loss/Degrade Bill |

Do not enter old 5-year bills one by one unless Niazi Shop needs exact historical bill details.

## Simple Rule

Old business history should be entered as opening balances.

New business activity should be entered as normal bills from the start date.
