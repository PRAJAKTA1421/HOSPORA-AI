import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { Icon } from '../components/Sidebar';
import { api } from '../api';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('All');

  const loadNotifs = async () => {
    const list = await api.getNotifications();
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    loadNotifs();
  };

  const handleItemClick = (n) => {
    if (n.link) {
      navigate(n.link);
    }
  };

  const filteredNotifs = filter === 'All'
    ? notifications
    : filter === 'Unread'
    ? notifications.filter(n => !n.is_read && !n.isRead)
    : notifications.filter(n => n.type === filter.toLowerCase());

  const unreadCount = notifications.filter(n => !n.is_read && !n.isRead).length;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main notifications-page">
        <header className="page-header">
          <div>
            <h1>🔔 Notifications Center</h1>
            <p>Real-time updates regarding your listed resources, booking requests, and negotiation offers.</p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn-secondary-action"
              onClick={handleMarkAllRead}
            >
              ✓ Mark All as Read
            </button>
          )}
        </header>

        {/* Tab Filters */}
        <section className="table-controls-row">
          <div className="tab-pills">
            {['All', 'Unread', 'Request', 'Negotiation', 'Booking'].map(t => (
              <button
                key={t}
                type="button"
                className={`tab-pill ${filter === t ? 'active' : ''}`}
                onClick={() => setFilter(t)}
              >
                {t} {t === 'Unread' && unreadCount > 0 && `(${unreadCount})`}
              </button>
            ))}
          </div>
        </section>

        {/* Notifications List */}
        <section className="notifications-list-container">
          {filteredNotifs.length > 0 ? (
            filteredNotifs.map(n => {
              const isUnread = !n.is_read && !n.isRead;
              return (
                <div
                  key={n.id}
                  className={`notif-card ${isUnread ? 'unread' : ''}`}
                  onClick={() => handleItemClick(n)}
                >
                  <div className={`notif-icon-bubble ${n.type || 'info'}`}>
                    {n.type === 'request' && <Icon name="incoming" />}
                    {n.type === 'success' && <Icon name="check" />}
                    {n.type === 'negotiation' && <Icon name="chat" />}
                    {n.type === 'booking' && <Icon name="calendar" />}
                    {!n.type && <Icon name="bell" />}
                  </div>

                  <div className="notif-content">
                    <div className="notif-top">
                      <h4>{n.title}</h4>
                      <span className="notif-time">{n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (n.time || 'Today')}</span>
                    </div>
                    <p>{n.message}</p>
                  </div>

                  <div className="notif-actions-col">
                    {isUnread && <span className="unread-dot" title="Unread"></span>}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state-box">
              <Icon name="bell" />
              <h3>All Caught Up!</h3>
              <p>You have no notifications in this filter category.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
