// import {creator_show} from './creator.mjs';
var data;
var product_data;
var selling_price_obj={};
var purchasing_price_obj={};
var purchased_price;
async function products(organization="all",change_price=true)
{
    // product_id="all";
    url='/products/'+organization+"/";
    let response=await call_shirkat(url,'GET');
    console.log("##2 products response product",response)
        let item_in_list_select_index=0;
        data=response.data
        product_data=data;
        localStorage.setItem("product_data",JSON.stringify(product_data));
        for(key in data){
            selling_price_obj[data[key]['id']]=data[key]['product_detail']['selling_price']
            purchasing_price_obj[data[key]['id']]=data[key]['product_detail']['purchased_price']
            id=data[key]['id'];
            if(item_in_list_select_index===0)
            {
            selling_price=data[key]['product_detail']['selling_price'];
            purchased_price=data[key]['product_detail']['purchased_price']
            }
            item_in_list_select_index=item_in_list_select_index+1;
        }
    add_events_to_elements(change_price);
    return response.data;
}

var id;
var price;
var i;
function insert_selling_price(item_db_id,i)
{
    item_price=document.getElementsByClassName("item_price")[i];
    item_price.value=selling_price_obj[parseInt(item_db_id)]
    generate_total_amount_bill();
}

function insert_purchasing_price(item_db_id,i)
{
    // console.log("insert_purchasing_price");
    item_price=document.getElementsByClassName("item_price")[i];
    item_price.value=purchasing_price_obj[parseInt(item_db_id)]
    generate_total_amount_bill();
}

function change_price_field(item_db_id,index,bill_type_field)
{
    // console.log("###############item_db_id",item_db_id,"index",index,bill_type_field);
    item_price=document.getElementsByClassName("item_price")[index];
    // item_price.value=selling_price_obj[parseInt(item_db_id)]
    if(bill_type_field.value=="SELLING")
    {
        item_price.value=selling_price_obj[parseInt(item_db_id)]
        // insert_selling_price(item_db_id, index);
    }
    else if(bill_type_field.value=="PURCHASE")
    {
        item_price.value=purchasing_price_obj[parseInt(item_db_id)]
        // insert_purchasing_price(item_db_id, index)
    }
    generate_total_amount_bill();
    
}

function add_events_to_elements(change_price=true)
{   
    console.log("add_events_to_elements");
    try
    {
        item_amount=document.getElementsByClassName("item_amount");
        item_price=document.getElementsByClassName("item_price");
        return_qty=document.getElementsByClassName("return_qty");
        var bill_type=document.getElementById("bill_type");
        // bill_type.addEventListener("change",e=>{
        //     select_bill_no();
        // });
        item_name=document.getElementsByClassName("item_name");
        for(let i=0; i<item_amount.length; i++)
        {
            item_amount[i].addEventListener("keyup",e=>{
                generate_total_amount_bill();
            })
            item_name[i].addEventListener("change",e=>{
                // console.log("insert_selling_price i ",i)
                // insert_selling_price(e.target.value, i);
               change_price_field(e.target.value,i,bill_type);
            })
            item_price[i].addEventListener("keyup",e=>{
                console.log("*********e",e.target.value)
                generate_total_amount_bill();
            })

            return_qty[i].addEventListener("input",e=>{
                generate_total_amount_bill();
            })
            
            bill_rcvr_org=document.getElementById("bill_rcvr_org");
            bill_rcvr_org.addEventListener("change",e=>{
                generate_total_amount_bill();
                show_store();
            });  
            // if we have changed the price from default then in adding row
            // the value of that exact field should be changed
            if(change_price && item_price[i].value<=0){ 
            change_price_field(item_name[i].value,i,bill_type);
            }
        }      
    }
    catch(err)
    {
        console.log("add_events_to_elements error ",err);
    }
    return;
}


function deleteRow(btn,bill_detail_id) {
    // console.log("bill_detail_id=",bill_detail_id)
    console.log("deleteRow");
    if(parseInt(bill_detail_id)!=0)
    {
        bill_detail_delete(parseInt(bill_detail_id))
    }
    var row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
     generate_total_amount_bill();
    add_events_to_elements();
    return;
}

