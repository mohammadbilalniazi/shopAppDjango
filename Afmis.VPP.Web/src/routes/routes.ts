const insert = "insert";

const searchResults = "search-results";
// 0 Home
export const dashboard = "/dashboard";
export const analyticReport="/analytic-report";
export const home = "/home";
// 1  Generals
export const general = "/general";
// 1.1 common-entities
export const generalCe = `${general}/common-entities`;
// 1.1.3 Department
export const generalCeDepartments = `${generalCe}/department`;
export const generalCeDepartmentInsert = `${generalCeDepartments}/${insert}`;
export const generalCeDepartmentsSearchResults = `${generalCeDepartments}/${searchResults}`;
//1.1.5 Institution Type
export const generalCeInstitutionTypes = `${generalCe}/institution-type`;
export const generalCeInstitutionTypeInsert = `${generalCeInstitutionTypes}/${insert}`;
export const generalCeInstitutionTypesSearchResults = `${generalCeInstitutionTypes}/${searchResults}`;
//1.1.5 Institution
export const generalCeInstitutions = `${generalCe}/institution`;
export const generalCeInstitutionInsert = `${generalCeInstitutions}/${insert}`;
export const generalCeInstitutionsSearchResults = `${generalCeInstitutions}/$f{searchResults}`;
// 1.1.6 Fiscal Year
export const generalCeFiscalYears = `${generalCe}/fiscal-year`;
export const generalCeFiscalYearInsert = `${generalCeFiscalYears}/${insert}`;
export const generalCeFiscalYearsSearchResults = `${generalCeFiscalYears}/${searchResults}`;
// 1.1.7 Fiscal Month
export const generalCeFiscalMonths = `${generalCe}/fiscal-month`;
export const generalCeFiscalMonthInsert = `${generalCeFiscalMonths}/${insert}`;
export const generalCeFiscalMonthsSearchResults = `${generalCeFiscalMonths}/${searchResults}`;
// 1.1.8 Deduction Vendor
export const generalCeAVCAccounts = `${generalCe}/deduction-vendor`;
export const generalCeAVCAccountInsert = `${generalCeAVCAccounts}/${insert}`;
export const generalCeAVCAccountsSearchResults = `${generalCeAVCAccounts}/${searchResults}`;
// 1.1.9 Address
export const generalCeAddresses = `${generalCe}/address`;
export const generalCeAddressInsert = `${generalCeAddresses}/${insert}`;
export const generalCeAddressesSearchResults = `${generalCeAddresses}/${searchResults}`;
// 1.1.10 Fund
export const generalCeFunds = `${generalCe}/fund`;
export const generalCeFundInsert = `${generalCeFunds}/${insert}`;
export const generalCeFundsSearchResults = `${generalCeFunds}/${searchResults}`;
// 1.1.11 Project Fund
export const generalCeProjectFunds = `${generalCe}/project-fund`;
export const generalCeProjectFundInsert = `${generalCeProjectFunds}/${insert}`;
export const generalCeProjectFundsSearchResults = `${generalCeProjectFunds}/${searchResults}`;
//1.1.12 MoeInstitution
export const generalCeMoeInstitutions = `${generalCe}/moeInstitution`;
export const generalCeMoeInstitutionInsert = `${generalCeMoeInstitutions}/${insert}`;
export const generalCeMoeInstitutionsSearchResults = `${generalCeMoeInstitutions}/${searchResults}`;

//1.1.13 Institution Remuniration
export const generalCeInstitutionAccessRemunirations = `${generalCe}/institution-remuniration`;
export const generalCeInstitutionAccessRemunirationInsert = `${generalCeInstitutionAccessRemunirations}/${insert}`;
export const generalCeInstitutionAccessRemunirationsSearchResults = `${generalCeInstitutionAccessRemunirations}/${searchResults}`;

//1.1.14 Institution Remuniration Details
export const generalCeInstitutionRemunirationDetails = `${generalCe}/institution-remuniration-details`;
export const generalCeInstitutionRemunirationDetailInsert = `${generalCeInstitutionRemunirationDetails}/${insert}`;
export const generalCeInstitutionRemunirationDetailsSearchResults = `${generalCeInstitutionRemunirationDetails}/${searchResults}`;



//1.1.15 AllowedETazkiraInstitutions
export const generalCeAllowedETazkiraInstitutions = `${generalCe}/allowed-e-tazkira-institutions`;
export const generalCeAllowedETazkiraInstitutionInsert = `${generalCeAllowedETazkiraInstitutions}/${insert}`;
export const generalCeAllowedETazkiraInstitutionsSearchResults = `${generalCeAllowedETazkiraInstitutions}/${searchResults}`;

//1.1.6 Trainings
export const generalCeTrainings = `${generalCe}/training`;
export const generalCeTrainingInsert = `${generalCeTrainings}/${insert}`;
export const generalCeTrainingsSearchResults = `${generalCeTrainings}/${searchResults}`;

