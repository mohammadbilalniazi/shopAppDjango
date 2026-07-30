import afmis from "./afmis";
import { ApiResponse } from "apisauce";
import { AppDispatch } from "../store";
import {
  AfmisResponse,
  ApplicationUserAuditDetail,
} from "../types/store/shared";
import { ObjectString } from "../types/base";
import { methods } from "../constants/methods";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { ensureRefreshed} from "./refreshToken";
import { combineName, handleMessage } from "../utilities/utilFuncs";
import { logout } from "../store/sa/userManagement/user/actions";
import { handleDiscaredFieldfrom } from "../utilities/utilFuncs2";
// import { setMsg } from "../store/notifications/slice";

const callAfmis = async <R = Record<string, unknown>, Data = unknown>({
  dispatch,
  method = methods.GET,
  url,
  onInit,
  onSuccess,
  onFailed,
  data,
  params,
  headers,
  showMsg = true,
  ...props
}: {
  dispatch: AppDispatch;
  method?: string;
  url: string;
  onInit?: any;
  onSuccess?: ActionCreatorWithPayload<AfmisResponse<R>>;
  onFailed?: any;
  data?: Data;
  params?: Record<string, unknown>;
  headers?: ObjectString;
  showMsg?: boolean;
  [key: string]: unknown;
}): Promise<ApiResponse<AfmisResponse<R>>> => {
  if (onInit) dispatch(onInit);
  
  // loop through params and remove empty values
  if (params) {
    Object.keys(params).forEach((key) => {
      if (
        params[key] === "" ||
        params[key] === null ||
        (typeof params[key] === "number" && isNaN(params[key] as number))
      ) {
        delete params[key];
      }
    });
  }
  // we want to trim all string values in inserting and updating data . The !Array.isArray(data) is for excluding searching data
 
  if (
    data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    (method == "POST" || method == "PUT") && !(data instanceof FormData)
  ) {
    const dataForSearch = handleDiscaredFieldfrom(data as Record<string, unknown>);
    // trim all string values in data
    const dataCopy = { ...dataForSearch } as Record<string, any>; // Create a shallow copy of data with a mutable type
    Object.keys(dataCopy).forEach((key) => {
      const value = dataCopy[key];
      if (typeof value === "string" && !(dataForSearch instanceof FormData) && !(dataForSearch instanceof Blob) && !(dataForSearch instanceof ArrayBuffer) && !(dataForSearch instanceof File)) {
        dataCopy[key] = value.trim();
      }
      // else if check if file then do not trim
      else if (value instanceof File) {
        // Handle file separately if needed
        // For example, you might want to keep the file as is
        dataCopy[key] = value; // Keep the file as is
      }
    });
    data = dataCopy as Data; // Reassign the modified copy back to data with the original type
  }

  // Proactively refresh only when we're within 10s of expiry (or expired).
  // This is a no-op in the common case and avoids waiting for a 401.
  try {
    await ensureRefreshed(dispatch, false);
  } catch {
    // never block the request on refresh monitor errors
  }

  const accessToken = localStorage.getItem("accessToken");
  if (headers !== undefined) {
    console.log("###########headers#####",headers," data ",data);
    headers["Authorization"] = `Bearer ${accessToken}`;
  } else {
    headers = { Authorization: `Bearer ${accessToken}` };
  }
  
  interface DataStructure {
    applicationUserAuditDetail: ApplicationUserAuditDetail;
    createdBy?: string;
    lastModifiedBy?: string;
    // Include other properties of res.data.data here if needed
  }

  const res = await afmis.any<AfmisResponse<R>>({
    method,
    url,
    params,
    data,
    headers,
    ...props,
  });
  if(res.status==401 || url.startsWith('DropDowns')){
    showMsg=false;
  }
  if (
    res?.ok &&
    (!res?.data?.validationErrors || res?.data?.validationErrors?.length === 0)
  ) {
    if (
      res.data &&
      res.data.data &&
      (res.data.data as unknown as DataStructure)?.applicationUserAuditDetail
    ) {
      const auditDetail = (res?.data?.data as unknown as DataStructure)
        ?.applicationUserAuditDetail;
      // Add combined createdBy and lastModifiedBy to res.data
      const data = res.data.data as unknown as DataStructure;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      data.createdBy = combineName(
        auditDetail.createdBy.empName,
        auditDetail.createdBy.fatherName
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      data.lastModifiedBy = combineName(
        auditDetail.lastModifiedBy.empName,
        auditDetail.lastModifiedBy.fatherName
      );
    }
    if (onSuccess) {
      if (res.data) {
        dispatch(onSuccess(res.data));
      }
    } else if (onFailed) {
      // when the is not onSuccess function,
      // then onFailed function will be called to stoping the loading state
      dispatch(onFailed);
    }

    if (res.data && res.data.successMessage) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      handleMessage({
        dispatch,
        message: res?.data.successMessage,
        typ: "success",
        show: showMsg,
      });
    }

    return res; 
  } else {
    if (res.status === 401 && !props._retry) {
          // Join or start a refresh (single-flight)
      const ok = await ensureRefreshed(dispatch, true);

      if (ok) {
        const latestAccessToken = localStorage.getItem("accessToken");
        if (latestAccessToken) {
          if (headers) {
            headers["Authorization"] = `Bearer ${latestAccessToken}`;
          } else {
            headers = { Authorization: `Bearer ${latestAccessToken}` };
          }
        }

        // retry once with fresh token
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await callAfmis({
          dispatch,
          method,
          url,
          params,
          data,
          headers,
          showMsg,
          onSuccess,
          onFailed,
          _retry: true, // mark this as a retry
          ...props,
        });
      } else {
        // refresh failed -> clean up and surface error
        await dispatch(logout());
        throw new Error("Unauthorized and refresh failed");
      }
    }
    
    // when the request failed
    else if (typeof res.data === "string") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      handleMessage({
        dispatch,
        message: res.data,
        typ: "error",
        show: showMsg,
      });
    } else if (
      res.data &&
      (Array.isArray(res.data.errors) || typeof res.data.errors ==="object") &&
      res.data.errors.length !== 0 && res.status !== 401
    ) {
      let message = "";

      if (Array.isArray(res.data.errors) && res.data.errors.length > 0) {
        if(typeof res.data.errors[0] ==="object"){
          message = Object.entries(res.data.errors[0])
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join(" | ");
        }else{
          message = res.data.errors.join(" - ");
        }
      } else if (typeof res.data.errors === "object") {
        message = Object.entries(res.data.errors)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join(" | ");
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      handleMessage({
        dispatch,
        message: message,
        typ: "error",
        show: showMsg,
      });
    } else if (res?.originalError && res.originalError?.message) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      handleMessage({
        dispatch,
        message: res.originalError.message,
        typ: "error",
        show: showMsg,
      });
    }

    if (
      res.status != 401 &&
      res.data &&
      res.data.validationErrors &&
      res.data.validationErrors.length > 0
    ) {
      const errorMessages = res.data.validationErrors
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        .map(
          (error: any) =>
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            error?.errorCode?.toString() +
            " : " +
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            error?.errorMessage?.toString() +
            " " +
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            error?.identifier?.toString()
        )
        .join("\n");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      handleMessage({
        dispatch,
        message: errorMessages,
        typ: "error",
        show: showMsg,
      });
    }
   
  }
  if (onFailed) {
    dispatch(onFailed);
  }
  return res;
};

export default callAfmis;