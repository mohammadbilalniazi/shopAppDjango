from user.models import OrganizationUser
from django.contrib.auth.models import User
from configuration.models import Organization
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from .serializer import *
from django.db import transaction
from django.shortcuts import render
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage
from common.organization import *
from django.contrib.auth.decorators import login_required


def _get_requester_context(request):
    """Returns (is_superuser, own_org_user) for the logged-in user."""
    own_org_user = OrganizationUser.objects.filter(user=request.user).first()
    is_su = request.user.is_superuser or (
        own_org_user is not None and own_org_user.role in ('superuser', 'owner')
    )
    return is_su, own_org_user


@login_required(login_url='/')
def form(request,id=None):
    self_organization,user_orgs = find_userorganization(request)
    context={}

    # Get branches for the organization(s)
    from configuration.models import Branch
    from django.contrib.auth.models import Group

    if self_organization is not None:
        branches = Branch.objects.filter(organization=self_organization, is_active=True)
    else:
        branches = Branch.objects.filter(organization__in=user_orgs, is_active=True)

    context['branches'] = branches
    context['groups'] = Group.objects.all()  # Get all available groups

    if request.user.is_superuser:
        context['organizations']=Organization.objects.all()
    else:
        # Handle case when self_organization is None (user has multiple organizations)
        if self_organization is not None:
            context['organizations']=Organization.objects.filter(id=self_organization.id)
        else:
            # User has multiple organizations, use all of them
            context['organizations'] = user_orgs
    if id!="null" and id:
        try:
            org_user_obj = OrganizationUser.objects.select_related('branch', 'organization').get(id=int(id))
        except OrganizationUser.DoesNotExist:
            from django.http import HttpResponseForbidden
            return HttpResponseForbidden("User not found.")
        # Non-superusers may only open users from their own org
        is_su, own_org_user = _get_requester_context(request)
        if not is_su and own_org_user and org_user_obj.organization_id != own_org_user.organization_id:
            from django.http import HttpResponseForbidden
            return HttpResponseForbidden("You do not have permission to edit this user.")
        context['organization_user'] = org_user_obj
    return render(request,"user/organization_user.html",context)


