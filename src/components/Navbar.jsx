import { Link, useLocation } from 'react-router-dom';
import { mainNavItems, footerNavItems, profileNavItem } from '../data/navigationItems';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className={`
        fixed right-4 top-4 md:sticky md:flex 
        flex-col justify-between 
        min-w-64 md:min-w-fit lg:min-w-64 
        h-[calc(100vh-2rem)] min-h-fit 
        px-2 py-5 rounded-2xl flex-none 
        bg-white dark:bg-gray-800 
        shadow-lg dark:shadow-gray-950/50
        border border-gray-200 dark:border-gray-700
        z-50
        ${isMobileMenuOpen ? 'flex' : 'hidden md:flex'}
      `}
    >
      {/* Main Navigation */}
      <div className="flex-1 px-3 space-y-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-4 space-y-1">
        {footerNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Profile Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <Link
          to={profileNavItem.path}
          onClick={() => setIsMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isActive(profileNavItem.path)
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <profileNavItem.icon className="w-8 h-8 rounded-full flex-shrink-0 text-gray-600 dark:text-gray-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </Link>
      </div>
    </nav>
  );
}