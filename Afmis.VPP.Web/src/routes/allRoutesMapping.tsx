/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
// import { Navigate } from "react-router-dom";

import routes from "./routes";
import PageLoader from "../Components/PageLoader";
import PageLayout from "../Layouts/PageLayout";
const PasswordResetForm = lazy(
  () => import("../pages/Authentication/PasswordResetForm")
);
const Login = lazy(
  () => import("../pages/Authentication/Login")
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

const authProtectedRoutes = [
  // 1  General
  // 1.1 common-entities
 
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
    // path: "/login",
    path: routes.saUsersMgtLogin,
    // element: () => <Navigate to={routes.saUsersMgtLogin} />,
    element: () => (
      <Suspense fallback={<PageLoader />}>
        <Login />
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
