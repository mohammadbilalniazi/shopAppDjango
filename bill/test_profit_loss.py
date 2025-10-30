"""
Unit tests for bill profit/loss functionality
Can be run with: python -m pytest bill/test_profit_loss.py -v
Or with Django: python manage.py test bill.test_profit_loss
"""

from django.test import TestCase
from unittest.mock import Mock, patch, MagicMock
from decimal import Decimal


class HandleProfitLossFunctionTest(TestCase):
    """Unit tests for handle_profit_loss function - uses mocking to avoid DB"""
    
    def setUp(self):
        """Set up mocked objects"""
        # Import here to avoid early database access
        from bill.views_bill import handle_profit_loss
        self.handle_profit_loss = handle_profit_loss
    
    def test_profit_increase_from_zero(self):
        """Test increasing profit from 0"""
        # Create mock bill_detail and bill
        mock_bill_detail = Mock()
        mock_bill_detail.profit = 0
        mock_bill_detail.save = Mock()
        
        mock_bill = Mock()
        mock_bill.profit = 0
        mock_bill.save = Mock()
        
        mock_bill_detail.bill = mock_bill
        
        # Execute function
        result = self.handle_profit_loss(mock_bill_detail, 500, operation='INCREASE')
        
        # Assertions
        self.assertTrue(result)
        self.assertEqual(mock_bill_detail.profit, 500)
        self.assertEqual(mock_bill.profit, 500)
        mock_bill_detail.save.assert_called_once()
        mock_bill.save.assert_called_once()
    
    def test_profit_decrease_loss_tracking(self):
        """Test decreasing profit (loss tracking) - THIS WAS THE BUG"""
        mock_bill_detail = Mock()
        mock_bill_detail.profit = 500
        mock_bill_detail.save = Mock()
        
        mock_bill = Mock()
        mock_bill.profit = 1000
        mock_bill.save = Mock()
        
        mock_bill_detail.bill = mock_bill
        
        # Execute function - subtract 300 as loss
        result = self.handle_profit_loss(mock_bill_detail, 300, operation='DECREASE')
        
        # Assertions - this would have failed with the 'profilt' typo
        self.assertTrue(result)
        self.assertEqual(mock_bill_detail.profit, 200)  # 500 - 300
        self.assertEqual(mock_bill.profit, 700)  # 1000 - 300
        mock_bill_detail.save.assert_called_once()
        mock_bill.save.assert_called_once()
    
    def test_profit_with_none_values(self):
        """Test handling None profit values"""
        mock_bill_detail = Mock()
        mock_bill_detail.profit = None
        mock_bill_detail.save = Mock()
        
        mock_bill = Mock()
        mock_bill.profit = None
        mock_bill.save = Mock()
        
        mock_bill_detail.bill = mock_bill
        
        # Execute function
        result = self.handle_profit_loss(mock_bill_detail, 250, operation='INCREASE')
        
        # Assertions - None should be treated as 0
        self.assertTrue(result)
        self.assertEqual(mock_bill_detail.profit, 250)
        self.assertEqual(mock_bill.profit, 250)
    
    def test_profit_accumulation(self):
        """Test multiple profit increases accumulate"""
        mock_bill_detail = Mock()
        mock_bill_detail.profit = 100
        mock_bill_detail.save = Mock()
        
        mock_bill = Mock()
        mock_bill.profit = 500
        mock_bill.save = Mock()
        
        mock_bill_detail.bill = mock_bill
        
        # First increase
        self.handle_profit_loss(mock_bill_detail, 200, operation='INCREASE')
        self.assertEqual(mock_bill_detail.profit, 300)
        self.assertEqual(mock_bill.profit, 700)
        
        # Second increase
        self.handle_profit_loss(mock_bill_detail, 150, operation='INCREASE')
        self.assertEqual(mock_bill_detail.profit, 450)
        self.assertEqual(mock_bill.profit, 850)
    
    def test_profit_can_go_negative(self):
        """Test that profit can become negative (net loss)"""
        mock_bill_detail = Mock()
        mock_bill_detail.profit = 100
        mock_bill_detail.save = Mock()
        
        mock_bill = Mock()
        mock_bill.profit = 200
        mock_bill.save = Mock()
        
        mock_bill_detail.bill = mock_bill
        
        # Decrease by more than current profit
        result = self.handle_profit_loss(mock_bill_detail, 300, operation='DECREASE')
        
        # Should go negative
        self.assertTrue(result)
        self.assertEqual(mock_bill_detail.profit, -200)  # 100 - 300
        self.assertEqual(mock_bill.profit, -100)  # 200 - 300
    
    def test_save_exception_returns_false(self):
        """Test that save exceptions are handled gracefully"""
        mock_bill_detail = Mock()
        mock_bill_detail.profit = 100
        mock_bill_detail.save = Mock(side_effect=Exception("Database error"))
        
        mock_bill = Mock()
        mock_bill.profit = 200
        mock_bill.save = Mock()
        
        mock_bill_detail.bill = mock_bill
        
        # Execute function
        result = self.handle_profit_loss(mock_bill_detail, 50, operation='INCREASE')
        
        # Should return False on exception
        self.assertFalse(result)
    
    def test_selling_bill_profit_calculation(self):
        """Test realistic SELLING bill profit calculation"""
        mock_bill_detail = Mock()
        mock_bill_detail.profit = 0
        mock_bill_detail.save = Mock()
        
        mock_bill = Mock()
        mock_bill.profit = 0
        mock_bill.save = Mock()
        
        mock_bill_detail.bill = mock_bill
        
        # Selling: price=150, cost=100, quantity=10
        # Profit = (150-100) * 10 = 500
        profit = (150 - 100) * 10
        
        result = self.handle_profit_loss(mock_bill_detail, profit, operation='INCREASE')
        
        self.assertTrue(result)
        self.assertEqual(mock_bill_detail.profit, 500)
        self.assertEqual(mock_bill.profit, 500)
    
    def test_lossdegrade_bill_loss_calculation(self):
        """Test realistic LOSSDEGRADE bill loss calculation"""
        mock_bill_detail = Mock()
        mock_bill_detail.profit = 1000
        mock_bill_detail.save = Mock()
        
        mock_bill = Mock()
        mock_bill.profit = 5000
        mock_bill.save = Mock()
        
        mock_bill_detail.bill = mock_bill
        
        # Loss: item_price=80, quantity=10
        # Loss = 80 * 10 = 800
        loss = 80 * 10
        
        result = self.handle_profit_loss(mock_bill_detail, loss, operation='DECREASE')
        
        self.assertTrue(result)
        self.assertEqual(mock_bill_detail.profit, 200)  # 1000 - 800
        self.assertEqual(mock_bill.profit, 4200)  # 5000 - 800


