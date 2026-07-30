import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Button } from "reactstrap";
import { TbGridDots } from "react-icons/tb";
import { useAppSelector } from "../store/hooks";
import { Chip } from "@mui/material";
import { EmployeeAttendance } from "../types/entities/attendance/attendance";
import { useTranslation } from "react-i18next";
type Props = {
  buttons: React.ReactElement<{ show?: boolean }>[];
  setEmpAttRowData: React.Dispatch<EmployeeAttendance[]>;
};
const ButtonsDropdown: React.FC<Props> = ({ buttons, setEmpAttRowData }) => {
  // const [rowData, setRowData] = useState(attendancesEmployees);
  const { formData, attendanceAggregatedData, attendancesEmployees } =
    useAppSelector((state) => state.attendance.attendance);
  const { institutions } = useAppSelector(
    (state) => state.general.ce.institutions,
  );
  const { fiscalMonths } = useAppSelector(
    (state) => state.general.ce.fiscalMonths,
  );
  const { fiscalYears } = useAppSelector(
    (state) => state.general.ce.fiscalYears,
  );
  const [status, setStatus] = useState("");
  const [empCountInAtt, setEmpCountInAtt] = useState("");
  const [empEmpWithoutAttendance, setEmpWithoutAttendance] = useState("");
  const [suspendedCount, setSuspendedCount] = useState("");

  const [institution, setInstitution] = useState("");
  const [fiscalYear, setFiscalYear] = useState("");
  const [fiscalMonth, setFiscalMonth] = useState("");
  const { t } = useTranslation();
  useEffect(() => {
    if (
      formData?.institutionId &&
      formData?.fiscalMonthId &&
      formData?.fiscalYearId
    ) {
      const inst = institutions.find(
        (item) => item.id == formData.institutionId,
      );
      const fY = fiscalYears.find((item) => item.id == formData.fiscalYearId);
      const fM = fiscalMonths.find((item) => item.id == formData.fiscalMonthId);
      if (!inst || !fY || !fM) {
        return;
      }
      setInstitution(inst?.description);
      setFiscalYear(fY?.year);
      setFiscalMonth(fM?.month);
    }
  }, [formData, institutions, fiscalYears, fiscalMonths]);
  useEffect(() => {
    if (!attendanceAggregatedData || attendanceAggregatedData == null) return;
    if (attendanceAggregatedData?.status == "APPROVED") {
      setStatus("منظور");
    } else if (attendanceAggregatedData?.status == "CREATED") {
      setStatus(t("Create").toString());
    } else {
      setStatus("مسترد");
    }
    setEmpCountInAtt(attendanceAggregatedData?.empCountInAtt?.toString());
    setEmpWithoutAttendance(
      attendanceAggregatedData?.empWithoutAttendance?.toString(),
    );
    setSuspendedCount(attendanceAggregatedData?.suspendedCount?.toString());
  }, [attendanceAggregatedData, t]);

  const [isDivVisible, setIsDivVisible] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const absoluteDivRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: any) => {
    if (
      absoluteDivRef.current &&
      buttonRef.current &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      !absoluteDivRef.current?.contains(event.target as Node) &&
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
        marginTop: "40px",
        marginBottom: "20px",
        marginInlineStart: "20px",
      }}
    >
      {/* <Stack direction="row" spacing={1}> */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "0.5rem",
          width: "100%",
        }}
      >
        <Chip
          style={{
            marginInlineStart: "1%",
            background: "rgba(var(--vz-body-bg-rgb), 0.12)",
            color: "var(--vz-body-color)",
            border: "1px solid var(--vz-border-color)",
          }}
          label={institution}
        />
        <Chip
          style={{
            marginInlineStart: "1%",
            background: "rgba(var(--vz-body-bg-rgb), 0.12)",
            color: "var(--vz-body-color)",
            border: "1px solid var(--vz-border-color)",
          }}
          label={fiscalYear}
        />
        <Chip
          style={{
            marginInlineStart: "1%",
            background: "rgba(var(--vz-body-bg-rgb), 0.12)",
            color: "var(--vz-body-color)",
            border: "1px solid var(--vz-border-color)",
          }}
          label={fiscalMonth}
        />

        <Chip
          style={{
            marginInlineStart: "1%",
            background: "rgba(var(--vz-body-bg-rgb), 0.12)",
            color: "var(--vz-body-color)",
            border: "1px solid var(--vz-border-color)",
          }}
          label={" حالت: " + status}
        />

        <Chip
          style={{
            marginInlineStart: "1%",
            background: "rgba(var(--vz-body-bg-rgb), 0.12)",
            color: "var(--vz-body-color)",
            border: "1px solid var(--vz-border-color)",
          }}
          label={" شامل حاضری: " + empCountInAtt + " نفر"}
        />
        <Chip
          style={{
            marginInlineStart: "1%",
            background: "rgba(var(--vz-body-bg-rgb), 0.12)",
            color: "var(--vz-body-color)",
            border: "1px solid var(--vz-border-color)",
          }}
          label={" بدون حاضری: " + empEmpWithoutAttendance + " نفر"}
        />

        <Chip
          style={{
            marginInlineStart: "20%",
            background: "rgba(var(--vz-body-bg-rgb), 0.12)",
            color: "var(--vz-body-color)",
            border: "1px solid var(--vz-border-color)",
          }}
          label={"معطل: " + suspendedCount + " نفر"}
          onClick={() => {
            setEmpAttRowData(
              attendancesEmployees?.filter((item) => item?.isSuspended),
            );
          }}
          onDelete={() => {
            setEmpAttRowData(attendancesEmployees);
          }}
        />

        {/* </Stack> */}
        <Button
          innerRef={buttonRef}
          style={{
            marginInlineEnd: "2px",
            border: "1px solid var(--vz-border-color)",
            background: "rgba(var(--vz-body-bg-rgb), 0.12)",
            color: "var(--vz-body-color)",
            // borderRadius: "20px",
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
      </div>
      {isDivVisible && (
        <div
          ref={absoluteDivRef}
          style={{
            position: "fixed",
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            border: "1px solid var(--vz-border-color)",
            padding: "16px",
            backgroundColor: "rgba(var(--vz-body-bg-rgb), 0.94)",

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
            borderColor: "rgba(var(--vz-body-bg-rgb), 0.15)",

            zIndex: 10, // Ensure it's above other elements
          }}
        >
          {buttons
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .filter((button) => button.props.show)
            .map((button) => {
              return React.cloneElement(button);
            })}
        </div>
      )}
    </div>
  );
};

export default ButtonsDropdown;
