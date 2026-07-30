/* eslint-disable react-refresh/only-export-components */
import { Fragment, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Collapse } from "reactstrap";
// Import Data
import navdata from "../LayoutMenuData";
//i18n
import { withTranslation } from "react-i18next";
import { ObjectAny } from "../../types/base";
import { MenuItem } from "../../types/layout";
import AppRow from "../../Components/AppRow";
import AppCol from "../../Components/AppCol";

type Props = {
  location?: ObjectAny;
  // eslint-disable-next-line no-unused-vars
  t: (str: string) => string;
  layoutType?: string;
};

const HorizontalLayout: React.FC<Props> = (props) => {
  const location = useLocation();
  const [isMoreMenu, setIsMoreMenu] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const navData: MenuItem[] = (navdata({}) as ObjectAny).props.children;

  const menuItems: MenuItem[] = [];
  const splitMenuItems: any[] = [];
  let menuSplitContainer = 5;
  navData.forEach(function (value, key) {
    if (value["isHeader"]) {
      menuSplitContainer++;
    }
    if (key >= menuSplitContainer) {
      const val = value;
      val.childItems = value.subItems;
      val.isChildItem = value.subItems ? true : false;
      // FIXME: check below line
      // delete val.subItems;
      splitMenuItems.push(val);
    } else {
      menuItems.push(value);
    }
  });
  menuItems.push({
    id: "more",
    label: "More",
    icon: "ri-briefcase-2-line",
    link: "/more",
    stateVariables: isMoreMenu,
    subItems: splitMenuItems,
    click: function (e: React.MouseEvent<HTMLElement>) {
      e.preventDefault();
      setIsMoreMenu(!isMoreMenu);
    },
    isHeader: false,
    isChildItem: false,
    childItems: [],
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const initMenu = () => {
      const pathName = location.pathname;
      const ul = document.getElementById("navbar-nav");
      const items = ul?.getElementsByTagName("a");
      if (items) {
        const itemsArray = [...items]; // converts NodeList to Array
        removeActivation(itemsArray);
        const matchingMenuItem = itemsArray.filter((x) => {
          return pathName.startsWith((x as ObjectAny).pathname as string);
        });
        if (matchingMenuItem.length > 1) {
          activateParentDropdown(matchingMenuItem[matchingMenuItem.length - 1]);
        }
      }
    };
    initMenu();
  }, [location.pathname, props.layoutType]);

  function activateParentDropdown(item: HTMLElement) {
    item.classList.add("active");
    const parentCollapseDiv = item.closest(".collapse.menu-dropdown");

    if (parentCollapseDiv) {
      // to set aria expand true remaining
      parentCollapseDiv.classList.add("show");
      parentCollapseDiv.parentElement?.children[0].classList.add("active");
      parentCollapseDiv.parentElement?.children[0].setAttribute(
        "aria-expanded",
        "true"
      );
      if (parentCollapseDiv.parentElement?.closest(".collapse.menu-dropdown")) {
        parentCollapseDiv.parentElement
          ?.closest(".collapse")
          ?.classList.add("show");
        const parentElementDiv =
          parentCollapseDiv.parentElement?.closest(
            ".collapse"
          )?.previousElementSibling;
        if (parentElementDiv)
          if (parentElementDiv.closest(".collapse"))
            parentElementDiv.closest(".collapse")?.classList.add("show");
        parentElementDiv?.classList.add("active");
        const parentElementSibling =
          parentElementDiv?.parentElement?.parentElement?.parentElement
            ?.previousElementSibling;
        if (parentElementSibling) {
          parentElementSibling.classList.add("active");
        }
      }
      return false;
    }
    return false;
  }

  const removeActivation = (items: HTMLElement[]) => {
    const actiItems = items.filter((x) => x.classList.contains("active"));

    actiItems.forEach((item) => {
      if (item.classList.contains("menu-link")) {
        if (!item.classList.contains("active")) {
          item.setAttribute("aria-expanded", "false");
        }
        if (item.nextElementSibling) {
          item.nextElementSibling.classList.remove("show");
        }
      }
      if (item.classList.contains("nav-link")) {
        if (item.nextElementSibling) {
          item.nextElementSibling.classList.remove("show");
        }
        item.setAttribute("aria-expanded", "false");
      }
      item.classList.remove("active");
    });
  };

  return (
    <Fragment>
      {(menuItems || []).map((item, key) => {
        return (
          <Fragment key={key}>
            {/* Main Header */}
            {!item["isHeader"] ? (
              item.subItems ? (
                <li className="nav-item">
                  <Link
                    onClick={item.click}
                    className="nav-link menu-link"
                    to={item.link ? item.link : "/#"}
                    data-bs-toggle="collapse"
                  >
                    <i className={item.icon}></i>{" "}
                    <span data-key="t-apps">{props.t(item.label)}</span>
                  </Link>
                  <Collapse
                    className={
                      item.subItems.length > 13
                        ? "menu-dropdown mega-dropdown-menu"
                        : "menu-dropdown"
                    }
                    isOpen={item.stateVariables}
                    id="sidebarApps"
                  >
                    {/* subItms  */}
                    {item.subItems.length > 13 ? (
                      <Fragment>
                        <AppRow>
                          {item.subItems &&
                            (item.subItems || []).map((_subItem, key) => (
                              <Fragment key={key}>
                                {key % 2 === 0 ? (
                                  <AppCol lg={4}>
                                    <ul className="nav nav-sm flex-column">
                                      <li className="nav-item">
                                        <Link
                                          to={item.subItems[key].link}
                                          className="nav-link"
                                        >
                                          {item.subItems[key].label}
                                        </Link>
                                      </li>
                                    </ul>
                                  </AppCol>
                                ) : (
                                  <AppCol lg={4}>
                                    <ul className="nav nav-sm flex-column">
                                      <li className="nav-item">
                                        <Link
                                          to={item.subItems[key].link}
                                          className="nav-link"
                                        >
                                          {item.subItems[key].label}
                                        </Link>
                                      </li>
                                    </ul>
                                  </AppCol>
                                )}
                              </Fragment>
                            ))}
                        </AppRow>
                      </Fragment>
                    ) : (
                      <ul className="nav nav-sm flex-column test">
                        {item.subItems &&
                          (item.subItems || []).map((subItem, key) => (
                            <Fragment key={key}>
                              {!subItem.isChildItem ? (
                                <li className="nav-item">
                                  <Link
                                    to={subItem.link ? subItem.link : "/#"}
                                    className="nav-link"
                                  >
                                    {props.t(subItem.label)}
                                  </Link>
                                </li>
                              ) : (
                                <li className="nav-item">
                                  <Link
                                    onClick={subItem.click}
                                    className="nav-link"
                                    to={subItem.link}
                                    data-bs-toggle="collapse"
                                  >
                                    {" "}
                                    {props.t(subItem.label)}
                                  </Link>
                                  <Collapse
                                    className="menu-dropdown"
                                    isOpen={subItem.stateVariables}
                                    id="sidebarEcommerce"
                                  >
                                    <ul className="nav nav-sm flex-column">
                                      {/* child subItms  */}
                                      {subItem.childItems &&
                                        (subItem.childItems || []).map(
                                          (subChildItem, key) => (
                                            <Fragment key={key}>
                                              {!subChildItem.isChildItem ? (
                                                <li className="nav-item">
                                                  <Link
                                                    to={
                                                      subChildItem.link
                                                        ? subChildItem.link
                                                        : "/#"
                                                    }
                                                    className="nav-link"
                                                  >
                                                    {props.t(
                                                      subChildItem.label
                                                    )}
                                                  </Link>
                                                </li>
                                              ) : (
                                                <li className="nav-item">
                                                  <Link
                                                    onClick={subChildItem.click}
                                                    className="nav-link"
                                                    to={subChildItem.link}
                                                    data-bs-toggle="collapse"
                                                  >
                                                    {" "}
                                                    {props.t(
                                                      subChildItem.label
                                                    )}
                                                  </Link>
                                                  <Collapse
                                                    className="menu-dropdown"
                                                    isOpen={
                                                      subChildItem.stateVariables
                                                    }
                                                    id="sidebarEcommerce"
                                                  >
                                                    <ul className="nav nav-sm flex-column">
                                                      {/* child subItms  */}
                                                      {subChildItem.childItems &&
                                                        (
                                                          subChildItem.childItems ||
                                                          []
                                                        ).map(
                                                          (
                                                            subSubChildItem,
                                                            key
                                                          ) => (
                                                            <li
                                                              className="nav-item apex"
                                                              key={key}
                                                            >
                                                              <Link
                                                                to={
                                                                  subSubChildItem.link
                                                                    ? subSubChildItem.link
                                                                    : "/#"
                                                                }
                                                                className="nav-link"
                                                              >
                                                                {props.t(
                                                                  subSubChildItem.label
                                                                )}
                                                              </Link>
                                                            </li>
                                                          )
                                                        )}
                                                    </ul>
                                                  </Collapse>
                                                </li>
                                              )}
                                            </Fragment>
                                          )
                                        )}
                                    </ul>
                                  </Collapse>
                                </li>
                              )}
                            </Fragment>
                          ))}
                      </ul>
                    )}
                  </Collapse>
                </li>
              ) : (
                <li className="nav-item">
                  <Link
                    className="nav-link menu-link"
                    to={item.link ? item.link : "/#"}
                  >
                    <i className={item.icon}></i>{" "}
                    <span>{props.t(item.label)}</span>
                  </Link>
                </li>
              )
            ) : (
              <li className="menu-title">
                <span data-key="t-menu">{props.t(item.label)}</span>
              </li>
            )}
          </Fragment>
        );
      })}
      {/* menu Items */}
    </Fragment>
  );
};

export default withTranslation()(HorizontalLayout);
