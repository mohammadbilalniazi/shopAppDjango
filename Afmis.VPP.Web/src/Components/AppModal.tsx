import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalProps,
} from "reactstrap";

type Props = {
  show: boolean;
  toggle: VoidFunction;
  Header: React.ReactNode;
  Footer?: React.ReactNode;
} & ModalProps;

const AppModal: React.FC<Props> = ({
  show,
  toggle,
  Header,
  Footer,
  children,
  ...props
}) => {
  return (
    <Modal isOpen={show} toggle={toggle} centered {...props}>
      <ModalHeader className="modal-title" toggle={toggle}>
        {Header}
      </ModalHeader>
      <ModalBody>{children}</ModalBody>
      {Footer && <ModalFooter>{Footer}</ModalFooter>}
    </Modal>
  );
};

export default AppModal;
