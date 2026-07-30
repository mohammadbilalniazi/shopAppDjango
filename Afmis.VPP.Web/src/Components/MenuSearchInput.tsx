import React from "react";
import { RxCrossCircled } from "react-icons/rx";

import { BiSearchAlt } from "react-icons/bi";
import AppInput from "./AppInput";
import { t } from "i18next";

type Props = {
  searchTerm: string;
  handleChangeSearchMenu: (searchTerm: string) => void;
  className?: string;
  placeholder?: string;
  style?: { [key: string]: string };
};

const MenuSearchInput: React.FC<Props> = ({
  handleChangeSearchMenu,
  searchTerm,
  className,
  placeholder,
  style,
}) => {
  const inputStyle = style
    ? {
        ...style,
        paddingInlineStart:
          style.paddingInlineStart ?? style.paddingLeft ?? "40px",
        paddingInlineEnd:
          style.paddingInlineEnd ?? style.paddingRight ?? "40px",
        backgroundColor: style.backgroundColor ?? "#00235e",
        color: style.color ?? "#fff",
      }
    : {
        backgroundColor: "#00235e",
        color: "#fff",
        paddingInlineStart: "40px",
        paddingInlineEnd: "40px",
      };

  return (
    <div
      style={{
        width: "100%",
        paddingInline: 12,
        paddingBlockStart: 10,
        boxSizing: "border-box",
      }}
      className={`navbar-search ${className ?? ""}`}
    >
      <div className="search-box">
        <AppInput
          id="search-bar-0"
          type="text"
          autoFocus
          className="form-control search"
          style={inputStyle}
          placeholder={placeholder ?? t("SearchMenu") ?? ""}
          value={searchTerm}
          onChange={(e) => handleChangeSearchMenu(e.target.value)}
        />
        <BiSearchAlt
          color={inputStyle.color ?? "#fff"}
          size={20}
          className="search-icon"
        />
        <button
          type="button"
          className="search-close-btn"
          onClick={() => handleChangeSearchMenu("")}
        >
          <RxCrossCircled color={inputStyle.color ?? "#fff"} size={20} />
        </button>
      </div>
    </div>
  );
};

export default MenuSearchInput;
