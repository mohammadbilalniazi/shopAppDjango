import { Modal, ModalHeader, ModalBody } from "reactstrap";

import InputWrapper from "../InputWrapper";
import { useTranslation } from "react-i18next";
import Form from "../Form";
import AppRow from "../../AppRow";
import FormTextArea from "../FormTextArea";
import SubmitButton from "../SubmitButton";
import { useState } from "react";
import useRemunirationDetailPayment from "../../../hooks/payroll/remuneration/useRemunirationDetailPayment";
import { RemunirationDetailPaymentsSearch } from "../../../types/entities/payroll/remuniration/remunirationDetailPayments";
type Props = {
  label: string;
  showPopupModal: boolean;
  params?: any;
  togglePopupModal: () => void;
  onRemoveItems: (arrayOfdata: any) => void;
  header?: string;
  disabled?: boolean;
};

const TextPopupModal: React.FC<Props> = ({
  label,
  showPopupModal,
  params,
  togglePopupModal,
  header,
  onRemoveItems,
}) => {
  const { t } = useTranslation();
  const [deletting, setDeleting] = useState(false);
  const { handleEmployeeDeleteFromSalary } = useRemunirationDetailPayment();

  const onSubmit = async (data: any) => {
    const { institutionId, fiscalMonthId, fiscalYearId, id } =
      // eslint-disable-next-line no-unsafe-optional-chaining
      params;
    setDeleting(true);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const res = await handleEmployeeDeleteFromSalary({
      institutionId: institutionId,
      fiscalMonthId: fiscalMonthId,
      fiscalYearId: fiscalYearId,
      employeeAttendanceId: id,
      type: "SALARY",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      description: data.description,
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (res?.ok) {
      const data = JSON.parse(
        JSON.stringify(params)
      ) as RemunirationDetailPaymentsSearch;
      onRemoveItems([data]);
      togglePopupModal();
    }
    setDeleting(false);
  };

  return (
    <Modal
      id="detail"
      isOpen={showPopupModal}
      toggle={togglePopupModal}
      backdrop="static"
      size="l"
    >
      <ModalHeader
        className="modal-title"
        id="myModalLabel"
        toggle={togglePopupModal}
      >
        <span style={{ marginInlineStart: "auto" }}>{header ? header : label} </span>
      </ModalHeader>
      <ModalBody>
        {/* <Button onClick={togglePopupModal}>Close Model</Button> */}
        <Form onSubmit={onSubmit}>
          {() => (
            <>
              <AppRow>
                <InputWrapper style={{ width: "100%" }}>
                  <FormTextArea
                    style={{ width: "100%" }}
                    name="description"
                    label={t("Remarks")}
                    required
                  />
                </InputWrapper>
              </AppRow>
              <SubmitButton title={t("Suspend")} loading={deletting} />
            </>
          )}
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default TextPopupModal;
