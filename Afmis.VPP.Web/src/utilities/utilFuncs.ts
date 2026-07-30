import _, { cloneDeep } from "lodash";
import {
  ObjectAny, 
  Operations,
  TransformObjectForSearchType,
} from "../types/base";
import DateObject from "react-date-object";
import { AppDispatch } from "../store";
import { setToastAlert } from "../store/notifications/slice";
import { t } from "i18next";
import { TypeOptions } from "react-toastify";

// Calendars
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import arabic from "react-date-object/calendars/arabic"; // Hijri (Umm al-Qura)

// Locales (adjust if you want different languages)
import gregorian_en from "react-date-object/locales/gregorian_en";
import persian_fa from "react-date-object/locales/persian_fa";
import arabic_en from "react-date-object/locales/arabic_en"; // or arabic_ar for Arabic UI
import { FiscalMonth } from "../types/entities/general/ce";
import { handleDiscaredFieldfrom } from "./utilFuncs2";
import { Holiday } from "../types/entities/attendance/holiyday";
// Define the range and values to check
export const combineName = (empName: string, fatherName: string): string => {
  return `${empName || ''} ${fatherName || ''}`;
};
export const capitalizedWords=(str:string)=>{
  if(!str) return "";
  return str.charAt(0).toUpperCase()+str.slice(1).toLowerCase();
}
export const removeEmptyKeys = <T extends Record<string, any>>(obj: T): Partial<T> => {
  if (typeof obj === "object" && obj !== null) {
    return Object.entries(obj)
      .filter(([_, value]) => 
        value !== "" && 
        value !== null && 
        value !== undefined && 
        !(typeof value === "object" && Object.keys(removeEmptyKeys(value)).length === 0)
      )
      .reduce((acc, [key, value]) => {
        acc[key as keyof T] = typeof value === "object" ? removeEmptyKeys(value) : value;
        return acc;
      }, {} as Partial<T>);
  }
  return obj;
};

export const calculateMalia = (amount: number): any => {
  let malia = 0;

  if (amount > 100000) {
    malia =
      (amount - 100000) * (20 / 100) +
      (100000 - 12500) * (10 / 100) +
      (12500 - 5000) * (2 / 100);
  } else if (amount > 12500 && amount <= 100000) {
    malia = (amount - 12500) * (10 / 100) + (12500 - 5000) * (2 / 100);
  } else if (amount > 5000 && amount <= 12500) {
    malia = (amount - 5000) * (2 / 100);
  }
  return malia;
};

export const getValue = (val: any): any => {
  if (val === null || val === undefined) {
    return "";
  }
  return val;
};

export const getValueAmount = (val: unknown) => {
  if (val === null || val === undefined || val === "") {
    return 0;
  }
  return val;
};

export const getValueCheckBox = (val: unknown) => {
  if (val === null || val === undefined || val === "") {
    return false;
  }
  return val;
};

// function to check value is null or empty covert it to {label: "", value: ""} object and return it
// otherwise return the same value
export const getLookupValue = (val: unknown) => {
  if (val == null || val === "" || val === undefined) {
    return { label: "", value: "" };
  }
  return val;
};

