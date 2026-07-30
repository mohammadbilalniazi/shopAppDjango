import { Modal, ModalHeader, ModalBody } from "reactstrap";
import GenerateFormField from "../GenerateFormField";
import { ObjectAny } from "../../types/base";
import { FormikProps } from "formik";
import Form from "../forms/Form";
import InputWrapper from "../forms/InputWrapper";
import SubmitButton from "../forms/SubmitButton";
import FormFooter from "../FormFooter";
import AppRow from "../AppRow";
import { useTranslation } from "react-i18next";

type Props = {
  showModal: boolean;
  toggleModal: () => void;
  label: string;
  inputsConfig: (p: FormikProps<ObjectAny>) => ObjectAny[];
  checkBoxesConfig: (p: FormikProps<ObjectAny>) => ObjectAny[];
  initialValues: ObjectAny;
  onSubmit: (val: ObjectAny) => void;
  enableReinitialize?: boolean;
  validationSchema?: ObjectAny;
  disabled?: boolean;
  [key: string]: any;
};

const InputModal: React.FC<Props> = ({
  showModal,
  toggleModal,
  label,
  inputsConfig,
  checkBoxesConfig,
  initialValues,
  onSubmit,
  enableReinitialize = true,
  validationSchema,
  disabled,
  ...props
}) => {
  const {t}=useTranslation();
  return (
    <Modal id="myModal" isOpen={showModal} toggle={toggleModal} size="xl">
      <ModalHeader
        className="modal-title"
        id="myModalLabel"
        toggle={toggleModal}
      >
        <span>{label}</span>
      </ModalHeader>
      <ModalBody>
        <Form
          initialValues={initialValues}
          onSubmit={onSubmit}
          enableReinitialize={enableReinitialize}
          validationSchema={validationSchema}
          {...props}
        >
          {(props) => {
            return (
              <>
                <AppRow>
                  {inputsConfig(props).map((config) => (
                    <InputWrapper key={config.id}>
                      <GenerateFormField config={config} />
                    </InputWrapper>
                  ))}
                </AppRow>
                <AppRow>
                  {checkBoxesConfig(props).map((config) => (
                    <InputWrapper key={config.id}>
                      <GenerateFormField config={config} />
                    </InputWrapper>
                  ))}
                </AppRow>
                <FormFooter>
                  <SubmitButton title={t("Save")} disabled={disabled} />
                </FormFooter>
              </>
            );
          }}
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default InputModal;
