// src/utilities/agGridTotals.ts

// src/utilities/agGridTotals.ts

export type TotalsRowOptions<T> = {
  data: T[] | null | undefined;
  numericFields: (keyof T | string)[];
  labelField?: keyof T;
  labelText?: string;
  clearOtherFields?: boolean; // default true
};

function toNumeric(value: unknown): number {
  if (value == null) return 0;

  if (typeof value === "number") {
    return Number.isNaN(value) ? 0 : value;
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  // Strip everything except digits, minus sign and dot
  const cleaned = String(value).replace(/[^\d.-]/g, "");
  const num = Number(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

export function buildPinnedBottomTotalsRow<T extends Record<string, any>>(
  options: TotalsRowOptions<T>
): T[] {
  const {
    data,
    numericFields,
    labelField,
    labelText,
    clearOtherFields = true,
  } = options;

  if (!data || data.length === 0) return [];

  const totalRow: Partial<T> = {};

  // Precompute numeric fields as strings
  const numericFieldNames = new Set<string>(
    (numericFields ?? []).map((f) => String(f))
  );
  const labelFieldName = labelField ? String(labelField) : null;

  // 1) sum numeric fields
  numericFields.forEach((fieldName) => {
    const key = fieldName as keyof T;

    const sum = data.reduce((acc, cur) => {
      const v = cur[key];
      const n = toNumeric(v);
      return acc + n;
    }, 0);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (totalRow as any)[key] = sum;
  });

  // 2) label column (e.g. "Total") – only if it's NOT a numeric field
  if (
    labelField &&
    typeof labelText !== "undefined" &&
    (!labelFieldName || !numericFieldNames.has(labelFieldName))
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (totalRow as any)[labelField] = labelText;
  }

  // 3) clear other fields so ag-grid doesn’t show junk in non-numeric cells
  if (clearOtherFields && data.length > 0) {
    const sample = data[0];

    Object.keys(sample).forEach((field) => {
      const isNumeric = numericFieldNames.has(field);
      const isLabel = labelFieldName === field;

      if (!isNumeric && !isLabel) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (totalRow as any)[field] = "";
      }
    });
  }

  return [totalRow as T];
}

// Optional common style for totals row
export const pinnedTotalRowStyle = (params: any) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  params.node.rowPinned === "bottom"
    ? { fontWeight: "bold", backgroundColor: "#f5f5f5", fontSize: "14px" }
    : undefined;
