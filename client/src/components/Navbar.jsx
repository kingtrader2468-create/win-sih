import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import SearchModal from './SearchModal.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';
import logoIcon from '../assets/logo-icon.svg';

const subNavigation = [
  { to: '/', label: 'Explore' },
  { to: '/map', label: 'Polar Map' },
  { to: '/research', label: 'Research' },
  { to: '/expeditions', label: 'Expeditions' },
  { to: '/datasets', label: 'Datasets' },
  { to: '/publications', label: 'Publications' },
  { to: '/media', label: 'Media' },
  { to: '/learning', label: 'Learning' },
  { to: '/mystery', label: 'Mystery' },
  { to: '/outreach', label: 'Outreach' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' }
];

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const sidebarCloseTimer = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsMoreDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click or navigation
  useEffect(() => {
    setIsMoreDropdownOpen(false);
    if (window.innerWidth < 1024) setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('polar-sidebar-toggle', {
      detail: { open: isDesktopSidebarOpen }
    }));
  }, [isDesktopSidebarOpen]);

  const toggleNavigation = () => {
    if (window.innerWidth >= 1024) {
      setIsDesktopSidebarOpen((open) => !open);
      return;
    }
    setIsMobileMenuOpen((open) => !open);
  };

  const openSidebarOnHover = () => {
    if (window.innerWidth < 1024) return;
    if (sidebarCloseTimer.current) window.clearTimeout(sidebarCloseTimer.current);
    setIsDesktopSidebarOpen(true);
  };

  const closeSidebarOnHoverLeave = () => {
    if (window.innerWidth < 1024) return;
    if (sidebarCloseTimer.current) window.clearTimeout(sidebarCloseTimer.current);
    sidebarCloseTimer.current = window.setTimeout(() => {
      setIsDesktopSidebarOpen(false);
    }, 750);
  };

  useEffect(() => () => {
    if (sidebarCloseTimer.current) window.clearTimeout(sidebarCloseTimer.current);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_2px_8px_rgba(11,31,51,0.04)] border-b border-surface-container-high/60">
        {/* 1. MAIN TOP NAVBAR */}
        <div className="h-16 w-full max-w-[1440px] mx-auto px-margin-sm lg:px-margin-lg flex items-center justify-between gap-space-md">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-space-md shrink-0">
            <Link
              to="/"
              className="flex items-center gap-space-sm group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <img
                alt="Logo"
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                src={logoIcon}
              />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none font-bold">
                  POLAR INDIA HUB
                </span>
                <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase mt-space-xs font-semibold">
                  RESEARCH &amp; EDUCATION
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Search Bar (visible on md screens and up) */}
          <div
            className="hidden md:flex items-center relative flex-1 max-w-md lg:max-w-xl mx-4 cursor-pointer"
            onClick={() => setIsSearchOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsSearchOpen(true)}
            aria-label="Open search dialog"
          >
            <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
              search
            </span>
            <input
              className="w-full pl-9 pr-12 py-1.5 bg-surface-container-low/80 hover:bg-surface-container-low text-on-surface placeholder:text-outline text-body-sm font-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer transition-colors shadow-2xs"
              placeholder="Search 1,400+ polar papers, datasets, expeditions..."
              type="text"
              readOnly
            />
            <span className="absolute right-2.5 font-data-tabular text-label-sm text-outline bg-surface-container-lowest px-1.5 py-0.5 rounded shadow-2xs border border-surface-container-high/60">
              ⌘K
            </span>
          </div>

          {/* Right Actions: Search Icon (Mobile), Notifications, Profile / Sign In, Mobile Menu Toggle */}
          <div className="flex items-center gap-space-sm sm:gap-space-md shrink-0">
            {/* Mobile Search Button */}
            <button
              type="button"
              className="md:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors flex items-center justify-center"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Polar Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Polar Dark Mode'}
            >
              {isDark
                ? <Sun size={19} className="text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
                : <Moon size={19} className="text-on-surface-variant transition-transform duration-300 hover:-rotate-12" />}
            </button>

            {/* Notifications Dropdown - Only Shown When Authenticated */}
            {isAuthenticated && <NotificationDropdown />}

            {/* Scholar Identity / Sign In */}
            {isAuthenticated ? (
              <div className="flex items-center gap-space-sm pl-space-xs sm:pl-space-sm border-l border-surface-container-high/80">
                <Link
                  to="/profile"
                  className="hidden lg:flex flex-col text-right hover:opacity-85 transition-opacity"
                >
                  <span className="font-title-md text-label-md text-on-surface leading-tight font-semibold">
                    {user?.name || 'Aarav Sharma'}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline leading-none">
                    {user?.role === 'admin'
                      ? 'Institutional Admin'
                      : 'Polar Research Scholar'}
                  </span>
                </Link>
                <Link
                  to="/profile"
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold shadow-xs overflow-hidden"
                  title="View Scholar Profile"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name || 'Scholar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-on-primary text-[18px]">
                      person
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 text-outline hover:text-error hover:bg-error-container/20 rounded-lg transition-colors ml-0.5"
                  title="Sign Out of Scholar Session"
                  aria-label="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-space-xs pl-space-xs sm:pl-space-sm border-l border-surface-container-high/80">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-surface-container-lowest font-label-md text-label-md font-semibold hover:bg-primary transition-all shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  <span>Sign In</span>
                </Link>
              </div>
            )}

            {/* Navigation Drawer Toggle */}
            <button
              className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors"
              type="button"
              onClick={toggleNavigation}
              onMouseEnter={openSidebarOnHover}
              onMouseLeave={closeSidebarOnHoverLeave}
              aria-label="Toggle navigation menu"
            >
              <Menu
                size={20}
                className={isMobileMenuOpen || isDesktopSidebarOpen ? 'hidden' : 'block'}
              />
              <X
                size={20}
                className={isMobileMenuOpen || isDesktopSidebarOpen ? 'block' : 'hidden'}
              />
            </button>
          </div>
        </div>

        {/* LEFT NAVIGATION DRAWER */}
        {isMobileMenuOpen && (
          <>
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 top-16 bg-slate-950/30 cursor-default lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed top-16 right-0 bottom-0 w-[min(86vw,340px)] bg-surface-container-lowest border-l border-surface-container-high px-margin-sm py-space-md shadow-2xl flex flex-col gap-space-xs overflow-y-auto animate-in slide-in-from-right duration-200 z-10 lg:hidden">
            <span className="text-outline font-label-sm text-[11px] uppercase tracking-wider px-3 mb-1">
              PORTAL NAVIGATION
            </span>
            {subNavigation.map((link) => {
              const isActive =
                link.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.to.split('#')[0]);

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg font-title-md text-body-md transition-all ${
                    isActive
                      ? 'bg-secondary-container text-on-secondary-container font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  {link.label}
                </NavLink>
              );
            })}

            <div className="my-space-xs border-t border-surface-container-high" />
            {/* Mobile Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-body-md"
            >
              {isDark
                ? <Sun size={18} className="text-amber-400" />
                : <Moon size={18} className="text-on-surface-variant" />}
              <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-body-md"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Search Repository (⌘K)</span>
            </button>
            {isAuthenticated ? (
              <div className="flex items-center justify-between px-3 py-2 mt-2 bg-surface-container-low rounded-lg">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-on-surface font-semibold text-body-sm"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                  <span>{user?.name || 'Scholar Profile'}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-error text-body-sm font-semibold flex items-center gap-1"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 text-center py-2 px-4 rounded-lg bg-primary-container text-surface-container-lowest font-label-md font-semibold hover:bg-primary shadow-2xs"
              >
                Sign In to Scholar Registry
              </Link>
            )}
          </aside>
          </>
        )}
      </header>

      <aside
        onMouseEnter={openSidebarOnHover}
        onMouseLeave={closeSidebarOnHoverLeave}
        className={`hidden lg:flex fixed top-0 right-0 bottom-0 w-64 z-[60] bg-surface-container-lowest border-l border-surface-container-high px-4 py-5 shadow-lg flex-col gap-2 overflow-y-auto transform transition-transform duration-[650ms] ease-in-out ${isDesktopSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <Link to="/" className="flex items-center gap-2 px-2 mb-5" onClick={() => setIsMobileMenuOpen(false)}>
          <img alt="Logo" className="h-9 w-auto" src={logoIcon} />
          <span className="font-headline-sm font-bold text-on-surface leading-tight">POLAR INDIA HUB</span>
        </Link>
        <span className="text-outline font-label-sm text-[11px] uppercase tracking-wider px-3 mb-1">Portal navigation</span>
        {subNavigation.map((link) => {
          const isActive = link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to);
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`px-3 py-2.5 rounded-lg font-title-md text-body-sm transition-all ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-2xs'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              {link.label}
            </NavLink>
          );
        })}
        <div className="mt-auto border-t border-surface-container-high pt-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-body-sm"
          >
            {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </div>
      </aside>

      {/* Ctrl+K Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

export default Navbar;
