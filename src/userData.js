import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore, withFirebaseTimeout } from './firebase';

const localKey = (uid, key) => `hospora-${key}-${uid || 'default'}`;

export const DEFAULT_DEMO_DATA = {
  resources: [
    { id: 'res-1', name: 'Banquet Chiavari Chairs', category: 'Furniture', quantity: 200, unit: 'Chairs', price: 20, priceUnit: 'day', availableFrom: '2026-09-10', availableTo: '2026-09-25', location: 'Shivajinagar, Pune', status: 'Available', createdAt: '2026-09-01T10:00:00Z' },
    { id: 'res-2', name: 'Round Dining Tables (10-seater)', category: 'Furniture', quantity: 50, unit: 'Tables', price: 50, priceUnit: 'day', availableFrom: '2026-09-12', availableTo: '2026-09-28', location: 'Shivajinagar, Pune', status: 'Available', createdAt: '2026-09-01T10:30:00Z' },
    { id: 'res-3', name: '4K Laser Projector & 150" Screen', category: 'AV & Sound', quantity: 2, unit: 'Units', price: 1500, priceUnit: 'day', availableFrom: '2026-09-15', availableTo: '2026-09-18', location: 'Shivajinagar, Pune', status: 'Booked', createdAt: '2026-09-01T11:00:00Z' },
    { id: 'res-4', name: 'Commercial Bain Marie Food Warmers', category: 'Kitchen Equipment', quantity: 6, unit: 'Units', price: 800, priceUnit: 'day', availableFrom: '2026-09-08', availableTo: '2026-09-30', location: 'Shivajinagar, Pune', status: 'Available', createdAt: '2026-09-01T11:15:00Z' },
    { id: 'res-5', name: 'Grand Ballroom Hall B (Capacity 400)', category: 'Banquet Space', quantity: 1, unit: 'Hall', price: 25000, priceUnit: 'day', availableFrom: '2026-09-20', availableTo: '2026-09-24', location: 'Shivajinagar, Pune', status: 'Available', createdAt: '2026-09-01T11:30:00Z' }
  ],
  requirements: [
    { id: 'req-1', resource: '200 Premium Banquet Chairs', category: 'Furniture', quantity: 200, date: '2026-09-15', budget: 8500, location: 'Pune', provider_name: 'Hotel Green', status: 'Accepted', createdAt: '2026-09-01T09:00:00Z' },
    { id: 'req-2', resource: 'Commercial Espresso Coffee Machine', category: 'Kitchen Equipment', quantity: 2, date: '2026-09-18', budget: 4000, location: 'Pune', provider_name: 'Barista Hub Baner', status: 'Pending', createdAt: '2026-09-01T09:30:00Z' },
    { id: 'req-3', resource: 'JBL Line Array Sound System (400 pax)', category: 'AV & Sound', quantity: 1, date: '2026-09-22', budget: 12000, location: 'Pune', provider_name: 'SoundWave Pune', status: 'In Negotiation', createdAt: '2026-09-01T10:00:00Z' },
    { id: 'req-4', resource: 'Luxury Chafing Dishes (Gold Plated)', category: 'Tableware', quantity: 15, date: '2026-09-25', budget: 4500, location: 'Pune', provider_name: 'Sayaji Banquets', status: 'Pending', createdAt: '2026-09-01T10:45:00Z' }
  ],
  incoming: [
    { id: 'inc-1', requester: 'EventPro Pvt Ltd', city: 'Koregaon Park, Pune', resource: '100 Banquet Chairs', category: 'Furniture', quantity: 100, date: '15–16 Sept 2026', days: '2 Days', price: '₹4,000', rate: '₹20/chair/day', status: 'Pending', listedPrice: 5000, offeredPrice: 4000, createdAt: '2026-09-01T10:30:00Z' },
    { id: 'inc-2', requester: 'Royal Orchid Caterers', city: 'Viman Nagar, Pune', resource: '2 Bain Marie Warmers', category: 'Kitchen Equipment', quantity: 2, date: '18 Sept 2026', days: '1 Day', price: '₹1,500', rate: '₹750/unit/day', status: 'Pending', listedPrice: 1600, offeredPrice: 1500, createdAt: '2026-09-01T11:00:00Z' },
    { id: 'inc-3', requester: 'Novotel Pune', city: 'Kalyani Nagar, Pune', resource: '4K Laser Projector', category: 'AV & Sound', quantity: 1, date: '22 Sept 2026', days: '1 Day', price: '₹1,400', rate: '₹1,400/day', status: 'In Negotiation', listedPrice: 1500, offeredPrice: 1400, createdAt: '2026-09-01T11:20:00Z' },
    { id: 'inc-4', requester: 'Sayaji Banquets', city: 'Wakad, Pune', resource: '50 Round Tables', category: 'Furniture', quantity: 50, date: '14 Sept 2026', days: '1 Day', price: '₹2,500', rate: '₹50/table/day', status: 'Confirmed', listedPrice: 2500, offeredPrice: 2500, createdAt: '2026-09-01T08:00:00Z' }
  ],
  bookings: [
    { id: 'bk-1', resource: '100 Banquet Chairs', category: 'Furniture', quantity: '100 Chairs', booked_by: 'EventPro Pvt Ltd', provider: 'Hotel Taj', city: 'Koregaon Park, Pune', date: '2026-09-15', time: '09:00 AM - 10:00 PM', totalAmount: '₹4,000', status: 'Upcoming' },
    { id: 'bk-2', resource: '50 Round Tables', category: 'Furniture', quantity: '50 Tables', booked_by: 'Sayaji Banquets', provider: 'Hotel Taj', city: 'Wakad, Pune', date: '2026-09-14', time: '08:00 AM - 11:00 PM', totalAmount: '₹2,500', status: 'Confirmed' },
    { id: 'bk-3', resource: '4K Laser Projector', category: 'AV & Sound', quantity: '1 Unit', booked_by: 'Hotel Taj', provider: 'Novotel Pune', city: 'Kalyani Nagar, Pune', date: '2026-09-22', time: '06:00 PM - 11:00 PM', totalAmount: '₹1,500', status: 'Upcoming' },
    { id: 'bk-4', resource: 'Mobile Stage Setup (20x12ft)', category: 'Stage & Decor', quantity: '1 Setup', booked_by: 'Hotel Taj', provider: 'StageCrafters Pune', city: 'Pune', date: '2026-08-28', time: 'Full Day', totalAmount: '₹8,000', status: 'Completed' }
  ],
  negotiations: [
    {
      id: 'neg-1',
      requestId: 'inc-1',
      resourceName: '100 Banquet Chairs',
      counterpartyName: 'EventPro Pvt Ltd',
      role: 'Provider',
      quantity: 100,
      listedPrice: 5000,
      theirOffer: 4000,
      currentOffer: 4500,
      status: 'In Negotiation',
      lastMessage: 'Hotel Taj offered ₹4,500 with delivery assistance.',
      updatedAt: '2026-09-01T12:00:00Z',
      messages: [
        { id: 'm1', sender: 'EventPro Pvt Ltd', text: 'Hi Hotel Taj! We need 100 Banquet Chairs for a corporate summit in Koregaon Park. Can you do ₹4,000 for 2 days?', time: '10:30 AM', isOffer: true, amount: 4000 },
        { id: 'm2', sender: 'Hotel Taj', text: 'Hello EventPro team! Our standard rate is ₹5,000. How about ₹4,500 with sanitized protective covers included?', time: '10:45 AM', isOffer: true, amount: 4500 }
      ]
    },
    {
      id: 'neg-2',
      requestId: 'req-3',
      resourceName: 'JBL Line Array Sound System (400 pax)',
      counterpartyName: 'SoundWave Pune',
      role: 'Seeker',
      quantity: 1,
      listedPrice: 15000,
      theirOffer: 12000,
      currentOffer: 13000,
      status: 'In Negotiation',
      lastMessage: 'SoundWave Pune countered with ₹13,000 including technician.',
      updatedAt: '2026-09-01T11:45:00Z',
      messages: [
        { id: 'm1', sender: 'Hotel Taj', text: 'Hello SoundWave, we have a wedding reception on 22 Sept. Would you accept ₹12,000 for the JBL Line Array?', time: '11:15 AM', isOffer: true, amount: 12000 },
        { id: 'm2', sender: 'SoundWave Pune', text: 'Hi! We can do ₹13,000 including our sound engineer on-site for 6 hours.', time: '11:45 AM', isOffer: true, amount: 13000 }
      ]
    }
  ],
  notifications: [
    { id: 'n-1', title: 'New Incoming Request', message: 'EventPro Pvt Ltd requested 100 Banquet Chairs for 15 Sept.', type: 'request', link: '/incoming-requests', isRead: false, time: '10 mins ago' },
    { id: 'n-2', title: 'Request Accepted 🟢', message: 'Hotel Green accepted your request for 200 Banquet Chairs (₹8,500).', type: 'success', link: '/my-requests', isRead: false, time: '45 mins ago' },
    { id: 'n-3', title: 'Counter Offer Received 💬', message: 'SoundWave Pune proposed ₹13,000 for JBL Sound System.', type: 'negotiation', link: '/negotiations', isRead: false, time: '2 hours ago' },
    { id: 'n-4', title: 'Booking Confirmed 📅', message: 'Sayaji Banquets confirmed booking of 50 Round Tables for 14 Sept.', type: 'booking', link: '/bookings', isRead: true, time: 'Yesterday' }
  ],
  settings: {
    businessName: 'Hotel Taj',
    ownerName: 'Rajesh Sharma',
    email: 'taj@hospora.com',
    phone: '+91 98230 45678',
    city: 'Pune',
    address: 'Shivajinagar, JM Road, Pune, Maharashtra 411005',
    businessType: '5-Star Luxury Hotel & Banquets',
    gstin: '27AABCH1234F1Z6',
    isVerified: true,
    operatingRadiusKm: 25,
    notificationsEmail: true,
    notificationsInstant: true
  }
};

