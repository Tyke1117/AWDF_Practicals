import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ padding: '80px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '72px', margin: 0, color: 'var(--accent)' }}>404</h1>
      <p style={{ fontSize: '20px', margin: '16px 0 24px', color: 'var(--text)' }}>
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        style={{
          color: 'var(--accent)',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '18px',
        }}
      >
        ← Go back Home
      </Link>
    </div>
  );
}

