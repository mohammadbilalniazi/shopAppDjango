export interface MenuItem {
  id: string;
  isHeader: boolean;
  subItems: MenuItem[];
  click: any;
  link: string;
  icon: string;
  label: string;
  stateVariables: boolean;
  isChildItem: boolean;
  isSubItem?: boolean;
  childItems: MenuItem[];
  badgeName?: string;
  badgeColor?: string;
  // New Data
  parentId?: string;
}
