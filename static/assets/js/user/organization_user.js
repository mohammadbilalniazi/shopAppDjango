
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
    role=document.getElementById("role");
    // prev_selling_price=document.getE
    // ementById("prev_selling_price");
    // const organization_user = new FormData();
    const formData=new FormData();
    
    formData.append("id",id.value);
    formData.append("first_name",first_name.value);
    formData.append("role",role.value);
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
            // alert("Organization_User Saved")
            show_message("User Saved","success");
            // wait 5 seconds then redirect
            id.value=response.data.id;

            setTimeout(function(){
                window.location.href="/user/organization_user/add/"+id.value;
            }, 5000);
        }
        else
        {
            show_message(response.data.message,"error");   
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
    if(url==null){
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
            previous = `<tr><td> <a href="${prv}" class="btn btn-success" role="button" data-url="${prv}" onclick="handlePaginationClick(event)">Previous</a></td></tr>`;
        }
        if (nex) {
            next = `<tr><td> <a href="${nex}" class="btn btn-success" role="button" data-url="${nex}" onclick="handlePaginationClick(event)">Next</a></td></tr>`;
        }
        html = next + previous
        pagination.insertAdjacentHTML('beforeend', html);
        organization_user_tbody.innerHTML="";
        if(!data['ok'])
        {
            alert("data['message'] ",data['message'])
            return;
        }
        for(key in data['serializer_data']){     
            let row=`
                <tr>
                    <td>${data['serializer_data'][key]['organization']}</td>
                    <td>${data['serializer_data'][key]['username']}</td>
                    <td>${data['serializer_data'][key]['first_name']}</td>
                    <td>${data['serializer_data'][key]['last_name']}</td>
                    <td>${data['serializer_data'][key]['role']}</td>
                      <td>
                        <img src="${data['serializer_data'][key]['img'] || '/static/default.png'}" width="50" height="50"/>
                      </td>

                    <td> <a href="/user/organization_user/add/${data['serializer_data'][key]['id']}" class="btn btn-success" >update</a>
                    <a class="btn btn-danger" onclick="deleteOrganizationUser(${data['serializer_data'][key]['id']});return false">Delete</a>
                    </td>
                </tr>`;
            organization_user_tbody.insertAdjacentHTML('beforeend', row);
        }
        console.log("product response ",response);
        }
    }
}
search();

function handlePaginationClick(event) {
    event.preventDefault();  // Prevent default GET request
    const url = event.currentTarget.getAttribute("data-url");
    search(url); // Call your function with correct URL (still uses POST)
}

function deleteOrganizationUser(id){
    if(!confirm("Are you sure you want to delete this user?")){
        return;
    }
    url="/user/organization_user/delete/"+id;
    headers={'X-CSRFToken':getCookie('csrftoken')} 
    call_shirkat(url,'DELETE',{},headers).then((response)=>{
        console.log('res ',response)
        if(response.status==204){
            show_message("User Deleted","success");
            search();
        }
        else{
            show_message("User Not Deleted ","error")
        }
        return false;
    });
}