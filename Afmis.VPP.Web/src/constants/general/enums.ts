import { t } from "i18next";

export const avcTypeEnums = [
  { value: "DEDUCTION", label: t("DEDUCTION") },
  { value: "REMUNIRATION", label: t("REMUNIRATION") },
];

export const orgWorkTypeEnum = [
  { value: "NTA", label: t("NTA") },
  { value: "DEVELOPMENTBUDGETCONTRACTORS", label: t("DEVELOPMENTBUDGETCONTRACTORS") },
  { value: "STUDENTEMPLOYEES", label: t("STUDENTEMPLOYEES") },
  { value: "OTHER", label: t("OTHER") },
]; 

export const civilianMilitaryEnums = [
  { value: "MILITARY", label: t("MILITARY") },
  { value: "CIVILIAN", label: t("CIVILIAN") },
];

export const programTypeEnums = [
  { value: "PROGRAM1", label: t("PROGRAM1") },
  { value: "PROGRAM2", label: t("PROGRAM2") },
];

export const schoolTypeEnums = [
  { value: "SCHOOLTYPE1", label: t("SCHOOLTYPE1") },
  { value: "SCHOOLTYPE2", label: t("SCHOOLTYPE2") },
];

export const projectFundTypeEnums = [
  { value: "NOT_APPLICABLE", label: t("NOT_APPLICABLE") },
  { value: "CONTRACTS", label: t("CONTRACTS") },
  { value: "OPERATION_COST", label: t("OPERATION_COST") },
  { value: "UTILITIES", label: t("UTILITIES") },
  { value: "FOOD", label: t("FOOD") },
  { value: "MAINTENANCE", label: t("MAINTENANCE") },
];
