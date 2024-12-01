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
        // data:JSON.stringify(data),\
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
    // console.log("data ",data," method ",method,"++++response ",response,' response.data ',response.data)
    return response;
}