export const getValueModalInput = (val: unknown): ObjectAny => {
  if (val === "" || val === undefined) {
    return {};
  }
  return val as ObjectAny;
};
export const getValueList = (val: unknown) => {
  if (val == null || val === "" || val === undefined || !Array.isArray(val)) {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return val;
};

export const formatDate = (d: string | null | Date) => {
  if (d === null || d === undefined || d === "") {
    return "";
  }
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = String(date.getFullYear()).padStart(4, "0");
  return yyyy + "/" + mm + "/" + dd;
};

export const isValidGregorianDate = (dateString:string) => {
  const date = new DateObject({
    date: dateString,
    format: "YYYY-MM-DD",
  });

  // Format back the parsed date and compare
  const normalizedInput = dateString.trim();
  const normalizedParsed = date.format("YYYY-MM-DD");
  const isValid=normalizedInput === normalizedParsed;
  if (!isValid) {
    // const dateParts = dateString.split("-");
    // const year = parseInt(dateParts[0]);

    return false;
  }

  return true;
};

export const getGregorianDate=(d: { toDate: () => any; })=>{
   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
   const date = d.toDate(); // Converts to JavaScript Date object
   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
   const year = date.getFullYear();
   // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
   const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
   const day = String(date.getDate()).padStart(2, "0");
   const formattedDate = `${year}-${month}-${day}`;
   return formattedDate;
}
type MultiCalendarDate = {
  gregorian: { obj: DateObject; formatted: string };
  hijriPersian: { obj: DateObject; formatted: string };
  hijriPersianForDateDropDown: { obj: DateObject; formatted: string };
  hijriSaudi: { obj: DateObject; formatted: string };
};

export const getCurrentDate = (format="dash-format"): MultiCalendarDate => {
  const now = new Date();

  const greg = new DateObject({ date: now, calendar: gregorian, locale: gregorian_en });
  const hijriPersian = new DateObject({ date: now, calendar: persian, locale: persian_fa });
  const hijriPersianForDateDropDown = new DateObject({ date: now, calendar: persian, locale: gregorian_en}); // for date drop down to show in english but in hijri calendar
  const hijriSaudi = new DateObject({ date: now, calendar: arabic, locale: arabic_en });
  if(format=="dash-format"){
     return {
    gregorian: { obj: greg, formatted: greg.format("YYYY-MM-DD") },
    hijriPersian: { obj: hijriPersian, formatted: hijriPersian.format("YYYY-MM-DD") },
    hijriPersianForDateDropDown: { obj: hijriPersianForDateDropDown, formatted: hijriPersianForDateDropDown.format("YYYY-MM-DD") },
    hijriSaudi: { obj: hijriSaudi, formatted: hijriSaudi.format("YYYY-MM-DD") },
  };
  }
  return {
    gregorian: { obj: greg, formatted: greg.format("YYYY/MM/DD") },
    hijriPersian: { obj: hijriPersian, formatted: hijriPersian.format("YYYY/MM/DD") },
    hijriPersianForDateDropDown: { obj: hijriPersianForDateDropDown, formatted: hijriPersianForDateDropDown.format("YYYY/MM/DD") },
    hijriSaudi: { obj: hijriSaudi, formatted: hijriSaudi.format("YYYY/MM/DD") },
  };
};
 
// function to covert number to number with 2 decimal places for the amount fields
export const convertToTwoDecimalPlaces = (number: number | null | string) => {
  if (
    !number ||
    number === "" ||
    number === null ||
    number === undefined ||
    number === "0.00"
  ) {
    number = 0;
  }

  number = Number(number);
  return Number(number.toFixed(2)).toFixed(2);
};

export const parseFloatCustom = (number: string) => {
  const num = parseFloat(number);
  if (isNaN(num)) {
    return "";
  }
  return num;
};
export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const containsKeys = [
  "empName",
  "nameEnglish",
  "familyName",
  "empNameEnglish",
  "tazkira",
  "email",
  "code",
  "name",
  "firstName",
  "fatherName",
  "grandFatherName",
  "fatherNameEnglish",
  "grandFatherNameEnglish",
  "phone",
  "number",
  // "controller",
];
// const shouldNotNullKeys=['m41Number', 'm41Date']
const dateRanges=['fromDate','toDate'];
const entryDateRanges=['fromDateEntry','toDateEntry'];
const createdDateRanges=['fromCreatedDate','toCreatedDate'];
const actionTimeRanges=['fromActionTime','toActionTime'];
const logintTimeRanges=['fromLoginTime','toLoginTime'];
const empLastModifiedDateRanges=['fromLastModifiedDate','toLastModifiedDate'];
const logoutTimeRanges=['fromLogoutTime','toLogoutTime'];
let ope: Operations = "EqualTo";
export const transformObjectForSearch = <T extends ObjectAny>(obj: T) => {
  let dateRangeSaved=false;
  let entryDateRangeSaved=false;
  let createdDateRangeSaved=false;
  let empLastModifiedDateRangeSaved=false;
  let actionTimeRangeSaved=false;
  let loginTimeRangeSaved=false;
  let logoutTimeRangeSaved=false;
  const arr: TransformObjectForSearchType[] = []; 
  obj = handleDiscaredFieldfrom(obj) as T;
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (containsKeys.indexOf(key) != -1) {
      ope = "Contains";
    } else {
      ope = "EqualTo";
    } 

    if (value) {
      if (dateRanges.indexOf(key)!=-1) {
      const property='LastModifiedDate';
        if(!dateRangeSaved){
          if(obj['fromDate']){
            arr.push({ propertyName:property, value: obj['fromDate'], operation: "GreaterThanOrEqualTo" });
          }
          if(obj['toDate'] ){
            arr.push({ propertyName: property, value: obj['toDate'], operation: "LessThanOrEqualTo" });
          }
        }
        dateRangeSaved=true;
      } 
    
      else if (entryDateRanges.indexOf(key)!=-1) {
      const property='entryDate';
        if(!entryDateRangeSaved){
          if(obj['fromDateEntry']){
            arr.push({ propertyName:property, value: obj['fromDateEntry'], operation: "GreaterThanOrEqualTo" });
          }
          if(obj['toDateEntry'] ){
            arr.push({ propertyName: property, value: obj['toDateEntry'], operation: "LessThanOrEqualTo" });
          }
        }
        entryDateRangeSaved=true;
      } 
      else if (createdDateRanges.indexOf(key)!=-1) {
        const property='createdDate';
        if(!createdDateRangeSaved){
          if(obj['fromCreatedDate']){
            arr.push({ propertyName:property, value: obj['fromCreatedDate'], operation: "GreaterThanOrEqualTo" });
          }
            if(obj['toCreatedDate'] ){
            arr.push({ propertyName: property, value: obj['toCreatedDate'], operation: "LessThanOrEqualTo" });
          }
        }
        createdDateRangeSaved=true;
      }
      else if (empLastModifiedDateRanges.indexOf(key)!=-1) {
        const property='lastModifiedDate';
        if(!empLastModifiedDateRangeSaved){
          if(obj['fromLastModifiedDate']){
            arr.push({ propertyName:property, value: obj['fromLastModifiedDate'], operation: "GreaterThanOrEqualTo" });
          }
            if(obj['toLastModifiedDate'] ){
            arr.push({ propertyName: property, value: obj['toLastModifiedDate'], operation: "LessThanOrEqualTo" });
          }
        }
        empLastModifiedDateRangeSaved=true;
      }
      else if (actionTimeRanges.indexOf(key)!=-1) {
          const property='actionTime';
          if(!actionTimeRangeSaved){
            if(obj['fromActionTime']){
              arr.push({ propertyName:property, value: obj['fromActionTime'], operation: "GreaterThanOrEqualTo" });
            }
              if(obj['toActionTime'] ){
              arr.push({ propertyName: property, value: obj['toActionTime'], operation: "LessThanOrEqualTo" });
            }
          }
          actionTimeRangeSaved=true;
      }
      else if (logintTimeRanges.indexOf(key)!=-1) {
        const property='loginTime';
        if(!loginTimeRangeSaved){
          if(obj['fromLoginTime']){
            arr.push({ propertyName:property, value: obj['fromLoginTime'], operation: "GreaterThanOrEqualTo" });
          }
            if(obj['toLoginTime'] ){
            arr.push({ propertyName: property, value: obj['toLoginTime'], operation: "LessThanOrEqualTo" });
          }
        }
        loginTimeRangeSaved=true;
      }
      else if (logoutTimeRanges.indexOf(key)!=-1) {
        const property='logoutTime';
        if(!logoutTimeRangeSaved){
          if(obj['fromLogoutTime']){
            arr.push({ propertyName:property, value: obj['fromLogoutTime'], operation: "GreaterThanOrEqualTo" });
          }
            if(obj['toLogoutTime'] ){
            arr.push({ propertyName: property, value: obj['toLogoutTime'], operation: "LessThanOrEqualTo" });
          }
        }
        logoutTimeRangeSaved=true;
      } 
      else if (value == "WITH_ACCOUNT_NUMBER" || value == "WITH_TIN_NUMBER") {
        arr.push({
          propertyName: key,
          value: null,
          operation: "IsNotNull",
        });
      } else {
        arr.push({
          propertyName: key,
          value,
          // operation: "EqualTo",
          operation: ope,
        });
      }
    } 
    else if ((value === false || value === 0 || value === null) && value!="") { // WITHOUT EMPTY STRING    
      if (value == null) {
        arr.push({
          propertyName: key,
          value,
          operation: "IsNull",
        });
      } else {
        arr.push({
          propertyName: key,
          value,
          operation: "EqualTo",
        });
      }
    }

  });
  return arr;
};

