import * as Yup from "yup";
import { numberSchemaOrEmptyString, fieldTranslate, triStateCheckboxSchema } from "../base";

export const departmentSchema = Yup.object().shape({
  name: Yup.string().required(),
  nameEnglish: Yup.string(),
  description: Yup.string(),
  code: Yup.string().required(),
  institutionId: Yup.number().required(fieldTranslate("Org")),
  isProvincial: Yup.boolean().required(),
  parentDepartmentId: numberSchemaOrEmptyString,
});

export const departmentSearchSchema = Yup.object().shape({
  name: Yup.string(),
  nameEnglish: Yup.string(),
  description: Yup.string(),
  code: Yup.string(),
  institutionId: numberSchemaOrEmptyString,
  isProvincial: triStateCheckboxSchema,
  parentDepartmentId: numberSchemaOrEmptyString,
});


export const institutionTypeSchema = Yup.object().shape({
  name: Yup.string().required(),
  description: Yup.string().required(),
});

export const institutionTypeSearchSchema = Yup.object().shape({
  name: Yup.string(),
  description: Yup.string(),
});


export const allowedETazkiraInstitutionSchema = Yup.object().shape({
  institutionId: Yup.string().required(),
  isAllowed:triStateCheckboxSchema,
});

export const allowedETazkiraInstitutionSearchSchema = Yup.object().shape({
  institutionId: Yup.string(),
  isAllowed:triStateCheckboxSchema,
});

export const institutionSchema= Yup.object().shape({
  name: Yup.string().required(),
  description: Yup.string().required(),
  institutionTypeId: Yup.number().required(),
  bankId: Yup.number().required(),
  activityCode: Yup.string().required(),
  tashkilCode: Yup.string().required(),
  location: Yup.string().required(),
  type: Yup.string().required(),
  parentInstitutionId: Yup.number().required(),
  isActive:triStateCheckboxSchema,
  //Moe Institution
  isMoeInstituion:triStateCheckboxSchema,
  misCode: Yup.string().nullable(),
  // remunirationTypeId: Yup.mixed().when("isMoeInstituion", {
  //   is: true,
  //   then: () => Yup.number().required(),
  //   otherwise: () => numberSchemaOrEmptyString,
  // }),
  moEInstitutionTypeId: Yup.mixed().when("isMoeInstituion", {
    is: true,
    then: () => Yup.number().required(),
    otherwise: () => numberSchemaOrEmptyString,
  }),
  moEInstitutionStageId: Yup.mixed().when("isMoeInstituion", {
    is: true,
    then: () => Yup.number().required(),
    otherwise: () => numberSchemaOrEmptyString,
  }),
  moEInstitutionaGenderId: Yup.mixed().when("isMoeInstituion", {
    is: true,
    then: () => Yup.number().required(),
    otherwise: () => numberSchemaOrEmptyString,
  }),
  province: Yup.mixed().when("isMoeInstituion", {
    is: true,
    then: () => Yup.string().required(),
    otherwise: () => Yup.string().nullable(),
  }),
  district: Yup.mixed().when("isMoeInstituion", {
    is: true,
    then: () => Yup.string().required(),
    otherwise: () => Yup.string().nullable(),
  }),
});

export const institutionSearchSchema = Yup.object().shape({
  name: Yup.string(),
  description: Yup.string(),
  institutionTypeId: numberSchemaOrEmptyString,
  // institutionCode: Yup.string(),
  activityCode: Yup.string(),
  location: Yup.string(),
  type: Yup.string(),
  tashkilCode: Yup.string(),
  parentInstitutionId: numberSchemaOrEmptyString,
  isActive:triStateCheckboxSchema,
});



export const institutionAccessRemunirationSchema = Yup.object().shape({

  institutionId: Yup.number().required(fieldTranslate("Org")),
  remunirationTypeId: Yup.number().required(),
  activityCode: Yup.string().required(),
  projectCode: Yup.string().required(),

});

export const institutionAccessRemunirationSearchSchema = Yup.object().shape({
  institutionId:numberSchemaOrEmptyString,
  remunirationTypeId:numberSchemaOrEmptyString,
  activityCode: Yup.string(),
  projectCode: Yup.string(),

});


export const institutionRemunirationDetailSchema = Yup.object().shape({
  institutionId: Yup.number().required(fieldTranslate("Org")),
  remunirationDetailId: Yup.number().required(),


});

export const institutionRemunirationDetailSearchSchema = Yup.object().shape({
  institutionId:numberSchemaOrEmptyString,
  remunirationDetailId:numberSchemaOrEmptyString,
});

