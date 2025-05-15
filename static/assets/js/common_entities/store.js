async function show_store(organization_id="bill_rcvr_org",store_id="all")
{   
    let organization=document.getElementById(organization_id).value;
    if(organization_id=="bill_rcvr_org"){
        store_select_id='bill_receiver2_store';
    }
    else{ // it is organization list so stores id will be organization store id
        store_select_id='store';
    }
    
    let url=`/stores/${store_id}/${organization}`;
    let response=await call_shirkat(url,'GET');
    store=document.querySelector(`#${store_select_id}`);
    options=``;
    for(let i=0; i<response.data.length; i++){
        options=options+`<option value='${response.data[i]['id']}'>${response.data[i]['name']}</option>`
    }
    store.innerHTML=''
    store.insertAdjacentHTML('beforeend', options);
}
