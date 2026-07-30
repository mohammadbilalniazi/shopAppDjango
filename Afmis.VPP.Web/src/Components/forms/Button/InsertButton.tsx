import { ButtonProps } from "reactstrap";
import SubmitButton from "../SubmitButton";
import { useTranslation } from "react-i18next";

type Props = {
  disabled?: boolean;
  inserting: boolean;
} & ButtonProps;

const InsertButton: React.FC<Props> = ({ disabled, inserting, ...props }) => {
  const {t}=useTranslation();
  return (
    <SubmitButton 
      title={t("Save")}
      loading={inserting}
      disabled={disabled}
      {...props}
    />
  );
};

export default InsertButton;