async function adding_row(){
    // alert("called")
    bill_type=document.getElementById("bill_type");
   if(bill_type.value=="PURCHASE" || bill_type.value=="RECEIVEMENT")
    {
        organization=document.getElementById("bill_rcvr_org");
    }
    else{
        organization=document.getElementById("organization");
    }

    // let data=await products(document.getElementById("organization").value);
    // let data=await products(organization.value);
    // console.log("##1 response product data ",data)
    const arr=[];
    // table_form=document.getElementById("table_form");
    table_form=document.getElementById("table_body");
    var list_tr=document.createElement("tr");
    table_form.appendChild(list_tr);
    //###item_name
    var td_in_tr1=document.createElement("td");
    var div_in_td1=document.createElement("div");
    // var div_in_div1=document.createElement("div");
    var select_item_name_in_div=document.createElement("select");
    select_item_name_in_div.className='item_name';
    select_item_name_in_div.name='item_name';
    select_item_name_in_div.required=true;
    console.log("#### product_data ",product_data);
    product_data_str=localStorage.getItem("product_data");
    product_data=JSON.parse(product_data_str)
    let item_in_list_select_index=0;
    for(key in product_data){
        var option_in_select=document.createElement("option");
        //alert(data)
        console.log("## product_data[key]['purchased_price'] ",product_data[key]['purchased_price']," product_data[key] ",product_data[key])
        option_in_select.value=product_data[key]['id'];
        option_in_select.innerText=product_data[key]['item_name']+" "+product_data[key]['product_detail']['purchased_price'].toString();
        select_item_name_in_div.appendChild(option_in_select);
        selling_price_obj[product_data[key]['id']]=product_data[key]['product_detail']['selling_price']
        purchasing_price_obj[product_data[key]['id']]=product_data[key]['product_detail']['purchased_price']
        id=product_data[key]['id'];
        if(item_in_list_select_index===0)
        {
        selling_price=product_data[key]['product_detail']['selling_price'];
        purchased_price=product_data[key]['product_detail']['purchased_price'];
        }
        item_in_list_select_index=item_in_list_select_index+1;
    }
    div_in_td1.appendChild(select_item_name_in_div);
    td_in_tr1.appendChild(div_in_td1);
    list_tr.appendChild(td_in_tr1);
    // console.log("price= called ",price) 
    // ###########unit########################
    var td_in_tr1=document.createElement("td");
    var div_in_td1=document.createElement("div");
    var select_unit_in_div=document.createElement("select");
    select_unit_in_div.className='unit';
    select_unit_in_div.name='unit';
    select_unit_in_div.required=true;
    id="all"
    unit_url=`/units/${id}/`;
    fetch(unit_url,{
        'method':'GET'
    }).then(response=>response.json()).then(data=>{
        // console.log("data.length ",data.length)
        for(key in data){        
            var option_in_select=document.createElement("option");
            option_in_select.value=data[key]['id'];
            option_in_select.innerText=data[key]['name'];
            select_unit_in_div.appendChild(option_in_select);
        } 
    });
    
    div_in_td1.appendChild(select_unit_in_div);   
    td_in_tr1.appendChild(div_in_td1);
    list_tr.appendChild(td_in_tr1);

    // ###########item_amount########################
    var item_amount_in_div=document.createElement("input");
    item_amount_in_div.type="number";
    item_amount_in_div.className='item_amount';
    item_amount_in_div.name='item_amount';
    item_amount_in_div.required=true;
    var td_in_tr2=document.createElement("td");
    var div_in_td2=document.createElement("div");
    list_tr.appendChild(td_in_tr2);
    td_in_tr2.appendChild(div_in_td2);
    div_in_td2.appendChild(item_amount_in_div);
    //#########################item_price################
    var item_price_in_div=document.createElement("input");
      
    item_price_in_div.type="number";
    item_price_in_div.name='item_price';
    item_price_in_div.className='item_price';
    
    item_price_in_div.min="0"
    
    item_price_in_div.value="0";
    
    item_price_in_div.step=".001";
    var bill_type=document.getElementById("bill_type");
    // Logic   :  selling price for selling purchase price for purchase
    if(bill_type.value=="SELLING")
    {
        item_price_in_div.value=selling_price;
    }
    else if(bill_type.value=="PURCHASE") // in purchase the bill takes the selling 
    {
        //price of the bill_receiver2 organizaiton product 
        //not he purchasing price of that organization because they are selling 

        item_price_in_div.value=purchased_price;
        // item_price_in_div.value=selling_price;
    }

    item_price_in_div.required=true;
    var td_in_tr2=document.createElement("td");
    var div_in_td2=document.createElement("div");
    
    div_in_td2.appendChild(item_price_in_div);
    td_in_tr2.appendChild(div_in_td2);
    list_tr.appendChild(td_in_tr2);
    
    // console.log("item_price_in_div reached")
    //#########################return_qty################
    var return_qty_in_div=document.createElement("input");
    return_qty_in_div.type="number"
    // return_qty_in_div.id='return_qty'
    return_qty_in_div.name='return_qty'
    return_qty_in_div.className='return_qty'
    return_qty_in_div.value=0
    return_qty_in_div.required=true;
    
    var td_in_tr2=document.createElement("td");
    var div_in_td2=document.createElement("div");
    div_in_td2.appendChild(return_qty_in_div)
    td_in_tr2.appendChild(div_in_td2)
    list_tr.appendChild(td_in_tr2)
    
    var bill_detail_id_in_div=document.createElement("input");
    bill_detail_id_in_div.type="hidden"
    bill_detail_id_in_div.name='bill_detail_id'
    bill_detail_id_in_div.className='bill_detail_id'
    // return_qty_in_div.value=0
    bill_detail_id_in_div.required=true;
    var td_in_tr2=document.createElement("td");
    var div_in_td2=document.createElement("div");
    
    div_in_td2.appendChild(bill_detail_id_in_div)
    td_in_tr2.appendChild(div_in_td2)
    list_tr.appendChild(td_in_tr2)

    var input_in_td=document.createElement("input");
    input_in_td.type="button";
    input_in_td.value="remove";
    input_in_td.id="remove_btn";
    
    input_in_td.className="remove_btn";
    input_in_td.style.cssText="font-weight:900;font-size:16px; background-color:red;color:black; padding:0px; margin:0px;";
    input_in_td.onclick=function(){deleteRow(this,0); return;}
    var td_in_tr=document.createElement("td");
    td_in_tr.appendChild(input_in_td);
    list_tr.appendChild(td_in_tr);
    //#######################now add events to created elements########################
    add_events_to_elements();   
}

