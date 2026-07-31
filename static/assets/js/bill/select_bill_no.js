async function selectBillNo() {
    const detailOrUpdate = document.getElementById("detail_or_update");
    if (!detailOrUpdate || detailOrUpdate.value === "1") return;

    const billType = document.getElementById("bill_type");
    const billNo = document.getElementById("bill_no");
    const organization = document.getElementById("organization");
    const billRcvrOrg = document.getElementById("bill_rcvr_org");
    const isLossDegrade = billType && billType.value === "LOSSDEGRADE";

    if (!billType || !billNo || !organization || (!billRcvrOrg && !isLossDegrade)) {
        console.warn("Bill number auto-select skipped: required elements not found", {
            billType,
            billNo,
            organization,
            billRcvrOrg,
        });
        return;
    }

    if (!organization.value) return;

    const receiverOrgId = isLossDegrade ? "0" : billRcvrOrg.value;
    if (!receiverOrgId && !isLossDegrade) return;

    const url = `/bill/select_bill_no/${organization.value}/${receiverOrgId}/${billType.value}`;

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

window.selectBillNo = selectBillNo;
window.select_bill_no = selectBillNo;

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
