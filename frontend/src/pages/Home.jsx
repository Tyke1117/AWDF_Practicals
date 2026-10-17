import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { getTasks, createTask, updateTask, deleteTask, normalizeTask } from '../services/api';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  // Active filter state ('all', 'pending', 'in-progress', 'completed')
  const [filterStatus, setFilterStatus] = useState('all');

  // Supplementary Problem 3: Optimization flag for React.memo & useCallback demonstration
  const [isOptimized, setIsOptimized] = useState(true);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTasks();
      if (response && response.data) {
        setTasks(response.data.map(normalizeTask));
      }
    } catch (err) {
      setError(err.message || 'Error fetching tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Derived counts for exact synchronization across cards & filters
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed' || t.completed === true).length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const pending = tasks.filter((t) => t.status === 'pending' || (!t.completed && t.status !== 'in-progress' && t.status !== 'completed')).length;

    return { total, completed, inProgress, pending };
  }, [tasks]);

  // Stable handlers using useCallback to prevent unnecessary child re-renders (PO5)
  const handleToggleStatus = useCallback(async (task) => {
    const isCompleted = task.status === 'completed' || task.completed === true;
    const newStatus = isCompleted ? 'pending' : 'completed';
    const newCompleted = !isCompleted;

    // Optimistic toggle
    setTasks((prev) =>
      prev.map((t) =>
        (t.id || t._id) === (task.id || task._id)
          ? { ...t, status: newStatus, completed: newCompleted }
          : t
      )
    );

    try {
      await updateTask(task.id || task._id, {
        status: newStatus,
        completed: newCompleted
      });
      showToast(`Task marked as ${newStatus}!`, 'success');
    } catch (err) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) =>
          (t.id || t._id) === (task.id || task._id)
            ? { ...t, status: task.status, completed: task.completed }
            : t
        )
      );
      showToast(`Failed to update status: ${err.message}`, 'error');
    }
  }, [showToast]);

  const handleUpdateTaskStatus = useCallback(async (task, newStatus) => {
    const newCompleted = newStatus === 'completed';

    setTasks((prev) =>
      prev.map((t) =>
        (t.id || t._id) === (task.id || task._id)
          ? { ...t, status: newStatus, completed: newCompleted }
          : t
      )
    );

    try {
      await updateTask(task.id || task._id, {
        status: newStatus,
        completed: newCompleted
      });
      showToast(`Task moved to ${newStatus.replace('-', ' ')}!`, 'success');
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) =>
          (t.id || t._id) === (task.id || task._id)
            ? { ...t, status: task.status, completed: task.completed }
            : t
        )
      );
      showToast(`Failed to update status: ${err.message}`, 'error');
    }
  }, [showToast]);

  const handleEditClick = useCallback((task) => {
    setEditingTask(task);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDeleteClick = useCallback((task) => {
    setTaskToDelete(task);
  }, []);

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    const targetId = taskToDelete.id || taskToDelete._id;

    try {
      await deleteTask(targetId);
      setTasks((prev) => prev.filter((t) => (t.id || t._id) !== targetId));
      showToast('Task removed successfully!', 'success');
    } catch (err) {
      showToast(`Failed to delete task: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    setIsSubmitting(true);
    const isComp = formData.status === 'completed' || formData.completed === true;
    const resolvedStatus = isComp ? 'completed' : (formData.status === 'in-progress' ? 'in-progress' : 'pending');

    const cleanData = {
      ...formData,
      status: resolvedStatus,
      completed: isComp
    };

    if (editingTask) {
      try {
        const id = editingTask.id || editingTask._id;
        const res = await updateTask(id, cleanData);
        const updated = normalizeTask(res.data || res);
        setTasks((prev) =>
          prev.map((t) => ((t.id || t._id) === id ? updated : t))
        );
        setEditingTask(null);
        showToast('Task updated successfully!', 'success');
      } catch (err) {
        showToast(`Update error: ${err.message}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Optimistic creation
      const tempId = `temp-${Date.now()}`;
      const optimisticItem = normalizeTask({
        ...cleanData,
        id: tempId,
        _id: tempId,
        createdAt: new Date().toISOString(),
        isOptimistic: true
      });
      setTasks((prev) => [optimisticItem, ...prev]);
      showToast('Creating task...', 'info');

      try {
        const res = await createTask(cleanData);
        const persisted = normalizeTask(res.data || res);
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId || t._id === tempId ? persisted : t))
        );
        showToast('Task saved to persistent storage!', 'success');
      } catch (err) {
        setTasks((prev) => prev.filter((t) => t.id !== tempId && t._id !== tempId));
        showToast(`Failed to create: ${err.message}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="page-container page-home">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task Confirmation"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
        isDeleting={isDeleting}
      />

      {/* Header Banner & Synchronized Interactive Stats */}
      <section className="dashboard-hero">
        <div className="hero-text">
          <h1 className="page-heading">Task Management Dashboard</h1>
          <p className="page-subheading">
            Initial entry point bundle. Loaded immediately on initial page mount (<code>Home.chunk.js</code>).
          </p>
        </div>
        <div className="hero-stats-row">
          <button
            type="button"
            className={`mini-stat-card stat-clickable ${filterStatus === 'all' ? 'stat-active' : ''}`}
            onClick={() => setFilterStatus('all')}
            title="Click to view All Tasks"
          >
            <span className="stat-label">Total Tasks</span>
            <span className="stat-val">{stats.total}</span>
          </button>

          <button
            type="button"
            className={`mini-stat-card stat-clickable ${filterStatus === 'pending' ? 'stat-active' : ''}`}
            onClick={() => setFilterStatus('pending')}
            title="Click to filter Pending Tasks"
          >
            <span className="stat-label">Pending</span>
            <span className="stat-val text-warning">{stats.pending}</span>
          </button>

          <button
            type="button"
            className={`mini-stat-card stat-clickable ${filterStatus === 'in-progress' ? 'stat-active' : ''}`}
            onClick={() => setFilterStatus('in-progress')}
            title="Click to filter In-Progress Tasks"
          >
            <span className="stat-label">In Progress</span>
            <span className="stat-val text-info">{stats.inProgress}</span>
          </button>

          <button
            type="button"
            className={`mini-stat-card stat-clickable ${filterStatus === 'completed' ? 'stat-active' : ''}`}
            onClick={() => setFilterStatus('completed')}
            title="Click to filter Completed Tasks"
          >
            <span className="stat-label">Completed</span>
            <span className="stat-val text-success">{stats.completed}</span>
          </button>
        </div>
      </section>

      {/* Main Grid: Form on Left, List on Right */}
      <div className="dashboard-layout-grid">
        <aside className="dashboard-sidebar">
          <TaskForm
            onSubmit={handleCreateOrUpdate}
            editingTask={editingTask}
            onCancelEdit={() => setEditingTask(null)}
            isSubmitting={isSubmitting}
          />
        </aside>

        <main className="dashboard-main">
          <TaskList
            tasks={tasks}
            loading={loading}
            error={error}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            stats={stats}
            onToggleStatus={handleToggleStatus}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            isOptimized={isOptimized}
            setIsOptimized={setIsOptimized}
          />
        </main>
      </div>
    </div>
  );
}
