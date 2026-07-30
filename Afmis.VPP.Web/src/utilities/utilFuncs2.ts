import { AppDispatch } from "../store";
import { setToastAlert } from "../store/notifications/slice";
import { ObjectAny } from "../types/base";
import { Institution } from "../types/entities/general/ce";
import { AfmisResponse } from "../types/store/shared";
import { cloneObject } from "./utilFuncs";


export function getRootParentId(institutions: Institution[], institutionId: number): number|null {
  let currentInstitution = institutions.find(inst => inst.id === institutionId);
  if (!currentInstitution) return null; // If the institution is not found, return null
  let topParent: Institution | null = null;
  if(currentInstitution.name === "M110"){
    return currentInstitution.id; // If the institution is "M110", return its ID directly
  }
  while (currentInstitution) {
    if (currentInstitution.parentInstitutionId.toString() === "1") {
      if (currentInstitution.name === "M110") break; // Exclude "M110"
      topParent = currentInstitution;
    }
    currentInstitution = institutions.find(inst => inst.id.toString() === currentInstitution?.parentInstitutionId.toString()) || undefined;
  }
  if(topParent?.id){
    return topParent?.id;
  }
  else{
    return null;
  }
}

export const handleDiscaredFieldfrom=(data:ObjectAny)=>{
  data=cloneObject(data);
  const discardFieldFromSearch=["genderId", "stageId", "typeId", "districtId", "provinceId","moeSearchBankId"]
  discardFieldFromSearch.forEach(field=>{
    if(field in data){
       // delete data[field]; it shows error SubmitButton.tsx:73 Warning: An unhandled error was caught from submitForm() TypeError: Cannot delete property 'genderId'
        delete data[field];
    }
  })
  return data;
}

export function showToast(message: string, dispatch: AppDispatch) {
    dispatch(setToastAlert({ msg:message, type:"error" }));
}
export function handleAfmisApiError(res: AfmisResponse<any>, dispatch: AppDispatch) {
    if (typeof res.data === "string"){
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      return showToast(res.data,dispatch);
    } 
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
    if (Array.isArray(res.data?.errors) && res.data?.errors.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      return showToast(res.data.errors.join(", "),dispatch);
    } 
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (res.data?.validationErrors && res.data?.validationErrors.length>0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const errorMessages = res.data.validationErrors
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        .map((e: any) => `${e.errorCode}: ${e.errorMessage} ${e.identifier}`)
        .join("\n");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return showToast(errorMessages,dispatch);
    }
    if (res.originalError?.message){
      return showToast(res.originalError.message,dispatch);
    }
    
  }

  export const getFontStyle = (language: string) => ({
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.5,
    fontFamily: language === 'en'
      ? "'Inter', 'Segoe UI', Roboto, sans-serif"
      : "Arial, sans-serif"
  });



  export const TABLE_REFRESH_EVENT = "afmis:table-refresh";

/** Fire a refresh event for a given table key (e.g., "employees") */
export function triggerTableRefresh(key: string) {
  window.dispatchEvent(new CustomEvent(TABLE_REFRESH_EVENT, { detail: { key } }));
}

/** Subscribe to refresh events for a given key. Returns an unsubscribe fn. */
export function onTableRefresh(key: string, cb: () => void) {
  const handler = (e: Event) => {
    const ce = e as CustomEvent<{ key?: string }>;
    if (!key || ce.detail?.key === key) cb();
  };
  window.addEventListener(TABLE_REFRESH_EVENT, handler);
  return () => window.removeEventListener(TABLE_REFRESH_EVENT, handler);
}