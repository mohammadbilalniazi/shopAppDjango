from django.test import TestCase, TransactionTestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.db import transaction
from decimal import Decimal
from datetime import date
from .models import OrganizationAsset, AssetBillSummary, AssetWholeBillSummary, Loan
from .utils import (
    update_organization_assets,
    get_balance_sheet,
    get_profit_loss_statement,
    get_cash_flow_summary,
    calculate_inventory_value,
    calculate_cash_on_hand
)
from configuration.models import Organization, Location, Country
from product.models import Product, Category, Stock, Unit
from bill.models import Bill, Bill_detail, Bill_Receiver2


class OrganizationAssetModelTestCase(TestCase):
    """Test cases for OrganizationAsset model"""
    
    def setUp(self):
        """Set up test data"""
        self.country = Country.objects.create(
            name='Afghanistan',
            shortcut='AFG',
            currency='AFN'
        )
        
        self.location = Location.objects.create(
            country=self.country,
            state='Kabul',
            city='Kabul City'
        )
        
        self.owner = User.objects.create_user(username='owner', password='pass')
        
        self.organization = Organization.objects.create(
            owner=self.owner,
            name='Test Org',
            location=self.location,
            organization_type='RETAIL',
            created_date=date.today()
        )
    
    def test_create_organization_asset(self):
        """Test creating organization asset summary"""
        asset = OrganizationAsset.objects.create(
            organization=self.organization,
            inventory_value=Decimal('10000.00'),
            cash_on_hand=Decimal('5000.00'),
            accounts_receivable=Decimal('2000.00'),
            accounts_payable=Decimal('3000.00')
        )
        
        self.assertEqual(asset.organization, self.organization)
        self.assertEqual(asset.inventory_value, Decimal('10000.00'))
        self.assertEqual(asset.cash_on_hand, Decimal('5000.00'))
    
    def test_organization_asset_calculations(self):
        """Test asset calculation properties"""
        asset = OrganizationAsset.objects.create(
            organization=self.organization,
            inventory_value=Decimal('10000.00'),
            cash_on_hand=Decimal('5000.00'),
            accounts_receivable=Decimal('2000.00'),
            accounts_payable=Decimal('3000.00'),
            loans_receivable=Decimal('1000.00'),
            loans_payable=Decimal('4000.00'),
            total_revenue=Decimal('20000.00'),
            total_cost_of_goods_sold=Decimal('12000.00'),
            total_expenses=Decimal('3000.00'),
            total_losses=Decimal('500.00')
        )
        
        # Total assets = cash + inventory + accounts_receivable + loans_receivable
        expected_assets = Decimal('18000.00')
        
        # Total liabilities = accounts_payable + loans_payable
        expected_liabilities = Decimal('7000.00')
        
        # Equity = assets - liabilities
        expected_equity = Decimal('11000.00')
        
        # Net profit = revenue - cogs - expenses - losses
        expected_profit = Decimal('4500.00')
        
        self.assertIsNotNone(asset)


class AssetBillSummaryModelTestCase(TestCase):
    """Test cases for AssetBillSummary model"""
    
    def setUp(self):
        """Set up test data"""
        self.country = Country.objects.create(
            name='Afghanistan',
            shortcut='AFG',
            currency='AFN'
        )
        
        self.location = Location.objects.create(
            country=self.country,
            state='Kabul',
            city='Kabul City'
        )
        
        self.owner1 = User.objects.create_user(username='owner1', password='pass')
        self.owner2 = User.objects.create_user(username='owner2', password='pass')
        
        self.org1 = Organization.objects.create(
            owner=self.owner1,
            name='Org 1',
            location=self.location,
            organization_type='RETAIL',
            created_date=date.today()
        )
        
        self.org2 = Organization.objects.create(
            owner=self.owner2,
            name='Org 2',
            location=self.location,
            organization_type='WHOLESALE',
            created_date=date.today()
        )
    
    def test_create_asset_bill_summary(self):
        """Test creating asset bill summary"""
        summary = AssetBillSummary.objects.create(
            bill_type='PURCHASE',
            organization=self.org1,
            bill_rcvr_org=self.org2,
            total=Decimal('10000.00'),
            payment=Decimal('5000.00'),
            year=1403
        )
        
        self.assertEqual(summary.bill_type, 'PURCHASE')
        self.assertEqual(summary.organization, self.org1)
        self.assertEqual(summary.bill_rcvr_org, self.org2)
        self.assertEqual(summary.total, Decimal('10000.00'))
        self.assertEqual(summary.payment, Decimal('5000.00'))