//2 ARA
export const ara = "/ara";   
// 2.1 Employees
export const araEmp = `${ara}/employee`;
// 2.1.1 Employees
export const araEmpEmployees = `${araEmp}/employees`;
export const araEmpEmployeeInsert = `${araEmpEmployees}/${insert}`;
export const araEmpEmployeesSearchResults = `${araEmpEmployees}/${searchResults}`;

// 2.1.1 Tazkira
export const araTazkiraVerification= `${araEmp}/tazkira-verification`;
export const araTazkiraVerificationInsert = `${araTazkiraVerification}/${insert}`;
export const araTazkiraVerificationsSearchResults = `${araTazkiraVerification}/${searchResults}`;

//2.1.1 BankVerification
export const araBankVerification = `${araEmp}/bank-verification`;
export const araBankVerificationInsert = `${araBankVerification}/${insert}`;
export const araBankVerificationsSearchResults = `${araBankVerification}/${searchResults}`;

// 2.1.2 Employees
export const araEmpDelEmployees = `${araEmp}/delEmployees`;
export const araEmpDelEmployeeInsert = `${araEmpDelEmployees}/${insert}`;
export const araEmpDelEmployeesSearchResults = `${araEmpDelEmployees}/${searchResults}`;

// 2.1.3 Job Titles
export const araEmpJobTitles = `${araEmp}/employee-job-titles`;
export const araEmpJobTitleInsert = `${araEmpJobTitles}/${insert}`;
export const araEmpJobTitlesSearchResults = `${araEmpJobTitles}/${searchResults}`;
// 2.1.4 Employee Status
export const araEmpStatuses = `${araEmp}/employee-status`;
export const araEmpStatusInsert = `${araEmpStatuses}/${insert}`;
export const araEmpStatusesSearchResults = `${araEmpStatuses}/${searchResults}`;
// 2.1.5 Employee Type
export const araEmpTypes = `${araEmp}/employee-types`;
export const araEmpTypeInsert = `${araEmpTypes}/${insert}`;
export const araEmpTypesSearchResults = `${araEmpTypes}/${searchResults}`;

// 2.1.6 Employee Education Level
export const araEmpEduLevels = `${araEmp}/employee-education-levels`;
export const araEmpEduLevelInsert = `${araEmpEduLevels}/${insert}`;
export const araEmpEduLevelsSearchResults = `${araEmpEduLevels}/${searchResults}`;
// 2.1.7 Martyrs Disables
export const araEmpMartyresDisables = `${araEmp}/martyres-disables`;
export const araEmpMartyreDisableInsert = `${araEmpMartyresDisables}/${insert}`;
export const araEmpMartyresDisablesSearchResults = `${araEmpMartyresDisables}/${searchResults}`;
export const martyredDisabledDashboard = `${araEmpMartyresDisables}/report`;

// 2.1.10 Cashiers
export const araEmpCashiers = `${araEmp}/cashier`;
export const araEmpCashierInsert = `${araEmpCashiers}/${insert}`;
export const araEmpCashiersSearchResults = `${araEmpCashiers}/${searchResults}`;
// 2.1.11 Martyrs Disable Lawyers
export const araEmpMartyresDisableLawyers = `${araEmp}/martyres-disable-lawyers`;
export const araEmpMartyreDisableLawyerInsert = `${araEmpMartyresDisableLawyers}/${insert}`;
export const araEmpMartyresDisableLawyersSearchResults = `${araEmpMartyresDisableLawyers}/${searchResults}`;

//2.1.12 Employee Account Number
export const araEmpAccountNumbers = `${araEmp}/employee-account-numbers`;
export const araEmpAccountNumberInsert = `${araEmpAccountNumbers}/${insert}`;
export const araEmpAccountNumbersSearchResults = `${araEmpAccountNumbers}/${searchResults}`;
export const araEmpBankAccountLetter = `${araEmpAccountNumbers}/bank-account-letter`;

//2.1.13 Employee Earning
export const araEmpEarnings = `${araEmp}/employee-earning`;
export const araEmpEarningsSearchResults = `${araEmpEarnings}/${searchResults}`;

// 2.1.14 Employee Type Detail
export const araEmpTypeDetails = `${araEmp}/employee-type-details`;
export const araEmpTypeDetailInsert = `${araEmpTypeDetails}/${insert}`;
export const araEmpTypeDetailsSearchResults = `${araEmpTypeDetails}/${searchResults}`;

