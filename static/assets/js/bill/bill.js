let data;
let product_data;
let selling_price_obj = {};
let purchasing_price_obj = {};
let purchased_price;

/**
 * Helper function to fetch and cache unit data.
 */
async function get_units() {
    const id = "all";
    const unit_url = `/units/${id}/`;
    let unit_data = localStorage.getItem("unit_data");

    if (!unit_data) {
        console.log("Fetching unit data...");
        let response = await call_shirkat(unit_url, 'GET');
        unit_data = response.data;
        localStorage.setItem("unit_data", JSON.stringify(unit_data));
    } else {
        unit_data = JSON.parse(unit_data);
    }
}

/**
 * Fetches products and updates local storage.
 */
async function get_products(organization = "all", change_price = true) {
    const url = `/products/`;
    let storedProductData = localStorage.getItem("product_data");

    if (storedProductData) {
        product_data = JSON.parse(storedProductData);
    } else {
        console.log("Fetching product data...");
        const postData={'organization_id':organization}
        let response = await call_shirkat(url, 'POST',postData);
        product_data = response.data;
        localStorage.setItem("product_data", JSON.stringify(product_data));
    }

    for (const key in product_data) {
        let product = product_data[key];
        if (product.product_detail) {
            selling_price_obj[product.id] = product.product_detail.selling_price;
            purchasing_price_obj[product.id] = product.product_detail.purchased_price;
        } else {
            product_data[key]['product_detail'] = { selling_price: 0, purchased_price: 0, minimum_requirement: 0 };
            selling_price_obj[product.id] = 0;
            purchasing_price_obj[product.id] = 0;
        }
    }
    localStorage.setItem("selling_price_obj",JSON.stringify(selling_price_obj));
    localStorage.setItem("purchasing_price_obj",JSON.stringify(purchasing_price_obj));
    localStorage.setItem("product_data", JSON.stringify(product_data));
    add_events_to_elements(change_price);
}

/**
 * Changes the price field based on the selected bill type.
 */
function change_price_field(item_db_id, index, bill_type_field) {
    const item_price = document.getElementsByClassName("item_price")[index];
    
    if (!item_price) {
        console.warn(`Price field not found at index ${index}`);
        return;
    }
    
    // Load price objects from localStorage
    selling_price_obj = JSON.parse(localStorage.getItem("selling_price_obj")) || {};
    purchasing_price_obj = JSON.parse(localStorage.getItem("purchasing_price_obj")) || {};
    
    const productId = parseInt(item_db_id);
    
    if (bill_type_field.value === "SELLING") {
        const sellingPrice = selling_price_obj[productId];
        if (sellingPrice !== undefined && sellingPrice !== null) {
            item_price.value = sellingPrice;
            console.log(`Set selling price for product ${productId}: ${sellingPrice}`);
        } else {
            console.warn(`Selling price not found for product ${productId}`);
            item_price.value = 0;
        }
    } else if (bill_type_field.value === "PURCHASE") {
        const purchasingPrice = purchasing_price_obj[productId];
        if (purchasingPrice !== undefined && purchasingPrice !== null) {
            item_price.value = purchasingPrice;
            console.log(`Set purchasing price for product ${productId}: ${purchasingPrice}`);
        } else {
            console.warn(`Purchasing price not found for product ${productId}`);
            item_price.value = 0;
        }
    } else {
        console.warn(`Unknown bill type: ${bill_type_field.value}`);
    }

    generate_total_amount_bill();
}


/**
 * Adds event listeners to dynamically created elements.
 */
function add_events_to_elements(change_price = true) {
    console.log("Adding events to elements...");
    
    try {
        let item_amount = document.getElementsByClassName("item_amount");
        let item_price = document.getElementsByClassName("item_price");
        let return_qty = document.getElementsByClassName("return_qty");
        let bill_type = document.getElementById("bill_type");
        let item_name = document.getElementsByClassName("item_name");

        for (let i = 0; i < item_amount.length; i++) {
            item_amount[i].addEventListener("keyup", generate_total_amount_bill);
            return_qty[i].addEventListener("input", generate_total_amount_bill);
            item_name[i].addEventListener("change", e => change_price_field(e.target.value, i, bill_type));
            item_price[i].addEventListener("keyup", generate_total_amount_bill);

            if (change_price && item_price[i].value <= 0) {
                change_price_field(item_name[i].value, i, bill_type);
            }
        }
        
    } catch (err) {
        console.error("Error adding events to elements:", err);
    }
}

