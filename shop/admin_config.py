from django.contrib import admin
from django.conf import settings

# Customize Django Admin Site
admin.site.site_header = getattr(settings, 'ADMIN_SITE_HEADER', 'Welcome to Supermarket Management System')
admin.site.site_title = getattr(settings, 'ADMIN_SITE_TITLE', 'Supermarket Management System')
admin.site.index_title = getattr(settings, 'ADMIN_INDEX_TITLE', 'Supermarket Management Dashboard')

# Hide models we don't want to show in admin
from django.contrib.auth.models import User, Group
from django.contrib.contenttypes.models import ContentType
from django.contrib.sessions.models import Session

# Unregister Django admin models - we now use custom UI
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

try:
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass

try:
    admin.site.unregister(ContentType)
except admin.sites.NotRegistered:
    pass

try:
    admin.site.unregister(Session)
except admin.sites.NotRegistered:
    pass

print("✅ Admin configuration loaded: Django admin models moved to custom UI")
print("   → User management: /user/organization_user/get/")
print("   → Session management: /user/sessions/")
print("   → Groups & Permissions: /user/groups/")
print("   → Only Currency and Units remain in Django admin")