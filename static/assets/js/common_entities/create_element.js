function create_element(type,id,name,value,label,isrequired=true,className=null)
{
    // console.log("id=",id,"name=",name,"value=",value,"label=",label,isrequired=true)
    var element=document.createElement(type);
    if(id!=null)
    {
        element.id=id;
    }

    if(name!=null)
    {
        element.name=name;
    }
    if(value!=null)
    {
        element.value=value;
    }
    if(label!=null)
    {
        element.innerText=label;
    }
    if(className!=null)
    {
        element.className=className;
    }
    
    if(isrequired)
    {
        element.required=isrequired;
    }
    // console.log("create element ",element);
    // console.log("test ",element)
    return element;
}