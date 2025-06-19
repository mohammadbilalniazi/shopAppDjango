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
    selling_price_obj = JSON.parse(localStorage.getItem("selling_price_obj"));
    purchasing_price_obj = JSON.parse(localStorage.getItem("purchasing_price_obj"));
    
    if (bill_type_field.value === "SELLING") {
        item_price.value = selling_price_obj[parseInt(item_db_id)];
    } else if (bill_type_field.value === "PURCHASE") {
        item_price.value = purchasing_price_obj[parseInt(item_db_id)];
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
        let bill_rcvr_org = document.getElementById("bill_rcvr_org");

        for (let i = 0; i < item_amount.length; i++) {
            item_amount[i].addEventListener("keyup", generate_total_amount_bill);
            return_qty[i].addEventListener("input", generate_total_amount_bill);
            item_name[i].addEventListener("change", e => change_price_field(e.target.value, i, bill_type));
            item_price[i].addEventListener("keyup", generate_total_amount_bill);

            if (change_price && item_price[i].value <= 0) {
                change_price_field(item_name[i].value, i, bill_type);
            }
        }
        bill_rcvr_org.addEventListener("change", () => {
            generate_total_amount_bill();
        });
    } catch (err) {
        console.error("Error adding events to elements:", err);
    }
}

/**
 * Deletes a row from the bill details table.
 */
function deleteRow(btn, bill_detail_id) {
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
async function adding_row() {
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
    const organization = (billTypeElement.value === "PURCHASE" || billTypeElement.value === "RECEIVEMENT")
        ? document.getElementById("bill_rcvr_org")
        : document.getElementById("organization");

    const tableBody = document.getElementById("table_body");
    const row = createElement("tr");
    tableBody.appendChild(row);

    const selectItemName = createElement("select", {
        id: `item_name_select_${Date.now()}`,
        className: "item_name",
        name: "item_name",
        required: true
    });

    const productData = JSON.parse(localStorage.getItem("product_data")) || {};

    for (const key in productData) {
        if (Object.hasOwn(productData, key)) {
            const product = productData[key];
            const option = createElement("option", {
                value: product.id,
                innerText: `${product.item_name} ${product.product_detail.purchased_price}`
            });
            selectItemName.appendChild(option);
        }
    }
    const selectUnit = createElement("select", {
        className: "unit",
        name: "unit",
        required: true
      });
    
      const unitDataStr = localStorage.getItem("unit_data");
      const unitData = JSON.parse(unitDataStr);
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
    
    
    row.appendChild(createElement("td", {}, [selectItemName]));
    
    row.appendChild(createElement("td", {}, [selectUnit]));
    row.appendChild(createElement("td", {}, [createElement("input", { type: "number", className: "item_amount", required: true })]));
    row.appendChild(createElement("td", {}, [createElement("input", { type: "number", className: "item_price", min: "0", step: ".001", required: true })]));
    row.appendChild(createElement("td", {}, [createElement("input", { type: "number", className: "return_qty", value: 0, required: true })]));
    row.appendChild(createElement("td", {}, [createElement("input", { type: "hidden", className: "bill_detail_id", required: true })]));
    row.appendChild(createElement("td", {}, [createElement("input", { type: "button", value: "remove", className: "remove_btn", style: "background-color:red;color:black;", onclick: () => deleteRow(row, 0) })]));

    setTimeout(() => {
        if (jQuery.fn.select2) {
            $(`#${selectItemName.id}`).select2({ placeholder: "Select an item", allowClear: true, width: "100%" });
        }
    }, 100);

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

     if(bill_type.value=="PAYMENT" || bill_type.value=="RECEIVEMENT"){
         bill_obj={
             "date":date.value,
             "organization":organization.value,
             "creator":creator.value,
             "total":total.value,
             "total_payment":total_payment.value,
             "bill_no":bill_no.value,
             "bill_type":bill_type.value,
             "id":bill_id.value,    
             "bill_rcvr_org":bill_rcvr_org.value,
             "is_approved":is_approved.value,
             "status":status_bill.value,
             "approval_date":approval_date.value,
             "approval_user":approval_user.value,
         }
         flag=true;
     }
     else
     {
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
     
     }
     

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
