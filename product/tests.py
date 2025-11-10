from django.test import TestCase, TransactionTestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.db import IntegrityError, transaction
from decimal import Decimal
from datetime import date
from .models import Product, Unit, Category, Stock, Product_Detail, Store
from configuration.models import Organization, Location, Country


class ProductModelTestCase(TestCase):
    """Test cases for Product model"""
    
    def setUp(self):
        """Set up test data"""
        # Create category
        self.category = Category.objects.create(
            name='Electronics',
            description='Electronic items'
        )
    
    def test_create_product(self):
        """Test creating a product"""
        product = Product.objects.create(
            item_name='Laptop',
            category=self.category,
            model='XPS 13',
            barcode='123456789',
            serial_no='SN001'
        )
        
        self.assertEqual(product.item_name, 'Laptop')
        self.assertEqual(product.category, self.category)
        self.assertEqual(product.model, 'XPS 13')
        self.assertFalse(product.is_service)
        self.assertEqual(str(product), 'Laptop')
    
    def test_product_unique_barcode(self):
        """Test that product barcode must be unique"""
        Product.objects.create(
            item_name='Product 1',
            category=self.category,
            barcode='BARCODE123'
        )
        
        with self.assertRaises(IntegrityError):
            Product.objects.create(
                item_name='Product 2',
                category=self.category,
                barcode='BARCODE123'
            )
    
    def test_product_unique_serial_no(self):
        """Test that product serial number must be unique"""
        Product.objects.create(
            item_name='Product 1',
            category=self.category,
            serial_no='SN123'
        )
        
        with self.assertRaises(IntegrityError):
            Product.objects.create(
                item_name='Product 2',
                category=self.category,
                serial_no='SN123'
            )
    
    def test_product_unique_together_name_model(self):
        """Test that product name + model combination must be unique"""
        Product.objects.create(
            item_name='Phone',
            category=self.category,
            model='iPhone 13'
        )
        
        with self.assertRaises(IntegrityError):
            Product.objects.create(
                item_name='Phone',
                category=self.category,
                model='iPhone 13'
            )
    
    def test_product_service_flag(self):
        """Test creating a service product"""
        service = Product.objects.create(
            item_name='Consultation',
            category=self.category,
            is_service=True
        )
        
        self.assertTrue(service.is_service)


class UnitModelTestCase(TestCase):
    """Test cases for Unit model"""
    
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
    
    def test_create_unit(self):
        """Test creating a unit"""
        unit = Unit.objects.create(
            organization=self.organization,
            name='Kilogram',
            description='Weight measurement'
        )
        
        self.assertEqual(unit.name, 'Kilogram')
        self.assertEqual(unit.organization, self.organization)
        self.assertTrue(unit.is_active)
        self.assertEqual(str(unit), 'Kilogram')


class CategoryModelTestCase(TestCase):
    """Test cases for Category model"""
    
    def test_create_category(self):
        """Test creating a category"""
        category = Category.objects.create(
            name='Furniture',
            description='Home furniture items'
        )
        
        self.assertEqual(category.name, 'Furniture')
        self.assertTrue(category.is_active)
        self.assertEqual(str(category), 'Furniture')
    
    def test_category_unique_name(self):
        """Test that category name must be unique"""
        Category.objects.create(name='Books')
        
        with self.assertRaises(IntegrityError):
            Category.objects.create(name='Books')
    
    def test_category_parent_child(self):
        """Test creating category hierarchy"""
        parent = Category.objects.create(name='Electronics')
        child = Category.objects.create(
            name='Mobile Phones',
            parent=parent
        )
        
        self.assertEqual(child.parent, parent)


