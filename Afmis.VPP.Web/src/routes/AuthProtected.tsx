import { Route,useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";

import { useEffect } from "react";
import { ensureRefreshed } from "../services/refreshToken";
 

const AuthProtected = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem("accessToken");
      const refresh = localStorage.getItem("refreshToken");
      if (!token || !refresh) {
        if (window.location.pathname !== "/") navigate("/");
        return;
      }
      const ok = await ensureRefreshed(dispatch); // gentle check; refreshes only if needed
      // console.warn("AuthProtected check, token present, refresh result:", ok);
      if (!ok && window.location.pathname !== "/") {
        // console.warn("[AUTH] ensureRefreshed failed, redirecting to login");
        // console.warn("[AUTH] No Navigation For Now Clearing tokens and redirecting to login");
        // navigate("/");
      }
    };

    // run once
    check();

    // also run when user returns to the tab (common time drift case)
    const onVis = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVis);

    return () => document.removeEventListener("visibilitychange", onVis);
  }, [dispatch, navigate]);

  return <>{children}</>;
};

const AccessRoute = ({
  component: Component,
  ...rest
}: {
  component: any;
  [key: string]: any;
}) => {
  return (
    <Route Component={(props: any) => <Component {...props} />} {...rest} />
  );
};

export { AuthProtected, AccessRoute };