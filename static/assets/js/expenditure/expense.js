// import {creator_show} from './creator.mjs';
var data;
var product_data;
var selling_price_obj={};
var purchasing_price_obj={};
var purchased_price;
var id;
var price;
var i;
 function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}       


bill=document.getElementById("bill");
async function submit_validation_function()
{        
   
    flag=true;
    
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
        creator=document.getElementById("creator");
        total_payment=document.getElementById("total_payment");
        bill_no=document.getElementById("bill_no");
        bill_id=document.getElementById("bill_id");
        bill_type=document.getElementById("bill_type");
        expense_type=document.getElementById("expense_type");
        status_bill=document.getElementById("status");
        bill_obj={
            "date":date.value,
            "organization":organization.value,
            "creator":creator.value,
            "total":0,
            "total_payment":total_payment.value,
            "bill_no":bill_no.value,
            "bill_type":bill_type.value,
            "expense_type":expense_type.value,
            "id":bill_id.value,    
        }
        flag=true;
    

        console.log("flage ",flag," bill_obj ",bill_obj)
        // return ;
        if(flag)
        {
            let response=await call_shirkat(
                   "/expenditure/bill/insert/",
                    "POST",
                    JSON.stringify(bill_obj)
                );
            if(response.status==200 || response.status==201){
                // console.log("response=",response," response.data.ok ",response.data.ok);
                if(response.data.ok)
                {
                    show_message("bill Created ","success");
                    var host=location.protocol + '//' + location.host
                     window.location.href=host+"/expenditure/bill/form/"+response.data.bill_id+"/";
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
