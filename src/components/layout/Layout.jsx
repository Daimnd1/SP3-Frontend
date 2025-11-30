import { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import MobileMenuButton from '../MobileMenuButton';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-screen p-4 bg-gray-100 dark:bg-gray-900">
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