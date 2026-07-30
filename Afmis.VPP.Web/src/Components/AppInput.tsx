import { Input } from "reactstrap";

import AppLabel from "./AppLabel";
import { InputHTMLAttributes } from "react";
import { InputType } from "reactstrap/types/lib/Input";

type Props = {
  label?: string;
  type?: InputType;
  invalid?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

const AppInput: React.FC<Props> = ({
  id,
  label,
  required,
  type = "text",
  ...otherProps
}) => {
  return (
    <>
      {label && <AppLabel id={id} label={label} required={required} />}
               
               {
                otherProps?.name=="code" && <Input id={id} dir="ltr" type={type} {...otherProps} />
               }
               {
                otherProps?.name!="code" && <Input id={id}  type={type} {...otherProps} />
               }
                  
    </>
  );
};

export default AppInput;
