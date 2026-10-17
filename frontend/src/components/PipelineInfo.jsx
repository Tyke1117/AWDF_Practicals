import React from 'react';

export default function PipelineInfo({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog modal-lg card">
        <div className="modal-header">
          <h3>📐 Practical 7 Architecture & Middleware Pipeline</h3>
          <button type="button" className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body pipeline-modal-body">
          <div className="pipeline-diagram-box">
            <h4>Express Middleware Pipeline Flow</h4>
            <div className="pipeline-flow-diagram">
              <div className="flow-step client-step">
                <span className="step-tag">1. Client Request</span>
                <code>Authorization: Bearer &lt;token&gt;</code>
              </div>
              <div className="flow-arrow">⬇</div>
              <div className="flow-step middleware-step">
                <span className="step-tag">2. Auth Middleware (auth.js)</span>
                <span>Extracts Bearer token & verifies via <code>jwt.verify()</code></span>
                <span className="step-result">Sets <code>req.user = decoded</code></span>
              </div>
              <div className="flow-arrow">⬇</div>
              <div className="flow-step validation-step">
                <span className="step-tag">3. Validation Middleware (validator.js)</span>
                <span>Checks required fields (e.g. non-empty title)</span>
                <span className="step-result">Rejects malformed requests with HTTP 400 Bad Request</span>
              </div>
              <div className="flow-arrow">⬇</div>
              <div className="flow-step controller-step">
                <span className="step-tag">4. Route Controller (taskController.js)</span>
                <span>Executes scoped MongoDB query (<code>user: req.user.id</code>)</span>
                <span className="step-result">Returns HTTP 200 / 201 JSON response</span>
              </div>
            </div>
          </div>

          <div className="theory-qa-section">
            <h4>💡 Core Technical Principles (CO2, CO6 / PO3, PO5)</h4>
            
            <div className="qa-item">
              <h5>Q1: Why must passwords be hashed before storage instead of saved as plain text?</h5>
              <p>
                Even in demo applications, storing passwords in plain text introduces catastrophic exposure if a database leak, backup compromise, or SQL/NoSQL injection occurs. Using <strong>bcrypt</strong> provides:
                <strong> (1) Automatic salting:</strong> Defeats rainbow table and precomputed hash lookups.
                <strong> (2) Adaptive computational cost:</strong> bcrypt is intentionally slow and CPU/memory-intensive, mitigating brute-force and hardware-accelerated dictionary attacks.
              </p>
            </div>

            <div className="qa-item">
              <h5>Q2: What does authentication middleware actually verify, and what happens if token is missing or expired?</h5>
              <p>
                The middleware extracts the token from the <code>Authorization: Bearer &lt;token&gt;</code> header and validates the cryptographic HMAC signature against <code>process.env.JWT_SECRET</code>, ensuring the token payload has not been tampered with and that the <code>exp</code> timestamp is still valid.
                If missing or expired, it intercepts the request and responds with <strong>HTTP 401 Unauthorized</strong>, preventing unauthorized execution of downstream controllers.
              </p>
            </div>

            <div className="qa-item">
              <h5>Q3: Why should input validation happen on the server even if frontend already validates?</h5>
              <p>
                Frontend validation is strictly an <strong>enhancement for User Experience (UX)</strong> to provide immediate feedback. It is <em>never</em> a security boundary. Attackers and automated scripts can easily bypass browser checks using cURL, Postman, or direct HTTP requests. Server-side validation is mandatory to enforce data integrity, business rules, and prevent database pollution or injection vulnerabilities.
              </p>
            </div>

            <div className="qa-item">
              <h5>✨ Supplementary Problems Solved:</h5>
              <ul>
                <li><strong>/me Endpoint:</strong> Returns authenticated user profile using decoded token without exposing password hashes.</li>
                <li><strong>401 Expiry Handling:</strong> Frontend detects 401 Unauthorized responses, clears stale credentials, and gracefully prompts login.</li>
                <li><strong>Client Logout:</strong> Clears JWT token and user profile from <code>localStorage</code>.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
