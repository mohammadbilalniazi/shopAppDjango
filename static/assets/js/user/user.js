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
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const submitButton = document.querySelector('#login_form button[type="submit"]');

    // Clear previous error
    document.getElementById("error").innerHTML = "";

    const form = {
        "username": username,
        "password": password
    }

    const url = "/login_form/submit/"
    try {
        if (submitButton) {
            submitButton.disabled = true;
        }
        const response = await call_shirkat(url, 'POST', form);
        const new_url = response?.data?.base_url;
        const status = response?.data?.status;
        const message = response?.data?.message || "Login failed";
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
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
    return;
}

// submit_login=document.getElementById("submit_login");
// submit_login.addEventListener("submit",e=>{
//     alert("test");
//     e.preventDefault();
  
// })
