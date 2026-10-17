import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar({ onOpenPerfInspector, loadedChunksCount }) {
  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand / Logo */}
        <div className="navbar-brand">
          <div className="brand-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">TaskFlow Pro</span>
            <span className="brand-tag">Practical 8 • Code Splitting</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="navbar-links" aria-label="Main Navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            <span className="nav-icon">📋</span>
            <span>Tasks</span>
            <span className="route-badge">Home Chunk</span>
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            <span className="nav-icon">📁</span>
            <span>Projects</span>
            <span className="route-badge lazy-badge">Lazy Chunk</span>
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span>Analytics</span>
            <span className="route-badge heavy-badge">Heavy Chunk</span>
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            <span className="nav-icon">✉️</span>
            <span>Contact</span>
            <span className="route-badge lazy-badge">Lazy Chunk</span>
          </NavLink>
        </nav>

        {/* Performance Inspector Action */}
        <div className="navbar-actions">
          <button
            type="button"
            className="btn-perf-pill"
            onClick={onOpenPerfInspector}
            title="Inspect bundle metrics, network waterfall, and Profiler experiments"
          >
            <span className="perf-dot"></span>
            <span className="perf-text">⚡ Perf Inspector</span>
            <span className="chunks-counter">{loadedChunksCount} chunks</span>
          </button>
        </div>
      </div>
    </header>
  );
}
