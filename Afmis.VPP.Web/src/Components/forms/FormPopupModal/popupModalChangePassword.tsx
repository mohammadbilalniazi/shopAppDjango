import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Input,
  Label,
} from "reactstrap";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";

import Form from "../Form";
import AppRow from "../../AppRow";
import FormFooter from "../../FormFooter";
import SubmitButton from "../SubmitButton";
import { useConfirm } from "../../../hooks/common/useConfirm";
import { useAppDispatch } from "../../../store/hooks";
import {
  changePasword,
  logout,
} from "../../../store/sa/userManagement/user/actions";
import { setToastAlert } from "../../../store/notifications/slice";

type Props = {
  model: string;
  label: string;
  showPopupModal: boolean;
  params?: any;
  togglePopupModal: () => void;
  header?: string;
};

type PasswordVisibility = {
  oldPassword: boolean;
  currentPassword: boolean;
  confirmPassword: boolean;
};

const PopupModalChangePassword: React.FC<Props> = ({
  model,
  label,
  showPopupModal,
  params,
  togglePopupModal,
  header,
}) => {
  if (model === "ApplicationUsers-ChangePassword" && params) {
    model = "ApplicationUsers-ChangePassword";
  }

  const navigate = useNavigate();
  const { ask } = useConfirm();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);

  const [passwordVisibility, setPasswordVisibility] =
    useState<PasswordVisibility>({
      oldPassword: false,
      currentPassword: false,
      confirmPassword: false,
    });

  const togglePasswordVisibility = (
    field: keyof PasswordVisibility
  ): void => {
    setPasswordVisibility((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const submit = async (values: {
    oldPassword: string;
    currentPassword: string;
    confirmPassword: string;
  }) => {
    const userId = localStorage.getItem("userId");

    if (!userId || !(await ask(t("confirmChangePassword")))) {
      return;
    }

    setLoading(true);

    const res = await dispatch(
      changePasword({
        id: userId,
        data: values,
      })
    );

    if (res?.ok === true) {
      const ok = await dispatch(logout());

      if (ok) {
        navigate("/");
      }
    }

    setLoading(false);
  };

  return (
    <>
      <style>
        {`
          .change-password-modal {
            width: calc(100% - 24px);
            max-width: 450px;
          }

          .change-password-modal .modal-content {
            overflow: hidden;
            border: none;
            border-radius: 18px;
            background: #ffffff;
            box-shadow:
              0 20px 50px rgba(23, 43, 77, 0.2),
              0 6px 20px rgba(23, 43, 77, 0.1);
          }

          .change-password-modal .modal-header {
            position: relative;
            display: block;
            min-height: 145px;
            padding: 0;
            overflow: hidden;
            border-bottom: none;
            color: #ffffff;
            background:
              radial-gradient(
                circle at 85% 20%,
                rgba(255, 255, 255, 0.2),
                transparent 30%
              ),
              linear-gradient(
                135deg,
                #00235e 0%,
                #00235e 55%,
                #00235e 100%
              );
          }

          .change-password-modal .modal-header::before {
            content: "";
            position: absolute;
            top: -70px;
            left: -45px;
            width: 170px;
            height: 170px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.08);
          }

          .change-password-modal .modal-header::after {
            content: "";
            position: absolute;
            right: -45px;
            bottom: -90px;
            width: 190px;
            height: 190px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.07);
          }

          .change-password-modal .modal-header .btn-close {
            position: absolute;
            z-index: 10;
            top: 12px;
            right: 12px;
            width: 30px;
            height: 30px;
            margin: 0;
            padding: 0;
            border-radius: 9px;
            background-color: rgba(255, 255, 255, 0.92);
            background-size: 10px;
            opacity: 1;
            transition:
              transform 0.2s ease,
              background-color 0.2s ease;
          }

          .change-password-modal .modal-header .btn-close:hover {
            background-color: #ffffff;
            transform: rotate(90deg);
          }

          .password-modal-header-content {
            position: relative;
            z-index: 2;
            padding: 20px 45px 18px;
            text-align: center;
          }

          .password-modal-icon {
            width: 54px;
            height: 54px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 9px;
            border: 1px solid rgba(255, 255, 255, 0.35);
            border-radius: 17px;
            color: #ffffff;
            background: rgba(255, 255, 255, 0.16);
            backdrop-filter: blur(8px);
          }

          .password-modal-icon i {
            font-size: 26px;
          }

          .password-modal-title {
            margin: 0;
            color: #ffffff;
            font-size: 20px;
            font-weight: 800;
            line-height: 1.35;
          }

          .password-modal-subtitle {
            margin: 5px 0 0;
            color: rgba(255, 255, 255, 0.78);
            font-size: 11px;
            font-weight: 400;
          }

          .change-password-modal .modal-body {
            padding: 22px 26px 20px;
            background:
              linear-gradient(
                180deg,
                rgba(242, 248, 252, 0.9) 0%,
                #ffffff 38%
              );
          }

          .password-fields-wrapper {
            width: 100%;
          }

          .password-form-group {
            margin-bottom: 14px;
          }

          .password-form-label {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 7px;
            color: #304756;
            font-size: 12px;
            font-weight: 700;
          }

          .password-label-icon {
            width: 25px;
            height: 25px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border-radius: 7px;
            color: #0d6efd;
            background: rgba(13, 110, 253, 0.09);
          }

          .password-label-icon i {
            font-size: 14px;
          }

          .password-input-wrapper {
            position: relative;
          }

          .password-form-input {
            width: 100%;
            min-height: 44px;
            padding: 8px 46px 8px 13px;
            border: 1px solid #d9e3e9;
            border-radius: 10px;
            color: #243b4a;
            background-color: #f8fafb;
            font-size: 13px;
            font-weight: 500;
            transition:
              border-color 0.2s ease,
              background-color 0.2s ease,
              box-shadow 0.2s ease;
          }

          .password-form-input:hover {
            border-color: #b8cad4;
            background-color: #ffffff;
          }

          .password-form-input:focus {
            border-color: #4294f5;
            background-color: #ffffff;
            box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1);
          }

          .password-form-input::placeholder {
            color: #a0adb5;
            font-size: 12px;
          }

          .password-visibility-button {
            position: absolute;
            z-index: 5;
            top: 50%;
            right: 6px;
            width: 34px;
            height: 34px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            border: none;
            border-radius: 8px;
            color: #71838d;
            background: transparent;
            transform: translateY(-50%);
            transition:
              color 0.2s ease,
              background-color 0.2s ease,
              transform 0.2s ease;
          }

          .password-visibility-button:hover {
            color: #0d6efd;
            background-color: rgba(13, 110, 253, 0.09);
          }

          .password-visibility-button:active {
            transform: translateY(-50%) scale(0.94);
          }

          .password-visibility-button:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.12);
          }

          .password-visibility-button i {
            font-size: 17px;
          }

          .password-security-note {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-top: 3px;
            padding: 10px 12px;
            border: 1px solid #dcecf4;
            border-radius: 10px;
            color: #5c7581;
            background-color: #f3faff;
            font-size: 10px;
            line-height: 1.6;
          }

          .password-security-note i {
            flex-shrink: 0;
            margin-top: 1px;
            color: #0798b3;
            font-size: 16px;
          }

          .change-password-footer {
            margin-top: 16px;
            padding-top: 15px;
            border-top: 1px solid #edf1f3;
          }

          .change-password-footer button {
            min-height: 42px;
            border: none;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
            box-shadow: 0 7px 17px rgba(13, 110, 253, 0.18);
            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease;
          }

          .change-password-footer button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(13, 110, 253, 0.24);
          }

          @media (max-width: 576px) {
            .change-password-modal {
              width: calc(100% - 18px);
              margin: 9px auto;
            }

            .change-password-modal .modal-content {
              border-radius: 16px;
            }

            .change-password-modal .modal-header {
              min-height: 135px;
            }

            .password-modal-header-content {
              padding: 18px 40px 16px;
            }

            .password-modal-icon {
              width: 50px;
              height: 50px;
              border-radius: 15px;
            }

            .password-modal-icon i {
              font-size: 24px;
            }

            .password-modal-title {
              font-size: 18px;
            }

            .change-password-modal .modal-body {
              padding: 19px 17px 18px;
            }

            .password-form-input {
              min-height: 42px;
            }
          }
        `}
      </style>

      <Modal
        isOpen={showPopupModal}
        toggle={togglePopupModal}
        centered
        className="change-password-modal"
      >
        <ModalHeader toggle={togglePopupModal}>
          <div className="password-modal-header-content">
            <div className="password-modal-icon">
              <i className="ri-lock-password-line" />
            </div>

            <h2 className="password-modal-title">
              {header ? header : label}
            </h2>

            <p className="password-modal-subtitle">
              {t("ChangePassword")}
            </p>
          </div>
        </ModalHeader>

        <ModalBody>
          <Form
            onSubmit={submit}
            validationSchema={Yup.object({
              oldPassword: Yup.string().required(
                "Please Enter Your Current Password"
              ),
              currentPassword: Yup.string().required(
                "Please Enter Your New Password"
              ),
              confirmPassword: Yup.string().required(
                "Please Enter Your Confirm Password"
              ),
            })}
          >
            {() => (
              <>
                <AppRow>
                  <div className="password-fields-wrapper">
                    <div className="password-form-group">
                      <Label
                        className="password-form-label"
                        htmlFor="oldPassword"
                      >
                        <span className="password-label-icon">
                          <i className="ri-key-2-line" />
                        </span>

                        <span>{t("OldPassword")}</span>
                      </Label>

                      <div className="password-input-wrapper">
                        <Input
                          name="oldPassword"
                          id="oldPassword"
                          type={
                            passwordVisibility.oldPassword
                              ? "text"
                              : "password"
                          }
                          className="password-form-input"
                          placeholder={t("OldPassword")??""}
                          autoComplete="current-password"
                          required
                        />

                        <button
                          type="button"
                          className="password-visibility-button"
                          aria-label={
                            passwordVisibility.oldPassword
                              ? "Hide old password"
                              : "Show old password"
                          }
                          onClick={() =>
                            togglePasswordVisibility("oldPassword")
                          }
                        >
                          <i
                            className={
                              passwordVisibility.oldPassword
                                ? "ri-eye-off-line"
                                : "ri-eye-line"
                            }
                          />
                        </button>
                      </div>
                    </div>

                    <div className="password-form-group">
                      <Label
                        className="password-form-label"
                        htmlFor="currentPassword"
                      >
                        <span className="password-label-icon">
                          <i className="ri-lock-line" />
                        </span>

                        <span>{t("CurrentPassword")}</span>
                      </Label>

                      <div className="password-input-wrapper">
                        <Input
                          name="currentPassword"
                          id="currentPassword"
                          type={
                            passwordVisibility.currentPassword
                              ? "text"
                              : "password"
                          }
                          className="password-form-input"
                          placeholder={t("CurrentPassword")??""}
                          autoComplete="new-password"
                          required
                        />

                        <button
                          type="button"
                          className="password-visibility-button"
                          aria-label={
                            passwordVisibility.currentPassword
                              ? "Hide new password"
                              : "Show new password"
                          }
                          onClick={() =>
                            togglePasswordVisibility("currentPassword")
                          }
                        >
                          <i
                            className={
                              passwordVisibility.currentPassword
                                ? "ri-eye-off-line"
                                : "ri-eye-line"
                            }
                          />
                        </button>
                      </div>
                    </div>

                    <div className="password-form-group">
                      <Label
                        className="password-form-label"
                        htmlFor="confirmPassword"
                      >
                        <span className="password-label-icon">
                          <i className="ri-shield-check-line" />
                        </span>

                        <span>{t("ConfirmPassword")}</span>
                      </Label>

                      <div className="password-input-wrapper">
                        <Input
                          name="confirmPassword"
                          id="confirmPassword"
                          type={
                            passwordVisibility.confirmPassword
                              ? "text"
                              : "password"
                          }
                          className="password-form-input"
                          placeholder={t("ConfirmPassword")??""}
                          autoComplete="new-password"
                          required
                        />

                        <button
                          type="button"
                          className="password-visibility-button"
                          aria-label={
                            passwordVisibility.confirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                          onClick={() =>
                            togglePasswordVisibility("confirmPassword")
                          }
                        >
                          <i
                            className={
                              passwordVisibility.confirmPassword
                                ? "ri-eye-off-line"
                                : "ri-eye-line"
                            }
                          />
                        </button>
                      </div>
                    </div>

                    <div className="password-security-note">
                      <i className="ri-shield-keyhole-line" />

                      <span>
                        پس از تغییر موفقانه رمز عبور، از سیستم خارج شده و
                        دوباره با رمز عبور جدید وارد خواهید شد.
                      </span>
                    </div>
                  </div>
                </AppRow>

                <div className="change-password-footer">
                  <FormFooter>
                    <SubmitButton
                      model="ApplicationUsers-ChangePassword"
                      title={t("ChangePassword")}
                      loading={loading}
                      onClick={() => {
                        const currentPassword =
                          document.getElementById(
                            "currentPassword"
                          ) as HTMLInputElement;

                        const confirmPassword =
                          document.getElementById(
                            "confirmPassword"
                          ) as HTMLInputElement;

                        const oldPassword =
                          document.getElementById(
                            "oldPassword"
                          ) as HTMLInputElement;

                        if (
                          currentPassword.value === "" ||
                          confirmPassword.value === "" ||
                          oldPassword.value === ""
                        ) {
                          dispatch(
                            setToastAlert({
                              msg: "تمام خانه باید تکمیل شود",
                              type: "error",
                            })
                          );

                          return false;
                        }

                        submit({
                          currentPassword: currentPassword.value,
                          confirmPassword: confirmPassword.value,
                          oldPassword: oldPassword.value,
                        });
                      }}
                    />
                  </FormFooter>
                </div>
              </>
            )}
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
};

export default PopupModalChangePassword;