/**
 * Deletes a row from the bill details table.
 */
function remove_row(btn, bill_detail_id) {
    if (parseInt(bill_detail_id) !== 0) {
        bill_detail_delete(parseInt(bill_detail_id));
    }
    btn.closest("tr").remove();
    generate_total_amount_bill();
    add_events_to_elements();
}

/**
 * Dynamically adds a new row to the bill details table.
 */
async function add_row() {
    function createElement(tag, props = {}, children = []) {
        const el = document.createElement(tag);
        Object.entries(props).forEach(([key, value]) => {
            if (key === 'className') {
                el.className = value;
            } else if (key in el) {
                el[key] = value;
            } else {
                el.setAttribute(key, value);
            }
        });
        children.forEach(child => el.appendChild(child));
        return el;
    }

    const billTypeElement = document.getElementById("bill_type");
    const tableBody = document.getElementById("table_body");
    const row = createElement("tr");
    tableBody.appendChild(row);

    // Prepare product data
    let productData = {};
    try {
        productData = JSON.parse(localStorage.getItem("product_data")) || {};
    } catch (e) {
        console.error("Invalid product_data JSON", e);
    }

    // Create product <select> (will be converted to searchable Select2)
    const selectId = `item_name_select_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const selectItemName = createElement("select", {
        id: selectId,
        className: "item_name form-control",
        name: "item_name",
        required: true
    });

    // Add placeholder option
    const placeholderOption = createElement("option", {
        value: "",
        innerText: "Select item...",
        disabled: true,
        selected: true
    });
    selectItemName.appendChild(placeholderOption);

    // Populate all options
    for (const key in productData) {
        if (Object.hasOwn(productData, key)) {
            const product = productData[key];
            const label = `${product.item_name} ${product.product_detail?.purchased_price || ""}`;
            const option = createElement("option", {
                value: product.id,
                innerText: label
            });
            selectItemName.appendChild(option);
        }
    }
    // Unit select
    const selectUnit = createElement("select", {
        className: "unit form-control",
        name: "unit",
        required: true
    });

    try {
        const unitData = JSON.parse(localStorage.getItem("unit_data")) || {};
        for (const key in unitData) {
            if (Object.hasOwn(unitData, key)) {
                const unit = unitData[key];
                const option = createElement("option", {
                    value: unit.id,
                    innerText: unit.name
                });
                selectUnit.appendChild(option);
            }
        }
    } catch (e) {
        console.error("Invalid unit_data JSON", e);
    }

    // Build the row - only selectItemName, no search input
    row.appendChild(createElement("td", {}, [selectItemName]));
    const amountInput = createElement("input", { type: "number", className: "item_amount form-control", required: true });
    row.appendChild(createElement("td", {}, [amountInput, selectUnit]));
    const priceInput = createElement("input", { type: "number", className: "item_price form-control", min: "0", step: ".001", required: true });
    row.appendChild(createElement("td", {}, [priceInput]));
    const returnQtyInput = createElement("input", { type: "number", className: "return_qty form-control", value: 0, required: true });
    const hiddenIdInput = createElement("input", { type: "hidden", className: "bill_detail_id", required: true });
    row.appendChild(createElement("td", {}, [returnQtyInput, hiddenIdInput]));
    const removeBtn = createElement("input", {
        type: "button",
        value: "remove",
        style:"background-color:red",
        className: "remove_btn btn btn-danger",
        onclick: () => remove_row(row, 0)
    });
    row.appendChild(createElement("td", {}, [removeBtn]));

    // Event bindings
    selectItemName.addEventListener("change", e => {
        if (e.target.value) {
            // Get the correct row index
            const rowIndex = Array.from(tableBody.getElementsByTagName('tr')).indexOf(row);
            change_price_field(e.target.value, rowIndex, billTypeElement);
        }
    });

    priceInput.addEventListener("keyup", generate_total_amount_bill);
    amountInput.addEventListener("keyup", generate_total_amount_bill);
    returnQtyInput.addEventListener("input", generate_total_amount_bill);

    // ✅ Initialize Select2 on the dynamically created item_name select
    if (typeof jQuery !== 'undefined' && typeof jQuery.fn.select2 !== 'undefined') {
        jQuery(selectItemName).select2({
            placeholder: 'Select or search item...',
            allowClear: true,
            width: '100%',
            theme: 'default'
        });
        console.log(`✓ Select2 initialized on ${selectId}`);
        
        // ✅ Listen for Select2 selection event to auto-fill price
        jQuery(selectItemName).on('select2:select', function(e) {
            const selectedProductId = e.params.data.id;
            if (selectedProductId) {
                const rowIndex = Array.from(tableBody.getElementsByTagName('tr')).indexOf(row);
                change_price_field(selectedProductId, rowIndex, billTypeElement);
            }
        });
    }

    add_events_to_elements();
}

document.addEventListener("DOMContentLoaded", () => {
  init();
});



function getElement(id) {
  return document.getElementById(id);
}

async function init() {
  const addNawajans = getElement("addnawajans");
  addNawajans.disabled = true;
  await get_products(getElement("organization").value, false);
  await get_units();
  addNawajans.disabled = false;
}

try {
  if (getElement("detail_or_update")?.value === "0") {
      select_rcvr_orgs();
  }
} catch (ex) {
  console.log("detail_or_update not found");
}

function generate_total_amount_bill() {
  console.log("Generating total amount bill...");

  const itemAmounts = document.getElementsByClassName("item_amount");
  const itemPrices = document.getElementsByClassName("item_price");
  const returnQtys = document.getElementsByClassName("return_qty");
  const total = getElement("total");

  let offset = 0;

  for (let i = 0; i < itemAmounts.length; i++) {
      let amount = parseFloat(itemAmounts[i].value) || 0;
      let retQty = parseFloat(returnQtys[i].value) || 0;
      let price = parseFloat(itemPrices[i].value) || 0;

      if (retQty > amount) {
          returnQtys[i].value = 0;
          retQty = 0;
      }

      offset += (amount - retQty) * price;
  }

  total.value = offset.toFixed(2);
  return offset > 0;
}

function total_and_paid_validation() {
  const totalBill = parseFloat(getElement("total").value) || 0;
  const totalPayment = parseFloat(getElement("total_payment").value) || 0;
  const billType = getElement("bill_type").value;

  if (["PAYMENT", "RECEIVEMENT", "EXPENSE"].includes(billType)) {
      return true;
  }

  if (totalPayment > totalBill) {
      return false;
  }

  return true;
}

async function submit_validation_function() {
  const itemNames = [...document.getElementsByClassName("item_name")].map(input => input.value);
  const duplicateItems = itemNames.filter((v, i, a) => a.indexOf(v) !== i);

  if (duplicateItems.length > 0 && !confirm("Item is repeated. Do you want to add it again?")) {
      return false;
  }

  return generate_total_amount_bill() && total_and_paid_validation();
}

try{
  document.getElementById("bill").addEventListener("submit",async function(e){
    e.preventDefault();
    date=document.getElementById("date");
    organization=document.getElementById("organization");
    bill_rcvr_org=document.getElementById("bill_rcvr_org");
    creator=document.getElementById("creator");
    total=document.getElementById("total");
    total_payment=document.getElementById("total_payment");
    bill_no=document.getElementById("bill_no");
    bill_id=document.getElementById("bill_id");
    bill_type=document.getElementById("bill_type");
    is_approved=document.getElementById("is_approved");
    // status=document.getElementById("status");
    status_bill=document.getElementById("status");
    approval_date=document.getElementById("approval_date");
    approval_user=document.getElementById("approval_user");

    item_name=document.getElementsByClassName("item_name");
    item_price=document.getElementsByClassName("item_price");
    item_amount=document.getElementsByClassName("item_amount");
    unit=document.getElementsByClassName("unit");
    return_qty=document.getElementsByClassName("return_qty");
    bill_detail_id=document.getElementsByClassName("bill_detail_id");
    
    item_name_list=[];
    item_price_list=[];
    item_amount_list=[];
    unit_list=[];
    return_qty_list=[]
    bill_detail_id_list=[]
    for(let i=0; i<item_amount.length; i++)
    {
        item_name_list.push(item_name[i].value);
        
        item_price_list.push(item_price[i].value);
        
        item_amount_list.push(item_amount[i].value);
        
        unit_list.push(unit[i].value);
        
        return_qty_list.push(return_qty[i].value);
        bill_detail_id_list.push(bill_detail_id[i].value)
    }

    bill_obj={
        
        "id":bill_id.value,
        "date":date.value,
        "organization":organization.value,
        "creator":creator.value,
        "total":total.value,
        "total_payment":total_payment.value,
        "bill_no":bill_no.value,
        "bill_type":bill_type.value,
        "bill_rcvr_org":bill_rcvr_org.value,
        "is_approved":is_approved.value,
        "status":status_bill.value,
        "approval_date":approval_date.value,
        "approval_user":approval_user.value,
        
        "item_name":item_name_list,
        "item_price":item_price_list,
        "item_amount":item_amount_list,
        "unit":unit_list,
        "return_qty":return_qty_list,
        "bill_detail_id":bill_detail_id_list,
    }
    flag=await submit_validation_function();
     

     

     console.log("flage ",flag," bill_obj ",bill_obj)
     // return ;
     if(flag)
     {
         let response=await call_shirkat(
                "/bill/insert/",
                 "POST",
                 JSON.stringify(bill_obj)
             );
         console.log("response bill insert",response)
         if(response.status==200 || response.status==201){
             if(response.data.ok)
             {
                 show_message("bill Created ","success");
                 var host=location.protocol + '//' + location.host
                  window.location.href=host+"/bill/detail/"+response.data.bill_id+"/";
             }
             else
             {
                 show_message(response.data.message,"error");   
             }
         }
         else{
             show_message("bill Not Created ","error")
         }
     }   
     else{
         show_message("No Validated Form ","error")
     }
 });
}  
catch(e)
{
 console.log("getElementById(bill) error")
}

async function select_rcvr_orgs() {
  try {
    const rcvrOrgSpan = getElement("rcvr_org_span");
    rcvrOrgSpan.innerHTML = "";

    const selectRcvrOrg = document.createElement("select");
    selectRcvrOrg.id = "bill_rcvr_org";
    selectRcvrOrg.name = "bill_rcvr_org";
    selectRcvrOrg.required = true;

    const response = await fetch("/organizations/all/");
    const data = await response.json();

    data.forEach(org => {
      const option = document.createElement("option");
      option.value = org.id;
      option.innerText = org.name;
      selectRcvrOrg.appendChild(option);
    });

    rcvrOrgSpan.appendChild(selectRcvrOrg);

    // ✅ Initialize Select2 if available
    if (typeof jQuery !== 'undefined' && typeof jQuery.fn.select2 !== 'undefined') {
      jQuery(selectRcvrOrg).select2({
        placeholder: 'Select Receiver Organization',
        allowClear: false,
        width: '100%',
        theme: 'default'
      });
      console.log('✓ Dynamically created bill_rcvr_org Select2 initialized');
    }

    // ✅ Attach event listener after element is in the DOM
    selectRcvrOrg.addEventListener("change", () => {
      generate_total_amount_bill();
      select_bill_no();
    });

  } catch (e) {
    console.log("Error selecting receiver organizations", e);
  }
}

getElement("total_payment")?.addEventListener("input", total_and_paid_validation);

try {
  getElement("bill_type").addEventListener("change", (e) => {
      select_bill_no();
      const totalBill = getElement("total");
      const totalPayment = getElement("total_payment");
      const addNawajans = getElement("addnawajans");
      const removeBtns = document.getElementsByClassName("remove_btn");

      totalBill.value = "0";
      totalPayment.value = "0";

      if (["PAYMENT", "RECEIVEMENT", "EXPENSE"].includes(e.target.value)) {
          [...removeBtns].forEach(btn => btn.click());
          totalBill.disabled = true;
          addNawajans.disabled = true;
      } else {
          totalBill.disabled = false;
          addNawajans.disabled = false;
          
          const items = document.getElementsByClassName("item_name");
          const itemPrices = document.getElementsByClassName("item_price");
      
          for (let i = 0; i < items.length; i++) {
              let item_db_id = items[i].value;
              change_price_field(item_db_id,i,e.target);
          }
      }
  });
} catch (e) {
  console.log("Error handling bill_type change", e);
}

/**
 * Keyboard shortcuts for bill form
 * + (Plus) = Add new row
 * - (Minus) = Remove last row
 * Enter on inputs = Navigate to next field
 * Ctrl+Shift+Enter = Submit form
 */
document.addEventListener("keydown", function(e) {
    // Plus key (+) - Add new row
    if ((e.key === "+" || e.key === "=") && !e.ctrlKey && !e.altKey) {
        const activeElement = document.activeElement;
        const tableBody = document.getElementById("table_body");
        
        // Only trigger if we're in the bill form area or table
        if (tableBody && (activeElement.tagName === "INPUT" || activeElement.tagName === "SELECT" || activeElement === document.body)) {
            e.preventDefault();
            const addBtn = document.getElementById("addnawajans");
            if (addBtn && !addBtn.disabled) {
                add_row().then(() => {
                    // Focus on the first input of the newly added row after a short delay
                    setTimeout(() => {
                        const rows = tableBody.getElementsByTagName("tr");
                        if (rows.length > 0) {
                            const lastRow = rows[rows.length - 1];
                            const firstSelect = lastRow.querySelector(".item_name");
                            if (firstSelect) {
                                // Open Select2 dropdown if available
                                if (typeof jQuery !== 'undefined' && jQuery(firstSelect).data('select2')) {
                                    jQuery(firstSelect).select2('open');
                                    // Focus the search input after opening
                                    setTimeout(() => {
                                        const searchField = document.querySelector('.select2-search__field');
                                        if (searchField) searchField.focus();
                                    }, 50);
                                } else {
                                    firstSelect.focus();
                                }
                            }
                        }
                    }, 100);
                });
            }
        }
    }
    
    // Minus key (-) - Remove last row
    if (e.key === "-" && !e.ctrlKey && !e.altKey) {
        const activeElement = document.activeElement;
        const tableBody = document.getElementById("table_body");
        
        // Only trigger if we're in the bill form area
        if (tableBody && (activeElement.tagName === "INPUT" || activeElement.tagName === "SELECT" || activeElement === document.body)) {
            e.preventDefault();
            const rows = tableBody.getElementsByTagName("tr");
            if (rows.length > 0) {
                const lastRow = rows[rows.length - 1];
                const removeBtn = lastRow.querySelector(".remove_btn");
                if (removeBtn) {
                    removeBtn.click();
                }
            }
        }
    }
    
    // Ctrl+Shift+Enter - Submit form
    if (e.key === "Enter" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        const billForm = document.getElementById("bill");
        if (billForm) {
            // Trigger form submission
            const submitBtn = billForm.querySelector('input[type="submit"]');
            if (submitBtn) {
                submitBtn.click();
            } else {
                billForm.dispatchEvent(new Event('submit', { cancelable: true }));
            }
        }
    }
    
    // Enter key navigation through table inputs
    if (e.key === "Enter" && !e.ctrlKey && !e.shiftKey) {
        const activeElement = document.activeElement;
        const tableBody = document.getElementById("table_body");
        
        // Check if we're in a table input/select (but not Select2 search)
        if (tableBody && (activeElement.tagName === "INPUT" || activeElement.tagName === "SELECT")) {
            const isInTableBody = tableBody.contains(activeElement);
            const isSelect2Search = activeElement.classList.contains('select2-search__field');
            
            // Skip if it's a Select2 search field (let Select2 handle Enter)
            if (isInTableBody && !isSelect2Search) {
                e.preventDefault();
                
                // Get all focusable elements in the table
                const focusableElements = Array.from(tableBody.querySelectorAll(
                    'input:not([type="hidden"]):not([disabled]), select:not([disabled])'
                ));
                
                // Find current element index
                const currentIndex = focusableElements.indexOf(activeElement);
                
                if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
                    // Move to next element
                    const nextElement = focusableElements[currentIndex + 1];
                    
                    // If next element is a Select2, open it
                    if (nextElement.tagName === "SELECT" && typeof jQuery !== 'undefined' && jQuery(nextElement).data('select2')) {
                        jQuery(nextElement).select2('open');
                        // Focus the search input after opening
                        setTimeout(() => {
                            const searchField = document.querySelector('.select2-search__field');
                            if (searchField) searchField.focus();
                        }, 50);
                    } else {
                        nextElement.focus();
                        // Select text if it's a number input
                        if (nextElement.tagName === "INPUT" && nextElement.type === "number") {
                            nextElement.select();
                        }
                    }
                } else if (currentIndex === focusableElements.length - 1) {
                    // If we're at the last element, add a new row
                    const addBtn = document.getElementById("addnawajans");
                    if (addBtn && !addBtn.disabled) {
                        add_row().then(() => {
                            // Focus on the first input of the newly added row
                            setTimeout(() => {
                                const rows = tableBody.getElementsByTagName("tr");
                                if (rows.length > 0) {
                                    const lastRow = rows[rows.length - 1];
                                    const firstSelect = lastRow.querySelector(".item_name");
                                    if (firstSelect) {
                                        if (typeof jQuery !== 'undefined' && jQuery(firstSelect).data('select2')) {
                                            jQuery(firstSelect).select2('open');
                                            // Focus the search input after opening
                                            setTimeout(() => {
                                                const searchField = document.querySelector('.select2-search__field');
                                                if (searchField) searchField.focus();
                                            }, 50);
                                        } else {
                                            firstSelect.focus();
                                        }
                                    }
                                }
                            }, 100);
                        });
                    }
                }
            }
        }
    }
});

// Show keyboard shortcuts help on page load (optional)
console.log(`
📋 Bill Form Keyboard Shortcuts:
  + (Plus)           → Add new item row
  - (Minus)          → Remove last item row
  Enter              → Navigate to next field (auto-add row at end)
  Ctrl+Shift+Enter   → Submit form
`);

/**
 * Product Modal Functionality
 * Allows adding new products without leaving the bill form
 */

// Open product modal
function openProductModal() {
    const modal = document.getElementById('product_modal');
    const form = document.getElementById('modal_product_form');
    if (modal && form) {
        // Reset form
        form.reset();
        modal.style.display = 'block';
        
        // Focus on item name field
        setTimeout(() => {
            const itemNameField = document.getElementById('modal_item_name');
            if (itemNameField) itemNameField.focus();
        }, 100);
        
        console.log('✓ Product modal opened');
    }
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('product_modal');
    const form = document.getElementById('modal_product_form');
    if (modal && form) {
        modal.style.display = 'none';
        form.reset();
        console.log('✓ Product modal closed');
    }
}

// Refresh product dropdowns after adding new product
function refreshProductDropdowns() {
    console.log('✓ Product saved, refreshing product data...');
    
    // Clear localStorage to force fresh data fetch
    localStorage.removeItem('product_data');
    localStorage.removeItem('selling_price_obj');
    localStorage.removeItem('purchasing_price_obj');
    
    // Get fresh product data
    const organizationSelect = document.getElementById('organization');
    if (organizationSelect) {
        get_products(organizationSelect.value, false).then(() => {
            console.log('✓ Product data refreshed');
            // Update any existing Select2 dropdowns with new data
            const itemSelects = document.querySelectorAll('.item_name');
            itemSelects.forEach(select => {
                if (typeof jQuery !== 'undefined' && jQuery(select).data('select2')) {
                    // Repopulate the select with new data
                    const currentValue = select.value;
                    jQuery(select).empty();
                    
                    // Add placeholder
                    jQuery(select).append(new Option('Select item...', '', true, false));
                    
                    // Add all products from updated data
                    for (const key in product_data) {
                        if (Object.hasOwn(product_data, key)) {
                            const product = product_data[key];
                            const label = `${product.item_name} ${product.product_detail?.purchased_price || ""}`;
                            jQuery(select).append(new Option(label, product.id, false, false));
                        }
                    }
                    
                    // Restore selection if it still exists
                    if (currentValue) {
                        jQuery(select).val(currentValue).trigger('change');
                    }
                    
                    // Trigger Select2 to refresh
                    jQuery(select).trigger('change.select2');
                }
            });
            
            show_message('Product added successfully!', 'success');
        });
    }
    
    // Close the modal
    closeProductModal();
}

// Initialize modal event listeners after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add click event listener to the "Add Product" link
    const addProductLink = document.getElementById('add_product_link');
    if (addProductLink) {
        addProductLink.addEventListener('click', function(e) {
            e.preventDefault();
            openProductModal();
        });
        console.log('✓ Product modal link initialized');
    }
    
    // Close modal when clicking the X button
    const closeBtn = document.querySelector('.product-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }
    
    // Close modal when clicking outside the modal content
    const modal = document.getElementById('product_modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }
    
    // Handle product form submission
    const productForm = document.getElementById('modal_product_form');
    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log('Submitting product form...');
            
            // Get form data
            const formData = new FormData(productForm);
            
            // Get organization from bill form
            const organizationSelect = document.getElementById('organization');
            if (organizationSelect) {
                formData.append('organization', organizationSelect.value);
            }
            
            // Auto-fill selling price if purchased price changed
            const purchasedPrice = document.getElementById('modal_purchased_price');
            const sellingPrice = document.getElementById('modal_selling_price');
            if (purchasedPrice && sellingPrice && (!sellingPrice.value || sellingPrice.value == 0)) {
                const calculatedPrice = parseFloat(purchasedPrice.value) + 50;
                sellingPrice.value = calculatedPrice;
                formData.set('selling_price', calculatedPrice);
            }
            
            try {
                // Submit to product create endpoint
                const response = await call_shirkat(
                    '/product/product_form/create/',
                    'POST',
                    formData,
                    {'Content-Type': 'multipart/form-data'}
                );
                
                console.log('Product create response:', response);
                
                if (response.status === 200 || response.status === 201) {
                    if (response.data.ok) {
                        show_message(response.data.message || 'Product created successfully!', 'success');
                        refreshProductDropdowns();
                    } else {
                        show_message(response.data.message || 'Failed to create product', 'error');
                    }
                } else {
                    show_message('Error creating product', 'error');
                }
            } catch (error) {
                console.error('Error submitting product form:', error);
                show_message('Error creating product: ' + error.message, 'error');
            }
        });
        console.log('✓ Product form submission handler initialized');
    }
    
    // Auto-calculate selling price when purchased price changes
    const modalPurchasedPrice = document.getElementById('modal_purchased_price');
    if (modalPurchasedPrice) {
        modalPurchasedPrice.addEventListener('change', function(e) {
            const purchasedPrice = parseFloat(e.target.value) || 0;
            const sellingPriceField = document.getElementById('modal_selling_price');
            if (sellingPriceField && (!sellingPriceField.value || sellingPriceField.value == 0)) {
                sellingPriceField.value = (purchasedPrice + 50).toFixed(2);
            }
        });
    }
    
    // Auto-fill model from item name
    const modalItemName = document.getElementById('modal_item_name');
    const modalModel = document.getElementById('modal_model');
    if (modalItemName && modalModel) {
        modalItemName.addEventListener('change', function(e) {
            const itemName = e.target.value || '';
            if (!modalModel.value) {
                modalModel.value = itemName.split(' ')[0];
            }
        });
    }
});

