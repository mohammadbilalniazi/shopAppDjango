from django import forms
from django.contrib import admin
from .models import Product, Category

class ProductAdminForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = '__all__'
        widgets = {
            'category': forms.Select(attrs={
                'class': 'vForeignKeyRawIdAdminField',
                'style': 'width: 300px;'
            }),
            'item_name': forms.TextInput(attrs={
                'placeholder': 'Enter product name',
                'style': 'width: 300px;'
            }),
            'model': forms.TextInput(attrs={
                'placeholder': 'Enter product model',
                'style': 'width: 200px;'
            }),
            'barcode': forms.TextInput(attrs={
                'placeholder': 'Enter barcode',
                'style': 'width: 200px;'
            }),
            'serial_no': forms.TextInput(attrs={
                'placeholder': 'Enter serial number',
                'style': 'width: 200px;'
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make category field show a nice dropdown with all categories
        self.fields['category'].queryset = Category.objects.filter(is_active=True).order_by('name')
        self.fields['category'].empty_label = "Select a category"
        
        # Add help text
        self.fields['category'].help_text = 'Select a category for this product. Click the "+" to add a new category.'
        self.fields['item_name'].help_text = 'Enter the name of the product'
        self.fields['barcode'].help_text = 'Enter unique barcode (optional)'