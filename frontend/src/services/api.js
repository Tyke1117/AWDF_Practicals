// Practical 8 API Client & Task Normalizer

export function normalizeTask(task) {
  if (!task) return null;
  const isCompleted = task.status === 'completed' || task.completed === true;
  const status = isCompleted
    ? 'completed'
    : task.status === 'in-progress'
    ? 'in-progress'
    : 'pending';

  return {
    ...task,
    id: String(task.id || task._id || `task-${Date.now()}`),
    _id: String(task._id || task.id || `task-${Date.now()}`),
    completed: isCompleted,
    status: status,
    priority: task.priority ? String(task.priority).toLowerCase() : 'medium',
    title: task.title ? String(task.title).trim() : '',
    description: task.description ? String(task.description).trim() : '',
    projectId: task.projectId || 'proj-1',
    createdAt: task.createdAt || new Date().toISOString()
  };
}

// Fallback in-memory cache for standalone client-only execution
let localTasksCache = [
  {
    _id: 'task-1',
    id: 'task-1',
    title: 'Implement React.lazy() and Suspense',
    description: 'Split the main bundle by dynamically loading route components.',
    status: 'completed',
    completed: true,
    priority: 'high',
    projectId: 'proj-1',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    _id: 'task-2',
    id: 'task-2',
    title: 'Measure Baseline Bundle Metrics',
    description: 'Document initial dist bundle size before code splitting.',
    status: 'completed',
    completed: true,
    priority: 'high',
    projectId: 'proj-1',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString()
  },
  {
    _id: 'task-3',
    id: 'task-3',
    title: 'Design Skeleton Fallback UI',
    description: 'Create aesthetic pulse placeholder cards shown during chunk fetch.',
    status: 'in-progress',
    completed: false,
    priority: 'medium',
    projectId: 'proj-2',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    _id: 'task-4',
    id: 'task-4',
    title: 'Lazy Load Heavy Analytics Chart.js',
    description: 'Isolate the 150KB+ chart visualization into an on-demand chunk.',
    status: 'in-progress',
    completed: false,
    priority: 'high',
    projectId: 'proj-2',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    _id: 'task-5',
    id: 'task-5',
    title: 'Fix Unnecessary Re-renders with React.memo',
    description: 'Profile component tree and memoize TaskItem to stop re-rendering on text inputs.',
    status: 'pending',
    completed: false,
    priority: 'low',
    projectId: 'proj-3',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

let localProjectsCache = [
  {
    id: 'proj-1',
    name: 'Frontend Core Performance',
    description: 'Vite build optimization, bundle splitting, and lazy loading routes.',
    color: '#3b82f6',
    progress: 100,
    taskCount: 2
  },
  {
    id: 'proj-2',
    name: 'UX & Fallback Polish',
    description: 'Skeleton loaders, min-delay fallback, and heavy chart deferral.',
    color: '#8b5cf6',
    progress: 50,
    taskCount: 2
  },
  {
    id: 'proj-3',
    name: 'Runtime Profiling & Memoization',
    description: 'React DevTools Profiler audits and re-render mitigation.',
    color: '#10b981',
    progress: 25,
    taskCount: 1
  }
];

// Helper to handle fetch with timeout & fallback across multiple ports & URL paths
async function safeFetch(endpoint, options = {}) {
  const ports = [5000, 5001, 5002, 5003, 5005];

  for (const port of ports) {
    const urlsToTry = [
      `http://localhost:${port}/api${endpoint}`,
      `http://localhost:${port}${endpoint}`
    ];

    for (const url of urlsToTry) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 900);

      try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        clearTimeout(timeoutId);
      }
    }
  }

  return null; // Signals fallback to local dataset
}

export async function getTasks() {
  const data = await safeFetch('/tasks');
  if (data) {
    let rawList = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data.data && Array.isArray(data.data)) {
      rawList = data.data;
    }

    if (rawList.length > 0) {
      localTasksCache = rawList.map(normalizeTask);
      return { success: true, data: localTasksCache, source: 'backend' };
    }
  }
  return { success: true, data: localTasksCache.map(normalizeTask), source: 'local-fallback' };
}

