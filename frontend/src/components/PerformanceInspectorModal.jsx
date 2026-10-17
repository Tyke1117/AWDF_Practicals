import React from 'react';

export default function PerformanceInspectorModal({
  isOpen,
  onClose,
  loadedChunks,
  simulatedDelay,
  setSimulatedDelay
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon-perf">⚡</div>
          <div>
            <h3 className="modal-title">Performance Optimization & Code Splitting Inspector</h3>
            <p className="modal-subtitle">Practical 8: Live Evaluation & Bundle Analysis Console</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="perf-modal-body">
          {/* Section 1: Architecture Comparison */}
          <div className="perf-section">
            <h4 className="perf-section-title">📐 1. Architectural Transformation</h4>
            <div className="arch-diagram-grid">
              <div className="arch-box arch-before">
                <span className="arch-tag">BEFORE (Monolithic Single Bundle)</span>
                <code>main.bundle.js (~450 KB)</code>
                <p className="arch-desc">
                  All route pages (<code>Home</code>, <code>Projects</code>, <code>Analytics</code>, <code>Contact</code>) & heavy libraries (<code>Chart.js</code>) are bundled into 1 massive JS file downloaded upfront on first visit.
                </p>
              </div>
              <div className="arch-box arch-after">
                <span className="arch-tag-success">AFTER (Code-Split with React.lazy)</span>
                <code>main.js (~140 KB)</code>
                <ul className="chunk-list-mini">
                  <li><code>Home-[hash].js</code> (loaded on /)</li>
                  <li><code>Projects-[hash].js</code> (loaded on /projects)</li>
                  <li><code>Analytics-[hash].js</code> (loaded on /analytics)</li>
                  <li><code>chart-vendor-[hash].js</code> (loaded on demand)</li>
                  <li><code>Contact-[hash].js</code> (loaded on /contact)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Real-Time Chunk Loading Monitor */}
          <div className="perf-section">
            <h4 className="perf-section-title">📦 2. Chunks Loaded In This Session</h4>
            <div className="loaded-chunks-grid">
              {loadedChunks.map((chunk, index) => (
                <div key={index} className="chunk-pill-item">
                  <span className="chunk-dot-active"></span>
                  <span className="chunk-name">{chunk.name}</span>
                  <span className="chunk-time">{chunk.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Supplementary Problem 2: Artificial Delay Slider */}
          <div className="perf-section">
            <h4 className="perf-section-title">⏱️ 3. Minimum-Delay Fallback & Throttling Simulation</h4>
            <p className="perf-desc">
              Adjust simulated chunk latency to observe the <strong>meaningful Suspense Fallback UI</strong> even on fast localhost connections:
            </p>
            <div className="delay-control-row">
              <input
                type="range"
                min="0"
                max="2000"
                step="100"
                value={simulatedDelay}
                onChange={(e) => setSimulatedDelay(Number(e.target.value))}
                className="delay-slider"
              />
              <span className="delay-value-badge">{simulatedDelay} ms latency</span>
            </div>
            <div className="preset-buttons">
              <button className="btn-preset" onClick={() => setSimulatedDelay(0)}>⚡ Zero Delay (Fast Local)</button>
              <button className="btn-preset" onClick={() => setSimulatedDelay(300)}>🛡️ Min 300ms (Anti-Flicker)</button>
              <button className="btn-preset" onClick={() => setSimulatedDelay(1200)}>📶 Slow 3G (1200ms)</button>
            </div>
          </div>

          {/* Section 4: DevTools Verification Guide */}
          <div className="perf-section">
            <h4 className="perf-section-title">🔍 4. How to Verify in Chrome/Edge DevTools</h4>
            <ol className="devtools-steps">
              <li>Press <strong>F12</strong> (or Right Click → Inspect) and switch to the <strong>Network</strong> tab.</li>
              <li>Filter by <strong>Fetch/XHR</strong> or <strong>JS</strong>.</li>
              <li>In the "Throttling" dropdown, select <strong>Slow 3G</strong>.</li>
              <li>Click on the <strong>Projects</strong>, <strong>Analytics</strong>, or <strong>Contact</strong> navigation tabs above.</li>
              <li>Observe the <strong>Suspense fallback UI</strong> shimmer while the chunk downloads, followed by instant injection without full-page reload!</li>
            </ol>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
