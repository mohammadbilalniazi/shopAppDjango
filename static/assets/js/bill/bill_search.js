var data;

async function make_table(data)
{
    console.log("make_table data",data)
    // return;
    prv=data['previous']
    nex=data['next']

    data=data.results;
    const bill_tbody = document.querySelector('#bill_tbody');
    total_upon_self_org=document.getElementById("total_upon_self_org");
    total_upon_self_org.value=data.statistics.total_upon_self_org;
    total_upon_opposit_org=document.getElementById("total_upon_opposit_org");
    total_upon_opposit_org.value=data.statistics.total_upon_opposit_org;
    total_summary=document.getElementById("total_summary");
    net_profit_sum=document.getElementById("net_profit_sum");
    net_profit_sum.value=data.statistics.net_profit_sum
    profit_sum=document.getElementById("profit_sum");
    profit_sum.value=data.statistics.profit_sum
    total_summary.value=data.statistics.total_summary;
    if(total_summary.value<0)
    {
     total_summary.style.color="black";
     total_summary.style.background="red";
    }
    else
    {   
     total_summary.style.color="black";
     total_summary.style.background="lightgreen";
    }
    
    if(net_profit_sum.value<0)
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
    total_sum_purchase.value=data.statistics.total_sum_purchase;
    payment_sum_purchase=document.getElementById("payment_sum_purchase");
    payment_sum_purchase.value=data.statistics.payment_sum_purchase;
    notpaid_purchase=document.getElementById("notpaid_purchase");
    notpaid_purchase.value=data.statistics.notpaid_purchase;

    total_sum_selling=document.getElementById("total_sum_selling");
    total_sum_selling.value=data.statistics.total_sum_selling;
    payment_sum_selling=document.getElementById("payment_sum_selling");
    payment_sum_selling.value=data.statistics.payment_sum_selling;
    notpaid_sell=document.getElementById("notpaid_sell");
    notpaid_sell.value=data.statistics.notpaid_sell;
    // console.log("data.statistics.notpaid_sell ",data.statistics.notpaid_sell)

    
    // total_sum_payment=document.getElementById("total_sum_payment");
    // total_sum_payment.value=data.statistics.total_sum_payment;
    payment_sum_payment=document.getElementById("payment_sum_payment");
    payment_sum_payment.value=data.statistics.payment_sum_payment;

    // total_sum_receivement=document.getElementById("total_sum_receivement");
    // total_sum_receivement.value=data.statistics.total_sum_receivement;
    receivement_sum=document.getElementById("receivement_sum");
    receivement_sum.value=data.statistics.payment_sum_receivement;
    
    // total_sum_expense=document.getElementById("total_sum_expense");
    // total_sum_expense.value=data.statistics.total_sum_expense;
    payment_sum_expense=document.getElementById("payment_sum_expense");
    payment_sum_expense.value=data.statistics.payment_sum_expense;

    pagination = document.querySelector("#pagination_id");
    // console.log("pagination ",pagination.innerHTML)
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
    bill_tbody.innerHTML="";
    // console.log(data)
    
    //console.log('data ',data);
    if(!data['ok'])
    {
        alert("data['message'] ",data['message'])
        show_message(data['message'],"error");
        return;
    }
    for(key in data['serializer_data']){     
        var bill_rcvr_org="";
        
        if(data['serializer_data'][key]['bill_receiver2']!=undefined && data['serializer_data'][key]['bill_receiver2']!=null )
        {
         bill_rcvr_org=data['serializer_data'][key]['bill_receiver2']['bill_rcvr_org'];
        }
        else{
         bill_rcvr_org=null;
        }
     
        let update_href=`/bill/update/${data['serializer_data'][key]['id']}/`;
        if(data['serializer_data'][key]['bill_type']=="EXPENSE"){
            update_href=`/expenditure/bill/form/${data['serializer_data'][key]['id']}/`;
        }
        let row=`
            <tr>
                <td>${data['serializer_data'][key]['organization']}</td>
                <td>${data['serializer_data'][key]['bill_no']}(<span style="color:green;font-weight:600">${data['serializer_data'][key]['bill_type']}</span>)</td>
                <td>${bill_rcvr_org}</td><td>${data['serializer_data'][key]['total']}</td>
                <td>${data['serializer_data'][key]['payment']}</td><td>${data['serializer_data'][key]['date']}</td>
                <td> <a href="${update_href}"  class="btn btn-success" role="button">update</a> | <a href="/bill/delete/${data['serializer_data'][key]['id']}"  onclick="return confirm('do you want to delete');" role="button" class="btn btn-success">delete</a>
                </td>
            </tr>`; 
        bill_tbody.insertAdjacentHTML('beforeend', row);
    }
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


async function finalizeLedger() {

    var bill_rcvr_org=document.getElementById("bill_rcvr_org").value;
    var organization=document.getElementById("organization").value;
    if(organization==""){
        organization="all";
    }

    if(bill_rcvr_org=="")
    {
        bill_rcvr_org="all";
    }

    

    if (!bill_rcvr_org || bill_rcvr_org == "all" || bill_rcvr_org == "undefined" || organization=="all" || organization == "undefined") {
        alert("Please select an organization to finalize the ledger.");
        return;
    }

    const data= {
        bill_rcvr_org: bill_rcvr_org,
        organization: organization
    };

    let response=await call_shirkat(`/organizations/finalize-ledger`,"POST",data);
}

document.getElementById("search_kahatha").addEventListener("click",e=>{e.preventDefault();search_bills(); return  false;});

function date_change()
{
    search_bills(); 
}
// search_bills();