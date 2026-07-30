/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
// import { Navigate } from "react-router-dom";

import routes from "./routes";
import PageLoader from "../Components/PageLoader";
import PageLayout from "../Layouts/PageLayout";
const PasswordResetForm = lazy(
  () => import("../pages/authentication/PasswordResetForm")
);
const Login = lazy(
  () => import("../pages/authentication/Login")
);

const BasicSignIn = lazy(
  () => import("../pages/AuthenticationInner/Login/BasicSignIn")
);

const CoverSignIn = lazy(
  () => import("../pages/AuthenticationInner/Login/CoverSignIn")
);
const BasicSignUp = lazy(
  () => import("../pages/AuthenticationInner/Register/BasicSignUp")
);
const CoverSignUp = lazy(
  () => import("../pages/AuthenticationInner/Register/CoverSignUp")
);
// const BasicPasswReset = lazy(
//   () => import("../pages/AuthenticationInner/PasswordReset/BasicPasswReset")
// );
const PasswordResetFormForgetPassword = lazy(
  () => import("../pages/authentication/PasswordResetFormForgetPassword")
);
const CoverPasswReset = lazy(
  () => import("../pages/AuthenticationInner/PasswordReset/CoverPasswReset")
);
const BasicLockScreen = lazy(
  () => import("../pages/AuthenticationInner/LockScreen/BasicLockScr")
);
const CoverLockScreen = lazy(
  () => import("../pages/AuthenticationInner/LockScreen/CoverLockScr")
);
const BasicLogout = lazy(
  () => import("../pages/AuthenticationInner/Logout/BasicLogout")
);
const CoverLogout = lazy(
  () => import("../pages/AuthenticationInner/Logout/CoverLogout")
);
const BasicSuccessMsg = lazy(
  () => import("../pages/AuthenticationInner/SuccessMessage/BasicSuccessMsg")
);
const CoverSuccessMsg = lazy(
  () => import("../pages/AuthenticationInner/SuccessMessage/CoverSuccessMsg")
);
const BasicTwosVerify = lazy(
  () =>
    import("../pages/AuthenticationInner/TwoStepVerification/BasicTwosVerify")
);
const CoverTwosVerify = lazy(
  () =>
    import("../pages/AuthenticationInner/TwoStepVerification/CoverTwosVerify")
);
const Basic404 = lazy(
  () => import("../pages/AuthenticationInner/Errors/Basic404")
);
const Cover404 = lazy(
  () => import("../pages/AuthenticationInner/Errors/Cover404")
);
const Alt404 = lazy(() => import("../pages/AuthenticationInner/Errors/Alt404"));
const Error500 = lazy(
  () => import("../pages/AuthenticationInner/Errors/Error500")
);

// const BasicPasswCreate = lazy(
//   () => import("../pages/AuthenticationInner/PasswordCreate/BasicPasswCreate")
// );
const CoverPasswCreate = lazy(
  () => import("../pages/AuthenticationInner/PasswordCreate/CoverPasswCreate")
);
const Offlinepage = lazy(
  () => import("../pages/AuthenticationInner/Errors/Offlinepage")
);

const HomePage = lazy(() => import("../pages/ihsaya/Home"));

const DashbordPage = lazy(() => import("../pages/dashboard"));
const AnalyticReport = lazy(() => import("../pages/dashboard/analyticReport"));
const HeadCountDashboardPage = lazy(() => import("../pages/dashboard/martyreDisableLawyerDashboard"));
//login
// const Login = lazy(() => import( "../pages/Authentication/Login"));
const ForgetPasswordPage = lazy(
  () => import("../pages/authentication/ForgetPassword")
);
const Logout = lazy(() => import("../pages/authentication/Logout"));

// 1  General
// 1.1 common-entities

// 1.1.3 Department
const DepartmentsSearch = lazy(
  () => import("../pages/general/ce/Departments/Search")
);
const DepartmentsSearchResult = lazy(
  () => import("../pages/general/ce/Departments/SearchResults")
);
const DepartmentInsert = lazy(
  () => import("../pages/general/ce/Departments/Insert")
);
const DepartmentDetail = lazy(
  () => import("../pages/general/ce/Departments/Detail")
);

// 1.1.5 InstitutionType
const InstitutionTypesSearch = lazy(
  () => import("../pages/general/ce/InstitutionTypes/Search")
);
const InstitutionTypesSearchResult = lazy(
  () => import("../pages/general/ce/InstitutionTypes/SearchResults")
);
const InstitutionTypeInsert = lazy(
  () => import("../pages/general/ce/InstitutionTypes/Insert")
);
const InstitutionTypeDetail = lazy(
  () => import("../pages/general/ce/InstitutionTypes/Detail")
);

// 1.1.6 Institution
const InstitutionsSearch = lazy(
  () => import("../pages/general/ce/Institutions/Search")
);
const InstitutionsSearchResult = lazy(
  () => import("../pages/general/ce/Institutions/SearchResults")
);
const InstitutionInsert = lazy(
  () => import("../pages/general/ce/Institutions/Insert")
);
const InstitutionDetail = lazy(
  () => import("../pages/general/ce/Institutions/Detail")
);

// 1.1.7 FiscalYear
const FiscalYearsSearch = lazy(
  () => import("../pages/general/ce/FiscalYears/Search")
);
const FiscalYearsSearchResult = lazy(
  () => import("../pages/general/ce/FiscalYears/SearchResults")
);
const FiscalYearInsert = lazy(
  () => import("../pages/general/ce/FiscalYears/Insert")
);
const FiscalYearDetail = lazy(
  () => import("../pages/general/ce/FiscalYears/Detail")
);

// 1.1.8 FiscalMonth
const FiscalMonthsSearch = lazy(
  () => import("../pages/general/ce/FiscalMonths/Search")
);
const FiscalMonthsSearchResult = lazy(
  () => import("../pages/general/ce/FiscalMonths/SearchResults")
);
const FiscalMonthInsert = lazy(
  () => import("../pages/general/ce/FiscalMonths/Insert")
);
const FiscalMonthDetail = lazy(
  () => import("../pages/general/ce/FiscalMonths/Detail")
);

// 1.1.8 Deduction Vendor
const AVCAccountsSearch = lazy(
  () => import("../pages/general/ce/AVCAccounts/Search")
);
const AVCAccountsSearchResult = lazy(
  () => import("../pages/general/ce/AVCAccounts/SearchResults")
);
const AVCAccountInsert = lazy(
  () => import("../pages/general/ce/AVCAccounts/Insert")
);
const AVCAccountDetail = lazy(
  () => import("../pages/general/ce/AVCAccounts/Detail")
);

//1.1.9 Address
const AddressesSearch = lazy(
  () => import("../pages/general/ce/Addresses/Search")
);
const AddressesSearchResult = lazy(
  () => import("../pages/general/ce/Addresses/SearchResults")
);

const AddressInsert = lazy(
  () => import("../pages/general/ce/Addresses/Insert")
);
const AddressDetail = lazy(
  () => import("../pages/general/ce/Addresses/Detail")
);

// 1.1.10 Fund
const FundsSearch = lazy(() => import("../pages/general/ce/Funds/Search"));
const FundsSearchResult = lazy(
  () => import("../pages/general/ce/Funds/SearchResults")
);
const FundInsert = lazy(() => import("../pages/general/ce/Funds/Insert"));
const FundDetail = lazy(() => import("../pages/general/ce/Funds/Detail"));

// 1.1.11 ProjectFund
const ProjectFundsSearch = lazy(
  () => import("../pages/general/ce/ProjectFunds/Search")
);
const ProjectFundsSearchResult = lazy(
  () => import("../pages/general/ce/ProjectFunds/SearchResults")
);
const ProjectFundInsert = lazy(
  () => import("../pages/general/ce/ProjectFunds/Insert")
);
const ProjectFundDetail = lazy(
  () => import("../pages/general/ce/ProjectFunds/Detail")
);

// 1.1.12 MoeInstitution
const MoeInstitutionsSearch = lazy(
  () => import("../pages/general/ce/MoeInstitutions/Search")
);
const MoeInstitutionsSearchResult = lazy(
  () => import("../pages/general/ce/MoeInstitutions/SearchResults")
);
const MoeInstitutionInsert = lazy(
  () => import("../pages/general/ce/MoeInstitutions/Insert")
);
const MoeInstitutionDetail = lazy(
  () => import("../pages/general/ce/MoeInstitutions/Detail")
);

// 1.1.13 InstitutionAccessRemuniration
const InstitutionAccessRemunirationsSearch = lazy(
  () => import("../pages/general/ce/InstitutionAccessRemunirations/Search")
);
const InstitutionAccessRemunirationsSearchResult = lazy(
  () =>
    import("../pages/general/ce/InstitutionAccessRemunirations/SearchResults")
);
const InstitutionAccessRemunirationInsert = lazy(
  () => import("../pages/general/ce/InstitutionAccessRemunirations/Insert")
);
const InstitutionAccessRemunirationDetail = lazy(
  () => import("../pages/general/ce/InstitutionAccessRemunirations/Detail")
);


// 1.1.14 Institution Remuniration Details
const InstitutionRemunirationDetailsSearch = lazy(
  () => import("../pages/general/ce/InstitutionRemunirationDetails/Search")
);
const InstitutionRemunirationDetailsSearchResult = lazy(
  () =>
    import("../pages/general/ce/InstitutionRemunirationDetails/SearchResults")
);
const InstitutionRemunirationDetailInsert = lazy(
  () => import("../pages/general/ce/InstitutionRemunirationDetails/Insert")
);
const InstitutionRemunirationDetailDetail = lazy(
  () => import("../pages/general/ce/InstitutionRemunirationDetails/Detail")
);


