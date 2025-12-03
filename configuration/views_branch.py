from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.db.models import Q
from django.contrib.auth.models import User

from .models import Branch, Organization
from .forms import BranchForm
from user.models import OrganizationUser
import json


def check_admin_permission(user, organization):
    """Check if user has admin permissions for the organization"""
    # Check if user is the organization owner (main owner)
    if organization.owner == user:
        return True
    
    # Check if user is a superuser (global admin)
    if user.is_superuser:
        return True
    
    # Check if user has admin/superuser/owner role in OrganizationUser
    try:
        org_user = OrganizationUser.objects.get(user=user, organization=organization)
        return org_user.role in ['admin', 'superuser', 'owner']
    except OrganizationUser.DoesNotExist:
        return False


@login_required
def branch_select_organization(request):
    """View to select organization for branch management"""
    # Get organizations through OrganizationUser (role-based membership)
    user_organizations = OrganizationUser.objects.filter(
        user=request.user,
        is_active=True
    ).select_related('organization').order_by('organization__name')
    
    # Also get organizations where user is the main owner
    owned_organizations = Organization.objects.filter(
        owner=request.user,
        is_active=True
    ).exclude(
        id__in=[ou.organization.id for ou in user_organizations]
    )
    
    # Create pseudo OrganizationUser objects for owned organizations
    owned_org_users = []
    for org in owned_organizations:
        # Create a temporary object to maintain template consistency
        class PseudoOrgUser:
            def __init__(self, org, user):
                self.organization = org
                self.user = user
                self.role = 'owner'
                self.is_active = True
            
            def get_role_display(self):
                return 'Organization Owner'
        
        owned_org_users.append(PseudoOrgUser(org, request.user))
    
    # Combine both lists
    all_organizations = list(user_organizations) + owned_org_users
    
    context = {
        'user_organizations': all_organizations,
    }
    
    return render(request, 'configurations/branch_select_organization.html', context)


@login_required
def branch_management(request, org_id):
    """Main branch management view with all CRUD operations"""
    organization = get_object_or_404(Organization, id=org_id, is_active=True)
    
    # Check permissions
    if not check_admin_permission(request.user, organization):
        if organization.owner == request.user:
            permission_type = "organization owner"
        else:
            permission_type = "admin privileges"
        
        messages.error(request, f"You don't have {permission_type} to manage branches for {organization.name}.")
        return redirect('branch_select_organization')
    
    # Determine user's access level for display
    user_access_level = "Unknown"
    if organization.owner == request.user:
        user_access_level = "Organization Owner"
    elif request.user.is_superuser:
        user_access_level = "System Superuser"
    else:
        try:
            org_user = OrganizationUser.objects.get(user=request.user, organization=organization)
            user_access_level = org_user.get_role_display()
        except OrganizationUser.DoesNotExist:
            user_access_level = "Unknown Access"
    
    # Handle search
    search_query = request.GET.get('search', '')
    branches = Branch.objects.filter(organization=organization)
    
    if search_query:
        branches = branches.filter(
            Q(name__icontains=search_query) |
            Q(code__icontains=search_query) |
            Q(address__icontains=search_query)
        )
    
    # Pagination
    paginator = Paginator(branches, 10)  # Show 10 branches per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    form = BranchForm(organization=organization)
    
    context = {
        'organization': organization,
        'branches': page_obj,
        'form': form,
        'search_query': search_query,
        'total_branches': branches.count(),
        'user_access_level': user_access_level,
    }
    
    return render(request, 'configurations/branch_management.html', context)


