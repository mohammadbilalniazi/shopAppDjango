import { Modal, ModalHeader, ModalBody } from "reactstrap";

import { useTranslation } from "react-i18next";
import Form from "../Form";
import AppRow from "../../AppRow";
import SubmitButton from "../SubmitButton";
import { useState } from "react";

import FormSelect from "../FormSelect";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import useRemunirationDetailPayment from "../../../hooks/payroll/remuneration/useRemunirationDetailPayment";
import { searchRemunirationDetailPayments } from "../../../store/payroll/remuniration/remunirationDetailPayment/actions";
type Props = {
  label: string;
  showPopupModal: boolean;
  params?: any;
  onReplaceAllData: any;
  togglePopupModal: () => void;
  header?: string;
  disabled?: boolean;
};

const RemTypeDeletePopupModal: React.FC<Props> = ({
  label,
  showPopupModal,
  onReplaceAllData,
  params,
  togglePopupModal,
  header,
}) => {
  const { t } = useTranslation();
  const [creating, setCreating] = useState(false);
  const { handleDeleteRemTypeFromSalary } = useRemunirationDetailPayment();

  const dispatch = useAppDispatch();
  const { remunirationDetailPaymentSearch, usedRemunirationTypes } =
    useAppSelector(
      (state) => state.payroll.remuniration.remunirationDetailPayments
    );
  const onSubmit = async (data: any) => {
    const { institutionId, fiscalMonthId, fiscalYearId } = params;
    setCreating(true);
    const res = await handleDeleteRemTypeFromSalary({
      institutionId: institutionId,
      fiscalMonthId: fiscalMonthId,
      fiscalYearId: fiscalYearId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      remunerationTypeId: data.remunirationTypeId,
    });

    if (res?.ok) {
       await dispatch(
        searchRemunirationDetailPayments({
          data: {
            institutionId: institutionId,
            fiscalMonthId: fiscalMonthId,
            fiscalYearId: fiscalYearId,
          },
        })
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      onReplaceAllData(remunirationDetailPaymentSearch);
      togglePopupModal();
    }
    setCreating(false);
  };

  return (
    <Modal
      id="detail"
      isOpen={showPopupModal}
      toggle={togglePopupModal}
      backdrop="static"
      size="md"
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
                <FormSelect
                  name="remunirationTypeId"
                  label={t("RemunirationType")}
                  options={usedRemunirationTypes}
                  getOptionLabel={(data) =>
                    `${data.object}` +
                    " " +
                    data.name +
                    "-" +
                    (data.objectType == "AUTO" ? "اتومات" : t("Mannual"))
                  }
                  getOptionValue={(data) => data.id}
                  valField="id"
                  
                  required
                />
              </AppRow>
              <SubmitButton
                title={t("delete")}
                loading={creating}
                style={{ backgroundColor: "red", borderColor: "red" }}
              />
            </>
          )}
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default RemTypeDeletePopupModal;