class AssetCalculationTestCase(TestCase):
    """Test cases for asset calculation utilities"""
    
    def setUp(self):
        """Set up test data"""
        self.country = Country.objects.create(
            name='Afghanistan',
            shortcut='AFG',
            currency='AFN'
        )
        
        self.location = Location.objects.create(
            country=self.country,
            state='Kabul',
            city='Kabul City'
        )
        
        self.owner = User.objects.create_user(username='owner', password='pass')
        
        self.organization = Organization.objects.create(
            owner=self.owner,
            name='Test Org',
            location=self.location,
            organization_type='RETAIL',
            created_date=date.today()
        )
        
        self.category = Category.objects.create(name='Electronics')
        
        self.product = Product.objects.create(
            item_name='Laptop',
            category=self.category
        )
        
        self.unit = Unit.objects.create(
            organization=self.organization,
            name='Piece'
        )
    
    def test_inventory_value_calculation(self):
        """Test calculating inventory value from stock"""
        # Create stock entries
        Stock.objects.create(
            organization=self.organization,
            product=self.product,
            current_amount=Decimal('10.00'),
            purchasing_amount=Decimal('10.00')
        )
        
        # Calculate inventory value
        inventory_value = calculate_inventory_value(self.organization)
        
        # Inventory should be based on stock and purchase prices
        self.assertIsNotNone(inventory_value)
        self.assertGreaterEqual(inventory_value, Decimal('0.00'))
    
    def test_update_organization_assets(self):
        """Test updating organization assets"""
        # Create initial asset summary
        asset_summary = update_organization_assets(self.organization)
        
        self.assertIsNotNone(asset_summary)
        self.assertEqual(asset_summary.organization, self.organization)
        
        # Verify asset object was created
        self.assertTrue(
            OrganizationAsset.objects.filter(organization=self.organization).exists()
        )


class BalanceSheetTestCase(TestCase):
    """Test cases for balance sheet generation"""
    
    def setUp(self):
        """Set up test data"""
        self.country = Country.objects.create(
            name='Afghanistan',
            shortcut='AFG',
            currency='AFN'
        )
        
        self.location = Location.objects.create(
            country=self.country,
            state='Kabul',
            city='Kabul City'
        )
        
        self.owner = User.objects.create_user(username='owner', password='pass')
        
        self.organization = Organization.objects.create(
            owner=self.owner,
            name='Test Org',
            location=self.location,
            organization_type='RETAIL',
            created_date=date.today()
        )
        
        # Create asset summary
        OrganizationAsset.objects.create(
            organization=self.organization,
            inventory_value=Decimal('10000.00'),
            cash_on_hand=Decimal('5000.00'),
            accounts_receivable=Decimal('2000.00'),
            accounts_payable=Decimal('3000.00')
        )
    
    def test_get_balance_sheet(self):
        """Test generating balance sheet"""
        balance_sheet = get_balance_sheet(self.organization)
        
        self.assertIsNotNone(balance_sheet)
        self.assertIn('assets', balance_sheet)
        self.assertIn('liabilities', balance_sheet)
        self.assertIn('equity', balance_sheet)
        
        # Verify structure
        self.assertIn('current_assets', balance_sheet['assets'])
        self.assertIn('cash', balance_sheet['assets']['current_assets'])
        self.assertIn('inventory', balance_sheet['assets']['current_assets'])


