import {  useState } from "react";
import { Button } from "reactstrap";
import { ScaleLoader } from "react-spinners";
import { useTranslation } from "react-i18next";

type Props = {
  onClick: () => void;
  loading?: boolean;
  [key: string]: any;
};

const DeleteBtn: React.FC<Props> = ({ onClick, loading = false, ...props }) => {
  const {t}=useTranslation();
  // const [title, setTitle] = useState(props.title ? props.title : t("Deleted"));
  const [btnClass, setBtnClass] = useState<string>("btn-load btn-danger me-2");
  if (props?.btnClass) {
    setBtnClass(props.btnClass as string);
  }
  // useEffect(() => {
  //   if (loading && title == "حذف") {
  //     setTitle(t("Deleted"));
  //   } else if (!loading && title == "حذف") {
  //     setTitle(t("Deleted"));
  //   }
  // }, [loading, title,t]);

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
          {/* {title} */}
          {props.title ? props.title : t("Deleted")}
          {/* {loading && "ing..."} */}

          {loading}
        </span>
      </span>
    </Button>
  );
};

export default DeleteBtn;
