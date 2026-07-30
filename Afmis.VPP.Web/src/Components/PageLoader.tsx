import { useEffect } from "react";

import ProgressBar from "@badrap/bar-of-progress";
import { HashLoader } from "react-spinners";
import AppCol from "./AppCol";
import logo from "../assets/images/logo.webp";
const progress = new ProgressBar({
  color: "#f7a813",
  size: 2,
});

const PageLoader = ({ nested = false }) => {
  useEffect(() => {
    progress.start();
    return () => {
      progress.finish();
    };
  }, []);
  return (
    <AppCol
      xs={12}
      className="d-flex justify-content-center align-items-center page-loader-container"
      style={{ height: nested ? "66vh" : "100vh" }}
    >
      <HashLoader color="#f7a813" />
    </AppCol>
  );
};

export default PageLoader;





export function LoaderWithLogo() {
  const isDark = document?.documentElement?.getAttribute("data-bs-theme") === "dark" ||
    document?.body?.classList?.contains("dark") ||
    document?.body?.classList?.contains("dark-mode");

  const ringColor = isDark ? "rgba(255,255,255,0.18)" : "#e5e7eb";
  return (
    <>
      <style>
        {`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}
      </style>

      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          height: "100vh",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "120px",
            height: "120px",
          }}
        >
          {/* Gray Placeholder Ring */}
          <div
            style={{
              position: "absolute",
              inset: "6px",

              borderRadius: "50%",

              border: `4px solid ${ringColor}`,
            }}
          />

          {/* Yellow Rotating Arc */}
          <div
            style={{
              position: "absolute",
              inset: "6px",

              borderRadius: "50%",

              border: "4px solid transparent",

              borderTopColor: "#facc15",
              borderRightColor: "#facc15",

              animation: "spin 1.1s linear infinite",
            }}
          />

          {/* Logo */}
          <img
            src={logo}
            alt="Logo"
            style={{
              position: "absolute",

              top: "50%",
              left: "50%",

              transform: "translate(-50%, -50%)",

              width: "88px",
              height: "88px",

              borderRadius: "50%",

              objectFit: "cover",

              zIndex: 10,
            }}
          />
        </div>
      </div>
    </>
  );
}
