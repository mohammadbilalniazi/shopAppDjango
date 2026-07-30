import { combineReducers } from "@reduxjs/toolkit";

import layoutReducer from "./layouts/slice";
import notificationsReducer from "./notifications/slice";
import globalReducer from "./global/slice";
import generalReducer from "./general";
import cbaReducer from "./cba";
import araReducer from "./ara";
import glReducer from "./gl";
import filingReducers from "./filing";
import saReducer from "./sa";
import payrollReducer from "./payroll";
import attendanceReducer from "./attendence";
import deductionReducer from "./deduction";
import homeReducer from "./home/index";
import suspendedReducer from "./suspend";

const reducer = combineReducers({
  notifications: notificationsReducer,
  Layout: layoutReducer,
  global: globalReducer,
  cba: cbaReducer,
  ara: araReducer,
  general: generalReducer,
  gl: glReducer,
  filing: filingReducers,
  sa: saReducer,
  payroll: payrollReducer,
  attendance: attendanceReducer,
  deduction: deductionReducer,
  home: homeReducer,
  suspended: suspendedReducer,
});
export default reducer;