// 1.1.14 Institution Remuniration Details
const AllowedETazkiraInstitutionsSearch = lazy(
  () => import("../pages/general/ce/AllowedETazkiraInstitutions/Search")
);
const AllowedETazkiraInstitutionsSearchResult = lazy(
  () =>
    import("../pages/general/ce/AllowedETazkiraInstitutions/SearchResults")
);
const AllowedETazkiraInstitutionInsert = lazy(
  () => import("../pages/general/ce/AllowedETazkiraInstitutions/Insert")
);
const AllowedETazkiraInstitutionDetail = lazy(
  () => import("../pages/general/ce/AllowedETazkiraInstitutions/Detail")
);

// 1.1.15 Training
const TrainingsSearch = lazy(
  () => import("../pages/general/ce/Trainings/Search")
);
const TrainingsSearchResult = lazy(
  () => import("../pages/general/ce/Trainings/SearchResults")
);
const TrainingInsert = lazy(
  () => import("../pages/general/ce/Trainings/Insert")
);



//2 ARA
// 2.1 Employee
// 2.1.1 Employee
const EmployeesSearch = lazy(
  () => import("../pages/ara/Employee/Employees/Search")
);
const EmployeesSearchResult = lazy(
  () => import("../pages/ara/Employee/Employees/SearchResults")
);
const EmployeeInsert = lazy(
  () => import("../pages/ara/Employee/Employees/Insert")
);
const EmployeeDetail = lazy(
  () => import("../pages/ara/Employee/Employees/Detail")
);
// 2.1.1 Tazkira Verification
const TazkiraVerificationSearch = lazy(
  () => import("../pages/ara/Employee/TazkiraVerification/Search")
);
const TazkiraVerificationSearchResult = lazy(
  () => import("../pages/ara/Employee/TazkiraVerification/SearchResults")
);

const TazkiraVerificationDetail = lazy(
  () => import("../pages/ara/Employee/TazkiraVerification/Detail")
);
// 2.1.1 Bank Verification
const BankVerificationSearch = lazy(
  () => import("../pages/ara/Employee/BankVerification/Search")
);

const BankVerificationSearchResult = lazy(
  () => import("../pages/ara/Employee/BankVerification/SearchResults")
);

// 2.1.2 Deleted Employee
const DelEmployeesSearch = lazy(
  () => import("../pages/ara/Employee/DelEmployees/Search")
);
const DelEmployeesSearchResult = lazy(
  () => import("../pages/ara/Employee/DelEmployees/SearchResults")
);

// 2.1.3 Employee Job Titles
const EmpJobTitlesSearch = lazy(
  () => import("../pages/ara/Employee/EmpJobTitles/Search")
);
const EmpJobTitlesSearchResult = lazy(
  () => import("../pages/ara/Employee/EmpJobTitles/SearchResults")
);
const EmpJobTitleInsert = lazy(
  () => import("../pages/ara/Employee/EmpJobTitles/Insert")
);
const EmpJobTitleDetail = lazy(
  () => import("../pages/ara/Employee/EmpJobTitles/Detail")
);

// 2.1.4 Employee Status
const EmpStatusesSearch = lazy(
  () => import("../pages/ara/Employee/EmpStatuses/Search")
);
const EmpStatusesSearchResult = lazy(
  () => import("../pages/ara/Employee/EmpStatuses/SearchResults")
);
const EmpStatusInsert = lazy(
  () => import("../pages/ara/Employee/EmpStatuses/Insert")
);
const EmpStatusDetail = lazy(
  () => import("../pages/ara/Employee/EmpStatuses/Detail")
);
// 2.1.5 Employee Types
const EmpTypesSearch = lazy(
  () => import("../pages/ara/Employee/EmpTypes/Search")
);
const EmpTypesSearchResult = lazy(
  () => import("../pages/ara/Employee/EmpTypes/SearchResults")
);
const EmpTypeInsert = lazy(
  () => import("../pages/ara/Employee/EmpTypes/Insert")
);
const EmpTypeDetail = lazy(
  () => import("../pages/ara/Employee/EmpTypes/Detail")
);

// 2.1.6 Employee Education Levels
const EmpEduLevelsSearch = lazy(
  () => import("../pages/ara/Employee/EmpEduLevels/Search")
);
const EmpEduLevelsSearchResult = lazy(
  () => import("../pages/ara/Employee/EmpEduLevels/SearchResults")
);
const EmpEduLevelInsert = lazy(
  () => import("../pages/ara/Employee/EmpEduLevels/Insert")
);
const EmpEduLevelDetail = lazy(
  () => import("../pages/ara/Employee/EmpEduLevels/Detail")
);

// 2.1.7 Martyre Disables
const MartyreDisablesSearch = lazy(
  () => import("../pages/ara/Employee/MartyreDisables/Search")
);
const MartyreDisablesSearchResult = lazy(
  () => import("../pages/ara/Employee/MartyreDisables/SearchResults")
);
const MartyreDisableInsert = lazy(
  () => import("../pages/ara/Employee/MartyreDisables/Insert")
);
const MartyreDisableDetail = lazy(
  () => import("../pages/ara/Employee/MartyreDisables/Detail")
);



// 2.1.11 Martyre Disable Lawyers
const MartyreDisableLawyersSearch = lazy(
  () => import("../pages/ara/Employee/MartyreDisableLawyers/Search")
);
const MartyreDisableLawyersSearchResult = lazy(
  () => import("../pages/ara/Employee/MartyreDisableLawyers/SearchResults")
);
const MartyreDisableLawyerInsert = lazy(
  () => import("../pages/ara/Employee/MartyreDisableLawyers/Insert")
);
const MartyreDisableLawyerDetail = lazy(
  () => import("../pages/ara/Employee/MartyreDisableLawyers/Detail")
);

// 2.1.12 Employee Account Numbers
const EmpAccountNumbersSearch = lazy(
  () => import("../pages/ara/Employee/EmpAccountNumbers/Search")
);
const EmpAccountNumbersSearchResult = lazy(
  () => import("../pages/ara/Employee/EmpAccountNumbers/SearchResults")
);
const EmpAccountNumberInsert = lazy(
  () => import("../pages/ara/Employee/EmpAccountNumbers/Insert")
);
const EmpAccountNumberDetail = lazy(
  () => import("../pages/ara/Employee/EmpAccountNumbers/Detail")
);
const EmpAccountNumbersBankLetter = lazy(() => import("../pages/ara/Employee/EmpAccountNumbers/BankAccountLetter/index"));

// 2.1.12 Bank Employee 
const BankEmployeesReconciliationSearch = lazy(
  () => import("../pages/cba/BankEmployeesReconciliation/Search")
);
const BankEmployeesReconciliationInsert = lazy(
  () => import("../pages/cba/BankEmployeesReconciliation/Insert")
);
const BankEmployeesReconciliationDetail = lazy(
  () => import("../pages/cba/BankEmployeesReconciliation/Detail")
);
const BankEmployeesReconciliationsSearchResult = lazy(
  () => import("../pages/cba/BankEmployeesReconciliation/SearchResults")
);

const ReconcileBankEmployee = lazy(
  () => import("../pages/cba/BankEmployeesReconciliation/ReconcileBankEmployee")
);
const ReconcileEmployeesFromDatabase = lazy(() => import("../pages/cba/BankEmployeesReconciliation/ReconcileEmployeesFromDB"))
const ImportBankEmployee = lazy(
  () => import("../pages/cba/BankEmployeesReconciliation/ImportBankEmployee")
);

// 2.1.13 Employee Account Numbers
const EmpEarningSearch = lazy(
  () => import("../pages/ara/Employee/EmpEarning/Search")
);

const EmpEarningsSearchResult = lazy(
  () => import("../pages/ara/Employee/EmpEarning/SearchResults")
);

// 2.1.14 Employee Type Details
const EmpTypeDetailsSearch = lazy(
  () => import("../pages/ara/Employee/EmpTypeDetails/Search")
);
const EmpTypeDetailsSearchResult = lazy(
  () => import("../pages/ara/Employee/EmpTypeDetails/SearchResults")
);
const EmpTypeDetailInsert = lazy(
  () => import("../pages/ara/Employee/EmpTypeDetails/Insert")
);
const EmpTypeDetailDetail = lazy(
  () => import("../pages/ara/Employee/EmpTypeDetails/Detail")
);
// 2.2 Head Count
// 2.2.1 Head Count
const HeadCountsSearch = lazy(
  () => import("../pages/ara/HeadCount/HeadCounts/Search")
);
const HeadCountsSearchResult = lazy(
  () => import("../pages/ara/HeadCount/HeadCounts/SearchResults")
);
const HeadCountInsert = lazy(
  () => import("../pages/ara/HeadCount/HeadCounts/Insert")
);
const HeadCountDetail = lazy(() => import("../pages/ara/HeadCount/HeadCounts/Detail"))
// 2.2.1 HeadCountTotalAndRemunirations
const HeadCountTotalAndRemunirationSearch = lazy(
  () => import("../pages/ara/HeadCount/HeadCountTotalAndRemunirations/Search")
);
const HeadCountTotalAndRemunirationsSearchResult = lazy(
  () => import("../pages/ara/HeadCount/HeadCountTotalAndRemunirations/SearchResults")
);
const HeadCountTotalAndRemunirationInsert = lazy(
  () => import("../pages/ara/HeadCount/HeadCountTotalAndRemunirations/Insert")
);
const HeadCountTotalAndRemunirationDetail = lazy(() => import("../pages/ara/HeadCount/HeadCountTotalAndRemunirations/Detail"));
// 2.2.2 Organization
const OrganizationsSearch = lazy(
  () => import("../pages/ara/HeadCount/Organizations/Search")
);
const OrganizationsSearchResult = lazy(
  () => import("../pages/ara/HeadCount/Organizations/SearchResults")
);
const OrganizationInsert = lazy(
  () => import("../pages/ara/HeadCount/Organizations/Insert")
);
const OrganizationDetail = lazy(
  () => import("../pages/ara/HeadCount/Organizations/Detail")
);
// 2.2.3 Head Count Detail
const HeadCountDetailsSearch = lazy(
  () => import("../pages/ara/HeadCount/HeadCountDetails/Search")
);
const HeadCountDetailsSearchResult = lazy(
  () => import("../pages/ara/HeadCount/HeadCountDetails/SearchResults")
);
const HeadCountDetailInsert = lazy(
  () => import("../pages/ara/HeadCount/HeadCountDetails/Insert")
);
const HeadCountDetailDetail = lazy(
  () => import("../pages/ara/HeadCount/HeadCountDetails/Detail")
);

