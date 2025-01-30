

async function select_bill_no(){
   
    bill_type=document.getElementById("bill_type");
    bill_no=document.getElementById("bill_no");
    detail_or_update_bill_no= document.getElementById("detail_or_update");
     
    if(detail_or_update_bill_no==null || detail_or_update_bill_no.value==="1")
    {
        return;
    } 
    // console.log("bill_type ",bill_type.value)
    try{
        // if(bill_type.value=="PURCHASE" || bill_type.value=="RECEIVEMENT")
        // {
        //     organization=document.getElementById("bill_rcvr_org");
        //     // console.log("bill receiver org ",organization," value==null ",organization.value==null)
        // }
        // else{
        //     organization=document.getElementById("organization");
            
        //     // console.log("bill creator org ",organization," value==null ",organization.value==null)
        // }
        
            organization=document.getElementById("organization");
            
            bill_rcvr_org=document.getElementById("bill_rcvr_org");
    }
    catch(error)
    {
        bill_no.value=null;
        // select_bill_no();
        console.log(" error ",error)
        // return;
    }
     let url=`/bill/select_bill_no/${organization.value}/${bill_rcvr_org.value}/${bill_type.value}`;
     let response=await call_shirkat(url,'GET');
     console.log("select_bill_no response",response);
     if(response.status==200 || response.status==201){
        bill_no.value=response.data['bill_no'];     
     }
}
document.addEventListener("load",(e)=>{
        try{
        detail_or_update_bill_no= document.getElementById("detail_or_update");
        console.log("detail_or_update_bill_no ",detail_or_update_bill_no)
        if(detail_or_update_bill_no==null || detail_or_update_bill_no.value==="1")
        {
            console.log("e")
        }
        else{
        select_bill_no();
            } 
        }
        catch(err)
        {
            console.log("error",error);
        }
})
