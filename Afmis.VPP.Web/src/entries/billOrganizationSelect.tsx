import React from "react";
import ReactDOM from "react-dom/client";
import BillOrganizationSelect from "../pages/bill/components/BillOrganizationSelect";
import "./billOrganizationSelect.scss";

const mountBillOrganizationSelects = () => {
  const selects = Array.from(
    document.querySelectorAll<HTMLSelectElement>(
      'select[data-react-organization-select="true"]',
    ),
  );

  selects.forEach((selectElement) => {
    if (selectElement.dataset.reactMounted === "true") {
      return;
    }

    selectElement.dataset.reactMounted = "true";
    selectElement.classList.add("afmis-native-select-hidden");

    const mountPoint = document.createElement("div");
    mountPoint.className = "afmis-react-select-mount";
    selectElement.insertAdjacentElement("afterend", mountPoint);

    ReactDOM.createRoot(mountPoint).render(
      <React.StrictMode>
        <BillOrganizationSelect selectElement={selectElement} />
      </React.StrictMode>,
    );
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountBillOrganizationSelects);
} else {
  mountBillOrganizationSelects();
}

window.addEventListener("pageshow", mountBillOrganizationSelects);
