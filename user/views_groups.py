from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Group, Permission
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.paginator import Paginator
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType
import json


@login_required(login_url='/')
def groups_management(request):
    """View for managing user groups"""
    if not request.user.is_superuser:
        messages.error(request, 'You need superuser permissions to access group management.')
        return redirect('admin:index')
    
    # Get all groups with permission counts
    groups = Group.objects.all().order_by('name')
    
    # Apply search filter if provided
    search_query = request.GET.get('search', '')
    if search_query:
        groups = groups.filter(
            Q(name__icontains=search_query)
        )
    
    # Add permission count to each group
    groups_data = []
    for group in groups:
        groups_data.append({
            'group': group,
            'permission_count': group.permissions.count(),
            'user_count': group.user_set.count()
        })
    
    # Pagination
    paginator = Paginator(groups_data, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Get all permissions for group creation/editing
    all_permissions = Permission.objects.all().order_by('content_type__app_label', 'codename')
    
    context = {
        'groups': page_obj,
        'search_query': search_query,
        'total_groups': groups.count(),
        'all_permissions': all_permissions
    }
    
    return render(request, 'user/groups_management.html', context)


@login_required(login_url='/')
def group_form(request, group_id=None):
    """Form for creating/editing groups"""
    if not request.user.is_superuser:
        messages.error(request, 'You need superuser permissions to manage groups.')
        return redirect('admin:index')
    
    group = None
    if group_id:
        group = get_object_or_404(Group, id=group_id)
    
    # Get all permissions organized by content type
    permissions_by_content_type = {}
    content_types = ContentType.objects.all().order_by('app_label', 'model')
    
    for ct in content_types:
        permissions = Permission.objects.filter(content_type=ct).order_by('codename')
        if permissions.exists():
            permissions_by_content_type[ct] = permissions
    
    context = {
        'group': group,
        'permissions_by_content_type': permissions_by_content_type,
        'selected_permissions': group.permissions.all() if group else []
    }
    
    return render(request, 'user/group_form.html', context)


@login_required(login_url='/')
@csrf_exempt
@api_view(['POST'])
def create_update_group(request):
    """Create or update a group"""
    if not request.user.is_superuser:
        return Response({'ok': False, 'message': 'Permission denied'})
    
    try:
        group_id = request.data.get('id')
        name = request.data.get('name', '').strip()
        permission_ids = request.data.get('permissions', [])
        
        if not name:
            return Response({'ok': False, 'message': 'Group name is required'})
        
        # Check if group name already exists (excluding current group if editing)
        existing_group = Group.objects.filter(name=name)
        if group_id:
            existing_group = existing_group.exclude(id=group_id)
        
        if existing_group.exists():
            return Response({'ok': False, 'message': 'Group with this name already exists'})
        
        # Create or update group
        if group_id:
            group = Group.objects.get(id=group_id)
            group.name = name
            group.save()
            message = 'Group updated successfully'
        else:
            group = Group.objects.create(name=name)
            message = 'Group created successfully'
        
        # Update permissions
        if isinstance(permission_ids, list):
            permissions = Permission.objects.filter(id__in=permission_ids)
            group.permissions.set(permissions)
        
        return Response({
            'ok': True,
            'message': message,
            'group': {
                'id': group.id,
                'name': group.name,
                'permission_count': group.permissions.count()
            }
        })
    
    except Group.DoesNotExist:
        return Response({'ok': False, 'message': 'Group not found'})
    except Exception as e:
        return Response({'ok': False, 'message': str(e)})


@login_required(login_url='/')
@csrf_exempt
def delete_group(request, group_id):
    """Delete a group"""
    if not request.user.is_superuser:
        return JsonResponse({'ok': False, 'message': 'Permission denied'})
    
    try:
        group = Group.objects.get(id=group_id)
        group_name = group.name
        user_count = group.user_set.count()
        
        if user_count > 0:
            return JsonResponse({
                'ok': False, 
                'message': f'Cannot delete group "{group_name}" because it has {user_count} users assigned to it.'
            })
        
        group.delete()
        messages.success(request, f'Group "{group_name}" deleted successfully.')
        return JsonResponse({'ok': True, 'message': f'Group "{group_name}" deleted successfully'})
    
    except Group.DoesNotExist:
        return JsonResponse({'ok': False, 'message': 'Group not found'})
    except Exception as e:
        return JsonResponse({'ok': False, 'message': str(e)})


@api_view(['POST'])
def get_group_details(request):
    """Get detailed group information"""
    if not request.user.is_superuser:
        return Response({'ok': False, 'message': 'Permission denied'})
    
    group_id = request.data.get('group_id')
    
    try:
        group = Group.objects.get(id=group_id)
        permissions = group.permissions.all()
        users = group.user_set.all()
        
        return Response({
            'ok': True,
            'group': {
                'id': group.id,
                'name': group.name,
                'permissions': [{
                    'id': p.id,
                    'name': p.name,
                    'codename': p.codename,
                    'content_type': str(p.content_type)
                } for p in permissions],
                'users': [{
                    'id': u.id,
                    'username': u.username,
                    'first_name': u.first_name,
                    'last_name': u.last_name
                } for u in users]
            }
        })
    
    except Group.DoesNotExist:
        return Response({'ok': False, 'message': 'Group not found'})
    except Exception as e:
        return Response({'ok': False, 'message': str(e)})