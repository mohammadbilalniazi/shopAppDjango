import { useEffect, useRef, useState } from "react";
import Cleave from "cleave.js";
import { Button, UncontrolledTooltip } from "reactstrap";
import AppLabel from "./AppLabel";
import { MdBalance } from "react-icons/md";
import { CleaveOptions } from "cleave.js/options";
import { ChangeEvent } from "cleave.js/react/props";

type Props = {
  id: string;
  label?: string;
  setShowCodingBlockConceptModal: (val: boolean) => void;
  value: string;
  onChange: (val: ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  invalid?: boolean;
  rows?: number;
  options: CleaveOptions;
  disabled?: boolean;
  showLookup?: boolean;
  hoverNode?: React.ReactNode;
  [key: string]: any;
};

const AppStringCodingBlockInput: React.FC<Props> = ({
  id = 1,
  label,
  setShowCodingBlockConceptModal,
  invalid,
  rows = 3,
  required,
  options,
  value,
  disabled,
  showLookup = true,
  hoverNode,
  ...otherProps
}) => {
  const [cleave, setCleave] = useState<Cleave>();
  const textareaRef = useRef(null);

  useEffect(() => {
    if (options.blocks!.length > 0) {
      if (textareaRef.current) {
        const newCleave = new Cleave(textareaRef.current, options);
        setCleave(newCleave);
      }
    }
  }, [id, options.blocks, options]);

  useEffect(() => {
    if (options.blocks!.length === 0 && cleave) {
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
      {label && <AppLabel id={`${id}`} label={label} required={required} />}
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
        {!disabled && showLookup && (
          <Button
            style={{ marginInlineStart: 10, padding: "5px 8px" }}
            onClick={() => setShowCodingBlockConceptModal(true)}
            id={`lookup-${id}`}
          >
            <MdBalance size={20} />

            <UncontrolledTooltip placement="top" target={`lookup-${id}`}>
              Lookup
            </UncontrolledTooltip>
          </Button>
        )}
      </div>
      {options.blocks!.length > 0 && (
        <div className="text-muted">
          Format:{" "}
          {options.blocks!.map((block, index) => (
            <span key={index}>
              {"x".repeat(block)}
              {index < options.blocks!.length - 1 && "/"}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default AppStringCodingBlockInput;
