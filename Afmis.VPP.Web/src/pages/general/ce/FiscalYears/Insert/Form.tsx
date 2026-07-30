import AppRow from "../../../../../Components/AppRow";
import FormFooter from "../../../../../Components/FormFooter";
import { fiscalYearSchema } from "../../../../../validations/general/ce";
import { useAppSelector } from "../../../../../store/hooks";
import { FiscalYear } from "../../../../../types/entities/general/ce";
import Form from "../../../../../Components/forms/Form";
import InputWrapper from "../../../../../Components/forms/InputWrapper";
import FormInput from "../../../../../Components/forms/FormInput";
import SubmitButton from "../../../../../Components/forms/SubmitButton";
import FormCheckBox from "../../../../../Components/forms/FormCheckBox";
import useFiscalYear from "../../../../../hooks/general/useFiscalYear";
import { useTranslation } from "react-i18next";

const FiscalYearInsertForm: React.FC = () => {
  const { inserting } = useAppSelector((state) => state.general.ce.fiscalYears);
  const { handleInsert } = useFiscalYear();

  const { t } = useTranslation();
  return (
    <Form
      initialValues={{} as FiscalYear}
      onSubmit={handleInsert}
      validationSchema={fiscalYearSchema}
    >
      {() => (
        <>
          <AppRow style={{ display: "flex" }}>
            <InputWrapper>
              <FormInput name="description" label={t("Remarks")} required />
            </InputWrapper>
            <InputWrapper>
              <FormInput name="year" label={t("FiscalYear")} required />
            </InputWrapper>
          </AppRow>
          <AppRow>
            <InputWrapper>
              <FormCheckBox name="status" label={t("Status")} />
            </InputWrapper>
          </AppRow>
          <FormFooter>
            <SubmitButton title={t("Save")} loading={inserting} />
          </FormFooter>
        </>
      )}
    </Form>
  );
};

export default FiscalYearInsertForm;