class GetOppositBillFunctionTest(TestCase):
    """Unit tests for get_opposit_bill function"""
    
    def setUp(self):
        """Import function"""
        from bill.views_bill import get_opposit_bill
        self.get_opposit_bill = get_opposit_bill
    
    def test_all_bill_type_opposites(self):
        """Test all bill type opposites are correct"""
        test_cases = {
            'SELLING': 'PURCHASE',
            'PURCHASE': 'SELLING',
            'PAYMENT': 'RECEIVEMENT',
            'RECEIVEMENT': 'PAYMENT',
            'EXPENSE': 'EXPENSE',
            'LOSSDEGRADE': 'LOSSDEGRADE'
        }
        
        for bill_type, expected_opposite in test_cases.items():
            with self.subTest(bill_type=bill_type):
                result = self.get_opposit_bill(bill_type)
                self.assertEqual(result, expected_opposite)


class ProfitLossIntegrationScenarioTest(TestCase):
    """Integration-style tests for complex profit/loss scenarios"""
    
    def setUp(self):
        """Import function"""
        from bill.views_bill import handle_profit_loss
        self.handle_profit_loss = handle_profit_loss
    
    def test_scenario_profitable_month(self):
        """Test scenario: Multiple profitable sales in a month"""
        mock_bill_detail = Mock()
        mock_bill_detail.profit = 0
        mock_bill_detail.save = Mock()
        
        mock_bill = Mock()
        mock_bill.profit = 0
        mock_bill.save = Mock()
        
        mock_bill_detail.bill = mock_bill
        
        # Sale 1: Profit 500
        self.handle_profit_loss(mock_bill_detail, 500, 'INCREASE')
        self.assertEqual(mock_bill.profit, 500)
        
        # Sale 2: Profit 300
        self.handle_profit_loss(mock_bill_detail, 300, 'INCREASE')
        self.assertEqual(mock_bill.profit, 800)
        
        # Sale 3: Profit 200
        self.handle_profit_loss(mock_bill_detail, 200, 'INCREASE')
        self.assertEqual(mock_bill.profit, 1000)
    
    def test_scenario_loss_event(self):
        """Test scenario: Profitable operations followed by loss"""
        mock_bill_detail = Mock()
        mock_bill_detail.profit = 0
        mock_bill_detail.save = Mock()
        
        mock_bill = Mock()
        mock_bill.profit = 0
        mock_bill.save = Mock()
        
        mock_bill_detail.bill = mock_bill
        
        # Build up profit
        self.handle_profit_loss(mock_bill_detail, 1000, 'INCREASE')
        self.assertEqual(mock_bill.profit, 1000)
        
        # Loss event (damage, theft, etc.)
        self.handle_profit_loss(mock_bill_detail, 300, 'DECREASE')
        self.assertEqual(mock_bill.profit, 700)
        
        # Another sale
        self.handle_profit_loss(mock_bill_detail, 400, 'INCREASE')
        self.assertEqual(mock_bill.profit, 1100)
    
    def test_scenario_net_loss_month(self):
        """Test scenario: Losses exceed profits"""
        mock_bill_detail = Mock()
        mock_bill_detail.profit = 0
        mock_bill_detail.save = Mock()
        
        mock_bill = Mock()
        mock_bill.profit = 0
        mock_bill.save = Mock()
        
        mock_bill_detail.bill = mock_bill
        
        # Small profit
        self.handle_profit_loss(mock_bill_detail, 500, 'INCREASE')
        
        # Large losses
        self.handle_profit_loss(mock_bill_detail, 800, 'DECREASE')
        
        # Result: Net loss
        self.assertEqual(mock_bill.profit, -300)
        self.assertLess(mock_bill.profit, 0, "Should show net loss")
    
    def test_scenario_bill_correction(self):
        """Test scenario: Correcting a mistaken profit entry"""
        mock_bill_detail = Mock()
        mock_bill_detail.profit = 0
        mock_bill_detail.save = Mock()
        
        mock_bill = Mock()
        mock_bill.profit = 0
        mock_bill.save = Mock()
        
        mock_bill_detail.bill = mock_bill
        
        # Add incorrect profit
        self.handle_profit_loss(mock_bill_detail, 1000, 'INCREASE')
        self.assertEqual(mock_bill.profit, 1000)
        
        # Correct by removing it
        self.handle_profit_loss(mock_bill_detail, 1000, 'DECREASE')
        self.assertEqual(mock_bill.profit, 0)
        
        # Add correct profit
        self.handle_profit_loss(mock_bill_detail, 750, 'INCREASE')
        self.assertEqual(mock_bill.profit, 750)


if __name__ == '__main__':
    import django
    from django.conf import settings
    from django.test.utils import get_runner
    
    if not settings.configured:
        settings.configure(
            DEBUG=True,
            DATABASES={'default': {'ENGINE': 'django.db.backends.sqlite3'}},
            INSTALLED_APPS=['bill'],
        )
        django.setup()
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests(["__main__"])
