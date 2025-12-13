"""
URL Route Verification and Fix Script
Checks all admin dashboard quick action URLs
"""
from django.core.management.base import BaseCommand
from django.urls import reverse, NoReverseMatch
from django.test import Client


class Command(BaseCommand):
    help = 'Verify all admin dashboard quick action URLs are accessible'

    def handle(self, *args, **options):
        client = Client()
        
        # URLs from admin dashboard quick actions
        test_urls = [
            ('/user/dashboard/', 'User Management Dashboard'),
            ('/configuration/organization/', 'Organization Management'),
            ('/admin/product/product/', 'Product Management'),
            ('/admin/bill/bill/', 'Bill Management'),
            ('/asset/financial/', 'Financial Dashboard'),
            ('/asset/ledger/', 'Organization Ledger'),
            ('/asset/admin/adjust/', 'Adjust Summaries (Admin only)'),
            ('/user/sessions/', 'Session Management'),
            ('/user/groups/', 'Groups & Permissions'),
            ('/configuration/branch/', 'Branch Management'),
        ]
        
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(self.style.SUCCESS('Admin Dashboard URL Verification'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write('')
        
        passed = 0
        failed = 0
        
        for url, description in test_urls:
            try:
                # Just check if URL resolves (don't actually make request)
                from django.urls import resolve
                resolve(url)
                self.stdout.write(
                    self.style.SUCCESS(f'✓ PASS: {description}') + 
                    f'\n  URL: {url}'
                )
                passed += 1
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ FAIL: {description}') + 
                    f'\n  URL: {url}' +
                    f'\n  Error: {str(e)}'
                )
                failed += 1
            self.stdout.write('')
        
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(f'Total: {len(test_urls)} URLs')
        self.stdout.write(self.style.SUCCESS(f'Passed: {passed}'))
        if failed > 0:
            self.stdout.write(self.style.ERROR(f'Failed: {failed}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Failed: {failed}'))
        self.stdout.write(self.style.SUCCESS('='*60))
