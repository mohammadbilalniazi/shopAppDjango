import { Modal, ModalHeader, ModalBody } from "reactstrap";

import InputWrapper from "../InputWrapper";
import { useTranslation } from "react-i18next";
import Form from "../Form";
import AppRow from "../../AppRow";
import { useState } from "react";
import FormInput from "../FormInput";
import FormDatePicker from "../FormDatePicker";
import useM41 from "../../../hooks/payroll/report/useM41";
import { payrollRemunirationDetailPaymentsSearchResults } from "../../../routes/routes";
import { useNavigate } from "react-router-dom";
import PermissionButton from "../PermissionButton";
import { AiOutlineDownload } from "react-icons/ai";
type Props = {
  label: string;
  showPopupModal: boolean;
  params?: any;
  togglePopupModal: () => void;
  header?: string;
  disabled?: boolean;
};

const M41PopupModal: React.FC<Props> = ({
  label,
  showPopupModal,
  params,
  togglePopupModal,
  header,
}) => {
  const { t } = useTranslation();
  const [creating, setCreating] = useState(false);
  const { handleInsertAndDownload } = useM41();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    const { institutionId, fiscalMonthId, fiscalYearId } = params;
    const { date, number } = data;
    setCreating(true); 
    const res = await handleInsertAndDownload({
      institutionIds: [institutionId],
      fiscalMonthId: fiscalMonthId,
      fiscalYearId: fiscalYearId,
      date: date,
      number: number, 
      id: 0,
      institutionId: 0,
      institutionType: "",
    }); 
    if (res) {
      togglePopupModal();
      navigate(payrollRemunirationDetailPaymentsSearchResults);
    }
    setCreating(false);
  };

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
      >
        <span style={{ marginInlineStart: "auto" }}>{header ? header : label} </span>
      </ModalHeader>
      <ModalBody>
        {/* <Button onClick={togglePopupModal}>Close Model</Button> */}
        <Form onSubmit={onSubmit}>
          {(formik) => (
            <>
              <AppRow>
                <InputWrapper>
                  <FormInput name="number" label={t("m41No")} type="number"/>
                </InputWrapper>
                <InputWrapper>
                  <FormDatePicker
                    name="date"
                    label={t("Date")}
                    calendar="shamsi"
                  />
                </InputWrapper> 
              </AppRow>
              {/* <SubmitButton title={t("Create")} loading={creating} /> */}
              <PermissionButton
                className="primary"
                style={{ marginInlineStart: "10px", padding: 7 }}
                onClick={()=>{
                  onSubmit(formik.values);
                }}
                id="Istiqaq-Search"
                loading={creating}
                title={t("CreatAndDownloadM41")??""}
                toltipTitle={t("CreatAndDownloadM41")??""}
                icon={<AiOutlineDownload fontSize={21} />}
              />        
            </>
          )}
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default M41PopupModal;
