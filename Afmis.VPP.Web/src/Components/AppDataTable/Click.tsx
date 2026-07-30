import {
  capitalizeFirstLetter,
  formatDate,
  numberWithCommas,
} from "../../utilities/utilFuncs";
import { useEffect, useState } from "react";
import { UncontrolledTooltip } from "reactstrap";

import { getCodingblockByCode } from "../../store/gl/coa/codingBlock/actions";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { ObjectAny } from "../../types/base";
import useAppNavigate from "../../hooks/common/useAppNavigate";

type Props = {
  lookup?: boolean;
  onClick?: () => void;
  value: string | null | boolean | number;
  url?: string;
  isDate?: boolean;
  isAmount?: boolean;
  isCodingBlock?: boolean;
  isNumber?: boolean;
  rowIndex: number;
};

const Click: React.FC<Props> = ({
  lookup,
  onClick,
  value,
  url,
  isDate = false,
  isAmount = false,
  isCodingBlock = false,
  isNumber = false,
  rowIndex,
}) => {
  const { navigateSearchResults } = useAppNavigate();
  const [cellval, setCellval] = useState<string | number | null>("");
  const [classNames, setClassNames] = useState(["select-link"]);
  const dispatch = useAppDispatch();
  const { codingBlock } = useAppSelector((state) => state.gl.coa.codingBlocks);

  useEffect(() => {
    if (isCodingBlock || isNumber || isAmount)
      setClassNames(["select-num", "number"]);
  }, [isCodingBlock, isNumber, isAmount]);

  useEffect(() => {
    if (isDate && typeof value === "string") setCellval(formatDate(value));
    else if (typeof value == "boolean")
      setCellval(capitalizeFirstLetter(value.toString()));
    else if (isAmount && typeof value !== "string")
      setCellval(numberWithCommas(value));
    else setCellval(value);
  }, [value, isDate, isAmount]);

  return (
    <div>
      {lookup ? (
        <span
          className={classNames.join(" ")}
          onClick={onClick}
          id={`row-${isCodingBlock && rowIndex}`}
          onMouseEnter={() => {
            if (isCodingBlock)
              dispatch(getCodingblockByCode({ code: value as string }));
          }}
        >
          {cellval}
        </span>
      ) : (
        <div
          onClick={() => {
            url && navigateSearchResults(url);
          }}
          className={classNames.join(" ")}
          id={`row-${isCodingBlock && rowIndex}`}
          onMouseEnter={() => {
            if (isCodingBlock)
              dispatch(getCodingblockByCode({ code: value as string }));
          }}
        >
          {cellval}
        </div>
      )}
      {isCodingBlock && (
        <UncontrolledTooltip
          placement="bottom"
          target={`row-${rowIndex}`}
          style={{ textAlign: "initial", maxWidth: "none" }}
        >
          {(codingBlock?.elements as ObjectAny[])?.map((cd) => (
            <div key={cd.elementId}>
              {cd.segment} - {cd.abbrevation}
            </div>
          ))}
        </UncontrolledTooltip>
      )}
    </div>
  );
};

export default Click;
