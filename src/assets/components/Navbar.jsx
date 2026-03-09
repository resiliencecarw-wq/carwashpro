import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(0);
  const session = getAuthSession();
  const adminAuthenticated = session?.role === "admin";
  const customerAuthenticated = session?.role === "customer";

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(currentTheme);
  }, []);

  // Simulate notifications for demo (in real app, fetch from API)
  useEffect(() => {
    if (customerAuthenticated || adminAuthenticated) {
      setNotifications(Math.floor(Math.random() * 3));
    }
  }, [customerAuthenticated, adminAuthenticated]);

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

  const getUserInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

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
            
            {/* User Avatar Dropdown */}
            {customerAuthenticated && (
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md bg-brand-soft px-3 py-2 text-sm font-semibold text-brand-muted transition-colors hover:bg-brand-accent hover:text-brand-ink"
                >
                  <div className="relative">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-accent text-xs font-bold text-brand-ink">
                      {getUserInitials()}
                    </div>
                    {notifications > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                        {notifications}
                      </span>
                    )}
                  </div>
                  <span className="max-w-[100px] truncate">{session?.user?.name}</span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-brand-border bg-white py-1 opacity-0 invisible shadow-lg transition-all group-hover:opacity-100 group-hover:visible">
                  <NavLink
                    to="/customer/dashboard"
                    className="block px-4 py-2 text-sm text-brand-ink hover:bg-brand-soft"
                  >
                    My Bookings
                  </NavLink>
                  <NavLink
                    to="/customer/auth"
                    onClick={() => session && navigate("/customer/auth", { state: { mode: "profile" } })}
                    className="block px-4 py-2 text-sm text-brand-ink hover:bg-brand-soft"
                  >
                    My Profile
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {adminAuthenticated && (
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md bg-brand-soft px-3 py-2 text-sm font-semibold text-brand-muted transition-colors hover:bg-brand-accent hover:text-brand-ink"
                >
                  <div className="relative">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-ink text-xs font-bold text-white">
                      {getUserInitials()}
                    </div>
                    {notifications > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                        {notifications}
                      </span>
                    )}
                  </div>
                  <span className="max-w-[100px] truncate">{session?.user?.name}</span>
                </button>
                
                {/* Admin Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-brand-border bg-white py-1 opacity-0 invisible shadow-lg transition-all group-hover:opacity-100 group-hover:visible">
                  <NavLink
                    to="/admin"
                    className="block px-4 py-2 text-sm text-brand-ink hover:bg-brand-soft"
                  >
                    Dashboard
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {!customerAuthenticated && !adminAuthenticated && (
              <NavLink to="/customer/auth" className={navButtonClass}>
                Login
              </NavLink>
            )}
            
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md bg-brand-soft px-3 py-2 text-sm font-semibold text-brand-muted transition-colors hover:bg-brand-accent hover:text-brand-ink"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mt-4 space-y-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center justify-between rounded-md bg-brand-soft px-3 py-2 text-left text-sm font-semibold text-brand-muted transition-colors hover:bg-brand-accent hover:text-brand-ink"
            >
              <span>Switch to {theme === "light" ? "Dark" : "Light"} Mode</span>
              {theme === "light" ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            
            {/* User Info in Mobile Menu */}
            {(customerAuthenticated || adminAuthenticated) && (
              <div className="flex items-center gap-3 rounded-lg bg-brand-soft p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent font-bold text-brand-ink">
                  {getUserInitials()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-ink">{session?.user?.name}</p>
                  <p className="text-xs text-brand-muted">{session?.user?.email}</p>
                </div>
              </div>
            )}
            
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
                Login
              </NavLink>
            )}
            {(adminAuthenticated || customerAuthenticated) && (
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full rounded-md bg-rose-50 px-3 py-2 text-left text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100"
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
