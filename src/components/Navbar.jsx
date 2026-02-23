import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const session = getAuthSession();
  const adminAuthenticated = session?.role === "admin";
  const customerAuthenticated = session?.role === "customer";

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(currentTheme);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setMobileOpen(false);
    navigate("/");
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("carwash_theme", nextTheme);
  };

  const closeMenu = () => setMobileOpen(false);

  const navButtonClass = ({ isActive }, isMobile = false) =>
    [
      "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
      isMobile ? "block w-full" : "",
      isActive
        ? "bg-brand-accent text-brand-ink shadow-sm"
        : "bg-brand-soft text-brand-muted hover:bg-brand-accent hover:text-brand-ink",
    ].join(" ");

  return (
    <nav className="sticky top-0 z-40 border-b border-brand-border bg-white/90 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" onClick={closeMenu} className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-accent font-bold text-brand-ink">
              C
            </span>
            <span className="text-lg font-bold tracking-tight text-brand-ink">CarWashPro</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-brand-border bg-brand-soft text-brand-ink transition hover:bg-brand-accent md:hidden"
            aria-label="Toggle navigation menu"
          >
            <span className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-brand-ink" />
              <span className="block h-0.5 w-5 bg-brand-ink" />
              <span className="block h-0.5 w-5 bg-brand-ink" />
            </span>
          </button>

          <div className="hidden items-center gap-2 md:flex">
           
            <NavLink to="/" className={navButtonClass}>
              Home
            </NavLink>
            <NavLink to="/book" className={navButtonClass}>
              Book Service
            </NavLink>
            <NavLink to="/track" className={navButtonClass}>
              Track
            </NavLink>
            {customerAuthenticated && (
              <NavLink to="/customer/dashboard" className={navButtonClass}>
                My Bookings
              </NavLink>
            )}
            {!customerAuthenticated && !adminAuthenticated && (
              <NavLink to="/customer/auth" className={navButtonClass}>
                Customer Login
              </NavLink>
            )}
            {adminAuthenticated ? (
              <NavLink to="/admin" className={navButtonClass}>
                Admin Dashboard
              </NavLink>
            ) : (
              <NavLink to="/admin/login" className={navButtonClass}>
                Admin Login
              </NavLink>
            )}
            {(adminAuthenticated || customerAuthenticated) && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-brand-soft px-3 py-2 text-sm font-semibold text-brand-muted transition-colors hover:bg-brand-accent hover:text-brand-ink"
              >
                Logout
              </button>
              
            )}
             <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md bg-brand-soft px-3 py-2 text-sm font-semibold text-brand-muted transition-colors hover:bg-brand-accent hover:text-brand-ink"
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mt-4 space-y-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="block w-full rounded-md bg-brand-soft px-3 py-2 text-left text-sm font-semibold text-brand-muted transition-colors hover:bg-brand-accent hover:text-brand-ink"
            >
              Switch to {theme === "light" ? "Dark" : "Light"} Mode
            </button>
            <NavLink to="/" onClick={closeMenu} className={(state) => navButtonClass(state, true)}>
              Home
            </NavLink>
            <NavLink to="/book" onClick={closeMenu} className={(state) => navButtonClass(state, true)}>
              Book Service
            </NavLink>
            <NavLink to="/track" onClick={closeMenu} className={(state) => navButtonClass(state, true)}>
              Track
            </NavLink>
            {customerAuthenticated && (
              <NavLink to="/customer/dashboard" onClick={closeMenu} className={(state) => navButtonClass(state, true)}>
                My Bookings
              </NavLink>
            )}
            {!customerAuthenticated && !adminAuthenticated && (
              <NavLink to="/customer/auth" onClick={closeMenu} className={(state) => navButtonClass(state, true)}>
                Customer Login
              </NavLink>
            )}
            {adminAuthenticated ? (
              <NavLink to="/admin" onClick={closeMenu} className={(state) => navButtonClass(state, true)}>
                Admin Dashboard
              </NavLink>
            ) : (
              <NavLink to="/admin/login" onClick={closeMenu} className={(state) => navButtonClass(state, true)}>
                Admin Login
              </NavLink>
            )}
            {(adminAuthenticated || customerAuthenticated) && (
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full rounded-md bg-brand-soft px-3 py-2 text-left text-sm font-semibold text-brand-muted transition-colors hover:bg-brand-accent hover:text-brand-ink"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
