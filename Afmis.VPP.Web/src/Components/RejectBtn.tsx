import { useEffect, useState } from "react";
import { Button } from "reactstrap";
import { ScaleLoader } from "react-spinners";

type Props = {
  onClick: () => void;
  loading?: boolean;
  [key: string]: any;
};

const RejectBtn: React.FC<Props> = ({ onClick, loading = false, ...props }) => {
  const [title, setTitle] = useState(props.title ? props.title : "مسترد");
  const [btnClass, setBtnClass] = useState<string>("btn-load btn-warning me-2");

  if (props?.btnClass) {
    setBtnClass(props.btnClass as string);
  }

  useEffect(() => {
    if (loading && title == "مسترد") {
      setTitle("Reject");
    } else if (!loading && title == "مسترد") {
      setTitle("مسترد");
    }
  }, [loading, title]);

  return (
    <Button
      // className="btn-load btn-danger me-2"
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

export default RejectBtn;
