import { create } from "apisauce";
const baseUrl = `${window.location.protocol}//${window.location.hostname}:5245`;  // http://localhost:5245
  // const baseUrl = `${window.location.protocol}//${window.location.hostname}/api/v1`; // http://localhost:8080
const afmis = create({
  baseURL: `${baseUrl}/api/v1`, //test server url
    // baseURL: `${baseUrl}`, //test server url
  timeout: 1800000, // 30minute 30*60 second 30*60*1000
});
export default afmis;