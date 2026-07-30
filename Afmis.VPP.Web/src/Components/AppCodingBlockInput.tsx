import { useEffect, useRef, useState } from "react";
import Cleave from "cleave.js";
import { Button, UncontrolledTooltip } from "reactstrap";
import AppLabel from "./AppLabel";
import { MdBalance, MdManageSearch } from "react-icons/md";
import { CleaveOptions } from "cleave.js/options";

type Props = {
  setShowCodingBlockConceptModal: (val: boolean) => void;
  id: string;
  label: string;
  invalid?: boolean;
  rows?: number;
  required?: boolean;
  value: string;
  options: CleaveOptions;
  disabled?: boolean;
  hoverNode?: React.ReactNode;
  formVal?: number;
  onDetailModalClick?: () => void;
  [key: string]: any;
};

const AppCodingBlockInput: React.FC<Props> = ({
  id,
  label,
  setShowCodingBlockConceptModal,
  invalid,
  rows = 3,
  required,
  options,
  value,
  disabled,
  hoverNode,
  formVal,
  onDetailModalClick,
  ...otherProps
}) => {
  const [cleave, setCleave] = useState<Cleave>();
  const textareaRef = useRef(null);

  useEffect(() => {
    if ((options.blocks?.length as number) > 0) {
      if (textareaRef.current) {
        const newCleave = new Cleave(textareaRef.current, options);
        setCleave(newCleave);
      }
    }
  }, [id, options.blocks, options]);

  useEffect(() => {
    if (cleave && options.blocks?.length === 0) {
      cleave.destroy();
    }
  });

  useEffect(() => {
    return () => {
      if (cleave) {
        cleave.destroy();
      }
    };
  }, [cleave]);

  return (
    <>
      {label && <AppLabel id={id} label={label} required={required} />}
      <div className="d-flex align-items-center">
        <textarea
          ref={textareaRef}
          id={`coding-block-${id}`}
          className={`form-control number ${invalid ? "is-invalid" : ""}`}
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
        {!disabled && (
          <Button
            style={{ marginInlineStart: 10, padding: "5px 8px" }}
            onClick={() => setShowCodingBlockConceptModal(true)}
            id={`lookup-${id}`}
          >
            <MdBalance size={20} />

            <UncontrolledTooltip placement="top" target={`lookup-${id}`}>
              Elements View
            </UncontrolledTooltip>
          </Button>
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
      </div>
      {options.blocks && options.blocks.length > 0 && (
        <div className="text-muted">
          Format:{" "}
          {options.blocks.map((block, index) => (
            <span key={index}>
              {"x".repeat(block)}
              {index < (options.blocks as number[]).length - 1 && "/"}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default AppCodingBlockInput;
