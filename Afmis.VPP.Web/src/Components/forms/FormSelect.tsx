// FormSelect.tsx
import { useEffect } from "react";
import { useFormikContext } from "formik";
import { FormGroup } from "reactstrap";
import AppSelect from "../AppSelect";
import ErrorMessage from "./ErrorMessage";
import { FormikContext, ObjectAny } from "../../types/base";

type Props<T> = {
  name: string;
  label: string;
  valField?: string;
  getOptionLabel?: (option: T) => string;
  getOptionValue?: (option: T) => string | number | boolean;
  options?: T[] | null;
  initVal?: any;
  onChange?: (val: T | null) => void;
  disabled?: boolean;
  required?: boolean;
  isMulti?: boolean;
  /** Selected chips whose option[valField] is in this list will render in red */
  heighlightOptionsInSelection?: Array<string | number>;
  [key: string]: any;
};

const FormSelect = <T extends ObjectAny>({
  label,
  name,
  valField = "value",
  getOptionLabel,
  getOptionValue,
  options = [],
  onChange,
  initVal,
  required,
  isMulti,
  heighlightOptionsInSelection,
  ...otherProps
}: Props<T>) => {
  const {
    setFieldTouched,
    setFieldValue,
    values,
    errors,
    setFieldError,
    touched,
    initialValues,
  } = useFormikContext() as unknown as FormikContext;
  // console.error( errors);
  useEffect(() => {
    if (initVal !== undefined) {
      setFieldValue(name, initVal);
    }
  }, [initVal, name, setFieldValue]);

  // Ensure field exists (so Formik has a value) if initial value is defined
  useEffect(() => {
    if (initialValues && Object.prototype.hasOwnProperty.call(initialValues, name)) {
      setFieldValue(name, initialValues[name]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  // Basic required validation for multi-select
  useEffect(() => {
    if (!required) return;
    const v = values[name];
    if (isMulti && Array.isArray(v) && v.length === 0) {
      setFieldError(name, `${label} is required.`);
    } else if (!isMulti && (v === undefined || v === null || v === "")) {
      setFieldError(name, `${label} is required.`);
    }
  }, [label, name, required, setFieldError, values, isMulti]);

  return (
    <FormGroup className="mb-3">
      <AppSelect
        onBlur={() => setFieldTouched(name)}
        onChange={(val: any) => {
          if (Array.isArray(val)) {
            // map selected option objects to their identity (valField)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            const arr = (val as T[]).map((v) => (v )[valField]);
            setFieldValue(name, arr);
            if (onChange) onChange(val as unknown as T);
          } else {
            if (val) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              setFieldValue(name, val[valField]);
              if (onChange) onChange(val as T);
            } else {
              setFieldValue(name, isMulti ? [] : "");
              if (onChange) onChange(null);
            }
          }
        }}
        value={values[name] } // AppSelect maps to option objects internally
        invalid={Boolean(touched[name] && errors[name])}
        className={touched[name] && errors[name] ? "has-error" : undefined}
        label={label}
        valField={valField}
        getOptionValue={getOptionValue as any}
        getOptionLabel={getOptionLabel as any}
        options={options ? options : []}
        isMulti={isMulti}
        heighlightOptionsInSelection={heighlightOptionsInSelection}
        required={required}
        {...otherProps}
      />
      {touched[name] && errors[name] && (
        <ErrorMessage error={errors[name]} label={label} className="d-block" />
      )}
    </FormGroup>
  );
};

export default FormSelect;
