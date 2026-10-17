import React, { useState, useEffect } from 'react';

export default function TaskForm({ onSubmit, editingTask, onCancelEdit, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      const taskStatus = editingTask.status || (editingTask.completed ? 'completed' : 'pending');
      setStatus(taskStatus);
      setPriority(editingTask.priority || 'medium');
    } else {
      setTitle('');
      setDescription('');
      setStatus('pending');
      setPriority('medium');
    }
    setErrors({});
  }, [editingTask]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Title is required';
    } else if (title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      completed: status === 'completed',
      priority
    });

    if (!editingTask) {
      setTitle('');
      setDescription('');
      setStatus('pending');
      setPriority('medium');
    }
  };

  return (
    <div className="task-form-card">
      <div className="form-header">
        <h3 className="form-title">
          {editingTask ? '✏️ Edit Task' : '➕ Create New Task'}
        </h3>
        <p className="form-subtitle">
          {editingTask
            ? 'Update task properties and persistence state'
            : 'Fill in details to persist task to database'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Title Input */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-title">
            Task Title <span className="required-star">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            className={`form-input ${errors.title ? 'input-error' : ''}`}
            placeholder="e.g. Implement React.lazy chunk splitting"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        {/* Description Input */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-desc">
            Description / Performance Notes
          </label>
          <textarea
            id="task-desc"
            className="form-textarea"
            rows="3"
            placeholder="Technical details, bundle requirements, or notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Status & Priority Row */}
        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label" htmlFor="task-status">Status</label>
            <select
              id="task-status"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="form-actions">
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
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-flex">
                <span className="btn-spinner"></span>
                Saving...
              </span>
            ) : editingTask ? (
              'Update Task'
            ) : (
              'Create Task'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
