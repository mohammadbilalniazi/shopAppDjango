import GridLoader from "react-spinners/GridLoader";
import AppCol from "./AppCol";

const Spinner = () => {
  return (
    <AppCol
      xs={12}
      className="d-flex justify-content-center align-items-center"
      style={{ height: "66vh" }}
    >
      <GridLoader color="#F7A813" />
    </AppCol>
  );
};

export default Spinner;