class StockModelTestCase(TestCase):
    """Test cases for Stock model"""
    
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
        
        self.category = Category.objects.create(name='General')
        
        self.product = Product.objects.create(
            item_name='Test Product',
            category=self.category
        )
    
    def test_create_stock(self):
        """Test creating a stock entry"""
        stock = Stock.objects.create(
            organization=self.organization,
            product=self.product,
            current_amount=Decimal('100.00'),
            selling_amount=Decimal('50.00'),
            purchasing_amount=Decimal('150.00'),
            loss_amount=Decimal('10.00')
        )
        
        self.assertEqual(stock.organization, self.organization)
        self.assertEqual(stock.product, self.product)
        self.assertEqual(stock.current_amount, Decimal('100.00'))
    
    def test_stock_unique_together(self):
        """Test that organization + product combination must be unique"""
        Stock.objects.create(
            organization=self.organization,
            product=self.product,
            current_amount=Decimal('100.00')
        )
        
        with self.assertRaises(IntegrityError):
            Stock.objects.create(
                organization=self.organization,
                product=self.product,
                current_amount=Decimal('200.00')
            )
    
    def test_stock_calculations(self):
        """Test stock amount calculations"""
        stock = Stock.objects.create(
            organization=self.organization,
            product=self.product,
            current_amount=Decimal('0.00'),
            selling_amount=Decimal('0.00'),
            purchasing_amount=Decimal('0.00'),
            loss_amount=Decimal('0.00')
        )
        
        # Simulate purchase
        stock.purchasing_amount += Decimal('100.00')
        stock.current_amount += Decimal('100.00')
        stock.save()
        
        stock.refresh_from_db()
        self.assertEqual(stock.current_amount, Decimal('100.00'))
        self.assertEqual(stock.purchasing_amount, Decimal('100.00'))
        
        # Simulate sale
        stock.selling_amount += Decimal('30.00')
        stock.current_amount -= Decimal('30.00')
        stock.save()
        
        stock.refresh_from_db()
        self.assertEqual(stock.current_amount, Decimal('70.00'))
        self.assertEqual(stock.selling_amount, Decimal('30.00'))


class ProductDetailModelTestCase(TestCase):
    """Test cases for Product_Detail model"""
    
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
        
        self.category = Category.objects.create(name='General')
        
        self.product = Product.objects.create(
            item_name='Test Product',
            category=self.category
        )
        
        self.unit = Unit.objects.create(
            organization=self.organization,
            name='Piece'
        )
    
    def test_create_product_detail(self):
        """Test creating product detail"""
        product_detail = Product_Detail.objects.create(
            product=self.product,
            organization=self.organization,
            minimum_requirement=10,
            purchased_price=Decimal('50.00'),
            selling_price=Decimal('75.00'),
            unit=self.unit
        )
        
        self.assertEqual(product_detail.product, self.product)
        self.assertEqual(product_detail.organization, self.organization)
        self.assertEqual(product_detail.minimum_requirement, 10)
        self.assertEqual(product_detail.purchased_price, Decimal('50.00'))
        self.assertEqual(product_detail.selling_price, Decimal('75.00'))
    
    def test_product_detail_one_to_one(self):
        """Test that product has one-to-one relationship with product detail"""
        Product_Detail.objects.create(
            product=self.product,
            organization=self.organization
        )
        
        with self.assertRaises(IntegrityError):
            Product_Detail.objects.create(
                product=self.product,
                organization=self.organization
            )


class ProductAPITestCase(APITestCase):
    """Test cases for Product API endpoints"""
    
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
        
        self.category = Category.objects.create(name='Electronics')
        
        self.unit = Unit.objects.create(
            organization=self.organization,
            name='Piece'
        )
        
        self.client.force_authenticate(user=self.owner)


class ProductTransactionTestCase(TransactionTestCase):
    """Test transaction atomicity for product operations"""
    
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
        
        self.category = Category.objects.create(name='General')
    
    def test_product_creation_rollback_on_error(self):
        """Test that product creation rolls back if stock creation fails"""
        initial_product_count = Product.objects.count()
        
        try:
            with transaction.atomic():
                # Create product
                product = Product.objects.create(
                    item_name='Rollback Test',
                    category=self.category
                )
                
                # Simulate error in stock creation
                Stock.objects.create(
                    organization=None,  # Invalid!
                    product=product
                )
        except:
            pass
        
        # Verify product was not created (rolled back)
        self.assertEqual(Product.objects.count(), initial_product_count)
        self.assertFalse(Product.objects.filter(item_name='Rollback Test').exists())
