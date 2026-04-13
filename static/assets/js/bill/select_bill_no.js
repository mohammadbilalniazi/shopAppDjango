async function selectBillNo() {
    const detailOrUpdate = document.getElementById("detail_or_update");
    if (!detailOrUpdate || detailOrUpdate.value === "1") return;

    const billType = document.getElementById("bill_type");
    const billNo = document.getElementById("bill_no");
    const organization = document.getElementById("organization");
    const billRcvrOrg = document.getElementById("bill_rcvr_org");

    if (!billType || !billNo || !organization || !billRcvrOrg) {
        console.error({billType, billNo, organization, billRcvrOrg});
        console.warn("Required elements not found");
        return;
    }

    const url = `/bill/select_bill_no/${organization.value}/${billRcvrOrg.value}/${billType.value}`;

    try {
        const response = await call_shirkat(url, "GET");
        console.log("selectBillNo response:", response);

        if ([200, 201].includes(response.status)) {
            billNo.value = response.data?.bill_no ?? "";
        }
    } catch (error) {
        console.error("Failed to fetch bill number:", error);
        billNo.value = "";
    }
}

/**
 * Attach change listeners to relevant bill fields.
 */
function bindBillNoAutoSelect() {
    const detailOrUpdate = document.getElementById("detail_or_update");
    if (!detailOrUpdate || detailOrUpdate.value === "1") return;

    const billType = document.getElementById("bill_type");
    const organization = document.getElementById("organization");
    const billRcvrOrg = document.getElementById("bill_rcvr_org");

    const updateBillNo = () => {
        if (billType && billType.value) {
            selectBillNo();
        }
    };

    [billType, organization, billRcvrOrg].forEach((element) => {
        if (element) {
            element.addEventListener("change", updateBillNo);
        }
    });
}

/**
 * Auto-trigger on page load
 */
document.addEventListener("DOMContentLoaded", () => {
    const detailOrUpdate = document.getElementById("detail_or_update");
    if (detailOrUpdate && detailOrUpdate.value !== "1") {
        selectBillNo();
        bindBillNoAutoSelect();
    }
});
