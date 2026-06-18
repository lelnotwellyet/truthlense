import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiShieldCheck,
  HiBars3,
  HiXMark,
  HiUser,
  HiBookmark,
  HiCog6Tooth,
  HiArrowRightOnRectangle,
  HiSun,
  HiMoon,
  HiBell,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'text-white bg-white/10'
      : 'text-gray-300 hover:text-white hover:bg-white/5'
  }`;

export default function Navbar() {
  const { user, profile, preferences, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initial = profile?.full_name?.[0] || user?.email?.[0] || '?';
  const hasCompletedOnboarding = preferences?.topics && preferences.topics.length >= 3;

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const mobileNavClick = (path) => {
    setMenuOpen(false);
    if (path !== '#') {
      navigate(path);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-navy-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to={user && hasCompletedOnboarding ? '/dashboard' : '/'}
            className="flex items-center gap-2"
          >
            <HiShieldCheck className="h-8 w-8 text-emerald-400" />
            <span className="text-xl font-bold text-white tracking-tight">truthlens</span>
          </Link>

          {/* Desktop Nav */}
          {user && hasCompletedOnboarding && (
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/dashboard" end className={navLinkClass}>
                Feed
              </NavLink>
              <NavLink to="/verify" className={navLinkClass}>
                Verify
              </NavLink>
              <NavLink to="/community" className={navLinkClass}>
                Community
              </NavLink>
              <NavLink to="/trending" className={navLinkClass}>
                Misinformation
              </NavLink>
              <NavLink to="/bookmarks" className={navLinkClass}>
                Bookmarks
              </NavLink>
              <NavLink to="/search" className={navLinkClass}>
                Search
              </NavLink>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2 rounded-xl"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* Theme & Notification Icons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-2 rounded-xl text-navy-200 hover:text-white hover:bg-white/5 transition-all duration-200"
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? <HiSun className="h-5 w-5" /> : <HiMoon className="h-5 w-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/notifications')}
                    className="relative p-2 rounded-xl text-navy-200 hover:text-white hover:bg-white/5 transition-all duration-200"
                    aria-label="Notifications"
                  >
                    <HiBell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-navy-900" />
                  </button>
                </div>

                {/* Profile Dropdown */}
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-sm font-bold text-white hover:shadow-lg hover:shadow-accent/20 transition-all duration-300"
                  >
                    {initial.toUpperCase()}
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 glass-sm p-2 shadow-2xl"
                      >
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <HiUser className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          to="/bookmarks"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <HiBookmark className="h-4 w-4" />
                          Bookmarks
                        </Link>
                        {profile?.role?.toLowerCase() === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <HiCog6Tooth className="h-4 w-4" />
                            Admin
                          </Link>
                        )}
                        <div className="border-t border-white/10 my-1" />
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-white/5 transition-all"
                        >
                          <HiArrowRightOnRectangle className="h-4 w-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <HiBars3 className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-navy-800 border-l border-white/10 p-6 md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-lg font-bold gradient-text">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <HiXMark className="h-6 w-6" />
                </button>
              </div>

              {user && hasCompletedOnboarding && (
                <div className="flex flex-col gap-1 mb-6">
                  <button
                    onClick={() => mobileNavClick('/dashboard')}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Feed
                  </button>
                  <button
                    onClick={() => mobileNavClick('/verify')}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => mobileNavClick('/community')}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Community
                  </button>
                  <button
                    onClick={() => mobileNavClick('/trending')}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Misinformation
                  </button>
                  <button
                    onClick={() => mobileNavClick('/bookmarks')}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Bookmarks
                  </button>
                  <button
                    onClick={() => mobileNavClick('/search')}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Search
                  </button>
                  <button
                    onClick={() => mobileNavClick('/profile')}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Profile
                  </button>
                  {profile?.role?.toLowerCase() === 'admin' && (
                    <button
                      onClick={() => mobileNavClick('/admin')}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                    >
                      Admin
                    </button>
                  )}
                </div>
              )}

              <div className="mt-auto pt-6 border-t border-white/10">
                {user ? (
                  <div>
                    <div className="flex items-center gap-3 mb-4 px-3">
                      <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-sm font-bold text-white">
                        {initial.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-white/5 transition-all"
                    >
                      <HiArrowRightOnRectangle className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => mobileNavClick('/login')}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-center"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => mobileNavClick('/register')}
                      className="w-full btn-primary text-sm px-4 py-2.5 rounded-xl text-center"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
