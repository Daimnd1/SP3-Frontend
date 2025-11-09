import { Menu, X } from "lucide-react";

export default function MobileMenuButton({ isOpen, onClick }) {
  return (
    <button 
      className="fixed top-6 right-6 md:hidden z-50" 
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? (
        <X className="w-8 h-8 text-gray-700 dark:text-zinc-400" />
      ) : (
        <Menu className="w-8 h-8 text-gray-700 dark:text-zinc-400" />
      )}
    </button>
  );
}
