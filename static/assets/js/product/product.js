/**
 * Product Management using Centralized API Manager
 * Updated to use the new APIManager with toast notifications
 */

async function search_product(url = null, search_by_org = false) {
    try {
        // Get form data
        const item_name = document.getElementById("item_name");
        const formdata = {
            "item_name": item_name.value,
            "is_paginate": 1
        };
        
        let organization = null;
        if (search_by_org) {
            organization = document.getElementById("organization");
            if (organization) {
                formdata['organization'] = organization.value;
            }
        }
        
        // Use default URL if none provided
        if (url == null) {
            url = API_ENDPOINTS.PRODUCT.LIST;
        }
        
        // Make API call using centralized API manager
        const response = await apiManager.post(url, formdata, {
            messages: {
                error: 'Failed to load products. Please try again.'
            }
        });
        
        if (!response.success) {
            console.error('Product search failed:', response.error);
            return;
        }
        
        const data = response.data;
        
        // Handle paginated response structure: {count, next, previous, results: {ok, serializer_data}}
        let productData;
        if (data.results && typeof data.results === 'object') {
            // Paginated response
            productData = data.results;
            
            // Check if data is valid
            if (!productData.ok) {
                apiManager.showToast(productData.message || 'No products found', 'warning');
                return;
            }
            
            // Update pagination using paginated response links
            updatePagination(data.previous, data.next, search_by_org);
            
            // Update product list
            updateProductTable(productData.serializer_data);
        } else if (data.ok) {
            // Non-paginated response
            updateProductTable(data.serializer_data || data);
        } else {
            apiManager.showToast(data?.message || 'No products found', 'warning');
            return;
        }
        
    } catch (error) {
        console.error('Search product error:', error);
        apiManager.showToast('An unexpected error occurred while searching products', 'error');
    }
}

/**
 * Update pagination controls
 */
function updatePagination(prv, nex, search_by_org) {
    const pagination = document.querySelector("#pagination_id");
    if (!pagination) return;
    
    pagination.innerHTML = "";
    
    let html = "";
    
    if (nex) {
        html += `<tr><td><a href="${nex}" onclick='search_product(this.getAttribute("href"), ${search_by_org}); return false;' class="btn btn-success" role="button">Next</a></td></tr>`;
    }
    
    if (prv) {
        html += `<tr><td><a href="${prv}" onclick='search_product(this.getAttribute("href"), ${search_by_org}); return false;' class="btn btn-success" role="button">Previous</a></td></tr>`;
    }
    
    if (html) {
        pagination.insertAdjacentHTML('beforeend', html);
    }
}

/**
 * Update product table with search results
 */
function updateProductTable(products) {
    const product_tbody = document.querySelector('#product_body');
    if (!product_tbody) {
        console.error('Product table body not found');
        return;
    }
    
    product_tbody.innerHTML = "";
    
    if (!products || Object.keys(products).length === 0) {
        product_tbody.innerHTML = `
            <tr>
                <td colspan="12" class="text-center py-4">
                    <div class="empty-state">
                        <i class="fas fa-box-open fa-3x mb-3 text-muted"></i>
                        <p>No products found</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Generate product rows
    for (const key in products) {
        const productData = products[key];
        let organization = null;
        
        if (productData.product_detail != undefined && productData.product_detail != null) {
            organization = productData.product_detail.organization;
        }
        
        const row = createProductRow(productData, organization);
        product_tbody.insertAdjacentHTML('beforeend', row);
    }
}

/**
 * Create HTML for a product row
 */
function createProductRow(productData, organization) {
    const product_detail = productData.product_detail;
    let purchased_price = 0;
    let selling_price = 0;
    let minimum_requirement = 0;
    
    if (product_detail) {
        purchased_price = product_detail.purchased_price || 0;
        selling_price = product_detail.selling_price || 0;
        minimum_requirement = product_detail.minimum_requirement || 0;
    }
    
    const imageUrl = productData.img || '/static/assets/images/no-image.png';
    
    return `
        <tr>
            <td data-label="Item Name">
                ${productData.item_name || ''} (${purchased_price})
            </td>
            <td data-label="Model">${productData.model || ''}</td>
            <td data-label="Category">${productData.category || ''}</td>
            <td data-label="Min. Req.">${minimum_requirement}</td>
            <td data-label="Purchase Amt">${productData.purchase_amount || 0}</td>
            <td data-label="Selling Amt">${productData.selling_amount || 0}</td>
            <td data-label="Loss Amt">${productData.loss_amount || 0}</td>
            <td data-label="Current Stock">
                <input type="number" 
                       id="stock_input_${productData.id}" 
                       value="${productData.current_amount || 0}" 
                       class="form-control" 
                       min="0" 
                       step="1" />
            </td>
            <td data-label="Purchase Price">${purchased_price}</td>
            <td data-label="Selling Price">${selling_price}</td>
            <td data-label="Image">
                <img src="${imageUrl}" 
                     alt="${productData.item_name || 'Product'}" 
                     class="product-image"
                     onerror="this.src='/static/assets/images/no-image.png'" />
            </td>
            <td data-label="Actions" class="action-buttons">
                <a href="/product/product/add/${productData.id}" 
                   class="btn btn-success btn-sm" 
                   style="text-decoration: none;">
                    <i class="fas fa-edit"></i> Update
                </a>
                <button class="btn btn-primary btn-sm" 
                        onclick="return update_stock(event, ${productData.id});">
                    <i class="fas fa-warehouse"></i> Update Stock
                </button>
            </td>
        </tr>
    `;
}

/**
 * Update product stock using API Manager
 */
async function update_stock(event, product_id) {
    event.preventDefault();
    
    try {
        const input = document.getElementById(`stock_input_${product_id}`);
        const current_amount = input.value;
        const organizationSelect = document.getElementById("organization");
        
        if (!organizationSelect || !organizationSelect.value) {
            apiManager.showToast("Please select an organization first", 'warning');
            return false;
        }
        
        const organization_id = organizationSelect.value;
        
        if (!current_amount || current_amount < 0) {
            apiManager.showToast("Please enter a valid stock amount", 'warning');
            input.focus();
            return false;
        }
        
        const formData = {
            current_amount: parseInt(current_amount),
            product_id: product_id,
            organization_id: organization_id
        };
        
        // Use API Manager to update stock
        const response = await apiManager.post('/stock/update/', formData, {
            showLoading: true,
            messages: {
                success: `Stock updated successfully for product ${product_id}`,
                error: 'Failed to update stock. Please try again.'
            }
        });
        
        if (response.success) {
            // Briefly highlight the input to show it was updated
            input.style.backgroundColor = 'var(--color-success-lighter)';
            setTimeout(() => {
                input.style.backgroundColor = '';
            }, 1500);
            
            // Show temporary success message
            showTemporaryStockMessage();
        }
        
        return false;
        
    } catch (error) {
        console.error('Update stock error:', error);
        apiManager.showToast('An unexpected error occurred while updating stock', 'error');
        return false;
    }
}

/**
 * Show temporary stock update message
 */
function showTemporaryStockMessage() {
    let message = document.getElementById("update_stock_message");
    
    if (message) {
        message.innerHTML = "Stock information updated successfully";
        message.style.display = 'block';
        message.style.backgroundColor = 'var(--color-success-lighter)';
        message.style.color = 'var(--color-success-darker)';
        message.style.padding = 'var(--space-3)';
        message.style.borderRadius = 'var(--radius-md)';
        message.style.marginTop = 'var(--space-4)';
        
        setTimeout(() => {
            message.style.display = 'none';
            message.innerHTML = "";
        }, 3000);
    }
}

