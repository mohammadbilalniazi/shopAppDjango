import { Row, RowProps } from "reactstrap";

export type Props = {
  children: React.ReactNode;
} & RowProps;
const AppRow: React.FC<Props> = ({ children, ...props }) => {
  return <Row {...props}>{children}</Row>;
};

export default AppRow;
