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
    self_organization, user_orgs = find_userorganization(request)
    context={}
    if request.user.is_superuser:
        context['organizations']=Organization.objects.all() 
    else:
        if self_organization is not None:
            context['organizations']=Organization.objects.filter(id=self_organization.id)
        else:
            context['organizations']=user_orgs
    if id:
        context['organization_user']=OrganizationUser.objects.get(id=int(id))
    return render(request,"user/organization_user.html",context)

@api_view(['POST'])
def insert(request):
    data = request.data.copy()
    id = data.get("id")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")

    organization = data.get("organization")
    img = request.FILES.get('img')

    with transaction.atomic():
        try:
            if id:
                instance = OrganizationUser.objects.get(id=int(id))
                user = instance.user
                user.username = username
                user.first_name = first_name
                user.last_name = last_name
                if password:
                    user.set_password(password)
                user.save()

                payload = {
                    "user": user.id,  # ✅ pass user.id
                    "organization": organization,
                    "img": img,
                    "role":role,
                }
                serializer = OrganizationUserCreateSerializer(instance, data=payload)
            else:
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
                payload = {
                    "user": user.id,  # ✅ pass user.id
                    "organization": organization,
                    "img": img,
                    "role":role,
                }
                serializer = OrganizationUserCreateSerializer(data=payload)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            transaction.set_rollback(True)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            transaction.set_rollback(True)
            return Response({"error": "Integrity error: possibly duplicate user + organization."}, status=400)
        except OrganizationUser.DoesNotExist:
            return Response({"error": "OrganizationUser not found."}, status=404)
        except Exception as e:
            transaction.set_rollback(True)
            return Response({"error": str(e)}, status=500)

@api_view(['DELETE'])
def delete(request,pk=None):
    organization_user=OrganizationUser.objects.get(id=int(pk))
    try:
        organization_user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response(errors=str(e),status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get(request,id=None):
    try:
        organization_user=OrganizationUser.objects.get(id=int(id))
        return Response(organization_user,status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response(errors=str(e),status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def get_users(request):
    organization=request.data.get("organization",None)
    username=request.data.get("username",None)
    first_name=request.data.get("first_name",None)
    last_name=request.data.get("last_name",None)
    query=User.objects.all()
    # print("**query ",query)
    if organization:
        query=query.filter(user__organizationuser__id=int(organization))
        # print("^^query org ",query)
    if username:
        query=query.filter(username__icontains=username)
        # print("$query username ",query)
    if first_name:
        query=query.filter(first_name__icontains=first_name)
        # print("#query first ",query)
    if last_name:
        query=query.filter(last_name__icontains=last_name)
        # print("query lastname ",query)
    is_paginate=int(request.data.get("is_paginate",0))
    if  is_paginate==1:
        paginator=PageNumberPagination() 
        paginator.page_size=5
        query_set=paginator.paginate_queryset(query.order_by('-pk'),request)
        serializer=UserSerializer(query_set,many=True)
        return paginator.get_paginated_response({'ok':True,'serializer_data':serializer.data})
    serializer=UserSerializer(query_set,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)

@api_view(['POST'])
def search(request):
    organization=request.data.get("organization",None)
    username=request.data.get("username",None)
    first_name=request.data.get("first_name",None)
    last_name=request.data.get("last_name",None)

    query=OrganizationUser.objects.all()
    # print("**query ",query)
    if organization:
        query=query.filter(organization__id=int(organization))
        # print("^^query org ",query)
    if username:
        query=query.filter(user__username__icontains=username)
        # print("$query username ",query)
    if first_name:
        query=query.filter(user__first_name__icontains=first_name)
        # print("#query first ",query)
    if last_name:
        query=query.filter(user__last_name__icontains=last_name)
        # print("query lastname ",query)
    is_paginate=int(request.data.get("is_paginate",0))
    if  is_paginate==1:
        paginator=PageNumberPagination() 
        paginator.page_size=5
        query_set=paginator.paginate_queryset(query.order_by('-pk'),request)
        serializer=OrganizationUserSerializer(query_set,many=True)
        return paginator.get_paginated_response({'ok':True,'serializer_data':serializer.data})
    serializer=OrganizationUserSerializer(query_set,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)


