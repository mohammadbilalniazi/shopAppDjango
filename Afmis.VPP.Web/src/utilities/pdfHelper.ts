// src/utilities/pdfExport.ts
import jsPDF from "jspdf";
import i18n from "../i18n";
// Prefer community types unless you're actually using enterprise-only defs
import { ColDef, ColGroupDef } from "ag-grid-community";
import { RowInput } from "jspdf-autotable";
import { exportTableToPdf } from "./pdfExport";

// Optional: if you still need direct font embedding elsewhere, keep it here.
// Otherwise rely on pdfExport's internal font loader.
import fontUrl from "../assets/styles/fonts/NotoNaskhArabic-Regular.ttf";
import { arrayBufferToBase64 } from "./pdfExport";
import { isRtlLanguage } from "./languageDirection";

export async function embedNotoNaskhArabic(doc: jsPDF): Promise<void> {
  const res = await fetch(fontUrl);
  if (!res.ok) throw new Error("Failed to load NotoNaskhArabic-Regular.ttf");
  const base64 = arrayBufferToBase64(await res.arrayBuffer());
  doc.addFileToVFS("NotoNaskhArabic-Regular.ttf", base64);
  doc.addFont("NotoNaskhArabic-Regular.ttf", "NotoNaskhArabic", "normal");
  doc.setFont("NotoNaskhArabic", "normal");
}

export type PdfColumn<T> = {
  headerName: string;
  accessor: (row: T) => any;
  /** Optional field name (helps index mapping for numericColsByField) */
  field?: keyof T | string;
};

/** Type guard: is this already a PdfColumn[]? */
function isPdfColumnArray<T>(
  cols: Array<ColDef<T, any> | ColGroupDef<T>> | PdfColumn<T>[]
): cols is PdfColumn<T>[] {
  return Array.isArray(cols) && cols.length > 0 && "accessor" in (cols[0] as any);
}

/** Flatten groups and convert Ag-Grid column defs to PdfColumns. Order is preserved. */
export function agColumnsToPdfColumns<T>(
  cols: Array<ColDef<T, any> | ColGroupDef<T>>
): PdfColumn<T>[] {
  const out: PdfColumn<T>[] = [];

  const visit = (c: ColDef<T, any> | ColGroupDef<T>) => {
    if ((c as ColGroupDef<T>).children) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      (c as ColGroupDef<T>).children.forEach((child) => visit(child as any));
      return;
    }
    const col = c as ColDef<T, any>;

    let header =
      (col.headerName ) ??
      (typeof col.field === "string" ? col.field : "") ??
      "";

    if (!header || header.trim() === "") header = `Col ${out.length + 1}`;

    const field: keyof T | string | undefined = (col.field as any) ?? undefined;

    const accessor: (row: T) => any = (row: T) => {
      if (typeof col.valueGetter === "function") {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
          return (col.valueGetter as any)({ data: row });
        } catch {
          /* ignore */
        }
      }
      if (field) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        return (row as any)?.[field as string];
      }
      return "";
    };

    out.push({ headerName: header, accessor, field });
  };

  cols.forEach((c) => visit(c));
  return out;
}
// Add near your other types
export type SortDir = "asc" | "desc";
export type NullsPos = "first" | "last";

export type SortByColumn<T> =
  | number // column index in the flattened pdfCols order
  | {
      index: number;          // by column index
      dir?: SortDir;
      nulls?: NullsPos;
    }
  | {
      field: keyof T | string; // by field name (mapped to index)
      dir?: SortDir;
      nulls?: NullsPos;
    }
  | {
      accessor: (row: T) => any; // custom value extractor
      dir?: SortDir;
      nulls?: NullsPos;
    };
