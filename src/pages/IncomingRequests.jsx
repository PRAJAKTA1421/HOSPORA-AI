import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { Icon } from '../components/Sidebar';
import { api } from '../api';

const filters = ['All Requests', 'Pending', 'In Negotiation', 'Confirmed', 'Declined'];

export default function IncomingRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('All Requests');
  const [toastMessage, setToastMessage] = useState(null);

  const loadIncoming = async () => {
    const list = await api.getIncoming();
    setRequests(list);
  };

  useEffect(() => {
    loadIncoming();
  }, []);

  const handleAccept = async (item) => {
    await api.updateIncoming(item.id, 'Confirmed');
    setToastMessage(`Booking confirmed with ${item.requester_name || item.requester}! Added to Bookings.`);
    loadIncoming();
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDecline = async (id) => {
    await api.updateIncoming(id, 'Declined');
    setToastMessage('Request declined.');
    loadIncoming();
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNegotiate = async (item) => {
    await api.startNegotiation(item);
    navigate('/negotiations');
  };

  const visible = useMemo(() => {
    if (filter === 'All Requests') return requests;
    return requests.filter(r => (r.status || 'Pending').toLowerCase() === filter.toLowerCase());
  }, [requests, filter]);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main incoming-page">
        <header className="page-header">
          <div>
            <h1>📥 Incoming Requests</h1>
            <p>Review and respond to rental requests from other hospitality businesses and event planners.</p>
          </div>
        </header>

        {toastMessage && (
          <div className="toast-banner">
            <span>✓</span> {toastMessage}
          </div>
        )}

        {/* Tab Filters */}
        <section className="table-controls-row">
          <div className="tab-pills">
            {filters.map(t => {
              const count = t === 'All Requests' ? requests.length : requests.filter(r => (r.status || 'Pending').toLowerCase() === t.toLowerCase()).length;
              return (
                <button
                  key={t}
                  type="button"
                  className={`tab-pill ${filter === t ? 'active' : ''}`}
                  onClick={() => setFilter(t)}
                >
                  {t === 'Pending' && '🟡 '}
                  {t === 'In Negotiation' && '💬 '}
                  {t === 'Confirmed' && '🟢 '}
                  {t === 'Declined' && '🔴 '}
                  {t} ({count})
                </button>
              );
            })}
          </div>
        </section>

        {/* Incoming Requests Cards */}
        <section className="incoming-cards-grid">
          {visible.length > 0 ? (
            visible.map(r => (
              <div className="incoming-card" key={r.id}>
                <div className="incoming-card-top">
                  <div className="requester-chip">
                    <div className="requester-avatar">
                      {(r.requester_name || r.requester || 'E').charAt(0)}
                    </div>
                    <div>
                      <strong>{r.requester_name || r.requester}</strong>
                      <small>📍 {r.city}</small>
                    </div>
                  </div>
                  <span className={`status-pill ${(r.status || 'Pending').toLowerCase().replace(/\s+/g, '-')}`}>
                    {r.status || 'Pending'}
                  </span>
                </div>

                <div className="incoming-content">
                  <div className="resource-header-line">
                    <h3>{r.resource_name || r.resource}</h3>
                    <span className="category-pill">{r.category}</span>
                  </div>

                  <div className="details-grid-2">
                    <div className="detail-item">
                      <span className="label">Requested Quantity</span>
                      <strong>{r.quantity} Units</strong>
                    </div>
                    <div className="detail-item">
                      <span className="label">Rental Dates</span>
                      <strong>📅 {r.date} ({r.days || '1-2 Days'})</strong>
                    </div>
                    <div className="detail-item">
                      <span className="label">Offered Payout</span>
                      <strong className="price-highlight">{r.price}</strong>
                      <small>Rate: {r.rate}</small>
                    </div>
                    <div className="detail-item">
                      <span className="label">Delivery/Pickup</span>
                      <strong>Self-Pickup by Requester</strong>
                    </div>
                  </div>
                </div>

                <div className="incoming-card-footer">
                  {(!r.status || r.status === 'Pending') && (
                    <div className="action-button-group">
                      <button
                        type="button"
                        className="btn-accept"
                        onClick={() => handleAccept(r)}
                      >
                        ✓ Accept {r.price}
                      </button>
                      <button
                        type="button"
                        className="btn-negotiate"
                        onClick={() => handleNegotiate(r)}
                      >
                        💬 Negotiate
                      </button>
                      <button
                        type="button"
                        className="btn-decline"
                        onClick={() => handleDecline(r.id)}
                      >
                        ✕ Decline
                      </button>
                    </div>
                  )}

                  {r.status === 'In Negotiation' && (
                    <div className="action-button-group">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => navigate('/negotiations')}
                      >
                        Open Negotiation Thread 💬
                      </button>
                    </div>
                  )}

                  {r.status === 'Confirmed' && (
                    <div className="confirmed-note-row">
                      <span className="confirmed-check">✓ Booking Confirmed & Scheduled</span>
                      <button
                        type="button"
                        className="btn-view-booking-link"
                        onClick={() => navigate('/bookings')}
                      >
                        View in Bookings →
                      </button>
                    </div>
                  )}

                  {r.status === 'Declined' && (
                    <div className="declined-note-row">
                      <span>This request was declined.</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state-box">
              <Icon name="incoming" />
              <h3>No incoming requests</h3>
              <p>When hotels or event organizers in Pune request your listed resources, they will appear here.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
