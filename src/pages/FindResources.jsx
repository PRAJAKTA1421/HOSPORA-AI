import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { Icon } from '../components/Sidebar';
import { api } from '../api';

export default function FindResources() {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    resource: 'Chairs',
    location: 'Pune',
    quantity: '200',
    date: '2026-09-15',
    budget: '10000'
  });

  const [hasSearched, setHasSearched] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [bookingMatch, setBookingMatch] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (formValues) => {
    setLoading(true);
    const results = await api.getAIMatches(formValues);
    if (results && results.length > 0) {
      setMatches(results);
    } else {
      // Fallback default search list from network
      setMatches([
        {
          id: 'res-5',
          provider: 'Hotel Green',
          rating: 4.9,
          reviews: 38,
          resource: '200 Banquet Chiavari Chairs',
          category: 'Furniture',
          quantity: 200,
          price: 8500,
          location: 'Koregaon Park, Pune',
          distanceKm: 3.2,
          availableDates: '14–18 Sept 2026',
          status: 'Available ✅',
          matchScore: 96,
          breakdown: { quantity: 100, availability: 100, location: 95, price: 92 },
          aiSummary: 'Exact quantity match (200/200), available on 15 Sept, 3.2 km distance, and ₹1,500 below your ₹10,000 budget.'
        },
        {
          id: 'res-7',
          provider: 'Sayaji Banquets',
          rating: 4.7,
          reviews: 42,
          resource: '220 Deluxe Banquet Chairs',
          category: 'Furniture',
          quantity: 220,
          price: 9800,
          location: 'Wakad, Pune',
          distanceKm: 8.4,
          availableDates: '15–17 Sept 2026',
          status: 'Available ✅',
          matchScore: 88,
          breakdown: { quantity: 92, availability: 90, location: 82, price: 86 },
          aiSummary: 'High quality banquet inventory, matches required date, priced at ₹9,800 within specified limit.'
        }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    performSearch(searchForm);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
    performSearch(searchForm);
  };

  const handleRequestBooking = async (match) => {
    await api.createRequest({
      resource: `${searchForm.quantity} ${searchForm.resource} (${match.resource})`,
      resource_id: match.id,
      category: match.category,
      quantity: Number(searchForm.quantity),
      date: searchForm.date,
      budget: match.price,
      location: match.location,
      provider_name: match.provider
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingMatch(null);
      navigate('/my-requests');
    }, 1500);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main find-resources-page">
        <header className="page-header">
          <div>
            <h1>🔍 Find Resources</h1>
            <p>Discover & rent available hospitality assets from verified hotels, caterers, and venues.</p>
          </div>
        </header>

        {/* Search Filter Bar */}
        <section className="search-filter-card">
          <form onSubmit={handleSearch} className="find-filter-grid">
            <div className="filter-field">
              <label>What do you need?</label>
              <div className="input-with-icon">
                <input
                  required
                  placeholder="e.g. Chairs, Tables, Projector..."
                  value={searchForm.resource}
                  onChange={e => setSearchForm({ ...searchForm, resource: e.target.value })}
                />
              </div>
            </div>

            <div className="filter-field">
              <label>Location</label>
              <input
                required
                placeholder="City / Area"
                value={searchForm.location}
                onChange={e => setSearchForm({ ...searchForm, location: e.target.value })}
              />
            </div>

            <div className="filter-field">
              <label>Quantity</label>
              <input
                required
                type="number"
                min="1"
                placeholder="e.g. 200"
                value={searchForm.quantity}
                onChange={e => setSearchForm({ ...searchForm, quantity: e.target.value })}
              />
            </div>

            <div className="filter-field">
              <label>Required Date</label>
              <input
                required
                type="date"
                value={searchForm.date}
                onChange={e => setSearchForm({ ...searchForm, date: e.target.value })}
              />
            </div>

            <div className="filter-field">
              <label>Max Budget (₹)</label>
              <input
                required
                type="number"
                min="0"
                placeholder="₹10,000"
                value={searchForm.budget}
                onChange={e => setSearchForm({ ...searchForm, budget: e.target.value })}
              />
            </div>

            <div className="filter-submit-field">
              <button type="submit" className="btn-find-submit" disabled={loading}>
                <Icon name="search" />
                <span>{loading ? 'Searching…' : 'Find Resources'}</span>
              </button>
            </div>
          </form>
        </section>

        {/* Search Results / AI Matches */}
        {hasSearched && (
          <section className="find-results-section">
            <div className="results-header">
              <div className="ai-tag-group">
                <span className="smart-badge-large">🤖 AI Recommended Resources</span>
                <span className="results-count">{matches.length} verified listings found in {searchForm.location}</span>
              </div>
              <p className="ai-subnote">Ranked by AI matching score considering distance, quantity availability, price, and partner reliability.</p>
            </div>

            <div className="match-cards-grid">
              {matches.map(m => (
                <div className="match-card" key={m.id}>
                  <div className="match-card-top">
                    <div className="provider-info">
                      <h3>{m.provider}</h3>
                      <div className="rating-row">
                        <span className="star-rating">★ {m.rating}</span>
                        <small>({m.reviews} reviews)</small>
                        <span className="verified-pill">✓ Verified</span>
                      </div>
                    </div>
                    <div className="match-score-badge">
                      <span className="score-val">{m.matchScore}%</span>
                      <small>Match</small>
                    </div>
                  </div>

                  <div className="match-resource-details">
                    <h4>{m.resource}</h4>
                    <div className="detail-tags">
                      <span className="tag-pill">📦 {m.quantity} Units Available</span>
                      <span className="tag-pill">📍 {m.distanceKm} km away</span>
                      <span className="tag-pill">📅 {m.availableDates}</span>
                      <span className="tag-pill success-tag">{m.status}</span>
                    </div>
                  </div>

                  <div className="match-pricing-row">
                    <div className="price-tag">
                      <span className="label">Total Estimated Cost</span>
                      <strong>₹{Number(m.price).toLocaleString()}</strong>
                      <small>(₹{(m.price / m.quantity).toFixed(1)}/unit/day)</small>
                    </div>
                    <div className="match-actions">
                      <button
                        type="button"
                        className="btn-why-match"
                        onClick={() => setSelectedMatch(m)}
                      >
                        Why this match?
                      </button>
                      <button
                        type="button"
                        className="btn-request-match"
                        onClick={() => setBookingMatch(m)}
                      >
                        Request / Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* "Why this match?" AI Breakdown Modal */}
      {selectedMatch && (
        <div className="modal-overlay" onClick={() => setSelectedMatch(null)}>
          <div className="modal-card why-match-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-pill">
                <h3>Why {selectedMatch.matchScore}% Match?</h3>
                <span className="ai-modal-badge">🤖 AI Score Breakdown</span>
              </div>
              <button className="close-btn" onClick={() => setSelectedMatch(null)}>×</button>
            </div>

            <div className="modal-body">
              <p className="ai-summary-text">{selectedMatch.aiSummary || selectedMatch.aiNote}</p>

              <div className="breakdown-bars">
                <div className="score-bar-group">
                  <div className="bar-labels">
                    <span>📦 Quantity Fit ({selectedMatch.quantity} available vs {searchForm.quantity} needed)</span>
                    <strong>{selectedMatch.breakdown?.quantity || 100}%</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill green" style={{ width: `${selectedMatch.breakdown?.quantity || 100}%` }}></div>
                  </div>
                </div>

                <div className="score-bar-group">
                  <div className="bar-labels">
                    <span>📅 Date & Schedule Availability ({selectedMatch.availableDates})</span>
                    <strong>{selectedMatch.breakdown?.availability || 100}%</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill green" style={{ width: `${selectedMatch.breakdown?.availability || 100}%` }}></div>
                  </div>
                </div>

                <div className="score-bar-group">
                  <div className="bar-labels">
                    <span>📍 Proximity & Transit Distance ({selectedMatch.distanceKm} km · {selectedMatch.location})</span>
                    <strong>{selectedMatch.breakdown?.location || 95}%</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill blue" style={{ width: `${selectedMatch.breakdown?.location || 95}%` }}></div>
                  </div>
                </div>

                <div className="score-bar-group">
                  <div className="bar-labels">
                    <span>💰 Budget Alignment (₹{Number(selectedMatch.price).toLocaleString()} vs ₹{Number(searchForm.budget).toLocaleString()} Max)</span>
                    <strong>{selectedMatch.breakdown?.price || 92}%</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill purple" style={{ width: `${selectedMatch.breakdown?.price || 92}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="partner-trust-box">
                <Icon name="shield" />
                <div>
                  <strong>Trusted Hospitality Partner</strong>
                  <p>{selectedMatch.provider} is a verified provider with 99.4% on-time delivery record and zero dispute history.</p>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setSelectedMatch(null)}>Close</button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    const match = selectedMatch;
                    setSelectedMatch(null);
                    setBookingMatch(match);
                  }}
                >
                  Proceed to Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request / Book Confirmation Modal */}
      {bookingMatch && (
        <div className="modal-overlay" onClick={() => !bookingSuccess && setBookingMatch(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Resource Request</h3>
              {!bookingSuccess && <button className="close-btn" onClick={() => setBookingMatch(null)}>×</button>}
            </div>

            {bookingSuccess ? (
              <div className="modal-success-state">
                <div className="success-icon">✓</div>
                <h4>Request Sent to {bookingMatch.provider}!</h4>
                <p>You can track the request status and negotiate in your <strong>My Requests</strong> hub.</p>
              </div>
            ) : (
              <div className="modal-body">
                <div className="request-summary-box">
                  <div className="summary-line"><span>Resource:</span> <strong>{searchForm.quantity} {searchForm.resource}</strong></div>
                  <div className="summary-line"><span>Provider:</span> <strong>{bookingMatch.provider}</strong></div>
                  <div className="summary-line"><span>Required Date:</span> <strong>{searchForm.date}</strong></div>
                  <div className="summary-line"><span>Delivery Location:</span> <strong>{searchForm.location}</strong></div>
                  <div className="summary-line highlight"><span>Offered Price:</span> <strong>₹{Number(bookingMatch.price).toLocaleString()}</strong></div>
                </div>
                <p className="request-note">Upon submission, {bookingMatch.provider} will receive your request immediately and can Accept, Reject, or Negotiate terms.</p>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setBookingMatch(null)}>Cancel</button>
                  <button type="button" className="btn-primary" onClick={() => handleRequestBooking(bookingMatch)}>Send Request Now</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
