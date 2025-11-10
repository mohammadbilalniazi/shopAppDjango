from django.test import TestCase, TransactionTestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.db import IntegrityError, transaction
from datetime import date
from .models import OrganizationUser
from configuration.models import Organization, Location, Country


class OrganizationUserModelTestCase(TestCase):
    """Test cases for OrganizationUser model"""
    
    def setUp(self):
        """Set up test data"""
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
        
        # Create owner user
        self.owner = User.objects.create_user(
            username='owner',
            password='ownerpass'
        )
        
        # Create organization
        self.organization = Organization.objects.create(
            owner=self.owner,
            name='Test Organization',
            location=self.location,
            organization_type='RETAIL',
            created_date=date.today()
        )
        
        # Create regular user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    
    def test_create_organization_user(self):
        """Test creating an organization user"""
        org_user = OrganizationUser.objects.create(
            user=self.user,
            organization=self.organization,
            role='employee',
            is_active=True
        )
        
        self.assertEqual(org_user.user, self.user)
        self.assertEqual(org_user.organization, self.organization)
        self.assertEqual(org_user.role, 'employee')
        self.assertTrue(org_user.is_active)
        self.assertEqual(str(org_user), f"{self.user.username} - {self.organization.name}")
    
    def test_organization_user_one_to_one(self):
        """Test that one user can only belong to one organization (OneToOne relationship)"""
        # Create first organization user
        OrganizationUser.objects.create(
            user=self.user,
            organization=self.organization,
            role='employee'
        )
        
        # Create second organization
        owner2 = User.objects.create_user(username='owner2', password='pass')
        org2 = Organization.objects.create(
            owner=owner2,
            name='Second Organization',
            location=self.location,
            organization_type='WHOLESALE',
            created_date=date.today()
        )
        
        # Try to add same user to second organization (should fail due to OneToOne)
        with self.assertRaises(IntegrityError):
            OrganizationUser.objects.create(
                user=self.user,
                organization=org2,
                role='admin'
            )
    
    def test_organization_user_roles(self):
        """Test different role assignments"""
        roles = ['employee', 'admin', 'superuser', 'owner']
        
        for i, role in enumerate(roles):
            user = User.objects.create_user(
                username=f'user{i}',
                password='pass'
            )
            org_user = OrganizationUser.objects.create(
                user=user,
                organization=self.organization,
                role=role
            )
            self.assertEqual(org_user.role, role)
    
    def test_organization_user_delete_cascade(self):
        """Test that deleting OrganizationUser also deletes the associated User"""
        org_user = OrganizationUser.objects.create(
            user=self.user,
            organization=self.organization,
            role='employee'
        )
        
        user_id = self.user.id
        
        # Delete organization user
        org_user.delete()
        
        # Verify user was also deleted
        self.assertFalse(User.objects.filter(id=user_id).exists())


