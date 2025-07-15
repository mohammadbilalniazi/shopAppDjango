async function search_product(url=null,search_by_org=false)
{
    let item_name=document.getElementById("item_name");
    let formdata={"item_name":item_name.value,'is_paginate':1}
    if(search_by_org){
        let organization=document.getElementById("organization").value;
        formdata['organization']=organization;
    }
    console.log("data product search",formdata);
    if(url==null){
        url='/products/'
    }
    let response=await call_shirkat(
                url,
                "POST",
                JSON.stringify(formdata)
                );
    prv=response.data['previous']
    nex=response.data['next']
    let data=response.data.results;
    // console.log("data ",data);
    const product_tbody = document.querySelector('#product_body');
    pagination = document.querySelector("#pagination_id");
    // console.log("pagination ",pagination.innerHTML)
    pagination.innerHTML = "";
    previous = ``;
    next = ``;
    if (prv) {
        previous = `<tr><td>  <a href="${prv}" onclick='search_product(this.getAttribute("href"),${search_by_org}); return false;'  class="btn btn-success" role="button"> Previous </a> </td></tr>`;
    }
    if (nex) {
        next = `<tr><td> <a  href="${nex}" onclick='search_product(this.getAttribute("href"),${search_by_org}); return false;' class="btn btn-success" role="button"> Next </a>  </td></tr>`;
    }
    html = next + previous
    pagination.insertAdjacentHTML('beforeend', html);
    product_tbody.innerHTML="";
    // console.log(data)
    
    //console.log('data ',data);
    if(!data['ok'])
    {
        alert("data['message'] ",data['message'])
        // show_message(data['message'],"error");
        return;
    }
    for(key in data['serializer_data']){     
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
                <td>${data['serializer_data'][key]['model']}</td>
                <td>${data['serializer_data'][key]['category']}</td>
                <td>${minimum_requirement}</td>
                <td>${data['serializer_data'][key]['purchase_amount']}</td>
                <td>${data['serializer_data'][key]['selling_amount']}</td> 
                <td>
                    <input type="number" id="stock_input_${data['serializer_data'][key]['id']}" value="${data['serializer_data'][key]['current_amount']}" class="form-control" />
                </td>
                <td>${purchased_price}</td><td>${selling_price}</td>
                <td> <a href="/product/product/add/${data['serializer_data'][key]['id']}" class="btn btn-success" >update</a> </td>
                <td>
                <button class="btn btn-primary" onclick="return update_stock(event, ${data['serializer_data'][key]['id']});">Update Stock</button>
                </td>
            </tr>`;
        product_tbody.insertAdjacentHTML('beforeend', row);
    }
    console.log("product response ",response); 
}


async function update_stock(event, product_id) {
    event.preventDefault();  // ✨ prevent default button or form submission

    const input = document.getElementById(`stock_input_${product_id}`);
    const current_amount = input.value;
    const organization_id = document.getElementById("organization").value;

    if (!organization_id) {
        alert("لطفاً اداره انتخاب کړئ");
        return false;
    }

    const formData = {
        current_amount: current_amount,
        product_id: product_id,
        organization_id: organization_id
    };

    let response = await call_shirkat("/stock/update/", "POST", JSON.stringify(formData));
    let message = document.getElementById("update_stock_message");

    if (response.status === 201 || response.status === 200) {
        message.innerHTML = "ذخیره معلومات نوي شول";
        message.style.display = 'block';
        setTimeout(() => {
            message.innerHTML = "";
            message.style.display = 'none';
        }, 2000);
    } else {
        alert("خطا: " + JSON.stringify(response.data));
    }

    return false;
}

