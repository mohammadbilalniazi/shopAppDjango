import AppLabel from "./AppLabel";

type Props = {
  id?: string;
  label?: string;
  invalid?: boolean;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  [key: string]: any;
};

const AppTextArea: React.FC<Props> = ({
  id,
  label,
  invalid,
  rows = 3,
  required,
  ...otherProps
}) => {
  return (
    <>
      {label && <AppLabel id={id} label={label} required={required} />}

      <textarea
        id={id}
        className={`form-control ${invalid ? "is-invalid" : ""}`}
        rows={rows}
        {...otherProps}
      ></textarea>
    </>
  );
};

export default AppTextArea;
