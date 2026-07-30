import { Formik, FormikHelpers, FormikProps, FormikValues } from "formik";
import { MdCleaningServices, MdSearch } from "react-icons/md";
import { Button, UncontrolledTooltip } from "reactstrap";
import { ObjectAny } from "../../types/base";
import { useAppDispatch } from "../../store/hooks";
import { AnyAction } from "@reduxjs/toolkit";
import { useState } from "react";
import { ScaleLoader } from "react-spinners";
import { AiOutlinePlus } from "react-icons/ai";
import { payrollReportM16Insert } from "../../routes/routes";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import usePermissionCheck from "../../hooks/sa/usePermissionCheck";

type Props<T> = {
  initialValues?: T | Partial<T> | null;
  onSubmit?: (val: T, actions: FormikHelpers<T>) => void | Promise<any>;
  validationSchema?: ObjectAny;
  enableReinitialize?: boolean;
  validate?: (val: T) => ObjectAny;
  children: (props: FormikProps<T>) => React.JSX.Element;
  showHeader?: boolean;
  showReset?: boolean;
  Header?: () => React.JSX.Element;
  model?:string;
  clearFormAction?: () => AnyAction;
};

const Form = <T extends FormikValues = ObjectAny>({
  initialValues,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onSubmit = () => {},
  validationSchema,
  enableReinitialize = false,
  validate,
  children,
  showHeader = true,
  showReset = false,
  Header,
  model,
  clearFormAction,
  ...props
}: Props<T>) => {
  const dispatch = useAppDispatch();
  const navigate=useNavigate();
  const [loading,setLoading]=useState(false);
  const {getPermissionOfSubmitFormButtons}=usePermissionCheck();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const showTopSearchButton = getPermissionOfSubmitFormButtons(model ??"");
  return (
    <Formik<T>
      initialValues={initialValues ? initialValues : ({} as any)}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      enableReinitialize={enableReinitialize}
      validate={validate}
      {...props}
    >
      {(options) => (
        <div className="afmis-form">
          {showHeader && (
            <div className="afmis-form__header-actions">
              {Header && <Header />}
              {model && model=='M16Report-Post' && <div key="11">
                <Button
                  style={{ padding: 4,backgroundColor:'#ab7e28' }}
                  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                  onClick={() => navigate(payrollReportM16Insert,{state:{m16CreateByParentInstitution:true}})}
                  id="M16ReportWithParentOrg"
                >
                  <AiOutlinePlus fontSize={21} className="rotate-180" />
                </Button>
                <UncontrolledTooltip placement="top" target="M16ReportWithParentOrg">
                  {t("M16ReportWithParentOrg")}
                </UncontrolledTooltip>
              </div>
              }
              {showReset && showTopSearchButton && ( // search in top  previous showReset && model && model=="Employees"
                <div>
                      <Button
                      style={{ padding: 4, backgroundColor:"#00235E"}}
                      onClick={async() => {
                        if (onSubmit) {
                          setLoading(true);
                         await onSubmit(options.values, options); // Properly call onSubmit with values
                          setLoading(false);
                        }
                        options.resetForm();
                      }}
                      id="additionalSearch"
                    >
                       {t("Search")}
                    {loading ? (
                      <ScaleLoader color="#fff" height={14} width={3}  />
                    ) : (
                      <MdSearch fontSize={19} className="search-magnifier-dir" />
                    )}
                  </Button>
                  <UncontrolledTooltip placement="top" target="additionalSearch">
                    {t("Search")}
                  </UncontrolledTooltip>
                </div>
              )}
              {showReset && (
                <div>
                  <Button
                    style={{ padding: 4 }}
                    onClick={() => {
                      if (clearFormAction) {
                        dispatch(clearFormAction());
                      }
                      options.resetForm();
                    }}
                    id="clear" 
                  >
                    <MdCleaningServices fontSize={19} />
                  </Button>
                  <UncontrolledTooltip placement="top" target="clear">
                    {t("ResetForm")}
                  </UncontrolledTooltip>
                </div>
              )}

            
            </div>
          )}

          {children(options)}
        </div>
      )}
    </Formik>
  );
};

export default Form;
