import { useEffect, useState } from "react";

import routes from "../routes/routes";
import useAppNavigate from "../hooks/common/useAppNavigate";
import { getProtectedRoute } from "../services/routeHandling";
import { useTranslation } from "react-i18next";

const Navdata: React.FC = () => {
  const { navigate } = useAppNavigate();
  const { t } = useTranslation();
  // Dashboard navigation
  const [isDashboard, setIsDashboard] = useState(false);
  const [isAnalyticReport, setIsAnalyticReport] = useState(false);
  
  // CBA
  const [isCbaBank, setIsCbaBank] = useState(false);
  const [isCBA, setIsCBA] = useState(false);
  const [isRemains, setIsRemains] = useState(false);
  const [isCbaAccountNumber, setIsCbaAccountNumber] = useState(false);
  const [isCbaBankContact, setIsCbaBankContact] = useState(false);
  const [isCbaPaymentType, setIsCbaPaymentType] = useState(false);
  const [isCbaPayment, setIsCbaPayment] = useState(false);
  // const [isCbaReconciliation, setIsCbaReconciliation] = useState(false);
  const [isCbaBankEmployeeReconciliation, setIsCbaBankEmployeeReconciliation] = useState(false);
  const [iscurrentState, setIscurrentState] = useState("Dashboard");

  // GENERAL
  const [isGeneral, setIsGeneral] = useState(false);
  const [isGeneralInstitutionType, setIsGeneralInstitutionType] =
    useState(false);
  const [isGeneralInstitution, setIsGeneralInstitution] = useState(false);
  const [isAllowedETazkiraInstitution, setIsAllowedETazkiraInstitution] = useState(false);
  const [
    isGeneralInstitutionAccessRemuniration,
    setIsGeneralInstitutionAccessRemuniration,
  ] = useState(false);
  const [isGeneralMoeInstitution, setIsGeneralMoeInstitution] = useState(false);
  const [isGeneralFiscalYear, setIsGeneralFiscalYear] = useState(false);
  const [isGeneralFiscalMonth, setIsGeneralFiscalMonth] = useState(false);
  const [isGeneralDepartment, setIsGeneralDepartment] = useState(false);
  const [isGeneralAVCAccount, setIsGeneralAVCAccount] = useState(false);
  const [isGeneralAddress, setIsGeneralAddress] = useState(false);

  const [isGeneralFund, setIsGeneralFund] = useState(false);
    const [isGeneralTraining, setIsGeneralTraining] = useState(false);
  const [isGeneralProjectFund, setIsGeneralProjectFund] = useState(false);
  const [isImportData, setIsImportData] = useState(false);
  // ARA
  const [isAra, setIsAra] = useState(false);
  const [isAraEmployee, setIsAraEmployee] = useState(false);
  const [isAraHeadCount, setIsAraHeadCount] = useState(false);
  const [isAraYatheem, setIsAraYatheem] = useState(false);
  const [isExecutive, setIsExecutive] = useState(false);

  // Filing
  const [isFiling, setIsFiling] = useState(false);
  const [isFilingFiling, setIsFilingFiling] = useState(false);
  const [isFilingLetter, setIsFilingLetter] = useState(false);
  const [isFilingFileType, setIsFilingFileType] = useState(false);

  // System Administration
  const [isSystemAdministration, setIsSystemAdministration] = useState(false);
  const [isSAUsersManagement, setIsSAUsersManagement] = useState(false);
  // const [isSAUserLogsManagement, setIsSAUserLogsManagement] =
  //   useState(false);
  const [isSAUserRolesManagement, setIsSAUserRolesManagement] = useState(false);
  const [isSAUserModulesManagement, setIsSAUserModulesManagement] = useState(false);
  const [isSAUserPermissionsManagement, setIsSAUserPermissionsManagement] =
    useState(false);

  // Payroll
  const [isPayroll, setIsPayroll] = useState(false);
  const [isRemunerationPayment, setIsRemunerationPayment] = useState(false);
  const [isDeductionPayment, setIsDeductionPayment] = useState(false);
  const [isPayrollRemuniration, setIsPayrollRemuniration] = useState(false);
  const [isIkramia, setIsIkramia] = useState(false);

  // Attendance
  const [isAttendance, setIsAttendance] = useState(false);

  // Deduction
  const [isDeduction, setIsDeduction] = useState(false);

  // Report
  const [isReport, setIsReport] = useState(false);

  // Suspend
  const [isSuspend, setIsSuspend] = useState(false);

  // Pension
  // const [isPensionIstiqaq, setIsPensionIstiqaq] = useState(false);

  const [isSalaryCreate, setIsSalaryCreate] = useState(false);
  const [isWageDetails, setIsWageDetails] = useState(false);
  const [isTeacherLoan, setIsTeacherLoan] = useState(false);

  function updateIconSidebar(e: React.MouseEvent<HTMLElement>) {
    if (
      e &&
      e.target &&
      (e.target as HTMLInputElement).getAttribute("subitems")
    ) {
      const ul = document.getElementById("two-column-menu");
      const iconItems = ul?.querySelectorAll(".nav-icon.active");
      if (iconItems) {
        const activeIconItems = [...iconItems];
        activeIconItems.forEach((item) => {
          item.classList.remove("active");
          const id: string = item.getAttribute("subitems") as string;
          if (document.getElementById(id))
            document.getElementById(id)?.classList.remove("show");
        });
      }
    }
  }

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");

    if (iscurrentState !== "CbaModule") {
      setIsCBA(false);
    }
    if (iscurrentState !== "AraModule") {
      setIsAra(false);
    }
    if (iscurrentState !== "executive") {
      setIsExecutive(false);
    }
    if (iscurrentState !== "GeneralModule") {
      setIsGeneral(false);
    }
    if (iscurrentState !== "FilingModule") {
      setIsFiling(false);
    }
    if (iscurrentState !== "PayrollModule") {
      setIsPayroll(false);
    }
    if (iscurrentState !== "AttendanceModule") {
      setIsAttendance(false);
    }
    if (iscurrentState !== "SystemAdministrationModule") {
      setIsSystemAdministration(false);
    }
  
    if (iscurrentState !== "SuspendModule") {
      setIsSuspend(false);
    }
    // if (iscurrentState !== "PensionIstiqaq") {
    //   setIsPensionIstiqaq(false);
    // }
    if (iscurrentState !== "RemunirationPayment") {
      setIsRemunerationPayment(false);
    }
    if (iscurrentState !== "Ikramia") {
      setIsIkramia(false);
    }
    if (iscurrentState !== "DeductionPayment") {
      setIsDeductionPayment(false);
    }
  }, [
    navigate,
    iscurrentState,
    isGeneral,
    isAra,
    isCBA,
    isExecutive,
    isFiling,
    isPayroll,
    isAttendance,
    isSuspend,
    isRemains,
    isRemunerationPayment,
    isSystemAdministration,
  ]);

  const menuItems = [
    {
      id: "Dashboard",
      label: t("Dashboard"),
      icon: "ri-dashboard-fill",
      link: routes.dashboard,
      isSubItem: false,
      stateVariables: isDashboard,
      click: function (e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        setIsDashboard(!isDashboard);
        setIscurrentState("dashboard");
        updateIconSidebar(e);
      },
    },
    {
      id: "Analytical",
      label: t("AnalyticReport"),
      icon: "ri-bar-chart-2-fill",
      link: routes.analyticReport,
      isSubItem: false,
      stateVariables: isAnalyticReport,
      click: function (e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        setIsAnalyticReport(!isAnalyticReport);
        setIscurrentState("anayltic-report");
        updateIconSidebar(e);
      },
    },
 
    // General
    {
      id: "GeneralModule",
      label: t("General"),
      icon: "ri-settings-line",
      link: routes.general,
      isSubItem: true,
      stateVariables: isGeneral,
      click: function (e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        setIsGeneral(!isGeneral);
        setIscurrentState("GeneralModule");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "InstitutionTypes",
          label: t("InstitutionsType"),
          parentId: "GeneralModule",
          isChildItem: false,
          link: routes.generalCeInstitutionTypes,
          stateVariables: isGeneralInstitutionType,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsGeneralInstitutionType(!isGeneralInstitutionType);
          },
        },
        {
          id: "Institutions-Search",
          label: t("Institutions"),
          parentId: "GeneralModule",
          isChildItem: false,
          link: routes.generalCeInstitutions,
          stateVariables: isGeneralInstitution,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsGeneralInstitution(!isGeneralInstitution);
          },
        },
        {
          id: "AllowedETazkiraInstitutions-Search",
          label: t("AllowedETazkiraInstitution"),
          parentId: "GeneralModule",
          isChildItem: false,
          link: routes.generalCeAllowedETazkiraInstitutions,
          stateVariables: isAllowedETazkiraInstitution,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsAllowedETazkiraInstitution(!isAllowedETazkiraInstitution);
          },
        },
        {
          id: "MoeInstitutionDetails",
          label: t("MoeInstitution"),
          parentId: "GeneralModule",
          isChildItem: false,
          link: routes.generalCeMoeInstitutions,
          stateVariables: isGeneralMoeInstitution,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsGeneralMoeInstitution(!isGeneralMoeInstitution);
          },
        },

        {
          id: "InstitutionAccessRemunirations",
          label: t("InstitutionAccessRemunirations"),
          parentId: "GeneralModule",
          isChildItem: false,
          link: routes.generalCeInstitutionAccessRemunirations,
          stateVariables: isGeneralInstitutionAccessRemuniration,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsGeneralInstitutionAccessRemuniration(
              !isGeneralInstitutionAccessRemuniration
            );
          },
        },
        {  
          id: "FiscalYears",
          label: t("FiscalYear"),
          parentId: "GeneralModule",
          isChildItem: false,
          link: routes.generalCeFiscalYears,
          stateVariables: isGeneralFiscalYear,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsGeneralFiscalYear(!isGeneralFiscalYear);
          },
        },
        {
          id: "FiscalMonths",
          label: t("FiscalMonth"),
          parentId: "GeneralModule",
          isChildItem: false,
          link: routes.generalCeFiscalMonths,
          stateVariables: isGeneralFiscalMonth,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsGeneralFiscalMonth(!isGeneralFiscalMonth);
          },
        },

        {
          id: "Departments",
          label: t("Department"),
          parentId: "GeneralModule",
          isChildItem: false,
          link: routes.generalCeDepartments,
          stateVariables: isGeneralDepartment,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsGeneralDepartment(!isGeneralDepartment);
          },
        },
        {
          id: "AVCAccounts",
          label: t("DeductionVendor"),
          parentId: "GeneralModule",
          isChildItem: false,
          link: routes.generalCeAVCAccounts,
          stateVariables: isGeneralAVCAccount,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsGeneralAVCAccount(!isGeneralAVCAccount);
          },
        },
        {
          id: "Adresses",
          label: t("Address"),
          parentId: "GeneralModule",
          isChildItem: false,
          link: routes.generalCeAddresses,
          stateVariables: isGeneralAddress,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsGeneralAddress(!isGeneralAddress);
          },
        },

        {
          id: "Funds",
          label: t("Fund"),
          parentId: "GeneralModule",
          isChildItem: false,
          link: routes.generalCeFunds,
          stateVariables: isGeneralFund,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsGeneralFund(!isGeneralFund);
          },
        },
        {
          id: "TrainingAttachments-Search",
          label: t("Training"),
          parentId: "GeneralModule",
          isChildItem: false,
          link: routes.generalCeTrainingInsert,
          stateVariables: isGeneralTraining,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsGeneralTraining(!isGeneralTraining);
          },
        },
        {
          id: "ImportDatas-ImportMoEInstitutionData",
          label: t("ImportData"),
          parentId: "GeneralModule",
          isChildItem: false,
          link: routes.importData,
          stateVariables: isImportData,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsImportData(!isImportData);
          },
        },
        {
          id: "ProjectFunds",
          label: t("ProjectFunds"),
          parentId: "GeneralModule",
          isChildItem: false,
          link: routes.generalCeProjectFunds,
          stateVariables: isGeneralProjectFund,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsGeneralProjectFund(!isGeneralProjectFund);
          },
        },
        {
          id: "RemunirationModule",
          label: t("Remunirationes"),
          parentId: "GeneralModule",
          isChildItem: true,

          link: routes.payrollremuniration,
          stateVariables: isPayrollRemuniration,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsPayrollRemuniration(!isPayrollRemuniration);
          },
          childItems: [
            {
              id: "RemunirationTypes-Search",
              label: t("RemunirationType"),
              link: getProtectedRoute(routes.payrollRemunirationTypes),
              parentId: "RemunirationModule",
            },
            {
              id: "RemunirationDetail",
              label: t("RemunirationTypeDetails"),
              link: getProtectedRoute(routes.payrollRemunirationDetails),
              parentId: "RemunirationModule",
            },
            {
              id: "LeaveRulesDeductions",
              label: t("RuleOfLeaveAndRemunirationDeductions"),
              link: getProtectedRoute(routes.payrollLeaveRuleDeductions),
              parentId: "RemunirationModule",
            },
              {
              id: "InstitutionRemunirationDetails",
              label: t("InstitutionRemunirationDetails"),
              link: getProtectedRoute(routes.generalCeInstitutionRemunirationDetails),
              parentId: "RemunirationModule",
            },
          ],
        },
        {
          id: "DeductionModule", // We have Deductions Controller Permission
          label: t("Deductions"),
          parentId: "GeneralModule",
          isChildItem: true,

          link: routes.deduction,
          stateVariables: isDeduction,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsDeduction(!isDeduction);
          },
          childItems: [
            {
              id: "DeductionTypes-Search",
              label: t("DeductionsType"),
              link: getProtectedRoute(routes.deductionTypes),
              parentId: "DeductionModule",
            },
          ],
        },
      ],
    },
    // CBA
    {
      id: "CbaModule",
      label: t("Banking"),
      icon: "ri-bank-fill",
      link: routes.cba,
      isSubItem: true,
      stateVariables: isCBA,
      click: function (e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        setIsCBA(!isCBA);
        setIscurrentState("CbaModule");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "Banks",
          label: t("Bank"),
          parentId: "CbaModule",
          isChildItem: false,
          link: routes.cbaBanks,
          stateVariables: isCbaBank,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsCbaBank(!isCbaBank);
          },
        },

        {
          id: "BankContacts",
          label: t("BankContact"),
          parentId: "CbaModule",
          isChildItem: false,
          link: routes.cbaBankContacts,
          stateVariables: isCbaBankContact,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsCbaBankContact(!isCbaBankContact);
          },
        },
        {
          id: "PaymentTypes",
          label: t("PaymentType"),
          parentId: "CbaModule",
          isChildItem: false,
          link: routes.cbaPaymentTypes,
          stateVariables: isCbaPaymentType,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsCbaPaymentType(!isCbaPaymentType);
          },
        },
        {
          id: "Payments",
          label: t("Payment"),
          parentId: "CbaModule",
          isChildItem: false,
          link: routes.cbaPayments,
          stateVariables: isCbaPayment,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsCbaPayment(!isCbaPayment);
          },
        },
        {
          id: "AccountNumbers",
          label: t("AccountNumbers"),
          parentId: "CbaModule",
          isChildItem: false,
          link: routes.cbaAccountNumbers,
          stateVariables: isCbaAccountNumber,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsCbaAccountNumber(!isCbaAccountNumber);
          },
        },
 
        {
          id: "BankEmployees",
          label: t("ReconcilingBankEmployees"),
          parentId: "CbaModule",
          isChildItem: true,
          link: routes.cbaBankEmployeeReconciliations,
          stateVariables: isCbaBankEmployeeReconciliation,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsCbaBankEmployeeReconciliation(!isCbaBankEmployeeReconciliation);
          },
          childItems: [
            {
              id: "BankEmployees-ReconcileBankEmployees",
              label: t("BankReportReconciliation"),
              link: routes.cbaBankEmployeeReconcile,
              parentId: "BankEmployees",
            },
            {
              id: "BankEmployees-ReconcileEmployeesFromDatabase",
              label: t("ReconcileEmployeesFromDB"),
              link: routes.cbaBankEmpReconcileFromDatabase,
              parentId: "BankEmployees",
            },
            {
              id: "BankEmployees-ImportBankEmployees",
              label: t("ImportBankEmployees"),
              link: routes.cbaBankEmployeeImport,
              parentId: "BankEmployees",
            },
            {
              id: "BankEmployees-Search",
              label: t("BankEmployeeReconciliationsSearch"),
              link: routes.cbaBankEmployeeReconciliations,
              parentId: "BankEmployees",
            },
          ],
        },
      ],
    },

    // Filing
    {
      id: "FilingModule",
      label: t("Filing"),
      icon: "ri-file-fill",
      link: routes.filing,
      isSubItem: true,
      stateVariables: isFiling,
      click: function (e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        setIsFiling(!isFiling);
        setIscurrentState("FilingModule");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "Filing",
          label: t("File"),
          parentId: "FilingModule",
          isChildItem: false,
          link: routes.filingFilings,
          stateVariables: isFilingFiling,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsFilingFiling(!isFilingFiling);
          },
        },
        {
          id: "Letter",
          label: t("Letter"),
          parentId: "FilingModule",
          isChildItem: false,
          link: routes.filingLetters,
          stateVariables: isFilingLetter,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsFilingLetter(!isFilingLetter);
          },
        },
        {
          id: "FileTypes",
          label: t("FilesType"),
          parentId: "FilingModule",
          isChildItem: false,
          link: routes.filingFileTypes,
          stateVariables: isFilingFileType,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsFilingFileType(!isFilingFileType);
          },
        },
      ],
    },
    // ARA
    {
      id: "Ara",
      label: t("Employees"),
      icon: "ri-group-fill",
      link: routes.ara,
      isSubItem: true,
      stateVariables: isAra,
      click: function (e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        setIsAra(!isAra);
        setIscurrentState("AraModule");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "HeadCountModule",
          label: t("Tashkeel"),
          parentId: "Ara",
          isChildItem: true,
          link: routes.araHeadCountHeadCounts,
          stateVariables: isAraHeadCount,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsAraHeadCount(!isAraHeadCount);
          },
          childItems: [
            {
              id: "TashkilCodes-ImportTaskilCode",
              label: t("TotalTashkeel"),
              link: routes.araHeadCountHeadCounts,
              parentId: "HeadCountModule",
            },
            {
              id: "HeadCounts",
              label: t("HeadCountTotalAndRemuniration"),
              link: routes.araHeadCountTotalAndRemuniration,
              parentId: "HeadCountModule",
            },
            
            {
              id: "HeadCountDetails",
              label: t("TashkeelDetails"),
              link: routes.araHeadCountHeadCountDetails,
              parentId: "HeadCountModule",
            },
            
          ],
        },
        {
          id: "EmployeesSubModule",
          label: t("Employees"),
          parentId: "Ara",
          isChildItem: true,
          link: routes.araEmp,
          stateVariables: isAraEmployee,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsAraEmployee(!isAraEmployee);
          },

          childItems: [
            {
              id: "Employees-Search",
              label: t("SaveEmployees"),
              link: routes.araEmpEmployees, 
              parentId: "EmployeeModule",
            },
            {
              id: "DelEmployees",
              label: t("DelEmployees"),
              link: routes.araEmpDelEmployees,
              parentId: "EmployeeModule",
            },
            {
              id: "ETazkiras-Search",
              label: t("verifyTazkira"),
              link: routes.araTazkiraVerification,
              parentId: "EmployeeModule",
            },
            {
              id: "ETazkiraAccountNumbers-Search",
              label: t("verifyBank"),
              link: routes.araBankVerification,
              parentId: "EmployeeModule",
            },
            {
              id: "EmployeeStatus",
              label: t("EmployeeStatus"),
              link: routes.araEmpStatuses,
              parentId: "EmployeeModule",
            },
            {
              id: "EmployeeType",
              label: t("EmployeeType"),
              link: routes.araEmpTypes,
              parentId: "EmployeeModule",
            },

            {
              id: "EmpEduLevel",
              label: t("EmployeeEducation"),
              link: routes.araEmpEduLevels,
              parentId: "EmployeeModule",
            },

            {
              id: "Employees-EmployeeBankAccountSearch",
              label: t("EmployeeBankAccount"),
              link: routes.araEmpAccountNumbers,
              parentId: "EmployeeModule", 
            },
            {
              id: "EmployeeTypeDetails",
              label: t("EmployeeTypeDetails"),
              link: routes.araEmpTypeDetails,
              parentId: "EmployeeModule",
            },
            {
              id: "Wages",
              label: t("HaqAlZahmaOutOfHeadCount"),
              link: getProtectedRoute(routes.araEmpWages),
              parentId: "EmployeeModule",
            },
          ],
        },

        {
          id: "YatheemMartyreDisable",
          label: t("MartyrAndDisables"),
          parentId: "AraModule",
          isChildItem: true,
          link: routes.araYatheem,
          stateVariables: isAraYatheem,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsAraYatheem(!isAraYatheem);
          },
          childItems: [
            {
              id: "MartyrDisableLawyers",
              label: t("Lawyer"),
              link: routes.araEmpMartyresDisableLawyers,
              parentId: "EmployeeModule",
            },
            {
              id: "MartyrsDisables",
              label: t("MartyrOrDisable"),
              link: routes.araEmpMartyresDisables,
              parentId: "EmployeeModule",
            },
            {
              id: "Orphans",
              label: t("orphan"),
              link: routes.araYatheemRegisteration,
              parentId: "Yatheem",
            },
            {
              id:"Dashboard-MartyredDisabled",
              label: t("MartyredDisabledDashboard"),
              link: routes.martyredDisabledDashboard,
              parentId: "YatheemMartyreDisable",
            }
          ],
        },
      ],
    },
    // Attendance
    {
      id: "AttendanceModule",
      label: t("Attendance"),
      icon: "ri-time-line",
      // link: getProtectedRoute(routes.sa),
      link: routes.attendance,
      isSubItem: true,
      stateVariables: isAttendance,

      click: function (e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        setIsAttendance(!isAttendance);
        setIscurrentState("AttendanceModule");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "LeaveTypes",
          label: t("LeaveType"),
          link: getProtectedRoute(routes.attendanceLeaveTypes),
          parentId: "AttendanceModule",
        },

        {
          id: "Holidays",
          label: t("GeneralHoliday"),
          link: getProtectedRoute(routes.attendanceHoliday),
          parentId: "AttendanceModule",
        },
        {
          id: "EmployeeAttendance",
          label: t("CreationOfAttendance"),
          link: getProtectedRoute(routes.employeeAttendance),
          parentId: "AttendanceModule",
        },
        {
          id: "Leaves-LeaveReport", //"Leaves-LeaveReports",
          label: t("EmployeeLeaveReport"),
          link: getProtectedRoute(routes.employeeLeaveReport),
          parentId: "AttendanceModule",
        },
      ],
    },

    // Payroll
    {
      id: "PayrollModule",
      label: t("Salaries"),
      icon: "ri-wallet-3-line",
      // link: getProtectedRoute(routes.sa),
      link: routes.payroll,
      isSubItem: true,
      stateVariables: isPayroll,

      click: function (e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        setIsPayroll(!isPayroll);
        setIscurrentState("PayrollModule");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "RemainsModule",
          label: t("Remains"),
          parentId: "PayrollModule",
          isChildItem: true,
          link: routes.payrollReport,
          stateVariables: isRemains,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsRemains(!isRemains);
          },
          childItems: [
            {
              id: "RemunirationRemains",
              label: t("ArrearsRemunirationPayment"),
              link: getProtectedRoute(routes.payrollRemunirationRemainings),
              parentId: "RemainsModule",
            },
            {
              id: "DeductionRemains",
              label: t("DeductiosArrearsPayment"),
              link: getProtectedRoute(routes.deductionRemains),
              parentId: "RemainsModule",
            },
            {
              id: "RedundantMeasurements-Post",
              label: t("RedundantMeasurement"),
              link: getProtectedRoute(routes.payrollRedundantMeasurement),
              parentId: "RemainsModule",
            },
          ],
        },

        {
          id: "RemunirationDetailPayments",
          label: t("SalaryCreate"),
          parentId: "PayrollModule",
          isChildItem: false,
          link: routes.payrollRemunirationDetailPayments,
          stateVariables: isSalaryCreate,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsSalaryCreate(!isSalaryCreate);
          },
        },
        {
          id: "RemunirationPayment",
          label: t("EmployeeRemunirations"),
          icon: "ri-bank-fill",
          link: routes.payrollRemunirationPayments,
          isChildItem: false,
          stateVariables: isRemunerationPayment,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsRemunerationPayment(!isRemunerationPayment);
            setIscurrentState("RemunirationPayment");
            updateIconSidebar(e);
          },
        },
        {
          id: "Ikramias",
          label: t("Ikramia"),
          icon: "ri-bank-fill",
          link: routes.payrollRemunirationIkramias,
          isChildItem: false,
          stateVariables: isIkramia,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsIkramia(!isIkramia);
            setIscurrentState("Ikramia");
            updateIconSidebar(e);
          },
        },
        {
          id: "DeductionPayment",
          label: t("EmployeeDeductions"),
          icon: "ri-bank-fill",
          link: routes.deductionPayments,
          isChildItem: false,
          stateVariables: isDeductionPayment,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsDeductionPayment(!isDeductionPayment);
            setIscurrentState("DeductionPayment");
            updateIconSidebar(e);
          },
        },

        {
          id: "WageDetails",
          label: t("HaqAlZahmaDetails"),
          parentId: "PayrollModule",
          isChildItem: false,
          link: routes.araEmpWageDetails,
          stateVariables: isWageDetails,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsWageDetails(!isWageDetails);
          },
        },
        {
          id: "OldTeacherLoan-Get",
          label: t("OldTeacherLoan"),
          parentId: "PayrollModule",
          isChildItem: false,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          link: getProtectedRoute(routes.payrollTeacherLoanInsert),
          stateVariables: isTeacherLoan,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsTeacherLoan(!isTeacherLoan);
          },
        },
        {
          id: "TeacherLoans-Post",
          label: t("NewTeacherLoan"),
          parentId: "PayrollModule",
          isChildItem: false,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          link: getProtectedRoute(routes.payrollNewTeacherLoanInsert),
          stateVariables: isTeacherLoan,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsTeacherLoan(!isTeacherLoan);
          },
        },
        {
          id: "ReportModule",
          label: t("Report"),
          parentId: "PayrollModule",
          isChildItem: true,
          link: routes.payrollReport,
          stateVariables: isReport,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsReport(!isReport);
          },
          childItems: [
            {
              id: "Istiqaq-Search",
              label: t("M41"),
              link: getProtectedRoute(routes.payrollReportM41s),
              parentId: "ReportModule",
            },
        
            {
              id: "M41GrandTotal-Search",
              label: t("M41GrandTotal"),
              link: getProtectedRoute(routes.payrollReportM41GrandTotals),
              parentId: "ReportModule",
            },
                 
            {
              id: "M16Report-Search",
              label: t("M16"),
              link: getProtectedRoute(routes.payrollReportM16s),
              parentId: "ReportModule",
            },
            {
              id: "M16Report-M40Download",
              label: t("M40"),
              link: getProtectedRoute(
                routes.payrollReportM40Download
              ),
              parentId: "ReportModule",
            },
            {
              id: "TeacherLoans-SearchM41",
              label: t("TeacherLoansDownloadM41"),
              link: getProtectedRoute(routes.payrollTeacherLoanIstiqaqs),
              parentId: "ReportModule",
            },
            {
              id: "Ikramias-SearchM41",
              label: t("M41Ikramia"),
              link: getProtectedRoute(routes.payrollRemunirationIkramiaM41Insert),
              parentId: "ReportModule",
            }, {
              id: "IkramiaM16Report-Search",
              label: t("M16Ikramia"),
              link: getProtectedRoute(routes.payrollReportM16Ikramias),
              parentId: "ReportModule",
            }, 
           
            {
              id: "RemunirationDetailPayments-EmployeeYearlyReport",
              label: t("AnualReportsSearch"),
              link: getProtectedRoute(
                routes.payrollRemunirationDetailPaymentAnualReport
              ),
              parentId: "ReportModule",
            },
          ],
        },
      ],
    },

    // Sa
    // System Administration
    {
      id: "SystemAdministrationModule",
      label: t("SystemAdministration"),
      // icon: "ri-admin-fill",
      icon: "ri-settings-3-line",
      // link: getProtectedRoute(routes.sa),
      link: routes.sa,
      isSubItem: true,
      stateVariables: isSystemAdministration,

      click: function (e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        setIsSystemAdministration(!isSystemAdministration);
        setIscurrentState("SystemAdministrationModule");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "ApplicationUserModule",
          label: t("UserManagement"),
          parentId: "SystemAdministrationModule",
          isChildItem: true,
          link: routes.saUsersMgt,
          stateVariables: isSAUsersManagement,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsSAUsersManagement(!isSAUsersManagement);
          },
          childItems: [
            {
              id: "ApplicationUsers-Search",
              label: t("User"),
              link: routes.saUsersMgtUsers,
              parentId: "ApplicationUserModule",
            },
            {
              id: "UserLoginLogs-Search",
              label: t("LoginedUserLogs"),
              link: routes.saUsersMgtUserLogs,
              parentId: "ApplicationUserModule",
            },
            {
              id: "ApplicationUsers-InvalidAccounts",
              label: t("AccountProblems"),
              link: routes.saUsersMgtInvalidAccountsSearchResults,
              parentId: "ApplicationUserModule",
            },
          ],
        },
        {
          id: "ApplicationModules",
          label: t("module"),
          parentId: "SystemAdministrationModule",
          // isChildItem: true,
          isChildItem: false,
          // link: routes.saUsersMgt,
          link: getProtectedRoute(routes.saModules),
          stateVariables: isSAUserModulesManagement,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsSAUserModulesManagement(!isSAUserModulesManagement);
          },
        },
        {
          id: "ApplicationRoles",
          label: t("role"),
          parentId: "SystemAdministrationModule",
          // isChildItem: true,
          isChildItem: false,
          // link: routes.saUsersMgt,
          link: getProtectedRoute(routes.saUsersMgtRoles),
          stateVariables: isSAUserRolesManagement,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsSAUserRolesManagement(!isSAUserRolesManagement);
          },
        },
        {
          id: "AppPermissions-Search",
          label: t("Permission"),
          parentId: "SystemAdministrationModule",
          isChildItem: false,
          link: routes.saUsersMgtPermissions,
          stateVariables: isSAUserPermissionsManagement,
          click: function (e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            setIsSAUserPermissionsManagement(!isSAUserPermissionsManagement);
          },
        },
        // {
        //   id: "AppPermissions-Search",
        //   label: t("ModulePermission"),
        //   parentId: "SystemAdministrationModule",
        //   isChildItem: false,
        //   link: routes.saUsersMgtModulePermissionsSearchResults,
        //   stateVariables: isSAUserPermissionsManagement,
        //   click: function (e: React.MouseEvent<HTMLElement>) {
        //     e.preventDefault();
        //     setIsSAUserPermissionsManagement(!isSAUserPermissionsManagement);
        //   },
        // },
      ],
    },
  ];
  return <>{menuItems}</>;
};
export default Navdata;
