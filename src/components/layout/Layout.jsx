import { useState } from 'react';
import Navbar from '../Navbar';
import MobileMenuButton from '../MobileMenuButton';
import { useClickOutside } from '../../hooks/useClickOutside';

export default function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navRef = useClickOutside(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div ref={navRef}>
        <Navbar 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileMenuButton 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}