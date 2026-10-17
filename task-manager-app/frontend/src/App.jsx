import React, { useState, useEffect, useCallback } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import Toast from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import { getTasks, createTask, updateTask, deleteTask } from './services/api';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTasks();
      if (response && response.success && Array.isArray(response.data)) {
        setTasks(response.data);
      } else if (Array.isArray(response)) {
        setTasks(response);
      } else {
        throw new Error('Unexpected data format received from Express backend');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to Node backend.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /**
   * Supplementary Problem 1: Optimistic UI update for task creation
   * Shows the new task in the list immediately, before the server confirms.
   */
  const handleCreateOrUpdateTask = async (taskData) => {
    setIsSubmitting(true);

    if (editingTask) {
      // UPDATE FLOW (PUT /tasks/:id)
      try {
        const response = await updateTask(editingTask.id || editingTask._id, taskData);
        const updatedItem = response.data || response;

        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            (t.id === editingTask.id || t._id === editingTask._id) ? updatedItem : t
          )
        );
        setEditingTask(null);
        showToast('Task updated successfully!', 'success');
      } catch (err) {
        showToast(`Failed to update task: ${err.message}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // OPTIMISTIC CREATE FLOW (POST /tasks)
      const tempId = `optimistic-${Date.now()}`;
      const optimisticTask = {
        ...taskData,
        id: tempId,
        tempId: tempId,
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };

      // 1. Instantly update local state UI
      setTasks((prevTasks) => [optimisticTask, ...prevTasks]);
      showToast('Creating task... (Optimistic UI Update)', 'success');

      try {
        // 2. Perform backend API request
        const response = await createTask(taskData);
        const savedTask = response.data || response;

        // 3. Replace optimistic task with persistent MongoDB task from backend response
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.tempId === tempId ? savedTask : t))
        );
        showToast('Task persisted to MongoDB!', 'success');
      } catch (err) {
        // 4. Rollback optimistic UI update on error
        setTasks((prevTasks) => prevTasks.filter((t) => t.tempId !== tempId));
        showToast(`Failed to create task: ${err.message}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  /**
   * Toggle task completion status (PUT /tasks/:id)
   */
  const handleToggleComplete = async (task) => {
    const taskId = task.id || task._id;
    const newStatus = !task.completed;

    // Optimistic toggle
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        (t.id === taskId || t._id === taskId) ? { ...t, completed: newStatus } : t
      )
    );

    try {
      await updateTask(taskId, { completed: newStatus });
      showToast(`Task marked as ${newStatus ? 'completed' : 'pending'}`, 'success');
    } catch (err) {
      // Revert on error
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          (t.id === taskId || t._id === taskId) ? { ...t, completed: task.completed } : t
        )
      );
      showToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  /**
   * Supplementary Problem 2: Confirmation dialog before deleting a task
   */
  const handlePromptDelete = (task) => {
    setTaskToDelete(task);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    const taskId = taskToDelete.id || taskToDelete._id;
    setIsDeleting(true);

    try {
      await deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((t) => (t.id !== taskId && t._id !== taskId)));
      showToast('Task deleted successfully from MongoDB!', 'success');
      setTaskToDelete(null);
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="app">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task Confirmation"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action will permanently remove the record from MongoDB.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
        isDeleting={isDeleting}
      />

      <header className="app-header">
        <div className="header-container">
          <div className="brand">
            <span className="brand-logo">⚡</span>
            <div>
              <h1>Trackify</h1>
              <p className="subtitle">Practical 6: React + Express + MongoDB Full-Stack Integration</p>
            </div>
          </div>
          <div className="connection-badge">
            <span className="status-dot"></span>
            Backend: <code>http://localhost:5000</code>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="grid-layout">
          <aside className="sidebar">
            <TaskForm
              onSubmit={handleCreateOrUpdateTask}
              editingTask={editingTask}
              onCancelEdit={() => setEditingTask(null)}
              isSubmitting={isSubmitting}
            />

            <div className="info-card card">
              <h3>💡 Practical 6 Key Features</h3>
              <ul className="info-list">
                <li><strong>CORS Enabled:</strong> Express backend configured with <code>cors()</code> middleware.</li>
                <li><strong>Central API Service:</strong> Standardized <code>api.js</code> fetch abstraction.</li>
                <li><strong>Optimistic Updates:</strong> Instant UI state rendering prior to HTTP response.</li>
                <li><strong>Confirmation Modal:</strong> Prevents accidental deletions.</li>
                <li><strong>Toast Alerts:</strong> Live operation feedback.</li>
                <li><strong>MongoDB Persistence:</strong> Data persists across browser refreshes.</li>
              </ul>
            </div>
          </aside>

          <section className="content-area">
            <TaskList
              tasks={tasks}
              loading={loading}
              error={error}
              onRetry={loadTasks}
              onToggleComplete={handleToggleComplete}
              onEdit={(task) => setEditingTask(task)}
              onDelete={handlePromptDelete}
            />
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>AWDF Practical 6 • Full Stack Web Application • React Frontend + Node/Express Backend + MongoDB</p>
      </footer>
    </div>
  );
}