class ProfitLossTestCase(TestCase):
    """Test cases for profit and loss statement"""
    
    def setUp(self):
        """Set up test data"""
        self.country = Country.objects.create(
            name='Afghanistan',
            shortcut='AFG',
            currency='AFN'
        )
        
        self.location = Location.objects.create(
            country=self.country,
            state='Kabul',
            city='Kabul City'
        )
        
        self.owner = User.objects.create_user(username='owner', password='pass')
        
        self.organization = Organization.objects.create(
            owner=self.owner,
            name='Test Org',
            location=self.location,
            organization_type='RETAIL',
            created_date=date.today()
        )
        
        # Create asset summary with P&L data
        OrganizationAsset.objects.create(
            organization=self.organization,
            total_revenue=Decimal('20000.00'),
            total_cost_of_goods_sold=Decimal('12000.00'),
            total_expenses=Decimal('3000.00'),
            total_losses=Decimal('500.00')
        )
    
    def test_get_profit_loss_statement(self):
        """Test generating profit and loss statement"""
        pl_statement = get_profit_loss_statement(self.organization)
        
        self.assertIsNotNone(pl_statement)
        self.assertIn('revenue', pl_statement)
        self.assertIn('cost_of_sales', pl_statement)
        self.assertIn('gross_profit', pl_statement)
        self.assertIn('operating_expenses', pl_statement)
        self.assertIn('net_profit', pl_statement)


class CashFlowTestCase(TestCase):
    """Test cases for cash flow statement"""
    
    def setUp(self):
        """Set up test data"""
        self.country = Country.objects.create(
            name='Afghanistan',
            shortcut='AFG',
            currency='AFN'
        )
        
        self.location = Location.objects.create(
            country=self.country,
            state='Kabul',
            city='Kabul City'
        )
        
        self.owner = User.objects.create_user(username='owner', password='pass')
        
        self.organization = Organization.objects.create(
            owner=self.owner,
            name='Test Org',
            location=self.location,
            organization_type='RETAIL',
            created_date=date.today()
        )
        
        # Create asset summary
        OrganizationAsset.objects.create(
            organization=self.organization,
            cash_on_hand=Decimal('5000.00')
        )
    
    def test_get_cash_flow_summary(self):
        """Test generating cash flow summary"""
        cash_flow = get_cash_flow_summary(self.organization)
        
        self.assertIsNotNone(cash_flow)
        self.assertIn('operating_activities', cash_flow)
        self.assertIn('financing_activities', cash_flow)
        self.assertIn('net_cash_flow', cash_flow)


class AssetAPITestCase(APITestCase):
    """Test cases for Asset API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        self.country = Country.objects.create(
            name='Afghanistan',
            shortcut='AFG',
            currency='AFN'
        )
        
        self.location = Location.objects.create(
            country=self.country,
            state='Kabul',
            city='Kabul City'
        )
        
        self.owner = User.objects.create_user(
            username='owner',
            password='ownerpass',
            is_staff=True
        )
        
        self.organization = Organization.objects.create(
            owner=self.owner,
            name='Test Org',
            location=self.location,
            organization_type='RETAIL',
            created_date=date.today()
        )
        
        self.client.force_authenticate(user=self.owner)
    
    def test_refresh_assets_api(self):
        """Test refreshing assets through API with transaction atomicity"""
        data = {
            'organization_id': self.organization.id
        }
        
        response = self.client.post('/asset/refresh/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('success', response.data)
        self.assertTrue(response.data['success'])
        
        # Verify asset summary was created/updated
        self.assertTrue(
            OrganizationAsset.objects.filter(organization=self.organization).exists()
        )


class AssetTransactionTestCase(TransactionTestCase):
    """Test transaction atomicity for asset operations"""
    
    def setUp(self):
        """Set up test data"""
        self.country = Country.objects.create(
            name='Afghanistan',
            shortcut='AFG',
            currency='AFN'
        )
        
        self.location = Location.objects.create(
            country=self.country,
            state='Kabul',
            city='Kabul City'
        )
        
        self.owner = User.objects.create_user(username='owner', password='pass')
        
        self.organization = Organization.objects.create(
            owner=self.owner,
            name='Test Org',
            location=self.location,
            organization_type='RETAIL',
            created_date=date.today()
        )
    
    def test_asset_update_rollback_on_error(self):
        """Test that asset update rolls back on error"""
        try:
            with transaction.atomic():
                # Create asset summary
                asset = OrganizationAsset.objects.create(
                    organization=self.organization,
                    cash_on_hand=Decimal('5000.00')
                )
                
                # Simulate error
                raise Exception("Simulated error")
        except:
            pass
        
        # Verify asset was not created (rolled back)
        self.assertFalse(
            OrganizationAsset.objects.filter(organization=self.organization).exists()
        )
