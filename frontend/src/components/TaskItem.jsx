import React from 'react';

export default function TaskItem({ task, onToggleComplete, onEdit, onDelete }) {
  const isOptimistic = Boolean(task.isOptimistic);
  const taskId = task.id || task._id;

  const priorityClasses = {
    low: 'badge-priority-low',
    medium: 'badge-priority-medium',
    high: 'badge-priority-high'
  };

  const formattedDate = task.createdAt
    ? new Date(task.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <div className={`task-card card ${task.completed ? 'is-completed' : ''} ${isOptimistic ? 'is-optimistic' : ''}`}>
      <div className="task-content">
        <label className="custom-checkbox-wrapper">
          <input
            type="checkbox"
            checked={Boolean(task.completed)}
            onChange={() => onToggleComplete(task)}
            disabled={isOptimistic}
            className="custom-checkbox"
          />
          <span className="checkbox-visual"></span>
        </label>

        <div className="task-details">
          <div className="task-header-row">
            <h3 className={`task-title ${task.completed ? 'strikethrough' : ''}`}>
              {task.title}
            </h3>
            <div className="task-badges">
              {isOptimistic && (
                <span className="badge badge-warning optimistic-pill">
                  Syncing to MongoDB...
                </span>
              )}
              <span className={`badge ${priorityClasses[task.priority] || 'badge-priority-medium'}`}>
                {task.priority || 'medium'}
              </span>
            </div>
          </div>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          <div className="task-meta">
            {formattedDate && (
              <span className="task-timestamp">
                🕒 Created {formattedDate}
              </span>
            )}
            <span className="task-id-badge">ID: {taskId ? taskId.slice(-6) : 'sync'}</span>
          </div>
        </div>
      </div>

      <div className="task-actions">
        <button
          type="button"
          className="btn-icon btn-edit"
          onClick={() => onEdit(task)}
          disabled={isOptimistic}
          title="Edit Task"
        >
          ✏️
        </button>
        <button
          type="button"
          className="btn-icon btn-delete"
          onClick={() => onDelete(task)}
          disabled={isOptimistic}
          title="Delete Task"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