//2.2 Head Count
export const araHeadCount = `${ara}/head-count`;
// 2.2.1 Head Count
export const araHeadCountHeadCounts = `${araHeadCount}/head-counts`;
export const araHeadCountHeadCountInsert = `${araHeadCountHeadCounts}/${insert}`;
export const araHeadCountHeadCountsSearchResults = `${araHeadCountHeadCounts}/${searchResults}`;
// 2.2.1 Total Head Count and Remuniration  
export const araHeadCountTotalAndRemuniration = `${araHeadCount}/total-head-counts-remunirations`;
export const araHeadCountTotalAndRemunirationInsert = `${araHeadCountTotalAndRemuniration}/${insert}`;
export const araHeadCountTotalAndRemunirationsSearchResults = `${araHeadCountTotalAndRemuniration}/${searchResults}`;
// 2.2.2 Organization
export const araHeadCountOrganizations = `${araHeadCount}/organization`;
export const araHeadCountOrganizationInsert = `${araHeadCountOrganizations}/${insert}`;
export const araHeadCountOrganizationsSearchResults = `${araHeadCountOrganizations}/${searchResults}`;
// 2.2.3 Head Count Detail
export const araHeadCountHeadCountDetails = `${araHeadCount}/head-count-details`;
export const araHeadCountHeadCountDetailInsert = `${araHeadCountHeadCountDetails}/${insert}`;
export const araHeadCountHeadCountDetailsSearchResults = `${araHeadCountHeadCountDetails}/${searchResults}`;

// 2.3 Yatheem
export const araYatheem = `${ara}/yateem`;

// 2.3.1 Yatheem Registeration
export const araYatheemRegisteration = `${araYatheem}/registeration`;
export const araYatheemRegisterationInsert = `${araYatheemRegisteration}/${insert}`;
export const araYatheemRegisterationsSearchResults = `${araYatheemRegisteration}/${searchResults}`;

//3 CBA
export const cba = "/cba";
// 3.1 Bank
export const cbaBanks = `${cba}/bank`;
export const cbaBankInsert = `${cbaBanks}/${insert}`;
export const cbaBanksSearchResults = `${cbaBanks}/${searchResults}`;
// 3.3 Bank Contact
export const cbaBankContacts = `${cba}/bank-contact`;
export const cbaBankContactInsert = `${cbaBankContacts}/${insert}`;
export const cbaBankContactsSearchResults = `${cbaBankContacts}/${searchResults}`;
// 3.4 Payment Type
export const cbaPaymentTypes = `${cba}/payment-type`;
export const cbaPaymentTypeInsert = `${cbaPaymentTypes}/${insert}`;
export const cbaPaymentTypesSearchResults = `${cbaPaymentTypes}/${searchResults}`;
// 3.5 Payments
export const cbaPayments = `${cba}/payments`;
export const cbaPaymentInsert = `${cbaPayments}/${insert}`;
export const cbaPaymentsSearchResults = `${cbaPayments}/${searchResults}`;
// 3.6 Account Number
export const cbaAccountNumbers = `${cba}/account-number`;
export const cbaAccountNumberInsert = `${cbaAccountNumbers}/${insert}`;
export const cbaAccountNumbersSearchResults = `${cbaAccountNumbers}/${searchResults}`;
// 3.6 Bank Employee Reconciliation
export const cbaBankEmployeeReconciliations = `${cba}/bank-employee-reconciliation`;
export const cbaBankEmployeeReconciliationInsert = `${cba}/bankemployeereconciliationinsert`;
export const cbaBankEmployeeReconciliation = `${cba}/bankemployeereconciliationsearch`;
export const cbaBankEmployeeReconcile = `${cba}/bankemployeereconciliationreconcile`;
export const cbaBankEmpReconcileFromDatabase= `${cba}/bankemployeereconciliationreconcilefromdatabase`;
export const cbaBankEmployeeImport = `${cba}/bankemployeereconciliationimport`;
export const cbaBankEmployeeReconciliationsSearchResults = `${cbaBankEmployeeReconciliations}/${searchResults}`;
//4 Executive
export const executive = "/executive";
//5 Filing
export const filing = "/filing";
//5.1 Filing
export const filingFilings = `${filing}/filing`;
export const filingFilingInsert = `${filingFilings}/${insert}`;
export const filingFilingSearchResults = `${filingFilings}/${searchResults}`;

//5.2 Letter
export const filingLetters = `${filing}/letter`;
export const filingLetterInsert = `${filingLetters}/${insert}`;
export const filingLetterSearchResults = `${filingLetters}/${searchResults}`;

//5.3 FileType
export const filingFileTypes = `${filing}/file-type`;
export const filingFileTypeInsert = `${filingFileTypes}/${insert}`;
export const filingFileTypeSearchResults = `${filingFileTypes}/${searchResults}`;

// Sa
export const sa = "/sa";
// 6.1 User Management
export const saUsersMgt = `${sa}/user-management`;
// 6.1.1 Users
export const saUsersMgtUsers = `${saUsersMgt}/users`;
export const saUsersMgtUserLogs = `${saUsersMgt}/user-logs`;
export const saUserMgtInvalidAccounts = `${saUsersMgt}/invalid-accounts`;
export const saUsersMgtUserInsert = `${saUsersMgtUsers}/${insert}`;
export const saUsersMgtUsersSearchResults = `${saUsersMgtUsers}/${searchResults}`;
export const saUsersMgtUsersDirectArrayUsersResSearchResults = `${saUsersMgtUsers}/directArrayUsersResSearchResults`;
export const saUsersMgtUserLogsSearchResults = `${saUsersMgtUserLogs}/${searchResults}`;
export const saUsersMgtInvalidAccountsSearchResults = `${saUserMgtInvalidAccounts}/${searchResults}`;
// 6.1.2 Roles
export const saUsersMgtRoles = `${saUsersMgt}/roles`;
export const saUsersMgtRoleInsert = `${saUsersMgtRoles}/${insert}`;
export const saUsersMgtRolesSearchResults = `${saUsersMgtRoles}/${searchResults}`;
// 6.1.3 Login
export const saUsersMgtLogin = `/login`;
// 6.1.4 Permissions
export const saUsersMgtPermissions = `${saUsersMgt}/permission`;
export const saUsersMgtPermissionInsert = `${saUsersMgtPermissions}/${insert}`;
export const saUsersMgtPermissionsSearchResults = `${saUsersMgtPermissions}/${searchResults}`;
export const saUsersMgtModulePermissionsSearchResults = `${saUsersMgtPermissions}/module/${searchResults}`;

