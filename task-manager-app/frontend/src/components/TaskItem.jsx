import React from 'react';

export default function TaskItem({ task, onToggleComplete, onEdit, onDelete }) {
  const isOptimistic = task.isOptimistic;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="badge badge-high">🔴 High</span>;
      case 'low':
        return <span className="badge badge-low">🔵 Low</span>;
      default:
        return <span className="badge badge-medium">🟡 Medium</span>;
    }
  };

  return (
    <article className={`task-card ${task.completed ? 'completed' : ''} ${isOptimistic ? 'optimistic-pending' : ''}`}>
      <div className="task-checkbox-container">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.completed || false}
          onChange={() => onToggleComplete(task)}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          disabled={isOptimistic}
        />
      </div>

      <div className="task-details">
        <div className="task-header">
          <h4 className="task-title">{task.title}</h4>
          <div className="task-badges">
            {getPriorityBadge(task.priority)}
            {task.isAiGenerated && (
              <span className="badge badge-ai-tag" title="Description generated or assisted by AI">
                ✨ AI Assisted
              </span>
            )}
            {isOptimistic && (
              <span className="badge badge-optimistic" title="Saving to MongoDB...">
                ⏳ Syncing...
              </span>
            )}
          </div>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-meta">
          <span className="task-date">
            📅 {new Date(task.createdAt || Date.now()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>

      <div className="task-actions">
        <button
          className="btn-icon btn-edit"
          onClick={() => onEdit(task)}
          title="Edit task"
          disabled={isOptimistic}
        >
          ✏️
        </button>
        <button
          className="btn-icon btn-delete"
          onClick={() => onDelete(task)}
          title="Delete task"
          disabled={isOptimistic}
        >
          🗑️
        </button>
      </div>
    </article>
  );
}
