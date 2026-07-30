import { useMemo } from "react";
import AppDataTableWithServerSidePagination from "../../../../../Components/AppDataTable/AppDataTableWithServerSidePagination";
import { SearchResultsProps } from "../../../../../types/screen";
import { useAppSelector } from "../../../../../store/hooks";
import { FiscalYear } from "../../../../../types/entities/general/ce";
import { Columns } from "../../../../../types/base";
import { generalCeFiscalYears } from "../../../../../routes/routes";
import { searchFiscalYears } from "../../../../../store/general/ce/fiscalYear/actions";
import { useTranslation } from "react-i18next";

const FiscalYearsSearchTable: React.FC<SearchResultsProps> = ({
  lookup,
  onClick,
}) => {
  const { fiscalYears, formData, pageInfo } = useAppSelector(
    (state) => state.general.ce.fiscalYears,
  );
  const { t } = useTranslation();
  const columns = useMemo<Columns<FiscalYear>>(
    () => [
      {
        headerName: t("FiscalYear") ?? "",
        field: "year",
      },
      {
        headerName: t("Status") ?? "",
        valueGetter: ({ data }) => {
          return data?.status === true ? "فعال" : "غیر فعال";
        },
      },

      {
        headerName: t("Remarks") ?? "",
        field: "description",
      },
    ],
    [t],
  );

  return (
    <AppDataTableWithServerSidePagination
      columns={columns}
      data={fiscalYears}
      cellRendererParams={({ data }) => {
        return {
          onClick: () => onClick && onClick({ id: data.id, value: data.year }),
          lookup,
          url: `${generalCeFiscalYears}/${data.id}`,
        };
      }}
      action={searchFiscalYears}
      formData={formData}
      pageInfo={pageInfo}
      // transForm={() =>
      //   transformLookups(formData, {
      //     institution: "institutionid",
      //   })
      // }
    />
  );
};

export default FiscalYearsSearchTable;