class UserAPITestCase(APITestCase):
    """Test cases for User API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
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
        
        # Create owner user
        self.owner = User.objects.create_user(
            username='owner',
            password='ownerpass',
            is_staff=True
        )
        
        # Create organization
        self.organization = Organization.objects.create(
            owner=self.owner,
            name='Test Organization',
            location=self.location,
            organization_type='RETAIL',
            created_date=date.today()
        )
        
        self.client.force_authenticate(user=self.owner)
    
    def test_create_user_via_api(self):
        """Test creating a user through API with transaction atomicity"""
        data = {
            'username': 'newuser',
            'password': 'securepass123',
            'first_name': 'New',
            'last_name': 'User',
            'organization': self.organization.id,
            'role': 'employee'
        }
        
        response = self.client.post('/user/organization_user/insert/', data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify user was created
        user = User.objects.get(username='newuser')
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, 'New')
        self.assertEqual(user.last_name, 'User')
        
        # Verify OrganizationUser was created
        org_user = OrganizationUser.objects.get(user=user)
        self.assertEqual(org_user.organization, self.organization)
        self.assertEqual(org_user.role, 'employee')
    
    def test_create_user_duplicate_username(self):
        """Test that creating user with duplicate username fails"""
        # Create first user
        User.objects.create_user(username='duplicate', password='pass')
        
        data = {
            'username': 'duplicate',
            'password': 'anotherpass',
            'first_name': 'Duplicate',
            'last_name': 'User',
            'organization': self.organization.id,
            'role': 'employee'
        }
        
        response = self.client.post('/user/organization_user/insert/', data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_update_user_via_api(self):
        """Test updating a user through API"""
        # Create user first
        user = User.objects.create_user(
            username='updateme',
            password='oldpass',
            first_name='Old',
            last_name='Name'
        )
        
        org_user = OrganizationUser.objects.create(
            user=user,
            organization=self.organization,
            role='employee'
        )
        
        # Update user
        data = {
            'id': org_user.id,
            'username': 'updateme',
            'password': 'newpass123',
            'first_name': 'Updated',
            'last_name': 'Name',
            'organization': self.organization.id,
            'role': 'admin'
        }
        
        response = self.client.post('/user/organization_user/insert/', data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify changes
        user.refresh_from_db()
        self.assertEqual(user.first_name, 'Updated')
        
        org_user.refresh_from_db()
        self.assertEqual(org_user.role, 'admin')


class UserTransactionTestCase(TransactionTestCase):
    """Test transaction atomicity for user operations"""
    
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
        
        self.owner = User.objects.create_user(
            username='owner',
            password='ownerpass'
        )
        
        self.organization = Organization.objects.create(
            owner=self.owner,
            name='Test Organization',
            location=self.location,
            organization_type='RETAIL',
            created_date=date.today()
        )
    
    def test_user_creation_rollback_on_error(self):
        """Test that user creation rolls back if OrganizationUser creation fails"""
        # Get initial user count
        initial_user_count = User.objects.count()
        
        try:
            with transaction.atomic():
                # Create user
                user = User.objects.create_user(
                    username='rollbacktest',
                    password='pass123'
                )
                
                # Try to create OrganizationUser with invalid data
                # (This should fail and rollback user creation)
                OrganizationUser.objects.create(
                    user=user,
                    organization=None,  # Invalid!
                    role='employee'
                )
        except:
            pass
        
        # Verify user was not created (rolled back)
        self.assertEqual(User.objects.count(), initial_user_count)
        self.assertFalse(User.objects.filter(username='rollbacktest').exists())
    
    def test_one_user_one_organization_validation(self):
        """Test validation that prevents user from belonging to multiple organizations"""
        # Create user in first organization
        user = User.objects.create_user(username='singleorg', password='pass')
        OrganizationUser.objects.create(
            user=user,
            organization=self.organization,
            role='employee'
        )
        
        # Create second organization
        owner2 = User.objects.create_user(username='owner2', password='pass')
        org2 = Organization.objects.create(
            owner=owner2,
            name='Second Org',
            location=self.location,
            organization_type='WHOLESALE',
            created_date=date.today()
        )
        
        # Try to add user to second organization
        with self.assertRaises(IntegrityError):
            OrganizationUser.objects.create(
                user=user,
                organization=org2,
                role='admin'
            )


class UserAuthenticationTestCase(TestCase):
    """Test cases for user authentication"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='authuser',
            password='securepass123',
            is_staff=True
        )
    
    def test_user_login(self):
        """Test user can login with correct credentials"""
        client = APIClient()
        
        # Attempt login
        login_successful = client.login(username='authuser', password='securepass123')
        
        self.assertTrue(login_successful)
    
    def test_user_login_wrong_password(self):
        """Test user cannot login with wrong password"""
        client = APIClient()
        
        # Attempt login with wrong password
        login_successful = client.login(username='authuser', password='wrongpass')
        
        self.assertFalse(login_successful)
    
    def test_user_password_hashing(self):
        """Test that passwords are properly hashed"""
        # Password should be hashed, not stored as plain text
        self.assertNotEqual(self.user.password, 'securepass123')
        
        # But check_password should work
        self.assertTrue(self.user.check_password('securepass123'))
