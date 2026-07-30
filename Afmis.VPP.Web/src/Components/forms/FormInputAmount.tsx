import { useEffect } from "react";
import { useFormikContext } from "formik";
import { FormGroup } from "reactstrap";

import AppInputMask from "../AppInputMask";
import ErrorMessage from "./ErrorMessage";
import {
  convertToTwoDecimalPlaces,
  getValueAmount,
  parseFloatCustom,
} from "../../utilities/utilFuncs";
import { FormikContext } from "../../types/base";
import { ChangeEvent } from "cleave.js/react/props";

type Props = {
  name: string;
  label: string;
  initVal?: any;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: number) => void;
  [key: string]: any;
};

const FormInputAmount: React.FC<Props> = ({
  name,
  label,
  initVal,
  disabled,
  onChange,
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
      setFieldValue(name, getValueAmount(initVal));
    }
  }, [initVal, name, setFieldValue]);

  useEffect(() => {
    if (initialValues[name] === undefined || initialValues[name] === null) {
      setFieldValue(name, getValueAmount(initialValues[name]));
    }
  }, [name, setFieldValue, initialValues]);

  return (
    <FormGroup className="mb-3">
      <AppInputMask
        onBlur={(e: ChangeEvent<HTMLInputElement>) => {
          setFieldTouched(name);
          if (e.target.rawValue === "" || e.target.rawValue === "0.00") {
            setFieldValue(name, 0);
          }
        }}
        onChange={(e) => {
          setFieldValue(name, parseFloatCustom(e.target.rawValue));
          if (onChange) {
            onChange(+e.target.rawValue);
          }
        }}
        style={{
          fontFamily: "verdana, arial, sans-serif",
          letterSpacing: "0.7px",
        }}
        onFocus={(e: ChangeEvent<HTMLInputElement>) => e.target.select()}
        value={
          values[name] && !disabled
            ? values[name]
            : convertToTwoDecimalPlaces(values[name] as number | null | string)
        }
        name={name}
        label={label}
        disabled={disabled}
        invalid={touched[name] && errors[name] ? true : false}
        options={{
          numeral: true,
          numeralThousandsGroupStyle: "thousand",
          numeralDecimalScale: 2,
        }}
        {...otherProps}
      />
      {touched[name] && errors[name] && (
        <ErrorMessage label={label} error={errors[name]} />
      )}
    </FormGroup>
  );
};

export default FormInputAmount;
