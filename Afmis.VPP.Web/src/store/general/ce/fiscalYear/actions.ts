import { screenOperations } from "../../../../constants/screens";
import { storeOperations } from "../../../../constants/storeOperations";
import { methods } from "../../../../constants/methods";
import callAfmis from "../../../../services/callAfmis";
import { GetState, IdResponse } from "../../../../types/store/shared";
import { TransformObjectForSearchType } from "../../../../types/base";
import { FiscalYear } from "../../../../types/entities/general/ce";
import {
  fiscalYearApiSuccess,
  fiscalYearsApiSuccess,
  loadingFinished,
  loadingStart,
  resetFiscalYears,
} from "./slice";
import { AppDispatch } from "../../..";

const fiscalYearsUrl = "FiscalYears";

export const searchFiscalYears =
  ({ data }: { data: TransformObjectForSearchType[] }) =>
  (dispatch: AppDispatch) => {
    dispatch(resetFiscalYears(storeOperations.MULTIPLE));

    return callAfmis({
      dispatch,
      method: methods.POST,
      url: `${fiscalYearsUrl}/Search`,
      data,
      onInit: { type: loadingStart.type, payload: screenOperations.SEARCH },
      onSuccess: fiscalYearsApiSuccess,
      onFailed: {
        type: loadingFinished.type,
        payload: screenOperations.SEARCH,
      },
    });
  };

export const getFiscalYears =
  () => (dispatch: AppDispatch, getState: GetState) => {
    const { fiscalYears, changed ,gettingAll} = getState().general.ce.fiscalYears;

    if ((fiscalYears.length > 0 && !changed)|| gettingAll) {
      return ;
    }

    dispatch(resetFiscalYears(storeOperations.MULTIPLE));

    return callAfmis({
      dispatch,
      method: methods.GET,
      // url: `${fiscalYearsUrl}`,
      url: `DropDowns/${fiscalYearsUrl}`,
      onInit: { type: loadingStart.type, payload: screenOperations.GET_ALL },
      onSuccess: fiscalYearsApiSuccess,
      onFailed: {
        type: loadingFinished.type,
        payload: screenOperations.GET_ALL,
      },
      showMsg:false
    });
  };

export const getFiscalYearById =
  ({ id }: { id: number }) =>
  (dispatch: AppDispatch) => {
    dispatch(resetFiscalYears(storeOperations.SINGLE));

    return callAfmis({
      dispatch,
      method: methods.GET,
      url: `${fiscalYearsUrl}/${id}`,
      onInit: { type: loadingStart.type, payload: screenOperations.GET },
      onSuccess: fiscalYearApiSuccess,
      onFailed: { type: loadingFinished.type, payload: screenOperations.GET },
    });
  };

export const insertFiscalYear =
  ({ data }: { data: FiscalYear }) =>
  (dispatch: AppDispatch) => {
    dispatch(resetFiscalYears(storeOperations.SINGLE));

    return callAfmis<IdResponse, FiscalYear>({
      dispatch,
      method: methods.POST,
      url: fiscalYearsUrl,
      data,
      onInit: { type: loadingStart.type, payload: screenOperations.INSERT },
      onFailed: {
        type: loadingFinished.type,
        payload: screenOperations.INSERT,
      },
    });
  };

export const updateFiscalYear =
  ({ id, data }: { id: number; data: FiscalYear }) =>
  (dispatch: AppDispatch) => {
    return callAfmis({
      dispatch,
      method: methods.PUT,
      url: `${fiscalYearsUrl}/${id}`,
      data,
      onInit: { type: loadingStart.type, payload: screenOperations.UPDATE },
      onSuccess: fiscalYearApiSuccess,
      onFailed: {
        type: loadingFinished.type,
        payload: screenOperations.UPDATE,
      },
    });
  };

export const deleteFiscalYear =
  ({ id }: { id: number }) =>
  async (dispatch: AppDispatch) => {
    const res = await callAfmis({
      dispatch,
      method: methods.DELETE,
      url: `${fiscalYearsUrl}/${id}`,
      onInit: { type: loadingStart.type, payload: screenOperations.DELETE },
      onFailed: {
        type: loadingFinished.type,
        payload: screenOperations.DELETE,
      },
    });
    if (res?.ok) {
      dispatch(resetFiscalYears(storeOperations.SINGLE));
    }
    return res;
  };
