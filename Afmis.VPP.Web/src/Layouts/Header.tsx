import { useEffect, useState } from "react";

import { Link } from "react-router-dom";
import { Dropdown, DropdownMenu, DropdownToggle, Form } from "reactstrap";

//import images
import logo from "../assets/images/logo.webp";

//import Components
import LanguageDropdown from "../Components/LanguageDropdown";
import ProfileDropdown from "../Components/ProfileDropdown";
import LightDark from "../Components/LightDark";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getLoggedInUsers,
  getTotalOfLoggedInUsers,
} from "../store/sa/userManagement/user/actions";
// import { getCurrentDate } from "../utilities/utilFuncs";
// import { DateObject } from "react-multi-date-picker";
import usePermissionCheck from "../hooks/sa/usePermissionCheck";
import PopupModal from "../Components/forms/FormPopupModal/popupModalPage";
import { models } from "../constants/models";
import DateDropDown from "../Components/DateDropDown";
import { useTranslation } from "react-i18next";

type Props = {
  // eslint-disable-next-line no-unused-vars
  onChangeLayoutMode: (mode: string) => void;
  layoutModeType: string;
  headerClass: string;
};

const Header: React.FC<Props> = ({
  onChangeLayoutMode,
  layoutModeType,
  headerClass,
}) => {
  const [search, setSearch] = useState(false);
  // const [currentDate,setCurrentDate]=useState("");
  const [showLoggedInUsersDataPopupModal, setShowLoggedInUsersDataPopupModal] =
    useState(false);
  const toggleShowLoggedInUsersDataPopupModal = () => {
    setShowLoggedInUsersDataPopupModal((state) => !state);
  };

  const toogleSearch = () => {
    setSearch(!search);
  };
  const totalloggedInUsers = useAppSelector(
    (state) => state.sa.usr.usrs.totalloggedInUsers,
  );
  const dispatch = useAppDispatch();

  const { permissionExists } = usePermissionCheck();
  const getTotalLoggedInUsersPermExists = permissionExists(
    "ApplicationUsers-GetTotalOfLoggedInUsers",
  ); // Use `id` for permission check
  const getLoggedInUsersListPermExists = permissionExists(
    "ApplicationUsers-GetLoggedInUsers",
  ); // Use `id` for permission check
  const [loading,setLoading]=useState(false);
  useEffect(() => {
    dispatch(getTotalOfLoggedInUsers(getTotalLoggedInUsersPermExists)); // Fetch total logged-in users on component mount
    const interValId = setInterval(() => {
      dispatch(getTotalOfLoggedInUsers(getTotalLoggedInUsersPermExists));
    }, 6 * 60 * 60 * 1000); // Refresh every 6 hours
    return () => clearInterval(interValId); // Cleanup interval on component unmount
  }, [dispatch, getTotalLoggedInUsersPermExists]);
  const toogleMenuBtn = () => {
    const windowSize = document.documentElement.clientWidth;
    if (windowSize > 767)
      document.querySelector(".hamburger-icon")?.classList.toggle("open");
    //For collapse horizontal menu
    if (document.documentElement.getAttribute("data-layout") === "horizontal") {
      document.body.classList.contains("menu")
        ? document.body.classList.remove("menu")
        : document.body.classList.add("menu");
    }

    //For collapse vertical menu
    if (document.documentElement.getAttribute("data-layout") === "vertical") {
      if (windowSize < 1025 && windowSize > 767) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.documentElement.getAttribute("data-sidebar-size") === "sm"
          ? document.documentElement.setAttribute("data-sidebar-size", "")
          : document.documentElement.setAttribute("data-sidebar-size", "sm");
      } else if (windowSize > 1025) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.documentElement.getAttribute("data-sidebar-size") === "lg"
          ? document.documentElement.setAttribute("data-sidebar-size", "sm")
          : document.documentElement.setAttribute("data-sidebar-size", "lg");
      } else if (windowSize <= 767) {
        document.body.classList.add("vertical-sidebar-enable");
        document.documentElement.setAttribute("data-sidebar-size", "lg");
      }
    }

    //Two column menu
    if (document.documentElement.getAttribute("data-layout") === "twocolumn") {
      document.body.classList.contains("twocolumn-panel")
        ? document.body.classList.remove("twocolumn-panel")
        : document.body.classList.add("twocolumn-panel");
    }
  };

  const { t } = useTranslation();
  return (
    <>
      <header id="page-topbar" className={headerClass}>
        <div className="layout-width">
          <div className="navbar-header">
            <div className="d-flex">
              <div className="navbar-brand-box horizontal-logo">
                <Link to="/" className="logo logo-dark">
                  <span className="logo-sm">
                    <img src={logo} alt="" height="50" />
                  </span>
                  <span className="logo-lg">
                    <img
                      src={logo}
                      alt=""
                      height="60"
                      style={{ position: "relative", top: -5 }}
                    />
                  </span>
                </Link>

                <Link to="/" className="logo logo-light">
                  <span className="logo-sm">
                    <img src={logo} alt="" height="22" />
                  </span>
                  <span className="logo-lg">
                    <img
                      src={logo}
                      alt=""
                      height="60"
                      style={{ position: "relative", top: -5 }}
                    />
                  </span>
                </Link>
              </div>

              <button
                onClick={toogleMenuBtn}
                type="button"
                className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger shadow-none"
                id="topnav-hamburger-icon"
              >
                <span className="hamburger-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>

              {/* <SearchOption /> */}
            </div>

            <div className="d-flex align-items-center gap-2">
              <Dropdown
                isOpen={search}
                toggle={toogleSearch}
                className="d-md-none topbar-head-dropdown header-item"
              >
                <DropdownToggle
                  type="button"
                  tag="button"
                  className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
                >
                  <i className="bx bx-search fs-22"></i>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-lg dropdown-menu-end p-0">
                  <Form className="p-3">
                    <div className="form-group m-0">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search ..."
                          aria-label="Recipient's username"
                        />
                        <button className="btn btn-primary" type="submit">
                          <i className="mdi mdi-magnify"></i>
                        </button>
                      </div>
                    </div>
                  </Form>
                </DropdownMenu>
              </Dropdown>

              {/* LanguageDropdown */}
              <LanguageDropdown />

              {/* FullScreenDropdown */}
              {/* <FullScreenDropdown /> */}
              {/* Dark/Light Mode set */}
              <LightDark
                layoutMode={layoutModeType}
                onChangeLayoutMode={onChangeLayoutMode}
              />
              <DateDropDown />

              {totalloggedInUsers > 0 && (
                <button
                  type="button"
                  className="topbar-online-users"
                  title={t("TotalLoggedInUsers") ?? "Total Logged-in Users"}
                  disabled={!getLoggedInUsersListPermExists || loading}
                  onClick={async () => {
                    if (getLoggedInUsersListPermExists) {
                      setLoading(true);
                      const res = await dispatch(getLoggedInUsers());
                      setLoading(false);
                      if (!res?.ok) {
                        return;
                      }
                      toggleShowLoggedInUsersDataPopupModal();
                    }
                  }}
                >
                  <span className="online-dot" />
                  <span className="online-copy">
                    <span className="online-label">online</span>
                    <span className="online-count">{totalloggedInUsers}</span>
                  </span>
                </button>
              )}

              {/* ProfileDropdown */}
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>
      {showLoggedInUsersDataPopupModal && (
        <PopupModal
          label={t("LoggedInUsers")}
          model={models.LOGGEDIN_USERS_LIST}
          showPopupModal={showLoggedInUsersDataPopupModal}
          togglePopupModal={toggleShowLoggedInUsersDataPopupModal}
        />
      )}
    </>
  );
};

export default Header;
