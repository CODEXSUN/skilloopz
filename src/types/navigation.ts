export type NavItemData = {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children: NavItemData[];
};
