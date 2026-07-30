from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Branch
from common.branch_utils import BranchManager
from user.models import OrganizationUser


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_branches_by_organization(request, organization_id=None):
    """
    Get all active branches for a specific organization.
    Supports path parameter `/api/branches/by-organization/<id>/` and
    query parameter `/api/branches/by-organization/?organization_id=<id>`.
    """
    try:
        # allow org id from path or query param
        if organization_id is None:
            org_id_str = request.GET.get('organization_id')
        else:
            org_id_str = str(organization_id)

        if not org_id_str:
            return Response({"error": "organization_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        org_id = int(org_id_str)

        # Determine access
        if request.user.is_superuser:
            branches = Branch.objects.filter(organization_id=org_id, is_active=True).order_by('name')
        elif OrganizationUser.objects.filter(
            user=request.user,
            organization_id=org_id,
            is_active=True,
        ).exists():
            branches = BranchManager.get_user_branches(
                request.user,
                organization=org_id,
            ).select_related("organization").order_by("name")
        else:
            return Response({"error": "You don't have access to this organization"}, status=status.HTTP_403_FORBIDDEN)

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

        return Response({"branches": branch_data, "count": len(branch_data)}, status=status.HTTP_200_OK)

    except ValueError:
        return Response({"error": "Invalid organization ID"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": f"Error fetching branches: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_user_branches(request):
    """
    Get all branches accessible to the current user
    """
    try:
        if request.user.is_superuser:
            branches = Branch.objects.filter(
                is_active=True
            ).order_by('organization__name', 'name')
        else:
            branches = BranchManager.get_user_branches(
                request.user,
            ).select_related("organization").order_by("organization__name", "name")
        
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