@login_required
@csrf_exempt
def branch_create(request):
    """Create a new branch via AJAX"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            org_id = data.get('organization_id')
            organization = get_object_or_404(Organization, id=org_id, is_active=True)
            
            # Check permissions
            if not check_admin_permission(request.user, organization):
                return JsonResponse({
                    'success': False, 
                    'error': 'Permission denied'
                }, status=403)
            
            # Create form with data
            form_data = {
                'name': data.get('name'),
                'code': data.get('code'),
                'location': data.get('location'),
                'address': data.get('address'),
                'phone': data.get('phone'),
                'email': data.get('email'),
                'manager': data.get('manager'),
                'description': data.get('description'),
            }
            
            form = BranchForm(form_data, organization=organization)
            
            if form.is_valid():
                branch = form.save(commit=False)
                branch.organization = organization
                branch.created_by = request.user
                branch.save()
                
                return JsonResponse({
                    'success': True,
                    'message': 'Branch created successfully',
                    'branch': {
                        'id': branch.id,
                        'name': branch.name,
                        'code': branch.code,
                        'location': str(branch.location) if branch.location else '',
                        'address': branch.address or '',
                        'phone': branch.phone or '',
                        'email': branch.email or '',
                        'manager': branch.manager.get_full_name() if branch.manager else '',
                        'is_active': branch.is_active,
                        'created_date': branch.created_date.strftime('%Y-%m-%d %H:%M'),
                    }
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Form validation failed',
                    'errors': form.errors
                }, status=400)
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)


@login_required
@csrf_exempt
def branch_update(request, branch_id):
    """Update branch via AJAX"""
    if request.method == 'POST':
        try:
            branch = get_object_or_404(Branch, id=branch_id)
            
            # Check permissions
            if not check_admin_permission(request.user, branch.organization):
                return JsonResponse({
                    'success': False, 
                    'error': 'Permission denied'
                }, status=403)
            
            data = json.loads(request.body)
            
            # Update branch fields
            branch.name = data.get('name', branch.name)
            branch.code = data.get('code', branch.code)
            branch.address = data.get('address', branch.address)
            branch.phone = data.get('phone', branch.phone)
            branch.email = data.get('email', branch.email)
            branch.description = data.get('description', branch.description)
            
            # Update location if provided
            if data.get('location'):
                from .models import Location
                location = get_object_or_404(Location, id=data.get('location'))
                branch.location = location
            
            # Update manager if provided
            if data.get('manager'):
                manager = get_object_or_404(User, id=data.get('manager'))
                branch.manager = manager
            
            branch.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Branch updated successfully',
                'branch': {
                    'id': branch.id,
                    'name': branch.name,
                    'code': branch.code,
                    'location': str(branch.location) if branch.location else '',
                    'address': branch.address or '',
                    'phone': branch.phone or '',
                    'email': branch.email or '',
                    'manager': branch.manager.get_full_name() if branch.manager else '',
                    'is_active': branch.is_active,
                }
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)


@login_required
@csrf_exempt
def branch_delete(request, branch_id):
    """Delete branch via AJAX"""
    if request.method == 'DELETE':
        try:
            branch = get_object_or_404(Branch, id=branch_id)
            
            # Check permissions
            if not check_admin_permission(request.user, branch.organization):
                return JsonResponse({
                    'success': False, 
                    'error': 'Permission denied'
                }, status=403)
            
            branch_name = branch.name
            branch.delete()
            
            return JsonResponse({
                'success': True,
                'message': f'Branch "{branch_name}" deleted successfully'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)


@login_required
@csrf_exempt
def branch_toggle_status(request, branch_id):
    """Toggle branch active/inactive status via AJAX"""
    if request.method == 'POST':
        try:
            branch = get_object_or_404(Branch, id=branch_id)
            
            # Check permissions
            if not check_admin_permission(request.user, branch.organization):
                return JsonResponse({
                    'success': False, 
                    'error': 'Permission denied'
                }, status=403)
            
            branch.is_active = not branch.is_active
            branch.save()
            
            return JsonResponse({
                'success': True,
                'message': f'Branch {"activated" if branch.is_active else "deactivated"} successfully',
                'is_active': branch.is_active
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)


@login_required
def branch_detail(request, branch_id):
    """Get branch details via AJAX"""
    try:
        branch = get_object_or_404(Branch, id=branch_id)
        
        # Check permissions
        if not check_admin_permission(request.user, branch.organization):
            return JsonResponse({
                'success': False, 
                'error': 'Permission denied'
            }, status=403)
        
        return JsonResponse({
            'success': True,
            'branch': {
                'id': branch.id,
                'name': branch.name,
                'code': branch.code,
                'location_id': branch.location.id if branch.location else '',
                'location_name': str(branch.location) if branch.location else '',
                'address': branch.address or '',
                'phone': branch.phone or '',
                'email': branch.email or '',
                'manager_id': branch.manager.id if branch.manager else '',
                'manager_name': branch.manager.get_full_name() if branch.manager else '',
                'description': branch.description or '',
                'is_active': branch.is_active,
                'created_date': branch.created_date.strftime('%Y-%m-%d %H:%M'),
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
def get_organization_users(request, org_id):
    """Get users for organization (for manager dropdown)"""
    try:
        organization = get_object_or_404(Organization, id=org_id, is_active=True)
        
        # Check permissions
        if not check_admin_permission(request.user, organization):
            return JsonResponse({
                'success': False, 
                'error': 'Permission denied'
            }, status=403)
        
        org_users = OrganizationUser.objects.filter(
            organization=organization,
            is_active=True,
            role__in=['admin', 'superuser', 'owner']
        ).select_related('user')
        
        users = []
        for org_user in org_users:
            users.append({
                'id': org_user.user.id,
                'name': org_user.user.get_full_name() or org_user.user.username,
                'username': org_user.user.username,
                'role': org_user.role
            })
        
        return JsonResponse({
            'success': True,
            'users': users
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)