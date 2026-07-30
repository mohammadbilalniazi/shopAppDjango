import { Label, Input } from "reactstrap";
import AppLabel from "./AppLabel";

type Props = {
  id?: string;
  label?: string;
  options: { title: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  disabled?: boolean;
  [key: string]: any;
};

const AppRadio: React.FC<Props> = ({
  id,
  label,
  options,
  value,
  onChange,
  required,
  ...otherProps
}) => {
  return (
    <>
      {label && <AppLabel id={id} label={label} required={required} />}

      <div className="form-check form-radio-outline form-radio-primary">
        {options.map((option) => (
          <div key={option.value}>
            <Input
              type="radio"
              id={id}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              {...otherProps}
            />
            <Label
              className="form-check-label"
              onClick={() => onChange(option.value)}
            >
              {option.title}
            </Label>
          </div>
        ))}
      </div>
    </>
  );
};

export default AppRadio;
