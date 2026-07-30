import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

interface CustomDropdownProps {
  onSelect: (action: string) => void;
}

const CustomDropdownForCell: React.FC<CustomDropdownProps> = ({ onSelect }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);

  return (
    <Dropdown isOpen={dropdownOpen} toggle={toggle}>
      <DropdownToggle caret>Actions</DropdownToggle>
      <DropdownMenu>
        <DropdownItem onClick={() => onSelect("Action 1")}>
          Action 1
        </DropdownItem>
        <DropdownItem onClick={() => onSelect("Action 2")}>
          Action 2
        </DropdownItem>
        <DropdownItem onClick={() => onSelect("Action 3")}>
          Action 3
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default CustomDropdownForCell;
