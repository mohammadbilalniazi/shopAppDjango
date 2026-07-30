import { Col, ColProps } from "reactstrap";

type Props = {
  children: React.ReactNode;
} & ColProps;

const AppCol: React.FC<Props> = ({ children, ...props }) => {
  return <Col {...props}>{children}</Col>;
};

export default AppCol;