// 2.3 Yatheem
// 2.3.1 Yatheem Registration
const YatheemRegistrationsSearch = lazy(
  () => import("../pages/ara/Yatheem/YatheemRegistrations/Search")
);
const YatheemRegistrationsSearchResult = lazy(
  () => import("../pages/ara/Yatheem/YatheemRegistrations/SearchResults")
);
const YatheemRegistrationInsert = lazy(
  () => import("../pages/ara/Yatheem/YatheemRegistrations/Insert")
);
const YatheemRegistrationDetail = lazy(
  () => import("../pages/ara/Yatheem/YatheemRegistrations/Detail")
);
//3 CBA
//3.1 Bank Contact
const BankContactSearch = lazy(
  () => import("../pages/cba/BankContacts/Search")
);
const BankContactSearchResult = lazy(
  () => import("../pages/cba/BankContacts/SearchResults")
);
const BankContactInsert = lazy(
  () => import("../pages/cba/BankContacts/Insert")
);
const BankContactDetail = lazy(
  () => import("../pages/cba/BankContacts/Detail")
);

//3.1 Bank
const BankSearch = lazy(() => import("../pages/cba/Banks/Search"));
const BankSearchResult = lazy(() => import("../pages/cba/Banks/SearchResults"));
const BankInsert = lazy(() => import("../pages/cba/Banks/Insert"));
const BankDetail = lazy(() => import("../pages/cba/Banks/Detail"));

//3.4 PaymentType
const PaymentTypeSearch = lazy(
  () => import("../pages/cba/PaymentTypes/Search")
);
const PaymentTypeSearchResult = lazy(
  () => import("../pages/cba/PaymentTypes/SearchResults")
);
const PaymentTypeInsert = lazy(
  () => import("../pages/cba/PaymentTypes/Insert")
);
const PaymentTypeDetail = lazy(
  () => import("../pages/cba/PaymentTypes/Detail")
);

//3.5 Payment
const PaymentSearch = lazy(() => import("../pages/cba/Payments/Search"));
const PaymentSearchResult = lazy(
  () => import("../pages/cba/Payments/SearchResults")
);
const PaymentInsert = lazy(() => import("../pages/cba/Payments/Insert"));
const PaymentDetail = lazy(() => import("../pages/cba/Payments/Detail"));

//3.6 Account Number
const AccountNumberSearch = lazy(
  () => import("../pages/cba/AccountNumbers/Search")
);
const AccountNumberSearchResult = lazy(
  () => import("../pages/cba/AccountNumbers/SearchResults")
);
const AccountNumberInsert = lazy(
  () => import("../pages/cba/AccountNumbers/Insert")
);
const AccountNumberDetail = lazy(
  () => import("../pages/cba/AccountNumbers/Detail")
);


//5 Filing
//5.1 Filing
const FilingSearch = lazy(() => import("../pages/filing/Filings/Search"));
const FilingSearchResult = lazy(
  () => import("../pages/filing/Filings/SearchResults")
);
const FilingInsert = lazy(() => import("../pages/filing/Filings/Insert"));
const FilingDetail = lazy(() => import("../pages/filing/Filings/Detail"));
//5.2 Letter
const LetterSearch = lazy(() => import("../pages/filing/Letters/Search"));
const LetterSearchResult = lazy(
  () => import("../pages/filing/Letters/SearchResults")
);
const LetterInsert = lazy(() => import("../pages/filing/Letters/Insert"));
const LetterDetail = lazy(() => import("../pages/filing/Letters/Detail"));

//5.3 FileType
const FileTypeSearch = lazy(() => import("../pages/filing/FileTypes/Search"));
const FileTypeSearchResult = lazy(
  () => import("../pages/filing/FileTypes/SearchResults")
);
const FileTypeInsert = lazy(() => import("../pages/filing/FileTypes/Insert"));
const FileTypeDetail = lazy(() => import("../pages/filing/FileTypes/Detail"));

// 6 Sa
// 6.1 Sa User Management
// 6.1.1 Sa User
const UsersSearch = lazy(
  () => import("../pages/sa/userManagement/Users/Search")
);
const UsersSearchResult = lazy(
  () => import("../pages/sa/userManagement/Users/SearchResults")
);

const UserLogsSearchResult = lazy(
  () => import("../pages/sa/userManagement/LoginLogs/SearchResultUserLog")
);
const UserLogsSearch = lazy(
  () => import("../pages/sa/userManagement/LoginLogs/Search")
);
const UserLogsDetail = lazy(
  () => import("../pages/sa/userManagement/LoginLogs/Detail")
);
const InvalidAccountsSearchResult = lazy(
  () => import("../pages/sa/userManagement/Users/SearchResultInvalidAccounts")
);
const UserInsert = lazy(
  () => import("../pages/sa/userManagement/Users/Insert")
);
const UserDetail = lazy(
  () => import("../pages/sa/userManagement/Users/Detail")
);

const Profile = lazy(() => import("../pages/sa/userManagement/Users/Profile"));
// 6.1.2 Sa Role
const UserRolesSearch = lazy(
  () => import("../pages/sa/userManagement/Roles/Search")
);
const UserRolesSearchResult = lazy(
  () => import("../pages/sa/userManagement/Roles/SearchResults")
);
const UserRoleInsert = lazy(
  () => import("../pages/sa/userManagement/Roles/Insert")
);
const UserRoleDetail = lazy(
  () => import("../pages/sa/userManagement/Roles/Detail")
);


// 6.1.4 Sa Permission
const UserPermissionsSearch = lazy(
  () => import("../pages/sa/userManagement/Permissions/Search")
);
const UserPermissionsSearchResult = lazy(
  () => import("../pages/sa/userManagement/Permissions/SearchResults")
);
const UserModulePermissionsSearchResult = lazy(
  () => import("../pages/sa/userManagement/Permissions/ModulePermissionTable")
);
const UserPermissionInsert = lazy(
  () => import("../pages/sa/userManagement/Permissions/Insert")
);
const UserPermissionDetail = lazy(
  () => import("../pages/sa/userManagement/Permissions/Detail")
);

// 6.1.5 sa Module
const UserModulesSearch = lazy(
  () => import("../pages/sa/userManagement/Modules/Search")
);
const UserModulesSearchResult = lazy(
  () => import("../pages/sa/userManagement/Modules/SearchResults")
);
const UserModuleInsert = lazy(
  () => import("../pages/sa/userManagement/Modules/Insert")
);
const UserModuleDetail = lazy(
  () => import("../pages/sa/userManagement/Modules/Detail")
);
// 7 Payroll
// 7.1 Remuniration

//7.1.1 Remuniartion Types

const RemunirationTypesSearch = lazy(
  () => import("../pages/payroll/remuniration/RemunirationTypes/Search")
);
const RemunirationTypesSearchResult = lazy(
  () => import("../pages/payroll/remuniration/RemunirationTypes/SearchResults")
);
const RemunerationTypeInsert = lazy(
  () => import("../pages/payroll/remuniration/RemunirationTypes/Insert")
);

const RemunirationTypeDetail = lazy(
  () => import("../pages/payroll/remuniration/RemunirationTypes/Detail")
);




//7.1.2 Remuniartion Details
const RemunirationDetailsSearch = lazy(
  () => import("../pages/payroll/remuniration/RemunirationDetails/Search")
);
const RemunirationDetailInsert = lazy(
  () => import("../pages/payroll/remuniration/RemunirationDetails/Insert")
);
const RemunirationDetailDetail = lazy(
  () => import("../pages/payroll/remuniration/RemunirationDetails/Detail")
);

const RemunirationDetailsSearchResult = lazy(
  () =>
    import("../pages/payroll/remuniration/RemunirationDetails/SearchResults")
);

//7.1.3 Remuniartion Payments
const RemunirationPaymentsSearch = lazy(
  () => import("../pages/payroll/remuniration/RemunirationPayments/Search")
);
const RemunirationPaymentInsert = lazy(
  () => import("../pages/payroll/remuniration/RemunirationPayments/Insert")
);
const RemunirationPaymentDetail = lazy(
  () => import("../pages/payroll/remuniration/RemunirationPayments/Detail")
);

const RemunirationPaymentsSearchResult = lazy(
  () =>
    import("../pages/payroll/remuniration/RemunirationPayments/SearchResults")
);