// 6.1.5 Modules
export const saModules = `${saUsersMgt}/modules`;
export const saModuleInsert = `${saModules}/${insert}`;
export const saModulesSearchResults = `${saModules}/${searchResults}`;

//7 Payroll
export const payroll = "/payroll";
// 7.1 Remuniration
export const payrollremuniration = `${payroll}/remuniration`;
// 7.1.1 Remuniration Type
export const payrollRemunirationTypes = `${payrollremuniration}/remuniration-type`;
export const payrollRemunirationTypeInsert = `${payrollRemunirationTypes}/${insert}`;
export const payrollRemunirationTypesSearchResults = `${payrollRemunirationTypes}/${searchResults}`;

// 7.1.2 Remuniration Detail
export const payrollRemunirationDetails = `${payrollremuniration}/remuniration-detail`;
export const payrollRemunirationDetailInsert = `${payrollRemunirationDetails}/${insert}`;
export const payrollRemunirationDetailsSearchResults = `${payrollRemunirationDetails}/${searchResults}`;

// 7.1.3 Remuniration Payment
export const payrollRemunirationPayments = `${payrollremuniration}/remuniration-payment`;
export const payrollRemunirationPaymentInsert = `${payrollRemunirationPayments}/${insert}`;
export const payrollRemunirationPaymentsSearchResults = `${payrollRemunirationPayments}/${searchResults}`;

// 7.1.4 Leave Rule Deduction
export const payrollLeaveRuleDeductions = `${payrollremuniration}/leave-rule-deduction`;
export const payrollLeaveRuleDeductionInsert = `${payrollLeaveRuleDeductions}/${insert}`;
export const payrollLeaveRuleDeductionsSearchResults = `${payrollLeaveRuleDeductions}/${searchResults}`;
// 7.1.5 Remuniration Detail Payment
export const payrollRemunirationDetailPayments = `${payrollremuniration}/remuniration-detail-payment`;
export const payrollRemunirationDetailPaymentInsert = `${payrollRemunirationDetailPayments}/${insert}`;
export const payrollRemunirationDetailPaymentsSearchResults = `${payrollRemunirationDetailPayments}/${searchResults}`;

// 7.1.5 Remuniration Detail Payment Yearly Report
export const payrollReportM40Download = `${payrollRemunirationDetailPayments}/m40form`;

// 7.1.7 Wages
export const araEmpWages = `${araEmp}/wage`;
export const araEmpWageInsert = `${araEmpWages}/${insert}`;
export const araEmpWageSearchResults = `${araEmpWages}/${searchResults}`;

// 7.1.8 Wage Details
export const araEmpWageDetails = `${araEmp}/wageDetail`;
export const araEmpWageDetailInsert = `${araEmpWageDetails}/${insert}`;
export const araEmpWageDetailSearchResults = `${araEmpWageDetails}/${searchResults}`;

// 7.1.9 Teacher Loan
export const payrollTeacherLoans = `${payrollremuniration}/teacher-loan`;
export const payrollTeacherLoanInsert = `${payrollTeacherLoans}/${insert}`;
export const payrollNewTeacherLoanInsert= `${payrollTeacherLoans}-new/${insert}`;
export const payrollTeacherLoansSearchResults = `${payrollTeacherLoans}/${searchResults}`;
// 7.1.10 Teacher Loan Istiqaq
export const payrollTeacherLoanIstiqaqs = `${payrollremuniration}/teacher-loan-istiqaq`;
export const payrollTeacherLoanIstiqaqInsert = `${payrollTeacherLoanIstiqaqs}/${insert}`;
export const payrollTeacherLoanIstiqaqsSearchResults = `${payrollTeacherLoanIstiqaqs}/${searchResults}`;

// 7.1.11 Remuniration Ikramia
export const payrollRemunirationIkramias = `${payrollremuniration}/ikramia`;
export const payrollRemunirationIkramiaInsert = `${payrollRemunirationIkramias}/${insert}`;
export const payrollRemunirationIkramiasSearchResults = `${payrollRemunirationIkramias}/${searchResults}`;

