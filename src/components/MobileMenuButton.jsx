import { Menu, X } from 'lucide-react';

export default function MobileMenuButton({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  return (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle menu"
    >
      {isMobileMenuOpen ? (
        <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      ) : (
        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  );
}