try
{
    detail_or_update=document.getElementById("detail_or_update");
    if(detail_or_update.value==="0")
    {    
    select_rcvr_orgs();
    }
}
catch(EX)
{
    console.log("detail_or_update not exist")
}


function generate_total_amount_bill()
{
    console.log("generate_total_amount_bill");
    item_amount=document.getElementsByClassName("item_amount");
    item_price=document.getElementsByClassName("item_price");
    return_qty=document.getElementsByClassName("return_qty");

    total=document.getElementById("total");
    total.value=0;
    // console.log("selling_price_obj in generate_total_amount_bill",selling_price_obj)
    offset=0; 
    for(let i=0; i<item_amount.length; i++)
    {
        if(parseFloat(return_qty[i].value)>parseFloat(item_amount[i].value))
        {            
        // console.log("return_qty[i].value is should be less than item_amount",return_qty[i].value)
        return_qty[i].value=0;
        }
        amount=item_amount[i].value;
        ret_qty=return_qty[i].value;
        price=item_price[i].value;
        // console.log("offset ",offset," amount ",amount," price ",price," ret_qty ",ret_qty)
       
        if(amount==""){
            amount=0;
        }
        if(ret_qty==""){
            ret_qty=0;
        }
        if(price==""){
            price=0;
        }
        // console.log("offset ",offset," amount ",amount," price ",price," ret_qty ",ret_qty)
        offset=parseFloat(offset)+parseFloat(parseFloat(amount))*parseFloat(price)-parseFloat(parseInt(ret_qty))*parseFloat(price);
        if(amount==0)
        {
            break;
        }   
    }
    // console.log("offset ",offset)
    total.value=offset;
    if(amount==0)
    {
        return false;
    }   
    else{
        return true;
    } 
}


function total_and_paid_validation()
{
    // alert("total_and_paid_validation called")
    var total_payment_element=document.getElementById("total_payment");
    var total_bill_element=document.getElementById("total");
    bill_type=document.getElementById("bill_type");
    // console.log("total_bill_element.value",total_bill_element.value," total_payment_element.value ",total_payment_element.value )
    // console.log("parseFloat(total_bill_element.value)<parseFloat(total_payment_element.value) ",parseFloat(total_bill_element.value)<parseFloat(total_payment_element.value))
    if(bill_type.value=="PAYMENT" || bill_type.value=="RECEIVEMENT" || bill_type.value=="EXPENSE")
    {   
        return true;
    }
    if(parseFloat(total_bill_element.value)<parseFloat(total_payment_element.value))
    {
        flag=confirm("paid is more than total do you agree")
        total_payment_element.value=total_bill_element.value;
        return flag;
    }
    else
    {
        total_payment_element.value=parseFloat(total_payment_element.value);
        return true;
    }
}


