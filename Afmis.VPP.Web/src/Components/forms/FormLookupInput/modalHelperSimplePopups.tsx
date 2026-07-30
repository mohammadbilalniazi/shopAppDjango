import { models } from "../../../constants/models";
import { Suspense, lazy } from "react";
import PageLoader from "../../PageLoader";


const UsersRoleInstitutionAssignmentForm = lazy(
  () =>
    import( 
      "../../../pages/sa/userManagement/Users/RoleInstitutionAssignment/UserRoleInstitutionAssignmentForm"
    )
);
const UsersInstitutionAssignmentForm = lazy(
  () => import("../../../pages/sa/userManagement/Users/AssignInstitutionUser")
);
const UsersDetails=lazy(()=>import("../../../pages/sa/userManagement/Users/Detail/Form"));
const InstitutionUsers = lazy(
  () =>
    import("../../../pages/sa/userManagement/Users/SearchResults/SearchTable")
);
const MoeInstitution = lazy(
  () => import("../../../pages/general/ce/MoeInstitutions/Insert/Form")
);
const DepartmentUpdateForm= lazy(()=>import("../../../pages/general/ce/Departments/Detail/Form"));
const RolePermissionAssignmentForm = lazy(
  () =>
    import("../../../pages/sa/userManagement/Roles/PermissionAssignmentToRole/")
);
const ModulePermissionsTable = lazy(
  () =>
    import("../../../pages/sa/userManagement/Permissions/ModulePermissionTable/ModulePermissions")
);
// Employee
const EmployeeUpdateInstitutionForm = lazy(
  () =>
    import("../../../pages/ara/Employee/Employees/Detail/UpdateInstitutionAndBasthForm")
); 
  const UpdateCFByInstLazyLoding=lazy(() => import("../../../pages/ara/Employee/Employees/NTACF/UpdateCFByInst"));
const EmpAccountNumbersBankLetter=lazy(()=>import("../../../pages/ara/Employee/EmpAccountNumbers/BankAccountLetter/index"));
const EmployeeAccountNumberUpdate = lazy(
  () => import("../../../pages/ara/Employee/EmpAccountNumbers/Detail/Form")
);
const EmployeeTazkiraVerificationUpdate = lazy(
  () => import("../../../pages/ara/Employee/TazkiraVerification/Detail/Form")
);
const TazkiraUpdateAndNestedEmployee = lazy(
  () => import("../../../pages/ara/Employee/Employees/Detail/UpdateTazkira")
);
// Password Reset Form
const PasswordResetForm = lazy(
  () => import("../../../pages/authentication/PasswordResetFormPopup")
);
// Attendance
const DeleteEmployeeAttendanceForm = lazy(
  () => import("../../../pages/attendance/Attendance/ActionsOfOneEmployee/Form")
);
const RemainingAttendanceReport = lazy(
  () =>
    import(
      "../../../pages/attendance/Attendance/Detail/RemainingAttendanceReport"
    )
);
const EMPLeaveReport = lazy(
  () => import("../../../pages/attendance/EmployeeLeaveReport/Search/Form")
);
const LeaveInsertTable = lazy(
  () => import("../../../pages/attendance/Leave/Insert/FormOnlyLeave")
);
const LeaveUpdateForm = lazy(
  () => import("../../../pages/attendance/Leave/Detail/FormPopup")
);
const AttendanceReport = lazy(
  () => import("../../../pages/attendance/Attendance/AttendanceReport/Form")
);
const TeacherLoanM41EmployeesTable = lazy(
  () =>
    import(
      "../../../pages/payroll/report/TeacherLoanIstiqaq/SearchResults/TeacherLoanM41BorrowersList"
    )
);
const TeacherLoanM41RemainEmployeesTable = lazy(
  () =>
    import(
      "../../../pages/payroll/report/TeacherLoanIstiqaq/SearchResults/TeacherLoanM41RemainEmployees"
    )
);

