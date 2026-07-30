import { ApiResponse } from "apisauce";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";

import { ColGroupDef, ExcelRow } from "ag-grid-enterprise";
import {
  GridReadyEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import Click from "./Click";
import { transformObjectForSearch } from "../../utilities/utilFuncs";
import { Columns, ObjectAny } from "../../types/base";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { AfmisResponse, PageInfo } from "../../types/store/shared";
import { Button, UncontrolledTooltip } from "reactstrap";
import { AiOutlineFileExcel } from "react-icons/ai";
import { onTableRefresh } from "../../utilities/utilFuncs2";
import { useTranslation } from "react-i18next";

type Props<T> = {
  columns: Columns<T>;
  cellRendererParams?: ({ data }: { data: T }) => {
    lookup: boolean | undefined;
    onClick: () => void;
    url?: string;
    [key: string]: any;
  };
  onSelection?: (data: T[]) => void;
  height?: string | null;
  action?: any;
  formData: Partial<T>;
  pageInfo?: Partial<PageInfo>;
  data: T[];
  customPageSize?: number | null;
  customParams?: ObjectAny;
  exportExcel?: boolean;
  footerRows?: ExcelRow[];
  isTransformObjectForSearch?: boolean;
  excelName?: string;
  setShouldUpdateData?: (value: boolean) => void;
  transForm?: () => Partial<T>;
  /** NEW: unique logical key; tables listening to this key will refresh when a matching event fires */
  refreshTableName?: string;
  [key: string]: any;
};

const AppDataTableWithServerSidePagination = <T,>({
  columns,
  cellRendererParams,
  onSelection,
  height = null,
  action,
  formData,
  pageInfo,
  excelName,
  data = [],
  customPageSize = null,
  customParams = {},
  exportExcel = false,
  footerRows = [],
  isTransformObjectForSearch = true,
  transForm,
  refreshTableName,
  ...props
}: Props<T>) => {
  const dispatch = useAppDispatch();
  const { pageSize: globalPageSize } = useAppSelector((state) => state.global);
  const layoutModeType = useAppSelector((state) => state.Layout.layoutModeType);
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [pageSize] = useState(customPageSize ?? globalPageSize);
  const location = useLocation();
  const state = location.state as { fromDetail?: boolean };

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      cellRenderer: Click,
      cellRendererParams,
      flex: 1,
      minWidth: 100,
      resizable: true,
      enableCellChangeFlash: true,
    }),
    [cellRendererParams],
  );

  const myAgGridRowStyle = {
    textAlign: "start" as const,
    fontWeight: "bold" as const,
  };

  const gridRef = useRef<AgGridReact | null>(null);
  const isFetching = useRef(false);
  const getRows = useCallback(
    async (params: IServerSideGetRowsParams<any, any>) => {
      // Prevent concurrent fetches
      if (isFetching.current) {
        return;
      }
      isFetching.current = true;

      const startRow = params.request.startRow ?? 0;
      const sortModel = params.request.sortModel;
      const pageNumber = startRow / pageSize + 1;

      // Check if a force-refresh is requested (legacy support)
      const shouldUpdateData = localStorage.getItem("shouldUpdateData") === "1";

      // Allow using cached data in very specific conditions (fast first paint)
      const useCachedData =
        !shouldUpdateData &&
        pageNumber === 1 &&
        data &&
        data.length > 0 &&
        (sortModel?.length ?? 0) === 0 &&
        !state?.fromDetail;

      if (useCachedData) {
        params.success({
          rowData: data,
          rowCount: (pageInfo?.totalRecords as number) ?? data.length,
        });
        isFetching.current = false;
        return;
      }

      // Prepare form data (optionally transformed)
      let formData_ = formData;
      if (transForm) {
        formData_ = transForm();
      }

      const payload = isTransformObjectForSearch
        ? transformObjectForSearch(formData_)
        : formData_;

      try {
        const res: ApiResponse<AfmisResponse<T[]>> = await dispatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          action({
            data: payload,
            params: { pageNumber, pageSize, ...customParams },
          }),
        );
        // console.log({'pageSize': pageSize, 'pageNumber': pageNumber, 'globalPageSize': globalPageSize,'totalresocrds ':res.data?.pagedInfo.totalRecords,data:res.data?.data});

        if (res?.ok && res.data) {
          const rows = res.data.data ?? [];
          const reportedTotal = res.data.pagedInfo.totalRecords ?? 0;

          let finalRowCount = reportedTotal;

          // If backend says more rows exist but current page returned fewer rows,
          // stop the grid from requesting beyond actual data.
          if (rows.length < pageSize) {
            finalRowCount = startRow + rows.length;
          }

          params.success({
            rowData: rows,
            rowCount: finalRowCount,
          });
        } else {
          params.fail();
        }
      } catch (err) {
        console.error("❌ Error fetching rows", err);
        params.fail();
      } finally {
        isFetching.current = false;
        // Clear legacy flag for next run
        setTimeout(() => {
          localStorage.setItem("shouldUpdateData", "0");
        }, 1);
      }
    },
    [
      pageSize,
      pageInfo,
      data,
      state?.fromDetail,
      formData,
      transForm,
      isTransformObjectForSearch,
      dispatch,
      customParams,
      action,
    ],
  );

  const datasource = useMemo<IServerSideDatasource>(
    () => ({
      getRows,
    }),
    [getRows],
  );

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      // attach initial datasource
      params.api.updateGridOptions({
        serverSideDatasource: datasource,
      });
    },
    [datasource],
  );

  // 🔔 NEW: Listen for refresh events targeted at this table
  useEffect(() => {
    if (!refreshTableName) return;
    const unsubscribe = onTableRefresh(refreshTableName, () => {
      if (gridRef.current?.api) {
        gridRef.current.api.refreshServerSide({ purge: true });
      }
    });
    return unsubscribe;
  }, [refreshTableName]);

  // (Optional legacy) React to localStorage "shouldUpdateData" toggles in the same tab.
  useEffect(() => {
    const shouldUpdateData = localStorage.getItem("shouldUpdateData") === "1";
    if (shouldUpdateData && gridRef.current?.api) {
      gridRef.current.api.refreshServerSide({ purge: true });
      setTimeout(() => localStorage.setItem("shouldUpdateData", "0"), 1);
    }
  }, [data]);

  // Flatten nested ColGroup defs if present (kept from your original)
  let cols = columns;
  if ((columns[0] as ColGroupDef)?.children) {
    cols = (columns[0] as ColGroupDef<T>).children as Columns<T>;
    if ((cols[0] as ColGroupDef)?.children) {
      cols = (cols[0] as ColGroupDef<T>).children as Columns<T>;
    }
  }

  // Cleanup grid instance on unmount
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      gridRef.current?.api?.destroy?.();
    };
  }, []);

  // Determine ag-grid theme class based on layout mode
  const gridThemeClass =
    layoutModeType === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine";

  return (
    <div className={gridThemeClass} style={{ height: height ?? "65vh" }}>
      {exportExcel && (
        <div className="row">
          <div className="" style={{ marginInlineEnd: "auto" }}>
            <>
              <Button
                style={{ marginTop: "10px" }}
                onClick={() => {
                  const selectedRows =
                    gridRef.current?.api?.getSelectedRows?.() ?? [];
                  gridRef.current?.api?.exportDataAsExcel({
                    fileName: excelName ?? "Export.xlsx",
                    sheetName: "Sheet 1",
                    prependContent: [],
                    appendContent: footerRows,
                    onlySelected: selectedRows.length > 0, // Export only selected if any
                  });
                }}
                id="download"
              >
                <AiOutlineFileExcel fontSize={21} />
              </Button>
              <UncontrolledTooltip placement="top" target="download">
                Excel
              </UncontrolledTooltip>
            </>
          </div>
        </div>
      )}

      <AgGridReact
        key={isRtl ? "rtl" : "ltr"}
        ref={gridRef as any}
        rowStyle={myAgGridRowStyle}
        columnDefs={columns}
        defaultColDef={defaultColDef}
        animateRows={true}
        rowSelection="multiple"
        domLayout={"normal"}
        headerHeight={35}
        enableRtl={isRtl}
        onSelectionChanged={(e) => {
          if (onSelection) onSelection(e.api.getSelectedRows() as T[]);
        }}
        pagination={true}
        rowModelType="serverSide"
        paginationPageSize={pageSize}
        cacheBlockSize={pageSize}
        getRowId={({ data }) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          data?.id?.toString?.() ?? Math.random().toString()
        }
        suppressAggFuncInHeader={true}
        onGridReady={onGridReady}
        {...props}
      />
    </div>
  );
};

export default AppDataTableWithServerSidePagination;
