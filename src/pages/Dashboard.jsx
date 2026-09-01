import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar, { Icon } from '../components/Sidebar';
import { api } from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ businessName: 'My Hotel', ownerName: 'Owner', city: 'Pune' });
  const [stats, setStats] = useState({ resources: 0, activeRequests: 0, incomingRequests: 0, bookings: 0, negotiations: 0, notifications: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [aiMatches, setAiMatches] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newResource, setNewResource] = useState({ name: '', category: 'Furniture', quantity: '', unit: 'Chairs', price: '', availableFrom: '', availableTo: '', location: 'Pune' });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadDashboardData = async () => {
    const [me, bks, matches] = await Promise.all([
      api.getMe(),
      api.getBookings(),
      api.getAIMatches({ resource: 'Chairs', quantity: 100, location: 'Pune', budget: 10000 })
    ]);

    if (me?.user) {
      setProfile(me.user);
      setNewResource(prev => ({ ...prev, location: me.user.city || 'Pune' }));
    }
    if (me?.stats) {
      setStats(me.stats);
    }
    if (Array.isArray(bks)) {
      setRecentBookings(bks.slice(0, 3));
    }
    if (Array.isArray(matches)) {
      setAiMatches(matches.slice(0, 3));
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    const item = {
      id: `res-${Date.now()}`,
      name: newResource.name.trim(),
      category: newResource.category,
      quantity: Number(newResource.quantity),
      unit: newResource.unit,
      price: Number(newResource.price),
      priceUnit: 'day',
      availableFrom: newResource.availableFrom || new Date().toISOString().slice(0, 10),
      availableTo: newResource.availableTo || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      location: newResource.location || profile.city || 'Pune',
      status: 'Available'
    };

    await api.createResource(item);
    setSavedSuccess(true);
    setStats(prev => ({ ...prev, resources: prev.resources + 1 }));

    setTimeout(() => {
      setShowAddModal(false);
      setSavedSuccess(false);
      setNewResource({ name: '', category: 'Furniture', quantity: '', unit: 'Chairs', price: '', availableFrom: '', availableTo: '', location: profile.city || 'Pune' });
      loadDashboardData();
    }, 1200);
  };

  const initial = (profile.businessName || 'H').charAt(0).toUpperCase();

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dash-header">
          <div className="dash-greeting">
            <h1>Good Morning, {profile.businessName}! 👋</h1>
            <p>Manage your hospitality resources and discover what your business needs in real-time.</p>
          </div>
          <div className="dash-user-chip">
            <div className="user-avatar">{initial}</div>
            <div className="user-meta">
              <strong>{profile.businessName}</strong>
              <small>{profile.city || 'Pune'} · Verified Member</small>
            </div>
          </div>
        </header>

        {/* Prominent Quick Action Row */}
        <section className="dash-quick-banner">
          <div className="banner-text">
            <h2>Hospitality Resource Exchange Hub</h2>
            <p>List unused hotel inventory to generate revenue or find resources for upcoming banquets and events.</p>
          </div>
          <div className="banner-actions">
            <button
              type="button"
              className="btn-primary-action"
              onClick={() => setShowAddModal(true)}
            >
              <Icon name="cube" />
              <span>+ List a Resource</span>
            </button>
            <button
              type="button"
              className="btn-secondary-action"
              onClick={() => navigate('/find-resources')}
            >
              <Icon name="search" />
              <span>🔍 Find a Resource</span>
            </button>
          </div>
        </section>

        {/* 4 Key Overview Cards */}
        <section className="overview-cards-grid">
          <div className="overview-card green-card" onClick={() => navigate('/my-resources')}>
            <div className="card-top">
              <span className="card-icon-bubble"><Icon name="cube" /></span>
              <span className="card-badge">Provider</span>
            </div>
            <div className="card-body">
              <span className="card-title">📦 My Resources</span>
              <strong className="card-metric">{stats.resources}</strong>
              <small className="card-sub">Active Listings in {profile.city || 'Pune'}</small>
            </div>
            <div className="card-footer-link">Manage inventory →</div>
          </div>

          <div className="overview-card blue-card" onClick={() => navigate('/my-requests')}>
            <div className="card-top">
              <span className="card-icon-bubble"><Icon name="requests" /></span>
              <span className="card-badge">Seeker</span>
            </div>
            <div className="card-body">
              <span className="card-title">🔍 Active Needs</span>
              <strong className="card-metric">{stats.activeRequests}</strong>
              <small className="card-sub">Resources Requested</small>
            </div>
            <div className="card-footer-link">View my requests →</div>
          </div>

          <div className="overview-card purple-card" onClick={() => navigate('/incoming-requests')}>
            <div className="card-top">
              <span className="card-icon-bubble"><Icon name="incoming" /></span>
              {stats.incomingRequests > 0 && <span className="card-alert-badge">{stats.incomingRequests} New</span>}
            </div>
            <div className="card-body">
              <span className="card-title">📥 Incoming Requests</span>
              <strong className="card-metric">{stats.incomingRequests}</strong>
              <small className="card-sub">Requests from other hotels</small>
            </div>
            <div className="card-footer-link">Review & Accept →</div>
          </div>

          <div className="overview-card amber-card" onClick={() => navigate('/bookings')}>
            <div className="card-top">
              <span className="card-icon-bubble"><Icon name="calendar" /></span>
              <span className="card-badge">Confirmed</span>
            </div>
            <div className="card-body">
              <span className="card-title">📅 Active Bookings</span>
              <strong className="card-metric">{stats.bookings}</strong>
              <small className="card-sub">Upcoming scheduled exchanges</small>
            </div>
            <div className="card-footer-link">Open visual calendar →</div>
          </div>
        </section>

        {/* Dual Section: AI Matches & Recent Bookings */}
        <section className="dash-split-section">
          {/* AI Recommended Matches Preview */}
          <div className="dash-panel ai-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <h3>🤖 AI Recommended Matches</h3>
                <span className="smart-badge">Auto-Matched in Pune</span>
              </div>
              <Link to="/ai-matches" className="panel-link">View All Matches →</Link>
            </div>

            <div className="ai-matches-mini-list">
              {aiMatches.length > 0 ? (
                aiMatches.map(m => (
                  <div className="ai-mini-card" key={m.id}>
                    <div className="match-score-pill score-high">
                      <strong>{m.matchScore}%</strong>
                      <small>Match</small>
                    </div>
                    <div className="ai-mini-info">
                      <h4>{m.provider}</h4>
                      <p>{m.quantity} {m.resource} · ₹{Number(m.price).toLocaleString()} total</p>
                      <span className="ai-tag">📍 {m.distanceKm} km · {m.status}</span>
                    </div>
                    <Link to="/find-resources" className="btn-mini-action">View & Book</Link>
                  </div>
                ))
              ) : (
                <div className="empty-mini">
                  <p>Search available resources across hotels in Pune to view AI smart matches.</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Bookings Preview */}
          <div className="dash-panel bookings-panel">
            <div className="panel-header">
              <h3>📅 Upcoming Confirmed Bookings</h3>
              <Link to="/bookings" className="panel-link">View Calendar →</Link>
            </div>

            <div className="bookings-mini-list">
              {recentBookings.length > 0 ? (
                recentBookings.map((b) => (
                  <div className="booking-mini-item" key={b.id}>
                    <div className="booking-date-badge">
                      <span>{new Date(b.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <strong>{new Date(b.date).getDate() || '15'}</strong>
                    </div>
                    <div className="booking-mini-info">
                      <h4>{b.resource_name || b.resource}</h4>
                      <p>Booked by <strong>{b.booked_by}</strong></p>
                      <small>📍 {b.city} · {b.total_amount || b.totalAmount}</small>
                    </div>
                    <span className={`status-pill ${(b.status || 'Upcoming').toLowerCase()}`}>{b.status || 'Upcoming'}</span>
                  </div>
                ))
              ) : (
                <div className="empty-mini">
                  <p>No upcoming bookings scheduled yet. When you accept an incoming request or confirm a resource rental, it will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Quick Add Resource Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>+ List a New Resource</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            {savedSuccess ? (
              <div className="modal-success-state">
                <div className="success-icon">✓</div>
                <h4>Resource Listed Successfully!</h4>
                <p>Your listing is now active in My Resources and visible to other hotels across Pune.</p>
              </div>
            ) : (
              <form onSubmit={handleQuickAdd} className="modal-form">
                <label>
                  <span>Resource Name *</span>
                  <input
                    required
                    placeholder="e.g. 150 Golden Banquet Chairs"
                    value={newResource.name}
                    onChange={e => setNewResource({ ...newResource, name: e.target.value })}
                  />
                </label>
                <div className="form-row-2">
                  <label>
                    <span>Category</span>
                    <select
                      value={newResource.category}
                      onChange={e => setNewResource({ ...newResource, category: e.target.value })}
                    >
                      <option>Furniture</option>
                      <option>AV & Sound</option>
                      <option>Kitchen Equipment</option>
                      <option>Banquet Space</option>
                      <option>Tableware</option>
                      <option>Stage & Decor</option>
                    </select>
                  </label>
                  <label>
                    <span>Quantity & Unit</span>
                    <div className="qty-unit-row">
                      <input
                        required
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={newResource.quantity}
                        onChange={e => setNewResource({ ...newResource, quantity: e.target.value })}
                      />
                      <select
                        value={newResource.unit}
                        onChange={e => setNewResource({ ...newResource, unit: e.target.value })}
                      >
                        <option>Chairs</option>
                        <option>Tables</option>
                        <option>Units</option>
                        <option>Sets</option>
                        <option>Hall</option>
                      </select>
                    </div>
                  </label>
                </div>
                <div className="form-row-2">
                  <label>
                    <span>Rent Price (₹ per day) *</span>
                    <input
                      required
                      type="number"
                      min="0"
                      placeholder="₹ Amount"
                      value={newResource.price}
                      onChange={e => setNewResource({ ...newResource, price: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Location / Area</span>
                    <input
                      required
                      placeholder="e.g. Shivajinagar, Pune"
                      value={newResource.location}
                      onChange={e => setNewResource({ ...newResource, location: e.target.value })}
                    />
                  </label>
                </div>
                <div className="form-row-2">
                  <label>
                    <span>Available From</span>
                    <input
                      type="date"
                      value={newResource.availableFrom}
                      onChange={e => setNewResource({ ...newResource, availableFrom: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Available To</span>
                    <input
                      type="date"
                      value={newResource.availableTo}
                      onChange={e => setNewResource({ ...newResource, availableTo: e.target.value })}
                    />
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Publish Listing</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
