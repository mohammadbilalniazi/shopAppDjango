import { useEffect, ChangeEvent } from "react";
import { useFormikContext } from "formik";

import { FormGroup } from "reactstrap";
import AppTextArea from "../AppTextArea";
import ErrorMessage from "./ErrorMessage";
import { getValue } from "../../utilities/utilFuncs";
import { FormikContext } from "../../types/base";

type Props = {
  name: string;
  label: string;
  initVal?: string;
  disabled?: boolean;
  required?: boolean;
  [key: string]: any;
};

const FormTextArea: React.FC<Props> = ({
  name,
  label,
  initVal,
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
      <AppTextArea
        onBlur={() => setFieldTouched(name)}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setFieldValue(name, e.target.value)
        }
        value={getValue(values[name])}
        name={name}
        label={label}
        invalid={touched[name] && errors[name] ? true : false}
        {...otherProps}
      />
      {touched[name] && errors[name] && (
        <ErrorMessage label={label} error={errors[name]} className="d-block" />
      )}
    </FormGroup>
  );
};

export default FormTextArea;
