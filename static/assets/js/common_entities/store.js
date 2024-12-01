async function show_store(id="all",organization="all")
{   
    if(organization=="all")
    {
    organization=document.getElementById("bill_rcvr_org").value;
    }
    let url=`/stores/${id}/${organization}`;
    let response=await call_shirkat(url,'GET');
    bill_receiver2_store=document.querySelector("#bill_receiver2_store");
    options=``;
    for(let i=0; i<response.data.length; i++){
        options=options+`<option value='${response.data[i]['id']}'>${response.data[i]['name']}</option`
    }
    bill_receiver2_store.innerHTML=''
    bill_receiver2_store.insertAdjacentHTML('beforeend', options);
}

// try{
//      detail_or_update_bill_no= document.getElementById("detail_or_update");
//     //  console.log("detail_or_update_bill_no ",detail_or_update_bill_no.value==1)
//      if(parseInt(detail_or_update_bill_no.value)===1)
//     {
//         console.log("detail_or_update_bill_no.value == 1")
//     }
//     else{

// show_store();
        
//     }
    
//     }
//     catch(err)
//     {
//         console.log("error store ",err)
//     }
