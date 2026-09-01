import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { Icon } from '../components/Sidebar';
import { api } from '../api';

export default function AIMatches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const loadMatches = async () => {
    const list = await api.getAIMatches({ resource: '', quantity: 200, location: 'Pune', budget: 15000 });
    if (list && list.length > 0) {
      setMatches(list);
    } else {
      setMatches([
        {
          id: 'ai-1',
          provider: 'Hotel Green',
          rating: 4.9,
          reviews: 48,
          resource: '200 Banquet Chiavari Chairs',
          category: 'Furniture',
          quantity: 200,
          price: 8500,
          location: 'Koregaon Park, Pune',
          distanceKm: 3.2,
          availableDates: '14–18 Sept 2026',
          matchScore: 96,
          breakdown: { quantity: 100, availability: 100, location: 95, price: 92 },
          aiSummary: 'Top matching partner in Koregaon Park. 100% quantity match (200 units), 100% date availability, only 3.2 km distance, and priced 15% below market rate.'
        },
        {
          id: 'ai-2',
          provider: 'Sayaji Banquets',
          rating: 4.7,
          reviews: 40,
          resource: '50 Round 10-Seater Dining Tables',
          category: 'Furniture',
          quantity: 50,
          price: 2500,
          location: 'Wakad, Pune',
          distanceKm: 8.4,
          availableDates: '14–16 Sept 2026',
          matchScore: 88,
          breakdown: { quantity: 92, availability: 90, location: 82, price: 86 },
          aiSummary: 'Heavy duty wooden banquet tables with folding stands. Proven 100% on-time logistics partner.'
        }
      ]);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const categories = ['All', 'Furniture', 'AV & Sound', 'Kitchen Equipment', 'Banquet Space', 'Stage & Decor'];

  const filteredMatches = categoryFilter === 'All'
    ? matches
    : matches.filter(m => m.category === categoryFilter);

  const handleInstantRequest = async (item) => {
    await api.createRequest({
      resource: item.resource,
      resource_id: item.id,
      category: item.category,
      quantity: item.quantity,
      date: '2026-09-15',
      budget: item.price,
      location: item.location,
      provider_name: item.provider
    });

    setBookingSuccess(`Request sent to ${item.provider}! Added to My Requests.`);
    setTimeout(() => {
      setBookingSuccess(null);
      navigate('/my-requests');
    }, 1600);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main ai-matches-page">
        {/* USP Hero Banner */}
        <section className="ai-matches-hero">
          <div className="hero-content">
            <span className="usp-pill-hero">⭐ HOSPORA AI SMART MATCHING ENGINE</span>
            <h1>AI has found {matches.length} resources matching your requirements</h1>
            <p>Our predictive algorithm analyzes inventory surplus across Pune, comparing transit proximity, capacity fit, live date availability, and cost efficiency.</p>
          </div>
          <div className="ai-engine-badge">
            <div className="radar-pulse"></div>
            <strong>AI Match v2.4</strong>
            <small>Active in Pune Network</small>
          </div>
        </section>

        {bookingSuccess && (
          <div className="toast-banner">
            <span>✓</span> {bookingSuccess}
          </div>
        )}

        {/* Category Filters */}
        <section className="table-controls-row">
          <div className="tab-pills">
            {categories.map(c => (
              <button
                key={c}
                type="button"
                className={`tab-pill ${categoryFilter === c ? 'active' : ''}`}
                onClick={() => setCategoryFilter(c)}
              >
                {c} ({c === 'All' ? matches.length : matches.filter(m => m.category === c).length})
              </button>
            ))}
          </div>
        </section>

        {/* AI Matches Cards Grid */}
        <section className="ai-matches-grid">
          {filteredMatches.map(m => (
            <div className="ai-match-card-full" key={m.id}>
              <div className="ai-card-top-bar">
                <div className="score-and-hotel">
                  <div className={`ai-match-score-pill ${m.matchScore >= 90 ? 'score-elite' : m.matchScore >= 85 ? 'score-high' : 'score-good'}`}>
                    🎯 <strong>{m.matchScore}%</strong> Match
                  </div>
                  <div>
                    <h3>{m.provider}</h3>
                    <small>★ {m.rating || 4.8} ({m.reviews || 30} reviews) · <span className="verified-text">✓ Verified Partner</span></small>
                  </div>
                </div>
                <span className="category-pill">{m.category}</span>
              </div>

              <div className="ai-card-body">
                <h4>{m.resource}</h4>
                <div className="ai-check-grid">
                  <span className="check-item">Quantity: <strong>{m.quantity} Units</strong> ✅</span>
                  <span className="check-item">Location: <strong>{m.location}</strong> ✅</span>
                  <span className="check-item">Available: <strong>{m.availableDates}</strong> ✅</span>
                  <span className="check-item">Distance: <strong>{m.distanceKm} km</strong> ✅</span>
                </div>
              </div>

              <div className="ai-card-bottom">
                <div className="price-box">
                  <span className="price-label">Estimated Rental</span>
                  <strong>₹{Number(m.price).toLocaleString()}</strong>
                  <small>Available Now ✅</small>
                </div>
                <div className="action-pair">
                  <button
                    type="button"
                    className="btn-why-match-outline"
                    onClick={() => setSelectedMatch(m)}
                  >
                    Why this match?
                  </button>
                  <button
                    type="button"
                    className="btn-request-match-filled"
                    onClick={() => handleInstantRequest(m)}
                  >
                    Request / Book →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Deep-dive "Why this Match?" Modal */}
      {selectedMatch && (
        <div className="modal-overlay" onClick={() => setSelectedMatch(null)}>
          <div className="modal-card why-match-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-pill">
                <h3>Why {selectedMatch.matchScore}% Match for {selectedMatch.provider}?</h3>
                <span className="ai-modal-badge">🤖 Hospora Smart Match Breakdown</span>
              </div>
              <button className="close-btn" onClick={() => setSelectedMatch(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="ai-insight-box">
                <Icon name="matches" />
                <p>{selectedMatch.aiSummary}</p>
              </div>

              <div className="breakdown-bars">
                <div className="score-bar-group">
                  <div className="bar-labels">
                    <span>📦 Quantity Fit ({selectedMatch.quantity} units requested)</span>
                    <strong>{selectedMatch.breakdown?.quantity || 100}% Match</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill green" style={{ width: `${selectedMatch.breakdown?.quantity || 100}%` }}></div>
                  </div>
                </div>

                <div className="score-bar-group">
                  <div className="bar-labels">
                    <span>📅 Date & Schedule Availability ({selectedMatch.availableDates})</span>
                    <strong>{selectedMatch.breakdown?.availability || 100}% Match</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill green" style={{ width: `${selectedMatch.breakdown?.availability || 100}%` }}></div>
                  </div>
                </div>

                <div className="score-bar-group">
                  <div className="bar-labels">
                    <span>📍 Proximity & Transit ({selectedMatch.distanceKm} km away in {selectedMatch.location})</span>
                    <strong>{selectedMatch.breakdown?.location || 95}% Match</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill blue" style={{ width: `${selectedMatch.breakdown?.location || 95}%` }}></div>
                  </div>
                </div>

                <div className="score-bar-group">
                  <div className="bar-labels">
                    <span>💰 Price & Budget Alignment (₹{Number(selectedMatch.price).toLocaleString()})</span>
                    <strong>{selectedMatch.breakdown?.price || 92}% Match</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill purple" style={{ width: `${selectedMatch.breakdown?.price || 92}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="algorithm-formula-card">
                <h5>📐 Algorithm Calculation Formula</h5>
                <code>Match Score = (Quantity × 0.25) + (Availability × 0.25) + (Proximity × 0.25) + (Budget × 0.25)</code>
                <p>Weightings are tuned specifically for Pune hospitality logistics to guarantee zero event disruption.</p>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setSelectedMatch(null)}>Close</button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    const match = selectedMatch;
                    setSelectedMatch(null);
                    handleInstantRequest(match);
                  }}
                >
                  Send Request to {selectedMatch.provider}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
