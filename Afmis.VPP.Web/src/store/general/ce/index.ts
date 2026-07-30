import { combineReducers } from "redux";
import institutionTypeReducer from "./institutionType/slice";
import institutionReducer from "./institution/slice";
import institutionAccessRemunirationReducer from "./institutionAccessRemuniration/slice";
import moeInstitutionReducer from "./moeInstitution/slice";
import moeInstitutionGenderReducer from "./moeInstitutionGender/slice";
import moeInstitutionStageReducer from "./moeInstitutionStage/slice";
import moeInstitutionTypeReducer from "./moeInstitutionType/slice";
import fiscalMonthReducer from "./fiscalMonth/slice";
import fiscalYearReducer from "./fiscalYear/slice";
import departmentReducer from "./department/slice";
import avcAccountReducer from "./avcAccount/slice";
import addressReducer from "./address/slice";
import fundReducer from "./fund/slice";
import projectFundReducer from "./projectFund/slice";
import institutionRemunirationDetailReducer from "./institutionRemunirationDetail/slice";
import allowedETazkiraInstitutionReducer from "./allowedETazkiraInstitution/slice";
import trainingReducer from "./training/slice";
const ceReducer = combineReducers({
  institutionTypes: institutionTypeReducer,
  institutions: institutionReducer,
  institutionAccessRemunirations: institutionAccessRemunirationReducer,
  moeInstitutions:moeInstitutionReducer,
  moeInstitutionGenders:moeInstitutionGenderReducer,
  moeInstitutionStages:moeInstitutionStageReducer,
  moeInstitutionTypes:moeInstitutionTypeReducer,
  fiscalYears: fiscalYearReducer,
  fiscalMonths: fiscalMonthReducer,
  departments: departmentReducer,
  avcAccounts: avcAccountReducer,
  addresses: addressReducer,
  funds: fundReducer,
  projectFunds: projectFundReducer,
  institutionRemunirationDetails:institutionRemunirationDetailReducer,
  allowedETazkiraInstitutions:allowedETazkiraInstitutionReducer,
  trainings:trainingReducer,
});

export default ceReducer;
