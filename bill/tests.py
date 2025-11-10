from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from decimal import Decimal
from datetime import date
from unittest.mock import patch, MagicMock
from .models import Bill, Bill_Receiver2, Bill_detail
from .views_bill import handle_profit_loss, get_opposit_bill
from product.models import Product, Unit, Stock, Product_Detail, Category
from configuration.models import Organization, Location, Country
from asset.models import AssetBillSummary, AssetWholeBillSummary

User = get_user_model()


class HandleProfitLossTestCase(TestCase):
    """Test cases for handle_profit_loss function"""
    
    def setUp(self):
        """Set up test data"""
        # Create user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        # Create country and location
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
        
        # Create owner for organization
        self.owner = User.objects.create_user(
            username='owner',
            password='ownerpass'
        )
        
        # Create organization
        self.org = Organization.objects.create(
            owner=self.owner,
            name='Test Organization',
            location=self.location,
            organization_type='RETAIL',
            created_date=date.today()
        )
        
        # Create category
        self.category = Category.objects.create(
            name='Test Category',
            description='Test Description'
        )
        
        # Create product
        self.product = Product.objects.create(
            item_name='Test Product',
            category=self.category
        )
        
        # Create unit
        self.unit = Unit.objects.create(
            organization=self.org,
            name='Piece'
        )
        
        # Create bill
        self.bill = Bill.objects.create(
            bill_no=1,
            bill_type='SELLING',
            organization=self.org,
            creator=self.user,
            total=1000,
            payment=500,
            year=1403,
            date='1403-07-01',
            profit=0
        )
        
        # Create bill detail
        self.bill_detail = Bill_detail.objects.create(
            bill=self.bill,
            product=self.product,
            unit=self.unit,
            item_amount=10,
            item_price=100,
            return_qty=0,
            profit=0
        )
    
    def test_handle_profit_loss_increase(self):
        """Test INCREASE operation adds profit correctly"""
        profit_to_add = 500
        
        result = handle_profit_loss(
            self.bill_detail,
            profit_to_add,
            operation='INCREASE'
        )
        
        # Refresh from database
        self.bill_detail.refresh_from_db()
        self.bill.refresh_from_db()
        
        # Assertions
        self.assertTrue(result)
        self.assertEqual(self.bill_detail.profit, 500)
        self.assertEqual(self.bill.profit, 500)
    
    def test_handle_profit_loss_decrease(self):
        """Test DECREASE operation subtracts profit correctly (loss tracking)"""
        # Set initial profit
        self.bill.profit = 1000
        self.bill_detail.profit = 500
        self.bill.save()
        self.bill_detail.save()
        
        loss_to_subtract = 300
        
        result = handle_profit_loss(
            self.bill_detail,
            loss_to_subtract,
            operation='DECREASE'
        )
        
        # Refresh from database
        self.bill_detail.refresh_from_db()
        self.bill.refresh_from_db()
        
        # Assertions
        self.assertTrue(result)
        self.assertEqual(self.bill_detail.profit, 200)  # 500 - 300
        self.assertEqual(self.bill.profit, 700)  # 1000 - 300
    
    def test_handle_profit_loss_with_none_values(self):
        """Test handling of None/zero profit values"""
        # Set profit to 0 (since Bill.profit doesn't allow None)
        # But Bill_detail.profit can be None
        self.bill.profit = 0
        self.bill_detail.profit = None
        self.bill.save()
        self.bill_detail.save()
        
        profit_to_add = 250
        
        result = handle_profit_loss(
            self.bill_detail,
            profit_to_add,
            operation='INCREASE'
        )
        
        # Refresh from database
        self.bill_detail.refresh_from_db()
        self.bill.refresh_from_db()
        
        # Assertions
        self.assertTrue(result)
        self.assertEqual(self.bill_detail.profit, 250)
        self.assertEqual(self.bill.profit, 250)
    
    def test_handle_profit_loss_multiple_operations(self):
        """Test multiple profit/loss operations"""
        # First increase
        handle_profit_loss(self.bill_detail, 500, operation='INCREASE')
        self.bill_detail.refresh_from_db()
        self.bill.refresh_from_db()
        self.assertEqual(self.bill.profit, 500)
        
        # Second increase
        handle_profit_loss(self.bill_detail, 300, operation='INCREASE')
        self.bill_detail.refresh_from_db()
        self.bill.refresh_from_db()
        self.assertEqual(self.bill.profit, 800)
        
        # Decrease (loss)
        handle_profit_loss(self.bill_detail, 200, operation='DECREASE')
        self.bill_detail.refresh_from_db()
        self.bill.refresh_from_db()
        self.assertEqual(self.bill.profit, 600)
    
    def test_handle_profit_loss_negative_profit(self):
        """Test that profit can go negative (net loss)"""
        self.bill.profit = 100
        self.bill_detail.profit = 50
        self.bill.save()
        self.bill_detail.save()
        
        loss = 300
        
        handle_profit_loss(self.bill_detail, loss, operation='DECREASE')
        
        self.bill_detail.refresh_from_db()
        self.bill.refresh_from_db()
        
        # Should go negative
        self.assertEqual(self.bill_detail.profit, -250)  # 50 - 300
        self.assertEqual(self.bill.profit, -200)  # 100 - 300


