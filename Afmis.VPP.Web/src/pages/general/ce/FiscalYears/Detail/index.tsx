import { useTranslation } from "react-i18next";
import { screens } from "../../../../../constants/screens";
import useNumericParams from "../../../../../hooks/useNumericParams";
import PageLayout from "../../../../../Layouts/PageLayout";

import {
  generalCeFiscalYearInsert,
  generalCeFiscalYears,
  generalCeFiscalYearsSearchResults,
} from "../../../../../routes/routes";

import FiscalYearDetailForm from "./Form";

const FiscalYearDetail: React.FC = () => {
  const id = useNumericParams();
  document.title = `سال مالی - ${id}`;
  const {t}=useTranslation();

  return (
    <PageLayout
      title={t("FiscalYear")}
      header="معلومات سال مالی"
      screen={screens.DETAIL}
      model="FiscalYears"
      searchLink={generalCeFiscalYears}
      addLink={generalCeFiscalYearInsert}
      searchResultsLink={generalCeFiscalYearsSearchResults}
    >
      <FiscalYearDetailForm />
    </PageLayout>
  );
};

export default FiscalYearDetail;
