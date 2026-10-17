import React, { useState, useEffect } from 'react';

export default function TaskForm({ onSubmit, editingTask, onCancelEdit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'medium'
      });
      setValidationError('');
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium'
      });
    }
  }, [editingTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationError && name === 'title') {
      setValidationError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setValidationError('Task title is required. The validation middleware rejects empty titles.');
      return;
    }

    setValidationError('');
    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority
    });

    if (!editingTask) {
      setFormData({
        title: '',
        description: '',
        priority: 'medium'
      });
    }
  };

  return (
    <div className="task-form-card card">
      <div className="card-header">
        <h2>{editingTask ? '✏️ Edit Task' : '➕ Create New Task'}</h2>
        <span className="badge badge-info">Protected Route</span>
      </div>

      {validationError && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="task-title">
            Task Title <span className="required">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Test JWT auth middleware"
            maxLength={120}
            className={`form-control ${validationError ? 'is-invalid' : ''}`}
          />
          <small className="char-count">{formData.title.length}/120 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="task-desc">Description (Optional)</label>
          <textarea
            id="task-desc"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed notes or requirements for this task..."
            rows={3}
            maxLength={1000}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-priority">Priority Level</label>
          <select
            id="task-priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="form-control select-control"
          >
            <option value="low">🟢 Low Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="high">🔴 High Priority</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-spinner-wrap">
                <span className="spinner-sm"></span> Saving...
              </span>
            ) : editingTask ? (
              'Update Task'
            ) : (
              'Add Task'
            )}
          </button>

          {editingTask && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancelEdit}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
