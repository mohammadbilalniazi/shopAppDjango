function show_message(msg,msg_type)
{
    console.log("msg",msg," msg_type ",msg_type);
    var options={closeButton: false,
        debug: false,
        newestOnTop: false,
        progressBar: true,
        positionClass: "toast-top-center",
        preventDuplicates: false,
        onclick: null,
        showDuration: "300",
        hideDuration: "30000",
        timeOut: "20000",
        extendedTimeOut: "1000",
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut"};
        if(msg_type=="success")
        {
            toastr.success(msg,{
                options
                });
        }
        else if(msg_type=="error"){
            toastr.error(msg,{
                options
                });
        } 
        else{
            toastr.warn(msg,{
                options
                }); 
        }  
}