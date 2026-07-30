import { useState } from "react";
import { TypeOptions } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearConfirmModalAlert } from "../store/notifications/slice";
import AppModal from "./AppModal";
import AppButton from "./AppButton";
import { t } from "i18next";

const ModalColor: { [key: string]: string } = {
  success: "success",
  error: "danger",
  warning: "warning",
  info: "info",
};

const ConfirmAlertModal: React.FC = () => {
  const { confirmModalAlert } = useAppSelector((state) => state.notifications);
  const dispatch = useAppDispatch();

  const [confirming, setConfirming] = useState(false);

  if (!confirmModalAlert) return null;

  const {
  title,
  msg,
  type = "warning",
  description,
  confirmText = "Confirm",
  closeText = "Close",
  mismatchRows = [],
  onConfirm,
} = confirmModalAlert;

  const toggle = () => {
    if (confirming) return;
    dispatch(clearConfirmModalAlert());
  };

  const handleConfirm = async () => {
    try {
      setConfirming(true);

      if (onConfirm) {
        await onConfirm();
      }

      dispatch(clearConfirmModalAlert());
    } finally {
      setConfirming(false);
    }
  };

  return (
    <AppModal
      show={true}
      toggle={toggle}
      size={description ? "lg" : "sm"}
      Header={<ModalHeader title={title} type={type} />}
      Footer={
        <ModalFooter
          closeText={closeText || t("Close")}
          confirmText={confirmText || t("Confirm")}
          toggle={toggle}
          onConfirm={handleConfirm}
          type={type}
          confirming={confirming}
        />
      }
    >
      <div className="alert-modal-body">
        {msg && (
          <div
            className={`alert alert-${ModalColor[type as string] ?? "warning"}`}
            role="alert"
            style={{ whiteSpace: "pre-line" }}
          >
            <div style={{ fontWeight: "bold" }}>{msg as string}</div>

            {description && (
              <>
                <br />
                <div>{description}</div>
              </>
            )}
            {mismatchRows.length > 0 && (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {mismatchRows.map((row, index) => (
              <div
                key={`${row.label}-${index}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 46px 1fr",
                  gap: 10,
                  alignItems: "center",
                  padding: 10,
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  background: "#f8fafc",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#b42318",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    {row.label} - {t("Employee")}
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={row.employeeValue}
                    disabled
                    style={{
                      fontWeight: 700,
                      backgroundColor: "#fff5f5",
                      color: "#b42318",
                      border: "1px solid #fecaca",
                    }}
                  />
                </div>

                <div
                style={{
                   height: "100%",
                  minHeight: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 42,
                  lineHeight: "42px",
                  fontWeight: 900,
                  color: "#2563eb",
                  paddingTop: 22,
                }}
                >
                ←
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#166534",
                      marginBottom: 4,
                      display: "block",
                    }}
                  >
                    {row.label} - {t("ElectronicTazkira")}
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={row.eTazkiraValue}
                    disabled
                    style={{
                      fontWeight: 700,
                      backgroundColor: "#f0fdf4",
                      color: "#166534",
                      border: "1px solid #bbf7d0",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
          </div>
        )}
      </div>
    </AppModal>
  );
};

export default ConfirmAlertModal;

type ModalHeaderProps = {
  title?: string;
  type?: TypeOptions;
};

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, type }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontWeight: "bold",
    }}
  >
    <span style={{ color: ModalColor[type as string] ?? "warning" }}>
      {title ?? type?.toUpperCase() ?? "CONFIRM"}
    </span>
  </div>
);

type ModalFooterProps = {
  toggle: VoidFunction;
  onConfirm: VoidFunction;
  confirmText: string;
  closeText: string;
  type?: TypeOptions;
  confirming: boolean;
};

const ModalFooter: React.FC<ModalFooterProps> = ({
  toggle,
  onConfirm,
  confirmText,
  closeText,
  type,
  confirming,
}) => (
  <div
    className="alert-modal-footer"
   style={{
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  }}
  >
    <AppButton
      color="primary"
      onClick={toggle}
      disabled={confirming}
      style={{
        minWidth: 110,
      }}
    >
      {closeText || t("Close")}
    </AppButton>

    <AppButton
      color={ModalColor[type as string] ?? "warning"}
      onClick={onConfirm}
      disabled={confirming}
      style={{
        minWidth: 110,
      }}
    >
      {confirming ? t("PleaseWait") : confirmText}
    </AppButton>
  </div>
);