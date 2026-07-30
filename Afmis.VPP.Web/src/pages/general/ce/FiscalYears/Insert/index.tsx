import { useTranslation } from "react-i18next";
import PageLayout from "../../../../../Layouts/PageLayout";
import { screens } from "../../../../../constants/screens";
import {
  generalCeFiscalYears,
  generalCeFiscalYearInsert,
  generalCeFiscalYearsSearchResults,
} from "../../../../../routes/routes";
import FiscalYearInsertForm from "./Form";

const FiscalYearInsert: React.FC = () => {
  
  const { t } = useTranslation();
  document.title = ` ${t("SaveFiscalYear")} - ${t("Search")} `;
  return (
    <PageLayout
      title={t("SaveFiscalYear")}
      header={t("SaveFiscalYear") ?? ""}
      screen={screens.INSERT}
      model="FiscalYears"
      searchLink={generalCeFiscalYears}
      addLink={generalCeFiscalYearInsert}
      searchResultsLink={generalCeFiscalYearsSearchResults}
    >
      <FiscalYearInsertForm />
    </PageLayout>
  );
};

export default FiscalYearInsert;
