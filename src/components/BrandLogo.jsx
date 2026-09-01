import { Link } from 'react-router-dom';

export default function BrandLogo() {
  return (
    <Link to="/" className="brand" aria-label="Hospora Home">
      <svg
        className="brand-symbol"
        style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', flexShrink: 0 }}
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" strokeWidth="2.6" />
        <path d="M7 27h34M12 17h24M13 34h22M24 7c-6 6-8 18 0 34M24 7c6 6 8 18 0 34" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".8" />
        <path d="M15 23c2-5 6-7 9-7s7 2 9 7v8H15zM19 31v-5h10v5M22 26v5M27 26v5" fill="#fff" stroke="currentColor" strokeWidth="2" />
      </svg>
      <div className="brand-text-wrap">
        <strong className="brand-title">HOSPORA</strong>
        <small className="brand-tagline">Hospitality Resource Exchange</small>
      </div>
    </Link>
  );
}
