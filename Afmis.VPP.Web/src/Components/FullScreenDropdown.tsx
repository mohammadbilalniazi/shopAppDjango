import { useState } from "react";

const FullScreenDropdown = () => {
  /*
    mode
    */
  const [isFullScreenMode, setIsFullScreenMode] = useState(true);

  /*
    full screen
    */
  const toggleFullscreen = () => {
    const document = window.document;
    document.body.classList.add("fullscreen-enable");

    if (!document.fullscreenElement) {
      // current working methods
      setIsFullScreenMode(false);
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      setIsFullScreenMode(true);
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }

    // handle fullscreen exit
    const exitHandler = () => {
      document.body.classList.remove("fullscreen-enable");
    };
    document.addEventListener("fullscreenchange", exitHandler);
    document.addEventListener("webkitfullscreenchange", exitHandler);
    document.addEventListener("mozfullscreenchange", exitHandler);
  };
  return (
    <>
      <div className="ms-1 header-item d-none d-sm-flex">
        <button
          onClick={toggleFullscreen}
          type="button"
          className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle shadow-none"
        >
          <i
            className={
              isFullScreenMode
                ? "bx bx-fullscreen fs-22"
                : "bx bx-exit-fullscreen fs-22"
            }
          ></i>
        </button>
      </div>
    </>
  );
};

export default FullScreenDropdown;
