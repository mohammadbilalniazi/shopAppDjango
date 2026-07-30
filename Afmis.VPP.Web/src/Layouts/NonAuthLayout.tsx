import { useEffect } from "react";

import { useAppSelector } from "../store/hooks";
import { isLayoutMode } from "../store/layouts/preferences";

type Props = {
  children: React.ReactNode;
};

const NonAuthLayout: React.FC<Props> = ({ children }) => {
  const layoutModeType = useAppSelector((state) => state.Layout.layoutModeType);

  useEffect(() => {
    const mode = isLayoutMode(layoutModeType) ? layoutModeType : "light";

    document.documentElement.setAttribute("data-layout-mode", mode);
    document.body.setAttribute("data-layout-mode", mode);
  }, [layoutModeType]);

  return <div>{children}</div>;
};

export default NonAuthLayout;
