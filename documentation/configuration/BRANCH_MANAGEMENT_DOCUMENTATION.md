Branch Management Documentation

Purpose

This document explains the branch management design used in the system. It is written for thesis use and focuses on data structure, authorization logic, CRUD behavior, and operational value.

Functional Role

Branch management allows an organization to divide its activities into operational units. A branch can represent a store, warehouse, service point, or other physical or administrative location. The branch model is therefore important for both organizational control and branch-specific reporting.

Data Model

The branch entity is implemented in configuration/models.py. It stores the branch name, code, type, organization reference, optional location, address, phone, email, optional manager, creator, timestamps, activation status, and description. The model uses uniqueness constraints on name plus organization and code plus organization. This means one organization cannot create duplicate branch names or duplicate branch codes.

Access Control

Branch administration is protected by the check_admin_permission function in configuration/views_branch.py. A user may manage branches when one of the following conditions is true:
- the user is the owner of the organization
- the user is a Django superuser
- the user has an OrganizationUser role of admin, superuser, or owner inside that organization

This design is important because it combines Django-level privileged access with organization-specific administrative roles. It is therefore suitable for multi-tenant business systems in which local administrators must manage their own branch structure without receiving unrestricted access to the entire platform.

Main Workflows

The branch workflow starts with organization selection. A user first opens the branch selection page and sees only the organizations for which they have branch-management authority. After selecting an organization, the system loads the branch management page, where the user can create, view, update, delete, and activate or deactivate branches.

The create operation accepts branch details through an AJAX request and automatically binds the branch to the selected organization and the current user as created_by. The update operation modifies editable fields such as name, code, address, phone, email, description, location, and manager. The delete operation removes the branch after a permission check. The toggle-status operation switches a branch between active and inactive states without removing the underlying record.

Interface Behavior

The branch management views were designed to support operational use rather than only administrative maintenance. The list view includes search, pagination, and detail retrieval. The supporting API endpoints provide manager candidates for a selected organization and provide detailed branch information for editing dialogs.

Main Routes

The main routes are defined in shop/urls.py:
- /configuration/branch/ for organization selection
- /configuration/branch/organization/<org_id>/ for branch management
- /configuration/branch/create/ for creation
- /configuration/branch/<branch_id>/update/ for updates
- /configuration/branch/<branch_id>/delete/ for deletion
- /configuration/branch/<branch_id>/detail/ for branch details
- /configuration/branch/<branch_id>/toggle-status/ for status changes
- /configuration/organization/<org_id>/users/ for manager lookup

Technical Importance

Branch management is not only an administrative feature. It supports product, stock, user assignment, and accounting workflows elsewhere in the system. Because stock, bills, and product details can reference branches, the branch model acts as an operational segmentation layer that improves traceability and internal control.

Thesis Value

This document is useful in a thesis because it demonstrates how a business application can implement delegated administration inside a multi-organization system. It also shows how a relatively simple data model can become a central coordination point for inventory, billing, and access control.
