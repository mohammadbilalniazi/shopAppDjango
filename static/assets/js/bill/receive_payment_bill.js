// import {creator_show} from './creator.mjs';
var data;
var product_data;
var selling_price_obj={};
var purchasing_price_obj={};
var purchased_price;

var id;
var price;
var i;


function add_events_to_elements()
{   
    console.log("add_events_to_elements");
    try
    {
        var bill_type=document.getElementById("bill_type");
        bill_type.addEventListener("change",e=>{
            select_bill_no();
        });
       
          
            bill_rcvr_org=document.getElementById("bill_rcvr_org");
              
    }
    catch(err)
    {
        console.log("add_events_to_elements error ",err);
    }
    return;
}


try
{
    detail_or_update=document.getElementById("detail_or_update");
    if(detail_or_update.value==="0")
    {    
    select_rcvr_orgs();
    }
    
    // else
    // {
    // }
}
catch(EX)
{
    console.log("detail_or_update not exist")
}



bill=document.getElementById("bill");
async function submit_validation_function()
{        
   
   flag=true;
   item_name=document.getElementsByClassName("item_name");  
       
   item_name_list=[]
   for(let i=0; i<item_name.length; i++)
   {
    item_name_list.push(item_name[i].value);   
   }

   seen = item_name_list.filter((s => v => s.has(v) || !s.add(v))(new Set));
//    console.log("seen ",seen);
   if(seen.length>0)
   {
    // console.log("seen ",seen);
    flag=false;
   }

 
    
    if(!total_and_paid_validated){
        console.log('total_less_than_paid not validate ',total_and_paid_validated)
        flag= false; 
    }
        
  
    return flag;   
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

            let response=await call_shirkat(
                   "/receive_payment/bill/save/",
                    "POST",
                    JSON.stringify(bill_obj)
                );
            console.log("response bill insert",response)
            if(response.status==200 || response.status==201){
                // console.log("response=",response," response.data.ok ",response.data.ok);
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
    });
}  
catch(e)
{
    console.log("getElementById(bill) error")
}
async function select_rcvr_orgs(){
    try{
        rcvr_org_span=document.getElementById("rcvr_org_span");
        //console.log("rcvr_org_span=",rcvr_org_span)
        rcvr_org_span.innerHTML="";
    }
    catch(e)
    {
        return;
    }
   
    var select_rcvr_org_in_div=document.createElement("select");
    select_rcvr_org_in_div.id='bill_rcvr_org';
    select_rcvr_org_in_div.name='bill_rcvr_org';
    select_rcvr_org_in_div.required=true;
    rcvr_org_id="all";
    url='/organizations/'+rcvr_org_id+'/';
    await fetch(url,{
        'method':'GET'
    }).then(response=>response.json()).then(data=>{
        //alert(data.length)
        // console.log("key=",key," rcvr_orgs=",data)
        for(key in data){
            //console.log("key=",key," data[key]=",data[key])
            var option_in_select=document.createElement("option");
            option_in_select.value=data[key]['id'];
            option_in_select.innerText=data[key]['name'];
            select_rcvr_org_in_div.appendChild(option_in_select);
            // select_item_name_in_div.appendChild(option_in_select2)
        }
        const plus= create_element("a",null,null,null,null,false,"addlink")
        plus.href="/admin/configuration/organization/add/"
        // console.log("plus ",plus);
        rcvr_org_span.appendChild(select_rcvr_org_in_div);   
        rcvr_org_span.appendChild(plus);   
        select_rcvr_org_in_div.addEventListener("change",e=>{
            document.getElementById("table_body").innerHTML="";
        }); 
        
        organization=document.getElementById("organization");
    });
}



 
try
{
    // add_events_to_elements();
    document.getElementById("bill_type").addEventListener("change",(e)=>{
        select_bill_no();
        addnawajans=document.getElementById("addnawajans");
        var total_bill_element=document.getElementById("total");
        total_bill_element.value=0;
        var total_payment_element=document.getElementById("total_payment");
        total_payment_element.value=total_bill_element.value;
        
        remove_btns=document.getElementsByClassName("remove_btn");
        console.log("remove_btns ",remove_btns.length)
        if(e.target.value=="PAYMENT" || e.target.value=="RECEIVEMENT" || e.target.value=="EXPENSE")
        {
            for(var i=0; i<remove_btns.length; i++)
            {
                console.log("remove_btn i",i)
                remove_btn=remove_btns[i];
                remove_btn.click();
            }
            total_bill_element.disabled=true;
            addnawajans.disabled=true;
        }
        else
        {
            total_bill_element.disabled=false;
            addnawajans.disabled=false;
        }
        add_events_to_elements();
    });    
}
catch(e)
{
    console.log("total_payment error ",e);
}


async function init(){
        add_events_to_elements();
}
init();