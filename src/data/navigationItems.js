import { 
  House, 
  ArrowUpDown, 
  Settings2, 
  ChartColumn, 
  CircleUserRound, 
  Info
} from "lucide-react";

export const mainNavItems = [
  { icon: House, label: "Home" },
  { icon: ArrowUpDown, label: "Desk" },
  { icon: ChartColumn, label: "Reports" },
];

export const footerNavItems = [
  { icon: Settings2, label: "Configuration" },
  { icon: Info, label: "About us" },
];

export const profileNavItem = { 
  icon: CircleUserRound, 
  label: "Profile", 
  iconSize: 40 
};
