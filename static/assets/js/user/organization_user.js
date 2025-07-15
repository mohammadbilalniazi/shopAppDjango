var organization_user_form=document.getElementById('organization_user_form');
organization_user_form.addEventListener("submit",async function(e){
    e.preventDefault();
    id=document.getElementById("id");
    console.log("organization_user_form ",organization_user_form.action) 
    if(id.value=="")
    {
        id.value=null;
    }
    organization=document.getElementById("organization");
    img=document.getElementById("img");
    console.log("img ",img.files[0])
    first_name=document.getElementById("first_name");    
    last_name=document.getElementById("last_name");
    username=document.getElementById("username");
    password=document.getElementById("password");
    // prev_selling_price=document.getE
    // ementById("prev_selling_price");
    // const organization_user = new FormData();
    const formData=new FormData();
    
    formData.append("id",id.value);
    formData.append("first_name",first_name.value);
    formData.append("last_name",last_name.value);
    formData.append("organization",organization.value);
    formData.append("img",img.files[0]);
    formData.append("username",username.value);
    formData.append("password",password.value);
    url=organization_user_form.action;
    headers={'Content-Type': 'multipart/form-data','X-CSRFToken':getCookie('csrftoken')} 
    const response=await call_shirkat(url,'POST',formData,headers);
    console.log('res ',response)
     if(response.status==200 || response.status==201){
        if(response.data)
        { 
            alert("Organization_User Saved")
            id.value=response.data.id;
            window.location.href="/user/organization_user/add/"+id.value;
        }
        else
        {
            show_message(response.data.message,"error");   
            alert(response.data.message);
        }
    }
    else{
        show_message("User Not Created ","error")
    }
    return false;
});

async function search(url=null){
    console.log("organization_user_form ",organization_user_form.action) 
    organization=document.getElementById("organization");
    first_name=document.getElementById("first_name");    
    last_name=document.getElementById("last_name");
    username=document.getElementById("username");
    headers={'X-CSRFToken':getCookie('csrftoken')} 
    if(!url){
        url="/user/organization_user/search/";
    } 
    const data={"is_paginate":1};
    if(organization.value){
        data['organization']=organization.value
    }
    
    if(first_name.value){
        data['first_name']=first_name.value
    }
    
    if(last_name.value){
        data['last_name']=last_name.value
    }
    
    if(username.value){
        data['username']=username.value
    }
    const response=await call_shirkat(url,'POST',data,headers);
    console.log('res ',response)
     if(response.status==200 || response.status==201){
        if(response.data)
        { 
            prv=response.data['previous']
            nex=response.data['next']
            let data=response.data.results;
        // console.log("data ",data);
        const organization_user_tbody = document.querySelector('#organization_user_body');
        pagination = document.querySelector("#pagination_id");
        // console.log("pagination ",pagination.innerHTML)
        pagination.innerHTML = "";
        previous = ``;
        next = ``;
        if (prv) {
            previous = `<tr><td>  <a href="${prv}" onclick='search(this.getAttribute("href")); return false;'  class="btn btn-success" role="button"> Previous </a> </td></tr>`;
        }
        if (nex) {
            next = `<tr><td> <a  href="${nex}" onclick='search(this.getAttribute("href")); return false;' class="btn btn-success" role="button"> Next </a>  </td></tr>`;
        }
        html = next + previous
        pagination.insertAdjacentHTML('beforeend', html);
        organization_user_tbody.innerHTML="";
        // console.log(data)
        
        //console.log('data ',data);
        if(!data['ok'])
        {
            alert("data['message'] ",data['message'])
            // show_message(data['message'],"error");
            return;
        }
        for(key in data['serializer_data']){     
            let row=`
                <tr>
                    <td>${data['serializer_data'][key]['organization']}</td>
                    <td>${data['serializer_data'][key]['user']}</td>
                    <td> <a href="/user/organization_user/add/${data['serializer_data'][key]['id']}" class="btn btn-success" >update</a> </td>
                </tr>`;
            organization_user_tbody.insertAdjacentHTML('beforeend', row);
        }
        console.log("product response ",response);
        }
    }
}
