from user.models import OrganizationUser
from django.contrib.auth.models import User,Group
from configuration.models import Organization
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from .serializer import *
from django.db import transaction
from django.shortcuts import render
from common.organization import *

def form(request,id=None):
    (self_organization,parent_organization)=find_organization(request)
    context={}
    if request.user.is_superuser:
        context['organizations']=Organization.objects.all() 
    else:
        context['organizations']=Organization.objects.filter(id=parent_organization.id)
    if id:
        context['organization_user']=OrganizationUser.objects.get(id=int(id))
    return render(request,"user/organization_user.html",context)

@api_view(['POST'])
def insert(request):
    data=request.data.copy()
    id=data.get("id",None)
    first_name=data.get("first_name",None)
    last_name=data.get("last_name",None)
    username=data.get("username",None)
    password=data.get("password",None)

    print(f"data {request.data}")
    if hasattr(request.FILES,'img') and request.FILES['img']:
        img=request.FILES['img']
    else:
        img=None
    print("img ",img," password ",password)
    organization=data.get("organization",None)
    with transaction.atomic():
        if id:
            instance=OrganizationUser.objects.get(id=int(id))
            user=instance.user
            user.username=username
            user.first_name=first_name
            user.last_name=last_name
            user.save()
            organization_user={"user":user.id,"img":img,"organization":organization}
            serializer=OrganizationUserSerializer(instance,data=organization_user)
        else:
            user=User.objects.create(username=username,first_name=first_name,last_name=last_name)
            print(f"user {user} created")
            serializer=OrganizationUserSerializer(data=organization_user)
        user.set_password(password)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        transaction.rollback()
        print("errors ",serializer.errors)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

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
def search(request):
    organization=request.data.get("organization",None)
    username=request.data.get("username",None)
    first_name=request.data.get("first_name",None)
    last_name=request.data.get("last_name",None)

    query=OrganizationUser.objects.all()
    print("query ",query)
    if organization:
        query.filter(organization__id=int(organization))
        print("query org ",query)
    if username:
        query.filter(user__username__icontains=username)
        print("query username ",query)
    if first_name:
        query.filter(user__first_name__icontains=first_name)
        print("query first ",query)
    if last_name:
        query.filter(user__last_name__icontains=last_name)
        print("query lastname ",query)
    is_paginate=int(request.data.get("is_paginate",0))
    if  is_paginate==1:
        paginator=PageNumberPagination() 
        paginator.page_size=20
        query_set=paginator.paginate_queryset(query.order_by('-pk'),request)
        serializer=OrganizationUserSerializer(query_set,many=True)
        return paginator.get_paginated_response({'ok':True,'serializer_data':serializer.data})
    return Response(serializer.data,status=status.HTTP_200_OK)


