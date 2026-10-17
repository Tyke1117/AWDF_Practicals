import React, { useState } from 'react';
import TaskItem from './TaskItem';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';

export default function TaskList({
  tasks,
  loading,
  error,
  onRetry,
  onToggleComplete,
  onEdit,
  onDelete
}) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === 'pending') return !task.completed;
    if (filterStatus === 'completed') return task.completed;
    if (filterStatus === 'high') return task.priority === 'high';

    return true;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <section className="task-list-section card">
      <div className="list-header">
        <div>
          <h2>📋 Task Directory</h2>
          <p className="subtitle">
            {totalCount === 0
              ? 'No tasks stored in MongoDB yet.'
              : `${completedCount} of ${totalCount} tasks completed`}
          </p>
        </div>

        <div className="list-controls">
          <input
            type="search"
            className="search-input"
            placeholder="🔍 Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="filter-tabs">
            <button
              className={`tab ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({tasks.length})
            </button>
            <button
              className={`tab ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Pending ({tasks.filter((t) => !t.completed).length})
            </button>
            <button
              className={`tab ${filterStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('completed')}
            >
              Completed ({completedCount})
            </button>
            <button
              className={`tab ${filterStatus === 'high' ? 'active' : ''}`}
              onClick={() => setFilterStatus('high')}
            >
              🔥 High Priority
            </button>
          </div>
        </div>
      </div>

      {loading && <Spinner label="Fetching tasks from http://localhost:5000/tasks..." />}

      {error && !loading && <ErrorMessage message={error} onRetry={onRetry} />}

      {!loading && !error && (
        <div className="tasks-container">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id || task._id || task.tempId}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>
                {search || filterStatus !== 'all'
                  ? 'No tasks match your filter criteria.'
                  : 'Your task list is empty. Add a task above to get started!'}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