const TeacherLoanUpdate=lazy(()=>import("../../../pages/payroll/remuniration/TeacherLoan/Detail/Form"));
const TeacherLoanM16 = lazy(
  () =>
    import(
      "../../../pages/payroll/report/TeacherLoanIstiqaq/Insert/M16Popup"
    )
);
const SaveM16CheckNumber = lazy(()=>import("../../../pages/payroll/report/m16/Detail/SaveCheckNumber"));
const M16BankReportReconciliation = lazy(
  () =>
    import(
      "../../../pages/cba/BankEmployeesReconciliation/ReconcileBankEmployee/ReconcileBankReportWithM16Form"
    )
);
const IkramiaDetailForm = lazy(
  () =>
    import(
      "../../../pages/payroll/remuniration/Ikramias/Detail/Form"
    )
)

const IkramiaInsertForm = lazy(
  () =>
    import(
      "../../../pages/payroll/remuniration/Ikramias/Insert/Form"
    )
)
const SalaryAttachmentForm = lazy(
  () =>
    import(
      "../../../pages/payroll/report/salaryAttachment/PopupForm"
    )
)
const EmployeeUpdateDescriptionAttendance = lazy(
  () =>
    import("../../../pages/attendance/Attendance/Detail/UpdateDescriptionForm")
);

// Remuniration
const RemunirationDetailPaymentReport = lazy(
  () =>
    import(
      "../../../pages/payroll/remuniration/RemunirationDetailPayments/Detail/reportForm"
    )
);

const SuspEmpRemDetailPayReport = lazy(
  () =>
    import(
      "../../../pages/payroll/remuniration/RemunirationDetailPayments/Detail/suspEmpRemDetailPay"
    )
);

const RemunirationPaymentDelete = lazy(
  () =>
    import(
      "../../../pages/payroll/remuniration/RemunirationPayments/Detail/RemunirationPaymentDeletePopup"
    )
);
const RemDetailPayEmpYrlyReport = lazy(
  () =>
    import(
      "../../../pages/payroll/remuniration/RemunirationDetailPayments/Detail/empEarlyReportM40"
    )
);

const RemRemainEmpReport = lazy(
  () =>
    import(
      "../../../pages/payroll/remuniration/Remaining/Search/EmployeeRemainReport"
    )
);

const RemRemainInsert = lazy(
  () => import("../../../pages/payroll/remuniration/Remaining/Insert/Form")
);
const RemRemainDetail = lazy(
  () => import("../../../pages/payroll/remuniration/Remaining/Detail/Form")
);
const RemRemainReport = lazy(
  () =>
    import(
      "../../../pages/payroll/remuniration/Remaining/SearchResults/RemunirationRemainReport"
    )
);
const RemPaymentDetail = lazy(
  () => import("../../../pages/payroll/remuniration/RemunirationPayments/Detail/Form")
);
const RemunirationDetailPaymentIndividualEmployeeReport = lazy(
  () =>
    import(
      "../../../pages/payroll/remuniration/RemunirationDetailPayments/Detail/reportIndividualEmployee"
    )
);
// TashkilCode
const TashkilCodeSearchTable = lazy(
  () =>
    import(
      "../../../pages/ara/HeadCount/HeadCounts/SearchResults/PopupSearchTable"
    )
);
// Deduction
const DeductionDetailPaymentReport = lazy(
  () =>
    import("../../../pages/deduction/DeductionDetailPayments/Detail/reportForm")
);
const DedRemainInsert = lazy(
  () => import("../../../pages/deduction/DeductionRemains/Insert/Form")
);


const DeductionRemainDelete = lazy(
  () =>
    import(
      "../../../pages/deduction/DeductionRemains/Detail/DeductionRemainDeleteOn"
    )
);
const WageeReport = lazy(
  () => import("../../../pages/payroll/remuniration/WageDetails/Search/FormDownloadWageIstiqaq")
);
const PermissionsSearchTableByUserId = lazy(
  () =>
    import(
      "../../../pages/sa/userManagement/Permissions/PermissionsTableByUserId"
    )
);
const LogoutUserPage = lazy(
  () => import("../../../pages/sa/userManagement/Users/SearchResults/UserLogoutPopup")
);
const LoggedInUserList=lazy(()=>import("../../../pages/sa/userManagement/Users/LoggedInUserList/SearchTable"));
const Page404 = lazy(
  () => import("../../../pages/AuthenticationInner/Errors/Cover404")
);

type Props = {
  model: string;
  [key: string]: any;
};

