import { useEffect, useState } from 'react';
import Sidebar, { Icon } from '../components/Sidebar';
import { api } from '../api';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('Quarter');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    api.getAnalytics().then(setAnalyticsData);
  }, []);

  const metrics = analyticsData?.metrics || {
    utilizationRate: 78,
    costSaved: 142000,
    revenueGenerated: 86500,
    activePartners: 18,
    co2SavedKg: 340
  };

  const monthlySavings = [
    { month: 'May 2026', saved: 68000, earned: 34000, transactions: 8 },
    { month: 'Jun 2026', saved: 92000, earned: 52000, transactions: 12 },
    { month: 'Jul 2026', saved: 115000, earned: 67000, transactions: 15 },
    { month: 'Aug 2026', saved: 142000, earned: 86500, transactions: 21 }
  ];

  const categoryDistribution = analyticsData?.categoryBreakdown || [
    { category: 'Furniture (Chairs & Tables)', percent: 42, count: 84, color: '#078b48' },
    { category: 'AV & Sound Systems', percent: 24, count: 48, color: '#2e79d4' },
    { category: 'Banquet & Venue Space', percent: 18, count: 36, color: '#8051d8' },
    { category: 'Kitchen & Catering Equipment', percent: 16, count: 32, color: '#ee941f' }
  ];

  const topPartners = [
    { name: 'Hotel Green', city: 'Koregaon Park', trades: 14, saved: '₹42,000', rating: '★ 4.9' },
    { name: 'Novotel Pune', city: 'Kalyani Nagar', trades: 11, saved: '₹34,500', rating: '★ 4.8' },
    { name: 'Sayaji Banquets', city: 'Wakad', trades: 9, saved: '₹28,000', rating: '★ 4.7' },
    { name: 'EventPro Pvt Ltd', city: 'Koregaon Park', trades: 8, saved: '₹24,000', rating: '★ 4.9' }
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main analytics-page">
        <header className="page-header">
          <div>
            <h1>📊 Business Analytics & ROI</h1>
            <p>Track your asset utilization, rental earnings, and cost savings from resource sharing.</p>
          </div>
          <div className="tab-pills">
            {['Month', 'Quarter', 'Year'].map(t => (
              <button
                key={t}
                type="button"
                className={`tab-pill ${timeRange === t ? 'active' : ''}`}
                onClick={() => setTimeRange(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </header>

        {/* 4 Primary KPI Cards */}
        <section className="analytics-kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Resource Utilization Rate</span>
            <strong className="kpi-val green">{metrics.utilizationRate}%</strong>
            <small>Calculated from active hotel bookings</small>
            <div className="mini-progress-bar">
              <div className="mini-fill" style={{ width: `${metrics.utilizationRate}%` }}></div>
            </div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Cost Saved (Borrow vs Buy)</span>
            <strong className="kpi-val blue">₹{metrics.costSaved.toLocaleString()}</strong>
            <small>Saved by renting from local hotels</small>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Revenue Generated</span>
            <strong className="kpi-val purple">₹{metrics.revenueGenerated.toLocaleString()}</strong>
            <small>Earned from surplus inventory rentals</small>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Active Exchange Network</span>
            <strong className="kpi-val amber">{metrics.activePartners} Venues</strong>
            <small>Verified hospitality businesses in Pune</small>
          </div>
        </section>

        {/* Visual Charts & Category Distribution */}
        <section className="analytics-charts-split">
          {/* Monthly Savings & Earnings Chart */}
          <div className="chart-panel">
            <div className="chart-header">
              <h3>Monthly Financial Performance</h3>
              <div className="chart-legend-row">
                <span className="legend-indicator blue"><i className="dot blue"></i> Cost Saved (₹)</span>
                <span className="legend-indicator green"><i className="dot green"></i> Revenue Earned (₹)</span>
              </div>
            </div>

            <div className="bar-chart-visual">
              {monthlySavings.map((item, i) => (
                <div className="chart-month-col" key={i}>
                  <div className="bars-pair">
                    <div
                      className="bar-item bar-saved"
                      style={{ height: `${(item.saved / 150000) * 160}px` }}
                      title={`Saved: ₹${item.saved.toLocaleString()}`}
                    >
                      <span>₹{(item.saved / 1000).toFixed(0)}k</span>
                    </div>
                    <div
                      className="bar-item bar-earned"
                      style={{ height: `${(item.earned / 150000) * 160}px` }}
                      title={`Earned: ₹${item.earned.toLocaleString()}`}
                    >
                      <span>₹{(item.earned / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                  <span className="month-label">{item.month.split(' ')[0]}</span>
                  <small className="trades-sub">{item.transactions} trades</small>
                </div>
              ))}
            </div>
          </div>

          {/* Category Share Distribution */}
          <div className="chart-panel">
            <div className="chart-header">
              <h3>Resource Category Demand</h3>
            </div>

            <div className="category-bars-list">
              {categoryDistribution.map((cat, i) => (
                <div className="cat-bar-row" key={i}>
                  <div className="cat-meta-row">
                    <strong>{cat.category}</strong>
                    <span>{cat.percent}% ({cat.count} listings)</span>
                  </div>
                  <div className="cat-progress-track">
                    <div
                      className="cat-progress-fill"
                      style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Top Exchange Partners Table */}
        <section className="table-wrapper">
          <div className="table-title-bar">
            <h3>Top Trading Partners in Pune Network</h3>
          </div>
          <table className="custom-data-table">
            <thead>
              <tr>
                <th>Partner Hotel / Business</th>
                <th>Location</th>
                <th>Completed Exchanges</th>
                <th>Mutual Value Exchanged</th>
                <th>Reliability Rating</th>
              </tr>
            </thead>
            <tbody>
              {topPartners.map((p, i) => (
                <tr key={i}>
                  <td>
                    <strong>{p.name}</strong>
                    <span className="verified-badge-sm">✓ Verified Partner</span>
                  </td>
                  <td>📍 {p.city}, Pune</td>
                  <td><strong>{p.trades} Successful Deals</strong></td>
                  <td><strong className="table-price">{p.saved}</strong></td>
                  <td><span className="rating-pill">{p.rating}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
