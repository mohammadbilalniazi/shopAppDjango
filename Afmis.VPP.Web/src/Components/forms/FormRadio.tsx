import { useFormikContext } from "formik";
import { FormGroup } from "reactstrap";

import AppRadio from "../AppRadio";
import ErrorMessage from "./ErrorMessage";
import { getValue } from "../../utilities/utilFuncs";
import { useEffect } from "react";
import { FormikContext } from "../../types/base";

type Props = {
  name: string;
  label: string;
  initVal?: any;
  options: { title: string; value: string }[];
  disabled?: boolean;
  required?: boolean;
  [key: string]: any;
};

const FormRadio: React.FC<Props> = ({
  name,
  label,
  initVal,
  options,
  ...otherProps
}) => {
  const { setFieldValue, values, errors, touched, initialValues } =
    useFormikContext() as unknown as FormikContext;

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
      <AppRadio
        options={options}
        onChange={(value) => setFieldValue(name, value)}
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

export default FormRadio;
