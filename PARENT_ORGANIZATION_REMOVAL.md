# Parent Organization Removal - Fix Summary

## Issue
The `find_userorganization()` function was returning only 2 values `(self_organization, user_orgs)`, but many views were trying to unpack 3 values including `parent_organization`, causing the error:
```
ValueError: not enough values to unpack (expected 3, got 2)
```

## Solution
Removed all references to `parent_organization` from the unpacking of `find_userorganization()` results across the entire codebase and replaced them with `self_organization` or appropriate logic.

---

## Files Modified

### 1. **configuration/views_organization.py**
- **Line 159**: Removed `parent_organization` from unpacking
- **Change**: `self_organization, user_orgs = find_userorganization(request)`
- **Context update**: Set `parent_organization` to `None` (deprecated field)

### 2. **user/views_user.py**
- **Line 17**: Removed `parent_organization` from unpacking
- **Change**: `self_organization, user_orgs = find_userorganization(request)`
- **Logic update**: Used `self_organization` instead of `parent_organization` for filtering organizations

### 3. **product/views_product.py**
Multiple functions updated:
- **show_html()** (Line 17): Removed `parent_organization`, updated filtering logic
- **form()** (Line 36): Removed `parent_organization`, updated stock query logic
- **create()** (Line 88): Removed `parent_organization`, updated organization assignment
- **show()** (Line 157): Removed `parent_organization`, updated query filtering

### 4. **bill/views_bill_receive_payment.py**
- **Line 74**: Removed `parent_organization` from unpacking
- **Line 106**: Changed condition from `bill_rcvr_org==parent_organization` to `bill_rcvr_org==self_organization`

### 5. **expenditure/views.py**
- **Line 22**: Removed `parent_organization` from unpacking
- **Lines 44, 47, 54**: Replaced all `parent_organization` references with `self_organization`

### 6. **common/context_processors.py**
- **Line 19**: Removed `parent_organization` from unpacking
- **Line 28**: Changed `global_parent_organization` to use `self_organization` instead

### 7. **asset/views.py**
Updated 6 functions:
- **asset_dashboard()** (Line 26)
- **balance_sheet()** (Line 70)
- **profit_loss()** (Line 105)
- **cash_flow()** (Line 140)
- **loans()** (Line 175)
- **calculate_total_purchased_asset_from_products_using()** (Line 393)

All instances replaced `parent_organization` with `self_organization` in organization selection logic.

---

## Key Changes Summary

### Before:
```python
self_organization, parent_organization, user_orgs = find_userorganization(request)
```

### After:
```python
self_organization, user_orgs = find_userorganization(request)
```

### Logic Adjustments:
- Wherever `parent_organization` was used for filtering or context, it's now replaced with `self_organization`
- Added fallback logic for cases where `self_organization` is None (users with multiple orgs)
- Context variables like `parent_organization` are now set to `None` or removed

---

## Testing Checklist

✅ All views should now work without the unpacking error
✅ Organization filtering should work correctly for:
   - Regular users (see only their organization)
   - Superusers (see all organizations)
   - Users with multiple organizations (handled gracefully)

✅ Dropdown filtering logic remains intact:
   - `organization` dropdown: Shows accessible organizations
   - `bill_rcvr_org` dropdown: Shows all except self organization

---

## Notes

- The `parent_organization` concept has been deprecated
- The system now uses `self_organization` consistently throughout
- The `find_userorganization()` function signature remains: `(organization, user_orgs)`
- All organization-based filtering now uses `self_organization` or falls back to `user_orgs`

---

**Date**: November 9, 2025
**Status**: ✅ Complete
