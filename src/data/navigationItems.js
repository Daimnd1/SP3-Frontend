import { Home, Monitor, BarChart3, Settings, Info, CircleUserRound } from 'lucide-react';

export const mainNavItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/desk', label: 'My Desk', icon: Monitor },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

export const footerNavItems = [
  { path: '/configuration', label: 'Configuration', icon: Settings },
  { path: '/about', label: 'About Us', icon: Info },
];

export const profileNavItem = {
  path: '/profile',
  label: 'Profile',
  icon: CircleUserRound
};
