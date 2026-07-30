import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { GetDetailForm } from "./modalHelper";

type Props = {
  model: string;
  label: string;
  value: number | string;
  showDetailModal: boolean;
  params?: any;
  toggleDetailModal: () => void;
  header?: string;
};

const DetailModal: React.FC<Props> = ({
  model,
  label,
  value,
  showDetailModal,
  params,
  toggleDetailModal,
  header,
}) => {

  return (
    <Modal
      id="detail"
      isOpen={showDetailModal}
      toggle={toggleDetailModal}
      size="xl"
    >
      <ModalHeader
        className="modal-title"
        id="myModalLabel"
        toggle={toggleDetailModal}
      >
        <span>{header ? header : label} Detail </span>
      </ModalHeader>
      <ModalBody>
        <GetDetailForm model={model} id={value as number} params={params} />
      </ModalBody>
    </Modal>
  );
};

export default DetailModal;
