import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { Icon } from '../components/Sidebar';
import { api } from '../api';

export default function Negotiations() {
  const navigate = useNavigate();
  const [negotiations, setNegotiations] = useState([]);
  const [activeNegId, setActiveNegId] = useState(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const loadNegotiationsData = async () => {
    const [negs, me] = await Promise.all([api.getNegotiations(), api.getMe()]);
    setNegotiations(negs);
    if (me?.user) setCurrentUser(me.user);
    if (negs.length > 0 && !activeNegId) {
      setActiveNegId(negs[0].id);
    }
  };

  useEffect(() => {
    loadNegotiationsData();
  }, []);

  const activeNeg = negotiations.find(n => n.id === activeNegId) || negotiations[0];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeNeg) return;

    await api.sendNegotiationMessage(activeNeg.id, {
      text: chatInput.trim(),
      isOffer: false
    });

    setChatInput('');
    loadNegotiationsData();
  };

  const handleSendCounterOffer = async (e) => {
    e.preventDefault();
    if (!counterAmount || !activeNeg) return;

    const amountNum = Number(counterAmount);
    await api.sendNegotiationMessage(activeNeg.id, {
      text: `We have proposed a counter offer of ₹${amountNum.toLocaleString()}.`,
      isOffer: true,
      amount: amountNum
    });

    setShowCounterModal(false);
    setCounterAmount('');
    setStatusFeedback(`Counter offer of ₹${amountNum.toLocaleString()} sent in real-time!`);
    loadNegotiationsData();
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  const handleAcceptOffer = async () => {
    if (!activeNeg) return;
    const finalAmount = activeNeg.current_offer || activeNeg.currentOffer || activeNeg.their_offer || activeNeg.theirOffer;

    await api.acceptNegotiation(activeNeg.id);
    setStatusFeedback(`🎉 Offer accepted! Confirmed booking generated for ₹${Number(finalAmount).toLocaleString()}`);
    loadNegotiationsData();
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  const handleRejectOffer = async () => {
    if (!activeNeg) return;
    await api.sendNegotiationMessage(activeNeg.id, {
      text: 'Negotiation was declined.',
      isOffer: false
    });
    setStatusFeedback('Negotiation closed.');
    loadNegotiationsData();
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main negotiations-page">
        <header className="page-header">
          <div>
            <h1>💬 Live Negotiations Hub</h1>
            <p>Directly negotiate pricing, quantities, and delivery terms with verified hospitality partners.</p>
          </div>
        </header>

        {statusFeedback && (
          <div className="toast-banner">
            <span>✓</span> {statusFeedback}
          </div>
        )}

        <div className="negotiations-layout-grid">
          {/* Left: Active Negotiation Conversations List */}
          <div className="neg-conversations-sidebar">
            <div className="neg-list-header">
              <h3>Active Deals ({negotiations.length})</h3>
            </div>
            <div className="neg-threads-list">
              {negotiations.length > 0 ? (
                negotiations.map(n => (
                  <div
                    key={n.id}
                    className={`neg-thread-item ${activeNeg?.id === n.id ? 'active' : ''}`}
                    onClick={() => setActiveNegId(n.id)}
                  >
                    <div className="thread-avatar">
                      {(n.counterpartyName || n.provider_name || n.seeker_name || 'E').charAt(0)}
                    </div>
                    <div className="thread-meta">
                      <div className="thread-top">
                        <strong>{n.counterpartyName || n.provider_name || n.seeker_name}</strong>
                        <span className={`status-pill-mini ${(n.status || 'In Negotiation').toLowerCase().replace(/\s+/g, '-')}`}>
                          {n.status || 'In Negotiation'}
                        </span>
                      </div>
                      <h4>{n.resource_name || n.resourceName}</h4>
                      <p className="thread-sub">{n.last_message || n.lastMessage}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px 16px', color: 'var(--text-muted)', fontSize: '13.5px', textAlign: 'center' }}>
                  No ongoing negotiations.
                </div>
              )}
            </div>
          </div>

          {/* Right: Negotiation Room & Live Counter-Offer Console */}
          {activeNeg ? (
            <div className="neg-room-panel">
              {/* Negotiation Top Card */}
              <div className="neg-room-header">
                <div className="deal-info">
                  <h2>{activeNeg.resource_name || activeNeg.resourceName}</h2>
                  <p>Negotiation with <strong>{activeNeg.counterpartyName || activeNeg.provider_name || activeNeg.seeker_name}</strong> · Role: <span className="role-tag">{activeNeg.role || 'Partner'}</span></p>
                </div>
                <div className="deal-pricing-pills">
                  <div className="price-pill listed">
                    <small>Listed Price</small>
                    <strong>₹{Number(activeNeg.listed_price || activeNeg.listedPrice || 5000).toLocaleString()}</strong>
                  </div>
                  <div className="price-pill offered">
                    <small>Their Offer</small>
                    <strong>₹{Number(activeNeg.their_offer || activeNeg.theirOffer || 4000).toLocaleString()}</strong>
                  </div>
                  <div className="price-pill counter">
                    <small>Current Proposed</small>
                    <strong>₹{Number(activeNeg.current_offer || activeNeg.currentOffer || 4500).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Action Ribbon: Accept / Counter / Reject */}
              {(activeNeg.status === 'In Negotiation' || !activeNeg.status) && (
                <div className="negotiation-action-ribbon">
                  <div className="action-hint">
                    <span>💡 Action Required:</span> Propose terms or accept current offer of <strong>₹{Number(activeNeg.current_offer || activeNeg.currentOffer || 4500).toLocaleString()}</strong>.
                  </div>
                  <div className="ribbon-btn-group">
                    <button
                      type="button"
                      className="btn-accept-deal"
                      onClick={handleAcceptOffer}
                    >
                      ✓ Accept ₹{Number(activeNeg.current_offer || activeNeg.currentOffer || 4500).toLocaleString()}
                    </button>
                    <button
                      type="button"
                      className="btn-counter-deal"
                      onClick={() => setShowCounterModal(true)}
                    >
                      ✏️ Counter Offer
                    </button>
                    <button
                      type="button"
                      className="btn-reject-deal"
                      onClick={handleRejectOffer}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              )}

              {activeNeg.status === 'Accepted' && (
                <div className="deal-closed-banner success">
                  <span>🎉 Deal Agreed! Booking confirmed at ₹{Number(activeNeg.current_offer || activeNeg.currentOffer).toLocaleString()}</span>
                  <button type="button" className="btn-mini-view-booking" onClick={() => navigate('/bookings')}>
                    View in Bookings →
                  </button>
                </div>
              )}

              {/* Chat Thread */}
              <div className="chat-messages-container">
                {activeNeg.messages?.map((msg, i) => {
                  const isMe = msg.sender === (currentUser?.businessName || 'My Hotel');
                  return (
                    <div key={msg.id || i} className={`chat-bubble-row ${isMe ? 'mine' : 'theirs'}`}>
                      <div className="chat-bubble">
                        <div className="chat-sender-name">
                          <strong>{msg.sender}</strong>
                          <small>{msg.time}</small>
                        </div>
                        <p>{msg.text}</p>
                        {msg.isOffer && (
                          <div className="offer-bubble-pill">
                            <span>Offered Amount:</span> <strong>₹{Number(msg.amount).toLocaleString()}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              {(activeNeg.status === 'In Negotiation' || !activeNeg.status) ? (
                <form onSubmit={handleSendMessage} className="chat-input-bar">
                  <input
                    placeholder="Type your message or special requirement..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                  />
                  <button type="submit" className="btn-send-chat">
                    Send 💬
                  </button>
                </form>
              ) : (
                <div className="chat-disabled-bar">
                  This negotiation is marked as {activeNeg.status}.
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state-box" style={{ flex: 1, margin: 0, justifyContent: 'center', background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '60px 24px', textAlign: 'center' }}>
              <Icon name="chat" />
              <h3>No Active Negotiations</h3>
              <p>When you propose counter-offers on incoming requests or request custom terms from other hotels, live deal discussions will appear here.</p>
            </div>
          )}
        </div>
      </main>

      {/* Counter Offer Modal */}
      {showCounterModal && activeNeg && (
        <div className="modal-overlay" onClick={() => setShowCounterModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Propose Counter Offer</h3>
              <button className="close-btn" onClick={() => setShowCounterModal(false)}>×</button>
            </div>

            <form onSubmit={handleSendCounterOffer} className="modal-form">
              <div className="request-summary-box">
                <div className="summary-line"><span>Resource:</span> <strong>{activeNeg.resource_name || activeNeg.resourceName}</strong></div>
                <div className="summary-line"><span>Counterparty:</span> <strong>{activeNeg.counterpartyName || activeNeg.provider_name || activeNeg.seeker_name}</strong></div>
                <div className="summary-line"><span>Original Listed Price:</span> <strong>₹{Number(activeNeg.listed_price || activeNeg.listedPrice || 5000).toLocaleString()}</strong></div>
                <div className="summary-line"><span>Their Previous Offer:</span> <strong>₹{Number(activeNeg.their_offer || activeNeg.theirOffer || 4000).toLocaleString()}</strong></div>
              </div>

              <label>
                <span>Your Counter Offer Amount (₹) *</span>
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="e.g. 4500"
                  value={counterAmount}
                  onChange={e => setCounterAmount(e.target.value)}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCounterModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Send Counter Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
