"""
Context processor to add organizations to all templates
This ensures organization data is always available
"""
from configuration.models import Organization
from common.organization import find_userorganization


def organizations_processor(request):
    """
    Add organizations to context for all templates
    Returns user's organizations or all organizations for superuser
    """
    context = {}
    
    if request.user.is_authenticated:
        try:
            # Get user's organizations using the existing helper
            self_organization, user_orgs = find_userorganization(request)
            
            # For superusers, show all organizations
            if request.user.is_superuser or request.user.is_staff:
                all_organizations = Organization.objects.filter(is_active=True).order_by('name')
            else:
                # For regular users, show only their assigned organizations
                all_organizations = user_orgs.order_by('name')
            
            context['global_organizations'] = all_organizations
            context['global_parent_organization'] = self_organization  # Using self_organization instead
            context['global_organizations_count'] = all_organizations.count()
            
        except Exception as e:
            # Fallback: if error, return empty queryset
            context['global_organizations'] = Organization.objects.none()
            context['global_parent_organization'] = None
            context['global_organizations_count'] = 0
            print(f"⚠️  Organizations context processor error: {e}")
    else:
        # Not authenticated
        context['global_organizations'] = Organization.objects.none()
        context['global_parent_organization'] = None
        context['global_organizations_count'] = 0
    
    return context
