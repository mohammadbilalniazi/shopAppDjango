#!/usr/bin/env python
"""
Comprehensive Template Testing Suite for Django Shop Application
Tests all templates for proper rendering, branch integration, and functionality
"""

import os
import sys
import django

# Add the project path to Python path
sys.path.append('d:\\projects\\shop')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shop.settings')

# Setup Django
django.setup()

from django.test import TestCase, Client, RequestFactory
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from django.template import Context, Template, TemplateDoesNotExist
from django.http import HttpRequest
from django.contrib.sessions.middleware import SessionMiddleware
from django.contrib.auth.middleware import AuthenticationMiddleware
from decimal import Decimal
import traceback

from configuration.models import Organization, Branch, Currency, Location, Country
from user.models import OrganizationUser
from product.models import Product, Product_Detail, Stock, Unit, Category
from bill.models import Bill, Bill_detail, Bill_Receiver2
from asset.models import AssetBillSummary
from common.branch_utils import BranchManager

class TemplateTestSuite:
    def __init__(self):
        self.client = Client()
        self.factory = RequestFactory()
        self.test_results = []
        self.cleanup_items = []
        self.test_data = {}
        
    def log_test(self, test_name, passed, message):
        """Log test results"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
        print(f"   → {message}")
        self.test_results.append({
            'name': test_name,
            'passed': passed,
            'message': message
        })
    
    def setup_test_data(self):
        """Set up test data for template testing"""
        try:
            print("\n🔧 Setting up template test data...")
            
            # Create Currency
            currency, _ = Currency.objects.get_or_create(
                currency="USD",
                defaults={"is_domestic": True}
            )
            self.cleanup_items.append(('Currency', currency.id))
            
            # Create Country
            country, _ = Country.objects.get_or_create(
                name="USA",
                defaults={
                    "shortcut": "US",
                    "currency": "USD"
                }
            )
            self.cleanup_items.append(('Country', country.id))
            
            # Create Location
            location, _ = Location.objects.get_or_create(
                country=country,
                state="California",
                city="Los Angeles",
                defaults={"is_active": True}
            )
            self.cleanup_items.append(('Location', location.id))
            
            # Create owner user
            owner_user, _ = User.objects.get_or_create(
                username="template_owner",
                defaults={
                    "first_name": "Template",
                    "last_name": "Owner",
                    "email": "owner@template.com",
                    "is_staff": True,
                    "is_superuser": True
                }
            )
            owner_user.set_password("testpass123")
            owner_user.save()
            self.cleanup_items.append(('User', owner_user.id))
            
            # Create Organization
            organization, _ = Organization.objects.get_or_create(
                name="TemplateTestOrg",
                defaults={
                    "owner": owner_user,
                    "organization_type": "RETAIL",
                    "location": location,
                    "created_date": "2024-01-01",
                    "is_active": True
                }
            )
            self.cleanup_items.append(('Organization', organization.id))
            
            # Create branches
            branch1, _ = Branch.objects.get_or_create(
                name="Main Store",
                organization=organization,
                defaults={
                    "code": "MS001",
                    "created_by": owner_user,
                    "address": "123 Main St",
                    "phone": "555-0001",
                    "is_active": True
                }
            )
            self.cleanup_items.append(('Branch', branch1.id))
            
            branch2, _ = Branch.objects.get_or_create(
                name="Second Store",
                organization=organization,
                defaults={
                    "code": "SS001",
                    "created_by": owner_user,
                    "address": "456 Second St",
                    "phone": "555-0002",
                    "is_active": True
                }
            )
            self.cleanup_items.append(('Branch', branch2.id))
            
            # Create test users
            regular_user, _ = User.objects.get_or_create(
                username="template_user",
                defaults={
                    "first_name": "Template",
                    "last_name": "User",
                    "email": "user@template.com",
                    "is_staff": False
                }
            )
            regular_user.set_password("testpass123")
            regular_user.save()
            self.cleanup_items.append(('User', regular_user.id))
            
            admin_user, _ = User.objects.get_or_create(
                username="template_admin",
                defaults={
                    "first_name": "Template",
                    "last_name": "Admin",
                    "email": "admin@template.com",
                    "is_staff": True
                }
            )
            admin_user.set_password("testpass123")
            admin_user.save()
            self.cleanup_items.append(('User', admin_user.id))
            
            # Create organization users
            org_user, _ = OrganizationUser.objects.get_or_create(
                user=regular_user,
                organization=organization,
                defaults={
                    "role": "employee",
                    "branch": branch1,
                    "is_active": True
                }
            )
            self.cleanup_items.append(('OrganizationUser', org_user.id))
            
            org_admin, _ = OrganizationUser.objects.get_or_create(
                user=admin_user,
                organization=organization,
                defaults={
                    "role": "admin",
                    "is_active": True
                }
            )
            self.cleanup_items.append(('OrganizationUser', org_admin.id))
            
            # Create category and unit
            category, _ = Category.objects.get_or_create(
                name="Electronics",
                defaults={"description": "Electronic items"}
            )
            self.cleanup_items.append(('Category', category.id))
            
            unit, _ = Unit.objects.get_or_create(
                name="Piece",
                defaults={
                    "organization": organization,
                    "description": "Individual pieces"
                }
            )
            self.cleanup_items.append(('Unit', unit.id))
            
            # Create product
            product, _ = Product.objects.get_or_create(
                item_name="Test Phone",
                defaults={
                    "category": category,
                    "model": "TP-2024",
                    "is_service": False
                }
            )
            self.cleanup_items.append(('Product', product.id))
            
            # Create product detail
            product_detail, _ = Product_Detail.objects.get_or_create(
                product=product,
                defaults={
                    "organization": organization,
                    "branch": branch1,
                    "minimum_requirement": 10,
                    "purchased_price": Decimal('100.00'),
                    "selling_price": Decimal('150.00'),
                    "unit": unit
                }
            )
            self.cleanup_items.append(('Product_Detail', product_detail.id))
            
            # Create stock
            stock, _ = Stock.objects.get_or_create(
                product=product,
                organization=organization,
                branch=branch1,
                defaults={"current_amount": Decimal('50.00')}
            )
            self.cleanup_items.append(('Stock', stock.id))
            
            # Store test data
            self.test_data = {
                'currency': currency,
                'country': country,
                'location': location,
                'owner_user': owner_user,
                'organization': organization,
                'branch1': branch1,
                'branch2': branch2,
                'regular_user': regular_user,
                'admin_user': admin_user,
                'org_user': org_user,
                'org_admin': org_admin,
                'category': category,
                'unit': unit,
                'product': product,
                'product_detail': product_detail,
                'stock': stock
            }
            
            print("✅ Template test data setup completed")
            return True
            
        except Exception as e:
            print(f"❌ Template test data setup failed: {str(e)}")
            traceback.print_exc()
            return False
    
    def test_template_existence(self):
        """Test if all template files exist and are accessible"""
        print("\n📁 Testing Template File Existence...")
        
        template_dirs = [
            'templates',
            'templates/admin',
            'templates/asset',
            'templates/bill',
            'templates/configurations',
            'templates/includes',
            'templates/products',
            'templates/user'
        ]
        
        base_templates = [
            'master.html',
            'home.html',
            'footer.html'
        ]
        
        # Test base template directory
        for template in base_templates:
            try:
                template_path = os.path.join('templates', template)
                exists = os.path.exists(template_path)
                self.log_test(
                    f"Base Template: {template}",
                    exists,
                    f"Template file {'found' if exists else 'not found'}: {template_path}"
                )
            except Exception as e:
                self.log_test(f"Base Template: {template}", False, f"Error: {str(e)}")
        
        # Test template directories
        for template_dir in template_dirs:
            try:
                exists = os.path.exists(template_dir)
                if exists:
                    files = os.listdir(template_dir)
                    file_count = len([f for f in files if f.endswith('.html')])
                    self.log_test(
                        f"Template Directory: {template_dir}",
                        True,
                        f"Directory exists with {file_count} HTML files"
                    )
                else:
                    self.log_test(
                        f"Template Directory: {template_dir}",
                        False,
                        f"Directory not found: {template_dir}"
                    )
            except Exception as e:
                self.log_test(f"Template Directory: {template_dir}", False, f"Error: {str(e)}")
    
    def test_template_rendering(self):
        """Test template rendering with context data"""
        print("\n🎨 Testing Template Rendering...")
        
        # Test master.html
        try:
            context = {
                'user': self.test_data['regular_user'],
                'organization': self.test_data['organization'],
                'branch': self.test_data['branch1'],
                'title': 'Template Test'
            }
            
            rendered = render_to_string('master.html', context)
            
            self.log_test(
                "Master Template Rendering",
                len(rendered) > 0 and 'html' in rendered.lower(),
                f"Master template rendered successfully ({len(rendered)} characters)"
            )
        except TemplateDoesNotExist:
            self.log_test("Master Template Rendering", False, "master.html template not found")
        except Exception as e:
            self.log_test("Master Template Rendering", False, f"Rendering error: {str(e)}")
        
        # Test home.html
        try:
            context = {
                'user': self.test_data['regular_user'],
                'organization': self.test_data['organization'],
                'products': [self.test_data['product']],
                'recent_bills': [],
                'stock_summary': {'total_products': 1, 'total_stock': 50}
            }
            
            rendered = render_to_string('home.html', context)
            
            self.log_test(
                "Home Template Rendering",
                len(rendered) > 0,
                f"Home template rendered successfully ({len(rendered)} characters)"
            )
        except TemplateDoesNotExist:
            self.log_test("Home Template Rendering", False, "home.html template not found")
        except Exception as e:
            self.log_test("Home Template Rendering", False, f"Rendering error: {str(e)}")
    
    def test_template_context_processors(self):
        """Test template context processors and branch integration"""
        print("\n🔄 Testing Template Context Processors...")
        
        try:
            # Create a simple mock request
            request = self.factory.get('/')
            request.user = self.test_data['regular_user']
            request.session = {}
            
            # Test if branch context is available
            from common.context_processors import branch_context
            context = branch_context(request)
            
            self.log_test(
                "Branch Context Processor",
                'user_branches' in context or 'current_branch' in context,
                f"Branch context available with keys: {list(context.keys())}"
            )
            
        except Exception as e:
            self.log_test("Branch Context Processor", False, f"Error: {str(e)}")
    
    def test_product_templates(self):
        """Test product-related templates"""
        print("\n🛍️ Testing Product Templates...")
        
        # Test product listing template
        try:
            context = {
                'products': [self.test_data['product']],
                'organization': self.test_data['organization'],
                'branch': self.test_data['branch1'],
                'user': self.test_data['regular_user']
            }
            
            # Try to render product templates if they exist
            product_template_files = []
            if os.path.exists('templates/products'):
                product_template_files = [f for f in os.listdir('templates/products') if f.endswith('.html')]
            
            if product_template_files:
                for template_file in product_template_files[:3]:  # Test first 3 templates
                    try:
                        template_path = f'products/{template_file}'
                        rendered = render_to_string(template_path, context)
                        self.log_test(
                            f"Product Template: {template_file}",
                            len(rendered) > 0,
                            f"Template rendered successfully ({len(rendered)} characters)"
                        )
                    except Exception as e:
                        self.log_test(f"Product Template: {template_file}", False, f"Error: {str(e)}")
            else:
                self.log_test("Product Templates", False, "No product templates found in templates/products/")
                
        except Exception as e:
            self.log_test("Product Templates", False, f"Error: {str(e)}")
    
    def test_bill_templates(self):
        """Test bill-related templates"""
        print("\n📄 Testing Bill Templates...")
        
        try:
            context = {
                'bills': [],
                'organization': self.test_data['organization'],
                'branch': self.test_data['branch1'],
                'user': self.test_data['regular_user']
            }
            
            # Check for bill templates
            bill_template_files = []
            if os.path.exists('templates/bill'):
                bill_template_files = [f for f in os.listdir('templates/bill') if f.endswith('.html')]
            
            if bill_template_files:
                for template_file in bill_template_files[:3]:  # Test first 3 templates
                    try:
                        template_path = f'bill/{template_file}'
                        rendered = render_to_string(template_path, context)
                        self.log_test(
                            f"Bill Template: {template_file}",
                            len(rendered) > 0,
                            f"Template rendered successfully ({len(rendered)} characters)"
                        )
                    except Exception as e:
                        self.log_test(f"Bill Template: {template_file}", False, f"Error: {str(e)}")
            else:
                self.log_test("Bill Templates", False, "No bill templates found in templates/bill/")
                
        except Exception as e:
            self.log_test("Bill Templates", False, f"Error: {str(e)}")
    
    def test_user_templates(self):
        """Test user-related templates"""
        print("\n👥 Testing User Templates...")
        
        try:
            context = {
                'users': [self.test_data['regular_user']],
                'organization': self.test_data['organization'],
                'branches': [self.test_data['branch1'], self.test_data['branch2']],
                'user': self.test_data['admin_user']
            }
            
            # Check for user templates
            user_template_files = []
            if os.path.exists('templates/user'):
                user_template_files = [f for f in os.listdir('templates/user') if f.endswith('.html')]
            
            if user_template_files:
                for template_file in user_template_files[:3]:  # Test first 3 templates
                    try:
                        template_path = f'user/{template_file}'
                        rendered = render_to_string(template_path, context)
                        self.log_test(
                            f"User Template: {template_file}",
                            len(rendered) > 0,
                            f"Template rendered successfully ({len(rendered)} characters)"
                        )
                    except Exception as e:
                        self.log_test(f"User Template: {template_file}", False, f"Error: {str(e)}")
            else:
                self.log_test("User Templates", False, "No user templates found in templates/user/")
                
        except Exception as e:
            self.log_test("User Templates", False, f"Error: {str(e)}")
    
    def test_configuration_templates(self):
        """Test configuration-related templates"""
        print("\n⚙️ Testing Configuration Templates...")
        
        try:
            context = {
                'organization': self.test_data['organization'],  # Include organization with ID
                'organizations': [self.test_data['organization']],
                'branches': [self.test_data['branch1'], self.test_data['branch2']],
                'locations': [self.test_data['location']],
                'user': self.test_data['admin_user']
            }
            
            # Check for configuration templates
            config_template_files = []
            if os.path.exists('templates/configurations'):
                config_template_files = [f for f in os.listdir('templates/configurations') if f.endswith('.html')]
            
            if config_template_files:
                for template_file in config_template_files[:3]:  # Test first 3 templates
                    try:
                        template_path = f'configurations/{template_file}'
                        rendered = render_to_string(template_path, context)
                        self.log_test(
                            f"Configuration Template: {template_file}",
                            len(rendered) > 0,
                            f"Template rendered successfully ({len(rendered)} characters)"
                        )
                    except Exception as e:
                        self.log_test(f"Configuration Template: {template_file}", False, f"Error: {str(e)}")
            else:
                self.log_test("Configuration Templates", False, "No configuration templates found in templates/configurations/")
                
        except Exception as e:
            self.log_test("Configuration Templates", False, f"Error: {str(e)}")
    
    def test_asset_templates(self):
        """Test asset-related templates"""
        print("\n🏛️ Testing Asset Templates...")
        
        try:
            context = {
                'assets': [],
                'organization': self.test_data['organization'],
                'branch': self.test_data['branch1'],
                'user': self.test_data['admin_user']
            }
            
            # Check for asset templates
            asset_template_files = []
            if os.path.exists('templates/asset'):
                asset_template_files = [f for f in os.listdir('templates/asset') if f.endswith('.html')]
            
            if asset_template_files:
                for template_file in asset_template_files[:3]:  # Test first 3 templates
                    try:
                        template_path = f'asset/{template_file}'
                        rendered = render_to_string(template_path, context)
                        self.log_test(
                            f"Asset Template: {template_file}",
                            len(rendered) > 0,
                            f"Template rendered successfully ({len(rendered)} characters)"
                        )
                    except Exception as e:
                        self.log_test(f"Asset Template: {template_file}", False, f"Error: {str(e)}")
            else:
                self.log_test("Asset Templates", False, "No asset templates found in templates/asset/")
                
        except Exception as e:
            self.log_test("Asset Templates", False, f"Error: {str(e)}")
    
    def test_template_branch_integration(self):
        """Test if templates properly handle branch-specific data"""
        print("\n🌳 Testing Template Branch Integration...")
        
        try:
            # Test template rendering with branch-specific context
            context = {
                'user': self.test_data['regular_user'],
                'organization': self.test_data['organization'],
                'current_branch': self.test_data['branch1'],
                'user_branches': [self.test_data['branch1']],
                'products': [self.test_data['product']],
                'stock': [self.test_data['stock']]
            }
            
            # Test if templates can handle branch context
            template_string = """
            {% if current_branch %}
                <p>Current Branch: {{ current_branch.name }}</p>
            {% endif %}
            {% if user_branches %}
                <ul>
                {% for branch in user_branches %}
                    <li>{{ branch.name }}</li>
                {% endfor %}
                </ul>
            {% endif %}
            """
            
            template = Template(template_string)
            rendered = template.render(Context(context))
            
            branch_mentioned = self.test_data['branch1'].name in rendered
            
            self.log_test(
                "Template Branch Context",
                branch_mentioned,
                f"Branch context properly handled: {'Yes' if branch_mentioned else 'No'}"
            )
            
        except Exception as e:
            self.log_test("Template Branch Integration", False, f"Error: {str(e)}")
    
    def cleanup_test_data(self):
        """Clean up template test data"""
        print("\n🧹 Cleaning up template test data...")
        
        model_map = {
            'OrganizationUser': OrganizationUser,
            'User': User,
            'Branch': Branch,
            'Organization': Organization,
            'Stock': Stock,
            'Product_Detail': Product_Detail,
            'Product': Product,
            'Unit': Unit,
            'Category': Category,
            'Location': Location,
            'Country': Country,
            'Currency': Currency,
        }
        
        for model_name, obj_id in reversed(self.cleanup_items):
            try:
                model_class = model_map.get(model_name)
                if model_class:
                    obj = model_class.objects.get(id=obj_id)
                    obj.delete()
                    print(f"   ✅ Deleted {model_name} {obj_id}")
            except Exception as e:
                print(f"   ⚠️  Could not delete {model_name} {obj_id}: {str(e)}")
    
    def run_all_tests(self):
        """Run all template tests"""
        print("🧪 Starting Comprehensive Template Testing")
        print("=" * 60)
        
        # Setup test data
        if not self.setup_test_data():
            return False
        
        try:
            # Run all tests
            self.test_template_existence()
            self.test_template_rendering()
            self.test_template_context_processors()
            self.test_product_templates()
            self.test_bill_templates()
            self.test_user_templates()
            self.test_configuration_templates()
            self.test_asset_templates()
            self.test_template_branch_integration()
            
        except Exception as e:
            print(f"\n❌ Template testing failed: {str(e)}")
            traceback.print_exc()
            return False
        
        finally:
            self.cleanup_test_data()
        
        # Calculate results
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['passed'])
        pass_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print("\n" + "=" * 60)
        print("🎯 TEMPLATE TEST RESULTS SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {total_tests - passed_tests}")
        print(f"📊 Pass Rate: {pass_rate:.1f}%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result['passed']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   • {test['name']}: {test['message']}")
        
        # Overall assessment
        if pass_rate >= 90:
            print(f"\n🎉 EXCELLENT: Template system is highly functional ({pass_rate:.1f}%)")
        elif pass_rate >= 75:
            print(f"\n✅ GOOD: Template system is functional ({pass_rate:.1f}%)")
        elif pass_rate >= 50:
            print(f"\n⚠️  WARNING: Template system has issues ({pass_rate:.1f}%)")
        else:
            print(f"\n🚨 CRITICAL: Template system needs attention ({pass_rate:.1f}%)")
        
        return pass_rate >= 75

if __name__ == "__main__":
    print("✅ Django template environment initialized")
    print("Starting template testing suite...")
    
    suite = TemplateTestSuite()
    success = suite.run_all_tests()
    
    exit_code = 0 if success else 1
    sys.exit(exit_code)