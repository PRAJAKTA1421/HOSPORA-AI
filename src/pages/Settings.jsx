import { useEffect, useState } from 'react';
import Sidebar, { Icon } from '../components/Sidebar';
import { api } from '../api';

export default function Settings() {
  const [profile, setProfile] = useState({
    businessName: 'Hotel Taj',
    ownerName: 'Rajesh Sharma',
    email: 'taj@hospora.com',
    phone: '+91 98230 45678',
    city: 'Pune',
    address: 'Shivajinagar, JM Road, Pune, Maharashtra 411005',
    businessType: '5-Star Luxury Hotel & Banquets',
    gstin: '27AABCH1234F1Z6',
    isVerified: true,
    operatingRadiusKm: 25
  });

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    api.getMe().then(res => {
      if (res?.user) {
        setProfile(prev => ({ ...prev, ...res.user }));
      }
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    await api.updateSettings(profile);
    setToastMessage('Business Profile & Preferences updated in SQLite database!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetDemoData = async () => {
    if (window.confirm('Reset database to the Hotel Taj Pune Demo Dataset?')) {
      await api.updateSettings({
        businessName: 'Hotel Taj',
        ownerName: 'Rajesh Sharma',
        email: 'taj@hospora.com',
        phone: '+91 98230 45678',
        city: 'Pune',
        address: 'Shivajinagar, JM Road, Pune, Maharashtra 411005',
        businessType: '5-Star Luxury Hotel & Banquets',
        gstin: '27AABCH1234F1Z6',
        operatingRadiusKm: 25
      });
      setToastMessage('✨ Hotel Taj Profile restored successfully!');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main settings-page">
        <header className="page-header">
          <div>
            <h1>⚙️ Settings & Business Profile</h1>
            <p>Manage your hotel profile, operational locations, trust verification badge, and presentation demo mode.</p>
          </div>
        </header>

        {toastMessage && (
          <div className="toast-banner">
            <span>✓</span> {toastMessage}
          </div>
        )}

        <div className="settings-grid-layout">
          {/* Main Settings Form */}
          <div className="settings-form-panel">
            <form onSubmit={handleSave} className="settings-form">
              <h3>Hotel & Business Identity</h3>
              <p className="form-subnote">This information is shown to other hospitality businesses during resource discovery.</p>

              <div className="form-row-2">
                <label>
                  <span>Business / Hotel Name *</span>
                  <input
                    required
                    value={profile.businessName}
                    onChange={e => setProfile({ ...profile, businessName: e.target.value })}
                  />
                </label>
                <label>
                  <span>General Manager / Contact Person *</span>
                  <input
                    required
                    value={profile.ownerName}
                    onChange={e => setProfile({ ...profile, ownerName: e.target.value })}
                  />
                </label>
              </div>

              <div className="form-row-2">
                <label>
                  <span>Official Business Email *</span>
                  <input
                    required
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                  />
                </label>
                <label>
                  <span>Direct Phone / WhatsApp *</span>
                  <input
                    required
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  />
                </label>
              </div>

              <div className="form-row-2">
                <label>
                  <span>Primary Operating City *</span>
                  <input
                    required
                    value={profile.city}
                    onChange={e => setProfile({ ...profile, city: e.target.value })}
                  />
                </label>
                <label>
                  <span>Hospitality Category *</span>
                  <input
                    required
                    value={profile.businessType}
                    onChange={e => setProfile({ ...profile, businessType: e.target.value })}
                  />
                </label>
              </div>

              <label>
                <span>Full Property Address</span>
                <input
                  value={profile.address}
                  onChange={e => setProfile({ ...profile, address: e.target.value })}
                />
              </label>

              <div className="form-row-2">
                <label>
                  <span>GSTIN / Tax ID</span>
                  <input
                    value={profile.gstin}
                    onChange={e => setProfile({ ...profile, gstin: e.target.value })}
                  />
                </label>
                <label>
                  <span>Exchange Radius Coverage</span>
                  <select
                    value={profile.operatingRadiusKm}
                    onChange={e => setProfile({ ...profile, operatingRadiusKm: Number(e.target.value) })}
                  >
                    <option value={10}>Within 10 km</option>
                    <option value={25}>Within 25 km (Pune Metro)</option>
                    <option value={50}>Within 50 km</option>
                    <option value={100}>Statewide (Maharashtra)</option>
                  </select>
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Verification & Demo Controls */}
          <div className="settings-side-column">
            {/* Trust & Verification Card */}
            <div className="trust-status-card">
              <div className="shield-top">
                <Icon name="shield" />
                <span className="verified-badge-lg">✓ Verified Member</span>
              </div>
              <h4>Hospora Trust Score: 98/100</h4>
              <p>Your hospitality license and GSTIN credentials have been verified by the Hospora compliance network.</p>
              <ul className="trust-perks">
                <li>✓ Instant automated booking rights</li>
                <li>✓ Priority ranking in AI Matches</li>
                <li>✓ Escrow payment protection enabled</li>
              </ul>
            </div>

            {/* Pitch / Demo Preset Controls */}
            <div className="demo-reset-card">
              <div className="demo-icon">⚡</div>
              <h4>Presentation / Demo Mode</h4>
              <p>Pitching to judges or testing features? Click below to restore full demo datasets (Hotel Taj, Hotel Green, Sayaji Banquets, 100 Chairs negotiation, active calendar bookings).</p>
              <button
                type="button"
                className="btn-reset-demo"
                onClick={handleResetDemoData}
              >
                Restore Demo Ecosystem ⚡
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
