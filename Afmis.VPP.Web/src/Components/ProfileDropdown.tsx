import { useCallback, useEffect, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
//import images
import avatar1 from "../assets/images/users/defaultProfile.webp";
import { useNavigate } from "react-router-dom";
import PopupModal from "./forms/FormPopupModal/popupModalChangePassword";
import { models } from "../constants/models";
import { logout } from "../store/sa/userManagement/user/actions";
import { useAppDispatch } from "../store/hooks";
import { t } from "i18next";
import { Employee } from "../types/entities/ara/employee/employees";

const ProfileDropdown = () => {
  const [userName] = useState(localStorage.getItem("userName") ?? "");
  const language = localStorage.getItem("I18N_LANGUAGE");
  const employee = JSON.parse(
    localStorage.getItem("employee") as string,
  ) as Employee;
  // const profileImage=employee?.photoPath?employee.photoPath:avatar1;
  const [profileImage, setProfileImage] = useState(avatar1);
  useEffect(() => {
    if (employee?.photoPath && employee.photoPath !== "") {
      setProfileImage(employee.photoPath);
    }
  }, [employee, employee?.photoPath]);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const toggleProfileDropdown = () => {
    setIsProfileDropdown(!isProfileDropdown);
  };
  const [showPopupModal, setShowPopupModal] = useState(false);
  const togglePopupModal = useCallback(() => {
    setShowPopupModal((sh) => !sh);
  }, []);

  return (
    <>
      <Dropdown
        isOpen={isProfileDropdown}
        toggle={toggleProfileDropdown}
        className="ms-sm-3 d-flex align-items-center"
      >
        <DropdownToggle
          tag="button"
          type="button"
          className="btn btn-light d-flex align-items-center rounded-pill border-0 shadow-none px-2 py-1"
        >
          <span className="d-flex align-items-center gap-2">
            <img
              className="rounded-circle header-profile-user"
              src={profileImage}
              alt="Header Avatar"
            />
            <span className="text-start">
              <span className="d-none d-xl-inline-block fw-medium user-name-text">
                {userName}
              </span>
            </span>
          </span>
        </DropdownToggle>
        <DropdownMenu
          className={`dropdown-menu-end ${
            language !== "en" ? "dropdown-rtl" : ""
          }`}
        >
          <h6 className="dropdown-header">
            {t("Welcome")} {userName}
          </h6>
          <DropdownItem href="/profile">
            <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
            <span className="align-middle">{t("Profile")}</span>
          </DropdownItem>
          {/* <DropdownItem href="/apps-chat">
            <i className="mdi mdi-message-text-outline text-muted fs-16 align-middle me-1"></i>{" "}
            <span className="align-middle">Messages</span>
          </DropdownItem> */}
          {/* <DropdownItem href="#">
            <i className="mdi mdi-calendar-check-outline text-muted fs-16 align-middle me-1"></i>{" "}
            <span className="align-middle">Taskboard</span>
          </DropdownItem> */}
          <DropdownItem href="/pages-faqs">
            <i className="mdi mdi-lifebuoy text-muted fs-16 align-middle me-1"></i>{" "}
            <span className="align-middle">{t("Help")}</span>
          </DropdownItem>
          <div className="dropdown-divider"></div>
          {/* <DropdownItem href="/pages-profile">
            <i className="mdi mdi-wallet text-muted fs-16 align-middle me-1"></i>{" "}
            <span className="align-middle">
              Balance : <b>$5971.67</b>
            </span>
          </DropdownItem> */}
          {/* <DropdownItem href="/pages-profile-settings">
            <span className="badge bg-soft-success text-success mt-1 float-end">
              New
            </span>
            <i className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1"></i>{" "}
            <span className="align-middle">Settings</span>
          </DropdownItem> */}
          {/* <DropdownItem href="/auth-lockscreen-basic">
            <i className="mdi mdi-lock text-muted fs-16 align-middle me-1"></i>{" "}
            <span className="align-middle">Lock screen</span>
          </DropdownItem> */}
          {/* <DropdownItem href="/auth-pass-change-basic"> */}
          <DropdownItem
            onClick={() => {
              setShowPopupModal(true);
            }}
          >
            <i className="mdi mdi-account-key text-muted fs-16 align-middle me-1"></i>{" "}
            <span className="align-middle" data-key="t-logout">
              {t("ChangePassword")}
            </span>
          </DropdownItem>
          <DropdownItem
            onClick={async () => {
              const userId = localStorage.getItem("userId");
              if (!userId || userId == "") {
                navigate("/");
              }
              await dispatch(logout(userId as string));
              // if (ok) {
              //   navigate("/");
              //   return true;
              // } else {
              //   return false;
              // }
            }}
          >
            <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{" "}
            <span className="align-middle" data-key="t-logout">
              {t("Logout")}
            </span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      {showPopupModal && (
        <PopupModal
          label={t("ChangePassword")}
          model={models.PASSWORD_RESET_FORM}
          showPopupModal={showPopupModal}
          togglePopupModal={togglePopupModal}
        />
      )}
    </>
  );
};

export default ProfileDropdown;