export async function loadUserList(uid, key) {
  const k = localKey(uid, key);
  let local = null;
  try {
    const raw = localStorage.getItem(k);
    if (raw) local = JSON.parse(raw);
  } catch { /* LocalStorage parse fallback */ }

  if (!local || (Array.isArray(local) && local.length === 0)) {
    local = DEFAULT_DEMO_DATA[key] || [];
    localStorage.setItem(k, JSON.stringify(local));
  }

  try {
    if (uid && uid !== 'default') {
      const remote = (await withFirebaseTimeout(getDoc(doc(firestore, 'users', uid)))).data()?.[key];
      if (Array.isArray(remote) && remote.length > 0) {
        localStorage.setItem(k, JSON.stringify(remote));
        return remote;
      }
      if (local && local.length) {
        await setDoc(doc(firestore, 'users', uid), { [key]: local }, { merge: true });
      }
    }
  } catch { /* Firestore offline fallback */ }

  return local;
}

export function saveUserList(uid, key, value) {
  const k = localKey(uid, key);
  localStorage.setItem(k, JSON.stringify(value));
  if (uid && uid !== 'default') {
    setDoc(doc(firestore, 'users', uid), { [key]: value }, { merge: true }).catch(() => undefined);
  }
  return value;
}

export function resetDemoData(uid) {
  Object.keys(DEFAULT_DEMO_DATA).forEach(key => {
    saveUserList(uid, key, DEFAULT_DEMO_DATA[key]);
  });
  localStorage.setItem(`hospora-profile-${uid || 'default'}`, JSON.stringify(DEFAULT_DEMO_DATA.settings));
  return DEFAULT_DEMO_DATA;
}

export async function getLiveStats(uid) {
  const [resources, requirements, incoming, bookings, negotiations, notifs] = await Promise.all([
    loadUserList(uid, 'resources'),
    loadUserList(uid, 'requirements'),
    loadUserList(uid, 'incoming'),
    loadUserList(uid, 'bookings'),
    loadUserList(uid, 'negotiations'),
    loadUserList(uid, 'notifications')
  ]);

  return {
    resources: resources.length,
    activeRequests: requirements.filter(r => r.status !== 'Rejected').length,
    incomingRequests: incoming.filter(r => r.status === 'Pending').length,
    bookings: bookings.filter(b => b.status === 'Upcoming' || b.status === 'Confirmed').length,
    negotiations: negotiations.filter(n => n.status === 'In Negotiation').length,
    notifications: notifs.filter(n => !n.isRead).length
  };
}

