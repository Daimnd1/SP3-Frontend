import { useState, useEffect, useRef } from "react";
import { House, ArrowUpDown, Settings2, ChartColumn, CircleUserRound, Settings, Info, CircleQuestionMark, Menu, X } from "lucide-react";

export default function Navbar({ currentPage, setCurrentPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target) && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  return (
    <>
      <nav 
        ref={navRef}
        className={`
          fixed right-4 top-4 md:sticky md:flex 
          flex-col justify-between 
          min-w-64 md:min-w-fit lg:min-w-64 
          h-[calc(100vh-2rem)] min-h-fit 
          px-2 py-5 rounded-2xl flex-none bg-zinc-950
          ${isOpen 
            ? 'flex' 
            : 'hidden md:flex'
          }
        `}
      >
        <ul className="flex flex-col ">
          <h1 className="block md:hidden lg:block">DeskApp</h1>
          <h1 className="hidden md:block lg:hidden text-center font-bold">D</h1>
          <div className="border-t border-zinc-800 my-2" />
          <NavbarItem icon={House} label="Home" currentPage={currentPage} setCurrentPage={setCurrentPage} onNavigate={() => setIsOpen(false)} />
          <NavbarItem icon={ArrowUpDown} label="Desk" currentPage={currentPage} setCurrentPage={setCurrentPage} onNavigate={() => setIsOpen(false)} />
          <NavbarItem icon={ChartColumn} label="Reports" currentPage={currentPage} setCurrentPage={setCurrentPage} onNavigate={() => setIsOpen(false)} />
          <NavbarItem icon={Settings2} label="Configuration" currentPage={currentPage} setCurrentPage={setCurrentPage} onNavigate={() => setIsOpen(false)} />
        </ul>
        <ul className="flex flex-col ">
          <NavbarItem icon={Info} label="About us" currentPage={currentPage} setCurrentPage={setCurrentPage} onNavigate={() => setIsOpen(false)} />
          <NavbarItem icon={CircleQuestionMark} label="Help" currentPage={currentPage} setCurrentPage={setCurrentPage} onNavigate={() => setIsOpen(false)} />
          <NavbarItem icon={Settings} label="Settings" currentPage={currentPage} setCurrentPage={setCurrentPage} onNavigate={() => setIsOpen(false)} />
          <div className="border-t border-zinc-800 my-2" />
          <NavbarItem icon={CircleUserRound} label="Profile" currentPage={currentPage} setCurrentPage={setCurrentPage} iconSize={40} onNavigate={() => setIsOpen(false)} />
        </ul>
      </nav>
      <ButtonOpenNavbar isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
    </>
  );
}

function NavbarItem({ icon, label, currentPage, setCurrentPage, iconSize = 24, onNavigate }) {
  const Icon = icon;
  const isActive = currentPage === label;
  
  const handleClick = () => {
    setCurrentPage(label);
    if (onNavigate) onNavigate();
  };
  
  return (
    <li>
      <button 
        onClick={handleClick}
        className={`flex items-center justify-start md:justify-center lg:justify-start py-3 w-full text-left rounded-lg ${
          isActive 
            ? 'text-sky-200 bg-sky-950' 
            : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950 hover:bg-zinc-800'
        }`}
      >
        <Icon className="mx-2 lg:mx-4" size={iconSize} />
        <span className="inline md:hidden lg:inline">{label}</span>
      </button>
    </li>
  )
}

function ButtonOpenNavbar({ isOpen, onClick }) {
  return (
    <button className="fixed top-6 right-6 md:hidden" onClick={onClick}>
      {isOpen ? (
        <X className="w-8 h-8 text-zinc-400" />
      ) : (
        <Menu className="w-8 h-8 text-zinc-400" />
      )}
    </button>
  )
}