export const isEmpty = <T>(obj: T) => {
  // Check if the object is null or undefined
  if (obj == null) {
    return true;
  }
  if (typeof obj === "boolean") {
    return true;
  }

  // Check if the object has any properties
  if (Object.keys(obj).length === 0) {
    return true;
  }

  // Recursively check nested properties
  for (const key in obj) {
    if (obj[key]) {
      return false;
    }
  }

  return true;
};

// function which convert number in to 3 digit comma seperated format,
//  if with two decimal places,
// if it has 2 decimal places don't add decimal places,
// if it has only one decimal place add one decimal place and
//  if it has no decimal places add two decimal places
// used in data table to format the amount fields
export const numberWithCommas = (number: number | null) => {
  if (number === null) {
    return "";
  }
  const roundedNumber = Math.round(number * 100) / 100; // Round to 2 decimal places
  const numberString = roundedNumber.toString(); // Convert to string

  // Check the number of decimal places
  const decimalIndex = numberString.indexOf(".");
  let decimalPlaces = 0;

  if (decimalIndex !== -1) {
    decimalPlaces = numberString.length - decimalIndex - 1;
  }

  // Add decimal places as needed
  let formattedNumber = numberString;

  if (decimalPlaces === 2) {
    formattedNumber += "";
  } else if (decimalPlaces === 1) {
    formattedNumber += "0";
  } else {
    formattedNumber += ".00";
  }

  // Add comma separators for thousands
  const parts = formattedNumber.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return parts.join(".");
};

