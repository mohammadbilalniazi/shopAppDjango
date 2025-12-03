from django.contrib import admin
from django.contrib.admin import AdminSite
from django.urls import reverse
from django.utils.html import format_html

class SupermarketAdminSite(AdminSite):
    site_title = 'Supermarket Management System'
    site_header = 'Welcome to Supermarket Management System'
    index_title = 'Supermarket Management Dashboard'
    
    def index(self, request, extra_context=None):
        """
        Display the main admin index page, which lists all of the installed
        apps that have been registered in this site.
        """
        extra_context = extra_context or {}
        
        # Add custom context for supermarket links
        supermarket_links = {
            'product_management': [
                {'name': 'Products List', 'url': reverse('product_show_html'), 'icon': '📋'},
                {'name': 'Add New Product', 'url': reverse('product_form'), 'icon': '➕'},
                {'name': 'Units Management', 'url': '/units/1/', 'icon': '📏'},
                {'name': 'Update Stock', 'url': '/stock/update/', 'icon': '📊'},
            ],
            'bill_management': [
                {'name': 'Bills List', 'url': reverse('bill_show_html'), 'icon': '📄'},
                {'name': 'Purchase/Sell Bills', 'url': reverse('bill_form_sell_purchase'), 'icon': '🛒'},
                {'name': 'Receive/Payment Bills', 'url': reverse('bill_form_receive_payment'), 'icon': '💳'},
                {'name': 'Loss/Degrade Bills', 'url': reverse('bill_form_loss_degrade_product'), 'icon': '📉'},
                {'name': 'Expense Bills', 'url': reverse('expense_form'), 'icon': '💸'},
            ],
            'organization_management': [
                {'name': 'Organizations List', 'url': reverse('organization_show'), 'icon': '🏢'},
                {'name': 'Add Organization', 'url': reverse('organization_form'), 'icon': '➕'},
                {'name': 'User Organizations', 'url': reverse('user_organizations'), 'icon': '👥'},
                {'name': 'Branch Management', 'url': reverse('branch_select_organization'), 'icon': '🏪'},
            ],
            'user_management': [
                {'name': 'Organization Users', 'url': reverse('organization_user_get'), 'icon': '👤'},
                {'name': 'Add User', 'url': reverse('organization_user_form'), 'icon': '➕'},
                {'name': 'Search Users', 'url': '/user/organization_user/search/', 'icon': '🔍'},
            ],
            'financial_reports': [
                {'name': 'Asset Dashboard', 'url': reverse('asset_dashboard'), 'icon': '💼'},
                {'name': 'Finalize Ledger', 'url': '/organizations/finalize-ledger', 'icon': '📈'},
                {'name': 'Calculate Assets', 'url': reverse('calculate_purchased_asset'), 'icon': '💰'},
            ],
            'configuration': [
                {'name': 'Locations', 'url': reverse('location_show'), 'icon': '📍'},
                {'name': 'Countries', 'url': reverse('get_countries'), 'icon': '🌍'},
                {'name': 'Login Form', 'url': reverse('host_to_heroku_login_form'), 'icon': '🔐'},
            ],
        }
        
        extra_context['supermarket_links'] = supermarket_links
        
        return super().index(request, extra_context)

# Create custom admin site instance
supermarket_admin_site = SupermarketAdminSite(name='supermarket_admin')