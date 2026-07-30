import AppModal from "./AppModal";
import { useConfirm } from "../hooks/common/useConfirm";
import AppButton from "./AppButton";
import CancelButton from "./forms/Button/CancelButton";
import { t } from "i18next";

const ConfirmModal = () => {
  const { isAsking, message, deny, confirm } = useConfirm();
  return ( 
    <AppModal
      show={isAsking}
      toggle={deny}
      centered
      size="lg"
      Header={<span> {t("Confirmation")} </span>}
      Footer={
        <div className="alert-modal-footer">
          <AppButton
            color={message && message.includes("delete") ? "danger" : "primary"}
            onClick={confirm}
          >
           {t("Confirm")} 
          </AppButton>
          <CancelButton onClick={deny} />
        </div>
      }
    >
      <div className="alert-modal-body">
        <div>{message}</div>
        {message && message[message.length - 1] !== "?" && (
          <div>{t("Areyousureyouwanttocontinue")}</div>
        )}
      </div>
    </AppModal>
  );
};

export default ConfirmModal;
