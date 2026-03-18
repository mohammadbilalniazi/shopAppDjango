Users Module Documentation

1. Module Scope

The users module handles:
- Authentication (login form and login submit)
- Organization user management
- Session management for superusers
- Role-based access support

Primary files:
- user/models.py
- user/views_login.py
- user/views_organization_user.py
- user/views_session.py
- shop/urls.py

2. Core Model

OrganizationUser
Maps Django users to organizations and optional branch assignment.

```python
class OrganizationUser(models.Model):
    ROLE_CHOICES = (
        ('employee', 'Employee'),
        ('admin', 'Admin'),
        ('superuser','SuperUser'),
        ('owner','Owner')
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    branch = models.ForeignKey('configuration.Branch', on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='member')

    class Meta:
        unique_together = ('user', 'organization')
```

3. Authentication Flow

From user/views_login.py:

```python
def submit(request):
    data=json.loads(request.body.decode("utf-8"))
    username=str(data['username'])
    password=str(data['password'])

    user=authenticate(request,username=username,password=password)
    if user is not None:
        login(request,user)
        status=http_status.HTTP_200_OK
        base_url_to_admin =  "{0}://{1}/admin".format(request.scheme,request.get_host())
    else:
        status=http_status.HTTP_401_UNAUTHORIZED
        base_url_to_admin=None
```

Key thesis point: authentication is implemented as JSON request/response login instead of Django default form post.

4. User Management API Behavior

From user/views_organization_user.py:

Create/Update user and organization membership

```python
@api_view(['POST'])
def insert(request):
    id = request.data.get("id")
    username = request.data.get("username")
    role = request.data.get("role")
    organization = request.data.get("organization")
    branch_id = request.data.get("branch")

    with transaction.atomic():
        if id:
            instance = OrganizationUser.objects.get(id=int(id))
            user = instance.user
            user.username = username
            user.save()
            serializer = OrganizationUserCreateSerializer(instance, data=update_data, partial=True)
        else:
            user = User(username=username, is_active=True, is_staff=True)
            user.save()
            serializer = OrganizationUserCreateSerializer(data=create_data)
```

Search with role-aware filtering

```python
@api_view(['POST'])
def search(request):
    organization=request.data.get("organization",None)

    is_superuser = False
    try:
        current_org_user = OrganizationUser.objects.get(user=request.user)
        is_superuser = (current_org_user.role == 'superuser' or request.user.is_superuser)
    except OrganizationUser.DoesNotExist:
        is_superuser = request.user.is_superuser
```

5. Session Management

From user/views_session.py, superuser-only operations:
- List active/expired sessions
- Delete specific session
- Clear expired sessions
- Read session details

Example:

```python
@login_required(login_url='/')
def session_management(request):
    if not request.user.is_superuser:
        messages.error(request, 'You need superuser permissions to access session management.')
        return redirect('admin:index')

    sessions = Session.objects.all().order_by('-expire_date')
```

6. Main Routes

Registered in shop/urls.py:

```python
path('accounts/login/', views_login.login_form, name='login_form')
path('login_form/', views_login.login_form, name='login_form')
path("login_form/submit/", views_login.submit, name="login_submit")

path('admin/user/organizationuser/add/', views_organization_user.form, name='organization_user_form')
path('user/organization_user/insert/', views_organization_user.insert, name='organization_user_insert')
path('user/organization_user/get/', views_organization_user.get, name='organization_user_get')
path('user/organization_user/delete/<id>', views_organization_user.delete, name='organization_user_delete')
path('user/organization_user/search/', views_organization_user.search, name='organization_user_search')

path('user/sessions/', views_session.session_management, name='session_management')
path('user/sessions/delete/<str:session_key>/', views_session.delete_session, name='delete_session')
path('user/sessions/clear-expired/', views_session.clear_expired_sessions, name='clear_expired_sessions')
path('user/sessions/details/', views_session.get_session_details, name='get_session_details')
```

7. Relationship To Organization And Branch

User access is linked to organization and branch assignment.
This design supports multi-tenant behavior:
- one user may be mapped to organization membership table
- users can be attached to a primary branch
- role value controls admin capabilities inside an organization

8. Thesis Discussion Points

1. Explain OrganizationUser as a custom role bridge on top of Django User.
2. Analyze superuser vs organization-admin permission boundaries.
3. Discuss session management as an operational security feature.
4. Explain transactional create/update to avoid partial user records.
