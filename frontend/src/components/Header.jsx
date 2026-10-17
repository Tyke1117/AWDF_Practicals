import React from 'react';

export default function Header({ user, onLogout, onTogglePipelineInfo }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="brand">
          <div className="brand-icon">
            <span role="img" aria-label="shield">🛡️</span>
          </div>
          <div>
            <div className="brand-title-wrap">
              <h1>TaskFlow Auth</h1>
              <span className="practical-pill">Practical 7</span>
            </div>
            <p className="subtitle">
              JWT Authentication & Express Middleware Pipeline
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary pipeline-toggle-btn"
            onClick={onTogglePipelineInfo}
            title="Inspect Express Middleware Pipeline Architecture"
          >
            ⚙️ Pipeline Architecture
          </button>

          {user ? (
            <div className="user-profile-badge">
              <div className="avatar-circle">
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="user-meta">
                <span className="user-name">{user.name || 'Student'}</span>
                <span className="user-email">{user.email}</span>
              </div>
              <span className="badge badge-success token-pill" title="JWT Token Verified">
                ● JWT Active (1h)
              </span>
              <button
                type="button"
                className="btn btn-logout"
                onClick={onLogout}
                title="Logout & Clear Client Token (Supplementary Problem 3)"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="guest-badge">
              <span className="status-dot disconnected"></span>
              <span>Unauthenticated</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