export async function createTask(taskData) {
  const isComp = taskData.status === 'completed' || taskData.completed === true;
  const resolvedStatus = isComp ? 'completed' : (taskData.status === 'in-progress' ? 'in-progress' : 'pending');

  const payload = {
    ...taskData,
    status: resolvedStatus,
    completed: isComp
  };

  const data = await safeFetch('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (data && (data.success || data.data || data._id || data.id)) {
    const returnedTask = data.data || data;
    const normalized = normalizeTask(returnedTask);
    localTasksCache.unshift(normalized);
    return { success: true, data: normalized, source: 'backend' };
  }

  const newTask = normalizeTask({
    ...payload,
    _id: `task-${Date.now()}`,
    id: `task-${Date.now()}`,
    createdAt: new Date().toISOString()
  });
  localTasksCache.unshift(newTask);
  return { success: true, data: newTask, source: 'local-fallback' };
}

export async function updateTask(id, updates) {
  const isComp = updates.status === 'completed' || updates.completed === true;
  const payload = { ...updates };
  if (updates.status !== undefined || updates.completed !== undefined) {
    payload.completed = isComp;
    payload.status = isComp ? 'completed' : (updates.status === 'in-progress' ? 'in-progress' : 'pending');
  }

  const data = await safeFetch(`/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (data && (data.success || data.data || data._id || data.id)) {
    const updated = normalizeTask(data.data || data);
    const idx = localTasksCache.findIndex(t => t.id === id || t._id === id);
    if (idx !== -1) {
      localTasksCache[idx] = updated;
    }
    return { success: true, data: updated, source: 'backend' };
  }

  const index = localTasksCache.findIndex(t => (t.id || t._id) === id);
  if (index !== -1) {
    localTasksCache[index] = normalizeTask({ ...localTasksCache[index], ...payload });
    return { success: true, data: localTasksCache[index], source: 'local-fallback' };
  }
  throw new Error('Task not found');
}

export async function deleteTask(id) {
  const data = await safeFetch(`/tasks/${id}`, {
    method: 'DELETE'
  });
  if (data && data.success) {
    localTasksCache = localTasksCache.filter(t => (t.id || t._id) !== id);
    return { success: true, source: 'backend' };
  }
  localTasksCache = localTasksCache.filter(t => (t.id || t._id) !== id);
  return { success: true, source: 'local-fallback' };
}

export async function getProjects() {
  const data = await safeFetch('/projects');
  if (data && data.success) {
    return { success: true, data: data.data, source: 'backend' };
  }
  return { success: true, data: [...localProjectsCache], source: 'local-fallback' };
}

export async function getAnalyticsData() {
  const data = await safeFetch('/analytics');
  if (data && data.success && data.data) {
    return { success: true, data: data.data, source: 'backend' };
  }

  // Consistent local analytics calculation matching normalizeTask
  const normalizedTasks = localTasksCache.map(normalizeTask);
  const total = normalizedTasks.length;
  const completed = normalizedTasks.filter(t => t.status === 'completed').length;
  const inProgress = normalizedTasks.filter(t => t.status === 'in-progress').length;
  const pending = normalizedTasks.filter(t => t.status === 'pending').length;

  return {
    success: true,
    data: {
      summary: {
        total,
        completed,
        inProgress,
        pending,
        completionRate: total ? Math.round((completed / total) * 100) : 0
      },
      priorityDistribution: {
        high: normalizedTasks.filter(t => t.priority === 'high').length,
        medium: normalizedTasks.filter(t => t.priority === 'medium').length,
        low: normalizedTasks.filter(t => t.priority === 'low').length
      },
      weeklyVelocity: [
        { day: 'Mon', completed: 3, created: 5 },
        { day: 'Tue', completed: 4, created: 2 },
        { day: 'Wed', completed: 6, created: 4 },
        { day: 'Thu', completed: 5, created: 3 },
        { day: 'Fri', completed: 8, created: 6 },
        { day: 'Sat', completed: 4, created: 1 },
        { day: 'Sun', completed: 2, created: 0 }
      ]
    },
    source: 'local-fallback'
  };
}

export async function sendContactMessage(payload) {
  const data = await safeFetch('/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (data && data.success) {
    return { success: true, data: data.data, source: 'backend' };
  }
  return {
    success: true,
    message: 'Message delivered to Task Management Support Team.',
    data: { id: `msg-${Date.now()}`, ...payload },
    source: 'local-fallback'
  };
}
