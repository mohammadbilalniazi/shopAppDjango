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
    self_organization,parent_organization,user_orgs = find_userorganization(request)
    context={}
    if request.user.is_superuser:
        context['organizations']=Organization.objects.all() 
    else:
        context['organizations']=Organization.objects.filter(id=parent_organization.id)
    if id!="null" and id:
        context['organization_user']=OrganizationUser.objects.get(id=int(id))
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

    with transaction.atomic():
        try:
            if id:  # 🔹 UPDATE
                instance = OrganizationUser.objects.get(id=int(id))
                user = instance.user
                user.username = username
                user.first_name = first_name
                user.last_name = last_name
                if password:
                    user.set_password(password)
                user.save()

                # shallow dict (safe, avoids deepcopy of files)
                update_data = request.data.dict()
                update_data["user"] = user.id
                update_data["organization"] = organization
                update_data["role"] = role

                serializer = OrganizationUserCreateSerializer(
                    instance, data=update_data, partial=True
                )

            else:  # 🔹 CREATE
                if User.objects.filter(username=username).exists():
                    return Response({"error": "Username already taken."}, status=400)

                user = User(
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=True,
                    is_staff=True
                )
                if password:
                    user.set_password(password)
                user.save()

                if OrganizationUser.objects.filter(user=user, organization_id=organization).exists():
                    return Response({"error": "User already exists in this organization."}, status=400)

                create_data = request.data.dict()
                create_data["user"] = user.id
                create_data["organization"] = organization
                create_data["role"] = role

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
            self_organization, parent_organization, user_orgs = find_userorganization(request)
            context = {}
            if request.user.is_superuser:
                context['organizations'] = Organization.objects.all()
            else:
                context['organizations'] = Organization.objects.filter(id=parent_organization.id)
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
        current_org_user = OrganizationUser.objects.get(user=request.user)
        is_superuser = (current_org_user.role == 'superuser' or request.user.is_superuser)
    except OrganizationUser.DoesNotExist:
        # If user is Django superuser but not in OrganizationUser table
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
            current_org_user = OrganizationUser.objects.get(user=request.user)
            query = query.filter(organization=current_org_user.organization)
        except OrganizationUser.DoesNotExist:
            pass
    
    # Apply other filters
    if username:
        query=query.filter(user__username__icontains=username)
    if first_name:
        query=query.filter(user__first_name__icontains=first_name)
    if last_name:
        query=query.filter(user__last_name__icontains=last_name)
    
    is_paginate=int(request.data.get("is_paginate",0))
    if  is_paginate==1:
        paginator=PageNumberPagination() 
        paginator.page_size=5
        query_set=paginator.paginate_queryset(query.order_by('-pk'),request)
        serializer=OrganizationUserSerializer(query_set,many=True,context={'request':request})
        return paginator.get_paginated_response({'ok':True,'serializer_data':serializer.data})
    serializer=OrganizationUserSerializer(query,many=True,context={'request':request})
    return Response(serializer.data,status=status.HTTP_200_OK)


