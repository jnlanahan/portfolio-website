export interface ListItemType {
  title: string;
  description: string;
  link?: string;
  linkText?: string;
  image?: string; // Optional small picture for this item
  highlight?: boolean;
}

export interface ListType {
  title: string;
  icon: string;
  color?: string; // Optional color for theming each list
  description?: string; // Optional description for the list
  mainImage?: string; // Main picture for the entire list
  items: ListItemType[];
}

export type ListsType = ListType[];

export function getLists(): ListsType {
  return [];
}
