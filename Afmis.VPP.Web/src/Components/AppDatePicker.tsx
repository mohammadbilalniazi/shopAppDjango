import { useMemo } from "react";
import DatePicker from "react-multi-date-picker";
import { DateObject } from "react-multi-date-picker";

import arabic from "react-date-object/calendars/arabic";
import persian from "react-date-object/calendars/persian";
import gregorian from "react-date-object/calendars/gregorian";

import arabic_en from "react-date-object/locales/arabic_en";
import persian_en from "react-date-object/locales/persian_en";
import gregorian_en from "react-date-object/locales/gregorian_en";

import AppLabel from "./AppLabel";
import AppInput from "./AppInput";
import { CalenderType } from "../types/base";

const dariMonths = [
  "Hamal",
  "Sawr",
  "Jawza",
  "Saratan",
  "Asad",
  "Sunbula",
  "Meezan",
  "Aqrab",
  "Qaws",
  "Jadi",
  "Dalwa",
  "Hoot",
];

const weekDays = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

type CustomInputProps = {
  openCalendar?: () => void;
  value?: any;
  handleValueChange?: (val: any) => void;
  invalid: boolean;
  disabled: boolean;
};

const CustomInput: React.FC<CustomInputProps> = ({
  openCalendar,
  value,
  handleValueChange,
  invalid,
  disabled,
}) => {
  return (
    <AppInput
      onFocus={openCalendar}
      value={value ?? ""}
      onChange={handleValueChange}
      invalid={invalid}
      disabled={disabled}
    />
  );
};

type Props = {
  id?: string;
  label?: string;
  invalid: boolean;
  required?: boolean;
  calendar?: CalenderType;
  disabled?: boolean;
  value?: string | null;
  onChange?: (val: any) => void;
  [key: string]: any;
};

const AppDatePicker: React.FC<Props> = ({
  id,
  label,
  invalid,
  required,
  calendar,
  disabled = false,
  value,
  ...otherProps
}) => {
  const calendarConfig = useMemo(() => {
    if (calendar === "qamari") {
      return {
        calen: arabic,
        calenLang: arabic_en,
      };
    }

    if (calendar === "shamsi") {
      return {
        calen: persian,
        calenLang: persian_en,
      };
    }

    return {
      calen: gregorian,
      calenLang: gregorian_en,
    };
  }, [calendar]);

  const pickerValue = useMemo(() => {
    if (!value) return null;

    return new DateObject({
      date: value,
      format: "YYYY-MM-DD",
      calendar: calendarConfig.calen,
      locale: calendarConfig.calenLang,
    });
  }, [value, calendarConfig.calen, calendarConfig.calenLang]);

  return (
    <div>
      {label && (
        <AppLabel
          id={id}
          label={label}
          required={required}
          disabled={disabled}
        />
      )}

      <div>
        <DatePicker
          {...otherProps}
          render={<CustomInput invalid={invalid} disabled={disabled} />}
          calendar={calendarConfig.calen}
          locale={calendarConfig.calenLang}
          value={pickerValue}
          format="YYYY-MM-DD"
          months={calendar === "shamsi" ? dariMonths : undefined}
          weekDays={weekDays}
          weekStartDayIndex={0}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default AppDatePicker;