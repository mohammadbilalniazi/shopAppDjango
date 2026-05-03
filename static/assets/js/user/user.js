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

async function submit_login()
{
    username = document.getElementById("username").value;
    password = document.getElementById("password").value;

    // Clear previous error
    document.getElementById("error").innerHTML = "";

    form = {
        "username": username,
        "password": password
    }

    url = "/login_form/submit/"
    try {
        const response = await call_shirkat(url, 'POST', form);
        let new_url = response['data']['base_url'];
        let status = response['data']['status'];
        let message = response['data']['message'];
        console.log("response['data']['base_url']=", new_url);
        console.log("response['data']['status']=", status);
        if (status == 200) {
            window.location.replace(new_url);
        } else {
            document.getElementById("error").innerHTML = message;
            if (typeof show_message === 'function') {
                show_message(message || "Login failed", "error");
            } else {
                alert(message || "Login failed");
            }
        }
    } catch (err) {
        let msg = "Login failed. Please check your credentials.";
        if (err.response && err.response.status === 401) {
            msg = err.response.data && err.response.data.message ? err.response.data.message : "Unauthorized: Invalid username or password.";
        }
        document.getElementById("error").innerHTML = msg;
        if (typeof show_message === 'function') {
            show_message(msg, "error");
        } else {
            alert(msg);
        }
    }
    return;
}

// submit_login=document.getElementById("submit_login");
// submit_login.addEventListener("submit",e=>{
//     alert("test");
//     e.preventDefault();
  
// })