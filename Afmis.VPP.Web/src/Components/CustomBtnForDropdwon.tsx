import React from "react";
import { Button, UncontrolledTooltip } from "reactstrap";
import { ScaleLoader } from "react-spinners";
import usePermissionCheck from "../hooks/sa/usePermissionCheck";

type Props = {
  name: string;
  id: string;
  tooltip: string;
  color?: string;
  icon: React.ReactElement;
  disabled: boolean;
  show: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};
const CustomBtnForDropDown: React.FC<Props> = ({
  id,
  name,
  color = "",
  tooltip,
  icon,
  disabled,
  show,
  onClick,
}) => {
  const userType = localStorage.getItem("userType");
  const { permissionExists } = usePermissionCheck();
  let permExists = permissionExists(id); // id= permission
  if (userType == "SUPERADMIN") {
    permExists = true;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        width: "100%",
        textAlign: "center",
        whiteSpace: "nowrap",
      }}
    >
      {show && permExists && (
        <>
          <Button
            style={{ padding: 7, backgroundColor: color }}
            onClick={onClick}
            id={id}
            disabled={disabled}
          >
            {disabled ? (
              <ScaleLoader color="#fff" height={14} width={3} />
            ) : (
              icon
            )}
          </Button>
          <p style={{ marginTop: "10px" }}>{name}</p>
          <UncontrolledTooltip placement="top" target={id}>
            {tooltip}
          </UncontrolledTooltip>
        </>
      )}
    </div>
  );
};

export default CustomBtnForDropDown;
