import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SAMPLE_MARKETPLACE_RESOURCES = [
  {
    id: 'res-cat-1',
    name: 'Banquet Chiavari Chairs (Golden Finish)',
    category: 'Furniture',
    provider: 'Hotel Green',
    city: 'Koregaon Park, Pune',
    rating: 4.9,
    quantity: 200,
    price: 20,
    priceUnit: 'chair / day',
    available: 'Available Now ✅',
    icon: '🪑',
    desc: 'High grade hardwood Chiavari banquet chairs with cushioned ivory seating pads. Ideal for weddings and galas.'
  },
  {
    id: 'res-cat-2',
    name: 'Round Banquet Dining Tables (10-Seater)',
    category: 'Furniture',
    provider: 'Sayaji Banquets',
    city: 'Wakad, Pune',
    rating: 4.7,
    quantity: 50,
    price: 50,
    priceUnit: 'table / day',
    available: 'Available Now ✅',
    icon: '🪵',
    desc: 'Heavy duty folding banquet round tables with scratch-resistant veneer. Seats 10 guests comfortably.'
  },
  {
    id: 'res-cat-3',
    name: '4K Laser Projector (5000 Lumens) & 150" Screen',
    category: 'AV & Sound',
    provider: 'Novotel Pune',
    city: 'Kalyani Nagar, Pune',
    rating: 4.9,
    quantity: 2,
    price: 1400,
    priceUnit: 'set / day',
    available: 'Available Now ✅',
    icon: '📽️',
    desc: 'Ultra high-definition laser projector with motorized screen, HDMI cables, and wireless presenter clickers.'
  },
  {
    id: 'res-cat-4',
    name: 'Commercial Bain Marie Food Warmers (6-Pan)',
    category: 'Kitchen & Catering',
    provider: 'Royal Orchid Banquets',
    city: 'Viman Nagar, Pune',
    rating: 4.8,
    quantity: 6,
    price: 700,
    priceUnit: 'unit / day',
    available: 'Available Now ✅',
    icon: '🍳',
    desc: 'Stainless steel electric food warmers with temperature thermostat controls. Keeps food fresh for 8+ hours.'
  },
  {
    id: 'res-cat-5',
    name: 'Grand Ballroom Hall B (Capacity 400 Guests)',
    category: 'Banquet Venues',
    provider: 'Hotel Taj',
    city: 'Shivajinagar, Pune',
    rating: 4.9,
    quantity: 1,
    price: 25000,
    priceUnit: 'hall / day',
    available: 'Weekday Slots Open ✅',
    icon: '🏛️',
    desc: 'Centrally air-conditioned luxury ballroom with acoustic soundproofing, crystal chandeliers, and green rooms.'
  },
  {
    id: 'res-cat-6',
    name: 'JBL Line Array Active Sound System (4000W)',
    category: 'AV & Sound',
    provider: 'EventPro Pvt Ltd',
    city: 'Baner Road, Pune',
    rating: 4.9,
    quantity: 1,
    price: 8500,
    priceUnit: 'rig / day',
    available: 'Available Now ✅',
    icon: '🔊',
    desc: 'Complete concert grade active speaker rig including digital mixer, 4 cordless microphones, and subwoofers.'
  }
];

export default function Resources() {
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Furniture', 'AV & Sound', 'Kitchen & Catering', 'Banquet Venues'];

  const filtered = SAMPLE_MARKETPLACE_RESOURCES.filter(r => {
    const matchCat = selectedCat === 'All' || r.category === selectedCat;
    const matchSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <Header />
      <main className="info-page-main resources-directory-page">
        {/* HERO SECTION */}
        <section className="info-hero-section">
          <span className="hero-pill">📦 HOSPITALITY INVENTORY CATALOG</span>
          <h1>Hospitality Resource Marketplace</h1>
          <p>
            Explore surplus banquet furniture, AV sound equipment, commercial kitchen warmers, and event spaces available for rent across Pune.
          </p>
          <div className="hero-search-bar-wrap">
            <input
              type="text"
              placeholder="Search chairs, tables, projectors, sound systems, halls in Pune..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="button" onClick={() => navigate('/login')} className="btn-search-hero">
              Find Resources 🔍
            </button>
          </div>
        </section>

        {/* CATEGORY SELECTOR TABS */}
        <section className="resources-filter-tabs-section">
          <div className="tab-pills-row">
            {categories.map(c => (
              <button
                key={c}
                type="button"
                className={`category-filter-btn ${selectedCat === c ? 'active' : ''}`}
                onClick={() => setSelectedCat(c)}
              >
                {c === 'Furniture' && '🪑 '}
                {c === 'AV & Sound' && '🔊 '}
                {c === 'Kitchen & Catering' && '🍳 '}
                {c === 'Banquet Venues' && '🏛️ '}
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* RESOURCE CARDS GRID */}
        <section className="resources-catalog-section">
          <div className="resources-grid-3">
            {filtered.map(r => (
              <div className="resource-catalog-card" key={r.id}>
                <div className="card-top-icon-row">
                  <div className="cat-icon-avatar">{r.icon}</div>
                  <span className="avail-status-chip">{r.available}</span>
                </div>

                <div className="resource-card-info">
                  <span className="cat-small-badge">{r.category}</span>
                  <h3>{r.name}</h3>
                  <p className="card-desc-text">{r.desc}</p>
                </div>

                <div className="provider-city-row">
                  <div>
                    <strong>{r.provider}</strong>
                    <small>📍 {r.city}</small>
                  </div>
                  <span className="rating-pill-sm">★ {r.rating}</span>
                </div>

                <div className="resource-pricing-action-row">
                  <div className="price-tag-wrap">
                    <span className="price-label">Rental Rate</span>
                    <strong>₹{r.price.toLocaleString()}</strong>
                    <small>/{r.priceUnit}</small>
                  </div>
                  <Link to="/login" className="btn-request-cat-card">
                    Request / Book →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORY SPOTLIGHT SUMMARY BANNER */}
        <section className="category-spotlight-section">
          <div className="spotlight-header">
            <h2>Popular Rental Categories in Pune</h2>
            <p>Everything you need to pull off zero-glitch hospitality events.</p>
          </div>

          <div className="spotlight-cards-grid">
            <div className="spotlight-box">
              <div className="spotlight-emoji">🪑</div>
              <h4>Banquet Furniture</h4>
              <p>Chiavari chairs, banquet round tables, cocktail high-tops, VIP lounge sofas, and stage decor.</p>
            </div>

            <div className="spotlight-box">
              <div className="spotlight-emoji">🔊</div>
              <h4>AV & Stage Tech</h4>
              <p>4K Laser projectors, line array acoustic speakers, LED video walls, wireless mics, and ambient lighting.</p>
            </div>

            <div className="spotlight-box">
              <div className="spotlight-emoji">🍳</div>
              <h4>Kitchen & Catering</h4>
              <p>Bain Marie food warmers, chafing dishes, live cooking counters, commercial refrigeration, and cutlery.</p>
            </div>

            <div className="spotlight-box">
              <div className="spotlight-emoji">🏛️</div>
              <h4>Banquet & Venue Spaces</h4>
              <p>Ballrooms, rooftop terraces, poolside lawns, conference halls, and boardrooms on flexible hours.</p>
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="info-bottom-banner">
          <h2>Have Excess Inventory in Storage?</h2>
          <p>List your unused hotel equipment and start earning daily rental income from verified partners.</p>
          <div className="banner-btn-row">
            <Link to="/register" className="btn-banner-white">+ List Your Resource Now</Link>
            <Link to="/login" className="btn-banner-transparent">Sign In to Dashboard</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
