import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Button } from "reactstrap";
import { TbGridDots } from "react-icons/tb";

type Props = {
  buttons: React.ReactElement<{ show?: boolean }>[];
};
const CustomButtonsDropdown: React.FC<Props> = ({ buttons }) => {
  // const [rowData, setRowData] = useState(attendancesEmployees);

  const [isDivVisible, setIsDivVisible] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const absoluteDivRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: any) => {
    if (
      absoluteDivRef.current &&
      buttonRef.current &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      !absoluteDivRef.current.contains(event.target as Node) &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      !buttonRef.current.contains(event.target as Node)
    ) {
      setIsDivVisible(false);
    }
  };

  const updateDropdownPosition = () => {
    const button = buttonRef.current;
    if (!button) return;

    const viewportPadding = 16;
    const maxDropdownWidth = Math.min(560, window.innerWidth - viewportPadding * 2);
    const buttonRect = button.getBoundingClientRect();
    const preferredLeft = buttonRect.left;
    const clampedLeft = Math.min(
      Math.max(preferredLeft, viewportPadding),
      window.innerWidth - maxDropdownWidth - viewportPadding,
    );

    setDropdownPosition({
      top: buttonRect.bottom + 8,
      left: clampedLeft,
    });
  };

  useLayoutEffect(() => {
    if (isDivVisible) {
      updateDropdownPosition();
    }
  }, [isDivVisible]);

  useEffect(() => {
    if (isDivVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("resize", updateDropdownPosition);
      window.addEventListener("scroll", updateDropdownPosition, true);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    }

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isDivVisible]);

  return (
    <div
      style={{
        position: "relative",
        textAlign: "start",
        marginBottom: "20px",
        marginInlineStart: "20px",
      }}
    >
      {/* <Stack direction="row" spacing={1}> */}
      <Button
        innerRef={buttonRef}
        style={{
          marginInlineEnd: "2px",
          border: "0",
          // borderRadius: "20px",
          // backgroundColor: "#575b5f45",
          // boxShadow: "2px 2px 5px 5px #575b5f45",
          paddingInline: 10,
        }}
        onMouseOver={() => {
          // e.currentTarget.style.backgroundColor = "gray";
          setIsDivVisible(true);
        }}
        onClick={() => {
          setIsDivVisible(true);
        }}
        // onMouseLeave={(e) => {
        //   // e.currentTarget.style.backgroundColor = "#575b5f45";
        //   setIsDivVisible(false);
        // }}
        id="downloadReport"
      >
        <TbGridDots id="tdGridDots" style={{ fontSize: "25px" }} />
      </Button>
      {isDivVisible && (
        <div
          ref={absoluteDivRef}
          style={{
            position: "fixed",
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            border: "1px solid #ccc",
            padding: "16px",
            backgroundColor: "rgba(255, 255, 255, 0.94)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "14px",
            width: "min(560px, calc(100vw - 32px))",
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "calc(100vh - 96px)",
            overflowY: "auto",
            overflowX: "hidden",
            boxSizing: "border-box",
            borderRadius: "18px",
            borderWidth: "7px",
            borderColor: "rgba(242, 242, 247, 0.5)",
            zIndex: 10, // Ensure it's above other elements
          }}
        >
          {buttons
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .filter((button) => button.props.show !== false) // Ensure only visible buttons are rendered
            .map((button) => React.cloneElement(button))}
        </div>
      )}
    </div>
  );
};

export default CustomButtonsDropdown;