// 7.1.12 Remuniration Ikramia M41
export const payrollRemunirationIkramiasM41 = `${payrollremuniration}/ikramia-m41`;
export const payrollRemunirationIkramiaM41Insert = `${payrollRemunirationIkramiasM41}/${insert}`;
export const payrollRemunirationIkramiasM41SearchResults = `${payrollRemunirationIkramiasM41}/${searchResults}`;

// 7.2 Report
export const payrollReport = `${payroll}/report`;

// 7.2.1 Remuniration Report M41
export const payrollReportM41s = `${payrollReport}/m41`;
export const payrollReportM41Insert = `${payrollReportM41s}/${insert}`;
export const payrollReportM41SearchResults = `${payrollReportM41s}/${searchResults}`;

// 7.2.2 Bank Report M41
export const payrollBankReports = `${payrollReport}/bank-report`;

// 7.2.3 Remuniration Report M16
export const payrollReportM16s = `${payrollReport}/m16`;
export const payrollReportM16Insert = `${payrollReportM16s}/${insert}`;
export const payrollReportM16SearchResults = `${payrollReportM16s}/${searchResults}`;

// 7.2.4 Remuniration Report M16 Ikramia
export const payrollReportM16Ikramias = `${payrollReport}/m16-ikramia`;
export const payrollReportM16IkramiaInsert = `${payrollReportM16Ikramias}/${insert}`;
export const payrollReportM16IkramiaSearchResults = `${payrollReportM16Ikramias}/${searchResults}`;

//7.2.5 EmployeeReport
export const payrollReportEmployees = `${payrollReport}/employees`;
export const payrollRemunirationDetailPaymentAnualReport = `${payrollReport}/remunirationDetailPaymentAnualReport`;
export const payrollRemunirationDetailPaymentAnualReportSearchResults = `${payrollRemunirationDetailPaymentAnualReport}/${searchResults}`;


// 7.2.6 Remuniration Report salary Attachment
export const payrollReportsalaryAttachments = `${payrollReport}/salaryAttachment`;
export const payrollReportsalaryAttachmentInsert = `${payrollReportsalaryAttachments}/${insert}`;
export const payrollReportsalaryAttachmentSearchResults = `${payrollReportsalaryAttachments}/${searchResults}`;

// 7.2.7 Remuniration Report M41 Grand Total
export const payrollReportM41GrandTotals = `${payrollReport}/m41-grand-total`;
export const payrollReportM41GrandTotalInsert = `${payrollReportM41GrandTotals}/${insert}`;
export const payrollReportM41GrandTotalSearchResults = `${payrollReportM41GrandTotals}/${searchResults}`;
// 7.3  Remains
export const payrollRemains = `${payroll}/remains`;

// 7.3.1 Remuniration Remaining
export const payrollRemunirationRemainings = `${payrollRemains}/remuniration-remaining`;
export const payrollRemunirationRemainingInsert = `${payrollRemunirationRemainings}/${insert}`;
export const payrollRemunirationRemainingSearchResults = `${payrollRemunirationRemainings}/${searchResults}`;
export const payrollRemunirationRemainingsReport = `${payrollRemunirationRemainings}/report`;

// 7.3.2 Remuniration Remaining
export const deductionRemains = `${payrollRemains}/deduction-remains`;
export const deductionRemainInsert = `${deductionRemains}/${insert}`;
export const deductionRemainsSearchResults = `${deductionRemains}/${searchResults}`;
export const deductionRemainReports = `${deductionRemains}/reports`;

// 7.4 redundantMeasurement
export const payrollRedundantMeasurement=`${payroll}/redundantMeasurement`
export const payrollRedundantMeasurementInsert=`${payrollRedundantMeasurement}/${insert}`
export const payrollRedundantMeasurementsSearchResults = `${payrollRedundantMeasurement}/${searchResults}`;

//8 Attendance
export const attendance = "/attendance";

// 8.1 Leave
export const attendanceLeaves = `${attendance}/leaves`;
export const attendanceLeaveInsert = `${attendanceLeaves}/${insert}`;
export const attendanceLeavesSearchResults = `${attendanceLeaves}/${searchResults}`;

// 8.2 LeaveTypes
export const attendanceLeaveTypes = `${attendance}/leave-type`;
export const attendanceLeaveTypesInsert = `${attendanceLeaveTypes}/${insert}`;
export const attendanceLeaveTypesSearchResults = `${attendanceLeaveTypes}/${searchResults}`;

// 8.3 LeaveTypes
export const attendanceHoliday = `${attendance}/holiday`;
export const attendanceHolidayInsert = `${attendanceHoliday}/${insert}`;
export const attendanceHolidaySearchResults = `${attendanceHoliday}/${searchResults}`;

// 8.4 EmployeeLeaveReport
export const employeeLeaveReport = `${attendanceLeaves}/report`;
export const employeeLeaveReportSearchResults = `${employeeLeaveReport}/${searchResults}`;

// 8.1 Employee Attendance
export const employeeAttendance = `${attendance}/empAttendance`;
export const employeeAttendanceInsert = `${employeeAttendance}/${insert}`;
export const employeeAttendanceSearchResults = `${employeeAttendance}/${searchResults}`;

