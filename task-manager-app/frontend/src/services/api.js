/**
 * Central API Client for Practical 11 Full-Stack Containerized Application
 * Base backend URL pointing to Express server running on port 5000
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Generic fetch wrapper with standard error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.error || data.message || `API request failed with status ${response.status}`;
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

/**
 * Fetch all tasks from MongoDB
 */
export const getTasks = async (query = '') => {
  const endpoint = query ? `/tasks?${query}` : '/tasks';
  return apiRequest(endpoint);
};

/**
 * Fetch a single task by ID
 */
export const getTaskById = async (id) => {
  return apiRequest(`/tasks/${id}`);
};

/**
 * Create a new task in MongoDB
 */
export const createTask = async (taskData) => {
  return apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  });
};

/**
 * Update an existing task in MongoDB
 */
export const updateTask = async (id, taskData) => {
  return apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData)
  });
};

/**
 * Delete a task from MongoDB
 */
export const deleteTask = async (id) => {
  return apiRequest(`/tasks/${id}`, {
    method: 'DELETE'
  });
};

export { BASE_URL };