class GetOppositBillTestCase(TestCase):
    """Test cases for get_opposit_bill function"""
    
    def test_selling_opposite_is_purchase(self):
        """Test SELLING opposite is PURCHASE"""
        result = get_opposit_bill('SELLING')
        self.assertEqual(result, 'PURCHASE')
    
    def test_purchase_opposite_is_selling(self):
        """Test PURCHASE opposite is SELLING"""
        result = get_opposit_bill('PURCHASE')
        self.assertEqual(result, 'SELLING')
    
    def test_payment_opposite_is_receivement(self):
        """Test PAYMENT opposite is RECEIVEMENT"""
        result = get_opposit_bill('PAYMENT')
        self.assertEqual(result, 'RECEIVEMENT')
    
    def test_receivement_opposite_is_payment(self):
        """Test RECEIVEMENT opposite is PAYMENT"""
        result = get_opposit_bill('RECEIVEMENT')
        self.assertEqual(result, 'PAYMENT')
    
    def test_expense_opposite_is_expense(self):
        """Test EXPENSE opposite is EXPENSE (self)"""
        result = get_opposit_bill('EXPENSE')
        self.assertEqual(result, 'EXPENSE')
    
    def test_lossdegrade_opposite_is_lossdegrade(self):
        """Test LOSSDEGRADE opposite is LOSSDEGRADE (self)"""
        result = get_opposit_bill('LOSSDEGRADE')
        self.assertEqual(result, 'LOSSDEGRADE')


