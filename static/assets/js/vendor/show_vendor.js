async function show_vendor(id="all")
{   
    console.log("id ",id);
        var url=`/vendors/${id}`;  
    const response=await call_shirkat(url,'GET',null);
    // console.log("vendor ",response.data)
    return response.data;
}