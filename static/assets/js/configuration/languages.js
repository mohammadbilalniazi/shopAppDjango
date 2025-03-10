
async function select_translation(src,dest)
{   
    // console.log("src=",src)
    // console.log("dest=",dest)
    url="/language/translate/"+src+"/"+dest+"/";
    let response=await call_shirkat(
            url,
            "GET"
        );
        for(key in response['data']){
            arr=response['data'][key]
            id=arr[0];
            value=arr[1];
            try{
                element=document.getElementById(id);
                if(element){     
                    element.textContent=value;   
                }
            }
            catch(err){
                console.log("err ",err);
            }
        }
 return ;                     

}

function getCookie(name) {
    let cookieValue = "all";
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

