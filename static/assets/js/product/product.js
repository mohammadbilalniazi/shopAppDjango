async function search_product(url=null)
{
    let item_name=document.getElementById("item_name");
    let formdata={"item_name":item_name.value,'is_paginate':1}
    
    try{
    let store_id=document.getElementById("store");
    formdata["store_id"]=store_id.value;
    }
    catch(e){
        console.log("e",e)
    }
    console.log("data product search",formdata);
    if(url==null){
        url='/products/all/'
    }
    let response=await call_shirkat(
                url,
                "POST",
                JSON.stringify(formdata)
                );
    console.log("product response",response);
    // return 
    // let data=response.data
    prv=response.data['previous']
    nex=response.data['next']
    let data=response.data.results;
    // console.log("data ",data);
    const bill_tbody = document.querySelector('#product_body');
    pagination = document.querySelector("#pagination_id");
    // console.log("pagination ",pagination.innerHTML)
    pagination.innerHTML = "";
    previous = ``;
    next = ``;
    if (prv) {
        previous = `<tr><td>  <a href="${prv}" onclick='search_product(this.getAttribute("href")); return false;'  class="btn btn-success" role="button"> Previous </a> </td></tr>`;
    }
    if (nex) {
        next = `<tr><td> <a  href="${nex}" onclick='search_product(this.getAttribute("href")); return false;' class="btn btn-success" role="button"> Next </a>  </td></tr>`;
    }
    html = next + previous
    pagination.insertAdjacentHTML('beforeend', html);
    bill_tbody.innerHTML="";
    // console.log(data)
    
    //console.log('data ',data);
    if(!data['ok'])
    {
        alert("data['message'] ",data['message'])
        // show_message(data['message'],"error");
        return;
    }
    for(key in data['serializer_data']){     
        var creator=data['serializer_data'][key]['creator'];
        var organization="";
        if(data['serializer_data'][key]['product_detail']!=undefined && data['serializer_data'][key]['product_detail']!=null )
        {
        organization=data['serializer_data'][key]['product_detail']['organization'];
        }
        else{
        organization=null;
        }
    
        product_detail=data['serializer_data'][key]['product_detail'];
        let purchased_price=0;
        let selling_price=0;
        let minimum_requirement=0;
        if(product_detail){
            purchased_price= product_detail['purchased_price'];
            selling_price=product_detail['selling_price'];
            minimum_requirement=product_detail['minimum_requirement'];
        }
        let row=`
            <tr>
                <td>
                <a href="/product/product/add/${data['serializer_data'][key]['id']}" class="btn btn-success" >
                ${data['serializer_data'][key]['item_name']}  (${purchased_price})
                </a>
                </td>
                <td>${data['serializer_data'][key]['model']}</td><td>${data['serializer_data'][key]['category']}</td>
                <td>${minimum_requirement}</td>
                <td> ${data['serializer_data'][key]['purchase_amount']}</td>
                
                <td> ${data['serializer_data'][key]['selling_amount']}</td> 
                <td> ${data['serializer_data'][key]['current_amount']}</td>
                <td>${purchased_price}</td><td>${selling_price}</td>
                <td> <a href="/product/product/add/${data['serializer_data'][key]['id']}" class="btn btn-success" >update</a> </td>
            </tr>`; 
        bill_tbody.insertAdjacentHTML('beforeend', row);
    }
    console.log("product response ",response); 
    
}