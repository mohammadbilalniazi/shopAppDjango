import { ButtonProps } from "reactstrap";
import SubmitButton from "../SubmitButton";
import { useTranslation } from "react-i18next";
type props = {
  disabled?: boolean;
  updating?: boolean;
} & ButtonProps;

const SaveButton: React.FC<props> = ({ disabled, updating, ...props }) => {
  const {t}=useTranslation();

  return (
    <SubmitButton
      title={t("Save")}
      loading={updating}
      disabled={disabled}
      {...props}
    />
  );
};
export default SaveButton;
