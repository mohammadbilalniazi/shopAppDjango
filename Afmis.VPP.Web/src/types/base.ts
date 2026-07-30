import { ColDef, ColGroupDef } from "ag-grid-community";
import { FormikErrors, FormikHelpers } from "formik";
import { FormEvent } from "react";
import { CompValue } from "./entities/gl/coa";

export interface ObjectString {
  [key: string]: string;
}

export interface ObjectNumber {
  [key: string]: number;
}

export interface ObjectAny {
  [key: string]: any;
}
export interface ObjectBoolean {
  [key: string]: boolean;
}

export type CalenderType = "qamari" | "shamsi" | "gregorian";

export interface Lookup<T = number> {
  label: string;
  value: T;
}

export interface FormikContext<T = ObjectAny> {
  setFieldTouched: (
    field: string,
    touched?: boolean,
    shouldValidate?: boolean
  ) => void;
  setFieldValue: SetFieldValue<T>;
  values: T;
  errors: ObjectAny;
  touched: ObjectAny;
  initialValues: T;
  handleSubmit: (e?: FormEvent<HTMLFormElement>) => void;
  setFieldError: (field: string, message: any) => void;
  validateField: (field: string) => Promise<void> | Promise<string | undefined>;
  submitCount: number;
}

export type FormikActions<T> = FormikHelpers<T>;

export type SetFieldValue<T> = (
  field: keyof T,
  value: any,
  shouldValidate?: boolean
) => Promise<void | FormikErrors<ObjectAny>>;

export type SetFieldError<T> = (
  field: keyof T,
  message: string,
  shouldValidate?: boolean
) => void;
export type Operations =
  | "EqualTo"
  | "GreaterThan"
  | "GreaterThanOrEqualTo"
  | "LessThanOrEqualTo"
  | "Between"
  | "LessThan"
  | "Contains"
  | "IsNull"
  | "In"
  | "IsNotNull";

export type TransformObjectForSearchType = {
  propertyName: string;
  value?: unknown;
  fromRange?:string[]|string;
  toRange?:string[]|string;
  operation: Operations;
};

export type Columns<T> = (ColDef<T> | ColGroupDef<T>)[];

export type FormCompState = {
  [key: number]: CompValue | "";
};
export type FormValState = {
  [key: number]: any;
};

export interface CellRendererParams {
  value(value: any): any;
  lookup?: boolean | undefined;
  onClick?: VoidFunction;
  url?: string;
  isAmount?: boolean;
  isCodingBlock?: boolean;
  isDate?: boolean;
}
export type PopupModalProps = {
  model: string;
  label: string;
  showPopupModal: boolean;
  setScreen?: (screen: string) => void;
  params?: any;
  extraHeaderNodes?: React.ReactNode[];
  togglePopupModal: () => void;
  header?: string;
  disabled?: boolean;
  [key: string]: any;
};

