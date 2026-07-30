import FiscalYearsSearchForm from "./Form";
import PageLayout from "../../../../../Layouts/PageLayout";

import {
  generalCeFiscalYears,
  generalCeFiscalYearInsert,
  generalCeFiscalYearsSearchResults,
} from "../../../../../routes/routes";
import { screens } from "../../../../../constants/screens";
import { useTranslation } from "react-i18next";

const FiscalYearsSearch: React.FC = () => {
  const { t } = useTranslation();
  document.title = ` ${t("FiscalYear")} - ${t("Search")} `;
  return (
    <PageLayout
      title={t("FiscalYear")}
      header={t("SearchFiscalYear") ?? ""}
      screen={screens.SEARCH}
      model="FiscalYears"
      searchLink={generalCeFiscalYears}
      addLink={generalCeFiscalYearInsert}
      searchResultsLink={generalCeFiscalYearsSearchResults}
    >
      <FiscalYearsSearchForm />
    </PageLayout>
  );
};

export default FiscalYearsSearch;
