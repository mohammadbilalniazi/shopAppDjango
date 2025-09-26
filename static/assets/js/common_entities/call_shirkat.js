
async function call_shirkat(url,method,data,headers=null)
{
    // console.log(" headers == null",headers==null)
    // let headers=headers;
    if(headers==null){
    // console.log(" headers ",headers)
     headers={"Accept": "application/json","Content-Type":"application/json","X-CSRFToken":getCookie('csrftoken')}
    }
    let response='';
    // console.log("headers ",headers);
    if(method=='POST')
    {   
        response= await axios(
        {
        url:url,
        method:method,
        data:data,
        headers:headers
        }
        );
    }
    else
    {
        response= await axios(
        {
        url:url,
        method:method,
        headers:{"Accept": "application/json","Content-Type":"application/json","X-CSRFToken":getCookie('csrftoken')}
        }
        );  
    }
    if((response.status==200 || response.status==201 || response.data.success) && response.data.message){
        show_message(response.data.message,"success");
    }
    else{
      if(response.data.message){
        show_message(response.data.message,"error");
      }
    }
    console.log("data ",data," method ",method,"++++response ",response,' response.data ',response.data)
    return response;
}