// function which filter null properties from the object and set it to empty string
type FunctionType = (arg1: unknown) => unknown;

export const filterNullProperties = (
  obj: {
    [key: string]: unknown;
  },
  options: {
    [key: string]: FunctionType;
  }
) => {
  const newObj: {
    [key: string]: unknown;
  } = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] === null || obj[key] == undefined) {
      newObj[key] = "";
    } else {
      newObj[key] = obj[key];
    }
    if (options && options[key]) {
      newObj[key] = options[key](newObj[key]);
    }
  });
  return newObj;
};

export const convertToSpacedWords = (input: string) => {
  const spacedWords = input.replace(/([a-z])([A-Z])/g, "$1 $2");

  // Capitalize the first letter of each word
  const capitalizedWords = spacedWords
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

  return capitalizedWords;
};

export const cloneObject = <T>(obj: T) => _.cloneDeep(obj);

export function thursdaysOfMonth(fiscalYear: number, fiscalMonth: number) {
  const randomDay = 5;

  const currentDate = new DateObject({
    year: fiscalYear,
    month: fiscalMonth,
    day: randomDay,
    calendar: persian,
  });

  const currentDatemonthIndex = currentDate.monthIndex;
  const currentDateyear = currentDate.year;
  const currentDatemonth = currentDatemonthIndex + 1;
  const currentDatemonthsLength = currentDate.month.length;


  const thursdays: string[] = [];
  for (let i = 0; i < currentDatemonthsLength; i++) {
    const allCurrentDateMonth = new DateObject({
      year: currentDateyear,
      month: currentDatemonth,
      day: i + 1,
      calendar: persian,
    });
    const weekDayCurrent = allCurrentDateMonth.weekDay.name;
    if (weekDayCurrent == "Thursday") {
      const thursdayDayNo = allCurrentDateMonth.day;

      thursdays.push(thursdayDayNo.toString());
    }
  }
  return thursdays;
}
export function isHoliday(fiscalYearId: number, fiscalMonthId: number,day: string,holidays:Holiday[]) {

  // const currentDate = new DateObject({
  //   year: fiscalYear,
  //   month: fiscalMonth,
  //   day: day,
  //   calendar: persian,
  // });
    // console.log("currentDate ",currentDate.weekDay.name," randomDay ",day," number ",currentDate.weekDay.number);
  // const currentDateWeekDayName = currentDate.weekDay.name;
  // return currentDateWeekDayName === "Friday";
  const holiday=holidays.filter((holiday) => holiday.fiscalYearId === fiscalYearId && holiday.fiscalMonthId === fiscalMonthId && holiday.day === day);
  return holiday.length > 0;
}
export const getHoliWorkingdays=(from:number,to:number,holidays:number[],thursdays:string[] | undefined)=>{
  const fromToDay = Array.from({ length: to - from + 1 }, (_, i) => i + from);
  const thursdaysOffDates=fromToDay.filter((item)=>thursdays?.includes(item.toString()));
  const thursdaysOff=thursdaysOffDates.length;// const holidaysResult = holidays.map(day => ({day,isholiday: fromToDay.includes(day)}));
  const offDaysDates=holidays.filter(holiday =>  fromToDay.includes(holiday));
  const offDays=offDaysDates.length;
  const workingDaysDates=fromToDay.filter((day)=>!offDaysDates.includes(day));
  const workingDays=to - from + 1-offDays;
  return {offDays,offDaysDates,workingDays,workingDaysDates,thursdaysOff};
}



