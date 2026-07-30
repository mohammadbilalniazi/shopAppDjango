/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useState, Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { Collapse, Container } from "reactstrap";
import logoSm from "../../assets/images/logo.webp";

//i18n
import { withTranslation } from "react-i18next";

// Import Data
import navdata from "../LayoutMenuData";

//SimpleBar
import SimpleBar from "simplebar-react";
import VerticalLayout from "../VerticalLayouts";
import { ObjectAny } from "../../types/base";
import { MenuItem } from "../../types/layout";

type Props = {
  location?: ObjectAny;
  // eslint-disable-next-line no-unused-vars
  t: (str: string) => string;
  layoutType?: string;
};

const TwoColumnLayout: React.FC<Props> = (props) => {
  const location = useLocation();
  const navData: MenuItem[] = ((navdata({}) as ObjectAny).props as ObjectAny)
    .children;

  const activateParentDropdown = useCallback((item: HTMLElement) => {
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
          .closest(".collapse")
          ?.classList.add("show");
        const parentParentCollapse =
          parentCollapseDiv.parentElement.closest(
            ".collapse"
          )?.previousElementSibling;
        if (parentParentCollapse) {
          parentParentCollapse.classList.add("active");
          if (parentParentCollapse.closest(".collapse.menu-dropdown")) {
            parentParentCollapse
              .closest(".collapse.menu-dropdown")
              ?.classList.add("show");
          }
        }
      }
      activateIconSidebarActive(parentCollapseDiv.getAttribute("id") as string);
      return false;
    }
    return false;
  }, []);

  const initMenu = useCallback(() => {
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
      } else {
        const id = pathName.replace("/", "");
        if (id) document.body.classList.add("twocolumn-panel");
        activateIconSidebarActive(id);
      }
    }
  }, [location.pathname, activateParentDropdown]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    initMenu();
  }, [location.pathname, initMenu]);

  function activateIconSidebarActive(id: string) {
    const menu = document.querySelector(
      "#two-column-menu .simplebar-content-wrapper a[subitems='" +
        id +
        "'].nav-icon"
    );
    if (menu !== null) {
      menu.classList.add("active");
    }
  }

  const removeActivation = (items: HTMLElement[]) => {
    const activeItems = items.filter((x) => x.classList.contains("active"));
    activeItems.forEach((item) => {
      if (item.classList.contains("menu-link")) {
        if (!item.classList.contains("active")) {
          item.setAttribute("aria-expanded", "false");
        }
        item.nextElementSibling?.classList.remove("show");
      }
      if (item.classList.contains("nav-link")) {
        if (item.nextElementSibling) {
          item.nextElementSibling.classList.remove("show");
        }
        item.setAttribute("aria-expanded", "false");
      }
      item.classList.remove("active");
    });

    const ul = document.getElementById("two-column-menu");
    const iconItems = ul?.getElementsByTagName("a");
    if (iconItems) {
      const itemsArray = [...iconItems];
      const activeIconItems = itemsArray.filter((x) =>
        x.classList.contains("active")
      );
      activeIconItems.forEach((item) => {
        item.classList.remove("active");
        const id: string = item.getAttribute("subitems") as string;
        if (document.getElementById(id))
          document.getElementById(id)?.classList.remove("show");
      });
    }
  };

  // Resize sidebar
  const [isMenu, setIsMenu] = useState("twocolumn");
  const windowResizeHover = () => {
    initMenu();
    const windowSize = document.documentElement.clientWidth;
    if (windowSize < 767) {
      document.documentElement.setAttribute("data-layout", "vertical");
      setIsMenu("vertical");
    } else {
      document.documentElement.setAttribute("data-layout", "twocolumn");
      setIsMenu("twocolumn");
    }
  };

  useEffect(function setupListener() {
    if (props.layoutType === "twocolumn") {
      window.addEventListener("resize", windowResizeHover);

      // remove classname when component will unmount
      return function cleanupListener() {
        window.removeEventListener("resize", windowResizeHover);
      };
    }
  });

  return (
    <Fragment>
      {isMenu === "twocolumn" ? (
        <div id="scrollbar">
          <Container fluid>
            <div id="two-column-menu">
              <SimpleBar className="twocolumn-iconview">
                <Link to="/" className="logo">
                  <img src={logoSm} alt="" height="22" />
                </Link>
                {(navData || []).map((item, key) => (
                  <Fragment key={key}>
                    {item.icon &&
                      (item.subItems ? (
                        <li>
                          <Link
                            onClick={item.click}
                            to="#"
                            className="nav-icon"
                            data-bs-toggle="collapse"
                          >
                            <i className={item.icon}></i>
                          </Link>
                        </li>
                      ) : (
                        <>
                          <Link
                            onClick={item.click}
                            to={item.link ? item.link : "/#"}
                            className="nav-icon"
                            data-bs-toggle="collapse"
                          >
                            <i className={item.icon}></i>
                          </Link>
                        </>
                      ))}
                  </Fragment>
                ))}
              </SimpleBar>
            </div>
            <SimpleBar id="navbar-nav" className="navbar-nav">
              {(navData || []).map((item, key) => (
                <Fragment key={key}>
                  {item.subItems ? (
                    <li className="nav-item">
                      <Collapse
                        className="menu-dropdown"
                        isOpen={item.stateVariables}
                        id={item.id}
                      >
                        <ul className="nav nav-sm flex-column test">
                          {/* subItms  */}
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
                                      {subItem.badgeName ? (
                                        <span
                                          className={
                                            "badge badge-pill bg-" +
                                            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                                            subItem.badgeColor
                                          }
                                          data-key="t-new"
                                        >
                                          {subItem.badgeName}
                                        </span>
                                      ) : null}
                                    </Link>
                                  </li>
                                ) : (
                                  <li className="nav-item">
                                    <Link
                                      onClick={subItem.click}
                                      className="nav-link"
                                      to="/#"
                                      data-bs-toggle="collapse"
                                    >
                                      {" "}
                                      {props.t(subItem.label)}
                                    </Link>
                                    <Collapse
                                      className="menu-dropdown"
                                      isOpen={subItem.stateVariables}
                                      id={item.id}
                                    >
                                      <ul className="nav nav-sm flex-column">
                                        {/* child subItms  */}
                                        {subItem.childItems &&
                                          (subItem.childItems || []).map(
                                            (childItem, key) => (
                                              <li
                                                className="nav-item"
                                                key={key}
                                              >
                                                <Link
                                                  to={
                                                    childItem.link
                                                      ? childItem.link
                                                      : "/#"
                                                  }
                                                  onClick={childItem.click}
                                                  className="nav-link"
                                                >
                                                  {props.t(childItem.label)}
                                                </Link>
                                                <Collapse
                                                  className="menu-dropdown"
                                                  isOpen={
                                                    childItem.stateVariables
                                                  }
                                                  id={item.id}
                                                >
                                                  <ul className="nav nav-sm flex-column">
                                                    {/* child subChildItems  */}
                                                    {childItem.isChildItem &&
                                                      (
                                                        childItem.childItems ||
                                                        []
                                                      ).map(
                                                        (childItem, key) => (
                                                          <li
                                                            className="nav-item"
                                                            key={key}
                                                          >
                                                            <Link
                                                              to={
                                                                childItem.link
                                                                  ? childItem.link
                                                                  : "/#"
                                                              }
                                                              className="nav-link"
                                                            >
                                                              {props.t(
                                                                childItem.label
                                                              )}
                                                            </Link>
                                                          </li>
                                                        )
                                                      )}
                                                  </ul>
                                                </Collapse>
                                              </li>
                                            )
                                          )}
                                      </ul>
                                    </Collapse>
                                  </li>
                                )}
                              </Fragment>
                            ))}
                        </ul>
                      </Collapse>
                    </li>
                  ) : null}
                </Fragment>
              ))}
            </SimpleBar>
          </Container>
        </div>
      ) : (
        <SimpleBar id="scrollbar" className="h-100">
          <Container fluid>
            <div id="two-column-menu"></div>
            <ul className="navbar-nav" id="navbar-nav">
              <VerticalLayout />
            </ul>
          </Container>
        </SimpleBar>
      )}
    </Fragment>
  );
};

export default withTranslation()(TwoColumnLayout);