class BillSignalTestCase(TransactionTestCase):
    """Test cases for Bill model signals"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        # Create country and location
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
        
        # Create owner for organization
        self.owner = User.objects.create_user(
            username='owner',
            password='ownerpass'
        )
        
        self.org = Organization.objects.create(
            owner=self.owner,
            name='Test Org',
            location=self.location,
            organization_type='RETAIL',
            created_date=date.today()
        )
        
        # Create category
        self.category = Category.objects.create(
            name='Test Category',
            description='Test Description'
        )
        
        self.product = Product.objects.create(
            item_name='Test Product',
            category=self.category
        )
        
        self.unit = Unit.objects.create(
            organization=self.org,
            name='Piece'
        )
    
    def test_lossdegrade_bill_creates_asset_summary(self):
        """Test LOSSDEGRADE bill creates AssetBillSummary"""
        bill = Bill.objects.create(
            bill_no=1,
            bill_type='LOSSDEGRADE',
            organization=self.org,
            creator=self.user,
            total=1000,
            payment=0,
            year=1403,
            profit=-500
        )
        
        # Check AssetBillSummary created
        abs_obj = AssetBillSummary.objects.filter(
            organization=self.org,
            bill_type='LOSSDEGRADE',
            year=1403
        ).first()
        
        self.assertIsNotNone(abs_obj)
        self.assertEqual(abs_obj.total, Decimal('1000'))
        self.assertEqual(abs_obj.profit, Decimal('-500'))
    
    def test_expense_bill_creates_asset_summary(self):
        """Test EXPENSE bill creates AssetBillSummary"""
        bill = Bill.objects.create(
            bill_no=1,
            bill_type='EXPENSE',
            organization=self.org,
            creator=self.user,
            total=500,
            payment=500,
            year=1403
        )
        
        # Check AssetBillSummary created
        abs_obj = AssetBillSummary.objects.filter(
            organization=self.org,
            bill_type='EXPENSE',
            year=1403
        ).first()
        
        self.assertIsNotNone(abs_obj)
        self.assertEqual(abs_obj.total, Decimal('500'))
        self.assertEqual(abs_obj.payment, Decimal('500'))
    
    def test_bill_update_updates_asset_summary(self):
        """Test updating bill updates AssetBillSummary deltas"""
        bill = Bill.objects.create(
            bill_no=1,
            bill_type='EXPENSE',
            organization=self.org,
            creator=self.user,
            total=1000,
            payment=500,
            year=1403
        )
        
        # Update bill
        bill.total = 1500
        bill.payment = 800
        bill.save()
        
        # Check summary updated
        abs_obj = AssetBillSummary.objects.get(
            organization=self.org,
            bill_type='EXPENSE',
            year=1403
        )
        
        self.assertEqual(abs_obj.total, Decimal('1500'))
        self.assertEqual(abs_obj.payment, Decimal('800'))
    
    def test_bill_delete_rollbacks_asset_summary(self):
        """Test deleting bill rollbacks AssetBillSummary"""
        bill = Bill.objects.create(
            bill_no=1,
            bill_type='LOSSDEGRADE',
            organization=self.org,
            creator=self.user,
            total=1000,
            payment=0,
            year=1403,
            profit=-300
        )
        
        # Check summary exists
        abs_obj = AssetBillSummary.objects.get(
            organization=self.org,
            bill_type='LOSSDEGRADE',
            year=1403
        )
        self.assertEqual(abs_obj.total, Decimal('1000'))
        
        # Delete bill
        bill.delete()
        
        # Check summary rolled back
        abs_obj.refresh_from_db()
        self.assertEqual(abs_obj.total, Decimal('0'))
        self.assertEqual(abs_obj.profit, Decimal('0'))


class BillDetailSignalTestCase(TransactionTestCase):
    """Test cases for Bill_detail model signals"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        # Create country and location
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
        
        # Create owner for organization
        self.owner = User.objects.create_user(
            username='owner',
            password='ownerpass'
        )
        
        self.org = Organization.objects.create(
            owner=self.owner,
            name='Test Org',
            location=self.location,
            organization_type='RETAIL',
            created_date=date.today()
        )
        
        # Create category
        self.category = Category.objects.create(
            name='Test Category',
            description='Test Description'
        )
        
        self.product = Product.objects.create(
            item_name='Test Product',
            category=self.category
        )
        
        self.unit = Unit.objects.create(
            organization=self.org,
            name='Piece'
        )
        
        # Create product detail
        Product_Detail.objects.create(
            product=self.product,
            organization=self.org,
            purchased_price=80,
            selling_price=100
        )
    
    def test_purchase_bill_detail_increases_stock(self):
        """Test PURCHASE bill detail increases stock"""
        bill = Bill.objects.create(
            bill_no=1,
            bill_type='PURCHASE',
            organization=self.org,
            creator=self.user,
            year=1403
        )
        
        # Create bill detail
        Bill_detail.objects.create(
            bill=bill,
            product=self.product,
            unit=self.unit,
            item_amount=10,
            item_price=80,
            return_qty=0
        )
        
        # Check stock increased
        stock = Stock.objects.get(
            product=self.product,
            organization=self.org
        )
        self.assertEqual(stock.current_amount, Decimal('10'))
    
    def test_selling_bill_detail_decreases_stock(self):
        """Test SELLING bill detail decreases stock"""
        # Set initial stock
        Stock.objects.create(
            product=self.product,
            organization=self.org,
            current_amount=20
        )
        
        bill = Bill.objects.create(
            bill_no=1,
            bill_type='SELLING',
            organization=self.org,
            creator=self.user,
            year=1403
        )
        
        # Create bill detail
        Bill_detail.objects.create(
            bill=bill,
            product=self.product,
            unit=self.unit,
            item_amount=5,
            item_price=100,
            return_qty=0
        )
        
        # Check stock decreased
        stock = Stock.objects.get(
            product=self.product,
            organization=self.org
        )
        self.assertEqual(stock.current_amount, Decimal('15'))  # 20 - 5
    
    def test_lossdegrade_bill_detail_decreases_stock(self):
        """Test LOSSDEGRADE bill detail decreases stock"""
        # Set initial stock
        Stock.objects.create(
            product=self.product,
            organization=self.org,
            current_amount=30
        )
        
        bill = Bill.objects.create(
            bill_no=1,
            bill_type='LOSSDEGRADE',
            organization=self.org,
            creator=self.user,
            year=1403
        )
        
        # Create bill detail
        Bill_detail.objects.create(
            bill=bill,
            product=self.product,
            unit=self.unit,
            item_amount=7,
            item_price=80,
            return_qty=0
        )
        
        # Check stock decreased
        stock = Stock.objects.get(
            product=self.product,
            organization=self.org
        )
        self.assertEqual(stock.current_amount, Decimal('23'))  # 30 - 7
    
    def test_purchase_updates_product_price(self):
        """Test PURCHASE updates purchased_price in Product_Detail"""
        bill = Bill.objects.create(
            bill_no=1,
            bill_type='PURCHASE',
            organization=self.org,
            creator=self.user,
            year=1403
        )
        
        new_price = 85
        
        Bill_detail.objects.create(
            bill=bill,
            product=self.product,
            unit=self.unit,
            item_amount=10,
            item_price=new_price,
            return_qty=0
        )
        
        # Check price updated
        pd = Product_Detail.objects.get(
            product=self.product,
            organization=self.org
        )
        self.assertEqual(pd.purchased_price, new_price)
    
    def test_selling_updates_product_price(self):
        """Test SELLING updates selling_price in Product_Detail"""
        bill = Bill.objects.create(
            bill_no=1,
            bill_type='SELLING',
            organization=self.org,
            creator=self.user,
            year=1403
        )
        
        new_price = 110
        
        Bill_detail.objects.create(
            bill=bill,
            product=self.product,
            unit=self.unit,
            item_amount=5,
            item_price=new_price,
            return_qty=0
        )
        
        # Check price updated
        pd = Product_Detail.objects.get(
            product=self.product,
            organization=self.org
        )
        self.assertEqual(pd.selling_price, new_price)
    
    def test_bill_detail_delete_rollbacks_stock(self):
        """Test deleting bill detail rollbacks stock"""
        # Set initial stock
        Stock.objects.create(
            product=self.product,
            organization=self.org,
            current_amount=20
        )
        
        bill = Bill.objects.create(
            bill_no=1,
            bill_type='PURCHASE',
            organization=self.org,
            creator=self.user,
            year=1403
        )
        
        bill_detail = Bill_detail.objects.create(
            bill=bill,
            product=self.product,
            unit=self.unit,
            item_amount=10,
            item_price=80,
            return_qty=0
        )
        
        # Stock should be 30 now (20 + 10)
        stock = Stock.objects.get(product=self.product, organization=self.org)
        self.assertEqual(stock.current_amount, Decimal('30'))
        
        # Delete bill detail
        bill_detail.delete()
        
        # Stock should be rolled back to 20
        stock.refresh_from_db()
        self.assertEqual(stock.current_amount, Decimal('20'))


