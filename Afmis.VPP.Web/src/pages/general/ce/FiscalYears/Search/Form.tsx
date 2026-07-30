import AppRow from "../../../../../Components/AppRow";
import FormFooter from "../../../../../Components/FormFooter";

import { SearchProps } from "../../../../../types/screen";

import Form from "../../../../../Components/forms/Form";
import InputWrapper from "../../../../../Components/forms/InputWrapper";
import FormInput from "../../../../../Components/forms/FormInput";
import SubmitButton from "../../../../../Components/forms/SubmitButton";
import { useAppSelector } from "../../../../../store/hooks";

import { fiscalYearSearchSchema } from "../../../../../validations/general/ce";

import { fiscalYearResetFormData } from "../../../../../store/general/ce/fiscalYear/slice";
import FormCheckBox from "../../../../../Components/forms/FormCheckBox";
import useFiscalYear from "../../../../../hooks/general/useFiscalYear";
import { useTranslation } from "react-i18next";

const FiscalYearsSearchForm: React.FC<SearchProps> = ({ toggleSearch }) => {
  const { searching, formData } = useAppSelector(
    (state) => state.general.ce.fiscalYears
  );

  const { handleSearch } = useFiscalYear(null, toggleSearch);

  const { t } = useTranslation();
  return (
    <Form
      initialValues={formData}
      onSubmit={handleSearch}
      clearFormAction={fiscalYearResetFormData}
      validationSchema={fiscalYearSearchSchema}
      enableReinitialize
      showReset
    >
      {() => (
        <>
          <AppRow style={{ display: "flex" }}>
  
            <InputWrapper>
              <FormInput name="year" label={t("FiscalYear")} />
            </InputWrapper>
          </AppRow>
          <AppRow>
            <InputWrapper>
              <FormCheckBox name="status" label={t("Status")} triState />
            </InputWrapper>
          </AppRow>
          <FormFooter>
            <SubmitButton title={t("Search")} loading={searching} />
          </FormFooter>
        </>
      )}
    </Form>
  );
};

export default FiscalYearsSearchForm;
