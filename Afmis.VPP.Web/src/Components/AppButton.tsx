import { ButtonHTMLAttributes } from "react";
import { Button } from "reactstrap";

type Props = {
  color?: string;
  children: React.ReactNode;
  [key: string]: any;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const AppButton: React.FC<Props> = ({
  color = "primary",
  children,
  ...props
}) => {
  return (
    <Button color={color} {...props}>
      {children}
    </Button>
  );
};

export default AppButton;
