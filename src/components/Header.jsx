import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import BrandLogo from './BrandLogo';

export const headerIcons = {
  menu: <><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></>,
  close: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
};

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="site-brand-wrap">
          <BrandLogo />
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <NavLink to="/" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/how-it-works" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`}>
            How It Works
          </NavLink>
          <NavLink to="/resources" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`}>
            Resources
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `site-nav-link ${isActive ? 'active' : ''}`}>
            About Us
          </NavLink>
        </nav>

        {/* Desktop Auth CTA */}
        <div className="site-header-actions">
          <Link to="/login" className="btn-header-login">
            Sign In
          </Link>
          <Link to="/register" className="btn-header-register">
            Get Started →
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="landing-hamburger-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-icon">
            {mobileOpen ? headerIcons.close : headerIcons.menu}
          </svg>
        </button>
      </div>

      {/* Mobile Slide-down Navigation Menu */}
      {mobileOpen && (
        <div className="landing-mobile-menu">
          <NavLink to="/" className="landing-mobile-link" onClick={() => setMobileOpen(false)}>
            🏠 Home
          </NavLink>
          <NavLink to="/how-it-works" className="landing-mobile-link" onClick={() => setMobileOpen(false)}>
            ⚡ How It Works
          </NavLink>
          <NavLink to="/resources" className="landing-mobile-link" onClick={() => setMobileOpen(false)}>
            📦 Resources Marketplace
          </NavLink>
          <NavLink to="/about" className="landing-mobile-link" onClick={() => setMobileOpen(false)}>
            🏨 About Hospora
          </NavLink>

          <div className="landing-mobile-cta-row">
            <Link to="/login" className="btn-mobile-login" onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
            <Link to="/register" className="btn-mobile-register" onClick={() => setMobileOpen(false)}>
              Create Account →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
