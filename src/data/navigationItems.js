import { 
  House, 
  ArrowUpDown, 
  Settings2, 
  ChartColumn, 
  CircleUserRound, 
  Settings, 
  Info
} from "lucide-react";

export const mainNavItems = [
  { icon: House, label: "Home" },
  { icon: ArrowUpDown, label: "Desk" },
  { icon: ChartColumn, label: "Reports" },
  { icon: Settings2, label: "Configuration" },
];

export const footerNavItems = [
  { icon: Info, label: "About us" },
  { icon: Settings, label: "Settings" },
];

export const profileNavItem = { 
  icon: CircleUserRound, 
  label: "Profile", 
  iconSize: 40 
};
