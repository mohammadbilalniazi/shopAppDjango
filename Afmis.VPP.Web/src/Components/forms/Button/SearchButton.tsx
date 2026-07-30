import { ButtonProps } from "reactstrap";
import SubmitButton from "../SubmitButton";
import { useTranslation } from "react-i18next";
type Props = {
  searching?: boolean;
  disabled?: boolean;
} & ButtonProps;

const SearchButton: React.FC<Props> = ({ searching, disabled, ...props }) => {
  const {t}=useTranslation();
  return (
    <SubmitButton
      title={t("Search")}
      loading={searching}
      disabled={disabled}
      {...props}
    />
  );
};

export default SearchButton;