export async function handleExportPdfGeneric<T>({
  title,
  columns,
  data,
  filename = "report.pdf",
  /** Columns to right-align by LTR index (UI order). */
  numericCols = [],
  /** Optional: columns to right-align by field name (mapped to index after flattening) */
  numericColsByField = [],
  sortByColumns = [],  

  t,
}: {
  title: string;
  columns: Array<ColDef<T, any> | ColGroupDef<T>> | PdfColumn<T>[];
  data: T[];
  filename?: string;
  numericCols?: number[];
  sortByColumns?: SortByColumn<T>[]; // ⬅️ NEW,
  numericColsByField?: (keyof T | string)[];
  t?: (key: string) => string;
}) {
  if (!data?.length || !columns?.length) return;

  const isRtl = isRtlLanguage(i18n.language);
  const pdfCols: PdfColumn<T>[] = isPdfColumnArray(columns)
    ? (columns)
    : agColumnsToPdfColumns(columns);

  // Build a map for field -> index (used by numeric & sort mapping)
  const fieldToIndex = new Map<string, number>();
  pdfCols.forEach((c, i) => { if (c.field) fieldToIndex.set(String(c.field), i); });

  const getAccessorByIndex = (idx: number) => (row: T) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    pdfCols[idx] ? pdfCols[idx].accessor(row) : undefined;
  
  const getAccessorForSpec = (spec: SortByColumn<T>): ((row: T) => any) | null => {
    if (typeof spec === "number") return getAccessorByIndex(spec);
    if ("index" in spec) return getAccessorByIndex(spec.index);
    if ("field" in spec) {
      const idx = fieldToIndex.get(String(spec.field));
      return typeof idx === "number" ? getAccessorByIndex(idx) : null;
    }
    if ("accessor" in spec && typeof spec.accessor === "function") return spec.accessor;
    return null;
  };

  const normalize = (v: any): any => {
    if (v == null) return v;
    if (v instanceof Date) return v.getTime();
    const t = typeof v;
    if (t === "number") return v;
    if (t === "boolean") return v ? 1 : 0;
    // try valueOf for things like BigInt-like or moment-like objects
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if (v && typeof v.valueOf === "function" && v !== v.valueOf()) return v.valueOf();
    return String(v).toLowerCase().trim();
  };

  const cmpOne = (a: any, b: any, dir: SortDir = "asc", nulls: NullsPos = "last"): number => {
    const na = a == null, nb = b == null;
    if (na || nb) {
      if (na && nb) return 0;
      return (na ? (nulls === "first" ? -1 : 1) : (nulls === "first" ? 1 : -1));
    }
    const va = normalize(a), vb = normalize(b);
    if (va < vb) return dir === "asc" ? -1 : 1;
    if (va > vb) return dir === "asc" ? 1 : -1;
    return 0;
  };

  const sortSpecs = (sortByColumns ?? [])
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    .map(spec => (typeof spec === "number" ? { index: spec as number } : spec))
    .map(spec => ({
      accessor: getAccessorForSpec(spec as SortByColumn<T>),
      dir: (typeof spec === "object" && "dir" in spec && spec.dir) ? spec.dir : "asc",
      nulls: (typeof spec === "object" && "nulls" in spec && spec.nulls) ? spec.nulls : "last",
    }))
    .filter(s => typeof s.accessor === "function");

  const sortedData = sortSpecs.length
    ? [...data].sort((ra, rb) => {
        for (const s of sortSpecs) {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          const r = cmpOne(s.accessor!(ra), s.accessor!(rb), s.dir as SortDir, s.nulls as NullsPos);
          if (r !== 0) return r;
        }
        return 0;
      })
    : data;

  // Now build headers & rows in EXACT same order
  const headers = pdfCols.map((c) => c.headerName);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const rows: RowInput[] = sortedData.map((row) => pdfCols.map((c) => c.accessor(row) ?? ""));
  const numericFromFields = numericColsByField
    .map((f) => fieldToIndex.get(String(f)))
    .filter((i): i is number => typeof i === "number");

  const rightAlignCols = Array.from(new Set([...(numericCols ?? []), ...numericFromFields]));
  // add row for numericFromFields sum if any
  if(numericColsByField.length > 0) {
    const sumRow: any[] = pdfCols.map(() => "");
    numericFromFields.forEach((colIdx) => {
      const sum = sortedData.reduce((acc, row) => {
        const val = pdfCols[colIdx].accessor(row);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const num = typeof val === "number" ? val : parseFloat(val);
        return acc + (isNaN(num) ? 0 : num);
      }, 0);
      // add , from right on every 3 =>  1,000  10,000,000  3300500.65   3,300,500.65  
        const sumStr=new Intl.NumberFormat('en-Us',{
          minimumFractionDigits:0,
          maximumFractionDigits:2
        }).format(sum); 
      sumRow[colIdx] = `${sumStr} ${t ? t("Total") : "Total"}`;
    });
    rows.push(sumRow);
  }
  await exportTableToPdf({
    title: t ? t(title) : title,
    headers,
    rows,
    filename,
    isRtl,              // RTL: headers wrapped & right aligned globally (in pdfExport)
    rightAlignCols,     // LTR/RTL numeric alignment handled in pdfExport
  });
}
