function bill_detail_delete(bill_detail_id)
{
   url=`/bill/detail/delete/${bill_detail_id}`;
   method="DELETE";
   let response= call_shirkat(url,method,data);
    console.log("re ",response);
}