class BillReceiver2SignalTestCase(TransactionTestCase):
    """Test cases for Bill_Receiver2 signal integration"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        
        # Create country and location
        self.country = Country.objects.create(
            name='Afghanistan',
            shortcut='AFG',
            currency='AFN'
        )
        
        self.location1 = Location.objects.create(
            country=self.country,
            state='Kabul',
            city='Kabul City'
        )
        
        self.location2 = Location.objects.create(
            country=self.country,
            state='Herat',
            city='Herat City'
        )
        
        # Create owners for organizations
        self.owner1 = User.objects.create_user(
            username='owner1',
            password='ownerpass1'
        )
        
        self.owner2 = User.objects.create_user(
            username='owner2',
            password='ownerpass2'
        )
        
        self.org1 = Organization.objects.create(
            owner=self.owner1,
            name='Organization 1',
            location=self.location1,
            organization_type='RETAIL',
            created_date=date.today()
        )
        
        self.org2 = Organization.objects.create(
            owner=self.owner2,
            name='Organization 2',
            location=self.location2,
            organization_type='WHOLESALE',
            created_date=date.today()
        )
    
    def test_purchase_bill_creates_receiver_summary(self):
        """Test PURCHASE bill with receiver org creates AssetBillSummary"""
        bill = Bill.objects.create(
            bill_no=1,
            bill_type='PURCHASE',
            organization=self.org1,
            creator=self.user,
            total=5000,
            payment=3000,
            year=1403,
            profit=0
        )
        
        Bill_Receiver2.objects.create(
            bill=bill,
            bill_rcvr_org=self.org2,
            is_approved=False
        )
        
        # Check AssetBillSummary created
        abs_obj = AssetBillSummary.objects.filter(
            organization=self.org1,
            bill_rcvr_org=self.org2,
            bill_type='PURCHASE',
            year=1403
        ).first()
        
        self.assertIsNotNone(abs_obj)
        self.assertEqual(abs_obj.total, Decimal('5000'))
        self.assertEqual(abs_obj.payment, Decimal('3000'))
    
    def test_selling_bill_creates_receiver_summary(self):
        """Test SELLING bill with receiver org creates AssetBillSummary"""
        bill = Bill.objects.create(
            bill_no=1,
            bill_type='SELLING',
            organization=self.org1,
            creator=self.user,
            total=8000,
            payment=5000,
            year=1403,
            profit=2000
        )
        
        Bill_Receiver2.objects.create(
            bill=bill,
            bill_rcvr_org=self.org2,
            is_approved=True
        )
        
        # Check AssetBillSummary created
        abs_obj = AssetBillSummary.objects.filter(
            organization=self.org1,
            bill_rcvr_org=self.org2,
            bill_type='SELLING',
            year=1403
        ).first()
        
        self.assertIsNotNone(abs_obj)
        self.assertEqual(abs_obj.profit, Decimal('2000'))
