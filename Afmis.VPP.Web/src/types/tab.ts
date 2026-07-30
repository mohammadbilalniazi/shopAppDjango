import { Screen } from "../constants/screens";
import { FormikActions, ObjectAny } from "./base";

export interface TabProps<T> {
  name: keyof T;
  label: string;
  disabled?: boolean;
  shouldOpenModal?: () => boolean;
  screen: Screen;
}
export interface TabWrapperProps<T> {
  details: {
    name: keyof T;
    label: string;
    required?: boolean;
    shouldOpenModal?: () => boolean;
    disabled?: boolean;
  }[];
  screen: Screen;
}

export interface ModalTabProps<T = ObjectAny> {
  showModal: boolean;
  toggleModal: VoidFunction;
  onAdd?: (values: T, actions: FormikActions<T>) => void;
  onUpdate?: (values: T, actions: FormikActions<T>) => void;
  selectedForUpdate: T | null;
  label: string;
  disabled?: boolean;
  screen: Screen;
}

export interface FormTabProps<T = ObjectAny> {
  initialValues: T | null;
  onSubmit?: (values: T, actions: FormikActions<T>) => void;
  toggleModal: VoidFunction;
  selectedForUpdate: T | null;
  disabled?: boolean;
  screen: Screen;
}

type TabOperation = "Inserted" | "Updated" | "Deleted";
export interface TabOperationType {
  id?: number | string;
  // id?: number; previous number
  operation: TabOperation;
}
