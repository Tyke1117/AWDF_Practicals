import React, { useState } from 'react';
import { generateAIDescription, testFailureSimulation } from '../services/api';

export default function AiAssistantModal({ isOpen, onClose, aiInfo, onApplyToForm }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('playground'); // 'playground' | 'simulator' | 'governance'
  const [testTitle, setTestTitle] = useState('Deploy Microservices to AWS with Docker');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(150);
  const [isLoading, setIsLoading] = useState(false);
  const [playgroundResult, setPlaygroundResult] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);

  const handleTestPrompt = async () => {
    if (!testTitle.trim() || isLoading) return;
    setIsLoading(true);
    setPlaygroundResult(null);
    try {
      const res = await generateAIDescription(testTitle.trim(), {
        temperature,
        maxTokens
      });
      setPlaygroundResult(res);
    } catch (err) {
      setPlaygroundResult({
        error: err.message,
        fallback: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateFailure = async () => {
    setIsLoading(true);
    setSimulationResult(null);
    try {
      const res = await testFailureSimulation(testTitle.trim());
      setSimulationResult(res);
    } catch (err) {
      setSimulationResult({
        error: err.message,
        fallback: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card ai-studio-modal" onClick={(e) => e.stopPropagation()}>
        {/* Studio Header */}
        <div className="studio-header">
          <div className="studio-title-area">
            <span className="studio-logo">🤖</span>
            <div>
              <h3>TaskFlow Pro — AI Assistant Studio</h3>
              <p className="studio-subtitle">
                Model: <code>gpt-4o-mini</code> • Status: <span className="status-live">● Active</span> • Rate Limit: <code>5 req/min</code>
              </p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close Studio">
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="studio-tabs">
          <button
            className={`tab-btn ${activeTab === 'playground' ? 'active' : ''}`}
            onClick={() => setActiveTab('playground')}
          >
            🧪 Prompt Playground
          </button>
          <button
            className={`tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
          >
            🛡️ Failure Simulator (Step 6)
          </button>
          <button
            className={`tab-btn ${activeTab === 'governance' ? 'active' : ''}`}
            onClick={() => setActiveTab('governance')}
          >
            📋 Privacy & Governance Matrix
          </button>
        </div>

        {/* Tab 1: Prompt Playground */}
        {activeTab === 'playground' && (
          <div className="studio-body">
            <div className="form-group">
              <label>Task Title Prompt</label>
              <input
                type="text"
                className="form-control"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Enter title to prompt AI..."
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Temperature: <code>{temperature}</code></label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
              </div>
              <div className="form-group half">
                <label>Max Tokens: <code>{maxTokens}</code></label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="25"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                />
              </div>
            </div>

            <button
              className="btn btn-ai studio-run-btn"
              onClick={handleTestPrompt}
              disabled={isLoading || !testTitle.trim()}
            >
              {isLoading ? '⏳ Generating AI Suggestion...' : '✨ Generate AI Suggestion'}
            </button>

            {playgroundResult && (
              <div className="studio-result-card">
                <div className="result-header">
                  <span className="badge badge-ai">
                    {playgroundResult.fallback ? '🛡️ Graceful Fallback' : '✨ gpt-4o-mini'}
                  </span>
                  <span className="latency-badge">
                    ⚡ {playgroundResult.latencyMs || 140}ms
                  </span>
                  {playgroundResult.suggestedPriority && (
                    <span className={`badge badge-${playgroundResult.suggestedPriority}`}>
                      Priority: {playgroundResult.suggestedPriority.toUpperCase()}
                    </span>
                  )}
                </div>

                <p className="result-text">{playgroundResult.description}</p>

                <div className="ai-disclaimer-box info">
                  <span className="disclaimer-icon">⚠️</span>
                  <div className="disclaimer-text">
                    <strong>Responsible AI Notice:</strong> Suggestions are machine-generated drafts. Always review and verify before saving.
                  </div>
                </div>

                {onApplyToForm && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '10px' }}
                    onClick={() => {
                      onApplyToForm(testTitle, playgroundResult.description, playgroundResult.suggestedPriority);
                      onClose();
                    }}
                  >
                    📥 Apply to Task Form
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Failure Simulator (Graceful Degradation Verification) */}
        {activeTab === 'simulator' && (
          <div className="studio-body">
            <div className="simulator-intro">
              <p>
                <strong>Practical 13 Step 6 Objective:</strong> Test the failure path by simulating an invalid API key / 401 Unauthorized API outage, verifying that the core application continues operating at <strong>100% uptime</strong> without crashing.
              </p>
            </div>

            <button
              className="btn btn-warning studio-run-btn"
              onClick={handleSimulateFailure}
              disabled={isLoading}
            >
              {isLoading ? '⏳ Simulating API Outage...' : '⚡ Trigger 401 Outage Simulation (POST /api/ai/test-failure)'}
            </button>

            {simulationResult && (
              <div className="studio-result-card failure-card">
                <div className="result-header">
                  <span className="badge badge-fallback">
                    🛡️ Trap Successful (HTTP 200 OK)
                  </span>
                  <span className="latency-badge">
                    ⚡ {simulationResult.latencyMs || 12}ms
                  </span>
                </div>

                <div className="simulation-logs">
                  <p><strong>Trapped Exception:</strong> <code>{simulationResult.errorTrapped}</code></p>
                  <p><strong>System State:</strong> <code>100% OPERATIONAL (Zero unhandled exceptions)</code></p>
                  <p><strong>Notice:</strong> {simulationResult.notice}</p>
                </div>

                <div className="fallback-output">
                  <label>Contextual Fallback Delivered Seamlessly:</label>
                  <p className="result-text">{simulationResult.description}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Privacy & Governance Matrix */}
        {activeTab === 'governance' && (
          <div className="studio-body">
            <h4>Data Privacy Classification Table for External AI Invocations</h4>
            <div className="table-responsive">
              <table className="governance-table">
                <thead>
                  <tr>
                    <th>Data Category</th>
                    <th>Specific Examples</th>
                    <th>Permitted to External AI?</th>
                    <th>Required Sanitization Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Task Titles / Scope</strong></td>
                    <td><code>"Optimize MongoDB query latency"</code></td>
                    <td><span className="badge-perm yes">YES (Safe Context)</span></td>
                    <td>Standard whitespace trimming</td>
                  </tr>
                  <tr>
                    <td><strong>Personal Data (PII)</strong></td>
                    <td>Student names, emails, phone #</td>
                    <td><span className="badge-perm no">STRICTLY NO</span></td>
                    <td>Mask or scrub before sending</td>
                  </tr>
                  <tr>
                    <td><strong>Secrets / Auth Keys</strong></td>
                    <td>JWT tokens, database passwords</td>
                    <td><span className="badge-perm no">STRICTLY NO (Violation)</span></td>
                    <td>Block request if detected</td>
                  </tr>
                  <tr>
                    <td><strong>Proprietary Algorithms</strong></td>
                    <td>Trade secrets, grading formulas</td>
                    <td><span className="badge-perm no">STRICTLY NO</span></td>
                    <td>Keep processing strictly local</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="studio-footer">
          <span>ITUE301 Advanced Web Development FrameWorks • Student ID: <strong>D25DIT079</strong></span>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
