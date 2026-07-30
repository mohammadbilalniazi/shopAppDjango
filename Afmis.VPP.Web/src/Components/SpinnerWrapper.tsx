import { ObjectAny } from "../types/base";
import Spinner from "./Spinner";

type Props = {
  loading?: boolean;
  data?: ObjectAny | null;
  children: React.ReactNode;
};

const SpinnerWrapper: React.FC<Props> = ({ loading, data, children }) => {
  if (loading) return <Spinner />;

  if (data === null)
    return (
      <div>
        <p>No Record Found in Database</p>
      </div>
    );

  return children;
};

export default SpinnerWrapper;
