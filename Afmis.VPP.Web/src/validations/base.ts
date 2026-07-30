import * as Yup from "yup";
import { isEmpty } from "../utilities/utilFuncs";
import { t } from "i18next";
export const fieldTranslate = (field: string) =>
  `${t(field)} ${t("required")}`;
// it is used for tri-state checkbox
export const triStateCheckboxSchema = Yup.mixed().oneOf([true, false, ""]);

// it is used for number or empty string
export const numberSchemaOrEmptyString = Yup.mixed().test(
  "is-number-or-empty",
  "Numeric code must be a number or empty",
  function (value) {
    if (value === undefined || value === "" || value === null) {
      return true; // Empty string is a valid value
    }
    return !isNaN(value as number); // Check if value is a number
  }
);
 const regexpPashtoNames=/^[\u0600-\u065F\u066A-\u06EF\u06FA-\u06FF ]+$/
const regexpEngNames=/^[A-Za-z ]+$/

export const languageValidationSchema = ({
  header = "",
  isArabic=true,
  required = false,
}) => {
  const schema = Yup.string().test(
    "testNames",
    function (value, context) {
      if(!value ) { 
        if(required)
          { 
              return context.createError({
                message: `${header} ضروری هست` 
              });
          }else{
            return true;
          }
        }
      const reg=isArabic?regexpPashtoNames:regexpEngNames;
        const isvalid = reg?.test(value?.toString());
        if (!isvalid) {
          if(isArabic){
            return context.createError({
              message: t("fieldShouldBePashtoDariCharacter")??"",
            });
          }
          else{
            return context.createError({
              message: t("fieldShouldBeEnglishCharacter")??"",
            });
          }
         
        }
        return isvalid;
    }
  ).test({
    name: "isRequired",
    message: function () {
      return `${header}` + `ضروری هست`;
    },
    test: function (value) {
      if (required && value=="") {
        return false;
      }
      return true;
    },
    });
  return schema;
};

// it is used for lookup field with the {value, label} structure
export const getLookupSchema = ({
  header = "",
  required = false, 
  codingBlock = false,
}) => {
  const lookupSchema = Yup.object().shape({
    value: Yup.mixed()
      .test({
        name: "hasValueAndLabel",
        message: function () {
          const label = "undefined";
          if (codingBlock) {
            return "Coding Block does not exists";
          }
          return `${label}` + ` is not a valid ${header.toLowerCase()}`;
        },
        test: function (value) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const label = this.parent.label;
          if (label && !value) {
            return false;
          }
          return true;
        },
      })
      .test({
        name: "isRequired",
        message: function () {
          return `${header}` + ` is a required field`;
        },
        test: function (value) {
          if (required && !value) {
            return false;
          }
          return true;
        },
      }),
    label: Yup.string(),
  });

  return lookupSchema;
};

// it is used for non-empty object
export const reqObjectSchema = Yup.object().test({
  name: "not-empty",
  test: (value) => !isEmpty(value),
  message: "Address is required",
});

type numberSchemaProps = {
  required?: boolean;
  min?: number;
  max?: number;
  moreThan?: number;
  lessThan?: number;
};

export const numberSchema = (props?: numberSchemaProps) => {
  const { required = false, min, max, moreThan, lessThan } = props ?? {};

  let schema: Yup.NumberSchema<
    number | null | undefined,
    Yup.AnyObject,
    undefined,
    ""
  > = Yup.number().transform((originalValue: any, originalObject: any) => {
    // If the value is an empty string, convert it to null
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return originalObject === "" ? null : originalValue;
  });

  if (required) {
    schema = schema.required().test(
      "not-empty",
      ({ label }) => `${label} is required field`,
      function (value) {
        if (
          value === undefined ||
          value === null ||
          value.toString() === "" ||
          isNaN(value)
          // value === 0
        ) {
          return false;
        }
        return true;
      }
    );
  } else {
    schema = schema.nullable();
  }

  if (min !== null && min !== undefined && required) {
    schema = schema.min(min);
  }

  if (max !== null && max !== undefined && required) {
    schema = schema.max(max);
  }

  if (moreThan !== null && moreThan !== undefined && required) {
    schema = schema.moreThan(moreThan);
  }

  if (lessThan && required) {
    schema = schema.lessThan(lessThan);
  }

  return schema;
};
