import { ApiResponse } from "apisauce";
import { ObjectAny } from "../types/base";
import afmis from "./afmis";
import { AfmisResponse } from "../types/store/shared";
import { CodingBlock } from "../types/entities/gl/coa";

export const validateObject = async ({
  code,
  model,
  params,
}: {
  code: string;
  model: string;
  params?: ObjectAny;
}) => {
  const res: ApiResponse<AfmisResponse> = await afmis.get(
    `${model}/GetByCode/${code}`,
    params
  );
  return res;
};

export const validateCodingBlock = async ({
  coagroupId,
  stringcode,
  shouldCreate = true,
}: {
  coagroupId: number;
  stringcode: string;
  shouldCreate?: boolean;
}) => {
  const res: ApiResponse<AfmisResponse<CodingBlock>> = await afmis.post(
    `/Codingblocks/Validate`,
    {
      coagroupId,
      stringcode,
      codingblocktype: "FULL",
      shouldCreateIfNotExist: shouldCreate,
    }
  );
  return res;
};

export const existsCodingBlock = async ({ code }: { code: string }) => {
  const res: ApiResponse<AfmisResponse<CodingBlock>> = await afmis.get(
    `/Codingblocks/GetByCode`,
    {
      code,
    }
  );
  return res;
};