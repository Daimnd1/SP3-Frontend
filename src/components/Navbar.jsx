import { House, ArrowUpDown, Settings2, ChartColumn, CircleUserRound, Settings, Info, CircleQuestionMark } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="flex flex-col justify-between min-w-64 min-h-full px-4 py-5 rounded-2xl flex-none bg-zinc-950">
      <ul className="flex flex-col ">
        <NavbarItem icon={House} label="Home" />
        <NavbarItem icon={ArrowUpDown} label="Desk" />
        <NavbarItem icon={ChartColumn} label="Statistics" />
        <NavbarItem icon={Settings2} label="Configuration" />
      </ul>
      <ul className="flex flex-col ">
        <NavbarItem icon={Info} label="About us" />
        <NavbarItem icon={CircleQuestionMark} label="Help" />
        <NavbarItem icon={Settings} label="Settings" />
        <div className="border-t border-zinc-800 my-2" />
        <a href="#" className="flex gap-4 px-2 py-1 items-center text-zinc-400 hover:text-zinc-200">
          <CircleUserRound size={40}/>
          Profile
        </a>
      </ul>
    </nav>
  );
}

function NavbarItem({ icon, label }) {
  const Icon = icon;
  return (
    <li>
      <a href="#" className="flex gap-4 px-4 py-3 text-zinc-400 hover:text-zinc-200 bg-zinc-950 hover:bg-zinc-800  rounded-lg">
        <Icon />
        {label}
      </a>
    </li>
  )
}