// Hospora Multi-Tenant Cross-User Sync Engine
const API_BASE = '/api';

function getActiveUser() {
  try {
    const raw = localStorage.getItem('hospora_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeName(str) {
  return (str || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getAuthHeaders() {
  const token = localStorage.getItem('hospora_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function safeFetchJson(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let json = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { raw: text };
    }
    return { ok: res.ok, status: res.status, data: json };
  } catch (err) {
    return { ok: false, error: err.message, networkError: true };
  }
}

// Global Shared Marketplace Resources Pool
function getGlobalMarketplace() {
  try {
    const custom = JSON.parse(localStorage.getItem('hospora_global_marketplace'));
    if (Array.isArray(custom)) return custom;
  } catch { /* ignore */ }

  const initial = [
    { id: 'm-green-1', user_id: 'u-green', business_name: 'Hotel Green', name: 'Banquet Chiavari Chairs', category: 'Furniture', quantity: 200, unit: 'Chairs', price: 20, price_unit: 'day', available_from: '2026-09-10', available_to: '2026-09-30', location: 'Koregaon Park, Pune', distance_km: 3.2, status: 'Available' },
    { id: 'm-sayaji-1', user_id: 'u-sayaji', business_name: 'Sayaji Banquets', name: 'Grand Ballroom & 50 Round Dining Tables', category: 'Banquet Space', quantity: 1, unit: 'Hall', price: 18000, price_unit: 'day', available_from: '2026-09-12', available_to: '2026-09-28', location: 'Wakad, Pune', distance_km: 8.4, status: 'Available' },
    { id: 'm-novotel-1', user_id: 'u-novotel', business_name: 'Novotel Pune', name: '4K Laser Projector & Screen', category: 'AV & Sound', quantity: 2, unit: 'Units', price: 1400, price_unit: 'day', available_from: '2026-09-15', available_to: '2026-09-25', location: 'Kalyani Nagar, Pune', distance_km: 4.2, status: 'Available' },
    { id: 'm-orchid-1', user_id: 'u-orchid', business_name: 'Royal Orchid Banquets', name: 'Commercial Bain Marie Warmers', category: 'Kitchen Equipment', quantity: 4, unit: 'Units', price: 700, price_unit: 'day', available_from: '2026-09-08', available_to: '2026-09-30', location: 'Viman Nagar, Pune', distance_km: 4.8, status: 'Available' }
  ];
  localStorage.setItem('hospora_global_marketplace', JSON.stringify(initial));
  return initial;
}

function addToGlobalMarketplace(resource) {
  const all = getGlobalMarketplace();
  const next = [resource, ...all.filter(r => r.id !== resource.id)];
  localStorage.setItem('hospora_global_marketplace', JSON.stringify(next));
}

function removeFromGlobalMarketplace(id) {
  const all = getGlobalMarketplace();
  const next = all.filter(r => r.id !== id);
  localStorage.setItem('hospora_global_marketplace', JSON.stringify(next));
}

// Global Shared Incoming Requests Ledger (ensures Provider immediately receives requests from Any Seeker)
function getGlobalIncoming() {
  try {
    return JSON.parse(localStorage.getItem('hospora_global_incoming_ledger')) || [];
  } catch {
    return [];
  }
}

function saveGlobalIncoming(list) {
  localStorage.setItem('hospora_global_incoming_ledger', JSON.stringify(list));
}

// Global Shared Negotiations Ledger
function getGlobalNegotiations() {
  try {
    return JSON.parse(localStorage.getItem('hospora_global_negotiations_ledger')) || [];
  } catch {
    return [];
  }
}

function saveGlobalNegotiations(list) {
  localStorage.setItem('hospora_global_negotiations_ledger', JSON.stringify(list));
}

// Global Shared Bookings Ledger
function getGlobalBookings() {
  try {
    return JSON.parse(localStorage.getItem('hospora_global_bookings_ledger')) || [];
  } catch {
    return [];
  }
}

function saveGlobalBookings(list) {
  localStorage.setItem('hospora_global_bookings_ledger', JSON.stringify(list));
}

// Global Shared Notifications Ledger
function getGlobalNotifications() {
  try {
    return JSON.parse(localStorage.getItem('hospora_global_notifications_ledger')) || [];
  } catch {
    return [];
  }
}

function saveGlobalNotifications(list) {
  localStorage.setItem('hospora_global_notifications_ledger', JSON.stringify(list));
}

// User-scoped storage helper
function getUserKey(user, suffix) {
  const u = user || getActiveUser();
  const key = u?.id || u?.email || normalizeName(u?.businessName) || 'guest';
  return `hospora_${key}_${suffix}`;
}

export const api = {
  // ==========================================
  // AUTHENTICATION
  // ==========================================
  async register(data) {
    const bname = (data.businessName || '').trim();
    const oname = (data.ownerName || bname || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const password = data.password || '';
    const city = (data.city || 'Pune').trim();
    const phone = (data.phone || '').trim();
    const businessType = data.businessType || 'Hotel & Banquets';

    if (!bname || !email || password.length < 6) {
      throw new Error('Business name, valid email, and a password of at least 6 characters are required.');
    }

    // Attempt live backend SQLite API
    const res = await safeFetchJson(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName: bname, ownerName: oname, email, password, city, phone, businessType })
    });

    if (res.ok && res.data?.token) {
      localStorage.setItem('hospora_token', res.data.token);
      if (res.data.user) localStorage.setItem('hospora_user', JSON.stringify(res.data.user));
      return res.data;
    }

    if (!res.ok && !res.networkError && res.data?.error) {
      throw new Error(res.data.error);
    }

    // Local user store
    let users = [];
    try { users = JSON.parse(localStorage.getItem('hospora_users_db')) || []; } catch { /* ignore */ }

    let existing = users.find(u => u.email === email || normalizeName(u.businessName) === normalizeName(bname));
    if (existing) {
      // Allow re-login if existing
      const token = `token-${Date.now()}`;
      localStorage.setItem('hospora_token', token);
      localStorage.setItem('hospora_user', JSON.stringify(existing));
      return { token, user: existing };
    }

    const newUser = {
      id: `u-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      businessName: bname,
      ownerName: oname,
      email,
      phone,
      city,
      businessType,
      isVerified: true,
      password,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('hospora_users_db', JSON.stringify(users));

    const token = `token-${Date.now()}`;
    localStorage.setItem('hospora_token', token);
    localStorage.setItem('hospora_user', JSON.stringify(newUser));

    return { token, user: newUser };
  },

  async login(emailInput, passwordInput) {
    const email = (emailInput || '').trim().toLowerCase();
    const password = passwordInput || '';

    // Attempt backend SQLite
    const res = await safeFetchJson(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (res.ok && res.data?.token) {
      localStorage.setItem('hospora_token', res.data.token);
      if (res.data.user) localStorage.setItem('hospora_user', JSON.stringify(res.data.user));
      return res.data;
    }

    if (!res.ok && !res.networkError && res.data?.error) {
      throw new Error(res.data.error);
    }

    // Local login check
    let users = [];
    try { users = JSON.parse(localStorage.getItem('hospora_users_db')) || []; } catch { /* ignore */ }
    let found = users.find(u => u.email === email && u.password === password);

    if (!found) {
      // Auto create recognized test business
      const bname = email.includes('paras') ? 'HOTEL PARAS' : email.includes('aditya') ? 'Hotel Aditya' : email.includes('taj') ? 'Hotel Taj' : 'My Hospitality Business';
      found = {
        id: `u-${normalizeName(bname)}`,
        businessName: bname,
        ownerName: 'Business Owner',
        email,
        city: 'Pune',
        businessType: 'Hotel & Banquets',
        isVerified: true
      };
      users.push(found);
      localStorage.setItem('hospora_users_db', JSON.stringify(users));
    }

    const token = `token-${Date.now()}`;
    localStorage.setItem('hospora_token', token);
    localStorage.setItem('hospora_user', JSON.stringify(found));
    return { token, user: found };
  },

  async getMe() {
    // 1. Try backend
    const res = await safeFetchJson(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });
    if (res.ok && res.data?.user) {
      localStorage.setItem('hospora_user', JSON.stringify(res.data.user));
      return res.data;
    }

    const user = getActiveUser() || {
      id: 'u-paras',
      businessName: 'HOTEL PARAS',
      ownerName: 'Prajakta Patil',
      email: 'prajaktapatil140706@gmail.com',
      city: 'Pune',
      isVerified: true
    };

    const myRes = await this.getResources({ mine: true });
    const myReq = await this.getRequests();
    const myInc = await this.getIncoming();
    const myBk = await this.getBookings();
    const myNeg = await this.getNegotiations();
    const myNotifs = await this.getNotifications();

    return {
      user,
      stats: {
        resources: myRes.length,
        activeRequests: myReq.filter(r => r.status !== 'Rejected').length,
        incomingRequests: myInc.filter(r => r.status === 'Pending').length,
        bookings: myBk.filter(b => b.status === 'Upcoming' || b.status === 'Confirmed').length,
        negotiations: myNeg.filter(n => n.status === 'In Negotiation').length,
        notifications: myNotifs.filter(n => !n.is_read && !n.isRead).length
      }
    };
  },

  async logout() {
    await safeFetchJson(`${API_BASE}/auth/logout`, { method: 'POST', headers: getAuthHeaders() });
    localStorage.removeItem('hospora_token');
    localStorage.removeItem('hospora_user');
  },

  // ==========================================
  // RESOURCES (MY RESOURCES & MARKETPLACE)
  // ==========================================
  async getResources(params = {}) {
    const user = getActiveUser();
    const myNorm = normalizeName(user?.businessName);

    // 1. Try backend
    const query = new URLSearchParams(params).toString();
    const res = await safeFetchJson(`${API_BASE}/resources?${query}`, { headers: getAuthHeaders() });
    if (res.ok && Array.isArray(res.data?.resources) && res.data.resources.length > 0) {
      return res.data.resources;
    }

    // 2. Local check: get resources owned by this specific hotel
    const personalKey = getUserKey(user, 'resources');
    const personal = JSON.parse(localStorage.getItem(personalKey) || '[]');
    if (personal.length > 0) return personal;

    // Or check global marketplace for items listed by this hotel name
    const allMarket = getGlobalMarketplace();
    return allMarket.filter(r => normalizeName(r.business_name) === myNorm);
  },

  async createResource(resourceData) {
    const user = getActiveUser();
    const bname = user?.businessName || 'My Hotel';
    const item = {
      ...resourceData,
      id: resourceData.id || `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: user?.id || `u-${normalizeName(bname)}`,
      business_name: bname,
      location: resourceData.location || user?.city || 'Pune',
      createdAt: new Date().toISOString()
    };

    // Save to user's personal inventory
    const personalKey = getUserKey(user, 'resources');
    const current = JSON.parse(localStorage.getItem(personalKey) || '[]');
    const next = [item, ...current.filter(r => r.id !== item.id)];
    localStorage.setItem(personalKey, JSON.stringify(next));

    // Also publish into the global marketplace so ALL other hotels (e.g. Hotel Aditya) can find and request it!
    addToGlobalMarketplace(item);

    // Try backend SQLite sync
    safeFetchJson(`${API_BASE}/resources`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item)
    });

    return { status: 'ok', id: item.id };
  },

  async deleteResource(id) {
    const user = getActiveUser();
    const personalKey = getUserKey(user, 'resources');
    const current = JSON.parse(localStorage.getItem(personalKey) || '[]');
    localStorage.setItem(personalKey, JSON.stringify(current.filter(r => r.id !== id)));
    removeFromGlobalMarketplace(id);

    safeFetchJson(`${API_BASE}/resources/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    return { status: 'ok' };
  },

  // ==========================================
  // REQUESTS (SEEKER ORDERS) & INCOMING SYNC
  // ==========================================
  async getRequests() {
    const user = getActiveUser();
    const myNorm = normalizeName(user?.businessName);

    // 1. Try backend
    const res = await safeFetchJson(`${API_BASE}/requests`, { headers: getAuthHeaders() });
    if (res.ok && Array.isArray(res.data?.requests)) {
      return res.data.requests;
    }

    // 2. Local check
    const personalKey = getUserKey(user, 'requirements');
    const personal = JSON.parse(localStorage.getItem(personalKey) || '[]');
    return personal;
  },

  async createRequest(requestData) {
    const user = getActiveUser();
    const seekerName = user?.businessName || 'Hotel Aditya';
    const seekerId = user?.id || `u-${normalizeName(seekerName)}`;
    const providerName = requestData.provider_name || requestData.provider || 'HOTEL PARAS';
    const reqId = requestData.id || `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const incId = `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // 1. Create Seeker's Request Record
    const reqItem = {
      ...requestData,
      id: reqId,
      seeker_id: seekerId,
      seeker_name: seekerName,
      provider_name: providerName,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    // Save to Seeker's personal list
    const seekerKey = getUserKey(user, 'requirements');
    const seekerCurrent = JSON.parse(localStorage.getItem(seekerKey) || '[]');
    localStorage.setItem(seekerKey, JSON.stringify([reqItem, ...seekerCurrent]));

    // 2. Create Target Provider's Incoming Request Record (HOTEL PARAS)
    const rateStr = requestData.quantity ? `₹${Math.round((Number(requestData.budget) || 5000) / Number(requestData.quantity))}/unit/day` : 'Custom';
    const incItem = {
      id: incId,
      request_id: reqId,
      provider_name: providerName,
      requester_id: seekerId,
      requester_name: seekerName,
      city: requestData.location || user?.city || 'Pune',
      resource_id: requestData.resource_id,
      resource_name: requestData.resource || requestData.resource_name || 'Hall & Chairs',
      category: requestData.category || 'Banquet Space & Furniture',
      quantity: Number(requestData.quantity) || 1,
      date: requestData.date || requestData.date_needed || '2026-09-15',
      days: '1-2 Days',
      price: `₹${Number(requestData.budget || 5000).toLocaleString()}`,
      rate: rateStr,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    // Append to Global Shared Incoming Ledger
    const allIncoming = getGlobalIncoming();
    saveGlobalIncoming([incItem, ...allIncoming]);

    // Also add to provider's personal storage key if known
    const targetKey = `hospora_${normalizeName(providerName)}_incoming`;
    const targetList = JSON.parse(localStorage.getItem(targetKey) || '[]');
    localStorage.setItem(targetKey, JSON.stringify([incItem, ...targetList]));

    // 3. Create Realtime Notification for Provider (HOTEL PARAS)
    const notifItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      target_user_name: providerName,
      title: `New Request from ${seekerName}! 📥`,
      message: `${seekerName} requested ${incItem.quantity} ${incItem.resource_name} for ${incItem.date} (${incItem.price}).`,
      type: 'request',
      link: '/incoming-requests',
      is_read: 0,
      createdAt: new Date().toISOString()
    };
    const allNotifs = getGlobalNotifications();
    saveGlobalNotifications([notifItem, ...allNotifs]);

    // 4. Try backend SQLite sync
    safeFetchJson(`${API_BASE}/requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reqItem)
    });

    return { status: 'ok', id: reqId, incomingId: incId };
  },

  // ==========================================
  // INCOMING REQUESTS (PROVIDER INBOX)
  // ==========================================
  async getIncoming() {
    const user = getActiveUser();
    const myNorm = normalizeName(user?.businessName);

    // 1. Try backend
    const res = await safeFetchJson(`${API_BASE}/incoming`, { headers: getAuthHeaders() });
    if (res.ok && Array.isArray(res.data?.incoming) && res.data.incoming.length > 0) {
      return res.data.incoming;
    }

    // 2. Global Shared Ledger Lookup: match requests where provider is this hotel (HOTEL PARAS)
    const allIncoming = getGlobalIncoming();
    const matching = allIncoming.filter(r => {
      const pNorm = normalizeName(r.provider_name);
      return pNorm === myNorm || pNorm.includes(myNorm) || myNorm.includes(pNorm);
    });

    // Also check provider's personal key
    const personalKey = `hospora_${myNorm}_incoming`;
    const personal = JSON.parse(localStorage.getItem(personalKey) || '[]');

    const combined = [...matching];
    for (const item of personal) {
      if (!combined.some(c => c.id === item.id)) {
        combined.push(item);
      }
    }

    return combined;
  },

  async updateIncoming(id, status) {
    const user = getActiveUser();
    const myNorm = normalizeName(user?.businessName);

    // 1. Update Global Incoming Ledger
    const allIncoming = getGlobalIncoming();
    const target = allIncoming.find(r => r.id === id);
    const updatedIncoming = allIncoming.map(r => r.id === id ? { ...r, status } : r);
    saveGlobalIncoming(updatedIncoming);

    // 2. Update provider's local key
    const personalKey = `hospora_${myNorm}_incoming`;
    const personal = JSON.parse(localStorage.getItem(personalKey) || '[]');
    localStorage.setItem(personalKey, JSON.stringify(personal.map(r => r.id === id ? { ...r, status } : r)));

    if (target && status === 'Confirmed') {
      // 3. Create Confirmed Booking for BOTH Provider (HOTEL PARAS) and Seeker (Hotel Aditya)
      const newBk = {
        id: `bk-${Date.now()}`,
        resource_name: target.resource_name,
        category: target.category || 'Banquet Space & Furniture',
        quantity: `${target.quantity} Units`,
        booked_by: target.requester_name,
        provider: user?.businessName || target.provider_name,
        city: target.city || 'Pune',
        date: target.date || '2026-09-15',
        time: '09:00 AM - 10:00 PM',
        total_amount: target.price,
        status: 'Upcoming',
        createdAt: new Date().toISOString()
      };

      const allBookings = getGlobalBookings();
      saveGlobalBookings([newBk, ...allBookings]);

      // 4. Update Seeker's request status in Seeker's personal list to 'Accepted'
      const seekerNorm = normalizeName(target.requester_name);
      const seekerReqKey = `hospora_${seekerNorm}_requirements`;
      const seekerReqs = JSON.parse(localStorage.getItem(seekerReqKey) || '[]');
      localStorage.setItem(seekerReqKey, JSON.stringify(
        seekerReqs.map(r => (r.id === target.request_id || r.resource === target.resource_name) ? { ...r, status: 'Accepted' } : r)
      ));

      // 5. Notify Seeker that request was accepted
      const notifItem = {
        id: `notif-${Date.now()}`,
        target_user_name: target.requester_name,
        title: `Request Accepted! 🟢`,
        message: `${user?.businessName || 'HOTEL PARAS'} accepted your request for ${target.resource_name}. Confirmed in Bookings.`,
        type: 'booking',
        link: '/bookings',
        is_read: 0,
        createdAt: new Date().toISOString()
      };
      saveGlobalNotifications([notifItem, ...getGlobalNotifications()]);
    }

    safeFetchJson(`${API_BASE}/incoming/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    return { status: 'ok' };
  },

  // ==========================================
  // NEGOTIATIONS
  // ==========================================
  async getNegotiations() {
    const user = getActiveUser();
    const myNorm = normalizeName(user?.businessName);

    // 1. Try backend
    const res = await safeFetchJson(`${API_BASE}/negotiations`, { headers: getAuthHeaders() });
    if (res.ok && Array.isArray(res.data?.negotiations) && res.data.negotiations.length > 0) {
      return res.data.negotiations;
    }

    // 2. Global Shared Negotiations Ledger
    const allNegs = getGlobalNegotiations();
    return allNegs.filter(n => {
      const pNorm = normalizeName(n.provider_name);
      const sNorm = normalizeName(n.seeker_name);
      return pNorm === myNorm || sNorm === myNorm;
    });
  },

  async startNegotiation(incomingItem) {
    const user = getActiveUser();
    const negId = `neg-${Date.now()}`;
    const newNeg = {
      id: negId,
      request_id: incomingItem.request_id,
      provider_name: incomingItem.provider_name,
      seeker_name: incomingItem.requester_name,
      resource_name: incomingItem.resource_name,
      quantity: incomingItem.quantity,
      listed_price: parseInt(incomingItem.price.replace(/[^0-9]/g, '')) || 5000,
      their_offer: parseInt(incomingItem.price.replace(/[^0-9]/g, '')) || 4000,
      current_offer: parseInt(incomingItem.price.replace(/[^0-9]/g, '')) || 4500,
      status: 'In Negotiation',
      role: normalizeName(user?.businessName) === normalizeName(incomingItem.provider_name) ? 'Provider' : 'Seeker',
      last_message: `${user?.businessName || 'Provider'} opened negotiation room.`,
      messages: [
        {
          id: `m-1`,
          sender: incomingItem.requester_name,
          text: `Hello ${incomingItem.provider_name}! We sent a request for ${incomingItem.quantity} ${incomingItem.resource_name} at ${incomingItem.price}. Can we finalize?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOffer: true,
          amount: parseInt(incomingItem.price.replace(/[^0-9]/g, '')) || 4000
        }
      ],
      updatedAt: new Date().toISOString()
    };

    const allNegs = getGlobalNegotiations();
    saveGlobalNegotiations([newNeg, ...allNegs.filter(n => n.id !== negId)]);
    return newNeg;
  },

  async sendNegotiationMessage(id, data) {
    const user = getActiveUser();
    const senderName = user?.businessName || 'Hotel Member';
    const allNegs = getGlobalNegotiations();

    const updated = allNegs.map(n => {
      if (n.id === id) {
        const msgs = n.messages || [];
        const newMsg = {
          id: `m-${Date.now()}`,
          sender: senderName,
          text: data.text || '',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOffer: !!data.isOffer,
          amount: data.amount
        };
        return {
          ...n,
          messages: [...msgs, newMsg],
          current_offer: data.isOffer ? data.amount : n.current_offer,
          last_message: `${senderName}: "${data.text}"`,
          updatedAt: new Date().toISOString()
        };
      }
      return n;
    });

    saveGlobalNegotiations(updated);
    safeFetchJson(`${API_BASE}/negotiations/${id}/message`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return { status: 'ok' };
  },

  async acceptNegotiation(id) {
    const user = getActiveUser();
    const allNegs = getGlobalNegotiations();
    const target = allNegs.find(n => n.id === id);

    const updated = allNegs.map(n => n.id === id ? { ...n, status: 'Accepted' } : n);
    saveGlobalNegotiations(updated);

    if (target) {
      const finalPrice = `₹${Number(target.current_offer || 4500).toLocaleString()}`;
      const newBk = {
        id: `bk-${Date.now()}`,
        resource_name: target.resource_name,
        category: 'Banquet Space & Furniture',
        quantity: `${target.quantity} Units`,
        booked_by: target.seeker_name,
        provider: target.provider_name,
        city: 'Pune',
        date: '2026-09-15',
        time: '09:00 AM - 10:00 PM',
        total_amount: finalPrice,
        status: 'Upcoming',
        createdAt: new Date().toISOString()
      };
      saveGlobalBookings([newBk, ...getGlobalBookings()]);
    }

    safeFetchJson(`${API_BASE}/negotiations/${id}/accept`, { method: 'POST', headers: getAuthHeaders() });
    return { status: 'ok' };
  },

  // ==========================================
  // BOOKINGS
  // ==========================================
  async getBookings() {
    const user = getActiveUser();
    const myNorm = normalizeName(user?.businessName);

    // 1. Try backend
    const res = await safeFetchJson(`${API_BASE}/bookings`, { headers: getAuthHeaders() });
    if (res.ok && Array.isArray(res.data?.bookings) && res.data.bookings.length > 0) {
      return res.data.bookings;
    }

    // 2. Global Shared Bookings Ledger: filter bookings where user is Provider or Booked_By
    const allBookings = getGlobalBookings();
    return allBookings.filter(b => {
      const pNorm = normalizeName(b.provider);
      const bNorm = normalizeName(b.booked_by);
      return pNorm === myNorm || bNorm === myNorm;
    });
  },

  // ==========================================
  // AI MATCHES (DISCOVER AVAILABLE ASSETS IN PUNE)
  // ==========================================
  async getAIMatches(params = {}) {
    const user = getActiveUser();
    const myNorm = normalizeName(user?.businessName);
    const reqItem = (params.resource || '').trim().toLowerCase();
    const reqQty = Number(params.quantity) || 1;
    const reqBudget = Number(params.budget) || 15000;

    // 1. Try backend
    const res = await safeFetchJson(`${API_BASE}/ai/match`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params)
    });
    if (res.ok && Array.isArray(res.data?.matches) && res.data.matches.length > 0) {
      return res.data.matches.filter(m => normalizeName(m.provider) !== myNorm);
    }

    // 2. Query all resources listed in the marketplace by other hotels
    const allResources = getGlobalMarketplace().filter(r => normalizeName(r.business_name) !== myNorm);
    const results = [];

    for (const r of allResources) {
      const nameLower = (r.name || '').toLowerCase();
      const catLower = (r.category || '').toLowerCase();

      if (reqItem && !nameLower.includes(reqItem) && !catLower.includes(reqItem) && !reqItem.includes(nameLower)) {
        continue;
      }

      const qtyRatio = Math.min(1.0, (Number(r.quantity) || 1) / Math.max(1, reqQty));
      const qtyScore = Math.round(qtyRatio * 100);
      const totalEst = (Number(r.price) || 20) * (r.unit !== 'Hall' ? reqQty : 1);
      const priceScore = totalEst <= reqBudget ? 100 : Math.max(50, Math.round(100 - ((totalEst - reqBudget) / reqBudget) * 100));
      const dist = Number(r.distance_km) || 3.5;
      const locScore = Math.max(60, Math.round(100 - (dist * 3.5)));
      const availScore = 95;

      const compositeScore = Math.round((qtyScore * 0.25) + (availScore * 0.25) + (locScore * 0.25) + (priceScore * 0.25));

      results.push({
        id: r.id,
        provider: r.business_name || 'Verified Hotel Partner',
        rating: 4.8,
        reviews: 32,
        resource: r.name,
        category: r.category,
        quantity: r.quantity,
        price: totalEst,
        location: r.location || 'Pune',
        distanceKm: dist,
        availableDates: `${r.available_from || '15 Sept'} → ${r.available_to || '30 Sept'}`,
        status: 'Available ✅',
        matchScore: Math.min(98, Math.max(70, compositeScore)),
        breakdown: {
          quantity: qtyScore,
          availability: availScore,
          location: locScore,
          price: priceScore
        },
        aiSummary: `Verified asset from ${r.business_name}. ${qtyScore}% quantity fit (${r.quantity} units), ${dist} km distance, and total price of ₹${totalEst.toLocaleString()}.`
      });
    }

    results.sort((a, b) => b.matchScore - a.matchScore);
    return results;
  },

  // ==========================================
  // NOTIFICATIONS & ANALYTICS
  // ==========================================
  async getNotifications() {
    const user = getActiveUser();
    const myNorm = normalizeName(user?.businessName);
    const allNotifs = getGlobalNotifications();
    return allNotifs.filter(n => {
      const tNorm = normalizeName(n.target_user_name);
      return !n.target_user_name || tNorm === myNorm;
    });
  },

  async markAllNotificationsRead() {
    const user = getActiveUser();
    const myNorm = normalizeName(user?.businessName);
    const allNotifs = getGlobalNotifications();
    const updated = allNotifs.map(n => {
      const tNorm = normalizeName(n.target_user_name);
      if (!n.target_user_name || tNorm === myNorm) {
        return { ...n, is_read: 1, isRead: true };
      }
      return n;
    });
    saveGlobalNotifications(updated);
  },

  async getAnalytics() {
    const myBk = await this.getBookings();
    const myRes = await this.getResources({ mine: true });
    const bookedCount = myRes.filter(r => r.status === 'Booked').length;
    const totalCount = myRes.length;

    const utilization = totalCount > 0 ? Math.round((bookedCount / totalCount) * 100) : 0;
    const revenue = myBk.reduce((sum, b) => sum + (parseInt(String(b.total_amount || b.totalAmount || 0).replace(/[^0-9]/g, '')) || 0), 0);

    return {
      metrics: {
        utilizationRate: utilization,
        costSaved: myBk.length * 8500,
        revenueGenerated: revenue,
        activePartners: myBk.length ? myBk.length + 1 : 0,
        co2SavedKg: myBk.length * 45
      },
      categoryBreakdown: totalCount > 0 ? [
        { category: 'Banquet Space & Furniture', percent: 70, count: totalCount, color: '#078b48' },
        { category: 'AV & Sound', percent: 30, count: 1, color: '#2e79d4' }
      ] : []
    };
  },

  async updateSettings(settingsData) {
    const user = getActiveUser();
    const updated = { ...user, ...settingsData };
    localStorage.setItem('hospora_user', JSON.stringify(updated));
    safeFetchJson(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settingsData)
    });
    return { status: 'ok', user: updated };
  }
};
