import React, { useState } from 'react';
import TaskItem from './TaskItem';

export default function TaskList({
  tasks,
  loading,
  error,
  filterStatus = 'all',
  setFilterStatus,
  stats,
  onToggleStatus,
  onUpdateTaskStatus,
  onEdit,
  onDelete,
  isOptimized,
  setIsOptimized
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering logic that guarantees 100% synchronization with counts
  const filteredTasks = tasks.filter((t) => {
    let matchesFilter = false;
    if (filterStatus === 'all') {
      matchesFilter = true;
    } else if (filterStatus === 'pending') {
      matchesFilter = t.status === 'pending' || (!t.completed && t.status !== 'in-progress' && t.status !== 'completed');
    } else if (filterStatus === 'in-progress') {
      matchesFilter = t.status === 'in-progress';
    } else if (filterStatus === 'completed') {
      matchesFilter = t.status === 'completed' || t.completed === true;
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  const filterTabs = [
    { id: 'all', label: 'All Tasks', count: stats?.total ?? tasks.length },
    {
      id: 'pending',
      label: 'Pending',
      count: stats?.pending ?? tasks.filter((t) => t.status === 'pending' || (!t.completed && t.status !== 'in-progress' && t.status !== 'completed')).length
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      count: stats?.inProgress ?? tasks.filter((t) => t.status === 'in-progress').length
    },
    {
      id: 'completed',
      label: 'Completed',
      count: stats?.completed ?? tasks.filter((t) => t.status === 'completed' || t.completed === true).length
    }
  ];

  return (
    <div className="task-list-section">
      <div className="list-controls-bar">
        {/* Search input - used for DevTools Profiler re-render demonstration */}
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Type to search tasks (Watch React Profiler / Render Count)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        {/* Filter Tabs matching Hero Stats 1:1 */}
        <div className="filter-pills" role="tablist">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filterStatus === tab.id}
              className={`filter-pill ${filterStatus === tab.id ? 'active' : ''}`}
              onClick={() => setFilterStatus(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="pill-count">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Profiler Optimization Control Bar */}
      <div className="profiler-demo-banner">
        <div className="profiler-left">
          <span className="profiler-badge">DevTools Profiler Experiment (CO1 / PO5)</span>
          <p className="profiler-text">
            {isOptimized ? (
              <span><strong>React.memo ON:</strong> Child items won't re-render as you type in search. Render count stays unchanged!</span>
            ) : (
              <span><strong>React.memo OFF:</strong> Parent state updates cause ALL child task items to re-render needlessly on each keystroke!</span>
            )}
          </p>
        </div>
        <button
          type="button"
          className={`toggle-opt-btn ${isOptimized ? 'opt-active' : 'opt-inactive'}`}
          onClick={() => setIsOptimized(!isOptimized)}
        >
          {isOptimized ? 'Disable React.memo (Demonstrate Re-render)' : 'Enable React.memo (Optimized)'}
        </button>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="loading-state-card">
          <div className="mini-spinner"></div>
          <span>Loading tasks from backend database...</span>
        </div>
      )}

      {error && (
        <div className="error-alert">
          <strong>Notice:</strong> {error} (Using local resilient dataset).
        </div>
      )}

      {/* Task Items List */}
      {!loading && filteredTasks.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon">📝</div>
          <h3>No {filterStatus === 'all' ? '' : filterStatus.replace('-', ' ')} tasks found</h3>
          <p>
            {searchQuery
              ? `No tasks matching "${searchQuery}". Try clearing search.`
              : filterStatus !== 'all'
              ? `There are currently no tasks with status "${filterStatus.replace('-', ' ')}". Switch to "All Tasks" or create a new one!`
              : 'Add your first task using the form on the left!'}
          </p>
          {filterStatus !== 'all' && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '0.75rem' }}
              onClick={() => setFilterStatus('all')}
            >
              Show All Tasks ({stats?.total ?? tasks.length})
            </button>
          )}
        </div>
      ) : (
        <div className="tasks-container">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id || task._id}
              task={task}
              onToggleStatus={onToggleStatus}
              onUpdateTaskStatus={onUpdateTaskStatus}
              onEdit={onEdit}
              onDelete={onDelete}
              isOptimized={isOptimized}
            />
          ))}
        </div>
      )}
    </div>
  );
}
