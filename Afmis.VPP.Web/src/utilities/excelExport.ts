import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import i18n from "../i18n";
import { ColDef, ColGroupDef } from "ag-grid-community";
import { agColumnsToPdfColumns,  NullsPos,  PdfColumn, SortByColumn, SortDir } from "./pdfHelper";
import { isRtlLanguage } from "./languageDirection";

export async function handleExportExcelGeneric<T>({
  title,
  columns,
  data,
  filename = "report.xlsx",
  numericCols = [],
  numericColsByField = [],
  sortByColumns = [],
  t,
}: {
  title: string;
  columns: Array<ColDef<T, any> | ColGroupDef<T>> | PdfColumn<T>[];
  data: T[];
  filename?: string;
  numericCols?: number[];
  numericColsByField?: (keyof T | string)[];
  sortByColumns?: SortByColumn<T>[];
  t?: (key: string) => string;
}) {
  if (!data?.length || !columns?.length) return;

  const isRtl = isRtlLanguage(i18n.language);

  const isPdfColumnArray = (arr: any[]): arr is PdfColumn<T>[] =>
    arr.length > 0 && "accessor" in arr[0];

  const pdfCols: PdfColumn<T>[] =
    Array.isArray(columns) && isPdfColumnArray(columns)
      ? columns 
      : agColumnsToPdfColumns(columns );

  // Map field → column index
  const fieldToIndex = new Map<string, number>();
  pdfCols.forEach((c, i) => {
    if (c.field) fieldToIndex.set(String(c.field), i);
  });

  const getAccessorByIndex = (idx: number) => (row: T) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    pdfCols[idx] ? pdfCols[idx].accessor(row) : undefined;

  const getAccessorForSpec = (spec: SortByColumn<T>) => {
    if (typeof spec === "number") return getAccessorByIndex(spec);
    if ("index" in spec) return getAccessorByIndex(spec.index);
    if ("field" in spec) {
      const idx = fieldToIndex.get(String(spec.field));
      return typeof idx === "number" ? getAccessorByIndex(idx) : null;
    }
    if ("accessor" in spec && typeof spec.accessor === "function") {
      return spec.accessor;
    }
    return null;
  };

  const normalize = (v: any): any => {
    if (v == null) return v;
    if (v instanceof Date) return v.getTime();
    if (typeof v === "number") return v;
    if (typeof v === "boolean") return v ? 1 : 0;
    return String(v).toLowerCase().trim();
  };

  const cmpOne = (
    a: any,
    b: any,
    dir: SortDir = "asc",
    nulls: NullsPos = "last"
  ): number => {
    const na = a == null,
      nb = b == null;

    if (na || nb) {
      if (na && nb) return 0;
      return na ? (nulls === "first" ? -1 : 1) : nulls === "first" ? 1 : -1;
    }

    const va = normalize(a);
    const vb = normalize(b);

    if (va < vb) return dir === "asc" ? -1 : 1;
    if (va > vb) return dir === "asc" ? 1 : -1;
    return 0;
  };

  const sortSpecs = (sortByColumns ?? [])
    .map((spec) => (typeof spec === "number" ? { index: spec } : spec))
    .map((spec) => ({
      accessor: getAccessorForSpec(spec as SortByColumn<T>),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      dir: (spec as any).dir ?? "asc",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      nulls: (spec as any).nulls ?? "last",
    }))
    .filter((s) => typeof s.accessor === "function");

  const sortedData = sortSpecs.length
    ? [...data].sort((a, b) => {
        for (const s of sortSpecs) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const r = cmpOne(s.accessor!(a), s.accessor!(b), s.dir, s.nulls);
          if (r !== 0) return r;
        }
        return 0;
      })
    : data;

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title);

  // Add headers
  const headers = pdfCols.map((c) => c.headerName);
  worksheet.addRow(headers);

  // Style header
  worksheet.getRow(1).font = { bold: true };

  // Add rows
  sortedData.forEach((row) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    worksheet.addRow(pdfCols.map((c) => c.accessor(row) ?? ""));
  });

  // Numeric columns alignment
  const numericFromFields = numericColsByField
    .map((f) => fieldToIndex.get(String(f)))
    .filter((i): i is number => typeof i === "number");

  const rightAlignCols = Array.from(
    new Set([...(numericCols ?? []), ...numericFromFields])
  );

  rightAlignCols.forEach((colIdx) => {
    worksheet.getColumn(colIdx + 1).alignment = { horizontal: "right" };
  });

  // Add sum row
  if (numericFromFields.length > 0) {
    const sumRow: any[] = pdfCols.map(() => "");

    numericFromFields.forEach((colIdx) => {
      const sum = sortedData.reduce((acc, row) => {
        const val = pdfCols[colIdx].accessor(row);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const num = typeof val === "number" ? val : parseFloat(val);
        return acc + (isNaN(num) ? 0 : num);
      }, 0);

      sumRow[colIdx] = `${sum} ${t ? t("Total") : "Total"}`;
    });

    worksheet.addRow(sumRow);
  }

  // Auto column width
  worksheet.columns.forEach((col) => {
    col.width = 20;
  });

  // RTL support
  if (isRtl) {
    worksheet.views = [{ rightToLeft: true }];
  }

  // Export file
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}