bill=document.getElementById("bill");
async function submit_validation_function()
{        
   
   flag=true;
   item_name=document.getElementsByClassName("item_name");  
       
   item_name_list=[]
   for(let i=0; i<item_name.length; i++)
   {
    item_name_list.push(item_name[i].value);   
   }

   seen = item_name_list.filter((s => v => s.has(v) || !s.add(v))(new Set));
//    console.log("seen ",seen);
   if(seen.length>0)
   {
    console.log("seen ",seen);
    flag=confirm("Item is seen Do you want to add same item again")
    // flag=true;
   }

    if(!generate_total_amount_bill())
    {
        // console.log("generate_total_amount_bill ",generate_total_amount_bill);
        flag=false;
    } 
    
    total_and_paid_validated=total_and_paid_validation();
    if(!total_and_paid_validated){
        // console.log('total_less_than_paid not validate ',total_and_paid_validated)
        flag= false; 
    }
        
  
    return flag;   
}


try{
     document.getElementById("bill").addEventListener("submit",async function(e){
        e.preventDefault();
        date=document.getElementById("date");
        organization=document.getElementById("organization");
        bill_rcvr_org=document.getElementById("bill_rcvr_org");
        bill_receiver2_store=document.getElementById("bill_receiver2_store");
        store=document.getElementById("store");
        creator=document.getElementById("creator");
        total=document.getElementById("total");
        total_payment=document.getElementById("total_payment");
        bill_no=document.getElementById("bill_no");
        bill_id=document.getElementById("bill_id");
        bill_type=document.getElementById("bill_type");
        is_approved=document.getElementById("is_approved");
        // status=document.getElementById("status");
        status_bill=document.getElementById("status");
        console.log("##is_approved ",is_approved," status_bill ",status_bill.value," store ",store.value);
        approval_date=document.getElementById("approval_date");
        approval_user=document.getElementById("approval_user");
 
        if(bill_type.value=="PAYMENT" || bill_type.value=="RECEIVEMENT"){
            bill_obj={
                "date":date.value,
                "organization":organization.value,
                "store":store.value,
                "creator":creator.value,
                "total":total.value,
                "total_payment":total_payment.value,
                "bill_no":bill_no.value,
                "bill_type":bill_type.value,
                "id":bill_id.value,    
                "bill_rcvr_org":bill_rcvr_org.value,
                "is_approved":is_approved.value,
                "status":status_bill.value,
                "bill_receiver2_store":bill_receiver2_store.value,
                "approval_date":approval_date.value,
                "approval_user":approval_user.value,
            }
            flag=true;
        }
        else
        {
            item_name=document.getElementsByClassName("item_name");
            item_price=document.getElementsByClassName("item_price");
            item_amount=document.getElementsByClassName("item_amount");
            unit=document.getElementsByClassName("unit");
            return_qty=document.getElementsByClassName("return_qty");
            bill_detail_id=document.getElementsByClassName("bill_detail_id");
            
            item_name_list=[];
            item_price_list=[];
            item_amount_list=[];
            unit_list=[];
            return_qty_list=[]
            bill_detail_id_list=[]
            for(let i=0; i<item_amount.length; i++)
            {
                item_name_list.push(item_name[i].value);
                
                item_price_list.push(item_price[i].value);
                
                item_amount_list.push(item_amount[i].value);
                
                unit_list.push(unit[i].value);
                
                return_qty_list.push(return_qty[i].value);
                bill_detail_id_list.push(bill_detail_id[i].value)
            }
            bill_obj={
                
                "id":bill_id.value,
                "date":date.value,
                "organization":organization.value,
                "store":store.value,
                "bill_receiver2_store":bill_receiver2_store.value,
                "creator":creator.value,
                "total":total.value,
                "total_payment":total_payment.value,
                "bill_no":bill_no.value,
                "bill_type":bill_type.value,
                "bill_rcvr_org":bill_rcvr_org.value,
                "is_approved":is_approved.value,
                 "status":status_bill.value,
                "approval_date":approval_date.value,
                "approval_user":approval_user.value,
                
                "item_name":item_name_list,
                "item_price":item_price_list,
                "item_amount":item_amount_list,
                "unit":unit_list,
                "return_qty":return_qty_list,
                "bill_detail_id":bill_detail_id_list,
            }
        flag=await submit_validation_function();
        
        }
        

        console.log("flage ",flag," bill_obj ",bill_obj)
        // return ;
        if(flag)
        {
            let response=await call_shirkat(
                   "/bill/insert/",
                    "POST",
                    JSON.stringify(bill_obj)
                );
            console.log("response bill insert",response)
            if(response.status==200 || response.status==201){
                // console.log("response=",response," response.data.ok ",response.data.ok);
                generate_product_ihsaya_service(store.value)
                if(response.data.ok)
                {
                    show_message("bill Created ","success");
                    var host=location.protocol + '//' + location.host
                     window.location.href=host+"/bill/detail/"+response.data.bill_id+"/";
                }
                else
                {
                    show_message(response.data.message,"error");   
                }
            }
            else{
                show_message("bill Not Created ","error")
            }
        }   
        else{
            show_message("No Validated Form ","error")
        }
    });
}  
catch(e)
{
    console.log("getElementById(bill) error")
}
async function select_rcvr_orgs(){
    try{
        rcvr_org_span=document.getElementById("rcvr_org_span");
        //console.log("rcvr_org_span=",rcvr_org_span)
        rcvr_org_span.innerHTML="";
    }
    catch(e)
    {
        return;
    }
   
    var select_rcvr_org_in_div=document.createElement("select");
    select_rcvr_org_in_div.id='bill_rcvr_org';
    select_rcvr_org_in_div.name='bill_rcvr_org';
    select_rcvr_org_in_div.required=true;
    rcvr_org_id="all";
    url='/organizations/'+rcvr_org_id+'/';
    await fetch(url,{
        'method':'GET'
    }).then(response=>response.json()).then(data=>{
        //alert(data.length)
        // console.log("key=",key," rcvr_orgs=",data)
        for(key in data){
            //console.log("key=",key," data[key]=",data[key])
            var option_in_select=document.createElement("option");
            option_in_select.value=data[key]['id'];
            option_in_select.innerText=data[key]['name'];
            select_rcvr_org_in_div.appendChild(option_in_select);
            // select_item_name_in_div.appendChild(option_in_select2)
        }
        const plus= create_element("a",null,null,null,null,false,"addlink")
        plus.href="/admin/configuration/organization/add/"
        // console.log("plus ",plus);
        rcvr_org_span.appendChild(select_rcvr_org_in_div);   
        rcvr_org_span.appendChild(plus);   
        // bill_rcvr_org=document.getElementById("bill_rcvr_org");
        show_store();
        select_rcvr_org_in_div.addEventListener("change",e=>{
            show_store();
            document.getElementById("table_body").innerHTML="";
        });  
    });
}

