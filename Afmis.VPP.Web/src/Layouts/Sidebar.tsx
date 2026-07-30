import { useEffect } from "react";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";

//import logo

import logo from "../assets/images/logo.webp";

//Import Components
import VerticalLayout from "./VerticalLayouts";
import TwoColumnLayout from "./TwoColumnLayout";
import { Container } from "reactstrap";
import HorizontalLayout from "./HorizontalLayout";

type Props = {
  layoutType: string;
};

const Sidebar: React.FC<Props> = ({ layoutType }) => {
  useEffect(() => {
    const verticalOverlay = document.getElementsByClassName("vertical-overlay");
    if (verticalOverlay) {
      verticalOverlay[0].addEventListener("click", function () {
        document.body.classList.remove("vertical-sidebar-enable");
      });
    }
  });

  const addEventListenerOnSmHoverMenu = () => {
    // add listener Sidebar Hover icon on change layout from setting
    if (
      document.documentElement.getAttribute("data-sidebar-size") === "sm-hover"
    ) {
      document.documentElement.setAttribute(
        "data-sidebar-size",
        "sm-hover-active"
      );
    } else if (
      document.documentElement.getAttribute("data-sidebar-size") ===
      "sm-hover-active"
    ) {
      document.documentElement.setAttribute("data-sidebar-size", "sm-hover");
    } else {
      document.documentElement.setAttribute("data-sidebar-size", "sm-hover");
    }
  };
  return (
    <>
      <div className="app-menu navbar-menu">
        <div
          className="navbar-brand-box"
          style={{
            textAlign: "start",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* <Link to="/" className="logo logo-dark">
            <span className="logo-sm">
              <img src={logo} alt="" height="45" />
            </span>
            <span className="logo-lg">
              <img src={logo} alt="" height="60" />
              <span
                style={{
                  fontSize: 30,
                  color: "#fff",
                  position: "relative",
                  top: 5,
                  letterSpacing: 2,
                  fontFamily: "monospace",
                }}
              >
                معاشات
              </span>
            </span>
          </Link> */}

          <Link
            to="/home"
            className="logo logo-light"
            style={{
              display: "flex",
              alignItems: "center",
            justifyContent: "center",
              width: "100%",
              height: "100%",
              paddingInline: 18,
            }}
          >
            <span
              className="logo-lg"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                width: "100%",
                minWidth: 0,
              }}
            >
              <img
                src={logo}
                alt=""
                height="48"
                style={{
                  width: 48,
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 27,
                  color: "#fff",
                  fontFamily:
                    "'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: "0.08em",
                  flexShrink: 0,
                }}
              >
                TPMS
              </span>
            </span>
          </Link>
          <button
            onClick={addEventListenerOnSmHoverMenu}
            type="button"
            className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
            id="vertical-hover"
          >
            <i className="ri-record-circle-line"></i>
          </button>
        </div>
        {layoutType === "horizontal" ? (
          <div id="scrollbar">
            <Container fluid>
              <div id="two-column-menu"></div>
              <ul className="navbar-nav" id="navbar-nav">
                <HorizontalLayout />
              </ul>
            </Container>
          </div>
        ) : layoutType === "twocolumn" ? (
          <>
            <TwoColumnLayout layoutType={layoutType} />
            <div className="sidebar-background"></div>
          </>
        ) : (
          <>
            <SimpleBar id="scrollbar" className="h-100">
              <Container fluid>
                <div id="two-column-menu"></div>
                <ul className="navbar-nav" id="navbar-nav">
                  <VerticalLayout layoutType={layoutType} />
                </ul>
              </Container>
            </SimpleBar>
            <div className="sidebar-background"></div>
          </>
        )}
      </div>
      <div className="vertical-overlay"></div>
    </>
  );
};

export default Sidebar;
