import { useEffect } from "react";
import { FormGroup } from "reactstrap";
import { useFormikContext } from "formik";

import AppEditor from "../AppEditor";
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

const FormEditor: React.FC<Props> = ({
  name,
  label,
  initVal,
  ...otherProps
}) => {
  const { setFieldTouched, setFieldValue, values, errors, initialValues } =
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
      <AppEditor
        onBlur={() => setFieldTouched(name)}
        onChange={(_e, editor) => setFieldValue(name, editor.getData())}
        value={getValue(values[name])}
        name={name}
        label={label}
        {...otherProps}
      />
      {errors[name] && <ErrorMessage label={label} error={errors[name]} />}
    </FormGroup>
  );
};

export default FormEditor;
