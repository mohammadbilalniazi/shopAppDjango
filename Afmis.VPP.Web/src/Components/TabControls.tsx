import { TbSquareMinus, TbSquarePlus } from "react-icons/tb";
import { UncontrolledTooltip } from "reactstrap";

type Props = {
  toggleModal: () => void;
  onRemove: () => void;
  disabled: boolean;
  showRemove?: boolean;
};

const TabControls: React.FC<Props> = ({ toggleModal, onRemove, disabled,showRemove=true }) => {
  return (
    <div style={{ marginBottom: 6, display: "flex" }}>
      <div
        style={{ marginInlineEnd: 5, cursor: disabled ? "null" : "pointer" }}
        id="new-n"
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onClick={disabled ? () => {} : toggleModal}
      >
        <TbSquarePlus fontSize={28} color={disabled ? "#CCCCCC" : "#166fd4"} />
        <UncontrolledTooltip placement="top" target="new-n">
          New
        </UncontrolledTooltip>
      </div>
      {
        showRemove &&  <div
        style={{ marginInlineEnd: 5, cursor: disabled ? "null" : "pointer" }}
        id="remove-n"
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onClick={disabled ? () => {} : onRemove}
      >
        <TbSquareMinus fontSize={28} color={disabled ? "#CCCCCC" : "tomato"} />
        <UncontrolledTooltip placement="top" target="remove-n">
          Remove
        </UncontrolledTooltip>
      </div>
      }
     
    </div>
  );
};

export default TabControls;
