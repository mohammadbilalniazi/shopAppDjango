import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { GetSimplePopupForm } from "../FormLookupInput/modalHelperSimplePopups";
import { Suspense } from "react";
import TopBar from "../../TopBar";
import { PopupModalProps } from "../../../types/base";


const PopupModal: React.FC<PopupModalProps> = ({
  model,
  label,
  showPopupModal,
  params,
  togglePopupModal,
  extraHeaderNodes,
  header,
  disabled = false,
  ...props
}) => {
  return (
    <Modal
      id="detail"
      isOpen={showPopupModal}
      toggle={togglePopupModal}
      backdrop="static"
     size="xl"
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
    {/* Left side: extraHeaderNodes */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      {extraHeaderNodes?.map((node, idx) => (
        <div key={idx}>{node}</div>
      ))}
    </div>

    {/* Right side: header or label */}
    <div style={{ textAlign: "start", marginInlineStart: "auto" }}>
      {header ? (
        <h3 style={{ margin: 0 }}>{header}</h3>
      ) : (
        <span>{label}</span>
      )}
    </div>
  </div>
</ModalHeader>

      <ModalBody>
        <Suspense fallback={<TopBar />}>
        <GetSimplePopupForm
          model={model}
          params={params}
          toggle={togglePopupModal}
          disabled={disabled}
          showPopupModal={showPopupModal}
          {...props}
        />
        </Suspense>
     
      </ModalBody>
    </Modal>
  );
};

export default PopupModal;
