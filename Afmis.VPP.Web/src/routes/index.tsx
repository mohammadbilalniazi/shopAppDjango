import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

//Layouts
import NonAuthLayout from "../Layouts/NonAuthLayout";
import Layouts from "../Layouts/index";
import PageLoader from "../Components/PageLoader";

//routes/routes
import { authProtectedRoutes, publicRoutes } from "./allRoutesMapping";
import { AuthProtected } from "./AuthProtected";

const Cover404 = lazy(() => import("../pages/AuthenticationInner/Errors/Cover404"));

const Index = () => {
  return (
    <>
      <Routes> 
        {publicRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={
              <NonAuthLayout>
                <route.element />
              </NonAuthLayout>
            }
            key={idx}
          />
        ))}

        {authProtectedRoutes.map((route, idx) => (
          <Route
            path={route.path}
            element={
              <AuthProtected>
                <Layouts>
                  <route.element />
                </Layouts>
              </AuthProtected>
            }
            key={idx}
          />
        ))}
        <Route
          path="*"
          element={
            <Suspense fallback={<PageLoader />}>
              <Cover404 />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
};

export default Index;
