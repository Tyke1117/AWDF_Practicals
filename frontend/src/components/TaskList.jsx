import React, { useState, useMemo } from 'react';
import TaskItem from './TaskItem';

export default function TaskList({
  tasks,
  loading,
  error,
  onRetry,
  onToggleComplete,
  onEdit,
  onDelete
}) {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'completed'
  const [filterPriority, setFilterPriority] = useState('all'); // 'all' | 'low' | 'medium' | 'high'
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (filterStatus === 'completed' && !task.completed) return false;
      if (filterStatus === 'pending' && task.completed) return false;

      // Priority filter
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = (task.description || '').toLowerCase().includes(query);
        if (!titleMatch && !descMatch) return false;
      }

      return true;
    });
  }, [tasks, filterStatus, filterPriority, searchTerm]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [tasks]);

  return (
    <div className="task-list-container">
      {/* Controls & Metrics Header */}
      <div className="list-controls-card card">
        <div className="controls-top">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search your tasks by title or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="task-stats">
            <span className="stat-pill stat-total">Total: {stats.total}</span>
            <span className="stat-pill stat-pending">Pending: {stats.pending}</span>
            <span className="stat-pill stat-completed">Done: {stats.completed}</span>
          </div>
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <span className="filter-label">Status:</span>
            <div className="button-group">
              <button
                type="button"
                className={`btn-filter ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`btn-filter ${filterStatus === 'pending' ? 'active' : ''}`}
                onClick={() => setFilterStatus('pending')}
              >
                Pending
              </button>
              <button
                type="button"
                className={`btn-filter ${filterStatus === 'completed' ? 'active' : ''}`}
                onClick={() => setFilterStatus('completed')}
              >
                Completed
              </button>
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Priorities</option>
              <option value="high">🔴 High Only</option>
              <option value="medium">🟡 Medium Only</option>
              <option value="low">🟢 Low Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main List Rendering */}
      {loading ? (
        <div className="loading-state card">
          <div className="spinner"></div>
          <p>Verifying JWT & Loading user tasks from MongoDB...</p>
        </div>
      ) : error ? (
        <div className="error-state card">
          <span className="error-state-icon">⚠️</span>
          <h3>Failed to load tasks</h3>
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={onRetry}>
            🔄 Try Again
          </button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">📝</div>
          <h3>{tasks.length === 0 ? 'No tasks yet!' : 'No matching tasks found'}</h3>
          <p>
            {tasks.length === 0
              ? 'Your authenticated workspace is ready. Create your first task using the form on the left.'
              : 'Try adjusting your search query or filter settings.'}
          </p>
        </div>
      ) : (
        <div className="task-items-list">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.tempId || task.id || task._id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
