import { useFormikContext } from "formik";
import { useEffect } from "react";
import { FormGroup } from "reactstrap";

import AppFile from "../AppFile";
import ErrorMessage from "./ErrorMessage";
import { getValue } from "../../utilities/utilFuncs";
import { FormikContext } from "../../types/base";

type Props = {
  name: string;
  label: string;
  initVal?: any;
  disabled?: boolean;
  required?: boolean;
  [key: string]: any;
};

const FormFile: React.FC<Props> = ({ name, label, initVal, ...otherProps }) => {
  const { setFieldValue, values, errors, initialValues } =
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
      <AppFile
        onChange={(e) => setFieldValue(name, e)}
        value={values[name]}
        name={getValue(name)}
        invalid={errors[name] ? true : false}
        label={label}
        {...otherProps}
      />
      {errors[name] && <ErrorMessage label={label} error={errors[name]} />}
    </FormGroup>
  );
};

export default FormFile;
