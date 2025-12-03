# Branch Management System Documentation

## Overview

The Branch Management System allows organization administrators to create, update, view, and manage branches for their organizations. Each organization can have multiple branches, and only users with admin, superuser, or owner roles can manage branches.

## Features Implemented

### 1. **Branch Model**
- **Fields**:
  - `name`: Branch name (required)
  - `code`: Unique branch code per organization (required)
  - `organization`: Foreign key to Organization (required)
  - `location`: Foreign key to Location (optional)
  - `address`: Text field for address (optional)
  - `phone`: Phone number (optional)
  - `email`: Email address (optional)
  - `manager`: Foreign key to User (optional)
  - `created_by`: User who created the branch (auto-set)
  - `created_date`: Auto timestamp
  - `updated_date`: Auto timestamp
  - `is_active`: Boolean status
  - `description`: Text description (optional)

### 2. **Permissions System**
- Only users with roles `admin`, `superuser`, or `owner` can manage branches
- Permission checking implemented in all views
- Automatic filtering of managers to organization users with appropriate roles

### 3. **Complete CRUD Operations**

#### **Create Branch**
- **URL**: `/configuration/branch/create/`
- **Method**: POST (AJAX)
- **Access**: Admin users only
- **Features**:
  - Real-time form validation
  - Automatic organization assignment
  - Created by user tracking
  - Unique code validation per organization

#### **Read/View Branches**
- **URL**: `/configuration/branch/organization/<org_id>/`
- **Method**: GET
- **Features**:
  - Paginated list view (10 per page)
  - Search functionality (name, code, address)
  - Sortable columns
  - Detailed view modal
  - Status badges (Active/Inactive)

#### **Update Branch**
- **URL**: `/configuration/branch/<branch_id>/update/`
- **Method**: POST (AJAX)
- **Features**:
  - In-line editing
  - Form pre-population
  - Validation with error handling

#### **Delete Branch**
- **URL**: `/configuration/branch/<branch_id>/delete/`
- **Method**: DELETE (AJAX)
- **Features**:
  - Confirmation dialog
  - Soft delete (can be modified to hard delete)
  - Admin permission verification

#### **Toggle Status**
- **URL**: `/configuration/branch/<branch_id>/toggle-status/`
- **Method**: POST (AJAX)
- **Features**:
  - Quick status toggle (Active/Inactive)
  - Real-time UI updates

### 4. **User Interface**

#### **Organization Selection Page**
- **URL**: `/configuration/branch/`
- Lists all organizations user has access to
- Shows user role and branch count
- Cards-based responsive design
- Access control buttons

#### **Branch Management Page**
- **URL**: `/configuration/branch/organization/<org_id>/`
- Modern, responsive table design
- Bootstrap 5 styling
- Real-time search
- Pagination controls
- Action buttons for all CRUD operations
- Modal dialogs for forms
- Loading states and error handling

### 5. **API Endpoints**

#### **Organization Users API**
- **URL**: `/configuration/organization/<org_id>/users/`
- Returns users available as branch managers
- Used for populating manager dropdown

#### **Branch Detail API**
- **URL**: `/configuration/branch/<branch_id>/detail/`
- Returns detailed branch information
- Used for view and edit modals

### 6. **Database Features**

#### **Constraints**
- `unique_together = ("name", "organization")` - No duplicate branch names per organization
- `unique_together = ("code", "organization")` - No duplicate codes per organization

#### **Indexes**
- Automatic indexing on foreign keys
- Ordering by organization, then name

#### **Relationships**
- `Organization.branches` - Reverse relationship to branches
- `User.managed_branches` - Branches managed by user
- `User.created_branches` - Branches created by user

## Usage Instructions

### 1. **Access Branch Management**
1. Login to the system
2. Navigate to "Branches" in the sidebar menu
3. Select an organization (only shows organizations you have admin access to)
4. You'll see the branch management interface

### 2. **Create a New Branch**
1. Click "Add New Branch" button
2. Fill in the required fields (Name, Code)
3. Optionally select Location, Manager, and fill other details
4. Click "Save Branch"
5. The branch will be created and appear in the list

### 3. **View Branch Details**
1. Click the "View" (eye) icon in the Actions column
2. A modal will show all branch details
3. Click "Close" to return to list