//  9 Deduction
export const deduction = "/deduction";

// 9.1 Deduction Type
export const deductionTypes = `${deduction}/deduction-type`;
export const deductionTypeInsert = `${deductionTypes}/${insert}`;
export const deductionTypesSearchResults = `${deductionTypes}/${searchResults}`;

// 9.2 Deduction Payment
export const deductionPayments = `${deduction}/deduction-payment`;
export const deductionPaymentInsert = `${deductionPayments}/${insert}`;
export const deductionPaymentsSearchResults = `${deductionPayments}/${searchResults}`;

// 9.3 Deduction Detail Payment
export const deductionDetailPayments = `${deduction}/deduction-detail-payment`;
export const deductionDetailPaymentInsert = `${deductionDetailPayments}/${insert}`;
export const deductionDetailPaymentDelete = `${deductionDetailPayments}/${"delete"}`;
export const deductionDetailPaymentApproval = `${deductionDetailPayments}/${"Approve"}`;
export const deductionDetailPaymentsSearchResults = `${deductionDetailPayments}/${searchResults}`;

// 9.4 Deductions
export const deductions = `${deduction}`;

// 10 Attendance
export const suspend = `/suspend`;
export const suspendEmployees = `${suspend}/employees`;
export const suspendEmployeeInsert = `${suspendEmployees}/${insert}`;
export const suspendEmployeesSearchResults = `${suspendEmployees}/${searchResults}`;

// 11 Import Data
export const importData = `${generalCe}/import-data`;

// 12 Pension
export const pension = `/pension`;
export const pensionIstiqaq = `${pension}/istiqaq`;

