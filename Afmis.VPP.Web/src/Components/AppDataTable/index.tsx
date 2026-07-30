import { AgGridReact } from "ag-grid-react"; // the AG Grid React Component
import { useMemo } from "react";

import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS
// import "ag-grid-enterprise";

import Click from "./Click";
import { useAppSelector } from "../../store/hooks";
import { Columns } from "../../types/base";
import { useTranslation } from "react-i18next";
import { isRtlLanguage } from "../../utilities/languageDirection";
// import { FirstDataRenderedEvent, GridReadyEvent } from "ag-grid-community";

export type AppDataTableProps<T> = {
  columns: Columns<T>;
  cellRendererParams?: ({ data }: { data: T }) => {
    lookup: boolean | undefined;
    onClick: () => void;
    url?: string;
    [key: string]: any;
  };

  data: T[];
  onSelection?: (data: T[]) => void;
  height?: string | null;
  customPageSize?: number | null;
  [key: string]: any;
};

const AppDataTable = <T,>({
  columns,
  data = [],
  cellRendererParams,
  onSelection,
  height = null,
  customPageSize = null,
  rowSelection = "multiple",
  ...props
}: AppDataTableProps<T>) => {
  // DefaultColDef sets props common to all Columns
  const { pageSize } = useAppSelector((state) => state.global);
  const layoutModeType = useAppSelector((state) => state.Layout.layoutModeType);
  const { i18n } = useTranslation();
  const isRtl = isRtlLanguage(i18n.language);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      cellRenderer: Click,
      cellRendererParams,
      flex: 1,
      minWidth: 100,
      resizable: true,
      // enableRowGroup: true,
    }),
    [cellRendererParams],
  );

  // Determine ag-grid theme class based on layout mode
  const gridThemeClass =
    layoutModeType === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine";

  return (
    <div
      className={gridThemeClass}
      style={{ height: height ? height : "65vh" }}
    >
      <AgGridReact
        rowData={data} // Row Data for Rows
        columnDefs={columns} // Column Defs for Columns
        defaultColDef={defaultColDef} // Default Column Properties
        animateRows={true} // Optional - set to 'true' to have rows animate when sorted
        rowSelection={rowSelection} // Options - allows click selection of rows
        domLayout={"normal"} // Options - 'autoHeight' or 'normal'
        headerHeight={35}
        enableRtl={isRtl}
        // onGridReady={onGridReady}
        // onFirstDataRendered={onFirstDataRendered}
        onSelectionChanged={(data) =>
          onSelection && onSelection(data.api.getSelectedRows())
        }
        pagination={true}
        paginationPageSize={customPageSize ?? pageSize}
        {...props}
      />
    </div>
  );
};

export default AppDataTable;
