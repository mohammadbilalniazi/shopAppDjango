import { ButtonProps } from "reactstrap";
import AppButton from "../../AppButton";
import { t } from "i18next";

type Props = {
  onClick: VoidFunction;
} & ButtonProps;

const CancelButton: React.FC<Props> = ({ onClick, ...props }) => {
  return (
    <AppButton
      style={{ marginInlineStart: 5 }}
      onClick={onClick}
      color="secondary"
      {...props}
    >
      {t("Cancel")??""}
    </AppButton>
  );
};

export default CancelButton;