const routes = {
  home,
  dashboard,
  martyredDisabledDashboard,
  analyticReport,
  // 1 General
  general,
  // 1.1 common-entities
  // 1.1.2 Department
  generalCeDepartments,
  generalCeDepartmentInsert,
  generalCeDepartmentsSearchResults,
  generalCe,
  // 1.1.4 Institution Type
  generalCeInstitutionTypes,
  generalCeInstitutionTypeInsert,
  generalCeInstitutionTypesSearchResults,
  // 1.1.5 Institution
  generalCeInstitutions,
  generalCeInstitutionInsert,
  generalCeInstitutionsSearchResults,

  // 1.1.6 Fiscal Year
  generalCeFiscalYears,
  generalCeFiscalYearInsert,
  generalCeFiscalYearsSearchResults,

  // 1.1.7 Fiscal Month
  generalCeFiscalMonths,
  generalCeFiscalMonthInsert,
  generalCeFiscalMonthsSearchResults,

  // 1.1.8 Deduction Vendor
  generalCeAVCAccounts,
  generalCeAVCAccountInsert,
  generalCeAVCAccountsSearchResults,

  // 1.1.9 Address
  generalCeAddresses,
  generalCeAddressInsert,
  generalCeAddressesSearchResults,

  // 1.1.10 Fund
  generalCeFunds,
  generalCeFundInsert,
  generalCeFundsSearchResults,

  // 1.1.11 Project Fund
  generalCeProjectFunds,
  generalCeProjectFundInsert,
  generalCeProjectFundsSearchResults,

  //1.1.12 MOE Institution
  generalCeMoeInstitutions,
  generalCeMoeInstitutionInsert,
  generalCeMoeInstitutionsSearchResults,

  //1.1.13 Institution Remuniration
  generalCeInstitutionAccessRemunirations,
  generalCeInstitutionAccessRemunirationInsert,
  generalCeInstitutionAccessRemunirationsSearchResults,

  // 1.1.14 Institution Remuniration Details
  generalCeInstitutionRemunirationDetails,
  generalCeInstitutionRemunirationDetailInsert,
  generalCeInstitutionRemunirationDetailsSearchResults,
  
  //1.1.15 AllowedETazkiraInstitutions 
  generalCeAllowedETazkiraInstitutions,
  generalCeAllowedETazkiraInstitutionInsert,
  generalCeAllowedETazkiraInstitutionsSearchResults,

  //1.1.16 Trainings
  generalCeTrainings,
  generalCeTrainingInsert,
  generalCeTrainingsSearchResults,
  
  // 2 ARA
  ara,
  // 2.1 Employee
  araEmp,
  // 2.1.1 Employees
  araEmpEmployees,
  araEmpEmployeeInsert,
  araEmpEmployeesSearchResults,

  //Tazkira Verification
  araTazkiraVerification,
  araTazkiraVerificationInsert,
  araTazkiraVerificationsSearchResults,

  //Bank Verification
  araBankVerification,
  araBankVerificationInsert,
  araBankVerificationsSearchResults,

  // 2.1.2 Del Employees
  araEmpDelEmployees,
  araEmpDelEmployeeInsert,
  araEmpDelEmployeesSearchResults,
  // 2.1.3 Job Titles
  araEmpJobTitles,
  araEmpJobTitleInsert,
  araEmpJobTitlesSearchResults,
  // 2.1.4 Employee Status
  araEmpStatuses,
  araEmpStatusInsert,
  araEmpStatusesSearchResults,
  // 2.1.5 Employee Type
  araEmpTypes,
  araEmpTypeInsert,
  araEmpTypesSearchResults,
  // 2.1.6 Employee Education Levels
  araEmpEduLevels,
  araEmpEduLevelInsert,
  araEmpEduLevelsSearchResults,
  // 2.1.7 Martyrs Disables
  araEmpMartyresDisables,
  araEmpMartyreDisableInsert,
  araEmpMartyresDisablesSearchResults,

  // 2.1.11 Martyrs Disable Lawyers
  araEmpMartyresDisableLawyers,
  araEmpMartyreDisableLawyerInsert,
  araEmpMartyresDisableLawyersSearchResults,
  //2.1.12 Employee Account Number
  araEmpAccountNumbers,
  araEmpAccountNumberInsert,
  araEmpAccountNumbersSearchResults,
  araEmpBankAccountLetter,
  //2.1.13 Employee Type Detail
  araEmpTypeDetails,
  araEmpTypeDetailInsert,
  araEmpTypeDetailsSearchResults,
  //2.1.13 Employee Earning
  araEmpEarnings,
  araEmpEarningsSearchResults,
  // 2.2 Head Count
  araHeadCount,
  // 2.2.1 Head Count
  araHeadCountHeadCounts,
  araHeadCountHeadCountInsert,
  araHeadCountHeadCountsSearchResults,

  // 2.2.1 Total Head Count and Remuniration
  araHeadCountTotalAndRemuniration,
  araHeadCountTotalAndRemunirationInsert,
  araHeadCountTotalAndRemunirationsSearchResults,
  // 2.2.2 Organization
  araHeadCountOrganizations,
  araHeadCountOrganizationInsert,
  araHeadCountOrganizationsSearchResults,
  // 2.2.3 Head Count Detail
  araHeadCountHeadCountDetails,
  araHeadCountHeadCountDetailInsert,
  araHeadCountHeadCountDetailsSearchResults,
  // 2.3
  araYatheem,
  araYatheemRegisteration,
  araYatheemRegisterationInsert,
  araYatheemRegisterationsSearchResults,
  //3 CBA
  cba,
  // 3.1 Bank
  cbaBanks,
  cbaBankInsert,
  cbaBanksSearchResults,
  // 3.3 Bank Contact
  cbaBankContacts,
  cbaBankContactInsert,
  cbaBankContactsSearchResults,

  // 3.4 Paytype
  cbaPaymentTypes,
  cbaPaymentTypeInsert,
  cbaPaymentTypesSearchResults,
  // 3.5 Payment
  cbaPayments,
  cbaPaymentInsert,
  cbaPaymentsSearchResults,

  // 3.6 Account Number
  cbaAccountNumbers,
  cbaAccountNumberInsert,
  cbaAccountNumbersSearchResults,

  // 3.6 Bank Employee Reconciliation
  cbaBankEmployeeReconciliations,
  cbaBankEmployeeReconciliationInsert,
  cbaBankEmployeeReconcile,
  cbaBankEmpReconcileFromDatabase,
  cbaBankEmployeeReconciliation,
  cbaBankEmployeeImport,
  cbaBankEmployeeReconciliationsSearchResults,

  //4 Executive
  executive,

  //5 Filing
  filing,
  //5.1 Filing
  filingFilings,
  filingFilingInsert,
  filingFilingSearchResults,

  //5.2 Letter
  filingLetters,
  filingLetterInsert,
  filingLetterSearchResults,

  //5.3 Filing Type
  filingFileTypes,
  filingFileTypeInsert,
  filingFileTypeSearchResults,

  // 6 Sa
  // 6.1 Sa User Management
  // 6.1.1 Users
  sa,
  saUsersMgt,
  saUsersMgtUsers,
  saUsersMgtUserInsert,
  saUsersMgtUsersSearchResults,

  saUsersMgtUsersDirectArrayUsersResSearchResults,
  saUsersMgtUserLogsSearchResults,
  saUsersMgtUserLogs,
  saUsersMgtInvalidAccountsSearchResults,
  // 6.1.2 Roles
  saUsersMgtRoles,
  saUsersMgtRoleInsert,
  saUsersMgtRolesSearchResults,
  // 6.1.4 Permissions
  saUsersMgtPermissions,
  saUsersMgtPermissionInsert,
  saUsersMgtPermissionsSearchResults,
  saUsersMgtModulePermissionsSearchResults,
  // 6.1.5 Permissions
  saModules,
  saModuleInsert,
  saModulesSearchResults,

  // 6.1.3 Login
  saUsersMgtLogin,

  //7 Payroll
  payroll,
  // 7.1 Remuniration
  payrollremuniration,
  // 7.1.1 Remuniration Type
  payrollRemunirationTypes,
  payrollRemunirationTypeInsert,
  payrollRemunirationTypesSearchResults,
  // 7.1.2 Remuniration Detail
  payrollRemunirationDetails,
  payrollRemunirationDetailInsert,
  payrollRemunirationDetailsSearchResults,

  // 7.1.3 Remuniration Payment
  payrollRemunirationPayments,
  payrollRemunirationPaymentInsert,
  payrollRemunirationPaymentsSearchResults,

  // 7.1.4 Leave Rule Deduction
  payrollLeaveRuleDeductions,
  payrollLeaveRuleDeductionInsert,
  payrollLeaveRuleDeductionsSearchResults,

  // 7.1.5 Remuniration Detail Payment
  payrollRemunirationDetailPayments,
  payrollRemunirationDetailPaymentInsert,
  payrollRemunirationDetailPaymentsSearchResults,
  payrollReportM40Download,

  // 7.1.6 Remuniration Remaining
  payrollRemunirationRemainings,
  payrollRemunirationRemainingInsert,
  payrollRemunirationRemainingSearchResults,
  payrollRemunirationRemainingsReport,

  //7.1.7 Wage
  araEmpWages,
  araEmpWageInsert,
  araEmpWageSearchResults,

  //7.1.8 Wage Detail
  araEmpWageDetails,
  araEmpWageDetailInsert,
  araEmpWageDetailSearchResults,
  // 7.1.9 TeacherLoan
  payrollTeacherLoans,
  payrollTeacherLoanInsert,
  payrollNewTeacherLoanInsert,
  payrollTeacherLoansSearchResults,

  // 7.1.10 TeacherLoan Istiqaq
  payrollTeacherLoanIstiqaqs,
  payrollTeacherLoanIstiqaqInsert,
  payrollTeacherLoanIstiqaqsSearchResults,
  //7.1.11 Ikramia
  payrollRemunirationIkramias,
payrollRemunirationIkramiaInsert,
payrollRemunirationIkramiasSearchResults,
  //7.1.11 Ikramia M41
payrollRemunirationIkramiasM41,payrollRemunirationIkramiaM41Insert,payrollRemunirationIkramiasM41SearchResults,
  // 7.2
  payrollReport,

  // 7.2.1 M41 Payroll Report
  payrollReportM41s,
  payrollReportM41Insert,
  payrollReportM41SearchResults,



  // 7.2.2 Payroll Report
  payrollBankReports,

  // 7.2.3 M16 Payroll Report
  payrollReportM16s,
  payrollReportM16Insert,
  payrollReportM16SearchResults,
  // 7.2.4 M16 Ikramia
  payrollReportM16Ikramias,
  payrollReportM16IkramiaInsert,
  payrollReportM16IkramiaSearchResults,
  // 7.2.5 EmployeeReport
  payrollReportEmployees,
  payrollRemunirationDetailPaymentAnualReport,
  payrollRemunirationDetailPaymentAnualReportSearchResults,

  // 7.2.6 Salary Attachment
  payrollReportsalaryAttachments,
  payrollReportsalaryAttachmentInsert,
  payrollReportsalaryAttachmentSearchResults,

  // 7.2.7 M41 Grand Total
  payrollReportM41GrandTotals,
  payrollReportM41GrandTotalInsert,
  payrollReportM41GrandTotalSearchResults,

  // 7.2.8 Redundant Measurement
  payrollRedundantMeasurement,
  payrollRedundantMeasurementInsert,
  payrollRedundantMeasurementsSearchResults,

  // 8 Attendance
  attendance,

  // 8.1 Leave
  attendanceLeaves,
  attendanceLeaveInsert,
  attendanceLeavesSearchResults,

  // 8.2 Leave Type
  attendanceLeaveTypes,
  attendanceLeaveTypesInsert,
  attendanceLeaveTypesSearchResults,

  //8.3 Leave Type
  attendanceHoliday,
  attendanceHolidayInsert,
  attendanceHolidaySearchResults,

  //8.4 Employee Attendance
  employeeAttendance,
  employeeAttendanceInsert,
  employeeAttendanceSearchResults,
  // Leave Report
  employeeLeaveReport,
  employeeLeaveReportSearchResults,
  // 9 Deduction
  deduction,

  // 9.1 Deduction Type
  deductionTypes,
  deductionTypeInsert,
  deductionTypesSearchResults,

  // 9.2 Deduction Payment
  deductionPayments,
  deductionPaymentInsert,
  deductionPaymentsSearchResults,

  // 9.3 Deduction Detail Payment
  deductionDetailPayments,
  deductionDetailPaymentInsert,
  deductionDetailPaymentDelete,
  deductionDetailPaymentApproval,
  deductionDetailPaymentsSearchResults,

  // 9.4 Deduction Detail Payment
  deductions,
  deductionRemains,
  deductionRemainInsert,
  deductionRemainsSearchResults,
  deductionRemainReports,
  // 10 Suspend
  suspend,

  // 10.1 Suspend Employee
  suspendEmployees,
  suspendEmployeeInsert,
  suspendEmployeesSearchResults,

  // 11 import Data
  importData,
  // 12 Pension
  pension,
  pensionIstiqaq,
};

export default routes;
