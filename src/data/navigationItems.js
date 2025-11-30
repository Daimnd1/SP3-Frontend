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
  { icon: House, label: "Home", path: "/" },
  { icon: ArrowUpDown, label: "Desk", path: "/desk" },
  { icon: ChartColumn, label: "Reports", path: "/reports" },
  { icon: Settings2, label: "Configuration", path: "/configuration" },
];

export const footerNavItems = [
  { icon: Info, label: "About us", path: "/about" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const profileNavItem = { 
  icon: CircleUserRound, 
  label: "Profile",
  path: "/profile",
  iconSize: 40 
};
