import { Label } from "reactstrap";

type Props = {
  id?: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  [key: string]: any;
};

const AppLabel: React.FC<Props> = ({
  id,
  label,
  required,
  disabled,
  ...props
}) => {
  return (
    <Label  htmlFor={id} disabled={disabled} {...props}>
      {label}
      {required && <span className="astrix">*</span>} :
    </Label>
  );
};

export default AppLabel;