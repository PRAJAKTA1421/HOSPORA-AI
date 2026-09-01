import { useEffect, useMemo, useState } from 'react';
import Sidebar, { Icon } from '../components/Sidebar';
import { api } from '../api';

const filters = ['All Bookings', 'Upcoming', 'Confirmed', 'Completed', 'Cancelled'];

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('All Bookings');
  const [viewMode, setViewMode] = useState('calendar'); // 'list' or 'calendar'
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 8, 1)); // September 2026

  useEffect(() => {
    api.getBookings().then(setBookings);
  }, []);

  const visibleBookings = useMemo(() => {
    if (filter === 'All Bookings') return bookings;
    return bookings.filter(b => (b.status || 'Upcoming').toLowerCase() === filter.toLowerCase());
  }, [bookings, filter]);

  // Calendar calculations
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const monthName = calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push({ dayNumber: '', isBlank: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayBookings = bookings.filter(b => b.date === dateStr || (b.date && b.date.includes(String(d))));
    calendarDays.push({ dayNumber: d, dateStr, dayBookings, isBlank: false });
  }

  const prevMonth = () => setCalendarMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCalendarMonth(new Date(year, month + 1, 1));

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main bookings-page">
        <header className="page-header">
          <div>
            <h1>📅 Confirmed Bookings & Schedule</h1>
            <p>Track all scheduled resource exchanges with automated double-booking prevention.</p>
          </div>
          <div className="view-toggle-pills">
            <button
              type="button"
              className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              📅 Calendar View
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 List View
            </button>
          </div>
        </header>

        {/* Status Filters */}
        <section className="table-controls-row">
          <div className="tab-pills">
            {filters.map(t => {
              const count = t === 'All Bookings' ? bookings.length : bookings.filter(b => (b.status || 'Upcoming').toLowerCase() === t.toLowerCase()).length;
              return (
                <button
                  key={t}
                  type="button"
                  className={`tab-pill ${filter === t ? 'active' : ''}`}
                  onClick={() => setFilter(t)}
                >
                  {t} ({count})
                </button>
              );
            })}
          </div>
        </section>

        {/* CALENDAR VIEW */}
        {viewMode === 'calendar' ? (
          <section className="calendar-container">
            <div className="calendar-header-bar">
              <div className="cal-nav">
                <button type="button" onClick={prevMonth} className="btn-cal-arrow">‹</button>
                <h2>{monthName}</h2>
                <button type="button" onClick={nextMonth} className="btn-cal-arrow">›</button>
              </div>
              <div className="calendar-legend">
                <span className="legend-item"><i className="dot upcoming"></i> Upcoming</span>
                <span className="legend-item"><i className="dot confirmed"></i> Confirmed</span>
                <span className="legend-item"><i className="dot completed"></i> Completed</span>
                <span className="legend-item conflict-tag">✓ Conflict-Free Ledger</span>
              </div>
            </div>

            <div className="calendar-grid">
              <div className="cal-day-header">Sun</div>
              <div className="cal-day-header">Mon</div>
              <div className="cal-day-header">Tue</div>
              <div className="cal-day-header">Wed</div>
              <div className="cal-day-header">Thu</div>
              <div className="cal-day-header">Fri</div>
              <div className="cal-day-header">Sat</div>

              {calendarDays.map((cell, idx) => (
                <div
                  key={idx}
                  className={`cal-day-cell ${cell.isBlank ? 'blank' : ''} ${cell.dayBookings?.length > 0 ? 'has-events' : ''}`}
                >
                  {!cell.isBlank && (
                    <>
                      <div className="day-number-row">
                        <span className="day-num">{cell.dayNumber}</span>
                        {cell.dayBookings?.length > 1 && (
                          <span className="multi-badge">{cell.dayBookings.length} Events</span>
                        )}
                      </div>
                      <div className="day-events-container">
                        {cell.dayBookings?.map(b => (
                          <div
                            key={b.id}
                            className={`cal-event-chip ${(b.status || 'upcoming').toLowerCase()}`}
                            onClick={() => setSelectedBooking(b)}
                            title={`${b.resource_name || b.resource} - ${b.booked_by}`}
                          >
                            <strong>{(b.resource_name || b.resource || '').split('(')[0]}</strong>
                            <small>{b.booked_by}</small>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : (
          /* LIST VIEW */
          <section className="table-wrapper">
            <table className="custom-data-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Category</th>
                  <th>Booked By</th>
                  <th>Provider</th>
                  <th>Date & Time</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleBookings.length > 0 ? (
                  visibleBookings.map(b => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.resource_name || b.resource}</strong>
                      </td>
                      <td>
                        <span className="category-pill">{b.category || 'General'}</span>
                      </td>
                      <td>
                        <strong>{b.booked_by}</strong>
                        <small className="table-sub">{b.city || 'Pune'}</small>
                      </td>
                      <td>{b.provider}</td>
                      <td>
                        <strong>📅 {b.date}</strong>
                        <small className="table-sub">{b.time || 'All Day'}</small>
                      </td>
                      <td>{b.quantity}</td>
                      <td>
                        <strong className="table-price">{b.total_amount || b.totalAmount}</strong>
                      </td>
                      <td>
                        <span className={`status-pill ${(b.status || 'Upcoming').toLowerCase()}`}>
                          {b.status || 'Upcoming'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-view-details"
                          onClick={() => setSelectedBooking(b)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="empty-table-cell">
                      <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
                          📅 No scheduled bookings yet. Bookings will appear once incoming requests are accepted or resource requests are confirmed.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-pill">
                <h3>Booking Confirmation Details</h3>
                <span className={`status-pill ${(selectedBooking.status || 'Upcoming').toLowerCase()}`}>
                  {selectedBooking.status || 'Upcoming'}
                </span>
              </div>
              <button className="close-btn" onClick={() => setSelectedBooking(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="request-summary-box">
                <div className="summary-line"><span>Resource:</span> <strong>{selectedBooking.resource_name || selectedBooking.resource}</strong></div>
                <div className="summary-line"><span>Category:</span> <strong>{selectedBooking.category || 'Furniture'}</strong></div>
                <div className="summary-line"><span>Booked By:</span> <strong>{selectedBooking.booked_by}</strong></div>
                <div className="summary-line"><span>Provider:</span> <strong>{selectedBooking.provider}</strong></div>
                <div className="summary-line"><span>Date & Schedule:</span> <strong>📅 {selectedBooking.date} ({selectedBooking.time || 'All Day'})</strong></div>
                <div className="summary-line"><span>Quantity:</span> <strong>{selectedBooking.quantity}</strong></div>
                <div className="summary-line highlight"><span>Total Paid/Agreed:</span> <strong>{selectedBooking.total_amount || selectedBooking.totalAmount}</strong></div>
              </div>

              <div className="partner-trust-box">
                <Icon name="shield" />
                <div>
                  <strong>Conflict-Free Verified Booking</strong>
                  <p>Inventory is reserved and locked on the Hospora SQLite ledger. Contact partner directly for logistics handoff.</p>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setSelectedBooking(null)}>Close</button>
                <button type="button" className="btn-primary" onClick={() => setSelectedBooking(null)}>Download Gate Pass PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
