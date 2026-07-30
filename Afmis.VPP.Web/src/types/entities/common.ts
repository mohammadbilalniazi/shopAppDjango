export interface HijriDatesEntity {
  startdateHijri: string;
  enddateHijri: string;
}

export interface AuditableEntity {
  createdBy: string;
  createdDate: Date;
  lastModifiedBy: string;
  lastModifiedDate?: Date;
}

export interface ReferenceDomain {
  id: number;
  classname: string;
  referenceid: number;
  referencevalue: string;
}

export interface DatePickerEntity {
  month: Month;
  year: number;
  day: number;
}

interface Month {
  index: number;
  number: number;
}

export interface PopupProps {
  onUpdateItems?: (items: any[]) => void;
  onRemoveItems?: (items: any[]) => void;
  toggle?: () => VoidFunction;
}