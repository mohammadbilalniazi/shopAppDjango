import AppCol from "./AppCol";
import AppRow from "./AppRow";

type Props = {
  children: React.ReactNode;
};

const FormFooter: React.FC<Props> = ({ children }) => {
  return (
    <AppRow className="afmis-form__footer-row">
      <AppCol className="afmis-form__footer-actions">{children}</AppCol>
    </AppRow>
  );
};

export default FormFooter;
