// AppTransferList.tsx
import React from "react";
import DualListBox, { Option } from "react-dual-listbox";
import "react-dual-listbox/lib/react-dual-listbox.css";
import AppLabel from "./AppLabel";
import { t } from "i18next";

const normalizeForSearch = (s: unknown): string =>
  String(s ?? "")
    .replace(/ك/g, "ک")
    .replace(/ي/g, "ی")
    .replace(/ۀ|ە/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/أ|إ/g, "ا")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const matchesAllTokens = (haystack: string, query: string): boolean => {
  const h = normalizeForSearch(haystack);
  const q = normalizeForSearch(query);
  if (!q) return true;
  const tokens = q.split(" ");
  return tokens.every((tok) => h.includes(tok));
};

type Props = {
  id?: string;
  label?: string;
  value: string[];
  required?: boolean;
  options: Option<any>[];
  showLabel?: boolean;
  disabled?: boolean;
  disableDoubleClick?: boolean;
  /** IDs visible on AVAILABLE (left) list */
  visibleIdSet?: Set<string> | null;
  [key: string]: any;
};

const AppTransferList: React.FC<Props> = ({
  id,
  label,
  value,
  required,
  options,
  showLabel = false,
  disableDoubleClick = true,
  visibleIdSet = null,
  ...otherProps
}) => {
  const stopDblClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!disableDoubleClick) return;
    e.preventDefault();
    e.stopPropagation();
  };

  // De-dup options by value-label
  const uniqOptions = React.useMemo(() => {
    const seen = new Set<string>();
    const out: Option<any>[] = [];
    for (const opt of options ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const v = String((opt as any)?.value ?? "");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const l = String((opt as any)?.label ?? "");
      const k = `${v}-${l}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ ...opt, value: v, label: l });
    }
    return out;
  }, [options]);

  // Clamp selection to known values
  const selectedUnique = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const known = new Set(uniqOptions.map((o: any) => String(o?.value ?? "")));
    const out: string[] = [];
    const seen = new Set<string>();
    for (const raw of (value ?? []).map(String)) {
      if (!known.has(raw)) continue;
      if (seen.has(raw)) continue;
      seen.add(raw);
      out.push(raw);
    }
    return out;
  }, [value, uniqOptions]);

  // PRE-FILTER: show only visible IDs on the left, but ALWAYS keep selected items
  const filteredOptions = React.useMemo(() => {
    if (!visibleIdSet) return uniqOptions;
    const selectedSet = new Set(selectedUnique);
    return uniqOptions.filter((opt) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const id = String((opt as any)?.value ?? "");
      if (selectedSet.has(id)) return true; // keep right side visible
      return visibleIdSet.has(id); // restrict left side
    });
  }, [uniqOptions, visibleIdSet, selectedUnique]);

  return (
    <>
      {label && showLabel && <AppLabel id={id} label={label} required={required} />}
      <div onDoubleClickCapture={stopDblClick}>
        <DualListBox
          id={id}
          canFilter
          alignActions="top"
          filterPlaceholder={(t("Search")??"")+"..."}
          // Text search only (structural filtering already applied)
          filterCallback={(option: any, input: string) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const hay = option?.searchText ?? option?.label ?? option?.value ?? "";
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return matchesAllTokens(hay, input);
          }}
          options={filteredOptions}
          selected={selectedUnique}
          icons={{
              moveLeft: (
                <span
                  key="moveLeft"
                  style={{
                    backgroundColor: "#00235e",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span className="mdi mdi-chevron-left" />
                  {t("UnAssign")}
                </span>
              ),
              moveAllLeft: (
                <span
                  key="moveAllLeft"
                  style={{
                    backgroundColor: "#00235e",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span className="mdi mdi-chevron-double-left" />
                  Remove All
                </span>
              ),
              moveRight: (
                <span
                  key="moveRight"
                  style={{
                    backgroundColor: "#00235e",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {t("Assign")}
                  <span className="mdi mdi-chevron-right" />
                </span>
              ),
              moveAllRight: (
                <span
                  key="moveAllRight"
                  style={{
                    backgroundColor: "#00235e",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Add All
                  <span className="mdi mdi-chevron-double-right" />
                </span>
              ),
              moveDown: <span className="mdi mdi-chevron-down" key="moveDown" />,
              moveUp: <span className="mdi mdi-chevron-up" key="moveUp" />,
              moveTop: <span className="mdi mdi-chevron-double-up" key="moveTop" />,
              moveBottom: <span className="mdi mdi-chevron-double-down" key="moveBottom" />,
            }}
          {...otherProps}
        />
      </div>
    </>
  );
};

export default AppTransferList;
