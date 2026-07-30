import { FormFeedback } from "reactstrap";

type Props = {
  error: string;
  label: string;
  fromInput?: boolean;
  lookup?: boolean;
  [key: string]: any;
};

const ErrorMessage: React.FC<Props> = ({
  error,
  label,
  fromInput = false,
  lookup = false,
  ...props
}) => {
  if (!error) return null;
  const err_arr = error.split(" ");
  const deleted = err_arr.shift();
  const err = err_arr.join(" ");

  return (
    <FormFeedback
      type="invalid"
      style={{ fontWeight: 500, fontSize: 12, color: "red" }}
      {...props}
    >
      {fromInput ? (
        <>
          {lookup && deleted === "undefined" ? (
            <span>
              <sub>*</sub> Not a valid {label.toLowerCase()}.
            </span>
          ) : (
            <span>
              <sub>*</sub> {deleted === "undefined" ? `${err}` : error}
            </span>
          )}
        </>
      ) : (
        <>
          <span style={{ textTransform: "capitalize" }}>
            <sub>*</sub> {label}&nbsp;
          </span>
          <span>{err}</span>
        </>
      )}
    </FormFeedback>
  );
};

export default ErrorMessage;
