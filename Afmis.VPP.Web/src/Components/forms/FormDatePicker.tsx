import { useEffect } from "react";
import { useFormikContext } from "formik";
import { FormGroup } from "reactstrap";
import { DateObject } from "react-multi-date-picker";

import AppDatePicker from "../AppDatePicker";
import ErrorMessage from "./ErrorMessage";
import { formatDate } from "../../utilities/utilFuncs";
import { CalenderType, FormikContext } from "../../types/base";

type Props = {
  name: string;
  label: string;
  initVal?: string;
  calendar?: CalenderType;
  disabled?: boolean;
  required?: boolean;
  [key: string]: any;
};

const FormDatePicker: React.FC<Props> = ({
  name,
  label,
  initVal,
  calendar,
  ...otherProps
}) => {
  const {
    setFieldTouched,
    setFieldValue,
    values,
    errors,
    touched,
  } = useFormikContext() as unknown as FormikContext;

  useEffect(() => {
    if (!initVal) return;

    const formattedValue =
      calendar === "shamsi" ? initVal : formatDate(initVal);

    if (values[name] !== formattedValue) {
      setFieldValue(name, formattedValue);
    }
  }, [initVal, name, setFieldValue, values, calendar]);

  const pickerValue =
    calendar === "shamsi"
      ? ((values[name] as string | null) ?? "")
      : formatDate(values[name] as string | null);

  return (
    <FormGroup className="mb-3">
      <AppDatePicker
        onBlur={() => setFieldTouched(name)}
        onChange={(e: DateObject | null) => {
          if (!e) {
            setFieldValue(name, "");
            return;
          }

          setFieldValue(name, e.format("YYYY-MM-DD"));
        }}
        value={pickerValue}
        name={name}
        invalid={touched[name] && errors[name] ? true : false}
        label={label}
        calendar={calendar}
        {...otherProps}
      />

      {touched[name] && errors[name] && (
        <ErrorMessage label={label} error={errors[name]} />
      )}
    </FormGroup>
  );
};

export default FormDatePicker;