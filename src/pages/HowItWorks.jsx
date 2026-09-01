import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState('provider'); // 'provider' or 'seeker'
  const [calcQty, setCalcQty] = useState(150);
  const [calcDays, setCalcDays] = useState(4);
  const [calcRate, setCalcRate] = useState(25);

  const estimatedEarnings = calcQty * calcDays * calcRate;

  return (
    <>
      <Header />
      <main className="info-page-main how-it-works-page">
        {/* HERO SECTION */}
        <section className="info-hero-section">
          <span className="hero-pill">⚡ THE CIRCULAR HOSPITALITY PLATFORM</span>
          <h1>How HOSPORA Works</h1>
          <p>
            Hospora connects hotels, banquet halls, caterers, and restaurants across Pune to share, rent, and monetize surplus hospitality equipment and venue spaces.
          </p>
          <div className="hero-cta-group">
            <Link to="/register" className="btn-hero-primary">Start Free Today →</Link>
            <Link to="/resources" className="btn-hero-outline">Explore Marketplace</Link>
          </div>
        </section>

        {/* DUAL ROLE INTERACTIVE TOGGLE */}
        <section className="how-it-works-toggle-section">
          <div className="toggle-container">
            <div className="perspective-tabs">
              <button
                type="button"
                className={`perspective-tab ${activeTab === 'provider' ? 'active' : ''}`}
                onClick={() => setActiveTab('provider')}
              >
                📦 For Resource Providers (Earn Money)
              </button>
              <button
                type="button"
                className={`perspective-tab ${activeTab === 'seeker' ? 'active' : ''}`}
                onClick={() => setActiveTab('seeker')}
              >
                🔍 For Resource Seekers (Save Costs)
              </button>
            </div>

            {/* PROVIDER FLOW */}
            {activeTab === 'provider' && (
              <div className="flow-content-panel">
                <div className="flow-header">
                  <h2>Turn Underutilized Hospitality Assets Into Daily Profit</h2>
                  <p>Whether you have 200 unused Chiavari chairs, banquet tables, warmers, or vacant hall slots on weekdays — put them to work.</p>
                </div>

                <div className="steps-grid-4">
                  <div className="step-card">
                    <div className="step-number-badge">01</div>
                    <div className="step-icon">📝</div>
                    <h3>List Surplus Inventory</h3>
                    <p>Enter your resource name, quantity, category, photos, and your desired daily rental rate in 60 seconds.</p>
                  </div>

                  <div className="step-card">
                    <div className="step-number-badge">02</div>
                    <div className="step-icon">📥</div>
                    <h3>Receive Verified Requests</h3>
                    <p>Nearby event organizers and partner hotels in Pune request your items with event dates and budget.</p>
                  </div>

                  <div className="step-card">
                    <div className="step-number-badge">03</div>
                    <div className="step-icon">💬</div>
                    <h3>Accept or Negotiate</h3>
                    <p>Accept the requested rate with 1 click or use our live negotiation room to propose custom counter-offers.</p>
                  </div>

                  <div className="step-card">
                    <div className="step-number-badge">04</div>
                    <div className="step-icon">💰</div>
                    <h3>Conflict-Free Booking & Payout</h3>
                    <p>Confirmed orders are automatically locked on the calendar ledger. Handover assets and receive direct payouts.</p>
                  </div>
                </div>
              </div>
            )}

            {/* SEEKER FLOW */}
            {activeTab === 'seeker' && (
              <div className="flow-content-panel">
                <div className="flow-header">
                  <h2>Fulfill Sudden Event Demands Without Buying Expensive Equipment</h2>
                  <p>Hosting a large wedding or corporate conference? Rent chairs, projectors, sound systems, or warmers at 60% lower cost than buying.</p>
                </div>

                <div className="steps-grid-4">
                  <div className="step-card">
                    <div className="step-number-badge">01</div>
                    <div className="step-icon">🔍</div>
                    <h3>Smart Search</h3>
                    <p>Specify the required equipment, quantity, delivery location in Pune, and your max event budget.</p>
                  </div>

                  <div className="step-card">
                    <div className="step-number-badge">02</div>
                    <div className="step-icon">🤖</div>
                    <h3>AI Smart Matches</h3>
                    <p>Hospora AI instantly ranks verified local listings based on proximity, capacity fit, availability, and best price.</p>
                  </div>

                  <div className="step-card">
                    <div className="step-number-badge">03</div>
                    <div className="step-icon">💬</div>
                    <h3>Direct Counter-Offers</h3>
                    <p>Send an instant booking request or negotiate delivery and sanitize terms directly with the hotel manager.</p>
                  </div>

                  <div className="step-card">
                    <div className="step-number-badge">04</div>
                    <div className="step-icon">📅</div>
                    <h3>Digital Gate Pass</h3>
                    <p>Get instant verified digital gate passes and schedule logistics handoff with zero double-booking risks.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* INTERACTIVE EARNINGS / SAVINGS CALCULATOR */}
        <section className="calculator-section">
          <div className="calc-card">
            <div className="calc-info">
              <span className="calc-tag">💡 ROI ESTIMATOR</span>
              <h2>Hospitality Asset Revenue Calculator</h2>
              <p>Estimate how much revenue your unused banquet equipment or hotel space can generate every month on Hospora.</p>
              
              <div className="calc-result-box">
                <span>Estimated Monthly Earning Potential:</span>
                <strong className="calc-payout-text">₹{estimatedEarnings.toLocaleString()}</strong>
                <small>Based on {calcDays} rental days per month in Pune Metro</small>
              </div>
            </div>

            <div className="calc-controls">
              <div className="calc-field">
                <label>Available Quantity: <strong>{calcQty} Units</strong></label>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={calcQty}
                  onChange={e => setCalcQty(Number(e.target.value))}
                />
              </div>

              <div className="calc-field">
                <label>Rental Rate per Day: <strong>₹{calcRate} / Unit</strong></label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={calcRate}
                  onChange={e => setCalcRate(Number(e.target.value))}
                />
              </div>

              <div className="calc-field">
                <label>Days Rented per Month: <strong>{calcDays} Days</strong></label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={calcDays}
                  onChange={e => setCalcDays(Number(e.target.value))}
                />
              </div>

              <Link to="/register" className="btn-calc-cta">List Your Assets & Earn →</Link>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="faq-section">
          <div className="faq-header">
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about resource exchange on Hospora.</p>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <h4>Is Hospora restricted to Pune only?</h4>
              <p>Hospora is currently active across Pune Metro (Shivajinagar, Koregaon Park, Baner, Wakad, Viman Nagar, Hadapsar) and expanding rapidly across Maharashtra.</p>
            </div>

            <div className="faq-item">
              <h4>How do you verify participating hotels?</h4>
              <p>Every business profile undergoes compliance checks including GSTIN validation, commercial address verification, and partner reliability scoring.</p>
            </div>

            <div className="faq-item">
              <h4>What if equipment is damaged during rental?</h4>
              <p>All transactions include digital handover logs, gate passes, and optional security deposit terms agreed upon during the negotiation phase.</p>
            </div>

            <div className="faq-item">
              <h4>Can I be both a Provider and a Seeker?</h4>
              <p>Yes! Every Hospora account has a Unified Business Dashboard where you can list surplus inventory on weekdays and rent equipment on peak weekends.</p>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="info-bottom-banner">
          <h2>Ready to Unlock Value From Your Hospitality Assets?</h2>
          <p>Join over 50+ verified hotels, banquet halls, and caterers in Pune today.</p>
          <div className="banner-btn-row">
            <Link to="/register" className="btn-banner-white">Create Verified Account →</Link>
            <Link to="/login" className="btn-banner-transparent">Sign In</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
