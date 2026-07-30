import { Suspense, lazy } from "react";
import { Button } from "reactstrap";
import { IoAddOutline } from "react-icons/io5";
import { IoRemoveOutline } from "react-icons/io5";
import { AiOutlineEdit } from "react-icons/ai";

import AppLabel from "../AppLabel";
import AppInput from "../AppInput";
import TopBar from "../TopBar";
import { isEmpty } from "../../utilities/utilFuncs";
import { ObjectAny } from "../../types/base";
import { InputType } from "reactstrap/types/lib/Input";
import { FormikProps } from "formik";

const InputModal = lazy(() => import("./InputModal"));

type Props = {
  id?: string;
  label: string;
  required?: boolean;
  type?: InputType;
  value: ObjectAny;
  inputField: string;
  inputsConfig: (p: FormikProps<ObjectAny>) => ObjectAny[];
  checkBoxesConfig: (p: FormikProps<ObjectAny>) => ObjectAny[];
  onSubmit: (val: ObjectAny) => void;
  haveValue: boolean;
  onRemoveVal: () => void;
  invalid?: boolean;
  initialValues: ObjectAny;
  toggleModal: () => void;
  showModal: boolean;
  validationSchema?: ObjectAny;
  [key: string]: any;
};

const AppModalInput: React.FC<Props> = ({
  id,
  label,
  required,
  type = "text",
  value,
  inputField,
  inputsConfig,
  checkBoxesConfig,
  onSubmit,
  haveValue,
  onRemoveVal,
  invalid,
  initialValues,
  showModal,
  toggleModal,
  validationSchema,
  ...otherProps
}) => {
  return (
    <>
      {label && <AppLabel id={id} label={label} required={required} />}
      <div className="d-flex">
        <AppInput
          disabled={true}
          id={id}
          type={type}
          value={isEmpty(value) ? "" : value[inputField]}
          style={{ marginInlineEnd: 8 }}
          invalid={invalid as boolean}
        />
        {/* if value object is empty*/}
        {!haveValue ? (
          <Button style={{ padding: "0px 4px" }} onClick={toggleModal}>
            <IoAddOutline size={25} />
          </Button>
        ) : (
          <>
            <Button
              style={{ padding: "0px 4px", marginInlineEnd: 8 }}
              onClick={toggleModal}
            >
              <AiOutlineEdit fontSize={25} color="" />
            </Button>
            <Button
              style={{ padding: "0px 4px" }}
              onClick={onRemoveVal}
              color="danger"
            >
              <IoRemoveOutline fontSize={25} />
            </Button>
          </>
        )}
      </div>
      <Suspense fallback={<TopBar />}>
        <InputModal
          validationSchema={validationSchema}
          showModal={showModal}
          toggleModal={toggleModal}
          label={label}
          checkBoxesConfig={checkBoxesConfig}
          inputsConfig={inputsConfig}
          initialValues={isEmpty(value) ? initialValues : value}
          onSubmit={(val: ObjectAny) => {
            onSubmit(val);
            toggleModal();
          }}
          {...otherProps}
        />
      </Suspense>
    </>
  );
};

export default AppModalInput;
