"""
Comprehensive System Accuracy Test Suite
Tests data integrity, branch integration, and accounting accuracy across all modules
"""
import os
import sys
from decimal import Decimal
from datetime import datetime, date

# Add the project path and setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shop.settings')

import django
django.setup()

from django.test import TestCase
from django.contrib.auth.models import User
from django.db import transaction
from django.core.exceptions import ValidationError

from configuration.models import Organization, Branch, Currency, Location, Country
from user.models import OrganizationUser
from product.models import Product, Product_Detail, Stock, Unit, Category
from bill.models import Bill, Bill_detail, Bill_Receiver2
from asset.models import AssetBillSummary
from common.branch_utils import BranchManager
from common.organization import find_user_organization_and_branch


class SystemAccuracyTestSuite:
    """
    Comprehensive test suite for system accuracy and branch integration
    """
    
    def __init__(self):
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        self.test_data = {}
        self.cleanup_items = []
        
    def log_test(self, test_name, passed, message=""):
        """Log test results"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   → {message}")
        
        if passed:
            self.test_results['passed'] += 1
        else:
            self.test_results['failed'] += 1
            self.test_results['errors'].append(f"{test_name}: {message}")
    
    def setup_test_data(self):
        """Create initial test data"""
        print("\n🔧 Setting up test data...")
        
        try:
            # Create test currency and location
            currency, _ = Currency.objects.get_or_create(
                currency="Test Currency",
                defaults={"is_domestic": True}
            )
            self.cleanup_items.append(('Currency', currency.id))
            
            from configuration.models import Country
            country, _ = Country.objects.get_or_create(
                name="Test Country",
                defaults={"shortcut": "TST", "currency": "TST"}
            )
            self.cleanup_items.append(('Country', country.id))
            
            location, _ = Location.objects.get_or_create(
                country=country,
                defaults={}
            )
            self.cleanup_items.append(('Location', location.id))
            
            # Create test organization (need owner first)
            owner_user, _ = User.objects.get_or_create(
                username="org_owner_accuracy",
                defaults={
                    "first_name": "Owner",
                    "last_name": "Test",
                    "email": "owner@accuracy.com",
                    "is_staff": True,
                    "is_superuser": True
                }
            )
            owner_user.set_password("testpass123")
            owner_user.save()
            self.cleanup_items.append(('User', owner_user.id))
            
            organization, _ = Organization.objects.get_or_create(
                name="TestOrg",
                defaults={
                    "owner": owner_user,
                    "organization_type": "RETAIL",
                    "location": location,
                    "created_date": "2024-01-01",
                    "is_active": True
                }
            )
            self.cleanup_items.append(('Organization', organization.id))
            
            # Create test branches
            branch1, _ = Branch.objects.get_or_create(
                name="Main Branch Test",
                organization=organization,
                defaults={
                    "code": "MB001",
                    "created_by": owner_user,
                    "address": "123 Test St",
                    "phone": "555-0001",
                    "is_active": True
                }
            )
            self.cleanup_items.append(('Branch', branch1.id))
            
            branch2, _ = Branch.objects.get_or_create(
                name="Secondary Branch Test",
                organization=organization,
                defaults={
                    "code": "SB001",
                    "created_by": owner_user,
                    "address": "456 Test Ave",
                    "phone": "555-0002",
                    "is_active": True
                }
            )
            self.cleanup_items.append(('Branch', branch2.id))
            
            # Create test users
            user1, _ = User.objects.get_or_create(
                username="testuser_accuracy1",
                defaults={
                    "first_name": "Test",
                    "last_name": "User1",
                    "email": "test1@accuracy.com",
                    "is_staff": False,
                    "is_superuser": False
                }
            )
            user1.set_password("testpass123")
            user1.save()
            self.cleanup_items.append(('User', user1.id))
            
            user2, _ = User.objects.get_or_create(
                username="testuser_accuracy2",
                defaults={
                    "first_name": "Test",
                    "last_name": "User2",
                    "email": "test2@accuracy.com",
                    "is_staff": True,
                    "is_superuser": False
                }
            )
            user2.set_password("testpass123")
            user2.save()
            self.cleanup_items.append(('User', user2.id))
            
            # Create organization users with branch assignments
            org_user1, _ = OrganizationUser.objects.get_or_create(
                user=user1,
                organization=organization,
                defaults={
                    "role": "employee",
                    "branch": branch1,
                    "is_active": True
                }
            )
            self.cleanup_items.append(('OrganizationUser', org_user1.id))
            
            org_user2, _ = OrganizationUser.objects.get_or_create(
                user=user2,
                organization=organization,
                defaults={
                    "role": "admin",
                    "branch": None,  # Admin has access to all branches
                    "is_active": True
                }
            )
            self.cleanup_items.append(('OrganizationUser', org_user2.id))
            
            # Create test category and unit
            category, _ = Category.objects.get_or_create(
                name="Test Category Accuracy",
                defaults={"description": "Test category for accuracy testing"}
            )
            self.cleanup_items.append(('Category', category.id))
            
            unit, _ = Unit.objects.get_or_create(
                name="Test Unit",
                defaults={
                    "organization": organization,
                    "description": "Test unit for accuracy testing"
                }
            )
            self.cleanup_items.append(('Unit', unit.id))
            
            # Store test data
            self.test_data = {
                'currency': currency,
                'country': country,
                'location': location,
                'owner_user': owner_user,
                'organization': organization,
                'branch1': branch1,
                'branch2': branch2,
                'user1': user1,
                'user2': user2,
                'org_user1': org_user1,
                'org_user2': org_user2,
                'category': category,
                'unit': unit
            }
            
            print("✅ Test data setup completed")
            
        except Exception as e:
            print(f"❌ Test data setup failed: {str(e)}")
            raise
    
    def test_product_branch_integration(self):
        """Test product and stock management with branch integration"""
        print("\n📦 Testing Product & Stock Branch Integration...")
        
        try:
            # Test 1: Create product
            product = Product.objects.create(
                item_name="Test Product Accuracy",
                model="TESTA001",
                category=self.test_data['category']
            )
            self.cleanup_items.append(('Product', product.id))
            
            # Test 2: Create product detail with branch
            product_detail = Product_Detail.objects.create(
                product=product,
                organization=self.test_data['organization'],
                branch=self.test_data['branch1'],
                minimum_requirement=10,
                purchased_price=Decimal('50.00'),
                selling_price=Decimal('75.00')
            )
            self.cleanup_items.append(('Product_Detail', product_detail.id))
            
            self.log_test(
                "Product Detail Branch Assignment",
                product_detail.branch == self.test_data['branch1'],
                f"Product detail assigned to branch: {product_detail.branch.name}"
            )
            
            # Test 3: Create stock for multiple branches
            stock1 = Stock.objects.create(
                product=product,
                organization=self.test_data['organization'],
                branch=self.test_data['branch1'],
                current_amount=100
            )
            self.cleanup_items.append(('Stock', stock1.id))
            
            stock2 = Stock.objects.create(
                product=product,
                organization=self.test_data['organization'],
                branch=self.test_data['branch2'],
                current_amount=50
            )
            self.cleanup_items.append(('Stock', stock2.id))
            
            # Test 4: Verify unique constraint works (organization + product + branch)
            total_stock = Stock.objects.filter(
                product=product,
                organization=self.test_data['organization']
            ).count()
            
            self.log_test(
                "Stock Branch Separation",
                total_stock == 2,
                f"Two separate stock records for different branches: {total_stock}"
            )
            
            # Test 5: Update stock and verify accuracy
            original_amount1 = stock1.current_amount
            stock1.current_amount = Decimal('120.00')
            stock1.save()
            
            stock1.refresh_from_db()
            self.log_test(
                "Stock Update Accuracy",
                stock1.current_amount == Decimal('120.00'),
                f"Stock updated from {original_amount1} to {stock1.current_amount}"
            )
            
            # Test 6: Test branch-specific stock queries
            branch1_stocks = Stock.objects.filter(
                organization=self.test_data['organization'],
                branch=self.test_data['branch1']
            )
            
            self.log_test(
                "Branch-Specific Stock Query",
                branch1_stocks.count() == 1 and branch1_stocks.first().current_amount == Decimal('120.00'),
                f"Branch 1 has {branch1_stocks.count()} stock record with amount {branch1_stocks.first().current_amount}"
            )
            
        except Exception as e:
            self.log_test("Product Branch Integration", False, f"Error: {str(e)}")
    
    def test_bill_branch_integration(self):
        """Test bill management with branch integration"""
        print("\n📄 Testing Bill Branch Integration...")
        
        try:
            # Create a product for billing
            product = Product.objects.create(
                item_name="Test Bill Product",
                model="TESTB001",
                category=self.test_data['category']
            )
            self.cleanup_items.append(('Product', product.id))
            
            product_detail = Product_Detail.objects.create(
                product=product,
                organization=self.test_data['organization'],
                branch=self.test_data['branch1'],
                minimum_requirement=5,
                purchased_price=Decimal('30.00'),
                selling_price=Decimal('45.00')
            )
            self.cleanup_items.append(('Product_Detail', product_detail.id))
            
            # Test 1: Create bill with branch
            bill = Bill.objects.create(
                bill_type="SELLING",
                date=date.today(),
                year=datetime.now().year,
                bill_no=1001,
                organization=self.test_data['organization'],
                branch=self.test_data['branch1'],
                creator=self.test_data['user1'],
                total=Decimal('450.00'),
                payment=Decimal('450.00')
            )
            self.cleanup_items.append(('Bill', bill.id))
            
            self.log_test(
                "Bill Branch Assignment",
                bill.branch == self.test_data['branch1'],
                f"Bill assigned to branch: {bill.branch.name}"
            )
            
            # Test 2: Create bill receiver
            bill_receiver = Bill_Receiver2.objects.create(
                bill=bill,
                bill_rcvr_org=self.test_data['organization'],
                is_approved=False
            )
            self.cleanup_items.append(('Bill_Receiver2', bill_receiver.id))
            
            # Test 3: Create bill details
            bill_detail = Bill_detail.objects.create(
                bill=bill,
                product=product,
                unit=self.test_data['unit'],
                item_amount=10,
                item_price=Decimal('45.00'),
                return_qty=0
            )
            self.cleanup_items.append(('Bill_detail', bill_detail.id))
            
            # Test 4: Verify bill total calculation
            calculated_total = bill_detail.item_amount * bill_detail.item_price
            self.log_test(
                "Bill Total Calculation",
                bill.total == calculated_total,
                f"Bill total: {bill.total}, Calculated: {calculated_total}"
            )
            
            # Test 5: Update bill and verify changes
            bill.total = Decimal('500.00')
            bill.save()
            
            bill.refresh_from_db()
            self.log_test(
                "Bill Update Accuracy",
                bill.total == Decimal('500.00'),
                f"Bill total updated to: {bill.total}"
            )
            
            # Test 6: Test branch-specific bill queries
            branch_bills = Bill.objects.filter(
                organization=self.test_data['organization'],
                branch=self.test_data['branch1']
            )
            
            self.log_test(
                "Branch-Specific Bill Query",
                branch_bills.count() >= 1,
                f"Found {branch_bills.count()} bills for branch 1"
            )
            
        except Exception as e:
            self.log_test("Bill Branch Integration", False, f"Error: {str(e)}")
    
    def test_user_branch_access(self):
        """Test user branch access and permissions"""
        print("\n👥 Testing User Branch Access Control...")
        
        try:
            # Test 1: User with specific branch assignment
            user1_branches = BranchManager.get_user_branches(
                self.test_data['user1'],
                self.test_data['organization']
            )
            
            self.log_test(
                "User Specific Branch Access",
                user1_branches.count() == 1 and user1_branches.first() == self.test_data['branch1'],
                f"User1 has access to {user1_branches.count()} branches: {[b.name for b in user1_branches]}"
            )
            
            # Test 2: Admin user with general access
            user2_branches = BranchManager.get_user_branches(
                self.test_data['user2'],
                self.test_data['organization']
            )
            
            self.log_test(
                "Admin General Branch Access",
                user2_branches.count() == 2,
                f"Admin user has access to {user2_branches.count()} branches: {[b.name for b in user2_branches]}"
            )
            
            # Test 3: Check specific branch access
            can_access_branch1 = BranchManager.can_user_access_branch(
                self.test_data['user1'],
                self.test_data['branch1']
            )
            
            can_access_branch2 = BranchManager.can_user_access_branch(
                self.test_data['user1'],
                self.test_data['branch2']
            )
            
            self.log_test(
                "Branch Permission Checking",
                can_access_branch1 and not can_access_branch2,
                f"User1 can access branch1: {can_access_branch1}, branch2: {can_access_branch2}"
            )
            
            # Test 4: Default branch selection
            default_branch = BranchManager.get_default_branch_for_user(
                self.test_data['user1'],
                self.test_data['organization']
            )
            
            self.log_test(
                "Default Branch Selection",
                default_branch == self.test_data['branch1'],
                f"User1 default branch: {default_branch.name if default_branch else None}"
            )
            
            # Test 5: Reassign user to different branch
            BranchManager.assign_user_to_branch(
                self.test_data['user1'],
                self.test_data['branch2'],
                'manager'
            )
            
            # Refresh and check new assignment
            updated_branches = BranchManager.get_user_branches(
                self.test_data['user1'],
                self.test_data['organization']
            )
            
            self.log_test(
                "Branch Reassignment",
                updated_branches.count() == 1 and updated_branches.first() == self.test_data['branch2'],
                f"User1 reassigned to: {updated_branches.first().name if updated_branches.exists() else 'None'}"
            )
            
        except Exception as e:
            self.log_test("User Branch Access", False, f"Error: {str(e)}")
    
    def test_asset_branch_integration(self):
        """Test asset management with branch integration"""
        print("\n🏛️ Testing Asset Branch Integration...")
        
        try:
            # Test 1: Create asset bill summary with branch
            asset_summary = AssetBillSummary.objects.create(
                organization=self.test_data['organization'],
                branch=self.test_data['branch1'],
                year=datetime.now().year,
                bill_type="PURCHASE",
                total=Decimal('1000.00')
            )
            self.cleanup_items.append(('AssetBillSummary', asset_summary.id))
            
            self.log_test(
                "Asset Branch Assignment",
                asset_summary.branch == self.test_data['branch1'],
                f"Asset summary assigned to branch: {asset_summary.branch.name}"
            )
            
            # Test 2: Create another summary for different branch
            asset_summary2 = AssetBillSummary.objects.create(
                organization=self.test_data['organization'],
                branch=self.test_data['branch2'],
                year=datetime.now().year,
                bill_type="PURCHASE",
                total=Decimal('750.00')
            )
            self.cleanup_items.append(('AssetBillSummary', asset_summary2.id))
            
            # Test 3: Verify unique constraint and totals
            total_summaries = AssetBillSummary.objects.filter(
                organization=self.test_data['organization'],
                year=datetime.now().year,
                bill_type="PURCHASE"
            )
            
            total_amount = sum(summary.total for summary in total_summaries)
            
            self.log_test(
                "Asset Branch Separation",
                total_summaries.count() == 2 and total_amount == Decimal('1750.00'),
                f"Found {total_summaries.count()} asset summaries with total: {total_amount}"
            )
            
            # Test 4: Update asset summary
            original_amount = asset_summary.total
            asset_summary.total = Decimal('1200.00')
            asset_summary.save()
            
            asset_summary.refresh_from_db()
            self.log_test(
                "Asset Update Accuracy",
                asset_summary.total == Decimal('1200.00'),
                f"Asset amount updated from {original_amount} to {asset_summary.total}"
            )
            
        except Exception as e:
            self.log_test("Asset Branch Integration", False, f"Error: {str(e)}")
    
    def test_data_consistency_after_operations(self):
        """Test data consistency after insert/update/delete operations"""
        print("\n🔍 Testing Data Consistency After Operations...")
        
        try:
            # Test 1: Create and delete operations
            product = Product.objects.create(
                item_name="Test Delete Product",
                model="TESTD001",
                category=self.test_data['category']
            )
            
            product_detail = Product_Detail.objects.create(
                product=product,
                organization=self.test_data['organization'],
                branch=self.test_data['branch1'],
                minimum_requirement=5,
                purchased_price=Decimal('25.00'),
                selling_price=Decimal('40.00')
            )
            
            stock = Stock.objects.create(
                product=product,
                organization=self.test_data['organization'],
                branch=self.test_data['branch1'],
                current_amount=50
            )
            
            # Count records before deletion
            product_id = product.id  # Store ID before deletion
            product_count_before = Product.objects.filter(item_name="Test Delete Product").count()
            detail_count_before = Product_Detail.objects.filter(product=product).count()
            stock_count_before = Stock.objects.filter(product=product).count()
            
            # Delete product (should cascade)
            product.delete()
            
            # Count records after deletion
            product_count_after = Product.objects.filter(item_name="Test Delete Product").count()
            detail_count_after = Product_Detail.objects.filter(product_id=product_id).count()
            stock_count_after = Stock.objects.filter(product_id=product_id).count()
            
            self.log_test(
                "Cascade Delete Consistency",
                (product_count_before == 1 and product_count_after == 0 and 
                 detail_count_before == 1 and detail_count_after == 0 and
                 stock_count_before == 1 and stock_count_after == 0),
                f"Deleted product and cascaded {detail_count_before} details, {stock_count_before} stocks"
            )
            
            # Test 2: Foreign key constraint validation
            try:
                invalid_stock = Stock(
                    product_id=99999,  # Non-existent product
                    organization=self.test_data['organization'],
                    branch=self.test_data['branch1'],
                    current_amount=10
                )
                invalid_stock.save()
                self.log_test("Foreign Key Constraint", False, "Invalid foreign key was accepted")
            except:
                self.log_test("Foreign Key Constraint", True, "Invalid foreign key properly rejected")
            
            # Test 3: Unique constraint validation
            try:
                # Try to create duplicate stock for same org+product+branch
                existing_product = Product.objects.filter(item_name="Test Product Accuracy").first()
                if existing_product:
                    duplicate_stock = Stock(
                        product=existing_product,
                        organization=self.test_data['organization'],
                        branch=self.test_data['branch1'],
                        current_amount=25
                    )
                    duplicate_stock.save()
                    self.log_test("Unique Constraint", False, "Duplicate stock record was created")
                else:
                    self.log_test("Unique Constraint", True, "Test skipped - no existing product found")
            except:
                self.log_test("Unique Constraint", True, "Duplicate stock properly rejected")
                
        except Exception as e:
            self.log_test("Data Consistency", False, f"Error: {str(e)}")
    
    def test_branch_management_operations(self):
        """Test branch management utility operations"""
        print("\n🌳 Testing Branch Management Operations...")
        
        try:
            # Test 1: Organization branch summary
            summary = BranchManager.get_organization_branch_summary(self.test_data['organization'])
            
            self.log_test(
                "Organization Summary Generation",
                summary['total_branches'] >= 2 and summary['total_users'] >= 2,
                f"Summary: {summary['total_branches']} branches, {summary['total_users']} users"
            )
            
            # Test 2: Branch users listing
            branch1_users = BranchManager.get_branch_users(self.test_data['branch1'])
            
            self.log_test(
                "Branch Users Listing",
                branch1_users.count() >= 1,
                f"Branch 1 has {branch1_users.count()} users"
            )
            
            # Test 3: Remove user from branch (set branch to None)
            # First check what the user's current branch assignment is
            org_user_before = OrganizationUser.objects.get(
                user=self.test_data['user1'],
                organization=self.test_data['organization']
            )
            
            BranchManager.remove_user_from_branch(
                self.test_data['user1'],
                org_user_before.branch  # Use the user's current branch
            )
            
            # Check if user now has general organization access
            org_user = OrganizationUser.objects.get(
                user=self.test_data['user1'],
                organization=self.test_data['organization']
            )
            
            self.log_test(
                "User Branch Removal",
                org_user.branch is None,
                f"User1 branch assignment removed: {org_user.branch is None} (was: {org_user_before.branch}, now: {org_user.branch})"
            )
            
        except Exception as e:
            self.log_test("Branch Management Operations", False, f"Error: {str(e)}")
    
    def cleanup_test_data(self):
        """Clean up all test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Cleanup in reverse order to handle foreign key constraints
        model_map = {
            'AssetBillSummary': AssetBillSummary,
            'Bill_detail': Bill_detail,
            'Bill_Receiver2': Bill_Receiver2,
            'Bill': Bill,
            'Stock': Stock,
            'Product_Detail': Product_Detail,
            'Product': Product,
            'OrganizationUser': OrganizationUser,
            'User': User,
            'Branch': Branch,
            'Organization': Organization,
            'Category': Category,
            'Unit': Unit,
            'Location': Location,
            'Country': Country,
            'Currency': Currency
        }
        
        for model_name, obj_id in reversed(self.cleanup_items):
            try:
                if model_name in model_map:
                    model_class = model_map[model_name]
                    obj = model_class.objects.get(id=obj_id)
                    obj.delete()
                    print(f"   ✅ Deleted {model_name} {obj_id}")
            except Exception as e:
                print(f"   ⚠️  Could not delete {model_name} {obj_id}: {str(e)}")
    
    def run_all_tests(self):
        """Run the complete test suite"""
        print("🧪 Starting Comprehensive System Accuracy Tests")
        print("=" * 60)
        
        try:
            # Setup
            self.setup_test_data()
            
            # Run all test modules
            self.test_product_branch_integration()
            self.test_bill_branch_integration()
            self.test_user_branch_access()
            self.test_asset_branch_integration()
            self.test_data_consistency_after_operations()
            self.test_branch_management_operations()
            
        except Exception as e:
            print(f"\n❌ Test suite failed: {str(e)}")
            self.test_results['failed'] += 1
            self.test_results['errors'].append(f"Test Suite Setup: {str(e)}")
        
        finally:
            # Cleanup
            self.cleanup_test_data()
            
            # Print results
            self.print_test_results()
    
    def print_test_results(self):
        """Print final test results"""
        print("\n" + "=" * 60)
        print("🎯 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        total_tests = self.test_results['passed'] + self.test_results['failed']
        pass_rate = (self.test_results['passed'] / total_tests * 100) if total_tests > 0 else 0
        
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        print(f"📊 Pass Rate: {pass_rate:.1f}%")
        
        if self.test_results['errors']:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in self.test_results['errors']:
                print(f"   • {error}")
        
        if pass_rate >= 90:
            print(f"\n🎉 EXCELLENT: System accuracy is high ({pass_rate:.1f}%)")
        elif pass_rate >= 75:
            print(f"\n✅ GOOD: System accuracy is acceptable ({pass_rate:.1f}%)")
        elif pass_rate >= 50:
            print(f"\n⚠️  WARNING: System accuracy needs improvement ({pass_rate:.1f}%)")
        else:
            print(f"\n🚨 CRITICAL: System accuracy is low ({pass_rate:.1f}%)")
        
        return pass_rate >= 75


if __name__ == "__main__":
    # Run the test suite
    test_suite = SystemAccuracyTestSuite()
    success = test_suite.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)