import { useLocation } from "react-router-dom";
import { CardHeader, Button, UncontrolledTooltip } from "reactstrap";
import { AiOutlinePlus, AiOutlineSearch } from "react-icons/ai";
import { FiRefreshCcw } from "react-icons/fi";
import { screens } from "../constants/screens";
import useAppNavigate from "../hooks/common/useAppNavigate";
import usePermissionCheck from "../hooks/sa/usePermissionCheck";
import { t } from "i18next";
import React from "react";

type Props = {
  title: string;
  noOfRecords?: number;
  screen?: string;
  model?: string;
  extraButton?: React.ReactNode[];
  addLink?: string;
  searchLink?: string;
  searchResultsLink?: string;
};

type State = {
  fromInsert?: boolean;
  fromSearchResults?: boolean;
  fromDelete?: boolean;
};

const FormHeader: React.FC<Props> = ({
  screen,
  model,
  extraButton,
  title,
  noOfRecords,
  addLink,
  searchLink,
  searchResultsLink,
}) => {
  const { navigate } = useAppNavigate();
  const location = useLocation();
  const state = location.state as State;
  const navigation = [];
  const { permissionExists } = usePermissionCheck();
  let permissionexist = false;
  // let method = "";
  localStorage.setItem("model", model ?? "");
  localStorage.setItem("screen", screen ?? "");

  if (model && model?.split("-")?.length > 1) {
    permissionexist = permissionExists(model);
  } else if (screen == screens.SEARCH || screen == screens.SEARCH_RESULTS) {
    if (permissionExists(model as string, "Post")) {
      permissionexist = true;
      // method = "Post";
    } else if (permissionExists(model as string, "Put")) {
      permissionexist = true;
      // method = "Put";
    }
  } else if (screen === screens.DETAIL || screen === screens.INSERT) {
    if (permissionExists(model as string, "Get")) {
      permissionexist = true;
      // method = "Get";
    } else if (permissionExists(model as string, "GetById")) {
      permissionexist = true;
    }
  } else if (
    screen !== undefined &&
    screen !== "" &&
    model !== undefined &&
    model !== ""
  ) {
    permissionexist = permissionExists(model, screen);
  }
  const userType = localStorage.getItem("userType");
  if (userType == "SUPERADMIN") {
    permissionexist = true;
  }

  if (extraButton) {
    navigation.push(
      <div style={{ marginInlineEnd: 5 }} key="11">
        {extraButton}
      </div>,
    );
  }
  if (screen !== screens.INSERT && addLink) {
    navigation.push(
      <div style={{ marginInlineEnd: 5 }} key="1">
        <Button
          style={{ padding: 3 }}
          onClick={() => navigate(addLink)}
          id="insert"
          disabled={!permissionexist}
        >
          <AiOutlinePlus fontSize={21} />
        </Button>
        <UncontrolledTooltip placement="top" target="insert">
          {t("Insert")} {t(model ?? "")}
        </UncontrolledTooltip>
      </div>,
    );
  }

  if (screen !== screens.SEARCH && searchLink) {
    navigation.push(
      <div style={{ marginInlineEnd: 5 }} key="2">
        <Button
          style={{ padding: 3 }}
          onClick={() => navigate(searchLink)}
          id="search"
          disabled={!permissionexist}
        >
          <AiOutlineSearch fontSize={21} className="search-magnifier-dir" />
        </Button>
        <UncontrolledTooltip placement="top" target="search">
          {t("Search")} {t(model ?? "")}
        </UncontrolledTooltip>
      </div>,
    );
  }
  if (
    (screen === screens.DETAIL &&
      !state?.fromInsert &&
      state?.fromSearchResults) ||
    (screen === screens.SEARCH && state?.fromSearchResults && state?.fromDelete)
  ) {
    searchResultsLink &&
      navigation.push(
        <div style={{ marginInlineEnd: 5 }} key="3">
          <Button
            style={{ padding: 3 }}
            onClick={() =>
              navigate(searchResultsLink, {
                state: { fromDetail: true },
              })
            }
            id="searchResults"
            disabled={!permissionexist}
          >
            <FiRefreshCcw fontSize={20} />
          </Button>
          <UncontrolledTooltip placement="top" target="searchResults">
            {t("SearchResults")}
          </UncontrolledTooltip>
        </div>,
      );
  }

  return (
    <>
      <CardHeader className="align-items-center justify-content-between d-flex">
        <div className="d-flex ">
          {/* <h4 className="card-title mb-0 flex-grow-1 me-2"> {title} </h4> */}
          <h2 className="card-title mb-0 flex-grow-1 me-2">
            {screen == screens.SEARCH && (
              <div className="title-highlight-search">
                <AiOutlineSearch
                  fontSize={21}
                  className="search-magnifier-dir"
                />
                {title}
              </div>
            )}
            {screen == screens.INSERT && (
              <div className="title-highlight-insert">
                <AiOutlinePlus fontSize={21} />
                {title}
              </div>
            )}
            {(screen == screens.DETAIL || screen == screens.SEARCH_RESULTS) && (
              <div className="title-highlight-detail">{title}</div>
            )}{" "}
          </h2>
          {noOfRecords && (
            <span>
              {" "}
              - {noOfRecords} {t("results")}
            </span>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="form-check form-switch form-switch-right form-switch-md d-flex">
            {navigation}
          </div>
        </div>
      </CardHeader>
    </>
  );
};

export default FormHeader;
