# Custom admin configuration to control what appears in admin panel
from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import GroupAdmin
from django.contrib.auth.models import Group

# Unregister User model if you don't want it to appear
admin.site.unregister(User)

# Groups will remain automatically registered via django.contrib.auth
# Units and Currency are registered in their respective apps

# Customize admin site headers
admin.site.site_header = 'Supermarket Management Admin'
admin.site.site_title = 'Supermarket Admin'
admin.site.index_title = 'Welcome to Supermarket Management System'

# You can also customize Group admin if needed
admin.site.unregister(Group)

@admin.register(Group)
class CustomGroupAdmin(GroupAdmin):
    list_display = ('name', 'permissions_count')
    search_fields = ('name',)
    filter_horizontal = ('permissions',)
    
    def permissions_count(self, obj):
        return obj.permissions.count()
    permissions_count.short_description = 'Number of Permissions'