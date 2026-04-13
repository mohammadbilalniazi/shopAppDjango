from django.contrib.auth import authenticate,login
from django.http import HttpResponse,JsonResponse
from rest_framework import status as http_status
from rest_framework.response import Response
from django.template.context_processors import csrf
from django.shortcuts import redirect, render
from django.urls import reverse, reverse_lazy
import json
  
def login_form(request):
    # template=loader.get_template("User/vertical/login_django_admin.html")
    context={}
    context.update(csrf(request))
    #return HttpResponse(template.render(request,context))
    #return render(request,"User/vertical/login_django_admin.html",context_instance=RequestContext(request))
    return render(request,"user/login_django_admin.html",context)

def submit(request):
    print("request.body=",request.body)
    raw_data=request.body
    data=raw_data.decode("utf-8")
    print("data ",data," type(data) ", type(data))
    data=json.loads(data)
    print("type(data) ",type(data)," data ",data )
    username=str(data['username'])
    password=str(data['password'])

    # return JsonResponse({"status":"test","base_url":"sksk"})
    
    # return HttpResponse(username)
    #return HttpResponse(password) 
    print(username," ",password)
    user=authenticate(request,username=username,password=password)
    print("authenticate(user) ",user)
    if user is not None: 
        login(request,user) 
        status=http_status.HTTP_200_OK
        #print("request.scheme ",request.scheme," request.get_host() ",request.get_host()," request.path ",request.path)
        message="Login Succesfully {} ".format(username)
        # request.schem= http    request.get_host() 127.0.0.1:8000   request.path=current_view /login_form/submit/
        #complete_base_url_to_current_view =  "{0}://{1}{2}".format(request.scheme, request.get_host(), request.path)
        # base_url "http://127.0.0.1:8000/login_form/submit//admin"
        base_url_to_admin =  "{0}://{1}/admin".format(request.scheme,request.get_host())
    else:
        #messages.error(request,"اسم یوزر یا رمز صحیح نیست یا یوزر قابلیت ورود ندار ")
        status=http_status.HTTP_401_UNAUTHORIZED
        base_url_to_admin=None
        message="Invalid username or password"
    
    return JsonResponse({"status":status,"base_url":base_url_to_admin,"message":message})
    # return Response(status=status,base_url=base_url_to_admin,message=message)
    
def root_entry(request):
    """Entry point for the site root (/).
    If the user is already authenticated and an admin/staff, send them to the custom admin,
    otherwise send them to the host-to-heroku login form.
    """
    if request.user.is_authenticated and (getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_staff', False)):
        return redirect('/admin/')
    return redirect('/login_form/')

    