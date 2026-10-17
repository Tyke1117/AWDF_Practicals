import React, { useState } from 'react';
import { sendContactMessage } from '../services/api';

/**
 * Contact Page (Lazy Loaded Chunk)
 * 
 * Code-split chunk: `Contact-[hash].js` (~10 KB).
 * Downloaded asynchronously ONLY when the user visits `/contact`.
 */
export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await sendContactMessage({ name, email, subject, message });
      setStatus({
        type: 'success',
        text: res.message || 'Thank you! Your feedback has been received.'
      });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setStatus({
        type: 'error',
        text: err.message || 'Failed to submit contact message.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container page-contact">
      {/* Route Chunk Banner */}
      <div className="chunk-route-indicator">
        <span className="route-pulse pulse-emerald"></span>
        <span>
          <strong>Route Chunk Loaded:</strong> <code>Contact.chunk.js</code> (~10 KB) loaded dynamically.
        </span>
      </div>

      <section className="contact-hero">
        <h1 className="page-heading">Contact Support & Performance Feedback</h1>
        <p className="page-subheading">
          Get in touch with the development team or submit profiling reports.
        </p>
      </section>

      <div className="contact-layout-grid">
        <div className="contact-form-container">
          {status && (
            <div className={`alert-banner alert-${status.type}`}>
              {status.type === 'success' ? '✅ ' : '⚠️ '}
              {status.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label className="form-label" htmlFor="contact-name">
                Your Full Name <span className="required-star">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                className="form-input"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-email">
                Email Address <span className="required-star">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                className="form-input"
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-subject">
                Subject
              </label>
              <input
                id="contact-subject"
                type="text"
                className="form-input"
                placeholder="e.g. Slow 3G network latency observation"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-msg">
                Detailed Message <span className="required-star">*</span>
              </label>
              <textarea
                id="contact-msg"
                className="form-textarea"
                rows="5"
                placeholder="Describe your query, test feedback, or metrics..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-submit-contact"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending Message...' : 'Send Message'}
            </button>
          </form>
        </div>

        <aside className="contact-info-card">
          <h3 className="info-title">📍 Practical 8 Lab Reference</h3>
          <div className="info-row">
            <span className="info-icon">📚</span>
            <div>
              <strong>Course / Module:</strong>
              <p>AWDF / IBM Front-End Apps with React Week 8</p>
            </div>
          </div>
          <div className="info-row">
            <span className="info-icon">🎯</span>
            <div>
              <strong>Target COs/POs:</strong>
              <p>CO1 (React Optimization) / PO3, PO5</p>
            </div>
          </div>
          <div className="info-row">
            <span className="info-icon">⚡</span>
            <div>
              <strong>Optimization Techniques:</strong>
              <p>Route code-splitting, React.lazy, Suspense fallback, component deferral, memoization.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
