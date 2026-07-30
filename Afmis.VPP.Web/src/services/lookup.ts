import { ObjectAny } from "../types/base";
import { cloneObject } from "../utilities/utilFuncs";

export const removeLookups = <T>(obj: T): T =>
  transformLookups(obj, {
    institution: "institutionId",
    employee: "employeeId",
    headCountDetail: "headCountDetailId",
    accountNumber: "accountNumber",
    filing: "filingId",
    parentInstitution: "parentInstitutionId",
    mdLawyerLookup: "mdLawyerId",
    
  });

export const transformLookups = <T = ObjectAny>(
  obj: T,
  mappings: {
    [key: string]: unknown;
  }
): T => {
  const transformedObj = cloneObject(obj) as any;
  function transformProperties(
    obj: {
      [key: string]: unknown;
    },
    mappings: {
      [key: string]: unknown;
    }
  ) {
    for (const [prop, propId] of Object.entries(mappings)) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        obj[propId as string] = (
          obj[prop] as { value: number; label: string }
        )?.value;
        delete obj[prop];
      }
    }

    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          for (const item of obj[key] as []) {
            transformProperties(item as { [key: string]: unknown }, mappings);
          }
        } else {
          transformProperties(obj[key] as { [key: string]: unknown }, mappings);
        }
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  transformProperties(transformedObj, mappings);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return transformedObj;
};
