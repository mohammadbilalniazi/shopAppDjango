from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.decorators import login_required
from .models import Branch
from common.organization import find_userorganization

@api_view(['GET'])
@login_required
def get_branches_by_organization(request, organization_id):
    """
    Get all active branches for a specific organization
    """
    try:
        self_organization, user_orgs = find_userorganization(request)
        
        # Verify user has access to the organization
        if self_organization and self_organization.id == int(organization_id):
            # User belongs to this organization
            branches = Branch.objects.filter(
                organization=self_organization, 
                is_active=True
            ).order_by('name')
        elif user_orgs and user_orgs.filter(id=int(organization_id)).exists():
            # User has access to this organization
            org = user_orgs.get(id=int(organization_id))
            branches = Branch.objects.filter(
                organization=org, 
                is_active=True
            ).order_by('name')
        elif request.user.is_superuser or request.user.is_staff:
            # Superuser/staff can access any organization available in the UI selector
            branches = Branch.objects.filter(
                organization_id=int(organization_id), 
                is_active=True
            ).order_by('name')
        else:
            return Response(
                {"error": "You don't have access to this organization"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Serialize branches
        branch_data = []
        for branch in branches:
            branch_data.append({
                'id': branch.id,
                'name': branch.name,
                'address': branch.address,
                'phone': branch.phone
            })
        
        return Response({
            "branches": branch_data,
            "count": len(branch_data)
        }, status=status.HTTP_200_OK)
        
    except ValueError:
        return Response(
            {"error": "Invalid organization ID"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {"error": f"Error fetching branches: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])  
@login_required
def get_all_user_branches(request):
    """
    Get all branches accessible to the current user
    """
    try:
        self_organization, user_orgs = find_userorganization(request)
        
        if self_organization:
            branches = Branch.objects.filter(
                organization=self_organization, 
                is_active=True
            ).order_by('organization__name', 'name')
        elif user_orgs:
            branches = Branch.objects.filter(
                organization__in=user_orgs, 
                is_active=True
            ).order_by('organization__name', 'name')
        elif request.user.is_superuser:
            branches = Branch.objects.filter(
                is_active=True
            ).order_by('organization__name', 'name')
        else:
            branches = Branch.objects.none()
        
        # Serialize branches with organization info
        branch_data = []
        for branch in branches:
            branch_data.append({
                'id': branch.id,
                'name': branch.name,
                'address': branch.address,
                'phone': branch.phone,
                'organization': {
                    'id': branch.organization.id,
                    'name': branch.organization.name
                }
            })
        
        return Response({
            "branches": branch_data,
            "count": len(branch_data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": f"Error fetching branches: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )