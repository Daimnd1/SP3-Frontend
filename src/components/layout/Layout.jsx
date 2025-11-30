import { useState, useRef, useEffect } from 'react';
import Navbar from '../Navbar';
import MobileMenuButton from '../MobileMenuButton';

export default function Layout({ children, currentPage, setCurrentPage }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Close menu and navigate
  const handleSetCurrentPage = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen w-screen p-4 bg-gray-100 dark:bg-gray-900">
      <aside>
        <Navbar 
          currentPage={currentPage} 
          setCurrentPage={handleSetCurrentPage}
          navRef={navRef}
          isOpen={isMobileMenuOpen}
        />
      </aside>
      <main className="w-full md:px-4 lg:px-16 py-8 overflow-auto">
        {children}
      </main>
      <MobileMenuButton 
        isOpen={isMobileMenuOpen} 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />
    </div>
  );
}