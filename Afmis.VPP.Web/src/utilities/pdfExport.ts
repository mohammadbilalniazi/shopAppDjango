// src/utils/pdfExport.ts
import jsPDF from "jspdf";
import autoTable, { RowInput, Styles } from "jspdf-autotable";
import fontUrl from "../assets/styles/fonts/NotoNaskhArabic-Regular.ttf";

// cache the base64 once, but ALWAYS attach to each new doc
let cachedNaskhB64: string | null = null;

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  let bin = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

export async function ensureNotoNaskh(doc: jsPDF) {
  if (!cachedNaskhB64) {
    const res = await fetch(fontUrl);
    if (!res.ok) throw new Error("Failed to load NotoNaskhArabic-Regular.ttf");
    cachedNaskhB64 = arrayBufferToBase64(await res.arrayBuffer());
  }
  // IMPORTANT: attach to THIS doc every time
  doc.addFileToVFS("NotoNaskhArabic-Regular.ttf", cachedNaskhB64);
  doc.addFont("NotoNaskhArabic-Regular.ttf", "NotoNaskhArabic", "normal");
  doc.setFont("NotoNaskhArabic", "normal");
}


// --- Bidi helpers ---
const RLE = "\u202B"; // Right-to-Left Embedding
const PDF = "\u202C"; // Pop Directional Formatting
const ALM = "\u061C"; // Arabic Letter Mark (stabilizes digits in RTL runs)

// Arabic ranges incl. Pashto/Dari letters and presentation forms
const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export function containsArabic(s: string) {
  return ARABIC_RE.test(s);
}

export function rtlWrap(s?: string) {
  if (!s) return "";
  const withDigits = s.replace(/\d+/g, (m) => `${ALM}${m}${ALM}`);
  return `${RLE}${withDigits}${PDF}`;
}

export type PdfExportOptions = {
  title?: string;
  headers: string[];          // column labels in UI order (NOT changed)
  rows: RowInput[];           // rows in the SAME order
  filename?: string;          // default: "table.pdf"
  isRtl?: boolean;            // default: false
  rightAlignCols?: number[];  // columns to right-align (UI order)
  startY?: number;            // default: 50
  bodyFontSize?: number;      // default: 9
  headFontSize?: number;      // default: 10
  orientation?: "portrait" | "landscape"; // default: "landscape"
  pageUnit?: "pt" | "mm" | "cm" | "in";   // default: "pt"
  pageFormat?: string | [number, number]; // default: "a4"
  addFooterPageXofY?: boolean;            // default: true
  wrapArabicInLtr?: boolean;              // default: true (wrap only strings that contain Arabic)
};

export async function exportTableToPdf({
  title,
  headers,
  rows,
  filename = "table.pdf",
  isRtl = false,
  rightAlignCols = [],
  startY = 50,
  bodyFontSize = 9,
  headFontSize = 10,
  orientation = "landscape",
  pageUnit = "pt",
  pageFormat = "a4",
  addFooterPageXofY = true,
  wrapArabicInLtr = true,
}: PdfExportOptions) {
  if (!rows?.length) return;
  const doc = new jsPDF({ orientation, unit: pageUnit, format: pageFormat, compress: true });
  await ensureNotoNaskh(doc);
  doc.setFont("NotoNaskhArabic", "normal");
  if (title) {
    doc.setFontSize(14);
    doc.text(title, 40, 32, { align: "left" });
  }

  // 3) Keep column order EXACTLY as provided
  const head = [
    isRtl
      ? headers.map(rtlWrap)
      : headers.map(h => (wrapArabicInLtr && containsArabic(h) ? rtlWrap(h) : h))
  ];
  const body = rows; // no reversing

  // 4) Column align overrides (indices in UI order)
  const columnStyles: Record<string, Partial<Styles>> = {};
  rightAlignCols.forEach((idx) => { columnStyles[String(idx)] = { halign: "right" }; });

  autoTable(doc, {
    head,
    body,
    startY,
    styles: {
      font: "NotoNaskhArabic",
      fontStyle: "normal",
      fontSize: bodyFontSize,
      cellPadding: 3,
      halign: isRtl ? "right" : "left",
      valign: "middle",
      textColor: 20,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: 20,
      font: "NotoNaskhArabic",
      fontStyle: "normal",
      fontSize: headFontSize,
      halign: "center",
    },
    columnStyles,
    theme: "grid",

    // 5) In LTR mode, fix any Arabic body/header cell by wrapping & right-aligning that cell only.
    didParseCell: (data) => {
      if (isRtl || !wrapArabicInLtr) return; // RTL already handled globally, or opted out
      const cell = data.cell;
      if (!cell) return;

      const original = cell.text;
      const texts = Array.isArray(original) ? original.map(x => String(x ?? "")) : [String(original ?? "")];
      if (!texts.some(containsArabic)) return;

      const wrapped = texts.map(rtlWrap);
      // set back respecting original type
      if (Array.isArray(original)) {
        cell.text = wrapped as unknown as string[];
      } else {
        cell.text = wrapped[0] as unknown as string[];
      }
      cell.styles.halign = "right";
    },

    didDrawPage: () => {
      if (!addFooterPageXofY) return;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const page = (doc as any).getCurrentPageInfo().pageNumber as number;
      const pages = doc.getNumberOfPages();
      doc.setFontSize(9);
      doc.text(
        `${page} / ${pages}`,
        doc.internal.pageSize.getWidth() - 40,
        doc.internal.pageSize.getHeight() - 16,
        { align: "right" }
      );
    },
  });

  doc.save(filename);
}



