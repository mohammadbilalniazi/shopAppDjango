import { combineReducers } from "redux";

import ceReducer from "./ce";

const generalReducer = combineReducers({
  ce: ceReducer,
});

export default generalReducer;
