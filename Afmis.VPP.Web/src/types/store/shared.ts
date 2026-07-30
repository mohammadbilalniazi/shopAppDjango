import { RootState } from "../../store";
import { ObjectAny } from "../base";

export interface PageInfo {
  pageNumber: string;
  pageSize: number;
  firstPage: string;
  lastPage: string;
  totalPages: number;
  totalRecords: number;
  nextPage: string;
  preiousPage: string;
}

export interface BaseSlicState<T = ObjectAny> {
  pageInfo: Partial<PageInfo>;
  updating: boolean;
  deleting: boolean;
  inserting: boolean;
  gettingAll?: boolean;
  getting: boolean;
  searching: boolean;
  changed?: boolean;
  formData: Partial<T>;
}

export interface ValidationError {
  identifier: string;
  errorMessage: string;
  errorCode: string;
  severity: string;
}

export interface AfmisResponse<T = ObjectAny> {
  lastModifiedBy: string;
  createdBy: string;
  ok: any;
  data: T;
  status: string;
  isSuccess: boolean;
  successMessage: string;
  errors: string[];
  validationErrors: ValidationError[];
  pagedInfo: PageInfo;
  firstLoggedIn?: boolean; // new
  passwordChanged?: boolean; // new
  accountReseted?: boolean;
  originalError?: {
    message: string;
    name: string;
    config: {
      transitional: {
        silentJSONParsing: boolean;
        forcedJSONParsing: boolean;
        clarifyTimeoutError: boolean;
      };
      transformRequest: Array<string | null>;
      transformResponse: Array<string | null>;
      timeout: number;
      xsrfCookieName: string;
      xsrfHeaderName: string;
      maxContentLength: number;
      maxBodyLength: number;
      env: {
        FormData: number | null;
      };
      headers: {
        Accept: string;
        "Content-Type": string;
        "Access-Control-Allow-Origin": string;
      };
      baseURL: string;
      url: string;
      method: string;
      data: { email: string; password: string };
    };
    code: string;
    status: number | null;
  };
}

export interface IdResponse {
  id: number;
  [key: string]: any;
}

export type GetState = () => RootState;

export interface ApplicationUserAuditDetail{
  createdBy: {
      empName: string,
      fatherName: string
  },
  lastModifiedBy: {
      empName: string,
      fatherName: string
  }
}
