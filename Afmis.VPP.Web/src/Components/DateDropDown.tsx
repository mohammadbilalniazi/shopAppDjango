import React, { useMemo, useState } from "react";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { useTranslation } from "react-i18next";
import { getCurrentDate } from "../utilities/utilFuncs";

type CalendarKey = "shamsi" | "qamari" | "gregorian";

const isCalendarKey = (value: string | null): value is CalendarKey =>
  value === "shamsi" || value === "qamari" || value === "gregorian";

const DateDropDown: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);

  // default: Persian/Shamsi
  const [selected, setSelected] = useState<CalendarKey>("shamsi");
  React.useEffect(() => {
    const saved = localStorage.getItem("calendar");
    setSelected(isCalendarKey(saved) ? saved : "shamsi");
  }, []);

  // get all three calendars
  const { gregorian, hijriPersianForDateDropDown, hijriSaudi } = getCurrentDate();
  

  const labels: Record<CalendarKey, string> = useMemo(
    () => ({
      gregorian: String(t("GregorianCalendar")),
      qamari: String(t("QamariCalendar")),
      shamsi: String(t("ShamsiCalendar")),
    }),
    [t]
  );

  const values: Record<CalendarKey, string> = useMemo(
    () => ({
      gregorian: gregorian.formatted,
      qamari: hijriSaudi.formatted,
      shamsi: hijriPersianForDateDropDown.formatted,
    }),
    [gregorian.formatted, hijriSaudi.formatted, hijriPersianForDateDropDown.formatted]
  );


  const options = useMemo(
    () =>
      (["shamsi", "qamari", "gregorian"] as CalendarKey[]).map((key) => ({
        key,
        label: labels[key],
        value: values[key],
      })),
    [labels, values]
  );

  const handlePick = (key: CalendarKey) => {
    localStorage.setItem("calendar", key);
    setSelected(key);
    setOpen(false);
  };

  return (
    <Dropdown
      isOpen={open}
      toggle={toggle}
      direction="down"
      className="date-dropdown"
    >
      <DropdownToggle
        caret
        tag="button"
        type="button"
        className="topbar-date-pill"
        aria-label={String(t("ChangeCalendar"))}
      >
        <span className="date-pill-icon">
          <i className="mdi mdi-calendar-month-outline" />
        </span>
        <span className="date-pill-content">
          <span className="date-pill-value">{values[selected]}</span>
          <span className="date-pill-label">{labels[selected]}</span>
        </span>
      </DropdownToggle>

      <DropdownMenu end className="date-dropdown-menu">
        {options.map((option) => (
          <DropdownItem
            key={option.key}
            active={selected === option.key}
            onClick={() => handlePick(option.key)}
            className="date-dropdown-option"
          >
            <span className="date-option-text">
              <span className="date-option-label">{option.label}</span>
              <span className="date-option-value">{option.value}</span>
            </span>
            {selected === option.key && (
              <i className="mdi mdi-check-circle date-option-check" />
            )}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default DateDropDown;
