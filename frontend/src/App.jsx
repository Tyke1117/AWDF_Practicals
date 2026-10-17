import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import ConfirmModal from './components/ConfirmModal';
import Toast from './components/Toast';
import PipelineInfo from './components/PipelineInfo';
import {
  getUser,
  getToken,
  getMe,
  logoutUser,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  setOnUnauthorized
} from './services/api';
import './App.css';

export default function App() {
  const [user, setUser] = useState(() => getUser());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPipelineModal, setShowPipelineModal] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  /**
   * Supplementary Problem 2: 401 Token Expiry Handling
   * Automatically clears state and prompts user to re-authenticate
   */
  useEffect(() => {
    setOnUnauthorized((msg) => {
      setUser(null);
      setTasks([]);
      showToast(msg || 'Your session has expired. Please log in again.', 'warning');
    });
  }, []);

  /**
   * Supplementary Problem 1: Validate session on mount using /me endpoint
   */
  useEffect(() => {
    const token = getToken();
    if (token) {
      getMe()
        .then((res) => {
          if (res.data) {
            setUser(res.data);
          }
        })
        .catch(() => {
          // Token invalid or expired - cleared by interceptor
          setUser(null);
        });
    }
  }, []);

  /**
   * Load tasks for currently authenticated user
   */
  const loadTasks = useCallback(async () => {
    if (!getToken()) return;

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
      setError(err.message || 'Unable to connect to backend.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user, loadTasks]);

  /**
   * Supplementary Problem 3: Client logout mechanism
   */
  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setTasks([]);
    setEditingTask(null);
    showToast('Logged out successfully. JWT cleared from storage.', 'info');
  };

  /**
   * Task Creation & Update Flow (with Optimistic UI updates)
   */
  const handleCreateOrUpdateTask = async (taskData) => {
    setIsSubmitting(true);

    if (editingTask) {
      // UPDATE FLOW (PUT /api/tasks/:id)
      const taskId = editingTask.id || editingTask._id;
      try {
        const response = await updateTask(taskId, taskData);
        const updatedItem = response.data || response;

        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            (t.id === taskId || t._id === taskId) ? updatedItem : t
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
      // OPTIMISTIC CREATE FLOW (POST /api/tasks)
      const tempId = `optimistic-${Date.now()}`;
      const optimisticTask = {
        ...taskData,
        id: tempId,
        tempId: tempId,
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };

      // 1. Optimistically display in list
      setTasks((prevTasks) => [optimisticTask, ...prevTasks]);
      showToast('Creating task... (Optimistic State)', 'info');

      try {
        // 2. Transmit to server (Auth & Validation Middleware Pipeline)
        const response = await createTask(taskData);
        const savedTask = response.data || response;

        // 3. Replace optimistic task with MongoDB persistent object
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.tempId === tempId ? savedTask : t))
        );
        showToast('Task saved to MongoDB!', 'success');
      } catch (err) {
        // 4. Rollback on failure
        setTasks((prevTasks) => prevTasks.filter((t) => t.tempId !== tempId));
        showToast(`Validation / Server Error: ${err.message}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  /**
   * Toggle task completion status
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
      showToast(`Update failed: ${err.message}`, 'error');
    }
  };

  /**
   * Delete confirmation dialog handling
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
      showToast('Task deleted from MongoDB!', 'success');
      setTaskToDelete(null);
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="app">
      {/* Toast Notification Banner */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task Confirmation"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action permanently removes the record from MongoDB.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
        isDeleting={isDeleting}
      />

      {/* Pipeline Architecture Modal */}
      <PipelineInfo
        isOpen={showPipelineModal}
        onClose={() => setShowPipelineModal(false)}
      />

      {/* Navigation Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        onTogglePipelineInfo={() => setShowPipelineModal(true)}
      />

      <main className="main-content">
        {!user ? (
          // Unauthenticated State: Show Authentication Portal
          <div className="auth-view-wrapper">
            <div className="auth-hero-banner">
              <h2>Secure Task Management</h2>
              <p>
                Experience practical full-stack security with <strong>bcrypt password hashing</strong>,
                <strong> JWT authorization</strong>, and <strong>server-side input validation pipelines</strong>.
              </p>
              <div className="pipeline-mini-preview">
                <span className="mini-badge">POST /register (bcrypt 10)</span>
                <span className="mini-arrow">➔</span>
                <span className="mini-badge">POST /login (JWT 1h)</span>
                <span className="mini-arrow">➔</span>
                <span className="mini-badge">Bearer &lt;token&gt;</span>
                <span className="mini-arrow">➔</span>
                <span className="mini-badge">[Auth] ➔ [Validate] ➔ DB</span>
              </div>
            </div>

            <AuthModal
              onAuthSuccess={(userData) => setUser(userData)}
              showToast={showToast}
            />
          </div>
        ) : (
          // Authenticated Dashboard: Manage Tasks
          <div className="dashboard-layout">
            <aside className="sidebar">
              <TaskForm
                onSubmit={handleCreateOrUpdateTask}
                editingTask={editingTask}
                onCancelEdit={() => setEditingTask(null)}
                isSubmitting={isSubmitting}
              />

              <div className="info-card card">
                <div className="card-header">
                  <h3>🔐 Security Pipeline Active</h3>
                </div>
                <ul className="info-list">
                  <li>
                    <strong>Auth Middleware:</strong> Verifies <code>Authorization: Bearer &lt;token&gt;</code> before every task route.
                  </li>
                  <li>
                    <strong>Validation Middleware:</strong> Rejects blank titles with HTTP 400 Bad Request.
                  </li>
                  <li>
                    <strong>Data Isolation:</strong> Queries are scoped strictly to <code>user: req.user.id</code>.
                  </li>
                  <li>
                    <strong>Expiry Handling:</strong> Automatic redirect to login if JWT expires (HTTP 401).
                  </li>
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
        )}
      </main>

      <footer className="app-footer">
        <p>AWDF Practical 7 • Authentication & Middleware Pipeline • Express + JWT + bcryptjs + Mongoose + React</p>
      </footer>
    </div>
  );
}
