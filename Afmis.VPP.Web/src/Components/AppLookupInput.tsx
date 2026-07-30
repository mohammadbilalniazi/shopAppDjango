import { Input, Button, UncontrolledTooltip } from "reactstrap";
import AppLabel from "./AppLabel";
import { MdManageSearch } from "react-icons/md";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { InputType } from "reactstrap/types/lib/Input";
import { models } from "../constants/models";

type Props = {
  id: string;
  label?: string;
  required?: boolean;
  type?: InputType;
  setShowLookupModal: (val: any) => void;
  onDetailModalClick?: () => void;
  formVal?: boolean;
  disabled?: boolean;
  value: string;
  model?: string;
  rows?: number;
  invalid?: boolean;
  hoverNode?: React.ReactNode;
  [key: string]: any;
};

const AppLookupInput: React.FC<Props> = ({
  id,
  label,
  required,
  type = "text",
  setShowLookupModal,
  onDetailModalClick,
  formVal,
  disabled,
  value,
  model,
  rows,
  invalid,
  hoverNode,
  ...otherProps
}) => {
  return (
    <>
      {label && <AppLabel id={id} label={label} required={required} />}

      <div className="d-flex align-items-center">
        {model === models.CODING_BLOCKS ? (
          <>
            <textarea
              id={`coding-block-${id}`}
              className={`form-control ${invalid ? "is-invalid" : ""}`}
              rows={rows}
              value={value}
              disabled={disabled}
              {...otherProps}
            ></textarea>
            {hoverNode && (
              <UncontrolledTooltip
                placement="bottom"
                target={`coding-block-${id}`}
                style={{ textAlign: "initial", maxWidth: "none" }}
              >
                {hoverNode}
              </UncontrolledTooltip>
            )}
          </>
        ) : (
          <Input
            id={id}
            type={type}
            value={value}
            invalid={invalid}
            dir={otherProps?.name=="code" ? "ltr" : "auto"}
            disabled
            {...otherProps}
          />
        )}

        {formVal && (
          <>
            <Button
              style={{ marginInlineStart: 10, padding: "4px 8px 6px 8px" }}
              onClick={onDetailModalClick}
              id={`detail-${id}`}
              color="primary"
            >
              <MdManageSearch size={20} />
            </Button>
            <UncontrolledTooltip placement="top" target={`detail-${id}`}>
              Details
            </UncontrolledTooltip>
          </>
        )}
        {!disabled && (
          <>
            <Button
              style={{ marginInlineStart: 10, padding: "5px 8px" }}
              onClick={() => setShowLookupModal((sh: boolean) => !sh)}
              id={`lookup-${id}`}
            >
              <HiOutlineDocumentSearch size={20} />
            </Button>
            <UncontrolledTooltip placement="top" target={`lookup-${id}`}>
              Lookup
            </UncontrolledTooltip>
          </>
        )}
      </div>
    </>
  );
};

export default AppLookupInput;
