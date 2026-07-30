import { useFormikContext } from "formik";

import { FormGroup } from "reactstrap";
import AppInputMask from "../AppInputMask";
import ErrorMessage from "./ErrorMessage";
import { getValue } from "../../utilities/utilFuncs";
import { useEffect } from "react";
import { FormikContext } from "../../types/base";
import { ChangeEvent } from "cleave.js/react/props";
import { CleaveOptions } from "cleave.js/options";

type Props = {
  name: string;
  label: string;
  initVal?: any;
  options: CleaveOptions;
  disabled?: boolean;
  required?: boolean;
  [key: string]: any;
};

const FormInputMask: React.FC<Props> = ({
  name,
  label,
  initVal,
  options,
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
    if (initVal) {
      setFieldValue(name, getValue(initVal));
    }
  }, [initVal, name, setFieldValue]);

  useEffect(() => {
    if (initialValues[name] === undefined || initialValues[name] === null) {
      setFieldValue(name, getValue(initialValues[name]));
    }
  }, [name, setFieldValue, initialValues]);

  return (
    <FormGroup className="mb-3">
      <AppInputMask
        options={options}
        onBlur={() => setFieldTouched(name)}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setFieldValue(name, e.target.rawValue)
        }
        value={getValue(values[name])}
        name={name}
        label={label}
        invalid={touched[name] && errors[name] ? true : false}
        {...otherProps}
      />
      {touched[name] && errors[name] && (
        <ErrorMessage label={label} error={errors[name]} />
      )}
    </FormGroup>
  );
};

export default FormInputMask;
