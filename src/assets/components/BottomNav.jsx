import { NavLink, useLocation } from "react-router-dom";
import { getAuthSession } from "../../utils/auth";

function HomeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

export default function BottomNav() {
  const location = useLocation();
  const session = getAuthSession();
  const isCustomer = session?.role === "customer";
  const isAdmin = session?.role === "admin";

  const customerLinks = [
    { to: "/", icon: "home", label: "Home" },
    { to: "/book", icon: "plus", label: "Book" },
    { to: "/track", icon: "search", label: "Track" },
    { to: "/customer/dashboard", icon: "list", label: "Bookings" },
  ];

  const adminLinks = [
    { to: "/", icon: "home", label: "Home" },
    { to: "/admin", icon: "list", label: "Dashboard" },
    { to: "/track", icon: "search", label: "Track" },
  ];

  const defaultLinks = [
    { to: "/", icon: "home", label: "Home" },
    { to: "/book", icon: "plus", label: "Book" },
    { to: "/track", icon: "search", label: "Track" },
  ];

  const links = isAdmin ? adminLinks : isCustomer ? customerLinks : defaultLinks;

  const renderIcon = (iconName) => {
    switch (iconName) {
      case "home": return <HomeIcon />;
      case "plus": return <PlusIcon />;
      case "search": return <SearchIcon />;
      case "list": return <ListIcon />;
      default: return null;
    }
  };

  // Don't show on auth pages
  if (location.pathname.includes("/auth") || location.pathname.includes("/admin/login")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-border md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = location.pathname === link.to || 
            (link.to !== "/" && location.pathname.startsWith(link.to));
          
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                isActive ? "text-brand-accent" : "text-brand-muted hover:text-brand-ink"
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                {renderIcon(link.icon)}
              </div>
              <span className="text-[10px] mt-1 font-medium">{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

