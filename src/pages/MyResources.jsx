import { useEffect, useMemo, useState } from 'react';
import Sidebar, { Icon } from '../components/Sidebar';
import { api } from '../api';

const blankResource = {
  name: '',
  category: 'Furniture',
  quantity: '',
  unit: 'Units',
  price: '',
  priceUnit: 'day',
  availableFrom: '',
  availableTo: '',
  location: 'Shivajinagar, Pune',
  status: 'Available'
};

export default function MyResources() {
  const [resources, setResources] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(blankResource);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadMyResources = async () => {
    const list = await api.getResources({ mine: true });
    setResources(list);
  };

  useEffect(() => {
    loadMyResources();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const item = {
      ...formData,
      id: editingId || `res-${Date.now()}`,
      quantity: Number(formData.quantity),
      price: Number(formData.price),
      createdAt: new Date().toISOString()
    };

    await api.createResource(item);
    setShowModal(false);
    setFormData(blankResource);
    setEditingId(null);
    loadMyResources();
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this resource listing from the live database?')) {
      await api.deleteResource(id);
      loadMyResources();
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'Available' ? 'Booked' : item.status === 'Booked' ? 'Unavailable' : 'Available';
    await api.createResource({ ...item, status: nextStatus });
    loadMyResources();
  };

  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const matchesFilter = filter === 'All' || (r.status || 'Available').toLowerCase() === filter.toLowerCase();
      const matchesSearch = (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (r.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (r.location || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [resources, filter, searchTerm]);

  const availableCount = resources.filter(r => (r.status || 'Available') === 'Available').length;
  const bookedCount = resources.filter(r => r.status === 'Booked').length;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main my-resources-page">
        <header className="page-header">
          <div>
            <h1>📦 My Resources</h1>
            <p>Manage your hotel inventory, set rental rates, and track availability for other hospitality businesses.</p>
          </div>
          <button
            type="button"
            className="btn-primary-action"
            onClick={() => {
              setFormData(blankResource);
              setEditingId(null);
              setShowModal(true);
            }}
          >
            <Icon name="cube" />
            <span>+ Add Resource</span>
          </button>
        </header>

        {/* Quick Inventory Metrics */}
        <section className="inventory-stats-bar">
          <div className="inv-stat">
            <span>Total Listed Items</span>
            <strong>{resources.length}</strong>
          </div>
          <div className="inv-stat green">
            <span>🟢 Available for Rent</span>
            <strong>{availableCount}</strong>
          </div>
          <div className="inv-stat orange">
            <span>🟡 Currently Booked</span>
            <strong>{bookedCount}</strong>
          </div>
          <div className="inv-stat blue">
            <span>Daily Earning Potential</span>
            <strong>₹{resources.reduce((sum, r) => sum + (Number(r.price) || 0), 0).toLocaleString()}</strong>
          </div>
        </section>

        {/* Filter and Search controls */}
        <section className="table-controls-row">
          <div className="tab-pills">
            {['All', 'Available', 'Booked', 'Unavailable'].map(t => (
              <button
                key={t}
                type="button"
                className={`tab-pill ${filter === t ? 'active' : ''}`}
                onClick={() => setFilter(t)}
              >
                {t === 'Available' && '🟢 '}
                {t === 'Booked' && '🟡 '}
                {t === 'Unavailable' && '🔴 '}
                {t} ({t === 'All' ? resources.length : resources.filter(r => (r.status || 'Available').toLowerCase() === t.toLowerCase()).length})
              </button>
            ))}
          </div>
          <div className="search-box">
            <input
              placeholder="Search resource name, category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </section>

        {/* Resources Data Table */}
        <section className="table-wrapper">
          <table className="custom-data-table">
            <thead>
              <tr>
                <th>Resource Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Rental Price</th>
                <th>Availability Window</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.length > 0 ? (
                filteredResources.map(r => (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.name}</strong>
                    </td>
                    <td>
                      <span className="category-pill">{r.category}</span>
                    </td>
                    <td>
                      {r.quantity} {r.unit || 'Units'}
                    </td>
                    <td>
                      <strong className="table-price">₹{Number(r.price).toLocaleString()}</strong>
                      <small>/{r.price_unit || r.priceUnit || 'day'}</small>
                    </td>
                    <td>
                      <span className="date-range-text">
                        {r.available_from || r.availableFrom ? `${r.available_from || r.availableFrom} → ${r.available_to || r.availableTo}` : 'Ongoing Availability'}
                      </span>
                    </td>
                    <td>{r.location || 'Pune'}</td>
                    <td>
                      <button
                        type="button"
                        className={`status-badge-btn ${(r.status || 'Available').toLowerCase()}`}
                        title="Click to toggle status"
                        onClick={() => handleToggleStatus(r)}
                      >
                        {(r.status || 'Available') === 'Available' && '🟢 '}
                        {r.status === 'Booked' && '🟡 '}
                        {r.status === 'Unavailable' && '🔴 '}
                        {r.status || 'Available'}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button type="button" className="btn-icon-action" onClick={() => handleEdit(r)} title="Edit Resource">
                          ✎
                        </button>
                        <button type="button" className="btn-icon-action delete" onClick={() => handleDelete(r.id)} title="Delete Resource">
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-table-cell">
                    <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                      <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        📦 You haven't added any hospitality resources yet.
                      </p>
                      <button
                        type="button"
                        className="btn-primary-action"
                        style={{ display: 'inline-flex' }}
                        onClick={() => {
                          setFormData(blankResource);
                          setEditingId(null);
                          setShowModal(true);
                        }}
                      >
                        + List Your First Resource
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>

      {/* Add / Edit Resource Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Resource Listing' : '+ Add New Resource Listing'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <label>
                <span>Resource Name *</span>
                <input
                  required
                  placeholder="e.g. 200 Banquet Chiavari Chairs"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </label>

              <div className="form-row-2">
                <label>
                  <span>Category</span>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option>Furniture</option>
                    <option>AV & Sound</option>
                    <option>Kitchen Equipment</option>
                    <option>Banquet Space</option>
                    <option>Tableware</option>
                    <option>Stage & Decor</option>
                  </select>
                </label>
                <label>
                  <span>Quantity & Unit</span>
                  <div className="qty-unit-row">
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={formData.quantity}
                      onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    />
                    <select
                      value={formData.unit}
                      onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    >
                      <option>Chairs</option>
                      <option>Tables</option>
                      <option>Units</option>
                      <option>Sets</option>
                      <option>Hall</option>
                    </select>
                  </div>
                </label>
              </div>

              <div className="form-row-2">
                <label>
                  <span>Rent Price (₹ per day) *</span>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="₹ Amount"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                  />
                </label>
                <label>
                  <span>Status</span>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option>Available</option>
                    <option>Booked</option>
                    <option>Unavailable</option>
                  </select>
                </label>
              </div>

              <div className="form-row-2">
                <label>
                  <span>Available From</span>
                  <input
                    type="date"
                    value={formData.availableFrom || formData.available_from}
                    onChange={e => setFormData({ ...formData, availableFrom: e.target.value })}
                  />
                </label>
                <label>
                  <span>Available To</span>
                  <input
                    type="date"
                    value={formData.availableTo || formData.available_to}
                    onChange={e => setFormData({ ...formData, availableTo: e.target.value })}
                  />
                </label>
              </div>

              <label>
                <span>Location / Venue Address</span>
                <input
                  placeholder="e.g. Shivajinagar, Pune"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingId ? 'Save Changes' : 'Publish Resource'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
