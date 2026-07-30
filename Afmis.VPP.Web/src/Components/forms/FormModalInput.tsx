import { useEffect } from "react";
import { FormikProps, useFormikContext } from "formik";
import { FormGroup } from "reactstrap";

import ErrorMessage from "./ErrorMessage";
import AppModalInput from "../AppModalInput";
import { getValueModalInput, isEmpty } from "../../utilities/utilFuncs";
import { FormikContext, ObjectAny } from "../../types/base";

type Props = {
  name: string;
  label: string;
  inputsConfig: (p: FormikProps<ObjectAny>) => ObjectAny[];
  checkBoxesConfig: (p: FormikProps<ObjectAny>) => ObjectAny[];
  inputField?: string;
  initialValues?: any;
  initVal?: any;
  showModal: boolean;
  toggleModal: () => void;
  validationSchema?: ObjectAny;
  disabled?: boolean;
  required?: boolean;
  [key: string]: any;
};

const FormModalInput: React.FC<Props> = ({
  name,
  label,
  checkBoxesConfig,
  inputsConfig,
  inputField = "",
  initialValues,
  showModal,
  toggleModal,
  initVal,
  validationSchema,
  ...otherProps
}) => {
  const {
    setFieldTouched,
    setFieldValue,
    values,
    errors,
    touched,
    initialValues: initValues,
  } = useFormikContext() as unknown as FormikContext;

  useEffect(() => {
    if (initVal) {
      setFieldValue(name, getValueModalInput(initVal));
    }
  }, [initVal, name, setFieldValue]);

  useEffect(() => {
    if (initValues[name] === undefined) {
      setFieldValue(name, getValueModalInput(initValues[name]));
    }
  }, [name, setFieldValue, initValues]);

  return (
    <FormGroup className="mb-3">
      <AppModalInput
        onBlur={() => setFieldTouched(name)}
        onSubmit={(obj) => setFieldValue(name, obj)}
        value={getValueModalInput(values[name])}
        inputField={inputField}
        name={name}
        invalid={touched[name] && errors[name] ? true : false}
        label={label}
        inputsConfig={inputsConfig}
        checkBoxesConfig={checkBoxesConfig}
        haveValue={!isEmpty(values[name] as ObjectAny)}
        onRemoveVal={() => setFieldValue(name, initValues[name])}
        initialValues={initialValues}
        showModal={showModal}
        toggleModal={toggleModal}
        validationSchema={validationSchema}
        {...otherProps}
      />
      {touched[name] && errors[name] && (
        <ErrorMessage label={label} error={errors[name]} />
      )}
    </FormGroup>
  );
};

export default FormModalInput;
