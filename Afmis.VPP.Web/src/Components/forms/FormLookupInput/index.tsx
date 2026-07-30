import {
  ChangeEvent,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useFormikContext } from "formik";
import { FormGroup } from "reactstrap";

import ErrorMessage from "../ErrorMessage";
import AppLookupInput from "../../AppLookupInput";
import {
  validateObject,
} from "../../../services/objectValidation";
import progress from "../../../utilities/progress";
import { getLookupValue, getValue } from "../../../utilities/utilFuncs";
import TopBar from "../../TopBar";
import { FormikContext, Lookup, ObjectAny } from "../../../types/base";
// import { ApiResponse } from "apisauce";
// import { AfmisResponse } from "../../../types/store/shared";
// import { ElementConcept } from "../../../types/entities/gl/coa";
// import { models } from "../../../constants/models";

const LookupModal = lazy(() => import("./LookupModal"));
const DetailModal = lazy(() => import("./DetailModal"));

type Props = {
  id?: string;
  name: string;
  label: string;
  model: string;
  params?: ObjectAny;
  labelField?: string;
  header?: string;
  initVal?: Lookup;
  disabled?: boolean;
  required?: boolean;
  onChange?: (val: Lookup | null) => void;
  [key: string]: any;
};

const FormLookupInput: React.FC<Props> = ({
  id = "1",
  name,
  label,
  model, 
  params: _params,
  labelField = "applicationid",
  header = "",
  initVal,
  onChange,
  ...otherProps
}) => {
  const {
    setFieldTouched,
    setFieldValue,
    values,
    errors,
    touched,
    setFieldError,
    initialValues,
  } = useFormikContext() as unknown as FormikContext;

  // const [codingBlockElements, setCodingBlockElements] = useState<
  //   ElementConcept[] | null
  // >(null);
  const [params, setParams] = useState(_params);

  const [search, setSearch] = useState(true);
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (initVal) {
      setFieldValue(name, getLookupValue(initVal));
    }
  }, [initVal, name, setFieldValue]);

  useEffect(() => {
    if (initialValues[name] === undefined || initialValues[name] === null) {
      setFieldValue(name, getLookupValue(initialValues[name]));
    }
  }, [name, setFieldValue, initialValues]);

  const toggleSearch = useCallback(() => {
    setSearch((sh) => !sh);
  }, []);

  const toggleDetailModal = useCallback(() => {
    setShowDetailModal((sh) => !sh);
  }, []);

  const toggleLookupModal = useCallback(() => {
    setShowLookupModal((val) => !val);
    setSearch(true);
  }, []);

  const handleOnBlur = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      setFieldTouched(name);
      setFieldValue(name, { label: e.target.value, value: "" });
      // setCodingBlockElements(null);
      const input = (values[name] as Lookup).label;
      if (input) {
        progress.start();
        // let res: ApiResponse<AfmisResponse>;

        // if (model === models.CODING_BLOCKS) {
        //   res = await existsCodingBlock({
        //     code: input,
        //   });
        //   if (res?.ok && res.data) {
        //     setCodingBlockElements(res.data.data.elements as ElementConcept[]);
        //   }
        // } else {
        const  res = await validateObject({ code: input, model, params });
        // }
        progress.finish();

        if (!res?.ok) {
          if (onChange) {
            onChange(null);
          }
          setTimeout(() => {
            // if (model === models.CODING_BLOCKS) {
            //   setFieldError(name, `${label} does not exists`);
            // } 
            // else {
              setFieldError(name, `Not a valid ${label.toLowerCase()}.`);
            // }
          }, 100);
        } else {
          if (res.data) {
         
            setFieldValue(name, {
              value: res.data.data,
              label: res.data.data,
            });
            setTimeout(() => {
              setFieldError(name, "");
            }, 100);

            if (onChange) {
              onChange({
                value: res.data.data.id,
                label: res.data.data[labelField],
              });
            }
          }
        }
      } else {
        setFieldValue(name, { label: input, value: "" });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      errors,
      label,
      labelField,
      model,
      name,
      params,
      setFieldError,
      setFieldTouched,
      setFieldValue,
      values,
    ]
  );
  return (
    <FormGroup className="mb-3">
      <AppLookupInput
        id={id}  
        onBlur={handleOnBlur}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setFieldValue(name, { label: e.target.value, value: "" })
        } 
        value={getValue((values[name] as Lookup)?.label)}
        name={name}
        invalid={touched[name] && errors[name] ? true : false}
        label={label}
        setShowLookupModal={setShowLookupModal}
        formVal={(values[name] as Lookup)?.value ? true : false}
        onDetailModalClick={() => setShowDetailModal(true)}
        model={model}
      
        hoverNode={ 
           null
        }
        {...otherProps}
      />
      {errors[name] && touched[name] && (
        <ErrorMessage
          label={label}
          error={(errors[name] as Lookup).value || errors[name]}
          fromInput
          lookup
        />
      )}
      {showLookupModal && (
        <Suspense fallback={<TopBar />}>
          <LookupModal
            model={model}
            label={label}
            name={name}
            showLookupModal={showLookupModal}
            toggleLookupModal={toggleLookupModal}
            setParams={setParams}
            toggleSearch={toggleSearch}
            search={search}
            // setCodingBlockDetail={setCodingBlockElements}
            header={header}
            onChange={onChange}
          />
        </Suspense>
      )}
      {showDetailModal && (
        <Suspense fallback={<TopBar />}>
          <DetailModal
            model={model}
            label={label}
            value={(values[name] as Lookup)?.value}
            showDetailModal={showDetailModal}
            toggleDetailModal={toggleDetailModal}
            params={params}
            header={header} 
          />
        </Suspense>
      )}
    </FormGroup>
  );
};

export default FormLookupInput;
