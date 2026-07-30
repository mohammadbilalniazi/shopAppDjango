import { useEffect, useRef } from "react";
import { Label, UncontrolledTooltip } from "reactstrap";

type Props = {
  id?: string;
  label: string;
  isSwitch?: boolean;
  triState?: boolean;
  value: boolean | string;
  tooltip?: string;
  onChange: (val: boolean | string) => void;
  disabled?: boolean;
  [key: string]: any;
};

const AppCheckBox: React.FC<Props> = ({
  id,
  label,
  value,
  onChange,
  isSwitch,
  disabled,
  tooltip,
  triState,
  ...otherProps
}) => {
  const className = isSwitch
    ? "form-check form-switch form-switch-md"
    : "form-check form-check-primary ps-0";
  const checkRef = useRef<HTMLInputElement | null>(null);

  const onClick = () => {
    if (triState) {
      let res: boolean | string = "";
      if (value === true) {
        res = "";
      } else if (value === false) {
        res = true;
      } else {
        res = false;
      }
      return onChange(res);
    }
    return onChange(!value);
  };

  useEffect(() => {
    if (triState) {
      if (value === true) {
        checkRef.current!.readOnly = checkRef.current!.indeterminate = false;
      } else if (value === false) {
        checkRef.current!.indeterminate = checkRef.current!.readOnly = false;
      } else {
        checkRef.current!.readOnly = checkRef.current!.indeterminate = true;
      }
    }
  }, [triState, value]);

  return (
    <>
      <div
        className={className}
        style={{ display: "flex", justifyContent: "flex-start" }}
      >
        <div style={{ position: "relative", top: 3 }}>
          <Label
            className="form-check-label c-label"
            for={id}
            id={String(otherProps?.name)+"-label"}
            style={{ marginInlineStart: 6, color: disabled ? "#555" : "" }}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onClick={disabled ? () => {} : onClick}
          > 
            {label}
          </Label>

         
          <input
            type="checkbox"
            ref={checkRef}
            id={id}
            className="check"
            checked={value as boolean}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onChange={() => {}}
            onClick={onClick}
            disabled={disabled}
            {...otherProps}
          />
               
        </div>
      </div>
      {tooltip && (      <UncontrolledTooltip placement="top" target={String(otherProps?.name)+"-label"}>
            {tooltip || label}
      </UncontrolledTooltip> )}
    </>
  );
};

export default AppCheckBox;
