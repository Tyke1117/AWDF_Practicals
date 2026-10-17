import React, { useRef, useEffect } from 'react';

/**
 * TaskItem Component
 * 
 * Supplementary Problem 3: React DevTools Profiler & Re-render Optimization
 * 
 * When `isOptimized` is true, this component uses `React.memo` and avoids
 * re-rendering when the parent component re-renders (e.g., when typing in a search input).
 * A live render badge tracks render cycles to demonstrate profiling findings visually.
 */
function TaskItemBase({
  task,
  onToggleStatus,
  onUpdateTaskStatus,
  onEdit,
  onDelete,
  isOptimized = true
}) {
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  const itemRef = useRef(null);

  // Briefly pulse border when component renders to make re-renders visually observable
  useEffect(() => {
    if (itemRef.current && renderCountRef.current > 1) {
      itemRef.current.classList.add('flash-rerender');
      const timer = setTimeout(() => {
        if (itemRef.current) itemRef.current.classList.remove('flash-rerender');
      }, 400);
      return () => clearTimeout(timer);
    }
  });

  const isCompleted = task.status === 'completed' || task.completed === true;
  const currentStatus = isCompleted
    ? 'completed'
    : task.status === 'in-progress'
    ? 'in-progress'
    : 'pending';

  const priorityColors = {
    high: { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
    medium: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
    low: { bg: '#dcfce7', text: '#15803d', border: '#86efac' }
  };

  const priorityStyle = priorityColors[task.priority] || priorityColors.medium;

  return (
    <div
      ref={itemRef}
      className={`task-item-card ${isCompleted ? 'task-completed' : ''} ${task.isOptimistic ? 'task-optimistic' : ''}`}
    >
      <div className="task-item-left">
        <label className="custom-checkbox" title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}>
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => onToggleStatus(task)}
            disabled={task.isOptimistic}
          />
          <span className="checkbox-checkmark"></span>
        </label>

        <div className="task-details">
          <div className="task-title-row">
            <h4 className="task-title">{task.title}</h4>
            <span
              className="badge-priority"
              style={{
                backgroundColor: priorityStyle.bg,
                color: priorityStyle.text,
                borderColor: priorityStyle.border
              }}
            >
              {task.priority ? task.priority.toUpperCase() : 'MEDIUM'}
            </span>
            {task.isOptimistic && <span className="badge-optimistic">Saving...</span>}
          </div>

          {task.description && <p className="task-description">{task.description}</p>}

          <div className="task-meta">
            <span className="task-date">
              📅 {new Date(task.createdAt || Date.now()).toLocaleDateString()}
            </span>

            {/* Interactive Status Selector directly on task card */}
            <div className="status-selector-wrapper">
              <select
                className={`status-selector status-${currentStatus}`}
                value={currentStatus}
                onChange={(e) => onUpdateTaskStatus && onUpdateTaskStatus(task, e.target.value)}
                disabled={task.isOptimistic}
                title="Change task status directly"
              >
                <option value="pending">🟡 Pending</option>
                <option value="in-progress">🔵 In Progress</option>
                <option value="completed">🟢 Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="task-item-right">
        {/* Render count badge for DevTools Profiler demonstration */}
        <div
          className={`render-counter ${renderCountRef.current > 3 ? 'render-warning' : ''}`}
          title="Tracks how many times this child component re-rendered"
        >
          <span className="render-dot"></span>
          <span>Renders: <strong>{renderCountRef.current}</strong></span>
        </div>

        <div className="task-actions">
          <button
            type="button"
            className="btn-icon btn-edit"
            onClick={() => onEdit(task)}
            title="Edit Task"
            disabled={task.isOptimistic}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            type="button"
            className="btn-icon btn-delete"
            onClick={() => onDelete(task)}
            title="Delete Task"
            disabled={task.isOptimistic}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// React.memo wrapping: prevents re-rendering if props (task, callbacks) haven't changed!
const MemoizedTaskItem = React.memo(TaskItemBase, (prev, next) => {
  if (!next.isOptimized) {
    // If user turned off optimization to view un-memoized profiler re-renders:
    return false;
  }
  return (
    (prev.task.id || prev.task._id) === (next.task.id || next.task._id) &&
    prev.task.title === next.task.title &&
    prev.task.description === next.task.description &&
    prev.task.status === next.task.status &&
    prev.task.completed === next.task.completed &&
    prev.task.priority === next.task.priority &&
    prev.task.isOptimistic === next.task.isOptimistic &&
    prev.onToggleStatus === next.onToggleStatus &&
    prev.onUpdateTaskStatus === next.onUpdateTaskStatus &&
    prev.onEdit === next.onEdit &&
    prev.onDelete === next.onDelete &&
    prev.isOptimized === next.isOptimized
  );
});

export default MemoizedTaskItem;
