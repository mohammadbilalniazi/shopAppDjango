"""
Management command to check and fix the product_product table
"""
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Check and fix the product_product table schema'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Check current columns
            cursor.execute("DESCRIBE product_product")
            columns = cursor.fetchall()
            column_names = [col[0] for col in columns]
            
            self.stdout.write(f"Current columns in product_product: {column_names}")
            
            # Check for serial_no
            if 'serial_no' not in column_names:
                self.stdout.write(self.style.WARNING("serial_no column is missing!"))
                self.stdout.write("Adding serial_no column...")
                
                try:
                    cursor.execute("""
                        ALTER TABLE product_product 
                        ADD COLUMN serial_no VARCHAR(25) NULL UNIQUE
                    """)
                    self.stdout.write(self.style.SUCCESS("Successfully added serial_no column!"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error adding column: {e}"))
            else:
                self.stdout.write(self.style.SUCCESS("serial_no column already exists!"))
            
            # Check for barcode
            if 'barcode' not in column_names:
                self.stdout.write(self.style.WARNING("barcode column is missing!"))
                self.stdout.write("Adding barcode column...")
                
                try:
                    cursor.execute("""
                        ALTER TABLE product_product 
                        ADD COLUMN barcode VARCHAR(25) NULL UNIQUE
                    """)
                    self.stdout.write(self.style.SUCCESS("Successfully added barcode column!"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error adding column: {e}"))
            else:
                self.stdout.write(self.style.SUCCESS("barcode column already exists!"))
            
            # Check for is_service
            if 'is_service' not in column_names:
                self.stdout.write(self.style.WARNING("is_service column is missing!"))
                self.stdout.write("Adding is_service column...")
                
                try:
                    cursor.execute("""
                        ALTER TABLE product_product 
                        ADD COLUMN is_service BOOLEAN DEFAULT 0
                    """)
                    self.stdout.write(self.style.SUCCESS("Successfully added is_service column!"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error adding column: {e}"))
            else:
                self.stdout.write(self.style.SUCCESS("is_service column already exists!"))
            
            # Check for is_active (should be removed if exists)
            if 'is_active' in column_names:
                self.stdout.write(self.style.WARNING("is_active column exists but is not in the model!"))
                self.stdout.write("This column can be manually removed if not needed.")

