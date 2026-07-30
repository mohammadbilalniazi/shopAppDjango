// AppSelect.tsx
import React from "react";
import Select, { components, SingleValue } from "react-select";
import CircularProgress from "@mui/material/CircularProgress";
import AppLabel from "./AppLabel";
import { ObjectAny } from "../types/base";
import { useSelector } from "react-redux";
import { getReactSelectStyles, getReactSelectTheme } from "../utilities/reactSelectStyles";
import { useTranslation } from "react-i18next";
import { isRtlLanguage } from "../utilities/languageDirection";

/** Map external value(s) to react-select option object(s) */
const getValue = (
  _val: ObjectAny[] | string | number | null | undefined,
  options: ObjectAny[],
  valField: string
) => {
  if (!options) return [];
  if (_val == null) return null;

  if (Array.isArray(_val)) {
    return _val
      .map((v) => {
        // If v is an option object, use it; if primitive, find by valField
        const needle = typeof v === "object" && v !== null ? (v as Record<string, unknown>)[valField] : v;
        return options.find((option) => option[valField] === needle) || null;
      })
      .filter(Boolean);
  }

  // primitive single value
  return options.find((option) => option[valField] === _val) || null;
};

// Custom IndicatorsContainer to show a loader without replacing default indicators
const IndicatorsContainer = (props: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const { isLoading } = props.selectProps;
  return (
    <components.IndicatorsContainer {...props}>
      {isLoading && <CircularProgress size={18} sx={{ mr: 1 }} />}
      {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      props.children
      }
    </components.IndicatorsContainer>
  );
};

type Props = {
  id?: string;
  label?: string;
  options: ObjectAny[];
  /** Can be a primitive (single) or array (multi) of valField values, or full option(s) */
  value: number | string | ObjectAny | (ObjectAny | null)[] | null;
  // eslint-disable-next-line no-unused-vars
  onChange: (val: SingleValue<ObjectAny> | readonly ObjectAny[] | null) => void;
  required?: boolean;
  /** The key used as the option's value identity (e.g., "id") */
  valField: string;
  disabled?: boolean;
  isClearable?: boolean;
  isLoading?: boolean;
  isMulti?: boolean;
  /** When multi-select, highlight selected chips whose value matches any in this list */
  heighlightOptionsInSelection?: Array<string | number>;
  [key: string]: any;
};

/** Build styles that color only the selected chips which match the highlight list */
const makeStyles = (valField: string, highlightList: Array<string | number>, isDarkMode: boolean) => {
  const isHit = (data: ObjectAny) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    Array.isArray(highlightList) && highlightList.includes(data?.[valField]);

  // Get base theme-aware styles
  const baseStyles = getReactSelectStyles<ObjectAny>(isDarkMode);

  return {
    ...baseStyles,
    multiValue: (base: any, state: any) => {
      // Start with base styles
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const baseResult = baseStyles.multiValue ? baseStyles.multiValue(base, state) : base;
      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      if (!isHit(state.data)) return baseResult;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return {
        ...baseResult,
        backgroundColor: "rgba(220, 53, 69, 0.12)", // soft red tint
        border: "1px solid #dc3545",
      };
    },
    multiValueLabel: (base: any, state: any) => {
      // Start with base styles
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const baseResult = baseStyles.multiValueLabel ? baseStyles.multiValueLabel(base, state) : base;
      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return {
        ...baseResult,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        ...(isHit(state.data)
          ? { color: "#dc3545", fontWeight: 600 }
          : null),
      };
    },
    multiValueRemove: (base: any, state: any) => {
      // Start with base styles
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const baseResult = baseStyles.multiValueRemove ? baseStyles.multiValueRemove(base, state) : base;
      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      if (!isHit(state.data)) return baseResult;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return {
        ...baseResult,
        color: "#dc3545",
        ":hover": {
          backgroundColor: "#dc3545",
          color: "white",
        },
      };
    },
  } as const;
};

interface LayoutState {
  Layout?: {
    layoutModeType?: string;
  };
}

const AppSelect: React.FC<Props> = ({
  id,
  label,
  options = [],
  onChange,
  value,
  required,
  valField,
  disabled,
  isClearable = true,
  isLoading = false,
  isMulti=false,
  heighlightOptionsInSelection = [],
  ...othersProps
}) => {
  // Get current theme mode from Redux store
  const layoutModeType = useSelector((state: LayoutState) => state.Layout?.layoutModeType);
  const { i18n } = useTranslation();
  const isDarkMode = layoutModeType === "dark";
  const isRtl = isRtlLanguage(i18n.language);
  
  const styles = makeStyles(valField, heighlightOptionsInSelection, isDarkMode);
  const theme = getReactSelectTheme(isDarkMode);

  return (
    <>
      {label && <AppLabel id={id} label={label} required={required} />}

      <Select
        inputId={id}
        isMulti={isMulti as any}
        isClearable={isClearable}
        onChange={onChange as any}
        options={options}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        value={getValue(value as any, options, valField)}
        isDisabled={disabled}
        isLoading={isLoading}
        classNamePrefix="afmis"
        isRtl={isRtl}
        theme={theme}
        components={{ IndicatorsContainer }}
        styles={styles}
        {...othersProps}
      />
    </>
  );
};

export default AppSelect;
