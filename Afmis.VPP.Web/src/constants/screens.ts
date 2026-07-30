export type Screen =
  | "INSERT"
  | "SEARCH"
  | "SEARCH_RESULTS"
  | "DETAIL"
  | "NESTED_DETAIL";
export type ScreenOperation =
  | "INSERT"
  | "SEARCH"
  | "UPDATE"
  | "DELETE"
  | "GET"
  | "GET_ALL";
export const screens: Record<Screen, Screen> = {
  INSERT: "INSERT",
  SEARCH: "SEARCH",
  SEARCH_RESULTS: "SEARCH_RESULTS",
  DETAIL: "DETAIL",
  NESTED_DETAIL: "NESTED_DETAIL",
};

export const screenOperations: Record<ScreenOperation, ScreenOperation> = {
  INSERT: "INSERT",
  SEARCH: "SEARCH",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  GET: "GET",
  GET_ALL: "GET_ALL",
};
