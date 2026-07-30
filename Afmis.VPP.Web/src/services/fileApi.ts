import afmis from "./afmis";
import { AppDispatch } from "../store";
import { setToastAlert } from "../store/notifications/slice";
import { ensureRefreshed } from "./refreshToken";
import { logout } from "../store/sa/userManagement/user/actions";

export const fileApi = async ({
  url,
  method,
  body,
  fileName,
  fileType,
  dispatch,
  retried = false,
}: {
  url: string;
  method: string;
  body?: any;
  fileName?: string;
  fileType?: string;
  dispatch?: AppDispatch;
  retried?: boolean;
}) => {
  if (dispatch) {
    // Proactively refresh only when within 10s of expiry (or expired).
    // This avoids 401s for long-running sessions.
    try {
      await ensureRefreshed(dispatch, false);
    } catch {
      // ignore; request/401 flow will handle
    }
  }

  const accessToken = localStorage.getItem("accessToken");
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 190000);
  const baseUrl = await afmis.getBaseURL();

  const response = await fetch(`${baseUrl}/${url}`, {
    method: method,
    body: method !== "GET" ? JSON.stringify(body) : undefined, // Ensure GET requests don't have a body
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    signal: controller.signal,
  });

  if (!response.ok && dispatch) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const responseBody = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (responseBody?.errors && responseBody.errors.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      dispatch(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        setToastAlert({ msg: responseBody.errors.join(", "), type: "error" })
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    } else if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      responseBody?.validationErrors &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      responseBody.validationErrors.length > 0
    ) {
      // Extract and format validation error messages
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const validationMessages = responseBody.validationErrors.map(
        (err: { identifier: string; errorMessage: string }) =>
          `${err.identifier}: ${err.errorMessage}`
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      dispatch(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        setToastAlert({ msg: validationMessages.join("\n"), type: "error" })
      );
    } else {
      dispatch(setToastAlert({ msg: response.statusText, type: "error" }));
    }
    if (response.status === 401 && dispatch && !retried) { // Avoid infinite loop

      const ok = await ensureRefreshed(dispatch, true);
      if (ok) {
        // retry once with fresh token
        // call Again if with new valid Token
        await fileApi({ url, method, body, fileName, fileType, dispatch, retried: true });
        return;
      } else {
        // refresh failed -> clean up and surface error
        await dispatch(logout());
        throw new Error("Unauthorized and refresh failed");
      }
    }
    return;
  }

  const fileData = await response.blob();

  if (!fileName) {
    const contentDisposition = response.headers.get("Content-Disposition");

    if (contentDisposition) {
      // Match UTF-8 encoded filename
      const utf8FilenameMatch = contentDisposition.match(
        /filename\*=UTF-8''(.+)/
      );
      // Match standard filename
      const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
      // Match MIME-encoded Base64 filename
      const mimeBase64Match = contentDisposition.match(
        /filename="=\?utf-8\?B\?(.+?)\?="/
      );

      if (utf8FilenameMatch) {
        try {
          fileName = decodeURIComponent(utf8FilenameMatch[1]); // Decode UTF-8 encoded filename
        } catch (error) {
          console.error("Error decoding UTF-8 filename:", error);
          fileName = "downloaded_file.pdf";
        }
      } else if (mimeBase64Match) {
        try {
          const decodedBase64 = atob(mimeBase64Match[1]); // Decode Base64 filename
          const utf8Decoder = new TextDecoder("utf-8");
          fileName = utf8Decoder.decode(
            new Uint8Array([...decodedBase64].map((c) => c.charCodeAt(0)))
          );
        } catch (error) {
          console.error("Base64 decode error:", error);
          fileName = "downloaded_file.pdf";
        }
      } else if (filenameMatch) {
        fileName = filenameMatch[1]; // Use normal filename
      } else {
        fileName = "downloaded_file.pdf"; // Fallback filename
      }
    } else {
      fileName = "downloaded_file.pdf"; // Default filename if no header found
    }
  }

  // Ensure the filename does not have extra encoded characters
  fileName = fileName.replace(/["']/g, "").trim();

  const ftype = fileType ? fileType : fileData.type;

  const blob = new Blob([fileData], { type: ftype });
  const blobUrl = URL.createObjectURL(blob);
  const isPdf =
    ftype === "application/pdf" ||
    fileName?.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    const link = document.createElement("a");
    link.href = blobUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = fileName || "PDF Preview";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // Create a temporary anchor element to trigger download with proper filename
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000); // Free up memory after 1 minute
};
