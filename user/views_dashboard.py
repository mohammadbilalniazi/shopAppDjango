from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.sessions.models import Session
from django.contrib.auth.models import User, Group
from django.utils import timezone
from user.models import OrganizationUser
from configuration.models import Organization


@login_required(login_url='/')
def user_dashboard(request):
    """Main user management dashboard"""
    if not request.user.is_superuser:
        messages.error(request, 'You need superuser permissions to access user management dashboard.')
        return redirect('admin:index')
    
    # Get statistics
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    total_org_users = OrganizationUser.objects.count()
    total_organizations = Organization.objects.count()
    total_groups = Group.objects.count()
    
    # Session statistics
    total_sessions = Session.objects.count()
    active_sessions = Session.objects.filter(expire_date__gt=timezone.now()).count()
    expired_sessions = total_sessions - active_sessions
    
    # Recent activity
    recent_users = User.objects.filter(date_joined__gte=timezone.now() - timezone.timedelta(days=30)).order_by('-date_joined')[:5]
    recent_org_users = OrganizationUser.objects.order_by('-last_updated')[:5]
    
    context = {
        'stats': {
            'total_users': total_users,
            'active_users': active_users,
            'total_org_users': total_org_users,
            'total_organizations': total_organizations,
            'total_groups': total_groups,
            'total_sessions': total_sessions,
            'active_sessions': active_sessions,
            'expired_sessions': expired_sessions
        },
        'recent_users': recent_users,
        'recent_org_users': recent_org_users
    }
    
    return render(request, 'user/user_dashboard.html', context)