import { Button, ButtonProps } from "reactstrap";
import { ScaleLoader } from "react-spinners";
import { useFormikContext } from "formik";
import { MouseEventHandler, useEffect, useState } from "react";
import { FormikContext } from "../../types/base";
import usePermissionCheck from "../../hooks/sa/usePermissionCheck";
import toast from "../../utilities/toast";

type Props = {
  title: string;
  color?: string;
  loading?: boolean;
  disabled?: boolean;
  model?: string;
} & ButtonProps;

const SubmitButton: React.FC<Props> = ({
  title: originalTitle,
  color = "primary",
  loading = false,
  disabled = false,
  onClick,
  model,
  ...props
}) => {
  const formik = useFormikContext<FormikContext<any>>();
  const { getPermissionOfSubmitFormButtons } = usePermissionCheck();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const hasPermission = getPermissionOfSubmitFormButtons(model ?? (props?.model??""));
  // console.log({model,hasPermission});
  const [translatedTitle, setTranslatedTitle] = useState(originalTitle); 
 
  useEffect(() => {
    if (loading) {
      const translations: Record<string, string> = {
        Update: "تجدید",
        Save: "ثبت",
        Close: "بسته",
      };
      setTranslatedTitle(translations[originalTitle] || originalTitle);
    } else {
      setTranslatedTitle(originalTitle);
    }
  }, [loading, originalTitle]);

  const handleClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();

    if (onClick) {
      onClick(e);
      return;
    }

    const errors = formik?.validateForm ? await formik.validateForm() : {};

    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors)
        .filter(Boolean)
        .map((msg) => (typeof msg === "string" ? msg : JSON.stringify(msg)))
        .join("\n");

      toast(errorMessages || "Please fix the errors before submitting.", "error");

      formik.setTouched(
        Object.keys(errors).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {} as Record<string, boolean>)
      );

      return;
    }

    formik.handleSubmit();
  };

  

  return (
    <Button
    color={color}
    className="btn-load"
    type="submit"
    onClick={handleClick}
    disabled={loading || disabled || !hasPermission}
    {...props}
  >
    <span className="d-flex align-items-center">
      {loading ? (
        <ScaleLoader color="#fff" height={14} width={3} />
      ) : (
        <span className="flex-grow-1">{translatedTitle}</span>
      )}
    </span>
  </Button>
  
    
  );
};

export default SubmitButton;
