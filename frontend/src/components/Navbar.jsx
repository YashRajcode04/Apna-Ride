import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ scrollProgress = 0 }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navRef = useRef(null);

  // Track scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setShowUserDropdown(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setShowUserDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Determine if we should use light text (on dark background)
  const isDark = scrollProgress > 0.5;
  const navbarClass = `navbar ${isDark ? 'navbar-dark' : ''} ${isScrolled ? 'scrolled' : ''}`;

  return (
    <nav className={navbarClass} ref={navRef}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">APNA RIDE</span>
        </Link>

        <button
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="mobile-close-item">
            <button
              type="button"
              className="mobile-close-btn"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              Close
            </button>
          </li>
          <li>
            <Link 
              to="/" 
              className={isActive('/') ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/cars" 
              className={isActive('/cars') ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              Eco Cars
            </Link>
          </li>
          <li>
            <Link 
              to="/luxury-cars" 
              className={isActive('/luxury-cars') ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              Luxury Cars
            </Link>
          </li>
          {user && user.role === 'admin' && (
            <li>
              <Link 
                to="/dashboard" 
                className={isActive('/dashboard') ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            </li>
          )}
          {user && (
            <li>
              <Link 
                to="/my-bookings" 
                className={isActive('/my-bookings') ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                My Bookings
              </Link>
            </li>
          )}
          <li>
            <Link
              to="/list-car"
              className="list-car-btn"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="btn-icon">+</span>
              List Your Car
            </Link>
          </li>
          {user ? (
            <li className="user-menu">
              <div className="user-dropdown">
                <button 
                  className="user-button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <img 
                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=111827&color=d4af37&bold=true&rounded=true`} 
                    alt={user.name} 
                    className="user-avatar-img" 
                  />
                  <span className="user-name">{user.name}</span>
                  <span className="dropdown-arrow">{showUserDropdown ? '▲' : '▼'}</span>
                </button>
                {showUserDropdown && (
                  <div className="dropdown-content">
                    {user.role === 'admin' && (
                      <>
                        <Link to="/dashboard" onClick={() => { setShowUserDropdown(false); setIsMenuOpen(false); }}>
                          Dashboard
                        </Link>
                        <div className="dropdown-divider"></div>
                      </>
                    )}
                    <Link to="/my-bookings" onClick={() => { setShowUserDropdown(false); setIsMenuOpen(false); }}>
                      My Bookings
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </li>
          ) : (
            <li>
              <Link
                to="/login"
                className="login-btn"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