// 7.1.4 Leave Rule Deductions
const LeaveRuleDeductionsSearch = lazy(
  () => import("../pages/payroll/remuniration/LeaveRuleDeductions/Search")
);
const LeaveRuleDeductionInsert = lazy(
  () => import("../pages/payroll/remuniration/LeaveRuleDeductions/Insert")
);
const LeaveRuleDeductionDetail = lazy(
  () => import("../pages/payroll/remuniration/LeaveRuleDeductions/Detail")
);

const LeaveRuleDeductionsSearchResult = lazy(
  () =>
    import("../pages/payroll/remuniration/LeaveRuleDeductions/SearchResults")
);

//7.1.5 Remuniartion Payments
const RemunirationDetailPaymentsSearch = lazy(
  () =>
    import("../pages/payroll/remuniration/RemunirationDetailPayments/Search")
);
const RemunirationDetailPaymentInsert = lazy(
  () =>
    import("../pages/payroll/remuniration/RemunirationDetailPayments/Insert")
);
const RemunirationDetailPaymentDetail = lazy(
  () =>
    import("../pages/payroll/remuniration/RemunirationDetailPayments/Detail")
);

const RemunirationDetailPaymentsSearchResult = lazy(
  () =>
    import(
      "../pages/payroll/remuniration/RemunirationDetailPayments/SearchResults"
    )
);
const RemunirationDetailPaymentEmpYearlyForm = lazy(
  () =>
    import(
      "../pages/payroll/remuniration/RemunirationDetailPayments/Detail/empEarlyReportM40"
    )
);

//7.1.6 Remaining

// const RemainingsSearch = lazy(
//   () => import("../pages/payroll/remuniration/Remaining/Search")
// );
const RemainingsSearchNew = lazy(
  () => import("../pages/payroll/remuniration/Remaining/Search")
);
const RemainingsSearchResult = lazy(
  () => import("../pages/payroll/remuniration/Remaining/SearchResults")
);
const RemainingInsert = lazy(
  () => import("../pages/payroll/remuniration/Remaining/Insert")
);
const RemainingDetail = lazy(
  () => import("../pages/payroll/remuniration/Remaining/Detail")
);

const RemainingsReport = lazy(
  () =>
    import(
      "../pages/payroll/remuniration/Remaining/SearchResults/RemunirationRemainReport"
    )
);
//7.1.7 Wage
const WagesSearch = lazy(
  () => import("../pages/ara/Employee/WageEmployees/Search")
);
const WageSearchResults = lazy(
  () => import("../pages/ara/Employee/WageEmployees/SearchResults")
);
const WageInsert = lazy(
  () => import("../pages/ara/Employee/WageEmployees/Insert")
);
const WageDetail = lazy(
  () => import("../pages/ara/Employee/WageEmployees/Detail")
);

//7.1.8 Wage Detail
const WageDetailsSearch = lazy(
  () => import("../pages/payroll/remuniration/WageDetails/Search")
);
const WageDetailSearchResults = lazy(
  () => import("../pages/payroll/remuniration/WageDetails/SearchResults")
);
const WageDetailInsert = lazy(
  () => import("../pages/payroll/remuniration/WageDetails/Insert")
);
const WageDetailDetail = lazy(
  () => import("../pages/payroll/remuniration/WageDetails/Detail")
);

//7.1.9 Teacher Loan
const TeacherLoansSearch = lazy(
  () => import("../pages/payroll/remuniration/TeacherLoan/Search")
);
const TeacherLoanSearchResults = lazy(
  () => import("../pages/payroll/remuniration/TeacherLoan/SearchResults")
);
const TeacherLoanInsert = lazy(
  () => import("../pages/payroll/remuniration/TeacherLoan/Insert")
);
const TeacherLoanDetail = lazy(
  () => import("../pages/payroll/remuniration/TeacherLoan/Detail")
);

//7.1.10 Teacher Loan Istiqaq
const TeacherLoanIstiqaqsSearch = lazy(
  () => import("../pages/payroll/report/TeacherLoanIstiqaq/Search")
);
const TeacherLoanIstiqaqSearchResults = lazy(
  () => import("../pages/payroll/report/TeacherLoanIstiqaq/SearchResults")
);
const TeacherLoanIstiqaqInsert = lazy(
  () => import("../pages/payroll/report/TeacherLoanIstiqaq/Insert")
);
const TeacherLoanIstiqaqDetail = lazy(
  () => import("../pages/payroll/report/TeacherLoanIstiqaq/Detail")
);


//7.1.11  Remuniration Ikramia

const IkramiasSearch = lazy(
  () => import("../pages/payroll/remuniration/Ikramias/Search")
);
const IkramiasSearchResult = lazy(
  () => import("../pages/payroll/remuniration/Ikramias/SearchResults")
);
const IkramiaInsert = lazy(
  () => import("../pages/payroll/remuniration/Ikramias/Insert")
);

const IkramiaDetail = lazy(
  () => import("../pages/payroll/remuniration/Ikramias/Detail")
);

//7.1.12  Remuniration Ikramia M41

const IkramiasM41Search = lazy(
  () => import("../pages/payroll/report/m41Ikramia/Search")
);
const IkramiasM41SearchResult = lazy(
  () => import("../pages/payroll/report/m41Ikramia/SearchResults")
);
const IkramiaM41Insert = lazy(
  () => import("../pages/payroll/report/m41Ikramia/Insert")
);

//7.1.13  Redundant Measurement

const RedundantMeasurementsSearch = lazy(
  () => import("../pages/payroll/remuniration/RedundantMeasurement/Search")
);
const RedundantMeasurementsSearchResult = lazy(
  () => import("../pages/payroll/remuniration/RedundantMeasurement/SearchResults")
);
const RedundantMeasurementInsert = lazy(
  () => import("../pages/payroll/remuniration/RedundantMeasurement/Insert")
);

const RedundantMeasurementDetail = lazy(
  () => import("../pages/payroll/remuniration/RedundantMeasurement/Detail")
);


//7.2 Report
//7.2.1 M41

const M41sSearch = lazy(() => import("../pages/payroll/report/m41/Search"));
const M41Insert = lazy(() => import("../pages/payroll/report/m41/Insert"));
const M41Detail = lazy(() => import("../pages/payroll/report/m41/Detail"));
const M41SearchResults = lazy(
  () => import("../pages/payroll/report/m41/SearchResults")
);

//7.2.2 Bank Report
const BankReportSearch = lazy(
  () => import("../pages/payroll/report/bankReport/Search")
);

//7.2.3 M41 Grand Total
const M41GrandTotalSearch = lazy(() => import("../pages/payroll/report/m41GrandTotal/Search"));
const M41GrandTotalInsert = lazy(() => import("../pages/payroll/report/m41GrandTotal/Insert"));
const M41GrandTotalDetail = lazy(() => import("../pages/payroll/report/m41GrandTotal/Detail"));
const M41GrandTotalSearchResults = lazy(
  () => import("../pages/payroll/report/m41GrandTotal/SearchResults")
);

//7.2.3 M16
const M16sSearch = lazy(() => import("../pages/payroll/report/m16/Search"));
const M16Insert = lazy(() => import("../pages/payroll/report/m16/Insert"));
const M16Detail = lazy(() => import("../pages/payroll/report/m16/Detail"));
const M16SearchResults = lazy(
  () => import("../pages/payroll/report/m16/SearchResults")
);

//7.2.4 M16Ikramia
const M16IkramiasSearch = lazy(() => import("../pages/payroll/report/m16Ikramia/Search"));
const M16IkramiaInsert = lazy(() => import("../pages/payroll/report/m16Ikramia/Insert"));
const M16IkramiaDetail = lazy(() => import("../pages/payroll/report/m16Ikramia/Detail"));
const M16IkramiaSearchResults = lazy(
  () => import("../pages/payroll/report/m16Ikramia/SearchResults")
);
const SearchRemunirationDetailPaymentAnualReport = lazy(
  () =>
    import(
      "../pages/payroll/report/employeeReport/SearchRemunirationDetailPaymentAnualReport"
    )
);

const SearchResultRemunirationDetailPaymentAnualReport = lazy(
  () =>
    import(
      "../pages/payroll/report/employeeReport/SearchResultRemunirationDetailPaymentAnualReport"
    )
);
// 8 Attendance
// 8.1 Leave
// const LeavesSearch = lazy(() => import("../pages/attendance/Leave/Search"));
// const LeavesSearchResult = lazy(
//   () => import("../pages/attendance/Leave/SearchResults")
// );
const LeaveInsert = lazy(() => import("../pages/attendance/Leave/Insert"));
const LeaveDetail = lazy(() => import("../pages/attendance/Leave/Detail"));

// 8.2 LeaveType

const LeaveTypesSearch = lazy(
  () => import("../pages/attendance/LeaveTypes/Search")
);
const LeaveTypeInsert = lazy(
  () => import("../pages/attendance/LeaveTypes/Insert")
);
const LeaveTypeDetail = lazy(
  () => import("../pages/attendance/LeaveTypes/Detail")
);

const LeaveTypesSearchResult = lazy(
  () => import("../pages/attendance/LeaveTypes/SearchResults")
);

// 8.3 Holiday

const HolidaysSearch = lazy(() => import("../pages/attendance/Holiday/Search"));
const HolidayInsert = lazy(() => import("../pages/attendance/Holiday/Insert"));
const HolidayDetail = lazy(() => import("../pages/attendance/Holiday/Detail"));

const HolidaysSearchResult = lazy(
  () => import("../pages/attendance/Holiday/SearchResults")
);

// 8.4 Attendance

const AttendancesSearch = lazy(
  () => import("../pages/attendance/Attendance/Search")
);
const AttendanceInsert = lazy(
  () => import("../pages/attendance/Attendance/Insert")
);
const AttendanceDetail = lazy(
  () => import("../pages/attendance/Attendance/Detail")
);

