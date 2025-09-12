// alert.js
function show_message(message, type) {
    // Remove existing alert if any
    const existingAlert = document.querySelector(".custom-alert");
    if (existingAlert) existingAlert.remove();

    // Create alert div
    const alertDiv = document.createElement("div");
    alertDiv.classList.add("custom-alert");

    // Set type
    if (type === "success") {
        alertDiv.style.backgroundColor = "#4CAF50"; // green
    } else if (type === "error") {
        alertDiv.style.backgroundColor = "#f44336"; // red
    } else {
        alertDiv.style.backgroundColor = "#333"; // default
    }

    // Style
    alertDiv.style.color = "white";
    alertDiv.style.padding = "15px";
    alertDiv.style.position = "fixed";
    alertDiv.style.top = "20px";
    alertDiv.style.right = "20px";
    alertDiv.style.borderRadius = "5px";
    alertDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    alertDiv.style.zIndex = 9999;
    alertDiv.style.fontFamily = "Arial, sans-serif";
    alertDiv.style.minWidth = "200px";
    alertDiv.style.textAlign = "center";
    alertDiv.innerText = message;

    document.body.appendChild(alertDiv);

    // Remove alert after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000); // 3000ms = 3 seconds
}

// Example usage
// show_message("Operation successful!", "success");
// show_message("Something went wrong!", "error");
