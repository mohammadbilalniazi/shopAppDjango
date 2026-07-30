import { Button, ButtonProps, UncontrolledTooltip } from "reactstrap";
import usePermissionCheck from "../../hooks/sa/usePermissionCheck";
import { ScaleLoader } from "react-spinners";
import { useEffect } from "react";
// import { v4 as uuidv4 } from "uuid";

type Props = {
  id: string;
  id2?:string;
  loading?: boolean;
  disabled?:boolean;
  toltipTitle?: string;
  title?: string;
  bypass?: boolean;
  isShowInDisable?:boolean;
  icon: React.ReactNode;
} & ButtonProps;

const PermissionButton: React.FC<Props> = ({
  bypass=false,
  id,
  id2="",
  loading = false,
  disabled=false,
  isShowInDisable=true,
  icon,
  title = "",
  toltipTitle = "",
  ...props
}) => {
  const userType = localStorage.getItem("userType");
  const { permissionExists } = usePermissionCheck();

 
  let permExists = permissionExists(id); // Use `id` for permission check
  const permEists2=permissionExists(id2);
 
  if (userType === "SUPERADMIN" || bypass) {
    permExists = true; 
  } 
  useEffect(() => {
    if (!loading && localStorage.getItem("actionButtoncellclicked")) {
      localStorage.removeItem("actionButtoncellclicked");
    }
  }, [loading]);
  const show=permExists||isShowInDisable;
  return  (
    <>
    {
      show && <Button
      id={id}
      {...props}
      disabled={disabled || loading || (!permExists && !permEists2)}
      key={id}
      onClick={(e) => {
       localStorage.setItem("actionButtoncellclicked", "true"); // ✅ Set flag on click
      if (props.onClick) {
        props.onClick(e); // 🔁 Call original click handler
       }
      }}
     //  onMouseOver={()=>{
     //   if(!permExists){
     //     alert(t("nopermission"))
     //   }
     //  }}
     >
     {loading ? <ScaleLoader color="#fff" height={14} width={3} /> : icon}
     {!loading ? title : ""}
     </Button>
    }
     
      {
        show &&  <UncontrolledTooltip placement="top" target={id}>
        {toltipTitle}
      </UncontrolledTooltip>
      }
     
    </>
  ) 
};

export default PermissionButton;