const EmployeeAttendanceSearchResults = lazy(
  () => import("../pages/attendance/Attendance/SearchResults")
);
// 8.5 employeeLeaveReport
const EmployeeLeaveReportsSearch = lazy(
  () => import("../pages/attendance/EmployeeLeaveReport/Search")
);
const EmployeeLeaveReportsSearchResult = lazy(
  () => import("../pages/attendance/EmployeeLeaveReport/SearchResult")
);
//  Deduction  9

// 9.1 Deduction Type

const DeductionTypesSearch = lazy(
  () => import("../pages/deduction/DeductionTypes/Search")
);
const DeductionTypesSearchResult = lazy(
  () => import("../pages/deduction/DeductionTypes/SearchResults")
);
const DeductionTypeInsert = lazy(
  () => import("../pages/deduction/DeductionTypes/Insert")
);

const DeductionTypeDetail = lazy(
  () => import("../pages/deduction/DeductionTypes/Detail")
);

// 9.2 Deduction  Payment

const DeductionPaymentSearch = lazy(
  () => import("../pages/deduction/DeductionPayments/Search")
);
const DeductionPaymentSearchResult = lazy(
  () => import("../pages/deduction/DeductionPayments/SearchResults")
);
const DeductionPaymentInsert = lazy(
  () => import("../pages/deduction/DeductionPayments/Insert")
);

const DeductionPaymentDetails = lazy(
  () => import("../pages/deduction/DeductionPayments/Detail")
);

// 9.3 Deduction Detail Payment

const DeductionDetailPaymentSearch = lazy(
  () => import("../pages/deduction/DeductionDetailPayments/Search")
);
const DeductionDetailPaymentSearchResult = lazy(
  () => import("../pages/deduction/DeductionDetailPayments/SearchResults")
);
const DeductionDetailPaymentInsert = lazy(
  () => import("../pages/deduction/DeductionDetailPayments/Insert")
);
const DeductionDetailPaymentDelete = lazy(
  () => import("../pages/deduction/DeductionDetailPayments/Delete")
);
const DeductionDetailPaymentApprove = lazy(
  () => import("../pages/deduction/DeductionDetailPayments/Approval")
);
const DeductionDetailPaymentDetails = lazy(
  () => import("../pages/deduction/DeductionDetailPayments/Detail")
);

// 9.4 Deduction

const DeductionRemainSearch = lazy(
  () => import("../pages/deduction/DeductionRemains/Search")
);
const DeductionRemainSearchResult = lazy(
  () => import("../pages/deduction/DeductionRemains/SearchResults")
);
const DeductionRemainReports = lazy(
  () =>
    import(
      "../pages/deduction/DeductionRemains/SearchResults/DeductionRemainReports"
    )
);
const DeductionRemainInsert = lazy(
  () => import("../pages/deduction/DeductionRemains/Insert")
);
const DeductionRemainDetails = lazy(
  () => import("../pages/deduction/DeductionRemains/Detail")
);

// 10 Suspend
// 10.1 Suspend Employee
const SuspendEmployeeInsert = lazy(
  () => import("../pages/suspend/SuspendEmployee/Insert")
);
const SuspendEmployeeSearch = lazy(
  () => import("../pages/suspend/SuspendEmployee/Search")
);
const SuspendEmployeeDetails = lazy(
  () => import("../pages/suspend/SuspendEmployee/Detail")
);
const SuspendEmployeesSearchResult = lazy(
  () => import("../pages/suspend/SuspendEmployee/SearchResults")
);