export const GetSimplePopupForm: React.FC<Props> = ({ model, ...props }) => {
  switch (model) {
    case models.PERMISSIONS_BY_USER:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <PermissionsSearchTableByUserId {...props} />
        </Suspense>
      );
    case models.LOGOUT_USER_POPUP:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <LogoutUserPage {...props} />
        </Suspense>
      );
      case models.LOGGEDIN_USERS_LIST:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <LoggedInUserList {...props} />
        </Suspense>
      );
    case models.MOE_INSTITUTIONS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <MoeInstitution {...props} />
        </Suspense>
      );
    case models.DEPARTMENTS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <DepartmentUpdateForm {...props} />
        </Suspense>
      );
    case models.EMPLOYEES_INSTITUTION_AND_BASTH_UPDATE:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <EmployeeUpdateInstitutionForm {...props} />
        </Suspense>
      );
    
    case models.NTA_CFNUMBER_BY_INSTITUTION:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <UpdateCFByInstLazyLoding {...props} />
        </Suspense>
      )

      case models.DOWNLOAD_EMP_BANK_MAKTOOB:
        return (
          <Suspense fallback={<PageLoader nested={true} />}>
            <EmpAccountNumbersBankLetter {...props} />
          </Suspense>
        );
      
    case models.EMPLOYEE_ACCOUNTNUMBER_INSERT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <EmployeeAccountNumberUpdate {...props} />
        </Suspense>
      );

    case models.TAZKIRAVERIFICATION:
      return(
        <Suspense fallback={<PageLoader nested={true} />}>
          <EmployeeTazkiraVerificationUpdate {...props} />
        </Suspense>
      );
    case models.TAZKIRA_UPDATE_AND_NESTED_FORM:
      return(
           <Suspense fallback={<PageLoader nested={true} />}>
          <TazkiraUpdateAndNestedEmployee onUpdateItems={function (): unknown {
            throw new Error("Function not implemented.");
          } } params={undefined} {...props} />
        </Suspense>
      ) 
    case models.USER_ROLE_INSTITUTION_ASSIGNMENT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <UsersRoleInstitutionAssignmentForm
            disabled={props.disabled}
            {...props}
          />
        </Suspense>
      );
    case models.USER_INSTITUTION_ASSIGNMENT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <UsersInstitutionAssignmentForm {...props} />
        </Suspense>
      );
    case models.USER_DETAIL:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <UsersDetails {...props} />
        </Suspense>
      );
    case models.USERS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <InstitutionUsers {...props} />
        </Suspense>
      );
    case models.ROLE_PERMISSION_ASSIGNMENT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <RolePermissionAssignmentForm {...props} />
        </Suspense>
      );
      case models.MODULE_PERMISSIONS:
        return (
          <Suspense fallback={<PageLoader nested={true} />}>
            <ModulePermissionsTable {...props} />
          </Suspense>
        );
      
    case models.PASSWORD_RESET_FORM:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <PasswordResetForm {...props} />
        </Suspense>
      );

    case models.DELETE_EMPLOYEE_ATTENDANCE:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <DeleteEmployeeAttendanceForm {...props} />
        </Suspense>
      );
    case models.EMPLOYEE_ATTENDANCE_REPORT_SEARCH_RESULT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <RemainingAttendanceReport {...props} />
        </Suspense>
      );
    case models.EMPLOYEE_LEAVE_REPORT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <EMPLeaveReport {...props} />
        </Suspense>
      );

    case models.EMPLOYEE_LEAVE_LIST_SEARCH_RESULT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <LeaveInsertTable {...props} />
        </Suspense>
      );
    case models.EMPLOYEE_LEAVE_UPDATE:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <LeaveUpdateForm
            toggle={function (): VoidFunction {
              throw new Error("Function not implemented.");
            }}
            {...props}
          />
        </Suspense>
      );

    case models.EMPLOYEE_UPDATE_DESCRIPTION_ATTENDANCE:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <EmployeeUpdateDescriptionAttendance
            togglePopupModal={function (): void {
              throw new Error("Function not implemented.");
            } } model={""}
            label={""}
            showPopupModal={true}
            {...props}          />
        </Suspense>
      );
    case models.TEACHER_LOAN_M41_EMPLOYEES:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <TeacherLoanM41EmployeesTable {...props} />
        </Suspense> 
      );
    case models.TEACHER_LOAN_M41_REMAIN_EMPLOYEES:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <TeacherLoanM41RemainEmployeesTable {...props} />
        </Suspense>
      );
      
      case models.TEACHER_LOAN_UPDATE:
        return (
          <Suspense fallback={<PageLoader nested={true} />}>
            <TeacherLoanUpdate {...props} />
          </Suspense>
        );
      
      case models.TEACHER_LOAN_M16:
        return (
          <Suspense fallback={<PageLoader nested={true} />}>
            <TeacherLoanM16 {...props} />
          </Suspense>
        );
      case models.SAVE_M16_CHECKNO:
        return (
          <Suspense fallback={<PageLoader nested={true} />}>
            <SaveM16CheckNumber {...props} />
          </Suspense>
        );
    case models.IKRAMIA_DETALL:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <IkramiaDetailForm {...props} />
        </Suspense>
      );

    case models.IKRAMIA_INSERT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <IkramiaInsertForm {...props} />
        </Suspense>
      );

    case models.SALARY_ATTACHMENT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <SalaryAttachmentForm label={""} showPopupModal={false} togglePopupModal={function (): void {
            throw new Error("Function not implemented.");
          } } model={model} {...props} />
        </Suspense>
      );
    case models.BANK_REPORT_M16_RECONCILIATION:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <M16BankReportReconciliation {...props} />
        </Suspense>
      );
    case models.EMPLOYEE_ATTENDANCE_REPORT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <AttendanceReport {...props} />
        </Suspense>
      );
    case models.REMUNIRATION_DETAIL_PAYMENT_REPORT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <RemunirationDetailPaymentReport {...props} />
        </Suspense>
      );
    case models.SUSP_EMP_REMU_DET_PAYM_RPRT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <SuspEmpRemDetailPayReport
            togglePopupModal={function (): void {
              throw new Error("Function not implemented.");
            } } model={""}
            label={""}
            showPopupModal={true}
            {...props}          />
        </Suspense>
      );
      case models.HEAD_COUNT_TASHKILCODE:
        return (
          <Suspense fallback={<PageLoader nested={true} />}>
            <TashkilCodeSearchTable  togglePopupModal={function (): void {
              throw new Error("Function not implemented.");
            } } model={models.HEAD_COUNT_TASHKILCODE} label={""} showPopupModal={props?.showPopupModal} {...props} />
          </Suspense>
        );
    case models.REMUNIRATION_PAYMENT_DELETE:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <RemunirationPaymentDelete {...props} />
        </Suspense>
      );
      case models.DEDUCTION_REMAIN_DELETE_ON:
        return (
          <Suspense fallback={<PageLoader nested={true} />}>
            <DeductionRemainDelete {...props} />
          </Suspense>
        );
      
    case models.REMU_DET_PAYM_EMP_YRLY_RPRT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <RemDetailPayEmpYrlyReport {...props} />
        </Suspense>
      );
    case models.DEDUCTION_DETAIL_PAYMENT_REPORT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <DeductionDetailPaymentReport {...props} />
        </Suspense>
      );
   
    case models.REMUNIRATION_DETAIL_PAYMENT_INDIVIDUAL_EMPLOYEE_REPORT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <RemunirationDetailPaymentIndividualEmployeeReport {...props} />
        </Suspense>
      );
    case models.REMU_REMAIN_EMP_RPRT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <RemRemainEmpReport {...props} />
        </Suspense>
      );
    case models.REM_REMAIN_INSERT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <RemRemainInsert isPopup={true} {...props} />
        </Suspense>
      );
    case models.REMU_REMAIN_RPRT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <RemRemainReport
            gridRef={undefined}
            defaultColDef={undefined}
            {...props}
          />
        </Suspense>
      );
    case models.REMU_REMAIN_DETAIL:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <RemRemainDetail gridRef={undefined} {...props} />
        </Suspense>
      );
      case models.REMU_PAYMENT_DETAIL:
        return (
          <Suspense fallback={<PageLoader nested={true} />}>
            <RemPaymentDetail {...props}/>
          </Suspense>
        );
      
    case models.DED_REMAIN_INSERT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <DedRemainInsert isPopup={true} {...props} />
        </Suspense>
      );
    case models.WAGE_REPORT:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <WageeReport {...props} />
        </Suspense>
      );
    default:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <Page404 nested />
        </Suspense>
      );
  }
};
