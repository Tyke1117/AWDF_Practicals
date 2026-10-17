/**
 * Central API Client for Practical 7: Authentication & Middleware Pipeline
 * Base backend URL pointing to Express server running on port 5000
 */
const BASE_URL = 'http://localhost:5000';

// Token Management
export const getToken = () => localStorage.getItem('auth_token');
export const setToken = (token) => localStorage.setItem('auth_token', token);
export const removeToken = () => localStorage.removeItem('auth_token');

export const getUser = () => {
  const user = localStorage.getItem('auth_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};
export const setUser = (user) => localStorage.setItem('auth_user', JSON.stringify(user));
export const removeUser = () => localStorage.removeItem('auth_user');

/**
 * Global unauthorized handler callback (Supplementary Problem 2)
 */
let onUnauthorizedCallback = null;
export const setOnUnauthorized = (callback) => {
  onUnauthorizedCallback = callback;
};

/**
 * Generic fetch wrapper with standard JWT header injection & 401 expiry handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    // Supplementary Problem 2: Token Expiry / Unauthorized Handling (HTTP 401)
    if (response.status === 401) {
      removeToken();
      removeUser();
      if (typeof onUnauthorizedCallback === 'function') {
        onUnauthorizedCallback(data.error || 'Session expired. Please log in again.');
      }
      throw new Error(data.error || 'Unauthorized. Please sign in again.');
    }

    if (!response.ok) {
      const errorMessage = data.error || (Array.isArray(data.errors) ? data.errors.join(' ') : null) || data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Backend server is unreachable. Ensure Express is running on http://localhost:5000');
    }
    throw error;
  }
}

// ================= AUTHENTICATION APIS =================

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  const data = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  if (data.token) {
    setToken(data.token);
    setUser(data.user);
  }
  return data;
};

/**
 * Authenticate user & get JWT token
 */
export const loginUser = async (credentials) => {
  const data = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  if (data.token) {
    setToken(data.token);
    setUser(data.user);
  }
  return data;
};

/**
 * Supplementary Problem 1: Get currently authenticated user details (/me)
 */
export const getMe = async () => {
  return apiRequest('/api/auth/me');
};

/**
 * Supplementary Problem 3: Client logout mechanism
 */
export const logoutUser = () => {
  removeToken();
  removeUser();
};

// ================= PROTECTED TASK APIS =================

/**
 * Fetch all tasks for authenticated user
 */
export const getTasks = async (query = '') => {
  const endpoint = query ? `/api/tasks?${query}` : '/api/tasks';
  return apiRequest(endpoint);
};

/**
 * Fetch a single task by ID
 */
export const getTaskById = async (id) => {
  return apiRequest(`/api/tasks/${id}`);
};

/**
 * Create a new task (Protected & Validated)
 */
export const createTask = async (taskData) => {
  return apiRequest('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  });
};

/**
 * Update an existing task (Protected & Validated)
 */
export const updateTask = async (id, taskData) => {
  return apiRequest(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData)
  });
};

/**
 * Delete a task (Protected)
 */
export const deleteTask = async (id) => {
  return apiRequest(`/api/tasks/${id}`, {
    method: 'DELETE'
  });
};

export { BASE_URL };