//11 Import Data
const ImportMoEInstitutionData = lazy(
  () => import("../pages/general/ce/Import/ImportData")
);
//12 Pension
const PensionIstiqaq = lazy(() => import("../pages/pensionIstiqaq"));
const authProtectedRoutes = [
  // 1  General
  // 1.1 common-entities
  // 1.1.3 Departments
  {
    path: routes.generalCeDepartments,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DepartmentsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeDepartmentsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DepartmentsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeDepartmentInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DepartmentInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.generalCeDepartments}/:departmentId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DepartmentDetail />
      </Suspense>
    ),
  },
  // 1.1.5 InstitutionTypes
  {
    path: routes.generalCeInstitutionTypes,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InstitutionTypesSearch />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeInstitutionTypesSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InstitutionTypesSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeInstitutionTypeInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InstitutionTypeInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.generalCeInstitutionTypes}/:id`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InstitutionTypeDetail />
      </Suspense>
    ),
  },

  // 1.1.6 Institutions
  {
    path: routes.generalCeInstitutions,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InstitutionsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeInstitutionsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InstitutionsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeInstitutionInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InstitutionInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.generalCeInstitutions}/:id`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InstitutionDetail />
      </Suspense>
    ),
  },
  // 1.1.7 Fiscal Year
  {
    path: routes.generalCeFiscalYears,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FiscalYearsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeFiscalYearsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FiscalYearsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeFiscalYearInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FiscalYearInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.generalCeFiscalYears}/:id`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FiscalYearDetail />
      </Suspense>
    ),
  },

  // 1.1.10 Fund
  {
    path: routes.generalCeFunds,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FundsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeFundsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FundsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeFundInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FundInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.generalCeFunds}/:id`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FundDetail />
      </Suspense>
    ),
  },

  // 1.1.8 Fiscal Month
  {
    path: routes.generalCeFiscalMonths,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FiscalMonthsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeFiscalMonthsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FiscalMonthsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeFiscalMonthInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FiscalMonthInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.generalCeFiscalMonths}/:id`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FiscalMonthDetail />
      </Suspense>
    ),
  },

  // 1.1.9 AVCAccounta
  {
    path: routes.generalCeAVCAccounts,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AVCAccountsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeAVCAccountsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AVCAccountsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeAVCAccountInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AVCAccountInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.generalCeAVCAccounts}/:avcAccountId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AVCAccountDetail />
      </Suspense>
    ),
  },
  //1.1.10 Address

  {
    path: routes.generalCeAddresses,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AddressesSearch />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeAddressesSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AddressesSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeAddressInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AddressInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.generalCeAddresses}/:addressId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AddressDetail />
      </Suspense>
    ),
  },
  // 1.1.11 ProjectFund
  {
    path: routes.generalCeProjectFunds,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <ProjectFundsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeProjectFundsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <ProjectFundsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeProjectFundInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <ProjectFundInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.generalCeProjectFunds}/:id`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <ProjectFundDetail />
      </Suspense>
    ),
  },
  // 1.1.12 MoeInstitutions
  {
    path: routes.generalCeMoeInstitutions,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <MoeInstitutionsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeMoeInstitutionsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <MoeInstitutionsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeMoeInstitutionInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <MoeInstitutionInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.generalCeMoeInstitutions}/:moeId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <MoeInstitutionDetail />
      </Suspense>
    ),
  },

  // 1.1.13 InstitutionAccessRemunirations
  {
    path: routes.generalCeInstitutionAccessRemunirations,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InstitutionAccessRemunirationsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeInstitutionAccessRemunirationsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InstitutionAccessRemunirationsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeInstitutionAccessRemunirationInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InstitutionAccessRemunirationInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.generalCeInstitutionAccessRemunirations}/:id`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InstitutionAccessRemunirationDetail />
      </Suspense>
    ),
  },


  // 1.1.14 Institution Remuniration Details
  {
    path: routes.generalCeInstitutionRemunirationDetails,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InstitutionRemunirationDetailsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeInstitutionRemunirationDetailsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InstitutionRemunirationDetailsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeInstitutionRemunirationDetailInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InstitutionRemunirationDetailInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.generalCeInstitutionRemunirationDetails}/:institutionRemunirationDetailId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InstitutionRemunirationDetailDetail />
      </Suspense>
    ),
  },

    // 1.1.15 Allowed ETazkira Institutions
    {
    path: routes.generalCeAllowedETazkiraInstitutions,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AllowedETazkiraInstitutionsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeAllowedETazkiraInstitutionsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AllowedETazkiraInstitutionsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeAllowedETazkiraInstitutionInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AllowedETazkiraInstitutionInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.generalCeAllowedETazkiraInstitutions}/:allowedETazkiraInstitutionId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AllowedETazkiraInstitutionDetail />
      </Suspense>
    ),
  },


  // 1.1.16 Training
    {
    path: routes.generalCeTrainings,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <TrainingsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeTrainingsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <TrainingsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.generalCeTrainingInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <TrainingInsert />
      </Suspense>
    ),
  },
  
  //2 ARA
  // 2.1 Employee
  // 2.1.1 Employee

  {
    path: routes.araEmpEmployees,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmployeesSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpEmployeesSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmployeesSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpEmployeeInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmployeeInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.araEmpEmployees}/:employeeId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmployeeDetail />
      </Suspense>
    ),
  },
  //2.1.1 Tazkira Verification
  {
    path: routes.araTazkiraVerification,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <TazkiraVerificationSearch />
      </Suspense>
    ),
  },
 
  {
    path: routes.araTazkiraVerificationsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <TazkiraVerificationSearchResult />
      </Suspense>
    ),
  },
  
  {
    path: `${routes.araTazkiraVerification}/:tazkiraVerificationId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <TazkiraVerificationDetail />
      </Suspense>
    ),
  },

  //Bank Verification
   {
    path:routes.araBankVerification,
    element:()=>(
      <Suspense fallback={<PageLoader />}>
        <BankVerificationSearch />
      </Suspense>
    )
  },
   {
    path:routes.araBankVerificationsSearchResults,
    element:()=>(
      <Suspense fallback={<PageLoader />}>
        <BankVerificationSearchResult />
      </Suspense>
    )
  },
  // 2.1.2 Deleted Employee

  {
    path: routes.araEmpDelEmployees,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DelEmployeesSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpDelEmployeesSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DelEmployeesSearchResult />
      </Suspense>
    ),
  },
  //2.1.3 Employee Job Titles
  {
    path: routes.araEmpJobTitles,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpJobTitlesSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpJobTitlesSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpJobTitlesSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpJobTitleInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpJobTitleInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.araEmpJobTitles}/:empJobTitleId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpJobTitleDetail />
      </Suspense>
    ),
  },

  //2.1.4 Employee Status
  {
    path: routes.araEmpStatuses,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpStatusesSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpStatusesSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpStatusesSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpStatusInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpStatusInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.araEmpStatuses}/:empStatusId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpStatusDetail />
      </Suspense>
    ),
  },

  //2.1.5 Employee Types
  {
    path: routes.araEmpTypes,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpTypesSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpTypesSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpTypesSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpTypeInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpTypeInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.araEmpTypes}/:empTypeId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpTypeDetail />
      </Suspense>
    ),
  },

  //2.1.6 Employee Education Levels
  {
    path: routes.araEmpEduLevels,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpEduLevelsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpEduLevelsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpEduLevelsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpEduLevelInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpEduLevelInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.araEmpEduLevels}/:empEduLevelId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpEduLevelDetail />
      </Suspense>
    ),
  },
  //2.1.7 Martyre Disables
  {
    path: routes.araEmpMartyresDisables,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <MartyreDisablesSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpMartyresDisablesSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <MartyreDisablesSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpMartyreDisableInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <MartyreDisableInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.araEmpMartyresDisables}/:martyreDisableId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <MartyreDisableDetail />
      </Suspense>
    ),
  },

  // 2.1.11 Martyre Disable Lawyers
  {
    path: routes.araEmpMartyresDisableLawyers,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <MartyreDisableLawyersSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpMartyresDisableLawyersSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <MartyreDisableLawyersSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpMartyreDisableLawyerInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <MartyreDisableLawyerInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.araEmpMartyresDisableLawyers}/:martyreDisableLawyerId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <MartyreDisableLawyerDetail />
      </Suspense>
    ),
  },

  // 2.1.12 Employee Account Numbers
  {
    path: routes.araEmpAccountNumbers,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpAccountNumbersSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpAccountNumbersSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpAccountNumbersSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpAccountNumberInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpAccountNumberInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.araEmpAccountNumbers}/:empAccountNumberId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpAccountNumberDetail />
      </Suspense>
    ),
  },
  {
    path: `${routes.araEmpBankAccountLetter}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpAccountNumbersBankLetter />
      </Suspense>
    ),
  },
  // 2.1.13 Employee Account Numbers
  {
    path: routes.araEmpEarnings,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpEarningSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpEarningsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpEarningsSearchResult />
      </Suspense>
    ),
  },

  //2.1.14 Employee Type Details
  {
    path: routes.araEmpTypeDetails,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpTypeDetailsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpTypeDetailsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpTypeDetailsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpTypeDetailInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpTypeDetailInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.araEmpTypeDetails}/:empTypeDetailId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmpTypeDetailDetail />
      </Suspense>
    ),
  },

  //2.2 Head Count
  //2.2.1 Head Count
  {
    path: routes.araHeadCountHeadCounts,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HeadCountsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araHeadCountHeadCountsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HeadCountsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.araHeadCountHeadCountInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HeadCountInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.araHeadCountHeadCounts}/:headCountId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HeadCountDetail />
      </Suspense>
    ),
  },
  //2.2.1 HeadCountTotalAndRemunirations
  {
    path: routes.araHeadCountTotalAndRemuniration,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HeadCountTotalAndRemunirationSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araHeadCountTotalAndRemunirationsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HeadCountTotalAndRemunirationsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.araHeadCountTotalAndRemunirationInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HeadCountTotalAndRemunirationInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.araHeadCountTotalAndRemuniration}/:headCountTotalAndRemunirationId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HeadCountTotalAndRemunirationDetail />
      </Suspense>
    ),
  },


  // 2.2.2 Organizations
  {
    path: routes.araHeadCountOrganizations,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <OrganizationsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araHeadCountOrganizationsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <OrganizationsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.araHeadCountOrganizationInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <OrganizationInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.araHeadCountOrganizations}/:orgId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <OrganizationDetail />
      </Suspense>
    ),
  },
  //2.2.3 Head Count Detail
  {
    path: routes.araHeadCountHeadCountDetails,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HeadCountDetailsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araHeadCountHeadCountDetailsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HeadCountDetailsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.araHeadCountHeadCountDetailInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HeadCountDetailInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.araHeadCountHeadCountDetails}/:headCountDetailId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HeadCountDetailDetail />
      </Suspense>
    ),
  },

  //2.3.1 Yatheem
  {
    path: routes.araYatheemRegisteration,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <YatheemRegistrationsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araYatheemRegisterationsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <YatheemRegistrationsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.araYatheemRegisterationInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <YatheemRegistrationInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.araYatheemRegisteration}/:yatheemRegistrationId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <YatheemRegistrationDetail />
      </Suspense>
    ),
  },
  // 3 CBA
  // 3.1 Bank Contact
  {
    path: routes.cbaBankContacts,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BankContactSearch />
      </Suspense>
    ),
  },

  {
    path: routes.cbaBankContactsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BankContactSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.cbaBankContactInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BankContactInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.cbaBankContacts}/:bankContactId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BankContactDetail />
      </Suspense>
    ),
  },

  // 3.2 Bank
  {
    path: routes.cbaBanks,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BankSearch />
      </Suspense>
    ),
  },

  {
    path: routes.cbaBanksSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BankSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.cbaBankInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BankInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.cbaBanks}/:bankId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BankDetail />
      </Suspense>
    ),
  },
  // 3.4 PaymentType
  {
    path: routes.cbaPaymentTypes,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <PaymentTypeSearch />
      </Suspense>
    ),
  },

  {
    path: routes.cbaPaymentTypesSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <PaymentTypeSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.cbaPaymentTypeInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <PaymentTypeInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.cbaPaymentTypes}/:paymentTypeId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <PaymentTypeDetail />
      </Suspense>
    ),
  },
  // 3.5 Payment
  {
    path: routes.cbaPayments,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <PaymentSearch />
      </Suspense>
    ),
  },

  {
    path: routes.cbaPaymentsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <PaymentSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.cbaPaymentInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <PaymentInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.cbaPayments}/:paymentId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <PaymentDetail />
      </Suspense>
    ),
  },
  // 3.6 Account Number
  {
    path: routes.cbaAccountNumbers,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AccountNumberSearch />
      </Suspense>
    ),
  },

  {
    path: routes.cbaAccountNumbersSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AccountNumberSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.cbaAccountNumberInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AccountNumberInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.cbaAccountNumbers}/:id`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AccountNumberDetail />
      </Suspense>
    ),
  },


  // 3.8 Bank Employee Reconciliation
  {
    path: routes.cbaBankEmployeeReconciliations,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BankEmployeesReconciliationSearch />
      </Suspense>
    ),
  },
  {
    path: routes.cbaBankEmployeeReconciliationInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BankEmployeesReconciliationInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.cbaBankEmployeeReconciliations}/:bankEmployeeId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BankEmployeesReconciliationDetail />
      </Suspense>
    ),
  },
  {
    path: routes.cbaBankEmployeeReconciliationsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BankEmployeesReconciliationsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.cbaBankEmployeeReconcile,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <ReconcileBankEmployee />
      </Suspense>
    ),
  },
  {
    path: routes.cbaBankEmpReconcileFromDatabase,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <ReconcileEmployeesFromDatabase />
      </Suspense>
    )
  },
  {
    path: `${routes.cbaBankEmployeeImport}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <ImportBankEmployee />
      </Suspense>
    ),
  },
  // 5 Filing
  {
    path: routes.filingFilings,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FilingSearch />
      </Suspense>
    ),
  },

  {
    path: routes.filingFilingSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FilingSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.filingFilingInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FilingInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.filingFilings}/:filingId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FilingDetail />
      </Suspense>
    ),
  },
  // 5.2 Letter
  {
    path: `${routes.filingLetters}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <LetterSearch />
      </Suspense>
    ),
  },
  {
    path: routes.filingLetterSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <LetterSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.filingLetterInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <LetterInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.filingLetters}/:letterId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <LetterDetail />
      </Suspense>
    ),
  },

  // 5.3 FileType
  {
    path: `${routes.filingFileTypes}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FileTypeSearch />
      </Suspense>
    ),
  },
  {
    path: routes.filingFileTypeSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FileTypeSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.filingFileTypeInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FileTypeInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.filingFileTypes}/:fileTypeId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <FileTypeDetail />
      </Suspense>
    ),
  },
  // 6 Sa
  // 6.1 Sa User Management
  // 6.1.1 Users
  {
    path: routes.saUsersMgtUsers,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UsersSearch />
      </Suspense>
    ),
  },
  {
    path: routes.saUsersMgtUsersSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UsersSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.saUsersMgtUserLogs,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserLogsSearch />
      </Suspense>
    ),
  },
  {
    path: `${routes.saUsersMgtUserLogs}/:userLogId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserLogsDetail />
      </Suspense>
    ),
  },
  {
    path: routes.saUsersMgtUserLogsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserLogsSearchResult />
      </Suspense>
    ),
  },

  {
    path: routes.saUsersMgtInvalidAccountsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <InvalidAccountsSearchResult />
      </Suspense>
    ),
  },

  {
    path: routes.saUsersMgtUserInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.saUsersMgtUsers}/:userId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserDetail />
      </Suspense>
    ),
  },
  {
    path: `/profile`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <Profile />
      </Suspense>
    ),
  },
  //6.1.2 Roles
  {
    path: routes.saUsersMgtRoles,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserRolesSearch />
      </Suspense>
    ),
  },
  {
    path: routes.saUsersMgtRolesSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserRolesSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.saUsersMgtRoleInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserRoleInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.saUsersMgtRoles}/:roleId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserRoleDetail />
      </Suspense>
    ),
  },
  //6.1.4 Permissions
  {
    path: routes.saUsersMgtPermissions,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserPermissionsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.saUsersMgtPermissionsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserPermissionsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.saUsersMgtModulePermissionsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserModulePermissionsSearchResult />
      </Suspense>
    ),
  },

  {
    path: `${routes.saUsersMgtPermissions}/:permissionId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserPermissionDetail />
      </Suspense>
    ),
  },
  {
    path: `${routes.saUsersMgtPermissionInsert}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserPermissionInsert />
      </Suspense>
    ),
  },

  //6.1.5 Modules
  {
    path: routes.saModules,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserModulesSearch />
      </Suspense>
    ),
  },
  {
    path: routes.saModuleInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserModuleInsert />
      </Suspense>
    ),
  },
  {
    path: routes.saModulesSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserModulesSearchResult />
      </Suspense>
    ),
  },

  {
    path: `${routes.saModules}/:moduleId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <UserModuleDetail />
      </Suspense>
    ),
  },
  // 7 Payroll
  // 7.1 Payroll
  // 7.1.1 Remuniration Type
  {
    path: routes.payrollRemunirationTypes,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemunirationTypesSearch />
      </Suspense>
    ),
  },
  {
    path: routes.payrollRemunirationTypesSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemunirationTypesSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.payrollRemunirationTypeInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemunerationTypeInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollRemunirationTypes}/:remunirationTypeId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemunirationTypeDetail />
      </Suspense>
    ),
  },
  // 7.1.2 Remuniration Detail
  {
    path: routes.payrollRemunirationDetails,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemunirationDetailsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.payrollRemunirationDetailInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemunirationDetailInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollRemunirationDetails}/:remunirationDetailId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemunirationDetailDetail />
      </Suspense>
    ),
  },
  {
    path: routes.payrollRemunirationDetailsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemunirationDetailsSearchResult />
      </Suspense>
    ),
  },
  // 7.1.3 Remuniration Payment
  {
    path: routes.payrollRemunirationPayments,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemunirationPaymentsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.payrollRemunirationPaymentInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemunirationPaymentInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollRemunirationPayments}/:remunirationPaymentId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemunirationPaymentDetail />
      </Suspense>
    ),
  },
  {
    path: routes.payrollRemunirationPaymentsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemunirationPaymentsSearchResult />
      </Suspense>
    ),
  },

  // 7.1.4 Leave Rule Deduction
  {
    path: routes.payrollLeaveRuleDeductions,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <LeaveRuleDeductionsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.payrollLeaveRuleDeductionInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <LeaveRuleDeductionInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollLeaveRuleDeductions}/:leaveRuleDeductionId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <LeaveRuleDeductionDetail />
      </Suspense>
    ),
  },
  {
    path: routes.payrollLeaveRuleDeductionsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <LeaveRuleDeductionsSearchResult />
      </Suspense>
    ),
  },
  // 7.1.5 Remuniration Detail Payment
  {
    path: routes.payrollRemunirationDetailPayments,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemunirationDetailPaymentsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.payrollRemunirationDetailPaymentInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemunirationDetailPaymentInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollRemunirationDetailPayments}/:remunirationDetailPaymentId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemunirationDetailPaymentDetail />
      </Suspense>
    ),
  },
  {
    path: routes.payrollRemunirationDetailPaymentsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemunirationDetailPaymentsSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.payrollReportM40Download,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <PageLayout title="م۴۰" header="م۴۰">
          <RemunirationDetailPaymentEmpYearlyForm />
        </PageLayout>
      </Suspense>
    ),
  },

  // 7.1.6 Remaining
  {
    path: routes.payrollRemunirationRemainings,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemainingsSearchNew />
      </Suspense>
    ),
  },
  {
    path: routes.payrollRemunirationRemainingInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemainingInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollRemunirationRemainings}/:remainingId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemainingDetail />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollRemunirationRemainingsReport}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemainingsReport gridRef={undefined} defaultColDef={undefined} />
      </Suspense>
    ),
  },

  {
    path: routes.payrollRemunirationRemainingSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RemainingsSearchResult />
      </Suspense>
    ),
  },
  //7.1.7 Wages
  {
    path: routes.araEmpWages,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <WagesSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpWageInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <WageInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.araEmpWages}/:wageId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <WageDetail />
      </Suspense>
    ),
  },
  {
    path: `${routes.araEmpWageSearchResults}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <WageSearchResults />
      </Suspense>
    ),
  },
  //7.1.8 Wage Details
  {
    path: routes.araEmpWageDetails,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <WageDetailsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.araEmpWageDetailInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <WageDetailInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.araEmpWageDetails}/:wageDetailId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <WageDetailDetail />
      </Suspense>
    ),
  },
  {
    path: `${routes.araEmpWageDetailSearchResults}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <WageDetailSearchResults />
      </Suspense>
    ),
  },

  //7.1.9 Teacher Loan
  {
    path: routes.payrollTeacherLoans,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <TeacherLoansSearch />
      </Suspense>
    ),
  },
  {
    path: routes.payrollTeacherLoanInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <TeacherLoanInsert />
      </Suspense>
    ),
  },
  {
    path: routes.payrollNewTeacherLoanInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <TeacherLoanInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollTeacherLoans}/:teacherLoanId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <TeacherLoanDetail />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollTeacherLoansSearchResults}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <TeacherLoanSearchResults />
      </Suspense>
    ),
  },

  //7.1.10 Teacher Loan Istiqaq
  {
    path: routes.payrollTeacherLoanIstiqaqs,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <TeacherLoanIstiqaqsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.payrollTeacherLoanIstiqaqInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <TeacherLoanIstiqaqInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollTeacherLoanIstiqaqs}/:teacherLoanIstiqaqId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <TeacherLoanIstiqaqDetail />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollTeacherLoanIstiqaqsSearchResults}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <TeacherLoanIstiqaqSearchResults />
      </Suspense>
    ),
  },

  // 7.1.11  Remuniration Ikramia
  {
    path: routes.payrollRemunirationIkramias,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <IkramiasSearch />
      </Suspense>
    ),
  },
  {
    path: routes.payrollRemunirationIkramiaInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <IkramiaInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollRemunirationIkramias}/:ikramiaId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <IkramiaDetail />
      </Suspense>
    ),
  },
  {
    path: routes.payrollRemunirationIkramiasSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <IkramiasSearchResult />
      </Suspense>
    ),
  },

  // 7.1.12   Ikramia M41
  {
    path: routes.payrollRemunirationIkramiasM41,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <IkramiasM41Search />
      </Suspense>
    ),
  },
  {
    path: routes.payrollRemunirationIkramiaM41Insert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <IkramiaM41Insert />
      </Suspense>
    ),
  },

  {
    path: routes.payrollRemunirationIkramiasM41SearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <IkramiasM41SearchResult />
      </Suspense>
    ),
  },
  // 7.1.13  Redundant Measurement
  {
    path: routes.payrollRedundantMeasurement,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RedundantMeasurementsSearch />
      </Suspense>
    ),
  },
  {
    path: routes.payrollRedundantMeasurementInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RedundantMeasurementInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollRedundantMeasurement}/:redundantMeasurementId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RedundantMeasurementDetail />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollRedundantMeasurementsSearchResults}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <RedundantMeasurementsSearchResult />
      </Suspense>
    ),
  },
  // 7.2 Report
  // 7.2.1 M41
  {
    path: routes.payrollReportM41s,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <M41sSearch />
      </Suspense>
    ),
  },
  {
    path: routes.payrollReportM41Insert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <M41Insert />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollReportM41s}/:m41Id`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <M41Detail />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollReportM41SearchResults}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <M41SearchResults />
      </Suspense>
    ),
  },
  // 7.2.2 BankReport
  {
    path: `${routes.payrollBankReports}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BankReportSearch />
      </Suspense>
    ),
  },

  // 7.2.3 M16
  {
    path: routes.payrollReportM16s,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <M16sSearch />
      </Suspense>
    ),
  },
  {
    path: routes.payrollReportM16Insert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <M16Insert />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollReportM16s}/:m16Id`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <M16Detail />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollReportM16SearchResults}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <M16SearchResults />
      </Suspense>
    ),
  },

  // 7.2.4 M16 Ikramia
  {
    path: routes.payrollReportM16Ikramias,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <M16IkramiasSearch />
      </Suspense>
    ),
  },

  {
    path: routes.payrollReportM16IkramiaInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <M16IkramiaInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollReportM16Ikramias}/:m16IkramiaId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <M16IkramiaDetail />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollReportM16IkramiaSearchResults}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <M16IkramiaSearchResults />
      </Suspense>
    ),
  },

  // 7.2.5 M41 Grand Total
  {
    path: routes.payrollReportM41GrandTotals,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <M41GrandTotalSearch />
      </Suspense>
    ),
  },
  {
    path: routes.payrollReportM41GrandTotalInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <M41GrandTotalInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollReportM41GrandTotals}/:m41GrandTotalId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <M41GrandTotalDetail />
      </Suspense>
    ),
  },
  {
    path: `${routes.payrollReportM41GrandTotalSearchResults}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <M41GrandTotalSearchResults />
      </Suspense>
    ),
  },
  // Employee Report
  {
    path: routes.payrollRemunirationDetailPaymentAnualReport,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <SearchRemunirationDetailPaymentAnualReport />
      </Suspense>
    ),
  },
  // Remuniration Detail Payment Anual Report
  {
    path: routes.payrollRemunirationDetailPaymentAnualReportSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <SearchResultRemunirationDetailPaymentAnualReport />
      </Suspense>
    ),
  },


  {
    path: `${routes.attendanceLeaves}/:leaveId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <LeaveDetail />
      </Suspense>
    ),
  },
    {
    path: routes.attendanceLeaveInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <LeaveInsert />
      </Suspense>
    ),
  },
  // 8.2 LeaveType
  {
    path: routes.attendanceLeaveTypes,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <LeaveTypesSearch />
      </Suspense>
    ),
  },
  {
    path: routes.attendanceLeaveTypesInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <LeaveTypeInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.attendanceLeaveTypes}/:leaveTypeId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <LeaveTypeDetail />
      </Suspense>
    ),
  },
  {
    path: routes.attendanceLeaveTypesSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <LeaveTypesSearchResult />
      </Suspense>
    ),
  },

  // 8.3 Holiday
  {
    path: routes.attendanceHoliday,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HolidaysSearch />
      </Suspense>
    ),
  },
  {
    path: routes.attendanceHolidayInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HolidayInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.attendanceHoliday}/:holidayId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HolidayDetail />
      </Suspense>
    ),
  },
  {
    path: routes.attendanceHolidaySearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HolidaysSearchResult />
      </Suspense>
    ),
  },

  // 8.4 Attendance
  {
    path: routes.employeeAttendance,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AttendancesSearch />
      </Suspense>
    ),
  },
  {
    path: routes.employeeAttendanceInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AttendanceInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.employeeAttendance}/:attendanceId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AttendanceDetail />
      </Suspense>
    ),
  },
  {
    path: `${routes.employeeAttendanceSearchResults}`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmployeeAttendanceSearchResults />
      </Suspense>
    ),
  },

  {
    path: routes.employeeLeaveReport,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmployeeLeaveReportsSearch />
      </Suspense>
    ),
  },

  {
    path: routes.employeeLeaveReportSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <EmployeeLeaveReportsSearchResult />
      </Suspense>
    ),
  },
  // 9 Deduction
  // 9.1 Deduction Type
  {
    path: routes.deductionTypes,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionTypesSearch />
      </Suspense>
    ),
  },
  {
    path: routes.deductionTypeInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionTypeInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.deductionTypes}/:deductionTypeId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionTypeDetail />
      </Suspense>
    ),
  },
  {
    path: routes.deductionTypesSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionTypesSearchResult />
      </Suspense>
    ),
  },

  // 9.2  Deduction  Payment
  {
    path: routes.deductionPayments,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionPaymentSearch />
      </Suspense>
    ),
  },
  {
    path: routes.deductionPaymentInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionPaymentInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.deductionPayments}/:deductionPaymentId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionPaymentDetails />
      </Suspense>
    ),
  },
  {
    path: routes.deductionPaymentsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionPaymentSearchResult />
      </Suspense>
    ),
  },

  // 9.3  Deduction Detail  Payment
  {
    path: routes.deductionDetailPayments,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionDetailPaymentSearch />
      </Suspense>
    ),
  },
  {
    path: routes.deductionDetailPaymentInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionDetailPaymentInsert />
      </Suspense>
    ),
  },
  {
    path: routes.deductionDetailPaymentDelete,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionDetailPaymentDelete />
      </Suspense>
    ),
  },
  {
    path: routes.deductionDetailPaymentApproval,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionDetailPaymentApprove />
      </Suspense>
    ),
  },
  {
    path: `${routes.deductionDetailPayments}/:deductionDetailPaymentId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionDetailPaymentDetails />
      </Suspense>
    ),
  },
  {
    path: routes.deductionDetailPaymentsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionDetailPaymentSearchResult />
      </Suspense>
    ),
  },

  // 9.4  Deductions
  {
    path: routes.deductionRemains,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionRemainSearch />
      </Suspense>
    ),
  },
  {
    path: routes.deductionRemainInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionRemainInsert />
      </Suspense>
    ),
  },
  {
    path: `${routes.deductionRemains}/:deductionId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionRemainDetails />
      </Suspense>
    ),
  },
  {
    path: routes.deductionRemainsSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionRemainSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.deductionRemainReports,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DeductionRemainReports />
      </Suspense>
    ),
  },
  // 10 Suspend
  // 10.1 Suspend Employee
  {
    path: routes.suspendEmployees,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <SuspendEmployeeSearch />
      </Suspense>
    ),
  },
  {
    path: routes.suspendEmployeeInsert,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <SuspendEmployeeInsert />
      </Suspense>
    ),
  },

  {
    path: `${routes.suspendEmployees}/:suspendEmployeeId`,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <SuspendEmployeeDetails />
      </Suspense>
    ),
  },
  {
    path: routes.suspendEmployeesSearchResults,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <SuspendEmployeesSearchResult />
      </Suspense>
    ),
  },
  {
    path: routes.importData,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <ImportMoEInstitutionData />
      </Suspense>
    ),
  },
  {
    path: routes.pensionIstiqaq,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <PensionIstiqaq />
      </Suspense>
    ),
  },
  {
    path: routes.dashboard,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <DashbordPage />
      </Suspense>
    ),
  },
  {
    path: routes.analyticReport,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <AnalyticReport />
      </Suspense>
    )
  },
  {
    path: routes.martyredDisabledDashboard,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <HeadCountDashboardPage />
      </Suspense>
    )
  },
  // End HomePage
  {
    path: routes.home,
    // element: () => <Navigate to={routes.home} />,
    element: () => <HomePage />,
  },
  // {
  //   path: "/",
  //   element: () => <Login />,
  // },

  {
    path: "/auth-pass-change-basic",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        {/* <BasicPasswCreate /> */}
        <PasswordResetForm />
      </Suspense>
    ),
  },
];

