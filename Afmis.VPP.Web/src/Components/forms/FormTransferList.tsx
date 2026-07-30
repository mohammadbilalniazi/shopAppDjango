// FormTransferList.tsx
import { useFormikContext } from "formik";
import { FormGroup } from "reactstrap";
import ErrorMessage from "./ErrorMessage";
import { getValueList } from "../../utilities/utilFuncs";
import { useEffect } from "react";
import { FormikContext } from "../../types/base";
import AppTransferList from "../AppTransferList";
import { Option } from "react-dual-listbox";

type Props = {
  name: string;
  label: string;
  options: Option<any>[];
  initVal?: any;
  disabled?: boolean;
  required?: boolean;
  visibleIdSet?: Set<string> | null;
  confirmChange?: (next: string[], prev: string[]) => Promise<boolean> | boolean;
  onCommit?: (next: string[], prev: string[]) => void | Promise<void>;
  [key: string]: any;
};

const FormTransferList: React.FC<Props> = ({
  name,
  label,
  options,
  initVal,
  visibleIdSet = null,
  confirmChange,
  onCommit,
  ...otherProps
}) => {
  const { setFieldTouched, setFieldValue, values, errors, touched } =
    useFormikContext() as unknown as FormikContext;

  // Current value from Formik (source of truth)
  const currentValList = getValueList(values[name]).map(String);

  // Initialize from initVal when it comes
  useEffect(() => {
    if (initVal) {
      const initList = getValueList(initVal);
      setFieldValue(name, initList);
    }
  }, [initVal, name, setFieldValue]);

  return (
    <FormGroup className="mb-3">
      <AppTransferList
        onBlur={() => setFieldTouched(name)}
        onChange={async (proposed: any[]) => {
          // 👉 This is the PREVIOUS selection
          const prev = getValueList(values[name]).map(String);

          // 👉 This is the NEXT selection coming from DualListBox
          const next = Array.from(
            new Set((proposed ?? []).map((x) => String(x)))
          );

          // If nothing actually changed, ignore
          if (
            prev.length === next.length &&
            prev.every((v, i) => v === next[i])
          ) {
            return;
          }

          // Optional confirmation
          let ok = true;
          if (typeof confirmChange === "function") {
            ok = await confirmChange(next, prev);
          }
          if (!ok) return;

          // Commit to Formik
          setFieldValue(name, next);
          // Notify parent (for API / diff)
          if (typeof onCommit === "function") {
            await onCommit(next, prev);
          }
        }}
        value={currentValList}
        name={name}
        label={label}
        options={options}
        visibleIdSet={visibleIdSet}
        {...otherProps}
      />
      {touched[name] && errors[name] && (
        <ErrorMessage label={label} error={errors[name]} />
      )}
    </FormGroup>
  );
};

export default FormTransferList;