try
{
    
    document.getElementById("total_payment").addEventListener("input",(e)=>{
        // alert("test")
        total_and_paid_validated=total_and_paid_validation()
    });    
   
}
catch(e)
{
    console.log("total_payment error");
}


 
try
{
    // add_events_to_elements();
    document.getElementById("bill_type").addEventListener("change",(e)=>{
        select_bill_no();
        addnawajans=document.getElementById("addnawajans");
        var total_bill_element=document.getElementById("total");
        total_bill_element.value=0;
        var total_payment_element=document.getElementById("total_payment");
        total_payment_element.value=total_bill_element.value;
        
        remove_btns=document.getElementsByClassName("remove_btn");
        console.log("remove_btns ",remove_btns.length)
        if(e.target.value=="PAYMENT" || e.target.value=="RECEIVEMENT" || e.target.value=="EXPENSE")
        {
            for(var i=0; i<remove_btns.length; i++)
            {
                console.log("remove_btn i",i)
                remove_btn=remove_btns[i];
                remove_btn.click();
            }
            total_bill_element.disabled=true;
            addnawajans.disabled=true;
        }
        else
        {
            total_bill_element.disabled=false;
            addnawajans.disabled=false;
        }
        add_events_to_elements();
    });    
}
catch(e)
{
    console.log("total_payment error ",e);
}


async function init(){
    // if(bill_type.value=="PURCHASE" || bill_type.value=="RECEIVEMENT")
    //     {
    //         bill_rcvr_org=document.getElementById("bill_rcvr_org");
    //         organization=document.getElementById("organization");
    //     }
    //     else{
    //         bill_rcvr_org=document.getElementById("bill_rcvr_org");
    //         organization=document.getElementById("organization");
    //     }
        addnawajans=document.getElementById("addnawajans");
        addnawajans.disabled=true;
        let data=await products(organization.value,false);
        // add_events_to_elements();
        addnawajans.disabled=false;
}
init();