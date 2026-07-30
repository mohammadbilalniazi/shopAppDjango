from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from rest_framework import status as http_status
from django.template.context_processors import csrf
from django.shortcuts import redirect, render
import json


ADMIN_LANDING_URL = "/admin/"
USER_LANDING_URL = "/admin/bill/bill/"


def _landing_url_for_user(user):
    if user.is_superuser or user.is_staff:
        return ADMIN_LANDING_URL
    return USER_LANDING_URL
  
def login_form(request):
    # template=loader.get_template("User/vertical/login_django_admin.html")
    context={}
    context.update(csrf(request))
    #return HttpResponse(template.render(request,context))
    #return render(request,"User/vertical/login_django_admin.html",context_instance=RequestContext(request))
    return render(request,"user/login_django_admin.html",context)

def submit(request):
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse(
            {"status": http_status.HTTP_400_BAD_REQUEST, "base_url": None, "message": "Invalid login request."},
            status=http_status.HTTP_400_BAD_REQUEST,
        )

    username=str(data.get('username', '')).strip()
    password=str(data.get('password', ''))

    if not username or not password:
        return JsonResponse(
            {"status":http_status.HTTP_400_BAD_REQUEST, "base_url":None, "message":"Username and password are required."},
            status=http_status.HTTP_400_BAD_REQUEST,
        )

    user=authenticate(request,username=username,password=password)
    if user is not None: 
        login(request,user) 
        status=http_status.HTTP_200_OK
        message="Login Succesfully {} ".format(username)
        base_url_to_admin = request.build_absolute_uri(_landing_url_for_user(user))
    else:
        #messages.error(request,"اسم یوزر یا رمز صحیح نیست یا یوزر قابلیت ورود ندار ")
        status=http_status.HTTP_401_UNAUTHORIZED
        base_url_to_admin=None
        message="Invalid username or password"
    
    return JsonResponse(
        {"status":status,"base_url":base_url_to_admin,"message":message},
        status=status,
    )

def root_entry(request):
    """Entry point for the site root (/).
    If the user is already authenticated and an admin/staff, send them to the custom admin,
    otherwise send them to the host-to-heroku login form.
    """
    if request.user.is_authenticated:
        return redirect(_landing_url_for_user(request.user))
    return redirect('/login_form/')

    
