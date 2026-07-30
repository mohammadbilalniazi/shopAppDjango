import AppCol from "../AppCol";

type Props = {
  children: React.ReactNode;
  [key: string]: any;
};

const InputWrapper: React.FC<Props> = ({ children, ...props }) => {
  const className = props.className
    ? `afmis-form__field ${props.className}`
    : "afmis-form__field";

  return (
    <AppCol lg={props?.lg ? props.lg : "4"} md="6" {...props} className={className}>
      {/* <AppCol lg="4" md="6" {...props}> old */}
      {children}
    </AppCol>
  );
};

export default InputWrapper;