@api_view(['POST'])
def insert(request):
    id = request.data.get("id")
    is_su, own_org_user = _get_requester_context(request)

    # Non-superusers must belong to an organization
    if not is_su and own_org_user is None:
        return Response({"error": "You do not belong to any organization."}, status=status.HTTP_403_FORBIDDEN)

    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")
    username = request.data.get("username")
    password = request.data.get("password")
    role = request.data.get("role")
    organization = request.data.get("organization")
    # Enforce non-superusers can only operate within their own organization
    if not is_su:
        if organization and str(own_org_user.organization_id) != str(organization):
            return Response({"error": "You can only manage users in your own organization."}, status=status.HTTP_403_FORBIDDEN)
        # For updates, verify the target org user belongs to the same org
        if id:
            try:
                target_ou = OrganizationUser.objects.get(id=int(id))
                if target_ou.organization_id != own_org_user.organization_id:
                    return Response({"error": "You can only edit users in your own organization."}, status=status.HTTP_403_FORBIDDEN)
            except OrganizationUser.DoesNotExist:
                return Response({"error": "OrganizationUser not found."}, status=status.HTTP_404_NOT_FOUND)
        # Auto-assign org for non-superuser if not sent
        if not organization:
            organization = str(own_org_user.organization_id)

    branch_id = request.data.get("branch")  # Get branch from form
    existing_user_id = request.data.get("existing_user_id")
    is_active = request.data.get("is_active", "on") == "on"  # Handle checkbox value
    groups = request.data.getlist("groups", [])  # Get list of group IDs

    with transaction.atomic():
        try:
            # Handle branch if provided
            branch = None
            if branch_id:
                try:
                    from configuration.models import Branch
                    branch = Branch.objects.get(
                        id=int(branch_id),
                        organization_id=organization,
                        is_active=True
                    )
                except Branch.DoesNotExist:
                    return Response({"error": "Invalid branch selected."}, status=400)

            if id:  # 🔹 UPDATE
                instance = OrganizationUser.objects.get(id=int(id))
                user = instance.user
                user.username = username
                user.first_name = first_name
                user.last_name = last_name
                user.is_active = is_active
                if password:
                    user.set_password(password)
                user.save()

                # Update groups
                user.groups.clear()
                for group_id in groups:
                    try:
                        from django.contrib.auth.models import Group
                        group = Group.objects.get(id=int(group_id))
                        user.groups.add(group)
                    except Group.DoesNotExist:
                        pass

                # shallow dict (safe, avoids deepcopy of files)
                update_data = request.data.dict()
                update_data["user"] = user.id
                update_data["organization"] = organization
                update_data["role"] = role
                update_data["branch"] = branch.id if branch else None
                update_data["is_active"] = is_active

                serializer = OrganizationUserCreateSerializer(
                    instance, data=update_data, partial=True
                )

            else:  # 🔹 CREATE
                created_new_user = False

                # Reuse an existing Django user when assigning organization from the user list
                if existing_user_id:
                    try:
                        user = User.objects.get(id=int(existing_user_id))
                    except User.DoesNotExist:
                        return Response({"error": "Selected user not found."}, status=404)

                    if OrganizationUser.objects.filter(user=user).exists():
                        return Response({"error": "User already belongs to an organization. One user can only belong to one organization."}, status=400)

                    user.username = username
                    user.first_name = first_name
                    user.last_name = last_name
                    user.is_active = is_active
                    user.is_staff = True
                    if password:
                        user.set_password(password)
                    user.save()
                else:
                    # Check username availability first for brand new users
                    if User.objects.filter(username=username).exists():
                        return Response({"error": "Username already taken."}, status=400)

                    user = User(
                        username=username,
                        first_name=first_name,
                        last_name=last_name,
                        is_active=is_active,
                        is_staff=True
                    )
                    if password:
                        user.set_password(password)
                    user.save()
                    created_new_user = True

                    # Safety check for one user, one organization rule
                    if OrganizationUser.objects.filter(user=user).exists():
                        user.delete()
                        return Response({"error": "User already belongs to an organization. One user can only belong to one organization."}, status=400)

                # Add groups to user
                user.groups.clear()
                for group_id in groups:
                    try:
                        from django.contrib.auth.models import Group
                        group = Group.objects.get(id=int(group_id))
                        user.groups.add(group)
                    except Group.DoesNotExist:
                        pass

                create_data = request.data.dict()
                create_data["user"] = user.id
                create_data["organization"] = organization
                create_data["role"] = role
                create_data["branch"] = branch.id if branch else None
                create_data["is_active"] = is_active

                serializer = OrganizationUserCreateSerializer(data=create_data)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            # Revert just-created user on serializer failure
            if not id and not existing_user_id and 'created_new_user' in locals() and created_new_user:
                user.delete()

            transaction.set_rollback(True)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except OrganizationUser.DoesNotExist:
            transaction.set_rollback(True)
            return Response({"error": "OrganizationUser not found."}, status=404)

        except Exception as e:
            transaction.set_rollback(True)
            return Response({"error": str(e)}, status=500)
        
