async function call_shirkat(url, method, data = {}, headers = null) {
    if (headers === null) {
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie('csrftoken')
        };
    }
    const config = {
        url,
        method: method.toUpperCase(),
        headers
    };
    if (method.toUpperCase() === 'POST') {
        config.data = data;
    }
    try {
        const response = await axios(config);
        console.log("data", data, "method", method, "++++response", response, 'response.data', response.data);
        return response;
    } catch (error) {
        console.error("Axios error:", error);
        throw error;
    }
}
