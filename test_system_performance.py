"""
System Performance and Load Testing
Tests system performance with concurrent operations and large datasets
"""
import os
import sys
import time
import threading
from decimal import Decimal
from datetime import datetime, date
from concurrent.futures import ThreadPoolExecutor, as_completed

# Add the project path and setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shop.settings')

import django
django.setup()

from django.db import transaction
from configuration.models import Organization, Branch
from user.models import OrganizationUser
from product.models import Product, Stock
from bill.models import Bill, Bill_detail
from django.contrib.auth.models import User


class PerformanceTestSuite:
    """
    Performance and load testing for the system
    """
    
    def __init__(self):
        self.results = {
            'operations': [],
            'errors': [],
            'performance_metrics': {}
        }
        self.test_org = None
        self.test_branches = []
        
    def setup_performance_test_data(self):
        """Setup test data for performance testing"""
        print("🔧 Setting up performance test data...")
        
        # Create test organization
        self.test_org, _ = Organization.objects.get_or_create(
            name="Performance Test Org",
            defaults={
                "type": "RETAIL",
                "is_active": True
            }
        )
        
        # Create multiple branches for load testing
        for i in range(5):
            branch, _ = Branch.objects.get_or_create(
                name=f"Perf Branch {i+1}",
                organization=self.test_org,
                defaults={
                    "address": f"Address {i+1}",
                    "phone": f"555-000{i+1}",
                    "is_active": True
                }
            )
            self.test_branches.append(branch)
        
        print(f"✅ Created organization with {len(self.test_branches)} branches")
    
    def test_concurrent_stock_operations(self, num_threads=10, operations_per_thread=50):
        """Test concurrent stock operations"""
        print(f"\n📦 Testing concurrent stock operations ({num_threads} threads, {operations_per_thread} ops each)...")
        
        # Create test products
        products = []
        for i in range(10):
            product = Product.objects.create(
                item_name=f"Perf Product {i}",
                model=f"PERF{i:03d}"
            )
            products.append(product)
        
        def worker_thread(thread_id):
            """Worker thread for concurrent operations"""
            operations = []
            errors = []
            
            for op_num in range(operations_per_thread):
                try:
                    start_time = time.time()
                    
                    # Pick random product and branch
                    product = products[op_num % len(products)]
                    branch = self.test_branches[op_num % len(self.test_branches)]
                    
                    # Create or update stock
                    stock, created = Stock.objects.get_or_create(
                        product=product,
                        organization=self.test_org,
                        branch=branch,
                        defaults={'current_amount': Decimal('100.00')}
                    )
                    
                    if not created:
                        # Update existing stock
                        stock.current_amount += Decimal('10.00')
                        stock.save()
                    
                    end_time = time.time()
                    operations.append(end_time - start_time)
                    
                except Exception as e:
                    errors.append(f"Thread {thread_id} Op {op_num}: {str(e)}")
            
            return thread_id, operations, errors
        
        # Run concurrent operations
        start_total = time.time()
        
        with ThreadPoolExecutor(max_workers=num_threads) as executor:
            futures = [executor.submit(worker_thread, i) for i in range(num_threads)]
            
            all_operations = []
            all_errors = []
            
            for future in as_completed(futures):
                thread_id, operations, errors = future.result()
                all_operations.extend(operations)
                all_errors.extend(errors)
        
        end_total = time.time()
        
        # Calculate metrics
        total_operations = len(all_operations)
        total_time = end_total - start_total
        avg_time = sum(all_operations) / len(all_operations) if all_operations else 0
        ops_per_second = total_operations / total_time if total_time > 0 else 0
        
        print(f"   📊 Total operations: {total_operations}")
        print(f"   ⏱️  Total time: {total_time:.2f}s")
        print(f"   📈 Average operation time: {avg_time:.4f}s")
        print(f"   🚀 Operations per second: {ops_per_second:.2f}")
        print(f"   ❌ Errors: {len(all_errors)}")
        
        self.results['performance_metrics']['concurrent_stock'] = {
            'total_operations': total_operations,
            'total_time': total_time,
            'avg_operation_time': avg_time,
            'ops_per_second': ops_per_second,
            'error_count': len(all_errors),
            'errors': all_errors[:10]  # Store first 10 errors
        }
        
        # Cleanup
        for product in products:
            Stock.objects.filter(product=product).delete()
            product.delete()
    
    def test_bulk_operations_performance(self, record_count=1000):
        """Test bulk operations performance"""
        print(f"\n📊 Testing bulk operations with {record_count} records...")
        
        # Test 1: Bulk create products
        start_time = time.time()
        
        products_data = []
        for i in range(record_count):
            products_data.append(Product(
                item_name=f"Bulk Product {i}",
                model=f"BULK{i:04d}"
            ))
        
        products = Product.objects.bulk_create(products_data)
        
        bulk_create_time = time.time() - start_time
        print(f"   ✅ Bulk created {len(products)} products in {bulk_create_time:.2f}s")
        
        # Test 2: Bulk create stocks
        start_time = time.time()
        
        stocks_data = []
        for i, product in enumerate(products):
            branch = self.test_branches[i % len(self.test_branches)]
            stocks_data.append(Stock(
                product=product,
                organization=self.test_org,
                branch=branch,
                current_amount=Decimal(str(100 + i % 100))
            ))
        
        stocks = Stock.objects.bulk_create(stocks_data)
        
        bulk_stock_time = time.time() - start_time
        print(f"   ✅ Bulk created {len(stocks)} stocks in {bulk_stock_time:.2f}s")
        
        # Test 3: Bulk update
        start_time = time.time()
        
        Stock.objects.filter(
            product__in=products
        ).update(current_amount=Decimal('200.00'))
        
        bulk_update_time = time.time() - start_time
        print(f"   ✅ Bulk updated stocks in {bulk_update_time:.2f}s")
        
        # Test 4: Complex query performance
        start_time = time.time()
        
        complex_query = Stock.objects.filter(
            organization=self.test_org,
            current_amount__gte=Decimal('150.00')
        ).select_related('product', 'branch').prefetch_related(
            'product__category'
        )
        
        results = list(complex_query)
        
        query_time = time.time() - start_time
        print(f"   ✅ Complex query returned {len(results)} results in {query_time:.4f}s")
        
        # Test 5: Bulk delete
        start_time = time.time()
        
        deleted_stocks = Stock.objects.filter(product__in=products).delete()
        deleted_products = Product.objects.filter(id__in=[p.id for p in products]).delete()
        
        bulk_delete_time = time.time() - start_time
        print(f"   ✅ Bulk deleted in {bulk_delete_time:.2f}s")
        
        self.results['performance_metrics']['bulk_operations'] = {
            'record_count': record_count,
            'bulk_create_products_time': bulk_create_time,
            'bulk_create_stocks_time': bulk_stock_time,
            'bulk_update_time': bulk_update_time,
            'complex_query_time': query_time,
            'bulk_delete_time': bulk_delete_time
        }
    
    def test_database_transaction_performance(self):
        """Test database transaction performance"""
        print("\n💾 Testing database transaction performance...")
        
        operations_count = 100
        
        # Test 1: Individual transactions
        start_time = time.time()
        
        products = []
        for i in range(operations_count):
            with transaction.atomic():
                product = Product.objects.create(
                    item_name=f"Trans Product {i}",
                    model=f"TRANS{i:03d}"
                )
                Stock.objects.create(
                    product=product,
                    organization=self.test_org,
                    branch=self.test_branches[0],
                    current_amount=Decimal('50.00')
                )
                products.append(product)
        
        individual_trans_time = time.time() - start_time
        print(f"   📊 {operations_count} individual transactions: {individual_trans_time:.2f}s")
        
        # Cleanup
        for product in products:
            Stock.objects.filter(product=product).delete()
            product.delete()
        
        # Test 2: Batch transaction
        start_time = time.time()
        
        with transaction.atomic():
            for i in range(operations_count):
                product = Product.objects.create(
                    item_name=f"Batch Product {i}",
                    model=f"BATCH{i:03d}"
                )
                Stock.objects.create(
                    product=product,
                    organization=self.test_org,
                    branch=self.test_branches[0],
                    current_amount=Decimal('50.00')
                )
                products.append(product)
        
        batch_trans_time = time.time() - start_time
        print(f"   📊 {operations_count} operations in single transaction: {batch_trans_time:.2f}s")
        
        # Cleanup
        for product in products:
            Stock.objects.filter(product=product).delete()
            product.delete()
        
        improvement = ((individual_trans_time - batch_trans_time) / individual_trans_time * 100) if individual_trans_time > 0 else 0
        print(f"   🚀 Performance improvement: {improvement:.1f}%")
        
        self.results['performance_metrics']['transaction_performance'] = {
            'operations_count': operations_count,
            'individual_transactions_time': individual_trans_time,
            'batch_transaction_time': batch_trans_time,
            'performance_improvement_percent': improvement
        }
    
    def test_memory_usage_under_load(self):
        """Test memory usage under heavy load"""
        print("\n💾 Testing memory usage under load...")
        
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        print(f"   📊 Initial memory usage: {initial_memory:.2f} MB")
        
        # Create large dataset
        large_dataset = []
        for i in range(5000):
            product = Product.objects.create(
                item_name=f"Memory Test Product {i}",
                model=f"MEM{i:04d}"
            )
            
            # Create stocks for multiple branches
            for branch in self.test_branches:
                Stock.objects.create(
                    product=product,
                    organization=self.test_org,
                    branch=branch,
                    current_amount=Decimal(str(100 + i))
                )
            
            large_dataset.append(product)
            
            # Check memory every 1000 records
            if i % 1000 == 999:
                current_memory = process.memory_info().rss / 1024 / 1024  # MB
                print(f"   📊 Memory after {i+1} records: {current_memory:.2f} MB")
        
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        print(f"   📊 Final memory usage: {final_memory:.2f} MB")
        print(f"   📊 Memory increase: {memory_increase:.2f} MB")
        
        # Cleanup and check memory release
        for product in large_dataset:
            Stock.objects.filter(product=product).delete()
            product.delete()
        
        cleanup_memory = process.memory_info().rss / 1024 / 1024  # MB
        print(f"   📊 Memory after cleanup: {cleanup_memory:.2f} MB")
        
        self.results['performance_metrics']['memory_usage'] = {
            'initial_memory_mb': initial_memory,
            'final_memory_mb': final_memory,
            'memory_increase_mb': memory_increase,
            'cleanup_memory_mb': cleanup_memory,
            'records_created': len(large_dataset) * (len(self.test_branches) + 1)
        }
    
    def cleanup_performance_data(self):
        """Clean up performance test data"""
        print("\n🧹 Cleaning up performance test data...")
        
        try:
            # Delete all stocks and products for the test organization
            Stock.objects.filter(organization=self.test_org).delete()
            Product.objects.filter(item_name__contains="Perf Product").delete()
            Product.objects.filter(item_name__contains="Bulk Product").delete()
            Product.objects.filter(item_name__contains="Trans Product").delete()
            Product.objects.filter(item_name__contains="Batch Product").delete()
            Product.objects.filter(item_name__contains="Memory Test Product").delete()
            
            # Delete branches
            for branch in self.test_branches:
                branch.delete()
            
            # Delete organization
            if self.test_org:
                self.test_org.delete()
            
            print("✅ Performance test data cleaned up")
            
        except Exception as e:
            print(f"⚠️  Error cleaning up: {str(e)}")
    
    def run_performance_tests(self):
        """Run all performance tests"""
        print("🚀 Starting System Performance Tests")
        print("=" * 60)
        
        try:
            # Setup
            self.setup_performance_test_data()
            
            # Run performance tests
            self.test_concurrent_stock_operations()
            self.test_bulk_operations_performance()
            self.test_database_transaction_performance()
            self.test_memory_usage_under_load()
            
        except Exception as e:
            print(f"\n❌ Performance test failed: {str(e)}")
            self.results['errors'].append(f"Performance Test: {str(e)}")
        
        finally:
            # Cleanup
            self.cleanup_performance_data()
            
            # Print results
            self.print_performance_results()
    
    def print_performance_results(self):
        """Print performance test results"""
        print("\n" + "=" * 60)
        print("🎯 PERFORMANCE TEST RESULTS")
        print("=" * 60)
        
        metrics = self.results['performance_metrics']
        
        if 'concurrent_stock' in metrics:
            cs = metrics['concurrent_stock']
            print(f"\n📦 CONCURRENT OPERATIONS:")
            print(f"   Operations/second: {cs['ops_per_second']:.2f}")
            print(f"   Average time per operation: {cs['avg_operation_time']:.4f}s")
            print(f"   Error rate: {cs['error_count']}/{cs['total_operations']} ({cs['error_count']/cs['total_operations']*100:.1f}%)")
        
        if 'bulk_operations' in metrics:
            bo = metrics['bulk_operations']
            print(f"\n📊 BULK OPERATIONS:")
            print(f"   Bulk create rate: {bo['record_count']/bo['bulk_create_products_time']:.0f} records/second")
            print(f"   Complex query time: {bo['complex_query_time']:.4f}s")
            print(f"   Bulk update time: {bo['bulk_update_time']:.4f}s")
        
        if 'transaction_performance' in metrics:
            tp = metrics['transaction_performance']
            print(f"\n💾 TRANSACTION PERFORMANCE:")
            print(f"   Individual transactions: {tp['individual_transactions_time']:.2f}s")
            print(f"   Batch transaction: {tp['batch_transaction_time']:.2f}s")
            print(f"   Performance improvement: {tp['performance_improvement_percent']:.1f}%")
        
        if 'memory_usage' in metrics:
            mu = metrics['memory_usage']
            print(f"\n💾 MEMORY USAGE:")
            print(f"   Memory increase: {mu['memory_increase_mb']:.2f} MB for {mu['records_created']} records")
            print(f"   Memory per record: {mu['memory_increase_mb']/mu['records_created']*1024:.2f} KB")
        
        # Overall assessment
        issues = []
        
        if 'concurrent_stock' in metrics:
            if metrics['concurrent_stock']['ops_per_second'] < 50:
                issues.append("Low concurrent operation performance")
            if metrics['concurrent_stock']['error_count'] > 0:
                issues.append("Concurrent operation errors detected")
        
        if 'memory_usage' in metrics:
            if metrics['memory_usage']['memory_increase_mb'] > 500:
                issues.append("High memory usage detected")
        
        print(f"\n🎯 PERFORMANCE ASSESSMENT:")
        if not issues:
            print("✅ All performance tests passed - system performs well under load")
        else:
            print("⚠️  Performance issues detected:")
            for issue in issues:
                print(f"   • {issue}")
        
        return len(issues) == 0


if __name__ == "__main__":
    # Run performance tests
    perf_suite = PerformanceTestSuite()
    success = perf_suite.run_performance_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)