const publicRoutes = [
  // Authentication Page
  {
    path: "/",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/logout",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <Logout />
      </Suspense>
    ),
  },
  {
    // path: "/login",
    path: routes.saUsersMgtLogin,
    // element: () => <Navigate to={routes.saUsersMgtLogin} />,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/forgot-password",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <ForgetPasswordPage />{" "}
      </Suspense>
    ),
  },

  //AuthenticationInner pages
  {
    path: "/auth-signin-basic",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BasicSignIn />
      </Suspense>
    ),
  },
  {
    path: "/auth-signin-cover",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <CoverSignIn />
      </Suspense>
    ),
  },
  {
    path: "/auth-signup-basic",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BasicSignUp />
      </Suspense>
    ),
  },
  {
    path: "/auth-signup-cover",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <CoverSignUp />
      </Suspense>
    ),
  },
  {
    path: "/auth-pass-reset-basic",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <PasswordResetFormForgetPassword />
        {/* <BasicPasswReset /> */}
      </Suspense>
    ),
  },
  // {
  //   path: "/auth-account-reset",
  //   element: () => (
  //     <Suspense fallback={<PageLoader />}>
  //       <AccountResetForm />
  //     </Suspense>
  //   ),
  // },
  {
    path: "/auth-pass-reset-cover",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <CoverPasswReset />
      </Suspense>
    ),
  },
  {
    path: "/auth-account-reset",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <CoverPasswReset />
      </Suspense>
    ),
  },
  {
    path: "/auth-lockscreen-basic",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BasicLockScreen />
      </Suspense>
    ),
  },
  {
    path: "/auth-lockscreen-cover",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <CoverLockScreen />
      </Suspense>
    ),
  },
  {
    path: "/auth-logout-basic",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BasicLogout />
      </Suspense>
    ),
  },
  {
    path: "/auth-logout-cover",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <CoverLogout />
      </Suspense>
    ),
  },
  {
    path: "/auth-success-msg-basic",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BasicSuccessMsg />
      </Suspense>
    ),
  },
  {
    path: "/auth-success-msg-cover",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <CoverSuccessMsg />
      </Suspense>
    ),
  },
  {
    path: "/auth-twostep-basic",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <BasicTwosVerify />
      </Suspense>
    ),
  },
  {
    path: "/auth-twostep-cover",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <CoverTwosVerify />
      </Suspense>
    ),
  },
  {
    path: "/auth-404-basic",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <Basic404 />
      </Suspense>
    ),
  },
  {
    path: "/auth-404-cover",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <Cover404 />
      </Suspense>
    ),
  },
  {
    path: "/auth-404-alt",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <Alt404 />
      </Suspense>
    ),
  },
  {
    path: "/auth-500",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <Error500 />
      </Suspense>
    ),
  },

  // {
  //   path: "/auth-pass-change-basic",
  //   element: () => (
  //     <Suspense fallback={<PageLoader />}>
  //       <BasicPasswCreate />
  //     </Suspense>
  //   ),
  // },
  {
    path: "/auth-pass-change-cover",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <CoverPasswCreate />
      </Suspense>
    ),
  },
  {
    path: "/auth-offline",
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <Offlinepage />
      </Suspense>
    ),
  },
];

export { authProtectedRoutes, publicRoutes };
