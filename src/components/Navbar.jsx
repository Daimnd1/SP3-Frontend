import { NavLink } from 'react-router-dom';
import { mainNavItems, footerNavItems, profileNavItem, managerNavItem } from "../data/navigationItems";
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ navRef, isOpen }) {
  const { isManager } = useAuth();
  return (
    <nav 
      ref={navRef}
      className={`
        fixed top-0 left-0 md:sticky md:top-4 md:flex 
        flex-col justify-between 
        w-full md:min-w-fit lg:min-w-64 
        h-screen md:h-[calc(100vh-2rem)] min-h-fit 
        px-2 py-5 md:rounded-2xl flex-none bg-white dark:bg-gray-800
        shadow-lg dark:shadow-none
        z-50
        ${isOpen ? 'flex' : 'hidden md:flex'}
      `}
    >
      <NavSection title="DeskApp">
        {mainNavItems.map((item) => (
          <NavbarItem 
            key={item.path}
            icon={item.icon} 
            label={item.label}
            path={item.path}
          />
        ))}
        {isManager && (
          <NavbarItem 
            icon={managerNavItem.icon} 
            label={managerNavItem.label}
            path={managerNavItem.path}
          />
        )}
      </NavSection>

      <NavSection>
        <div className="border-t border-gray-300 dark:border-gray-600 my-2" />
        {footerNavItems.map((item) => (
          <NavbarItem 
            key={item.path}
            icon={item.icon} 
            label={item.label}
            path={item.path}
          />
        ))}
        <div className="border-t border-gray-300 dark:border-gray-600 my-2" />
        <NavbarItem 
          icon={profileNavItem.icon} 
          label={profileNavItem.label}
          path={profileNavItem.path}
          iconSize={profileNavItem.iconSize}
        />
      </NavSection>
    </nav>
  );
}

function NavSection({ title, children }) {
  return (
    <ul className="flex flex-col">
      {title && (
        <>
          <h1 className="block md:hidden lg:block text-gray-900 dark:text-gray-200">{title}</h1>
          <h1 className="hidden md:block lg:hidden text-center font-bold text-gray-900 dark:text-gray-200">{title[0]}</h1>
          <div className="border-t border-gray-300 dark:border-gray-600 my-5" />
        </>
      )}
      {children}
    </ul>
  );
}

function NavbarItem({ icon, label, path, iconSize = 24 }) {
  const Icon = icon;
  
  return (
    <li>
      <NavLink
        to={path}
        className={({ isActive }) => `flex items-center justify-start md:justify-center lg:justify-start py-3 w-full text-left rounded-lg ${
          isActive 
            ? 'text-blue-700 bg-blue-100 dark:text-gray-200 dark:bg-blue-900' 
            : 'text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
        }`}
      >
        <Icon className="mx-2 lg:mx-4" size={iconSize} />
        <span className="inline md:hidden lg:inline">{label}</span>
      </NavLink>
    </li>
  );
}