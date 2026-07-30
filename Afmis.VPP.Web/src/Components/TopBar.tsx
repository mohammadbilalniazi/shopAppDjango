import { useEffect } from "react";
import progress from "../utilities/progress";

const TopBar = () => {
  useEffect(() => {
    progress.start();
    return () => {
      progress.finish();
    };
  }, []);
  return <div></div>;
};

export default TopBar;
