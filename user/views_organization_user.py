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
from common.organization import *
from django.contrib.auth.decorators import login_required


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
        context['organization_user']=OrganizationUser.objects.select_related('branch').get(id=int(id))
    return render(request,"user/organization_user.html",context)


@api_view(['POST'])
def insert(request):
    id = request.data.get("id")
    first_name = request.data.get("first_name")
    last_name = request.data.get("last_name")
    username = request.data.get("username")
    password = request.data.get("password")
    role = request.data.get("role")
    organization = request.data.get("organization")
    branch_id = request.data.get("branch")  # Get branch from form
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
                # Check username availability first
                if User.objects.filter(username=username).exists():
                    return Response({"error": "Username already taken."}, status=400)

                # Create the user
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

                # Add groups to user
                for group_id in groups:
                    try:
                        from django.contrib.auth.models import Group
                        group = Group.objects.get(id=int(group_id))
                        user.groups.add(group)
                    except Group.DoesNotExist:
                        pass

                # Check if user already belongs to ANY organization (one user, one organization rule)
                # This shouldn't happen due to OneToOneField, but added as extra safety
                if OrganizationUser.objects.filter(user=user).exists():
                    user.delete()  # Clean up the created user
                    return Response({"error": "User already belongs to an organization. One user can only belong to one organization."}, status=400)

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
    organization_user=OrganizationUser.objects.get(id=int(id))
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

    # Check if the current user is a superuser
    is_superuser = False
    try:
        current_org_user = OrganizationUser.objects.filter(user=request.user).first()
        if current_org_user:
            is_superuser = (current_org_user.role == 'superuser' or request.user.is_superuser)
        else:
            is_superuser = request.user.is_superuser
    except Exception:
        # If any error occurs, check if user is Django superuser
        is_superuser = request.user.is_superuser

    query=OrganizationUser.objects.all()

    # Organization filter logic
    if organization:
        # Try to filter by selected organization first
        org_query = query.filter(organization__id=int(organization))

        # If no results found and user is superuser, show all users from all organizations
        if not org_query.exists() and is_superuser:
            # Don't filter by organization - show all
            pass
        else:
            # Apply organization filter
            query = org_query
    elif not is_superuser:
        # If no organization selected and user is NOT superuser,
        # restrict to their organization only
        try:
            current_org_user = OrganizationUser.objects.filter(user=request.user).first()
            if current_org_user:
                query = query.filter(organization=current_org_user.organization)
        except Exception:
            pass

    # Apply other filters
    if username:
        query=query.filter(user__username__icontains=username)
    if first_name:
        query=query.filter(user__first_name__icontains=first_name)
    if last_name:
        query=query.filter(user__last_name__icontains=last_name)

    is_paginate=int(request.data.get("is_paginate",0))
    if is_paginate==1:
        from rest_framework.pagination import PageNumberPagination
        paginator=PageNumberPagination()
        paginator.page_size=5
        query_set=paginator.paginate_queryset(query.order_by('-pk'),request)
        serializer=OrganizationUserSerializer(query_set,many=True,context={'request':request})
        return paginator.get_paginated_response({'ok':True,'serializer_data':serializer.data})
    serializer=OrganizationUserSerializer(query,many=True,context={'request':request})
    return Response(serializer.data,status=status.HTTP_200_OK)


