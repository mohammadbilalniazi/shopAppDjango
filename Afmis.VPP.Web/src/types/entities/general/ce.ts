import { Lookup } from "../../base";
import { ApplicationUser } from "../sa/applicationUser";
import { ProjectFund } from "./fund";

export interface Province {
  id: number;
  name: string;
  nameEnglish: string;
  phone?: string;
}
export interface District {
  id: number;
  name: string;
  nameEnglish: string;
  provinceId: number;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  nameEnglish: string;
  description?: string;
  institutionId: number;
  parentDepartmentId?: number;
  actions?: string;
  isProvincial:boolean;
}
export interface InstitutionType {
  id: number;
  name: string;
  description: string;
}

export interface InstitutionAccessSync{
  institutionId: number;
}
export interface SyncAVCAccount{
  institutionId: number;
}

export interface Institution {
  isSelected: boolean;
  id: number;
  name: string;
  description: string;
  institutionTypeId: number;
  remunirationTypeIds: number[];
  institutionCode: string;
  activityCode: string;
  location: string;
  tashkilCode: string;
  parentInstitutionId: number;
  rootParentId: number;
  parentInstitution: Lookup;
  isActive: boolean;
  type: string;
  // Moe Institutions
  isMoeInstituion: boolean;
  misCode?: string;
  moEInstitutionTypeId?: number;
  moEInstitutionStageId?: number;
  moEInstitutionGenderId?: number;
  moEInstitutionDetailId?: number;
  province?: string;
  district?: string;
  institutionId?: number;
  moEInstitutionDetailDescription?: string;
  institutionAccessRemunirations?: InstitutionAccessRemuniration[];
  institutionDepartments?: Department[];
  institutionAvcAccounts?: AVCAccount[];
  institutionProjectFunds?: ProjectFund[];
  institutionUsers?: ApplicationUser[];
  institutionChildInstitutions?:ChildInstitution[];
  bankId?:number;
}
export interface ChildInstitution {
  isSelected: boolean;
  id: number;
  name: string;
  description: string;
  institutionTypeId: number;
  remunirationTypeIds: number[];
  institutionCode: string;
  activityCode: string;
  location: string;
  tashkilCode: string;
  parentInstitutionId: number;
  rootParentId: number;
  parentInstitution: Lookup;
  isActive: boolean;
  type: string;
  // Moe Institutions
  isMoeInstituion: boolean;
  misCode?: string;
  moEInstitutionTypeId?: number;
  moEInstitutionStageId?: number;
  moEInstitutionGenderId?: number;
  moEInstitutionDetailId?: number;
  province?: string;
  district?: string;
  institutionId?: number;

}

export interface InstitutionAccessRemuniration{
  id:number;
  institutionId:number;
  remunirationTypeId:number;
  object:string;
  projectCode:string;
  activityCode:string;
  objectType?:string;
  actions?: string;
}

export interface InstitutionRemunirationDetail{
  id:number;
  institutionId:number;
  remunirationDetailId:number;
  actions?:string;
}

export interface AllowedETazkiraInstitution{
  id:number;
  institutionId:number;
  isAllowed:boolean;
  actions?:string;
}
export interface Training {
  id: number;
  name: string;
  type: "jpg" | "jpeg" | "mp4" | "pdf";
  description: string;
  path?: string;
  formFile?: File;
  fileContent?: string | null;
}
export interface MOEInstitution {
  id: number;
  misCode: string;
  moEInstitutionTypeId: number;
  moEInstitutionStageId: number;
  moEInstitutionaGenderId: number;
  province: string;
  district: string;
  institutionId?: number;
  description: string;
  moEInstitutionDetailDescription?: string;
}
export interface MoEInstitutionType {
  id: number;
  name: string;
}

export interface MoEInstitutionStage {
  id: number;
  name: string;
  moEInstitutionTypeId: number;
}
export interface MoEInstitutionGender {
  id: number;
  name: string;
}

export interface FiscalYear {
  id: number;
  year: string;
  status: boolean;
  description: string;
}

export interface FiscalMonth {
  year(year: any): number;
  id: number;
  yearId: number;
  month: string;
  workingDays: number;
  status: boolean;
  code: number;
  description: string;
}

export interface AVCAccount {
  id: number;
  avc: string;
  accountNumber: string;
  description: string;
  object: string;
  type: string;
  institutionId: number;
  actions?: string;

}

export interface Address {
  id: number;
  name: string;
  parentId: number | string;
  addressType: string;
  code: string;
  isActive: boolean;
  
}
