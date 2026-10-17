import { Link, useLocation } from 'react-router-dom';

export default function NavBar() {
  const location = useLocation();
  const links = [
    { to: '/', label: 'Home' },
    { to: '/projects', label: 'Projects' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        padding: '16px 0',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', gap: '20px' }}>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              textDecoration: 'none',
              fontWeight: location.pathname === link.to ? '700' : '400',
              color:
                location.pathname === link.to
                  ? 'var(--accent)'
                  : 'var(--text-h)',
              borderBottom:
                location.pathname === link.to
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
              paddingBottom: '4px',
              transition: 'color 0.2s, border-color 0.2s',
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