@api_view(['DELETE'])
def delete(request,id=None):
    try:
        organization_user = OrganizationUser.objects.get(id=int(id))
    except OrganizationUser.DoesNotExist:
        return Response({"error": "OrganizationUser not found."}, status=status.HTTP_404_NOT_FOUND)

    is_su, own_org_user = _get_requester_context(request)
    if not is_su:
        if own_org_user is None or organization_user.organization_id != own_org_user.organization_id:
            return Response({"error": "You can only delete users in your own organization."}, status=status.HTTP_403_FORBIDDEN)

    try:
        organization_user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get(request,id=None):
    try:
        if id:
            organization_user = OrganizationUser.objects.get(id=int(id))
            serializer = OrganizationUserSerializer(organization_user, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # Render the organization_user.html template
            self_organization, user_orgs = find_userorganization(request)
            context = {}
            if request.user.is_superuser:
                context['organizations'] = Organization.objects.all()
            else:
                # Handle case when self_organization is None (user has multiple organizations)
                if self_organization is not None:
                    context['organizations'] = Organization.objects.filter(id=self_organization.id)
                else:
                    # User has multiple organizations, use all of them
                    context['organizations'] = user_orgs
            return render(request, "user/organization_user.html", context)
    except OrganizationUser.DoesNotExist:
        return Response({"error": "OrganizationUser not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def search(request):
    organization=request.data.get("organization",None)
    username=request.data.get("username",None)
    first_name=request.data.get("first_name",None)
    last_name=request.data.get("last_name",None)

    is_superuser, current_org_user = _get_requester_context(request)
    query = OrganizationUser.objects.select_related('user', 'organization').all()
    selected_organization_id = int(organization) if organization else None

    # Organization filter logic
    if organization:
        if not is_superuser and current_org_user and selected_organization_id != current_org_user.organization_id:
            query = query.none()
        else:
            org_query = query.filter(organization__id=selected_organization_id)
            if not org_query.exists() and is_superuser:
                pass
            else:
                query = org_query
    elif not is_superuser:
        if current_org_user:
            query = query.filter(organization=current_org_user.organization)
        else:
            query = query.none()

    # Apply other filters
    if username:
        query=query.filter(user__username__icontains=username)
    if first_name:
        query=query.filter(user__first_name__icontains=first_name)
    if last_name:
        query=query.filter(user__last_name__icontains=last_name)

    # Build response rows for assigned users
    assigned_rows = []
    for row in OrganizationUserSerializer(query.order_by('-pk'), many=True, context={'request': request}).data:
        row['org_user_id'] = row['id']
        row['is_assigned'] = True
        assigned_rows.append(row)

    # Also return Django users that do not have OrganizationUser yet
    assigned_user_ids = OrganizationUser.objects.values_list('user_id', flat=True)
    unassigned_users = User.objects.exclude(id__in=assigned_user_ids)

    if not is_superuser:
        if current_org_user:
            if selected_organization_id and selected_organization_id != current_org_user.organization_id:
                unassigned_users = User.objects.none()
            # Without an explicit org filter, non-superusers see unassigned users
            # only so they can assign them to THEIR OWN org (enforced on insert)
        else:
            unassigned_users = User.objects.none()

    if username:
        unassigned_users = unassigned_users.filter(username__icontains=username)
    if first_name:
        unassigned_users = unassigned_users.filter(first_name__icontains=first_name)
    if last_name:
        unassigned_users = unassigned_users.filter(last_name__icontains=last_name)

    # If single search box fills all fields, match any of them for unassigned users
    if username and username == first_name and first_name == last_name:
        term = username
        unassigned_users = unassigned_users.filter(
            Q(username__icontains=term) |
            Q(first_name__icontains=term) |
            Q(last_name__icontains=term)
        )

    unassigned_rows = []
    for u in unassigned_users.order_by('-id'):
        unassigned_rows.append({
            'id': None,
            'org_user_id': None,
            'user': u.id,
            'user_id': u.id,
            'organization': 'Not Assigned',
            'username': u.username,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'role': '-',
            'is_active': u.is_active,
            'img': None,
            'is_assigned': False
        })

    combined_rows = assigned_rows + unassigned_rows

    is_paginate=int(request.data.get("is_paginate",0))
    if is_paginate==1:
        page_size = 5
        requested_page = request.data.get("page", request.query_params.get("page", 1))
        try:
            requested_page = int(requested_page)
        except (TypeError, ValueError):
            requested_page = 1

        paginator = Paginator(combined_rows, page_size)
        try:
            page_obj = paginator.page(requested_page)
        except EmptyPage:
            page_obj = paginator.page(1)

        return Response({
            'count': paginator.count,
            'next': page_obj.next_page_number() if page_obj.has_next() else None,
            'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
            'results': {
                'ok': True,
                'serializer_data': list(page_obj.object_list)
            }
        }, status=status.HTTP_200_OK)
    return Response(combined_rows,status=status.HTTP_200_OK)


