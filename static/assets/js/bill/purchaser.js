
async function show_purchaser(id=null)
{
    id='all'
    let url=`/bill/purchasers/${id}/`
    purchaser=document.getElementById("purchaser");
    let response=await call_shirkat(url,'GET');
    return response.data;
}



async function create_purchasers()
{
    // console.log("purchaser ",response)
    var data_dict=await show_purchaser()
    // console.log("data_dict ",data_dict)
    for(let key in data_dict)
    {
        var label=data_dict[key]['name'];
        var value=data_dict[key]['id'];
        var name=null;
        var id=null
        // console.log("id====",id)
        const element=await create_element(type="option",id,name,value,label,isrequired=false)
        // console.log("element=",element)
        document.getElementById("purchaser").appendChild(element)
    }
}