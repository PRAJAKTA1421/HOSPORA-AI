import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { api } from '../api';

export const svgIcons = {
  home: <><path d="m3 10 9-7 9 7v10H3z"/><path d="M9 21v-6h6v6"/></>,
  search: <><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/></>,
  cube: <><path d="m3 7 9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10"/></>,
  requests: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6"/></>,
  incoming: <><path d="M12 3v11M8 10l4 4 4-4M4 17v3h16v-3"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
  chat: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
  matches: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"/></>,
  chart: <><path d="M18 20V10M12 20V4M6 20v-6M2 20h20"/></>,
  bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  logout: <><path d="m10 17 5-5-5-5M15 12H3M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/></>,
  profile: <><rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 18c1-3 7-3 8 0"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  check: <><polyline points="20 6 9 17 4 12"/></>,
  sparkles: <><path d="m12 3 1.9 4.1 4.5.6-3.3 3.2.8 4.5-3.9-2.1-3.9 2.1.8-4.5-3.3-3.2 4.5-.6z"/></>,
  menu: <><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></>,
  close: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
};

export function Icon({ name, className = "dash-icon" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {svgIcons[name] || svgIcons.home}
    </svg>
  );
}

export const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'home' },
  { path: '/find-resources', label: 'Find Resources', icon: 'search' },
  { path: '/my-resources', label: 'My Resources', icon: 'cube' },
  { path: '/my-requests', label: 'My Requests', icon: 'requests' },
  { path: '/incoming-requests', label: 'Incoming Requests', icon: 'incoming', badgeKey: 'incomingRequests' },
  { path: '/bookings', label: 'Bookings', icon: 'calendar', badgeKey: 'bookings' },
  { path: '/negotiations', label: 'Negotiations', icon: 'chat', badgeKey: 'negotiations' },
  { path: '/ai-matches', label: 'AI Matches', icon: 'matches', isUSP: true },
  { path: '/analytics', label: 'Analytics', icon: 'chart' },
  { path: '/notifications', label: 'Notifications', icon: 'bell', badgeKey: 'notifications' },
  { path: '/settings', label: 'Settings', icon: 'settings' }
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ incomingRequests: 0, bookings: 0, negotiations: 0, notifications: 0 });
  const [profile, setProfile] = useState({ businessName: 'HOTEL PARAS', isVerified: true });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.getMe().then(res => {
      if (res?.user) {
        setProfile({
          businessName: res.user.businessName || 'HOTEL PARAS',
          isVerified: res.user.isVerified ?? true
        });
      }
      if (res?.stats) {
        setStats(res.stats);
      }
    });
    setMobileMenuOpen(false); // Close drawer on route change
  }, [location.pathname]);

  const handleLogout = async () => {
    await api.logout();
    navigate('/login');
  };

  return (
    <>
      {/* MOBILE TOP NAVBAR (Visible only on screens <= 860px) */}
      <header className="mobile-top-header">
        <button
          type="button"
          className="mobile-hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Mobile Menu"
        >
          <Icon name={mobileMenuOpen ? 'close' : 'menu'} />
        </button>

        <div className="mobile-top-brand">
          <BrandLogo />
        </div>

        <div className="mobile-top-actions">
          <Link to="/notifications" className="mobile-notif-btn">
            <Icon name="bell" />
            {stats.notifications > 0 && <span className="mobile-badge-dot"></span>}
          </Link>
          <div className="mobile-avatar-chip">
            {(profile.businessName || 'H').charAt(0)}
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* SIDEBAR ASIDE (Desktop + Mobile Drawer) */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand-wrapper">
          <BrandLogo />
          <button
            type="button"
            className="mobile-close-drawer-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="dash-nav" aria-label="Main Navigation">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            const badgeVal = item.badgeKey ? stats[item.badgeKey] : null;

            return (
              <Link
                to={item.path}
                key={item.path}
                className={`dash-nav-link ${isActive ? 'active' : ''} ${item.isUSP ? 'usp-nav-item' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {item.isUSP && <span className="usp-pill">AI ⭐</span>}
                {badgeVal !== null && badgeVal > 0 && <b className="nav-badge">{badgeVal}</b>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-badge-info">
            <Icon name="shield" className="shield-icon" />
            <div>
              <strong>{profile.businessName}</strong>
              <small className="verified-tag">✓ Verified Partner</small>
            </div>
          </div>
          <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
            <Icon name="logout" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM QUICK BAR (Visible on mobile for 1-touch navigation) */}
      <nav className="mobile-bottom-nav">
        <Link to="/dashboard" className={`mobile-bottom-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          <Icon name="home" />
          <span>Home</span>
        </Link>
        <Link to="/find-resources" className={`mobile-bottom-link ${location.pathname === '/find-resources' ? 'active' : ''}`}>
          <Icon name="search" />
          <span>Find</span>
        </Link>
        <Link to="/my-resources" className={`mobile-bottom-link ${location.pathname === '/my-resources' ? 'active' : ''}`}>
          <Icon name="cube" />
          <span>Inventory</span>
        </Link>
        <Link to="/incoming-requests" className={`mobile-bottom-link ${location.pathname === '/incoming-requests' ? 'active' : ''}`}>
          <div className="icon-with-badge">
            <Icon name="incoming" />
            {stats.incomingRequests > 0 && <span className="nav-badge-sm">{stats.incomingRequests}</span>}
          </div>
          <span>Inbox</span>
        </Link>
        <button
          type="button"
          className="mobile-bottom-link btn-menu-bottom"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Icon name="menu" />
          <span>Menu</span>
        </button>
      </nav>
    </>
  );
}
