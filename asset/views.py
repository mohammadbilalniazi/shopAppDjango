from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.contrib.auth.decorators import login_required
from configuration.models import Organization
from decimal import Decimal

# Create your views here.


@login_required(login_url='/admin')
@api_view(['POST'])
def calculate_total_purchased_asset_from_products_using(request):
    """
    Calculate total purchased asset from products using purchased_price and stock current_amount.
    Formula: SUM(current_amount * purchased_price) for all products
    Stores result in AssetWholeBillSummary with bill_type='PURC_ASSET'
    """
    try:
        from product.models import Product_Detail, Stock
        from asset.models import AssetWholeBillSummary
        
        organization_id = request.data.get("organization", None)
        
        if not organization_id:
            return JsonResponse({'success': False, 'message': 'Organization is required'}, status=400)
        
        try:
            organization = Organization.objects.get(id=int(organization_id))
        except Organization.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Organization not found'}, status=404)
        
        # Calculate total purchased asset
        total_purchased_asset = Decimal('0.00')
        products_calculated = 0
        
        # Get all product details for this organization
        product_details = Product_Detail.objects.filter(organization=organization)
        
        for product_detail in product_details:
            product = product_detail.product
            purchased_price = product_detail.purchased_price or Decimal('0.00')
            
            # Get stock for this product and organization
            try:
                stock = Stock.objects.get(product=product, organization=organization)
                current_amount = stock.current_amount or Decimal('0.00')
                
                # Calculate: current_amount * purchased_price
                product_asset_value = current_amount * purchased_price
                total_purchased_asset += product_asset_value
                products_calculated += 1
                
                print(f"Product: {product.item_name}, Stock: {current_amount}, Price: {purchased_price}, Value: {product_asset_value}")
                
            except Stock.DoesNotExist:
                # If no stock exists, skip this product
                print(f"No stock found for product: {product.item_name}")
                continue
        
        # Create or update AssetWholeBillSummary
        # Using 'PURC_ASSET' to match the model choices
        asset_summary, created = AssetWholeBillSummary.objects.update_or_create(
            organization=organization,
            bill_type='PURC_ASSET',
            defaults={
                'total': total_purchased_asset,
                'payment': Decimal('0.00'),  # Not applicable for this calculation
                'profit': 0,
                'currency': 'afg'
            }
        )
        
        action = "created" if created else "updated"
        
        return JsonResponse({
            'success': True,
            'message': f'Purchased asset {action} successfully',
            'data': {
                'organization': organization.name,
                'total_purchased_asset': float(total_purchased_asset),
                'products_calculated': products_calculated,
                'action': action
            }
        })
        
    except Exception as e:
        print("Error in calculate_total_purchased_asset_from_products_using: ", str(e))
        import traceback
        traceback.print_exc()
        return JsonResponse({'success': False, 'message': str(e)}, status=400)
