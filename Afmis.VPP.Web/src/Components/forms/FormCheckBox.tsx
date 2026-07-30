import { InputHTMLAttributes, useEffect } from "react";
import { FormGroup } from "reactstrap";
import { useFormikContext } from "formik";

import AppCheckBox from "../AppCheckBox";
import ErrorMessage from "./ErrorMessage";
import { getValue, getValueCheckBox } from "../../utilities/utilFuncs";
import { FormikContext } from "../../types/base";

type Props = {
  name: string;
  label: string;
  onChange?: (val: string | boolean) => void;
  triState?: boolean;
  required?: boolean;
  tooltip?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const FormCheckBox: React.FC<Props> = ({
  name,
  label,
  onChange,
  triState = false,
  tooltip,
  ...otherProps
}) => {
  const {
    setFieldTouched,
    setFieldValue,
    values,
    errors,
    touched,
    initialValues,
  } = useFormikContext() as unknown as FormikContext;
  useEffect(() => {
    if (initialValues[name] === undefined || initialValues[name] === null) {
      setFieldValue(
        name,
        triState
          ? getValue(initialValues[name])
          : getValueCheckBox(initialValues[name])
      );
    }
  }, [name, setFieldValue, initialValues, triState]);

  return (
    <FormGroup
      style={{ height: "100%", display: "flex", alignItems: "center" }}
    >
      <AppCheckBox
        onBlur={() => setFieldTouched(name)}
        onChange={(val) => {
          setFieldValue(name, val);
          // if the input is controlled from the outside
          if (onChange) onChange(val);
        }}
        value={
          triState ? getValue(values[name]) : getValueCheckBox(values[name])
        }
        name={name}
        label={label} 
        triState={triState}
        tooltip={tooltip}
        {...otherProps} 
      />
      {touched[name] && errors[name] && (
        <ErrorMessage label={label} error={errors[name]} />
      )}
    </FormGroup>
  );
};

export default FormCheckBox;
