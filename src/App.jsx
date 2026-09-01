import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Resources from './pages/Resources';
import About from './pages/About';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import FindResources from './pages/FindResources';
import MyResources from './pages/MyResources';
import MyRequests from './pages/MyRequests';
import IncomingRequests from './pages/IncomingRequests';
import Bookings from './pages/Bookings';
import Negotiations from './pages/Negotiations';
import AIMatches from './pages/AIMatches';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import HosporaChatbot from './components/HosporaChatbot';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        
        {/* 11 Unified Business Dashboard Modules */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/find-resources" element={<FindResources />} />
        <Route path="/my-resources" element={<MyResources />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/incoming-requests" element={<IncomingRequests />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/negotiations" element={<Negotiations />} />
        <Route path="/ai-matches" element={<AIMatches />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>

      {/* Global Floating AI Hospitality Chatbot */}
      <HosporaChatbot />
    </>
  );
}
