/* eslint-disable react-refresh/only-export-components */
import { useEffect, Fragment, useCallback, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Collapse } from "reactstrap";
// Import Data
import navdata from "../LayoutMenuData";
//i18n
import { withTranslation } from "react-i18next";
import { ObjectAny } from "../../types/base";
import { MenuItem } from "../../types/layout";
import usePermissionCheck from "../../hooks/sa/usePermissionCheck";
import MenuSearchInput from "../../Components/MenuSearchInput";
import { getFontStyle } from "../../utilities/utilFuncs2";

type Props = { 
  location?: ObjectAny;
  // eslint-disable-next-line no-unused-vars
  t: (str: string) => string;
  layoutType?: string;
};

const VerticalLayout: React.FC<Props> = (props) => {
  const { permissionExists } = usePermissionCheck();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => document.documentElement.getAttribute("data-sidebar-size") === "sm"
  );
  const location = useLocation();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const initialNavData: MenuItem[] = (navdata({}) as ObjectAny).props.children;
  const stableInitialNavData = useMemo(() => initialNavData, [initialNavData]);

  const [navData, setNavData] = useState<MenuItem[]>(initialNavData);

  useEffect(() => {
    // Only reset navData if searchTerm is empty and navData is not already at initial state
    if (
      !searchTerm &&
      JSON.stringify(navData) !== JSON.stringify(stableInitialNavData)
    ) {
      setNavData(stableInitialNavData);
    }
  }, [searchTerm, stableInitialNavData, navData]);

  useEffect(() => {
    const updateSidebarCollapsedState = () => {
      setIsSidebarCollapsed(
        document.documentElement.getAttribute("data-sidebar-size") === "sm"
      );
    };

    updateSidebarCollapsedState();

    const observer = new MutationObserver(updateSidebarCollapsedState);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-sidebar-size"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isSidebarCollapsed && searchTerm) {
      setSearchTerm("");
      setNavData(stableInitialNavData);
    }
  }, [isSidebarCollapsed, searchTerm, stableInitialNavData]);

  function handleChangeSearchMenu(ter: string) {
    setSearchTerm(ter);
    // Recursive function to filter navigation tree
    const filterNavData = (items: MenuItem[]): MenuItem[] => {
      return items
        .map((item) => {
          // Check if the current item's label matches the search term
          const labelMatches = item.label
            .toLowerCase()
            .includes(ter.toLowerCase());
          // Recursively filter subItems/childItems
          const childKey = item.subItems
            ? "subItems"
            : item.childItems
            ? "childItems"
            : null;
          const filteredChildren = childKey
            ? filterNavData(item[childKey])
            : [];
          // Include the current item if it matches or if any children match
          if (labelMatches || filteredChildren.length > 0) {
            return {
              ...item,
              ...(childKey !== null && { [childKey]: filteredChildren }), // Ensure childKey is valid
            };
          }
          // Exclude items that don't match the search term and have no matching children
          return null;
        })
        .filter(Boolean) as MenuItem[]; // Remove null values
    };

    const updatedNavData = filterNavData(initialNavData);
    setNavData(updatedNavData);
  }

  const hideShouwMenu = useCallback(
    (item: MenuItem) => {
      const userType = localStorage.getItem("userType");
      if (userType == "SUPERADMIN") {
        return true;
      }
      let permToAnyChildOrItemItself = false;
      if (item.id == "Dashboard") {
        return true;
      }
      if (item.isChildItem || item.isSubItem) {
        if (item?.subItems?.length > 0 && item.isSubItem) {
          // if sub item then we need to check if it has child or not
          (item?.subItems ?? []).forEach((subItem) => {
            if (!permToAnyChildOrItemItself && subItem.isChildItem) {
              permToAnyChildOrItemItself = subItem.childItems.some(
                (childItem) => permissionExists(childItem.id)
              ); 
            } else if (!permToAnyChildOrItemItself) {
              permToAnyChildOrItemItself = permissionExists(subItem.id);
            }
          });
        } else if (item?.childItems?.length > 0 && item.isChildItem) {
          permToAnyChildOrItemItself = item.childItems.some((childItem) =>
            permissionExists(childItem.id)
          );
        }
      } else {
        permToAnyChildOrItemItself = permissionExists(item.id); 
      }
      return permToAnyChildOrItemItself;
    },
    [permissionExists]
  );
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
    if (props.layoutType === "vertical") {
      initMenu();
    }
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
          .closest(".collapse")
          ?.classList.add("show");
        if (
          parentCollapseDiv.parentElement.closest(".collapse")
            ?.previousElementSibling
        )
          parentCollapseDiv.parentElement
            .closest(".collapse")
            ?.previousElementSibling?.classList.add("active");
        if (
          parentCollapseDiv.parentElement
            .closest(".collapse")
            ?.previousElementSibling?.closest(".collapse")
        ) {
          parentCollapseDiv.parentElement
            .closest(".collapse")
            ?.previousElementSibling?.closest(".collapse")
            ?.classList.add("show");
          parentCollapseDiv.parentElement
            .closest(".collapse")
            ?.previousElementSibling?.closest(".collapse")
            ?.previousElementSibling?.classList.add("active");
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
  const language =localStorage.getItem("I18N_LANGUAGE")??"";
  return (
    <Fragment key="verticallayout-key" >
      {/* menu Items */}
      {!isSidebarCollapsed && (
        <MenuSearchInput
          className="navbar-search"
          searchTerm={searchTerm}
          handleChangeSearchMenu={handleChangeSearchMenu}
          key="menu-search-input"
        />
      )}
      {(navData || []).map((item, index) =>
        hideShouwMenu(item) ? (
          <div key={`${item.id}-${index}`}   style={getFontStyle(language)}>
            {/* Main Header */}
            {item.isHeader ? (
              <li className="menu-title" key={`${item.id}-header`}>
                <span data-key="t-menu">{props.t(item.label)}</span>
              </li>
            ) : item.subItems ? (
              <li className="nav-item" key={`${item.id}-nav-item`}>
                <Link
                  onClick={item.click}
                  className="nav-link menu-link"
                  to={item.link ?? "/#"}
                  data-bs-toggle="collapse"
                >
                  <i className={item.icon}></i>{" "}
                  <span data-key="t-apps">{props.t(item.label)}</span>
                </Link>
                <Collapse
                  className="menu-dropdown"
                  isOpen={searchTerm !== "" ? true : !!item.stateVariables}
                  id="sidebarApps"
                >
                  <ul className="nav nav-sm flex-column test">
                    {item.subItems.map(
                      (subItem) =>
                        hideShouwMenu(subItem) && (
                          <Fragment key={subItem.id}>
                            <div id={subItem.id} style={{ display: "block" }}>
                              {!subItem.isChildItem ? (
                                <li className="nav-item" key={`${subItem.id}-li`}>
                                  <Link
                                    to={subItem.link ?? "/#"}
                                    className="nav-link"
                                  >
                                    {props.t(subItem.label)}
                                    {subItem.badgeName && (
                                      <span
                                        className={`badge badge-pill bg-${subItem.badgeColor}`}
                                        data-key="t-new"
                                      >
                                        {subItem.badgeName}
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              ) : (
                                <li className="nav-item" key={`${subItem.id}-child-li`}>
                                  <Link
                                    onClick={subItem.click}
                                    className="nav-link"
                                    to={subItem.link ?? "/#"}
                                    data-bs-toggle="collapse"
                                  >
                                    {props.t(subItem.label)}
                                  </Link>
                                  <Collapse
                                    className="menu-dropdown"
                                    isOpen={
                                      searchTerm !== ""
                                        ? true
                                        : !!subItem.stateVariables
                                    }
                                    id="sidebarEcommerce"
                                  >
                                    <ul className="nav nav-sm flex-column">
                                      {subItem.childItems?.map(
                                        (childItem) =>
                                          hideShouwMenu(childItem) && (
                                            <Fragment key={childItem.id}>
                                              {!childItem.childItems ? (
                                                <li
                                                  className="nav-item"
                                                  key={`${childItem.id}-li`}
                                                >
                                                  <Link
                                                    to={childItem.link ?? "/#"}
                                                    className="nav-link"
                                                  >
                                                    {props.t(childItem.label)}
                                                  </Link>
                                                </li>
                                              ) : (
                                                <li
                                                  className="nav-item"
                                                  key={`${childItem.id}-child-li`}
                                                >
                                                  <Link
                                                    to="/#"
                                                    className="nav-link"
                                                    onClick={childItem.click}
                                                    data-bs-toggle="collapse"
                                                  >
                                                    {props.t(childItem.label)}
                                                  </Link>
                                                  <Collapse
                                                    className="menu-dropdown"
                                                    isOpen={
                                                      searchTerm !== ""
                                                        ? true
                                                        : !!childItem.stateVariables
                                                    }
                                                    id="sidebaremailTemplates"
                                                  >
                                                    <ul className="nav nav-sm flex-column">
                                                      {childItem.childItems.map(
                                                        (subChildItem) => (
                                                          <li
                                                            className="nav-item"
                                                            key={subChildItem.id}
                                                          >
                                                            <Link
                                                              to={subChildItem.link}
                                                              className="nav-link"
                                                              data-key="t-basic-action"
                                                            >
                                                              {props.t(
                                                                subChildItem.label
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
                            </div>
                          </Fragment>
                        )
                    )}
                  </ul>
                </Collapse>
              </li>
            ) : (
              <li className="nav-item" key={`${item.id}-nav-simple`}>
                <Link
                  className="nav-link menu-link"
                  to={item.link ?? "/#"}
                >
                  <i className={item.icon}></i>{" "}
                  <span>{props.t(item.label)}</span>
                </Link>
              </li>
            )}
          </div>
        ) : null
      )}
    </Fragment>
  );
};

export default withTranslation()(VerticalLayout);
