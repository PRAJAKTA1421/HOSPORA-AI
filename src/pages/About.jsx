import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function About() {
  return (
    <>
      <Header />
      <main className="info-page-main about-page">
        {/* HERO SECTION */}
        <section className="info-hero-section">
          <span className="hero-pill">🏨 ABOUT HOSPORA</span>
          <h1>Empowering Hospitality Through Shared Abundance</h1>
          <p>
            Hospora is Pune’s premier B2B hospitality resource exchange network, enabling hotels, banquet halls, restaurants, and event caterers to collaborate, share equipment, and optimize operational costs.
          </p>
        </section>

        {/* STORY / MISSION SPLIT SECTION */}
        <section className="about-story-section">
          <div className="story-grid-2">
            <div className="story-text-col">
              <span className="section-label-chip">OUR STORY</span>
              <h2>The Problem: Millions in Idle Assets & Expensive Peak Rentals</h2>
              <p>
                In the hospitality industry, every hotel operator and banquet manager experiences the same dilemma:
              </p>
              <p>
                On weekdays, valuable assets like 300 luxury banquet chairs, 4K laser projectors, and commercial warmers sit completely idle in dark storage rooms gathering dust. Yet on busy wedding weekends, neighbouring hotels scramble to buy or rent expensive equipment from distant third-party suppliers at inflated prices.
              </p>
              <p>
                <strong>Hospora was created to bridge this gap.</strong> By transforming every registered business into both a <em>Provider</em> and a <em>Seeker</em>, we turn underutilized inventory into steady rental revenue while saving fellow hospitality operators over 60% on event logistics.
              </p>
            </div>

            <div className="story-stats-card">
              <div className="stat-box-item">
                <strong className="stat-num">50+</strong>
                <span className="stat-lbl">Verified Hotels & Venues in Pune</span>
              </div>
              <div className="stat-box-item">
                <strong className="stat-num">₹14.2 Lakh+</strong>
                <span className="stat-lbl">Mutual Rental Savings Delivered</span>
              </div>
              <div className="stat-box-item">
                <strong className="stat-num">99.4%</strong>
                <span className="stat-lbl">On-Time Logistics Track Record</span>
              </div>
              <div className="stat-box-item">
                <strong className="stat-num">340 kg</strong>
                <span className="stat-lbl">CO₂ Emissions Saved via Circular Sharing</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4 CORE PILLARS */}
        <section className="about-pillars-section">
          <div className="pillars-header">
            <h2>The Four Pillars of Hospora</h2>
            <p>Our foundational commitments to hospitality businesses across Maharashtra.</p>
          </div>

          <div className="pillars-grid-4">
            <div className="pillar-card">
              <div className="pillar-icon">🏨</div>
              <h3>Zero Idle Inventory</h3>
              <p>Storage spaces are expensive. We help hotels monetize surplus inventory on empty days with automated discovery.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">⚡</div>
              <h3>Hyper-Local Pune Network</h3>
              <p>Connecting venues within a 15 km radius (Shivajinagar, Baner, Koregaon Park, Wakad) for ultra-fast, same-day transit.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">🔒</div>
              <h3>Trust & Verified Security</h3>
              <p>Strict GSTIN verification, digital gate pass ledgers, and conflict-free calendar booking guarantees 100% peace of mind.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">🌱</div>
              <h3>Circular Sustainability</h3>
              <p>Sharing existing resources drastically cuts down manufacturing waste, plastic single-use decor, and heavy transport emissions.</p>
            </div>
          </div>
        </section>

        {/* WHY HOSPORA IS UNIQUE */}
        <section className="about-unique-section">
          <div className="unique-box">
            <div className="unique-left">
              <span className="unique-tag">⭐ WHY WE ARE DIFFERENT</span>
              <h2>AI-Powered Smart Matching & Live Negotiations</h2>
              <p>
                Unlike static classifieds or generic rental directories, Hospora uses a proprietary <strong>4-Factor AI Matching Engine</strong> that calculates real-time distance proximity, quantity availability, date alignment, and budget fit.
              </p>
              <ul className="unique-perks-list">
                <li>✓ Multi-Attribute AI match scores with full transparent breakdown</li>
                <li>✓ Live counter-offer negotiation room with instant deal acceptance</li>
                <li>✓ Conflict-free visual calendar ledger preventing double bookings</li>
                <li>✓ 24/7 AI Concierge powered by Mistral AI</li>
              </ul>
            </div>
            <div className="unique-right">
              <div className="ai-preview-card">
                <div className="ai-score-pill">98% Match</div>
                <h4>Hotel Green ↔ Hotel Taj</h4>
                <p>200 Banquet Chairs · 3.2 km transit · ₹8,500 agreed</p>
                <div className="verified-status-tag">✓ Confirmed on Ledger</div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="info-bottom-banner">
          <h2>Join the Future of Hospitality Resource Sharing</h2>
          <p>Create your verified business profile in 2 minutes and start connecting with Pune’s top hotels.</p>
          <div className="banner-btn-row">
            <Link to="/register" className="btn-banner-white">Create Verified Account →</Link>
            <Link to="/how-it-works" className="btn-banner-transparent">See How It Works</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
