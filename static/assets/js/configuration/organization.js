
async function show_rcvr_org(id="all")
{   
    var url=`/organizations/${id}`;
    const response=await call_shirkat(url,'GET');
    return response.data;
}

async function locations()
{
    
const response=await call_shirkat('/configuration/location/','GET',null);

// {'type':'select','id':'id_location','parent':null,'already_created':true}
console.log('response ',response)
    const location=document.getElementById('location');
    const update_location_at_bill=document.getElementById('update_location_id');
    if(update_location_at_bill==null)
    {
        return;
    }
    for(var i=0; i<response.data.length;i++)
    {
    var element=create_element('option',response.data[i].id,response.data[i].id,response.data[i].id,response.data[i].city,null,null);
    // console.log('element ',element)
    // console.log('update_location ',update_location_id.value,' update_organization.value not empty ',update_location_id.value!='',' data.data[i] ',data.data[i].id )
    // console.log('location.value ',location.value," ,data.data[i].id ",data.data[i].id)
    if(update_location_at_bill.value!='')
    {
        // console.log('location.value!= empty ',location.value,' data.data[i].id ',data.data[i].id);
        // console.log('parseInt(location.value)===parseInt(data.data[i].id) ',parseInt(location.value)===parseInt(data.data[i].id))
        if(parseInt(update_location_at_bill.value)===parseInt(response.data[i].id))
        {
        console.log('update_location_id.value==data.data[i].id ',update_location_at_bill.value==response.data[i].id);
        element.selected=true;
        }
    }
    location.appendChild(element);
    }
}
locations();
            

