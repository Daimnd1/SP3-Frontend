import { House, ArrowUpDown, Settings2, ChartColumn, CircleUserRound, Settings, Info, CircleQuestionMark } from "lucide-react";

export default function Navbar({ currentPage, setCurrentPage }) {
  return (
    <nav className="sticky top-4 flex flex-col justify-between min-w-64 h-[calc(100vh-2rem)] min-h-fit px-4 py-5 rounded-2xl flex-none bg-zinc-950">
      <ul className="flex flex-col ">
        <h1>DeskApp</h1>
        <div className="border-t border-zinc-800 my-2" />
        <NavbarItem icon={House} label="Home" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavbarItem icon={ArrowUpDown} label="Desk" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavbarItem icon={ChartColumn} label="Reports" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavbarItem icon={Settings2} label="Configuration" currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </ul>
      <ul className="flex flex-col ">
        <NavbarItem icon={Info} label="About us" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavbarItem icon={CircleQuestionMark} label="Help" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavbarItem icon={Settings} label="Settings" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <div className="border-t border-zinc-800 my-2" />
        <NavbarItem icon={CircleUserRound} label="Profile" currentPage={currentPage} setCurrentPage={setCurrentPage} iconSize={40} />
      </ul>
    </nav>
  );
}

function NavbarItem({ icon, label, currentPage, setCurrentPage, iconSize = 24 }) {
  const Icon = icon;
  const isActive = currentPage === label;
  
  return (
    <li>
      <button 
        onClick={() => setCurrentPage(label)}
        className={`flex items-center gap-4 px-4 py-3 w-full text-left rounded-lg ${
          isActive 
            ? 'text-sky-200 bg-sky-950' 
            : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950 hover:bg-zinc-800'
        }`}
      >
        <Icon size={iconSize} />
        {label}
      </button>
    </li>
  )
}