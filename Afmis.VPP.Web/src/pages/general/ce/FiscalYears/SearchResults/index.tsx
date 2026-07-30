import { useTranslation } from "react-i18next";
import PageLayout from "../../../../../Layouts/PageLayout";
import { screens } from "../../../../../constants/screens";
import {
  generalCeFiscalYearInsert,
  generalCeFiscalYears,
  generalCeFiscalYearsSearchResults,
} from "../../../../../routes/routes";
import { useAppSelector } from "../../../../../store/hooks";

import FiscalYearsSearchTable from "./SearchTable";

const FiscalYearsSearchResult: React.FC = () => {
  const { t } = useTranslation();
  document.title = t("Search") + " - " + t("FiscalYear");
  const { pageInfo } = useAppSelector((state) => state.general.ce.fiscalYears);

  return (
    <PageLayout
      title={t("FiscalYear")}
      header={t("FiscalYearData") ?? ""}
      noOfRecords={pageInfo?.totalRecords}
      screen={screens.SEARCH_RESULTS}
      model="FiscalYears"
      searchLink={generalCeFiscalYears}
      addLink={generalCeFiscalYearInsert}
      searchResultsLink={generalCeFiscalYearsSearchResults}
    >
      <FiscalYearsSearchTable />
    </PageLayout>
  );
};

export default FiscalYearsSearchResult;
