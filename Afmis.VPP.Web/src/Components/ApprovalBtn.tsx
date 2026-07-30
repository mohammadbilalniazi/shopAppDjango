import { useEffect, useState } from "react";
import { Button } from "reactstrap";
import { ScaleLoader } from "react-spinners";

type Props = {
  onClick: () => void;
  loading?: boolean;
  [key: string]: any;
};

const ApprovalBtn: React.FC<Props> = ({
  onClick,
  loading = false,
  ...props
}) => {
  const [title, setTitle] = useState(props.title ? props.title : "تاید");
  const [btnClass, setBtnClass] = useState<string>("btn-load btn-success me-2");

  if (props?.btnClass) {
    setBtnClass(props.btnClass as string);
  }

  useEffect(() => {
    if (loading && title == "تاید") {
      setTitle("مسترد");
    } else if (!loading && title == "تاید") {
      setTitle("تاید");
    }
  }, [loading, title]);

  return (
    <Button
      className={btnClass}
      onClick={onClick}
      disabled={loading}
      {...props}
    >
      <span className="d-flex align-items-center">
        {loading && <ScaleLoader color="#fff" height={14} width={3} />}
        <span className={`flex-grow-1 ${loading ? "ms-2" : ""}`}>
          {title}
          {/* {loading && "ing..."} */}

          {loading}
        </span>
      </span>
    </Button>
  );
};

export default ApprovalBtn;
