import { useState } from "react";
import classNames from "classnames";
import { Nav, NavItem, NavLink, TabContent } from "reactstrap";

type Props = {
  tabs: Array<{
    tab: string;
    title: string;
  }>;
  children: React.ReactNode;
};

const Tabs: React.FC<Props> = ({ tabs, children }) => {
  const [activeTab, setActiveTab] = useState<string>("1");

  const toggleTab = (tab: string) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };
  return (
    <div className="mt-3 mb-2">
      <Nav tabs className="nav-tabs-custom nav-success">
        {tabs.map((t) => (
          <NavItem key={t.tab}>
            <NavLink
              style={{
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "bolder",
              }}
              className={classNames({
                active: activeTab === t.tab,
              })}
              onClick={() => {
                toggleTab(t.tab);
              }}
            >
              {t.title}
            </NavLink>
          </NavItem>
        ))}
      </Nav>
      <TabContent activeTab={activeTab} className="p-1" id="nav-tabContent">
        {children}
      </TabContent>
    </div>
  );
};

export default Tabs;