function isLeapYear(year:number,calendar:string) {
  if(calendar=="shamsi"){
    return [1,5,9,13,17,22,26,30].includes(year % 33);
  }
  return year % 400 ==0 || (year % 100 !=0 && year % 4 ==0);
}

export const isValidShamsiDate=(date:string,dispatch:AppDispatch)=> {
  const [year, month, day] = date.split("-").map(Number);
  let isValid=true;
  let message="";
  if(year < 1){
    message= t("YearOfDateIsNotValid");
    isValid=false;
  }
  else if(month<1  || month > 12){
    message=message+t("MonthOfDateIsNotValid");
    isValid=false;
  }

  // Check year and month ranges
  // if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  let daysInMonth;
  if (month <= 6) {
      daysInMonth = 31; // haml to sunbala
  } else if (month <= 11) {
      daysInMonth = 30; // mizan to hoot
  } else {
      daysInMonth = isLeapYear(year,"shamsi") ? 30 : 29; // hoot
  }
  // Check day range
   if(day > daysInMonth || day<1){
    message= message+t("DayOfDateIsNotValid");
    isValid=false;
  }

  if(!isValid){
    dispatch(
      setToastAlert({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        msg: message,
        type: "error",
      })
    );
  }
  return isValid;
}


export const handleMessage = ({
  dispatch,
  message,
  typ,
  show,
}: {
  dispatch: AppDispatch;
  message: string | string[];
  typ: TypeOptions;
  show: boolean;
}) => {
  if (show) {
    dispatch(
      setToastAlert({
        msg: message,
        type: typ,
      }) 
    );
  }
  return 0;
}; 

