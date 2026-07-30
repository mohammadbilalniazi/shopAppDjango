import { ButtonProps } from "reactstrap";
import SubmitButton from "../SubmitButton";
import { t } from "i18next";

type Props = {
  updating?: boolean;
  disabled?: boolean;
} & ButtonProps;

const UpdateButton: React.FC<Props> = ({ updating, disabled, ...props }) => {
  return (
    <SubmitButton
      title={t("Update")}
      loading={updating}
      disabled={disabled}
      {...props}
    />
  );
};

export default UpdateButton;
