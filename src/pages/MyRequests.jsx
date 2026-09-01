import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { Icon } from '../components/Sidebar';
import { api } from '../api';

const statusFilters = ['All Requests', 'Pending', 'Accepted', 'In Negotiation', 'Rejected'];

export default function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('All Requests');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const loadRequests = async () => {
    const list = await api.getRequests();
    setRequests(list);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancelRequest = async (id) => {
    if (window.confirm('Cancel this resource request?')) {
      const next = requests.map(r => r.id === id ? { ...r, status: 'Rejected' } : r);
      setRequests(next);
      setSelectedRequest(null);
    }
  };

  const visible = useMemo(() => {
    if (filter === 'All Requests') return requests;
    return requests.filter(r => (r.status || 'Pending').toLowerCase() === filter.toLowerCase());
  }, [requests, filter]);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main my-requests-page">
        <header className="page-header">
          <div>
            <h1>📋 My Requests</h1>
            <p>Track resources you have requested from other hotels and venues across Pune.</p>
          </div>
          <button
            type="button"
            className="btn-primary-action"
            onClick={() => navigate('/find-resources')}
          >
            <Icon name="search" />
            <span>+ Find New Resources</span>
          </button>
        </header>

        {/* Status Tab Filters */}
        <section className="table-controls-row">
          <div className="tab-pills">
            {statusFilters.map(t => {
              const count = t === 'All Requests' ? requests.length : requests.filter(r => (r.status || 'Pending').toLowerCase() === t.toLowerCase()).length;
              return (
                <button
                  key={t}
                  type="button"
                  className={`tab-pill ${filter === t ? 'active' : ''}`}
                  onClick={() => setFilter(t)}
                >
                  {t === 'Pending' && '🟡 '}
                  {t === 'Accepted' && '🟢 '}
                  {t === 'In Negotiation' && '💬 '}
                  {t === 'Rejected' && '🔴 '}
                  {t} ({count})
                </button>
              );
            })}
          </div>
        </section>

        {/* Requests Table */}
        <section className="table-wrapper">
          <table className="custom-data-table">
            <thead>
              <tr>
                <th>Resource Name</th>
                <th>Provider Hotel</th>
                <th>Quantity</th>
                <th>Required Date</th>
                <th>Estimated Cost</th>
                <th>Status</th>
                <th>Requested On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length > 0 ? (
                visible.map(r => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.resource_name || r.resource}</strong>
                      <span className="table-sub">{r.location || 'Pune'}</span>
                    </td>
                    <td>
                      <div className="provider-cell">
                        <strong>{r.provider_name || 'Assigned to verified pool'}</strong>
                        {r.provider_name && r.provider_name !== 'Not assigned yet' && <small className="verified-badge-sm">✓ Verified</small>}
                      </div>
                    </td>
                    <td>{r.quantity}</td>
                    <td>
                      <span className="date-badge-sm">📅 {r.date_needed || r.date || 'Flexible'}</span>
                    </td>
                    <td>
                      <strong className="table-price">₹{Number(r.budget || 0).toLocaleString()}</strong>
                    </td>
                    <td>
                      <span className={`status-pill ${(r.status || 'Pending').toLowerCase().replace(/\s+/g, '-')}`}>
                        {r.status === 'Pending' && '🟡 '}
                        {r.status === 'Accepted' && '🟢 '}
                        {r.status === 'In Negotiation' && '💬 '}
                        {r.status === 'Rejected' && '🔴 '}
                        {r.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <small className="date-sub">
                        {r.created_at || r.createdAt ? new Date(r.created_at || r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}
                      </small>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-view-details"
                          onClick={() => setSelectedRequest(r)}
                        >
                          View Details
                        </button>
                        {r.status === 'In Negotiation' && (
                          <button
                            type="button"
                            className="btn-negotiate-link"
                            onClick={() => navigate('/negotiations')}
                          >
                            💬 Chat
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-table-cell">
                    <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                      <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        📋 You have not submitted any resource requests yet.
                      </p>
                      <button
                        type="button"
                        className="btn-primary-action"
                        style={{ display: 'inline-flex' }}
                        onClick={() => navigate('/find-resources')}
                      >
                        🔍 Find & Request Needed Resources
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-pill">
                <h3>Request Details</h3>
                <span className={`status-pill ${(selectedRequest.status || 'Pending').toLowerCase().replace(/\s+/g, '-')}`}>
                  {selectedRequest.status || 'Pending'}
                </span>
              </div>
              <button className="close-btn" onClick={() => setSelectedRequest(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="request-summary-box">
                <div className="summary-line"><span>Resource:</span> <strong>{selectedRequest.resource_name || selectedRequest.resource}</strong></div>
                <div className="summary-line"><span>Provider Hotel:</span> <strong>{selectedRequest.provider_name}</strong></div>
                <div className="summary-line"><span>Quantity:</span> <strong>{selectedRequest.quantity} Units</strong></div>
                <div className="summary-line"><span>Required Date:</span> <strong>{selectedRequest.date_needed || selectedRequest.date}</strong></div>
                <div className="summary-line"><span>Delivery Area:</span> <strong>{selectedRequest.location || 'Pune'}</strong></div>
                <div className="summary-line highlight"><span>Offered Budget:</span> <strong>₹{Number(selectedRequest.budget).toLocaleString()}</strong></div>
              </div>

              {/* Status explanation */}
              <div className="status-timeline-card">
                <h4>Status Timeline</h4>
                {selectedRequest.status === 'Accepted' && (
                  <p className="success-text">🟢 The provider has accepted your request. Booking is scheduled and delivery terms are finalized.</p>
                )}
                {(!selectedRequest.status || selectedRequest.status === 'Pending') && (
                  <p className="pending-text">🟡 The request is waiting for provider review. Most partners respond within 2 hours.</p>
                )}
                {selectedRequest.status === 'In Negotiation' && (
                  <p className="negotiation-text">💬 The provider sent a counter-offer or note. Click below to view negotiation chat.</p>
                )}
                {selectedRequest.status === 'Rejected' && (
                  <p className="rejected-text">🔴 This request was declined or cancelled. You can search other available providers.</p>
                )}
              </div>

              <div className="modal-actions">
                {(!selectedRequest.status || selectedRequest.status === 'Pending') && (
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleCancelRequest(selectedRequest.id)}
                  >
                    Cancel Request
                  </button>
                )}
                {selectedRequest.status === 'In Negotiation' && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setSelectedRequest(null);
                      navigate('/negotiations');
                    }}
                  >
                    Open Negotiation Room 💬
                  </button>
                )}
                <button type="button" className="btn-secondary" onClick={() => setSelectedRequest(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
