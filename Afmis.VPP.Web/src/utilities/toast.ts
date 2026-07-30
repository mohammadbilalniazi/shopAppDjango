import { ToastOptions, TypeOptions, toast as acToast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const ToastTypes: TypeOptions[] = [
  "default",
  "error",
  "info",
  "success",
  "warning",
];

const normalizeToastType = (type?: string): TypeOptions => {
  if (type === "danger") {
    return "error";
  }

  return ToastTypes.includes(type as TypeOptions) ? type as TypeOptions : "warning";
};

const toast = (message: string, type?: TypeOptions | string) => {
  const toastType = normalizeToastType(type);
  const toastConfig: ToastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  };

  if (toastType === "success") {
    acToast.success(message, toastConfig);
    return;
  }

  if (toastType === "error") {
    acToast.error(message, toastConfig);
    return;
  }

  if (toastType === "info") {
    acToast.info(message, toastConfig);
    return;
  }

  if (toastType === "default") {
    acToast(message, toastConfig);
    return;
  }

  acToast.warning(message, toastConfig);
};

export default toast;
