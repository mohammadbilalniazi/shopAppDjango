var data;

/**
 * Get CSRF token from cookies
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function make_table(response_data)
{
    console.log("make_table response_data", response_data)
    
    // Extract pagination and main data
    const prv = response_data['previous'];
    const nex = response_data['next'];
    const data = response_data.results; // This contains {ok, message, statistics, serializer_data}
    
    // Access statistics from the results object
    const statistics = data.statistics;
    const bills = data.serializer_data;
    
    const bill_tbody = document.querySelector('#bill_tbody');
    
    // Update statistics fields
    total_upon_self_org=document.getElementById("total_upon_self_org");
    if(total_upon_self_org) total_upon_self_org.value = statistics.total_upon_self_org || 0;
    
    total_upon_opposit_org=document.getElementById("total_upon_opposit_org");
    if(total_upon_opposit_org) total_upon_opposit_org.value = statistics.total_upon_opposit_org || 0;
    
    total_summary=document.getElementById("total_summary");
    net_profit_sum=document.getElementById("net_profit_sum");
    net_profit_sum.value = statistics.net_profit_sum || 0;
    profit_sum=document.getElementById("profit_sum");
    profit_sum.value = statistics.profit_sum || 0;
    total_summary.value = statistics.total_summary || 0;
    
    // Update display cards (modern design)
    const total_sum_purchase_display = document.getElementById("total_sum_purchase_display");
    const payment_sum_purchase_display = document.getElementById("payment_sum_purchase_display");
    const notpaid_purchase_display = document.getElementById("notpaid_purchase_display");
    const total_sum_selling_display = document.getElementById("total_sum_selling_display");
    const payment_sum_selling_display = document.getElementById("payment_sum_selling_display");
    const notpaid_sell_display = document.getElementById("notpaid_sell_display");
    const profit_sum_display = document.getElementById("profit_sum_display");
    const net_profit_sum_display = document.getElementById("net_profit_sum_display");
    
    if(total_sum_purchase_display) total_sum_purchase_display.textContent = (statistics.total_sum_purchase || 0).toLocaleString();
    if(payment_sum_purchase_display) payment_sum_purchase_display.textContent = (statistics.payment_sum_purchase || 0).toLocaleString();
    if(notpaid_purchase_display) notpaid_purchase_display.textContent = (statistics.notpaid_purchase || 0).toLocaleString();
    if(total_sum_selling_display) total_sum_selling_display.textContent = (statistics.total_sum_selling || 0).toLocaleString();
    if(payment_sum_selling_display) payment_sum_selling_display.textContent = (statistics.payment_sum_selling || 0).toLocaleString();
    if(notpaid_sell_display) notpaid_sell_display.textContent = (statistics.notpaid_sell || 0).toLocaleString();
    if(profit_sum_display) profit_sum_display.textContent = (statistics.profit_sum || 0).toLocaleString();
    if(net_profit_sum_display) net_profit_sum_display.textContent = (statistics.net_profit_sum || 0).toLocaleString();
    
    if(total_summary.value < 0)
    {
     total_summary.style.color="black";
     total_summary.style.background="red";
    }
    else
    {   
     total_summary.style.color="black";
     total_summary.style.background="lightgreen";
    }
    
    if(net_profit_sum.value < 0)
    {
     net_profit_sum.style.color="black";
     net_profit_sum.style.background="red";
    }
    else
    {   
     net_profit_sum.style.color="black";
     net_profit_sum.style.background="lightgreen";
    }
    
    total_sum_purchase=document.getElementById("total_sum_purchase");
    total_sum_purchase.value = statistics.total_sum_purchase || 0;
    payment_sum_purchase=document.getElementById("payment_sum_purchase");
    payment_sum_purchase.value = statistics.payment_sum_purchase || 0;
    notpaid_purchase=document.getElementById("notpaid_purchase");
    notpaid_purchase.value = statistics.notpaid_purchase || 0;

    total_sum_selling=document.getElementById("total_sum_selling");
    total_sum_selling.value = statistics.total_sum_selling || 0;
    payment_sum_selling=document.getElementById("payment_sum_selling");
    payment_sum_selling.value = statistics.payment_sum_selling || 0;
    notpaid_sell=document.getElementById("notpaid_sell");
    notpaid_sell.value = statistics.notpaid_sell || 0;

    payment_sum_payment=document.getElementById("payment_sum_payment");
    payment_sum_payment.value = statistics.payment_sum_payment || 0;

    receivement_sum=document.getElementById("receivement_sum");
    receivement_sum.value = statistics.payment_sum_receivement || 0;
    
    payment_sum_expense=document.getElementById("payment_sum_expense");
    payment_sum_expense.value = statistics.payment_sum_expense || 0;
    
    payment_sum_loss=document.getElementById("payment_sum_loss");
    payment_sum_loss.value = statistics.payment_sum_loss || 0;

    // Handle pagination
    pagination = document.querySelector("#pagination_id");
    pagination.innerHTML = "";
    previous = ``;
    next = ``;
    if (prv) {
        previous = `<td>  <a href="${prv}" onclick='search_bills(this.getAttribute("href")); return false;'  class="btn btn-success" role="button" style="margin:4%"> Previous </a> </td>`;
    }
    if (nex) {
        next = `<td> <a  href="${nex}" onclick='search_bills(this.getAttribute("href")); return false;' class="btn btn-success" role="button" style="margin:4%"> Next </a>  </td>`;
    }
    html = next + previous;
    pagination.insertAdjacentHTML('beforeend', html);
    
    // Clear table body
    bill_tbody.innerHTML="";
    
    // Check if request was successful
    if(!data['ok'])
    {
        console.error("Error: ", data['message']);
        show_message(data['message'],"error");
        return;
    }
    
    // Populate table rows with modern design
    let rowNumber = 1;
    for(key in bills){     
        var bill_rcvr_org="";
        
        if(bills[key]['bill_receiver2']!=undefined && bills[key]['bill_receiver2']!=null )
        {
         bill_rcvr_org=bills[key]['bill_receiver2']['bill_rcvr_org'];
        }
        else{
         bill_rcvr_org="<span class='text-muted'>N/A</span>";
        }
     
        let update_href=`/bill/detail/${bills[key]['id']}/`;
        if(bills[key]['bill_type']=="EXPENSE"){
            update_href=`/expenditure/bill/form/${bills[key]['id']}/`;
        }
        
        // Calculate balance
        const total = parseFloat(bills[key]['total']) || 0;
        const payment = parseFloat(bills[key]['payment']) || 0;
        const balance = total - payment;
        
        // Badge color based on bill type
        const billTypeColors = {
            'PURCHASE': 'danger',
            'SELLING': 'success',
            'PAYMENT': 'warning',
            'RECEIVEMENT': 'info',
            'EXPENSE': 'dark',
            'LOSSDEGRADE': 'secondary'
        };
        const badgeColor = billTypeColors[bills[key]['bill_type']] || 'primary';
        
        // Balance styling
        const balanceClass = balance > 0 ? 'text-danger fw-bold' : balance < 0 ? 'text-success fw-bold' : 'text-muted';
        
        let row=`
            <tr class="bill-row">
                <td class="text-center text-muted fw-semibold">${rowNumber++}</td>
                <td><strong>${bills[key]['organization']}</strong></td>
                <td class="text-center">
                    <span class="badge bg-${badgeColor} fs-6">#${bills[key]['bill_no']}</span><br>
                    <small class="text-muted">${bills[key]['bill_type']}</small>
                </td>
                <td>${bill_rcvr_org}</td>
                <td class="text-end fw-bold">${total.toLocaleString()}</td>
                <td class="text-end text-success fw-semibold">${payment.toLocaleString()}</td>
                <td class="text-end ${balanceClass}">${balance.toLocaleString()}</td>
                <td class="text-center"><small>${bills[key]['date']}</small></td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm" role="group">
                        <a href="${update_href}" class="btn btn-outline-primary" title="View/Edit">
                            <i class="bi bi-eye"></i>
                        </a>
                        <a href="/bill/payment/${bills[key]['id']}/" class="btn btn-outline-success" title="Pay with Card">
                            <i class="bi bi-credit-card"></i>
                        </a>
                        <a href="/bill/delete/${bills[key]['id']}" 
                           onclick="return confirm('⚠️ Are you sure you want to delete this bill?');" 
                           class="btn btn-outline-danger" title="Delete">
                            <i class="bi bi-trash"></i>
                        </a>
                    </div>
                </td>
            </tr>`; 
        bill_tbody.insertAdjacentHTML('beforeend', row);
    }
    
    console.log(`✓ Loaded ${Object.keys(bills).length} bills with modern styling`);
}
async function search_bills(url=null)
{
    var start_date=document.getElementById("start_date_input").value;
    var end_date=document.getElementById("end_date_input").value;
    var bill_no=document.getElementById("bill_no").value;
    var bill_rcvr_org=document.getElementById("bill_rcvr_org").value;
    var organization=document.getElementById("organization").value;
    if(organization==""){
        organization="all";
    }
    
    var bill_type=document.getElementById("bill_type").value;
    if(bill_no=="" || bill_no==null)
    {
        bill_no=0;
    }

    if(bill_rcvr_org=="")
    {
        bill_rcvr_org="all";
    }

    if(url==null){
    url=`/bill/search/`;  
    }
    const data={bill_type:bill_type,organization:organization,bill_no:bill_no,bill_rcvr_org:bill_rcvr_org,start_date:start_date,end_date:end_date}
    let response=await call_shirkat(url,"POST",data);
    console.log("search resutls",response.data)
    make_table(response.data);
}


async function finalize_ledger() {

    var bill_rcvr_org=document.getElementById("bill_rcvr_org").value;
    var organization=document.getElementById("organization").value;
    if(organization==""){
        organization="all";
    }

    if(bill_rcvr_org=="")
    {
        bill_rcvr_org="all";
    }
    let total_summary=document.getElementById("total_summary").value;
    if (!bill_rcvr_org || bill_rcvr_org == "all" || bill_rcvr_org == "undefined" || organization=="all" || organization == "undefined") {
        alert("Please select an organization to finalize the ledger.");
        return;
    }
    if(!total_summary || String(total_summary)=="0"){
        alert("kahatha is zero or may not shown");
        return;
    }
    const data= {
        bill_rcvr_org: bill_rcvr_org,
        organization: organization
    };
    try{
    let response=await call_shirkat(`/organizations/finalize-ledger`,"POST",data); 
    }
    catch(e){
        // console.log("no finalize ",String(e));
        show_message("can not finalize it may already zero kahatha ","error");
    }
    search_bills();
}

document.getElementById("search_kahatha").addEventListener("click",e=>{e.preventDefault();search_bills(); return  false;});

function date_change()
{
    search_bills(); 
}

// search_bills();