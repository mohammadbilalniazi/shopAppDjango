
function select_translation(src,dest)
{   console.log("src=",src)
    console.log("dest=",dest)
    let k=0;

    url="/language/translate/"+src+"/"+dest+"/";
   
    axios({
        method:"GET",
        url:url
        // data:JSON.stringify(postForm),
        // headers:{"Content-Type":"application/json","X-CSRFToken":getCookie('csrftoken')}
    }).then(function(response){
        // console.log("response=",response);
        for(key in response['data']){
            arr=response['data'][key]
            id=arr[0];
            value=arr[1];
            // console.log("id=",id," value ",value)
            try{
                element=document.getElementById(id);
                if(element){     
                    element.textContent=value;   
                }
            }
            catch(err){
                console.log("err ",err);
            }
            // console.log("id=",id," value=",value,arr)
        }
        // console.log("response['data']",response['data'])
    })
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


function insert_language_detail(src,dest)
{   
    console.log("src=",src)
    console.log("dest=",dest)
    // alert(src,"$$$$$$$$$",dest);
    var ids = document.querySelectorAll('[id]');
    var arr = Array.prototype.map.call( ids, function( el, i ) {
        return el.id;
    });
    const csrftoken = getCookie('csrftoken');
    // console.log("make_keys############",arr)
    list_form_data=[]//#################yazrzi format
    let k=0;

    for(let i=0; i<arr.length; i++)
    {
        id=arr[i]
        try
        {
            if(id.endsWith("label") || id.endsWith("detail"))
            {
            console.log("id ",id)
            text=document.getElementById(id).textContent;
            // text=text.replace(/ {2}|\r\n|\n|\r/gm, ' ');   
            text=text.replace(/\r\n|\n|\r/gm, ' ');      
            obj_dict_form={'id_field':arr[i],'text':text};
            list_form_data.push(obj_dict_form);
            // k=i;
            // k=k+1;
            }
            else
            {
                text="";
            }
        }
        catch
        {
            text="";
        }
    }
    url="/insert_language_detail/"+src+"/"+dest+"/";
    postForm={
    "language_insert":list_form_data
    }
    console.log("list_form_data=",JSON.stringify(postForm))
    axios({
        method:"POST",
        url:url,
        data:JSON.stringify(postForm),
        headers:{"Content-Type":"application/json","X-CSRFToken":getCookie('csrftoken')}
    }).then(function(response){
        // console.log("response=",response);
        for(key in response['data']){
            arr=response['data'][key]
            id=arr[0];
            value=arr[1];
            // console.log("id=",id," value ",value)
            try{
                element=document.getElementById(id);
                if(element){     
                    element.textContent=value;   
                }
            }
            catch(err){
                console.log("err ",err);
            }
            // console.log("id=",id," value=",value,arr)
        }
        // console.log("response['data']",response['data'])
    })
 return ;                     

}
