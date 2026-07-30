import AppRow from "../../../../../Components/AppRow";
import FormFooter from "../../../../../Components/FormFooter";
import { fiscalYearSchema } from "../../../../../validations/general/ce";
import useNumericParams from "../../../../../hooks/useNumericParams";
import { useAppSelector } from "../../../../../store/hooks";
import Form from "../../../../../Components/forms/Form";
import SpinnerWrapper from "../../../../../Components/SpinnerWrapper";
import FormInput from "../../../../../Components/forms/FormInput";
import InputWrapper from "../../../../../Components/forms/InputWrapper";
import DeleteBtn from "../../../../../Components/DeleteBtn";
import SubmitButton from "../../../../../Components/forms/SubmitButton";
import FormCheckBox from "../../../../../Components/forms/FormCheckBox";
import useFiscalYear from "../../../../../hooks/general/useFiscalYear";
import { useTranslation } from "react-i18next";

const FiscalYearDetailForm: React.FC = () => {
  const id = useNumericParams();

  const { fiscalYear, getting, deleting, updating } = useAppSelector(
    (state) => state.general.ce.fiscalYears
  );

  const { handleUpdate, handleDelete } = useFiscalYear(id);

  const { t } = useTranslation();
  return (
    <Form
      initialValues={fiscalYear}
      onSubmit={handleUpdate}
      validationSchema={fiscalYearSchema}
      enableReinitialize
    >
      {() => (
        <SpinnerWrapper loading={getting} data={fiscalYear}>
          <AppRow style={{ display: "flex" }}>
            <InputWrapper>
              <FormInput name="description" label={t("Remarks")} required />
            </InputWrapper>
            <InputWrapper>
              <FormInput name="year" label={t("FiscalYear")} required />
            </InputWrapper>
            <InputWrapper>
              <FormCheckBox name="status" label={t("Status")} />
            </InputWrapper>
          </AppRow>
          <AppRow>
          
            <InputWrapper>
            <FormInput
        name="lastModifiedBy"
              label={t("lastModifiedBy")}         
              disabled
            />
          </InputWrapper>
          <InputWrapper>
            <FormInput
              name="createdBy"
              label={t("createdBy")}         
              disabled
            />
          </InputWrapper>
          </AppRow>

          <FormFooter>
            <DeleteBtn loading={deleting} onClick={handleDelete} />
            <SubmitButton title={t("Change")} loading={updating} />
          </FormFooter>
        </SpinnerWrapper>
      )}
    </Form>
  );
};

export default FiscalYearDetailForm;
