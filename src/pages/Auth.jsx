import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { api } from '../api';

export default function Auth({ mode }) {
  const register = mode === 'register';
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ownerName: '',
    businessName: '',
    email: '',
    password: '',
    city: 'Pune',
    phone: '',
    businessType: 'Hotel & Banquets'
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (register) {
        await api.register({
          businessName: form.businessName.trim(),
          ownerName: form.ownerName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          city: form.city.trim(),
          phone: form.phone.trim(),
          businessType: form.businessType
        });
      } else {
        await api.login(form.email.trim().toLowerCase(), form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setBusy(false);
    }
  };

  const handleQuickLogin = async (email, password) => {
    setBusy(true);
    setError('');
    try {
      await api.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Header />
      <main className="auth-page">
        <section className="auth-card">
          <aside className="auth-welcome">
            <div>
              <span className="brand-symbol-auth">🏨 HOSPORA</span>
              <h2>{register ? 'Welcome Back!' : 'New Here?'}</h2>
              <p>
                {register
                  ? 'Already have an existing hospitality account? Sign in to access your dashboard.'
                  : 'Join Pune’s verified hospitality exchange network. Share excess inventory and reduce rental expenses.'}
              </p>
              <Link className="outline-button" to={register ? '/login' : '/register'}>
                {register ? 'Sign In' : 'Create Account'}
              </Link>
            </div>

            <div className="quick-demo-accounts">
              <small>Demo Accounts (1-Click Login):</small>
              <div className="demo-btn-row">
                <button
                  type="button"
                  className="btn-demo-chip"
                  onClick={() => handleQuickLogin('taj@hospora.com', 'password123')}
                >
                  👑 Hotel Taj (Provider)
                </button>
                <button
                  type="button"
                  className="btn-demo-chip"
                  onClick={() => handleQuickLogin('eventpro@hospora.com', 'password123')}
                >
                  🎯 EventPro (Seeker)
                </button>
              </div>
            </div>
          </aside>

          <section className="auth-form-panel">
            <h1>{register ? 'Register Business' : 'Login to Hospora'}</h1>
            <p>{register ? 'Create a verified hospitality profile for your venue' : 'Enter your registered business email and password'}</p>

            <form onSubmit={submit}>
              {register && (
                <>
                  <label>
                    <input
                      required
                      name="businessName"
                      value={form.businessName}
                      onChange={change}
                      placeholder="Hotel / Banquet / Business Name *"
                    />
                  </label>
                  <label>
                    <input
                      required
                      name="ownerName"
                      value={form.ownerName}
                      onChange={change}
                      placeholder="General Manager / Owner Name *"
                    />
                  </label>
                  <div className="form-row-2">
                    <label>
                      <input
                        required
                        name="city"
                        value={form.city}
                        onChange={change}
                        placeholder="City (e.g. Pune) *"
                      />
                    </label>
                    <label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={change}
                        placeholder="Phone / WhatsApp"
                      />
                    </label>
                  </div>
                </>
              )}

              <label>
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={change}
                  placeholder="Official Business Email *"
                />
              </label>

              <label>
                <input
                  required
                  type="password"
                  name="password"
                  minLength="6"
                  value={form.password}
                  onChange={change}
                  placeholder="Password (min 6 characters) *"
                />
              </label>

              {error && <small className="auth-error">{error}</small>}

              <button type="submit" disabled={busy}>
                {busy ? 'Authenticating…' : register ? 'Create Verified Account' : 'Sign In to Dashboard'}
              </button>
            </form>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
