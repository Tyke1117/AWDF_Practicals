import React, { useState, useEffect } from 'react';

export default function TaskForm({ onSubmit, editingTask, onCancelEdit, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'medium');
      setCompleted(editingTask.completed || false);
    } else {
      resetForm();
    }
  }, [editingTask]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCompleted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      completed
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

      <div className="form-group">
        <label htmlFor="task-title">Title *</label>
        <input
          id="task-title"
          type="text"
          className="form-control"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          className="form-control textarea"
          placeholder="Add details or context..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-row">
        <div className="form-group half">
          <label htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            className="form-control"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="low">🔵 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
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
                disabled={isSubmitting}
              />
              Mark as Completed
            </label>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary btn-submit"
          disabled={isSubmitting || !title.trim()}
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