export const MOEInstitutionSchema = Yup.object().shape({
  misCode: Yup.string(),
  moEInstitutionTypeId: Yup.number().required(),
  moEInstitutionStageId: Yup.number().required(),
  moEInstitutionaGenderId:Yup.number().required(),
  province: Yup.string().required(),
  district: Yup.string().required(),
  institutionId:numberSchemaOrEmptyString,
  description: Yup.string().required(), 
}); 


export const MOEInstitutionSearchSchema = Yup.object().shape({
  misCode: Yup.string(),
  moEInstitutionTypeId: numberSchemaOrEmptyString,
  moEInstitutionStageId: numberSchemaOrEmptyString,
  moEInstitutionaGenderId:numberSchemaOrEmptyString,
  province: Yup.string(),
  district: Yup.string(),
  institutionId:numberSchemaOrEmptyString,
  description: Yup.string(), 
});

export const fiscalYearSchema = Yup.object().shape({
  year: Yup.string().required(),
  status: Yup.boolean(),
  description: Yup.string().required(),
});

export const fiscalYearSearchSchema = Yup.object().shape({
  year: Yup.string(),
  status: triStateCheckboxSchema,
  description: Yup.string(),
});

export const fiscalMonthSchema = Yup.object().shape({
  yearId: Yup.number().required(),
  workingDays: Yup.number().required(),
  month: Yup.string().required(),
  status: triStateCheckboxSchema,
  description: Yup.string().required(),
});
export const trainingSchema=Yup.object().shape({
  name:Yup.string().required(),
  type:Yup.string().required(),
  description:Yup.string().required(),
}) 
export const trainingSearchSchema=Yup.object().shape({
  name:Yup.string(),
  type:Yup.string(),
  description:Yup.string(),
})
export const fiscalMonthSearchSchema = Yup.object().shape({
  yearId: numberSchemaOrEmptyString,
  workingDays: numberSchemaOrEmptyString,
  month: Yup.string(),
  status: triStateCheckboxSchema,
  description: Yup.string(),
});

export const avcAccountSchema = Yup.object().shape({
  avc: Yup.string().required(),
  accountNumber: Yup.string().required(),
  description: Yup.string(),
  object: Yup.string().required(),
  type: Yup.string().required(),
  institutionId: Yup.number().required(fieldTranslate("Org")),
});

export const avcAccountSearchSchema = Yup.object().shape({
  avc: Yup.string(),
  accountNumber: Yup.string(),
  description: Yup.string(),
  object: Yup.string(),
  type: Yup.string(),
  institutionId: Yup.mixed().nullable(),
});

export const addressSchema = Yup.object().shape({
  name: Yup.string().required(),
  parentId: numberSchemaOrEmptyString,
  addressType: Yup.string().required(),
  code: Yup.string().required(),
  isActive: Yup.boolean(),
});

export const addressSearchSchema = Yup.object().shape({
  name: Yup.string(),
  parentId: numberSchemaOrEmptyString,
  addressType: Yup.string(),
  code: Yup.string(),
  isActive: triStateCheckboxSchema,
});

export const FundSchema = Yup.object().shape({
  fundCode: Yup.number().required(),
  nameDari: Yup.string().required(),
  nameEnglish: Yup.string().required(),
  donor: Yup.string().required(),
  donorCode: Yup.number().required(),
  parentId: numberSchemaOrEmptyString,
  description: Yup.string().required(),
});
export const FundSearchSchema = Yup.object().shape({
  fundCode: numberSchemaOrEmptyString,
  nameDari: Yup.string(),
  nameEnglish: Yup.string(),
  donor: Yup.string(),
  donorCode: numberSchemaOrEmptyString,
  parentId: numberSchemaOrEmptyString,
  description: Yup.string(),
});

export const ProjectFundSchema = Yup.object().shape({
  project: Yup.string().required(),
  type: Yup.string().required(),
  code:Yup.number().required(),
  institutionId: Yup.number().required(fieldTranslate("Org")),
  remunirationTypeId: Yup.number().required(),
  fundId: Yup.number().required(),
  description: Yup.string().required(),
});

export const ProjectFundSearchSchema = Yup.object().shape({
  project: Yup.string(),
  type: Yup.string(),
  code:numberSchemaOrEmptyString,
  institutionId: numberSchemaOrEmptyString,
  remunirationTypeId: numberSchemaOrEmptyString,
  fundId: numberSchemaOrEmptyString,
  description: Yup.string(),
});
