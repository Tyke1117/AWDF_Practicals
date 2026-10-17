import React from 'react';

export default function PipelineModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="pipeline-modal-backdrop" onClick={onClose}>
      <div className="pipeline-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <span className="modal-icon">⚙️</span>
            <div>
              <h3>CI/CD Pipeline Telemetry Hub</h3>
              <p className="modal-sub">GitHub Actions Workflow • .github/workflows/ci.yml • Branch: main</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Status summary banner */}
          <div className="ci-status-strip pass">
            <div className="status-indicator">
              <span className="dot dot-pass"></span>
              <strong>Latest Run: #42 PASSED</strong>
            </div>
            <span className="timing">Total Duration: 42s</span>
          </div>

          {/* Telemetry metadata */}
          <div className="telemetry-grid">
            <div className="telemetry-item">
              <span className="label">Runner Environment</span>
              <span className="val">ubuntu-latest (GitHub Hosted)</span>
            </div>
            <div className="telemetry-item">
              <span className="label">Node.js Runtime</span>
              <span className="val">v18.20.4 LTS (cache: npm)</span>
            </div>
            <div className="telemetry-item">
              <span className="label">Trigger Type</span>
              <span className="val">push [main] & pull_request</span>
            </div>
            <div className="telemetry-item">
              <span className="label">Commit SHA</span>
              <span className="val">7b4a31e (D25DIT079)</span>
            </div>
          </div>

          {/* Pipeline execution table from Supplementary Problem 2 */}
          <h4>Pipeline Step Breakdown & Failure Behavior</h4>
          <table className="pipeline-table">
            <thead>
              <tr>
                <th>Pipeline Step</th>
                <th>Execution Target</th>
                <th>Average Duration</th>
                <th>Failure Behavior</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1. Code Quality (lint)</strong></td>
                <td><code>node -c syntax check</code></td>
                <td>8 seconds</td>
                <td>Blocks test execution; halts PR merge</td>
              </tr>
              <tr>
                <td><strong>2. Dependency Install</strong></td>
                <td><code>npm install / npm ci</code></td>
                <td>18 seconds</td>
                <td>Fails if dependencies are unresolvable</td>
              </tr>
              <tr>
                <td><strong>3. Automated Tests</strong></td>
                <td><code>npm test (Jest/Supertest)</code></td>
                <td>12 seconds</td>
                <td>Fails on broken assertion; flags Red X</td>
              </tr>
            </tbody>
          </table>

          {/* Test log terminal mockup */}
          <div className="terminal-box">
            <div className="terminal-header">
              <span>● Jest API Test Output (build-and-test)</span>
              <span className="term-badge">PASS 3/3</span>
            </div>
            <pre className="terminal-content">
{`PASS  tests/task.test.js (1.337 s)
Task Management API Test Suite (CI Pipeline)
  [OK] GET / returns HTTP 200 OK and valid JSON information (409 ms)
  [OK] POST /api/tasks rejects request with missing title (HTTP 400 Bad Request) (230 ms)
  [OK] GET /api/events/activity returns 200 with recorded events array (60 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Time:        2.376 s
Process exited with code 0 (Pipeline Green Checkmark)`}
            </pre>
          </div>
        </div>

        <div className="modal-footer">
          <span className="footer-note">Supplementary Problem 2: Interactive PR Trigger & Telemetry Modal</span>
          <button className="btn-done" onClick={onClose}>Close Telemetry</button>
        </div>
      </div>
    </div>
  );
}
