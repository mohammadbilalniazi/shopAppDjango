import { useParams } from "react-router-dom";

const useNumericParams = (paramName = "id"): number => {
  const params = useParams<{ [key: string]: string | undefined }>();
  const paramValue = params[paramName];

  if (paramValue === undefined) {
    throw new Error(`Parameter '${paramName}' is missing.`);
  }

  const numericValue = parseInt(paramValue, 10);

  if (isNaN(numericValue)) {
    throw new Error(`Parameter '${paramName}' is not a valid number.`);
  }

  return numericValue;
};

export default useNumericParams;
