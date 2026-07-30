import Cleave from "cleave.js/react";
import "cleave.js/dist/addons/cleave-phone.af";
import AppLabel from "./AppLabel";
import { CleaveOptions } from "cleave.js/options";
import { ChangeEventHandler } from "cleave.js/react/props";

type Props = {
  id?: string;
  label?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  options: CleaveOptions;
  onChange: ChangeEventHandler<HTMLInputElement> | undefined;
  [key: string]: any;
};

const AppInputMask: React.FC<Props> = ({
  id,
  label,
  invalid,
  required,
  options,
  onChange,
  ...otherProps
}) => {
  return (
    <>
      {label && <AppLabel id={id} label={label} required={required} />}

      <Cleave
        id={id}
        className={`form-control ${invalid ? "is-invalid" : ""}`}
        options={options}
        onChange={onChange}
        {...otherProps}
      />
    </>
  );
};

export default AppInputMask;
