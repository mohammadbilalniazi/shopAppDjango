import { AppDispatch } from "../store";
import { logout } from "../store/sa/userManagement/user/actions";
import { UserLogin } from "../types/entities/sa/loginUser";
import { AfmisResponse } from "../types/store/shared";
import afmis from "./afmis";
import { updateStorageStateLogin } from "./updateStateStorage";

const TOKEN_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const EXPIRY_KEY = "exp";

// module-scoped single-flight
let refreshPromise: Promise<boolean> | null = null;

// module-scoped refresh monitor (single interval)
let monitorHandle: number | null = null;

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY) ?? "";
export const getExpiry = () => Number(localStorage.getItem(EXPIRY_KEY) ?? 0);

// ⏱️ CHANGED: 2 minutes (120000ms) early refresh buffer instead of 2 minutes
const EARLY_REFRESH_MS = 120000; 
const DEFAULT_MONITOR_INTERVAL_MS = 5000;

function hasAuthTokens(): boolean {
  const refToken = localStorage.getItem(REFRESH_KEY);
  const accessToken = localStorage.getItem(TOKEN_KEY);

  return Boolean(refToken && accessToken);
}

function shouldRefreshSoon(now: number): boolean {
  const exp = getExpiry();
  if (!exp) return false;
  return now >= exp - EARLY_REFRESH_MS;
}

export function startTokenRefreshMonitor(
  dispatch: AppDispatch,
  intervalMs: number = DEFAULT_MONITOR_INTERVAL_MS
): void {

  if (monitorHandle != null) {
    return;
  }

  const tick = async () => {
    try {
      if (!hasAuthTokens()) {
        return;
      }

      const now = Date.now();

      if (!shouldRefreshSoon(now)) {
        return;
      }

      console.log("[AUTH] Token close to expiry → refreshing");
      await ensureRefreshed(dispatch, false);

    } catch (e) {
      console.error("[AUTH] token monitor tick failed", e);
    }
  };

  void tick();

  monitorHandle = window.setInterval(() => {
    void tick();
  }, intervalMs);
}

export function stopTokenRefreshMonitor(): void {
  if (monitorHandle == null) return;
  window.clearInterval(monitorHandle);
  monitorHandle = null;
}

export function ensureRefreshed(dispatch: AppDispatch, force = false): Promise<boolean> {
  const now = Date.now();
  const expRaw = getExpiry();
  const exp = Number.isFinite(expRaw) ? expRaw : 0;

  const threshold = exp ? exp - EARLY_REFRESH_MS : 0;
  // console.warn(`[AUTH] ensureRefreshed called, now: ${now}, exp: ${exp}, threshold: ${threshold}, force: ${force}`);
  // console.log("[AUTH] Current exp from storage:", getExpiry(), "now:", now);
  
  if (!force) {
    if (!exp) {
      if (!hasAuthTokens()) {
        return Promise.resolve(false);
      }
    } else if (now < threshold) {
      return Promise.resolve(true);
    }
  }

  if (refreshPromise) {
    // console.log("[AUTH] Refresh already in-flight, joining existing promise so no duplicate refreshes");
    return refreshPromise;
  }

  const refToken = localStorage.getItem(REFRESH_KEY);
  const accessToken = localStorage.getItem(TOKEN_KEY);

  if (!refToken || !accessToken) {
    console.warn("[AUTH] No refresh or access token available, cannot refresh");
    return Promise.resolve(false);
  }

  // console.log("[AUTH] Refreshing with refToken:", refToken.substring(0, 10) + "...");

  refreshPromise = (async () => {
    try {
      const response = await afmis.any<AfmisResponse<UserLogin>>({
        url: "/Authentications/refreshToken",
        method: "POST",
        data: { refreshToken: refToken },
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      const responseSuccess = !!((response?.data as any)?.success);
      if (response?.data?.isSuccess || responseSuccess || response?.ok) {

        console.log("[AUTH] Refresh successful, updating tokens");
        
        // 🛡️ SAFEGUARD: Capture expiry BEFORE update to detect infinite loop
        const previousExp = getExpiry();
        
        await updateStorageStateLogin(
          dispatch,
          response as unknown as AfmisResponse<UserLogin>,
          false
        );

        const newExp = getExpiry();
        const currentNow = Date.now();
        
        // 🛡️ BREAK LOOP: If expiry didn't change OR token is already expired
        if (newExp === previousExp || newExp <= currentNow) {
          console.warn(
            "[AUTH] ⚠️ Refresh returned identical or expired token. Breaking potential infinite loop."
          ); 
          await dispatch(logout());
          return false;
        }

        console.log("[AUTH] After refresh, new exp:", newExp, "now:", currentNow, "is future:", newExp > currentNow);
        return true;

      } else {
        console.warn("[AUTH] Refresh failed, response:", response);
        await dispatch(logout());
        return false;
      }

    } catch (e) {
      console.error("[AUTH] Refresh failed with exception", e);
      return false;

    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}