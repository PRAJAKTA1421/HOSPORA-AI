# 🏨 HOSPORA — Hospitality Resource Exchange Platform & AI Assistant

> **Pune's premier B2B circular economy platform connecting hotels, banquet halls, caterers, and venues to monetize surplus equipment and save up to 60% on event logistics.**

---

## 🌟 Key Features

1. **Unified Business Dashboard**
   - Seamless dual-role management: Operate simultaneously as a **Resource Provider** (earn daily revenue from surplus assets) and a **Resource Seeker** (rent chairs, tables, sound, halls for peak events).
   - Zero-state data initialization on signup with live metrics.

2. **11 Business Management Modules**
   - 🏠 **Dashboard**: Quick metrics, daily schedule overview, and fast action triggers.
   - 🔍 **Find Resources**: Multi-filter catalog across Pune Metro (Shivajinagar, Baner, Wakad, Koregaon Park).
   - 📦 **My Resources**: Real-time asset inventory manager with rate control and status toggles.
   - 📋 **My Requests**: Outgoing rental order tracker with counter-offer states.
   - 📥 **Incoming Requests**: Real-time multi-tenant inbox with 1-Click Confirmation and counter-offer negotiation rooms.
   - 📅 **Bookings Ledger**: Conflict-free visual calendar & list tracking with digital gate passes.
   - 💬 **Negotiations**: Live interactive deal room for counter-proposals and agreements.
   - 🤖 **AI Matches**: 4-Attribute smart matching engine (Proximity, Capacity, Availability, Price).
   - 📊 **Analytics**: Utilization rates, monthly revenue forecasts, and savings breakdown.
   - 🔔 **Notifications**: Real-time ledger updates, booking alerts, and chat messages.
   - ⚙️ **Settings**: Business verification, GSTIN, radius preferences, and payout accounts.

3. **🤖 Hospora AI Concierge (Powered by Mistral AI)**
   - Floating bottom-right AI Assistant connected directly to Mistral AI API (`mistral-small-latest`).
   - Multilingual support (मराठी / English / Hindi).
   - Instant advice on fair rental pricing, Pune market benchmarks, negotiation tactics, and asset discovery.

4. **📱 100% Mobile Responsive & PWA-Ready**
   - Adaptive mobile top navbar with notification badges.
   - Smooth animated slide-in drawer for full 11-module access on all smartphones.
   - Fixed bottom quick-navigation bar.

---

## 🚀 Tech Stack

- **Frontend**: React 18, React Router v6, Vite
- **Styling**: Modern CSS3, Responsive Glassmorphism, Outfit & Plus Jakarta Sans typography
- **AI Intelligence**: Mistral AI API (`mistral-small-latest`)
- **Backend / Storage**: SQLite, Multi-tenant Local Shared Ledger Architecture

---

## 🛠️ Local Development

### 1. Clone the repository
```bash
git clone https://github.com/PRAJAKTA1421/HOSPORA-AI.git
cd HOSPORA-AI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

### 4. Build for production deployment (Vercel / Netlify / Render)
```bash
npm run build
```

---

## 🌐 Deployment Guidelines

- **Vercel**: Simply import this GitHub repository. The build command `npm run build` and output directory `dist` are pre-configured.
- **Netlify**: Set build command to `npm run build` and publish directory to `dist`.

---

## 📄 License
MIT License © 2026 HOSPORA Team
