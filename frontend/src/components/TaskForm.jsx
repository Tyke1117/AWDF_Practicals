import React, { useState, useEffect } from 'react';
import { generateAIDescription } from '../services/api';

export default function TaskForm({
  onSubmit,
  editingTask,
  onCancelEdit,
  isSubmitting,
  onNotify
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [completed, setCompleted] = useState(false);

  // Practical 13 AI Integration State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiMetadata, setAiMetadata] = useState(null); // { fallback, source, warning }
  const [simulateInvalidKey, setSimulateInvalidKey] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'medium');
      setCompleted(editingTask.completed || false);
      setAiMetadata(null);
    } else {
      resetForm();
    }
  }, [editingTask]);

  // Cooldown countdown timer for rate limiting
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setTimeout(() => {
      setCooldownSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCompleted(false);
    setAiMetadata(null);
  };

  /**
   * Practical 13 Step 4 & 5: AI Description Generation
   * Calls Express backend /api/ai/generate-description
   * Keeps API key protected on the backend!
   */
  const handleGenerateAI = async () => {
    if (!title.trim() || isGeneratingAI || cooldownSeconds > 0) return;

    setIsGeneratingAI(true);
    try {
      // Options to test failure path if user toggled simulated invalid key
      const options = simulateInvalidKey
        ? { testApiKey: 'sk-invalid-test-key-simulating-practical-13-failure' }
        : {};

      const response = await generateAIDescription(title.trim(), options);

      if (response && response.description) {
        // Step 5: Display returned description as an editable suggestion
        setDescription(response.description);

        if (response.suggestedPriority) {
          setPriority(response.suggestedPriority);
        }

        setAiMetadata({
          fallback: Boolean(response.fallback),
          source: response.source || (response.fallback ? 'fallback-template' : 'external-ai'),
          warning: response.warning || null
        });

        if (response.fallback) {
          onNotify?.(
            response.warning || 'External AI unavailable. Loaded graceful fallback description.',
            'warning'
          );
        } else {
          onNotify?.('✨ AI description generated! You can edit it below.', 'success');
        }

        // Apply 5-second cooldown to prevent excessive API calls
        setCooldownSeconds(5);
      }
    } catch (err) {
      // Graceful error handling in case of rate limit (HTTP 429) or network issue
      const isRateLimit = err.status === 429 || (err.message && err.message.includes('Rate limit'));
      if (isRateLimit) {
        setCooldownSeconds(15);
        onNotify?.('⚠️ AI rate limit reached. Please wait a few seconds before trying again.', 'warning');
      } else {
        onNotify?.(`AI Generation Error: ${err.message}`, 'error');
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      completed,
      isAiGenerated: Boolean(aiMetadata)
    });

    if (!editingTask) {
      resetForm();
    }
  };

  return (
    <form className="task-form card" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>{editingTask ? '✏️ Edit Task' : '➕ Create New Task'}</h3>
        {editingTask && (
          <button type="button" className="btn-text" onClick={onCancelEdit}>
            Cancel Edit
          </button>
        )}
      </div>

      {/* Task Title Field */}
      <div className="form-group">
        <div className="label-with-action">
          <label htmlFor="task-title">Title *</label>
          <span className="char-count">{title.length}/120</span>
        </div>
        <div className="title-input-wrapper">
          <input
            id="task-title"
            type="text"
            className="form-control"
            placeholder="e.g. Implement user login with JWT auth..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isSubmitting || isGeneratingAI}
          />
        </div>
      </div>

      {/* Practical 13 Step 4: AI Generation Trigger Bar */}
      <div className="ai-trigger-panel">
        <div className="ai-controls">
          <button
            type="button"
            className={`btn btn-ai ${isGeneratingAI ? 'loading' : ''}`}
            onClick={handleGenerateAI}
            disabled={!title.trim() || isGeneratingAI || isSubmitting || cooldownSeconds > 0}
            title={!title.trim() ? 'Enter a task title first' : 'Generate AI task description'}
          >
            {isGeneratingAI ? (
              <>
                <span className="ai-spinner"></span>
                <span>🤖 AI Generating...</span>
              </>
            ) : cooldownSeconds > 0 ? (
              <span>⏳ Cooldown ({cooldownSeconds}s)</span>
            ) : (
              <>
                <span className="sparkle-icon">✨</span>
                <span>Generate Description with AI</span>
              </>
            )}
          </button>

          {/* Step 6 Failure Path Testing Toggle */}
          <label className="failure-test-toggle" title="Test Step 6: Verify graceful fallback when API key is invalid">
            <input
              type="checkbox"
              checked={simulateInvalidKey}
              onChange={(e) => setSimulateInvalidKey(e.target.checked)}
              disabled={isGeneratingAI}
            />
            <span>Simulate Invalid Key (Test Failure Path)</span>
          </label>
        </div>
      </div>

      {/* Task Description Field (Step 5: Editable suggestion) */}
      <div className="form-group">
        <div className="label-with-action">
          <label htmlFor="task-description">
            Description
            {aiMetadata && (
              <span className={`badge ${aiMetadata.fallback ? 'badge-fallback' : 'badge-ai'}`}>
                {aiMetadata.fallback ? '🛡️ Graceful Fallback' : '✨ AI Suggested'}
              </span>
            )}
          </label>
          {aiMetadata && (
            <button
              type="button"
              className="btn-link-sm"
              onClick={() => {
                setDescription('');
                setAiMetadata(null);
              }}
            >
              Clear Suggestion
            </button>
          )}
        </div>

        <textarea
          id="task-description"
          className={`form-control textarea ${aiMetadata ? 'ai-active' : ''}`}
          placeholder="Add details, or click 'Generate Description with AI' above to auto-generate..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          disabled={isSubmitting || isGeneratingAI}
        />

        {/* Supplementary Problem: Clear AI Disclaimer */}
        {aiMetadata && (
          <div className={`ai-disclaimer-box ${aiMetadata.fallback ? 'warning' : 'info'}`}>
            <span className="disclaimer-icon">{aiMetadata.fallback ? 'ℹ️' : '⚠️'}</span>
            <div className="disclaimer-text">
              <strong>Responsible AI Disclaimer:</strong>{' '}
              {aiMetadata.fallback
                ? 'External AI call failed or key invalid. A standardized template was provided gracefully. Please customize before saving.'
                : 'This description is AI-generated and may contain inaccuracies. Please review, edit, and ensure data privacy compliance.'}
            </div>
          </div>
        )}
      </div>

      {/* Priority & Status Controls */}
      <div className="form-row">
        <div className="form-group half">
          <label htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            className="form-control"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isSubmitting || isGeneratingAI}
          >
            <option value="low">🔵 Low Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="high">🔴 High Priority</option>
          </select>
        </div>

        {editingTask && (
          <div className="form-group half checkbox-group">
            <label htmlFor="task-completed">Status</label>
            <label className="checkbox-label">
              <input
                id="task-completed"
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                disabled={isSubmitting || isGeneratingAI}
              />
              Mark as Completed
            </label>
          </div>
        )}
      </div>

      {/* Submit Action */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary btn-submit"
          disabled={isSubmitting || isGeneratingAI || !title.trim()}
        >
          {isSubmitting ? (
            <span>⌛ Saving...</span>
          ) : editingTask ? (
            'Update Task'
          ) : (
            'Create Task (POST /tasks)'
          )}
        </button>
      </div>
    </form>
  );
}
