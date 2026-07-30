import { lazy, Suspense } from "react";

import PageLoader from "../../PageLoader";
import { models } from "../../../constants/models";
import { ObjectAny } from "../../../types/base";

// import { ObjectAny } from "../../../types/base";
// import { models } from "../../../constants/models";

const Page404 = lazy(
  () => import("../../../pages/AuthenticationInner/Errors/Cover404")
);

// General

const InstitutionsSearchForm = lazy(
  () => import("../../../pages/general/ce/Institutions/Search/Form")
);
const InstitutionsSearchTable = lazy(
  () =>
    import("../../../pages/general/ce/Institutions/SearchResults/SearchTable")
);
const InstitutionDetailForm = lazy(
  () => import("../../../pages/general/ce/Institutions/Detail/Nested")
);
// Account Number
const AccountNumbersSearchForm = lazy(
  () => import("../../../pages/cba/AccountNumbers/Search/Form")
);
const AccountNumbersSearchTable = lazy(
  () => import("../../../pages/cba/AccountNumbers/SearchResults/SearchTable")
);
const AccountNumberDetailForm = lazy(
  () => import("../../../pages/cba/AccountNumbers/Detail/Nested")
);

// ARA
// Head Count Detail
const HeadCountDetailsSearchForm = lazy(
  () => import("../../../pages/ara/HeadCount/HeadCountDetails/Search/FormCode")
);
const HeadCountDetailsCompleteSearchForm = lazy(
  () => import("../../../pages/ara/HeadCount/HeadCountDetails/Search/Form")
);
const HeadCountDetailsSearchTable = lazy(
  () =>
    import(
      "../../../pages/ara/HeadCount/HeadCountDetails/SearchResults/SearchTable"
    )
);
const HeadCountDetailDetailForm = lazy(
  // () => import("../../../pages/ara/HeadCount/HeadCountDetails/Detail/Nested")

  () => import("../../../pages/ara/HeadCount/HeadCountDetails/Detail/Nested")
);





// Employee
const EmployeesSearchForm = lazy(
  () => import("../../../pages/ara/Employee/Employees/Search/PopupForm")
);
const EmployeesSearchTable = lazy(
  () =>
    import("../../../pages/ara/Employee/Employees/SearchResults/SearchTable")
);
const EmployeeDetailForm = lazy(
  () => import("../../../pages/ara/Employee/Employees/Detail/Nested")
);

// MartyreDisable
const MartyreDisableLawersSearchForms = lazy(
  () => import("../../../pages/ara/Employee/MartyreDisableLawyers/Search/Form")
);
const MartyreDisableLawersSearchTables = lazy(
  () =>
    import(
      "../../../pages/ara/Employee/MartyreDisableLawyers/SearchResults/Form"
    )
);
const MartyreDisableLawerDetailForms = lazy(
  () =>
    import("../../../pages/ara/Employee/MartyreDisableLawyers/Detail/Nested")
);

// General

const FilingsSearchForm = lazy(
  () => import("../../../pages/filing/Filings/Search/Form")
);
const FilingsSearchTable = lazy(
  () => import("../../../pages/filing/Filings/SearchResults/SearchTable")
);
const FilingDetailForm = lazy(
  () => import("../../../pages/filing/Filings/Detail/Nested")
);

// User

const UsersSearchForm = lazy(
  () => import("../../../pages/sa/userManagement/Users/Search/Form")
);
const UsersSearchTable = lazy(
  () =>
    import("../../../pages/sa/userManagement/Users/SearchResults/SearchTable")
);
const UsersDetailForm = lazy(
  () => import("../../../pages/sa/userManagement/Users/Detail/Nested")
);

type Props = {
  model: string;
  [key: string]: any;
};

export const GetSearchForm: React.FC<Props> = ({ model, ...props }) => {
  switch (model) {
    case models.USERS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <UsersSearchForm {...props} />
        </Suspense>
      );
    case models.INSTITUTIONS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <InstitutionsSearchForm {...props} />
        </Suspense>
      );
    case models.ACCOUNT_NUMBERS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <AccountNumbersSearchForm {...props} />
        </Suspense>
      );
    case models.HEAD_COUNT_DETAILS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <HeadCountDetailsSearchForm {...props} />
        </Suspense>
      );

    case models.HEAD_COUNT_DETAIL_COMPLETE_SEARCH_LOOKUP:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <HeadCountDetailsCompleteSearchForm {...props} />
        </Suspense>
      );

    case models.EMPLOYEES:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <EmployeesSearchForm {...props} />
        </Suspense>
      );

    case models.MARTYREDISABLELAWYER:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <MartyreDisableLawersSearchForms {...props} />
        </Suspense>
      );

    // FILINGS
    case models.FILINGS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <FilingsSearchForm {...props} />
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

export const GetResultTable: React.FC<Props> = ({ model, ...props }) => {
  switch (model) {
    case models.USERS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <UsersSearchTable {...props} />
        </Suspense>
      );

    case models.INSTITUTIONS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <InstitutionsSearchTable {...props} />
        </Suspense>
      );

    case models.ACCOUNT_NUMBERS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <AccountNumbersSearchTable {...props} />
        </Suspense>
      );
    case models.HEAD_COUNT_DETAILS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <HeadCountDetailsSearchTable {...props} />
        </Suspense>
      );
 
    case models.HEAD_COUNT_DETAIL_COMPLETE_SEARCH_LOOKUP:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <HeadCountDetailsSearchTable {...props} />
        </Suspense>
      );
    case models.EMPLOYEES:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <EmployeesSearchTable {...props} />
        </Suspense>
      );

    case models.MARTYREDISABLELAWYER:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <MartyreDisableLawersSearchTables {...props} />
        </Suspense>
      );

    // FILINGS
    case models.FILINGS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <FilingsSearchTable {...props} />
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

type DetailProps = {
  model: string;
  id: number;
  params: ObjectAny;
  [key: string]: any;
};

export const GetDetailForm: React.FC<DetailProps> = ({ model, ...props }) => {
  switch (model) {
    case models.USERS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <UsersDetailForm {...props} />
        </Suspense>
      );

    case models.INSTITUTIONS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <InstitutionDetailForm {...props} />
        </Suspense>
      );
    case models.ACCOUNT_NUMBERS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <AccountNumberDetailForm {...props} />
        </Suspense>
      );
    case models.HEAD_COUNT_DETAILS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <HeadCountDetailDetailForm {...props} />
        </Suspense>
      );
    case models.HEAD_COUNT_DETAIL_COMPLETE_SEARCH_LOOKUP:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <HeadCountDetailDetailForm {...props} />
        </Suspense>
      );
    case models.EMPLOYEES:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <EmployeeDetailForm {...props} />
        </Suspense>
      );

    case models.MARTYREDISABLELAWYER:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <MartyreDisableLawerDetailForms {...props} />
        </Suspense>
      );

    case models.FILINGS:
      return (
        <Suspense fallback={<PageLoader nested={true} />}>
          <FilingDetailForm {...props} />
        </Suspense>
      );
  }
};
