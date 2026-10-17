import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/api';

export default function AuthModal({ onAuthSuccess, showToast }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (formError) setFormError('');
  };

  const handleFillDemo = () => {
    setFormData({
      name: 'Demo Student',
      email: 'demo@awdf.edu',
      password: 'Password123!'
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Client-side quick check
    if (!formData.email.trim() || !formData.password.trim()) {
      setFormError('Email and password are required.');
      return;
    }

    if (mode === 'register' && formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const response = await registerUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password
        });
        showToast('Registration successful! Authenticated with JWT.', 'success');
        onAuthSuccess(response.user);
      } else {
        const response = await loginUser({
          email: formData.email.trim(),
          password: formData.password
        });
        showToast(`Welcome back, ${response.user.name || response.user.email}!`, 'success');
        onAuthSuccess(response.user);
      }
    } catch (err) {
      setFormError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card-container">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-badge">
            <span role="img" aria-label="key">🔑</span> Security Gateway
          </div>
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create an Account'}</h2>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Enter your credentials to receive a signed JWT token.'
              : 'Register to hash your password with bcrypt and obtain an access token.'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setFormError('');
            }}
          >
            Log In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              setFormError('');
            }}
          >
            Register
          </button>
        </div>

        {formError && (
          <div className="auth-alert error-banner">
            <span className="alert-icon">⚠️</span>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Alex Johnson"
                className="form-control"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address <span className="required">*</span></label>
            <input
              id="auth-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password <span className="required">*</span></label>
            <input
              id="auth-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="form-control"
            />
            {mode === 'register' && (
              <small className="help-text">Minimum 6 characters. Hashed using bcryptjs (salt rounds: 10).</small>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-spinner-wrap">
                <span className="spinner-sm"></span> Processing...
              </span>
            ) : mode === 'login' ? (
              'Log In with JWT'
            ) : (
              'Create Account & Sign JWT'
            )}
          </button>
        </form>

        <div className="auth-footer-actions">
          <button
            type="button"
            className="btn btn-ghost btn-demo"
            onClick={handleFillDemo}
            title="Auto-fill demo test credentials"
          >
            ⚡ Auto-Fill Demo Credentials
          </button>
        </div>

        <div className="security-notice">
          <p>
            🔒 Passwords are cryptographically salted and hashed using <strong>bcryptjs</strong>.
            Sessions are validated using signed <strong>JSON Web Tokens (JWT)</strong> with a 1-hour expiry.
          </p>
        </div>
      </div>
    </div>
  );
}
