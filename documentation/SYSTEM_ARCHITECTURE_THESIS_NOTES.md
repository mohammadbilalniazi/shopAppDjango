System Architecture Thesis Notes

1. Architectural Style

The project follows a modular Django monolith architecture with domain-focused apps:
- configuration: tenant and setup data
- user: identity and membership management
- product: product catalog and product details
- inventory behavior implemented through Stock in product app
- bill: transactional accounting and payment operations
- asset and expenditure: financial summaries and expense-specific workflows

2. Request Routing Layer

Main route aggregator is shop/urls.py, where views from all major apps are mounted directly.

This gives a centralized map of business capabilities:
- configuration and branch APIs
- billing and Stripe endpoints
- stock and product endpoints
- user management and session endpoints
- asset financial dashboards

3. Multi-Tenant Access Pattern

Core helper in common/organization.py:

```python
def find_userorganization(request, organization_id=None):
    if organization_id is not None and organization_id != '' and organization_id != 'all':
        user_orgs = OrganizationUser.objects.filter(organization_id=organization_id)
    elif request.user.is_superuser:
        user_orgs = OrganizationUser.objects.all()
    else:
        user_orgs = OrganizationUser.objects.filter(user=request.user)

    orgs = Organization.objects.filter(id__in=user_orgs.values_list("organization_id", flat=True))
    if orgs.count() == 1:
        organization = orgs.first()
    else:
        organization = None
    return organization, orgs
```

Thesis note: this helper is a central policy utility used by multiple modules.

4. Domain Relationship Summary

Main conceptual relationships:
- Organization has many Branch
- User belongs to organization via OrganizationUser
- Product has Product_Detail (organization/branch context)
- Stock tracks quantity per organization + branch + product
- Bill represents financial documents per organization and branch
- StripePayment links online payment events to Bill
- Asset summary tables aggregate bill-level financial totals

5. Event-Driven Consistency

Django signals in bill/models.py update summary tables for financial consistency:
- on Bill save/delete
- on Bill_Receiver save/delete

This reduces manual reconciliation requirements and keeps dashboards aligned.

6. Payment Subsystem Design

Two payment mechanisms coexist:
- Manual payment and receivement via bill/views_bill_receive_payment.py
- Stripe payment intent and webhook processing via bill/views_stripe.py

Both write to TransactionLog, giving a unified audit stream.

7. Important Engineering Practices In This Project

1. Atomic DB transactions for critical create/update endpoints.
2. Role-based and organization-based permission checks.
3. Safe get_or_create patterns for stock and summary consistency.
4. Explicit webhook event logging for external integration traceability.
5. Partial and full refund handling with idempotent local update logic.

8. Suggested Thesis Chapter Mapping

- Chapter 1: Problem and domain context (supermarket digital management)
- Chapter 2: Architecture and data model design
- Chapter 3: Access control and multi-organization tenancy
- Chapter 4: Billing and Stripe integration implementation
- Chapter 5: Inventory and product lifecycle design
- Chapter 6: Financial summaries and dashboard computations
- Chapter 7: Testing, limitations, and future improvements

9. Future Improvement Ideas For Thesis Conclusion

1. Move from function-based views to class-based API views for consistency.
2. Introduce service layer for payment and accounting domain logic.
3. Add schema-level API docs using OpenAPI/Swagger.
4. Add comprehensive automated test coverage for refund and stock edge cases.
5. Add asynchronous task queue for heavy summary recomputation.