### 4. **Edit a Branch**
1. Click the "Edit" (pencil) icon in the Actions column
2. The form will pre-populate with current values
3. Make your changes
4. Click "Update Branch"

### 5. **Toggle Branch Status**
1. Click the "Toggle Status" (toggle) icon
2. Confirm the action
3. Branch status will switch between Active/Inactive

### 6. **Delete a Branch**
1. Click the "Delete" (trash) icon
2. Confirm the deletion in the dialog
3. Branch will be permanently removed

### 7. **Search Branches**
1. Use the search box at the top
2. Search by name, code, or address
3. Results update automatically
4. Click "Clear" to reset search

## Technical Implementation

### **Backend (Django)**
- **Models**: `Branch` model in `configuration.models`
- **Forms**: `BranchForm` in `configuration.forms`
- **Views**: All views in `configuration.views_branch`
- **URLs**: Mapped in `shop.urls`
- **Admin**: Admin interface in `configuration.admin`

### **Frontend (HTML/CSS/JavaScript)**
- **Templates**: 
  - `branch_select_organization.html` - Organization selection
  - `branch_management.html` - Main management interface
- **Styling**: Bootstrap 5 + custom CSS
- **JavaScript**: Vanilla JS with AJAX for dynamic operations
- **Icons**: Font Awesome icons

### **Security Features**
- CSRF protection on all forms
- User permission validation
- SQL injection prevention (Django ORM)
- XSS protection (template auto-escaping)

### **Performance Optimizations**
- Pagination for large datasets
- AJAX for seamless user experience
- Database query optimization with select_related
- Efficient permission checking

## Database Schema

```sql
CREATE TABLE configuration_branch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    organization_id BIGINT NOT NULL,
    location_id BIGINT NULL,
    address TEXT NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(254) NULL,
    manager_id INT NULL,
    created_by_id INT NOT NULL,
    created_date DATETIME(6) NOT NULL,
    updated_date DATETIME(6) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    description TEXT NULL,
    FOREIGN KEY (organization_id) REFERENCES configuration_organization(id),
    FOREIGN KEY (location_id) REFERENCES configuration_location(id),
    FOREIGN KEY (manager_id) REFERENCES auth_user(id),
    FOREIGN KEY (created_by_id) REFERENCES auth_user(id),
    UNIQUE KEY unique_name_org (name, organization_id),
    UNIQUE KEY unique_code_org (code, organization_id)
);
```

## File Structure

```
configuration/
├── models.py                     # Branch model definition
├── forms.py                      # BranchForm for validation
├── views_branch.py               # All branch-related views
├── admin.py                      # Admin interface
└── migrations/
    └── 0004_branch.py            # Database migration

templates/configurations/
├── branch_select_organization.html   # Organization selection page
└── branch_management.html            # Main branch management interface

urls.py                           # URL routing
```

## Testing Access

### **Test Data Available**:
- **Organizations**: "shinwari limited", "dimond shop"
- **Admin Users**: admin, bilal, JalalNiazi353
- **Test URLs**:
  - Branch Selection: `http://127.0.0.1:8000/configuration/branch/`
  - Direct Branch Management: `http://127.0.0.1:8000/configuration/branch/organization/1/`

### **Login as Admin**:
1. Go to `http://127.0.0.1:8000/admin/`
2. Login with admin credentials
3. Navigate to "Branches" in the sidebar
4. Test all CRUD operations

## Future Enhancements

1. **Branch Hierarchy**: Support for sub-branches
2. **Inventory Per Branch**: Link products to specific branches
3. **Branch Performance Reports**: Analytics per branch
4. **Branch-specific Users**: Assign users to specific branches
5. **Geolocation**: Map integration for branch locations
6. **Import/Export**: Bulk operations for branches
7. **Audit Trail**: Track all changes to branches
8. **Mobile App**: Mobile interface for branch management

## Error Handling

The system includes comprehensive error handling:
- Form validation errors
- Permission denied errors
- Database constraint violations
- AJAX request failures
- User-friendly error messages
- Automatic error recovery

This branch management system provides a complete solution for multi-branch organizations with proper security, user experience, and scalability considerations.