// Components/forms/FormPopupModal/popupModalPage.tsx
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { Suspense } from "react";
import TopBar from "../../TopBar";
import { PopupModalProps } from "../../../types/base";

type PopupModalWithChildren = PopupModalProps & { children?: React.ReactNode };

const PopupFormsDirectly: React.FC<PopupModalWithChildren> = ({
  label,
  showPopupModal,
  togglePopupModal,
  extraHeaderNodes,
  header,
  children,
}) => {
  return (
    <Modal
      id="detail"
      isOpen={showPopupModal}
      toggle={togglePopupModal}
      backdrop="static"
      size="xl"
      centered
    >
      <ModalHeader
        className="modal-title"
        id="myModalLabel"
        toggle={togglePopupModal}
        style={{ padding: "0.5rem 1rem", fontSize: "1rem", minHeight: "2rem" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {extraHeaderNodes?.map((node, idx) => (
              <div key={idx}>{node}</div>
            ))}
          </div>
          <div style={{ textAlign: "start", marginInlineStart: "auto" }}>
            {header ? <h3 style={{ margin: 0 }}>{header}</h3> : <span>{label}</span>}
          </div>
        </div>
      </ModalHeader>

      <ModalBody>
        <Suspense fallback={<TopBar />}>
          {children /* <-- render passed content (like BankAccountLetter) */}
        </Suspense>
      </ModalBody>
    </Modal>
  );
};

export default PopupFormsDirectly;
