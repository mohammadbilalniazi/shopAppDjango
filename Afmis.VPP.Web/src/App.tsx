import { Suspense, useEffect } from "react";
import { ToastContainer as ReactToastContainer } from "react-toastify";

import "./assets/styles/themes.scss";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import triggerToast from "./utilities/toast";
import { clearToastAlert } from "./store/notifications/slice";
import { ConfirmContextProvider } from "./hooks/common/useConfirm";
import AlertModal from "./Components/AlertModal";
import ConfirmModal from "./Components/ConfirmModal";
import PageLoader from "./Components/PageLoader";
import Route from "./routes";
import { ValidationError } from "./types/store/shared";
import { startTokenRefreshMonitor, stopTokenRefreshMonitor } from "./services/refreshToken";
import ConfirmAlertModal from "./Components/ConfirmAlertModal";

const getToastMessage = (message: unknown) => {
  if (typeof message === "string") {
    return message;
  }

  if (
    message &&
    typeof message === "object" &&
    "errorMessage" in message
  ) {
    return String((message as ValidationError).errorMessage ?? "");
  }

  return String(message ?? "");
};

const App = () => {
  const { msg, type } = useAppSelector((state) => state.notifications);
  const dispatch = useAppDispatch();

  useEffect(() => {
    startTokenRefreshMonitor(dispatch);
    return () => stopTokenRefreshMonitor();
  }, [dispatch]);

  useEffect(() => {
    if (
      msg == null ||
      msg === "" ||
      (Array.isArray(msg) && msg.length === 0)
    ) {
      return;
    }

    if (Array.isArray(msg)) {
      msg.forEach((ms: string | ValidationError) => {
        const toastMessage = getToastMessage(ms);

        if (toastMessage.length !== 0) {
          triggerToast(toastMessage, type);
        }
      });
    } else {
      const toastMessage = getToastMessage(msg);

      if (toastMessage.length !== 0) {
        triggerToast(toastMessage, type);
      }
    }

    const timer = window.setTimeout(() => {
      dispatch(clearToastAlert());
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [msg, type, dispatch]);

  return (
    <Suspense fallback={<PageLoader />}>
      <ConfirmContextProvider>
        <ReactToastContainer />
        <AlertModal />
        <ConfirmModal />
        <ConfirmAlertModal />
        <Route />
      </ConfirmContextProvider>
    </Suspense>
  );
};

export default App;
