Groups And Permissions Documentation

Purpose

This document explains the use of Django groups and permissions in the project. It fills an important documentation gap because the system provides group-management functionality through dedicated views, but this area was not previously documented as a thesis appendix topic.

Implementation Scope

Group management is implemented in user/views_groups.py. The module uses Django's built-in Group and Permission models rather than a custom replacement. This is a pragmatic design choice because it preserves compatibility with Django's authorization framework while still allowing a custom user interface.

Access Control

The groups_management, group_form, create_update_group, delete_group, and get_group_details functions all restrict access to superusers. This means group creation and permission assignment remain centrally controlled. Ordinary users cannot modify system-wide authorization groups.

Functional Behavior

The groups management page lists groups with their permission counts and user counts. The form view loads all permissions organized by content type so that an administrator can create or edit groups in a structured way. The create and update endpoint validates that group names are present and unique. Permission sets are then applied to the group. The delete function blocks deletion when users are still assigned to the group, which protects the system from accidental removal of an active authorization structure.

Technical Significance

This module is important because it complements the OrganizationUser role system. OrganizationUser handles business roles inside organizations, while Django groups and permissions support framework-level authorization and reusable permission bundles. Together, these two mechanisms create a layered security design.

Main Routes

The main routes in shop/urls.py are:
- /user/groups/ for the main group list
- /user/groups/form/ for creation
- /user/groups/form/<group_id>/ for editing
- /user/groups/create-update/ for create and update submission
- /user/groups/delete/<group_id>/ for deletion
- /user/groups/details/ for detailed group inspection

Thesis Value

This document is useful in a thesis because it shows how a Django application can combine built-in permission infrastructure with a customized administrative interface. It also provides a concrete example of layered access control in which framework permissions and business roles coexist.
