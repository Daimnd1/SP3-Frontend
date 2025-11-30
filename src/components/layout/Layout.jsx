import { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import MobileMenuButton from '../MobileMenuButton';
import { useClickOutside } from '../../hooks/useClickOutside';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  // Close menu when clicking outside
  useClickOutside(navRef, () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  });

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close menu when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  return (
    <div className="flex min-h-screen w-screen p-4 bg-gray-100 dark:bg-zinc-900">
      <aside>
        <Navbar 
          navRef={navRef}
          isOpen={isMobileMenuOpen}
        />
      </aside>
      <main className="w-full md:px-4 lg:px-16 py-8 overflow-auto">
        <Outlet />
      </main>
      <MobileMenuButton 
        isOpen={isMobileMenuOpen} 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />
    </div>
  );
}