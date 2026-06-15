from django.conf import settings
from django.contrib import admin
from django.contrib.auth.models import Group, User
from django.contrib.contenttypes.models import ContentType
from django.contrib.sessions.models import Session


# Customize Django Admin Site
admin.site.site_header = getattr(settings, 'ADMIN_SITE_HEADER', 'Welcome to Supermarket Management System')
admin.site.site_title = getattr(settings, 'ADMIN_SITE_TITLE', 'Supermarket Management System')
admin.site.index_title = getattr(settings, 'ADMIN_INDEX_TITLE', 'Supermarket Management Dashboard')


# Unregister Django admin models - we now use custom UI
for model in (User, Group, ContentType, Session):
    try:
        admin.site.unregister(model)
    except admin.sites.NotRegistered:
        pass
