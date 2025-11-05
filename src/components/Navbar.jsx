import { mainNavItems, footerNavItems, profileNavItem } from "../data/navigationItems";

export default function Navbar({ currentPage, setCurrentPage, navRef, isOpen }) {
  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <nav 
      ref={navRef}
      className={`
        fixed right-4 top-4 md:sticky md:flex 
        flex-col justify-between 
        min-w-64 md:min-w-fit lg:min-w-64 
        h-[calc(100vh-2rem)] min-h-fit 
        px-2 py-5 rounded-2xl flex-none bg-zinc-950
        ${isOpen ? 'flex' : 'hidden md:flex'}
      `}
    >
      <NavSection title="DeskApp">
        {mainNavItems.map((item) => (
          <NavbarItem 
            key={item.label}
            icon={item.icon} 
            label={item.label} 
            currentPage={currentPage} 
            onNavigate={handleNavigate}
          />
        ))}
      </NavSection>

      <NavSection>
        {footerNavItems.map((item) => (
          <NavbarItem 
            key={item.label}
            icon={item.icon} 
            label={item.label} 
            currentPage={currentPage} 
            onNavigate={handleNavigate}
          />
        ))}
        <div className="border-t border-zinc-800 my-2" />
        <NavbarItem 
          icon={profileNavItem.icon} 
          label={profileNavItem.label} 
          currentPage={currentPage} 
          onNavigate={handleNavigate}
          iconSize={profileNavItem.iconSize}
        />
      </NavSection>
    </nav>
  );
}

function NavSection({ title, children }) {
  return (
    <ul className="flex flex-col">
      {title && (
        <>
          <h1 className="block md:hidden lg:block">{title}</h1>
          <h1 className="hidden md:block lg:hidden text-center font-bold">{title[0]}</h1>
          <div className="border-t border-zinc-800 my-2" />
        </>
      )}
      {children}
    </ul>
  );
}

function NavbarItem({ icon, label, currentPage, onNavigate, iconSize = 24 }) {
  const Icon = icon;
  const isActive = currentPage === label;
  
  return (
    <li>
      <button 
        onClick={() => onNavigate(label)}
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
  );
}