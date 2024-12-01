
async function make_table(data)
{
    console.log("make_table data",data)
    // return;
    prv=data['previous']
    nex=data['next']
    data=data.results;
    
    const bill_tbody = document.querySelector('#product_body');
    pagination = document.querySelector("#pagination_id");
    // console.log("pagination ",pagination.innerHTML)
    pagination.innerHTML = "";
    previous = ``;
    next = ``;
    if (prv) {
        previous = `<tr><td>  <a href="${prv}" onclick='search_bills(this.getAttribute("href")); return false;'  class="btn btn-success" role="button"> Previous </a> </td></tr>`;
    }
    if (nex) {
        next = `<tr><td> <a  href="${nex}" onclick='search_bills(this.getAttribute("href")); return false;' class="btn btn-success" role="button"> Next </a>  </td></tr>`;
    }
    html = next + previous
    pagination.insertAdjacentHTML('beforeend', html);
    bill_tbody.innerHTML="";
    // console.log(data)
    
    //console.log('data ',data);
    if(!data['ok'])
    {
        alert("data['message'] ",data['message'])
        show_message(data['message'],"error");
        return;
    }
    for(key in data['serializer_data']){     
        var creator=data['serializer_data'][key]['creator'];
        var bill_rcvr_org="";
        if(data['serializer_data'][key]['bill_receiver2']!=undefined && data['serializer_data'][key]['bill_receiver2']!=null )
        {
         bill_rcvr_org=data['serializer_data'][key]['bill_receiver2']['bill_rcvr_org'];
        }
        else{
         bill_rcvr_org=null;
        }
     
        let update_href=`/bill/update/${data['serializer_data'][key]['id']}/`;
        if(data['serializer_data'][key]['bill_type']=="EXPENSE"){
            update_href=`/expenditure/bill/form/${data['serializer_data'][key]['id']}/`;
        }
        let row=`
            <tr>
                <td>${data['serializer_data'][key]['organization']}</td>
                <td>${data['serializer_data'][key]['bill_no']}(<span style="color:green;font-weight:600">${data['serializer_data'][key]['bill_type']}</span>)</td>
                <td>${bill_rcvr_org}</td><td>${data['serializer_data'][key]['total']}</td>
                <td>${data['serializer_data'][key]['payment']}</td><td>${data['serializer_data'][key]['date']}</td>
                <td> <a href="${update_href}" class="btn btn-success" role="button">update</a> | <a href="/bill/delete/${data['serializer_data'][key]['id']}/not_allowed" role="button" class="btn btn-success">delete</a> | <a href="/bill/detail/${data['serializer_data'][key]['id']}/" role="button" class="btn btn-info">Detail</a>
                </td>
            </tr>`; 
        bill_tbody.insertAdjacentHTML('beforeend', row);
    }
}