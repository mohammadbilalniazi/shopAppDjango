import { ApiResponse } from "apisauce";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ColGroupDef, ExcelRow } from "ag-grid-enterprise";
import {
  GridReadyEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams,
} from "ag-grid-community";
import "ag-grid-enterprise";
import Click from "./Click";
import { transformObjectForSearch } from "../../utilities/utilFuncs";
import { Columns, ObjectAny } from "../../types/base";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { AfmisResponse, PageInfo } from "../../types/store/shared";
import { Button, UncontrolledTooltip } from "reactstrap";
import { AiOutlineFileExcel } from "react-icons/ai";
import { AgGridReact } from "ag-grid-react";
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
  ...props
}: Props<T>) => {
  const dispatch = useAppDispatch();
  const { pageSize: globalPageSize } = useAppSelector((state) => state.global);
  const layoutModeType = useAppSelector((state) => state.Layout.layoutModeType);
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";
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
      headerClass: isRtl ? "ag-right-aligned-header" : undefined,
      enableCellChangeFlash: true,
    }),
    [cellRendererParams, isRtl],
  );
  const myAgGridRowStyle = {
    textAlign: "start",
    fontWeight: "bold",
  };
  const gridRef = useRef<AgGridReact | null>(null);
  const isFetching = useRef(false);
  const getRows = useCallback(
    (params: IServerSideGetRowsParams<any, any>) => {
      if (isFetching.current) {
        return;
      }
      isFetching.current = true; // Set fetching state to true
      const startRow = params.request.startRow ?? 0; // Handle undefined startRow
      const sortModel = params.request.sortModel;
      const pageNumber = startRow / pageSize + 1;

      if (
        pageNumber === 1 &&
        data &&
        data.length > 0 &&
        sortModel.length === 0 &&
        !state?.fromDetail
      ) {
        params.success({
          rowData: data,
          rowCount: pageInfo?.totalRecords as number,
        });
        isFetching.current = false; // Reset fetching state
        return;
      }

      let formData_ = formData;
      if (transForm) {
        formData_ = transForm();
      }

      let data_: ObjectAny;
      if (isTransformObjectForSearch) {
        data_ = transformObjectForSearch(formData_);
      } else {
        data_ = formData_;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      dispatch(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        action({
          data: data_,
          params: { pageNumber, pageSize, ...customParams },
        }),
      )
        .then((res: ApiResponse<AfmisResponse<T[]>>) => {
          if (res?.ok && res.data) {
            params.success({
              rowData: res.data.data,
              rowCount: res.data.pagedInfo.totalRecords,
            });
          }
        })
        .catch(() => {
          params.fail();
        })
        .finally(() => {
          isFetching.current = false; // Reset fetching state after completion
        });
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
      action,
      customParams,
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
      // Assign datasource on initial grid ready
      params.api.updateGridOptions({
        serverSideDatasource: datasource,
      });
    },
    [datasource],
  );
  useEffect(() => {
    const shouldUpdateData = localStorage.getItem("shouldUpdateData") === "1";
    if (shouldUpdateData && gridRef.current?.api) {
      gridRef.current.api.refreshServerSide({ purge: false });
      localStorage.removeItem("shouldUpdateData"); // reset shouldUpdateData after refreshing
    }
  }, [data]);

  let cols = columns;
  if ((columns[0] as ColGroupDef)?.children) {
    cols = (columns[0] as ColGroupDef<T>).children as Columns<T>;
    if ((cols[0] as ColGroupDef)?.children) {
      cols = (cols[0] as ColGroupDef<T>).children as Columns<T>;
    }
  }

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      gridRef.current?.api?.destroy();
    };
  }, []);

  // Determine ag-grid theme class based on layout mode
  const gridThemeClass =
    layoutModeType === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine";

  return (
    <div className={gridThemeClass} style={{ height: height ?? "" }}>
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
                    onlySelected: selectedRows.length > 0, // 👈 Export only selected if any
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
        ref={gridRef}
        rowStyle={myAgGridRowStyle}
        columnDefs={columns}
        defaultColDef={defaultColDef}
        animateRows={true}
        rowSelection="multiple"
        domLayout={height ? "normal" : "autoHeight"}
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
          data?.id?.toString() ?? Math.random().toString()
        }
        suppressAggFuncInHeader={true}
        onGridReady={onGridReady}
        {...props}
      />
    </div>
  );
};

export default AppDataTableWithServerSidePagination;