export const validateFieldValue = (dispatch: AppDispatch, values: ObjectAny): boolean => {
  // Check if tazkira and accountNumber exist in values object
  let tazkiraValue = values["tazkira"];
  const tazkiraTypeValue = values["tazkiraType"];
  let accountNumberValue = values["accountNumber"];
  const number=values["number"];
  const number2=values["Number"];
  let tin=values["tin"];
  let password="";
  if('password' in values){
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    password=values["password"];
  } 
  else if('newPassword' in values){
    password=values["newPassword"];
  }
  else if('passwordHash' in values){
    password=values["passwordHash"];
  }
  else if('currentPassword' in values){
    password=values["currentPassword"];
  }
  else if('confirmPassword' in values){
    password=values["confirmPassword"];
  }
  else if('oldPassword' in values){
    password=values["oldPassword"];
  }

 
  const userName=values["userName"];
  const email=values["email"];
  const code=values["code"];
  let msg="";
  let ok=true;
  // Check if tazkira exists and validate
  if (tazkiraValue !== undefined && tazkiraValue !== null) {
    const tazkiraRegex = /^[0-9]*(-[0-9]+)*$/;
    //accountNumber = Regex.Replace(accountNumber, @"[\u00A0\t\n\r\s]+", "")
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    tazkiraValue = tazkiraValue?.replace(/[\u00A0\t\n\r\s]+/g, ""); // /g replace all occurance of special type of space , space ,tab ,new lines carriage return 

    if (typeof tazkiraValue === 'string' && !tazkiraRegex.test(tazkiraValue.trim())) {
      ok=false;
      msg=msg+" "+tazkiraValue+" "+t("tazkiraformatisinvalid");
    }
    else if( tazkiraTypeValue === "ELECTRONIC" && (tazkiraValue as string).length < 13) {
      ok=false;
      msg=msg+" "+String(tazkiraValue)+" "+t("tazkiranumbermustbeatleast13characters");
    }
  } 
  if(code!==undefined && code !==null){
    const codeRegex = /^(?!.*--)(?!.*\.\.)(?!.*-\.)[0-9A-Z][A-Z0-9]*(?:[.]?[A-Z0-9]+)*(?:-[A-Z0-9]+(?:[.]?[A-Z0-9]+)*)*$/;
    if(typeof code==='string' && !codeRegex.test(code.trim())){
      ok=false;
      msg=msg+" "+String(code)+" "+t("codeformatisinvalid");
    }
  }
  if(number!=undefined && number !==null){
    const numberRegex=/^[0-9]*(-[0-9]+)*$/;
    if(typeof number==='string' && !numberRegex.test(number.trim())){
      ok=false;
      msg=msg+" "+String(number)+" "+t("numberformatisinvalid");
    }
  }
  if(number2!=undefined && number2 !==null){
    const numberRegex=/^[0-9]*(-[0-9]+)*$/;
    if(typeof number2==='string' && !numberRegex.test(number2.trim())){
      ok=false;
      msg=msg+" "+String(number2)+" "+t("numberformatisinvalid");
    }
  }

  const passwordRegex = /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};:'"\\|,.<>/?`~%]{3,}$/;
  const passworKeys=["password","newPassword","passwordHash","currentPassword","confirmPassword","oldPassword"];
  passworKeys.forEach((key)=>{
    if(key in values){
      password=values[key];
      if(password && typeof password==='string'  && !passwordRegex.test(password.trim())){
        ok=false;
        msg=msg+" "+String(password)+" "+t("passwordformatisinvalid");
      }
    }
  });
  if(userName!==undefined && userName !==null){
    const userNameRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(typeof userName==='string' && !userNameRegex.test(userName.trim())){
      ok=false;
      msg=msg+" "+String(userName)+" "+t("usernameformatisinvalid");
    }
  }
  if(email!==undefined && email !==null){
    // email should not have spaces and should not have arabic persian letter and should have @ and domain
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(typeof email==='string' && !emailRegex.test(email.trim())){
      ok=false;
      msg=msg+" "+String(email)+" "+t("emailformatisinvalid");
    }
  }
  // Check if accountNumber exists and validate
  if (accountNumberValue !== undefined && accountNumberValue !== null) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    accountNumberValue = accountNumberValue?.replace(/[\u00A0\t\n\r\s]+/g, ""); 
    const bankAccountNumberRegExp =  /^[A-Z0-9]+$/; // Only numbers and characters of english allowed 
    if (typeof accountNumberValue=="string" && !bankAccountNumberRegExp.test(accountNumberValue.trim())) {
      ok=false;
      msg=msg+" "+String(accountNumberValue)+" "+t("AccountNumberFormatNotValid");
    }
  }

  if(tin!==undefined && tin!==null && tin!=="") {
     // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    tin = tin?.replace(/[\u00A0\t\n\r\s]+/g, ""); 
    const tinRegExp =  /^[0-9]+$/; // Only numbers  of english allowed 
    if (typeof tin==="string" && !tinRegExp.test(tin.trim())) {
      ok=false;
      msg=msg+" "+String(tin)+" "+t("TINNotValid");
    }
    else if(String(tin).length !== 10) {
      ok=false;
      msg=msg+" "+String(tin)+" "+t("TINMustBe10Characters");
    }
  }
  if(ok) return true;
  dispatch( setToastAlert({
    msg:msg,
    type: "error",
  }));
  return false;
};


export const filterFieldNameForLocalization = (name: string) => {
  name = capitalizeFirstLetter(name);
  if (name.endsWith("Id") || name.endsWith("id")) {
    name = name.substring(0, name.length - 2);
  }
  return name;
};


export const cleanTazkiraData = (values: ObjectAny) => {
  const data = cloneDeep(values);

  if (data?.tazkiraType=="PAPER" ) {
      const noTazkira = data.no_tazkira;
      const jald = data.jald;
      const safha = data.safha;
      const sabth_no = data.sabth_no;
      const tazkira =
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        noTazkira + "-" + jald + "-" + safha + "-" + sabth_no;
      data.tazkira = tazkira;
  }

  delete data?.no_tazkira;
  delete data?.jald;
  delete data?.safha;
  delete data?.sabth_no;
  return data;
}

export const getInitialQueryString=(pagesize=100)=>{
  const queryParams: ObjectAny = { pageNumber: 1, pageSize:pagesize };
  const queryString = Object.keys(queryParams)
    .map(
      (key) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`
    )
    .join("&"); 
  return queryString;
}

export const getNumberOfDaysOfMonth=(fiscalMonths: FiscalMonth[], fiscalMonthId: number)=>{
  const month = fiscalMonths.find((m) => m.id === fiscalMonthId);
  if (month) {
    return [month?.code,month.workingDays];
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return [0,30];
}

