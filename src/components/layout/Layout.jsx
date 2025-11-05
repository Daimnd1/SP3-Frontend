import { useState, useRef, useEffect } from 'react';
import Navbar from '../Navbar';
import MobileMenuButton from '../MobileMenuButton';
import { useClickOutside } from '../../hooks/useClickOutside';

export default function Layout({ children, currentPage, setCurrentPage }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Close menu when clicking outside
  useClickOutside(navRef, () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  });

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

  // Close menu and navigate
  const handleSetCurrentPage = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen w-screen p-4 bg-zinc-900">
      <aside>
        <Navbar 
          currentPage={currentPage} 
          setCurrentPage={handleSetCurrentPage}
          navRef={navRef}
          isOpen={isMobileMenuOpen}
        />
      </aside>
      <main className="w-full md:px-16 py-8 overflow-auto">
        {children}
      </main>
      <MobileMenuButton 
        isOpen={isMobileMenuOpen} 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />
    </div>
  );
}