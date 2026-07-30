
/* eslint-disable no-unused-vars */
export interface SearchProps {
  toggleSearch?: () => void;
}
export interface InsertModelProps {
  toggle?: () => void;
}
export interface toggleSearchResultsProps extends SearchResultsProps {
  toggle?: VoidFunction;
}


export interface SearchResultsProps {
  lookup?: boolean;
  onClick?: ({
    id,
    value,
    ...next
  }: {
    id: string | number;
    value: string | number;
    [key: string]: any;
  }) => void;
}

export interface ModulePermissionProps {
  userId: string;
}

export interface TabDetailsProps {
  label: string;
  name: string;
}

export type SmallFormPopupProps = {
  isOpen: boolean;
  loading?: boolean;
  title?: string;
  onClose: () => void;
  onConfirm: (isExcelReport: boolean) => void;
};
