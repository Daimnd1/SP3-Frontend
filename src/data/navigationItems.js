import { 
  House, 
  ArrowUpDown, 
  Settings2, 
  ChartColumn, 
  CircleUserRound, 
  Info
} from "lucide-react";

export const mainNavItems = [
  { icon: House, label: "Home", path: "/" },
  { icon: ArrowUpDown, label: "Desk", path: "/desk" },
  { icon: ChartColumn, label: "Reports", path: "/reports" },
];

export const footerNavItems = [
  { icon: Settings2, label: "Configuration", path: "/configuration" },
  { icon: Info, label: "About us", path: "/about" },
];

export const profileNavItem = { 
  icon: CircleUserRound, 
  label: "Profile",
  path: "/profile",
  iconSize: 40 
};
