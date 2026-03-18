OrganizationUser And Branch Integration Documentation

Purpose

This document explains how the project links organization membership with branch-specific access. The integration is important because it allows the system to move beyond organization-level access and toward finer operational control.

Conceptual Design

The OrganizationUser model links a Django user to an organization and stores role information such as employee, admin, superuser, and owner. The model also contains an optional branch field. This means a user can be associated with an organization in general, or with a specific primary branch inside that organization.

The design supports three levels of interpretation:
- platform-wide privilege through Django superuser status
- organization-level privilege through OrganizationUser membership and role
- branch-level context through the optional branch field

Implementation Role

The helper functions in common/organization.py extend the base organization lookup logic by including branch information. The enhanced function find_user_organization_and_branch returns the selected organization, the organizations available to the user, the user's assigned branch in that organization, and the set of accessible branches. This makes branch-aware authorization easier to reuse across multiple views.

Branch Utility Layer

The project also introduces branch utility logic through common.branch_utils. That layer provides helper methods for getting user-accessible branches, checking whether a user can access a specific branch, identifying a default branch for the user, and assigning or removing branch access. This utility design is significant because it keeps branch access rules out of individual views and moves them into a reusable policy layer.

Administrative Value

Branch-aware membership improves operational control in several ways. First, it supports assigning a user to a particular branch rather than to the organization in an unrestricted manner. Second, it makes branch filtering possible in forms and dashboards. Third, it creates a foundation for future features such as branch-specific inventory, branch-level performance analysis, and branch-level user reports.

Signal And Command Support

The broader implementation also includes administrative support for branch assignments through signal enhancements and management commands. These features make it easier to assign users to branches, list accessible branches, produce organization branch summaries, and clean up invalid branch assignments. This is operationally useful because it reduces manual maintenance and makes branch access auditable.

Access Control Implications

From a security and governance perspective, OrganizationUser and branch integration improves least-privilege design. A user can be granted access only to the branch needed for their work rather than to the entire organization. Superusers still retain unrestricted access, but normal staff can be limited by both organization and branch boundaries.

Thesis Value

This integration is relevant in a thesis because it shows an evolution from simple role-based access control to context-aware access control. It also illustrates how enterprise-style branch segmentation can be incorporated into a Django system without replacing the core Django authentication model.
