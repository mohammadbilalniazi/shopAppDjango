import { TypeOptions } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearModalAlert } from "../store/notifications/slice";
import AppModal from "./AppModal";
import AppButton from "./AppButton";

const ModalColor: { [key: string]: string } = {
  success: "success",
  error: "danger",
  warning: "warning",
  info: "info",
};

const AlertModal: React.FC = () => {
  const { modalAlert } = useAppSelector((state) => state.notifications);
  const dispatch = useAppDispatch();

  if (!modalAlert) return null;

  const { msg, type, description } = modalAlert;

  const toggle = () => dispatch(clearModalAlert());

  return (
    msg && (
      <AppModal
        show={!!msg}
        toggle={toggle}
        size={description ? "xl" : "md"}
        Header={<ModalHeader type={type} />}
        Footer={<ModalFooter toggle={toggle} />}
      >
        <div className="alert-modal-body">
          <div
            className={`alert alert-${ModalColor[type as string]}`}
            role="alert"
          >
            <div style={{ fontWeight: "bold" }}>{msg as string}</div>
            {description && (
              <>
                <br /> <div>{description}</div>
              </>
            )}
          </div>
        </div>
      </AppModal>
    )
  );
};

export default AlertModal;

type ModalHeaderProps = {
  type?: TypeOptions;
};

const ModalHeader: React.FC<ModalHeaderProps> = ({ type }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <span style={{ color: ModalColor[type as string] }}>
      {type?.toUpperCase()}
    </span>
  </div>
);

type ModalFooterProps = {
  toggle: VoidFunction;
};

const ModalFooter: React.FC<ModalFooterProps> = ({ toggle }) => (
  <div className="alert-modal-footer">
    <AppButton color="secondary" onClick={toggle}>
      Close
    </AppButton>
  </div>
);
