import { useFormikContext } from "formik";

import AppInput from "../AppInput";
import { FormGroup } from "reactstrap";
import ErrorMessage from "./ErrorMessage";
import { getValue } from "../../utilities/utilFuncs";
import { InputHTMLAttributes, useEffect } from "react";
import { FormikContext } from "../../types/base";
import { InputType } from "reactstrap/types/lib/Input";

type Props = {
  name: string;
  type?: InputType;
  label: string;
  onChange?: (val: any) => void;
  initVal?: any;
} & InputHTMLAttributes<HTMLInputElement>;

const FormInput: React.FC<Props> = ({
  name,
  type,
  label,
  onChange,
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
      try{
        setFieldValue(name, getValue(initialValues[name]));
      }
      catch(e){
        console.error("error FormInput ",e);
      }
    }
  }, [name, setFieldValue, initialValues]);

  return (
    <FormGroup className="mb-3">
      <AppInput
        onBlur={() => setFieldTouched(name)}
        onChange={(e) => {
          // if the input is controlled from outside
          if (onChange) {
            onChange(e.target.value);
          }
          if (type === "number" && e.target.value !== "") {
            setFieldValue(name, +e.target.value);
            return;
          }
          setFieldValue(name, e.target.value);
        }}
        value={getValue(values[name])}
        name={name}
        invalid={touched[name] && errors[name] ? true : false}
        type={type}
        label={label}
        {...otherProps}
      />
      {touched[name] && errors[name] && (
        <ErrorMessage label={label} error={errors[name]} />
      )}
    </FormGroup>
  );
};

export default FormInput;
