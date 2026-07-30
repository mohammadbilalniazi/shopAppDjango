import { useEffect, useState } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  changeLayout,
  changeLayoutMode,
  changeLayoutPosition,
  changeLayoutWidth,
  changeLeftsidebarSizeType,
  changeLeftsidebarViewType,
  changeSidebarImageType,
  changeSidebarTheme,
  changeTopbarTheme,
} from "../store/layouts/actions";

type Props = {
  children: React.ReactNode;
};

const Layouts: React.FC<Props> = ({ children }) => {
  const dispatch = useAppDispatch();
  const layoutType = useAppSelector((state) => state.Layout.layoutType);
  const leftSidebarType = useAppSelector((state) => state.Layout.leftSidebarType);
  const layoutModeType = useAppSelector((state) => state.Layout.layoutModeType);
  const layoutWidthType = useAppSelector((state) => state.Layout.layoutWidthType);
  const layoutPositionType = useAppSelector((state) => state.Layout.layoutPositionType);
  const topbarThemeType = useAppSelector((state) => state.Layout.topbarThemeType);
  const leftsidbarSizeType = useAppSelector((state) => state.Layout.leftsidbarSizeType);
  const leftSidebarViewType = useAppSelector((state) => state.Layout.leftSidebarViewType);
  const leftSidebarImageType = useAppSelector((state) => state.Layout.leftSidebarImageType);

  useEffect(() => {
    dispatch(changeLeftsidebarViewType(leftSidebarViewType));
    dispatch(changeLeftsidebarSizeType(leftsidbarSizeType));
    dispatch(changeSidebarTheme(leftSidebarType));
    dispatch(changeLayoutMode(layoutModeType));
    dispatch(changeLayoutWidth(layoutWidthType));
    dispatch(changeLayoutPosition(layoutPositionType));
    dispatch(changeTopbarTheme(topbarThemeType));
    dispatch(changeLayout(layoutType));
    dispatch(changeSidebarImageType(leftSidebarImageType));
  }, [
    layoutType,
    leftSidebarType,
    layoutModeType,
    layoutWidthType,
    layoutPositionType,
    topbarThemeType,
    leftsidbarSizeType,
    leftSidebarViewType,
    leftSidebarImageType,
    dispatch,
  ]);

  const onChangeLayoutMode = (value: string) => {
    dispatch(changeLayoutMode(value));
  };

  const [headerClass, setHeaderClass] = useState("");

  useEffect(() => {
    const onScroll = () => {
      const scrollup = document.documentElement.scrollTop || document.body.scrollTop;
      setHeaderClass(scrollup > 50 ? "topbar-shadow" : "");
    };
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, []);

  return (
    <>
      {/* Only footer stickiness + content bottom padding. No width/overflow changes. */}
      <style>{`
        :root {
          /* Change this if your footer is taller/shorter */
          --footer-height: 64px;
        }
        /* Ensure content never hides under the fixed footer */
        .main-content {
          padding-bottom: var(--footer-height);
        }
        /* Make footer always visible without altering other components */
        .sticky-footer {
          position: fixed;
          inset-inline: 0;
          bottom: 0;
          z-index: 1030; /* above typical content; adjust if needed */
          /* no width or margin changes */
        }
      `}</style>

      <div id="layout-wrapper" style={{ height: "100%" }}>
        <Header
          headerClass={headerClass}
          layoutModeType={layoutModeType}
          onChangeLayoutMode={onChangeLayoutMode}
        />
        <Sidebar layoutType={layoutType} />

        <div className="main-content" style={{ height: "100%" }}>
          {children}
        </div>

        {/* Keep Footer as-is, just wrapped so it sticks to bottom */}
        <div className="sticky-footer">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Layouts;
