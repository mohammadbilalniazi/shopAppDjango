
async function generate_product_ihsaya_service(id)
{   
    // alert("called purchaser_show")
    let url=`/generate_product_ihsaya_service/${id}`
    purchaser=document.getElementById("purchaser");
    let response=await axios({
            method:"GET",
            url:url,
            headers:{'type':'application/json','X-CSRFToken':getCookie("csrftoken")}
        });
    // console.log("response.data=",response.data)
    // return response.data;
}