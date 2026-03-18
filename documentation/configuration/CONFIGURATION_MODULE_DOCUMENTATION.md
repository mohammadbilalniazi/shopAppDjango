Configuration Module Documentation

1. Module Scope

The configuration module handles:
- Organization setup
- Country and location setup
- Branch management
- Branch API for frontend dynamic loading

Primary files:
- configuration/models.py
- configuration/views_organization.py
- configuration/views_location.py
- configuration/views_branch.py
- configuration/views_branch_api.py
- shop/urls.py

2. Main Domain Models

Organization

```python
class Organization(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE, unique=True)
    name = models.CharField(max_length=20, unique=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, null=True, blank=True)
    organization_type = models.CharField(max_length=25)
    created_date = models.DateField()
    is_active = models.BooleanField(default=True)
```

Branch

```python
class Branch(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    branch_type=models.CharField(max_length=20,null=True,blank=True,default="main")
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="branches")
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="created_branches")
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = (("name", "organization"), ("code", "organization"))
```

Auto-created main branch
A post_save signal creates a default branch for new organizations:

```python
@receiver(post_save, sender=Organization)
def create_main_branch_for_organization(sender, instance, created, **kwargs):
    if not created:
        return

    existing = Branch.objects.filter(organization=instance, branch_type__iexact='main').exists()
    if existing:
        return

    Branch.objects.create(
        name='Main',
        code=branch_code or 'MAIN',
        branch_type='main',
        organization=instance,
        created_by=created_by_user,
    )
```

3. Organization APIs And Views

Organization filtering endpoints
From configuration/views_organization.py:
- user_organizations: returns user-visible organizations
- rcvr_org_show: returns possible receiver organizations

```python
@login_required
@api_view(('GET',))
def user_organizations(request):
    self_organization, user_orgs = find_userorganization(request)

    if request.user.is_superuser:
        query_set = Organization.objects.all().order_by('-pk')
    else:
        query_set = user_orgs.order_by('-pk')
```

Organization create/update
Organization creation also creates owner group assignment and initial stock row:

```python
owner,created = User.objects.get_or_create(...)
owner.groups.add(group_obj)
org=Organization(owner=owner,name=name,location=location,...)
org.save()

stock_query=Stock.objects.filter(organization=org)
if stock_query.count()==0:
    stock=Stock(organization=org,current_amount=0)
    stock.save()
```

4. Branch Management

From configuration/views_branch.py, permission check:

```python
def check_admin_permission(user, organization):
    if organization.owner == user:
        return True
    if user.is_superuser:
        return True
    try:
        org_user = OrganizationUser.objects.get(user=user, organization=organization)
        return org_user.role in ['admin', 'superuser', 'owner']
    except OrganizationUser.DoesNotExist:
        return False
```

Branch CRUD endpoints include:
- branch_create
- branch_update
- branch_delete
- branch_toggle_status
- branch_detail
- get_organization_users

5. Location And Country APIs

From configuration/views_location.py:

```python
@api_view(('GET', 'POST'))
def get_countries(request):
    if request.method == 'POST':
        name = data.get('name')
        shortcut = data.get('shortcut')
        if Country.objects.filter(name=name).exists():
            return Response({"error": f"Country '{name}' already exists"}, status=400)
```

```python
@api_view(('GET','POST'))
def show(request,id="all"):
    if request.method == 'POST':
        if Location.objects.filter(country_id=country_id, state=state, city=city).exists():
            return Response({"error": f"Location '{state}, {city}' already exists"}, status=400)
```

6. Main Routes

Registered in shop/urls.py:

```python
path('configuration/organization/form/', views_organization.form, name='organization_form')
path('configuration/organization/form/create/', views_organization.create, name='organization_form_save')
path('configuration/organization/', views_organization.show, name='organization_show')

path('configuration/countries/', views_location.get_countries, name='get_countries')
path('configuration/location/', views_location.show, name='location_show')

path('configuration/branch/', views_branch.branch_select_organization, name='branch_select_organization')
path('configuration/branch/create/', views_branch.branch_create, name='branch_create')
path('configuration/branch/<int:branch_id>/update/', views_branch.branch_update, name='branch_update')
path('configuration/branch/<int:branch_id>/delete/', views_branch.branch_delete, name='branch_delete')

path('api/branches/by-organization/<int:organization_id>/', views_branch_api.get_branches_by_organization, name='get_branches_by_organization')
path('api/branches/user-accessible/', views_branch_api.get_all_user_branches, name='get_all_user_branches')
```

7. Thesis Discussion Points

1. Multi-tenant structure with Organization as top partition.
2. Branch lifecycle and permission rules for delegated admins.
3. Auto-main-branch signal as an onboarding automation strategy.
4. Location normalization with Country and Location tables.
