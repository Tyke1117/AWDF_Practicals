/**
 * Central API Client for Practical 13: AI API Integration
 * Base backend URL pointing to Express server running on port 5000
 */
const BASE_URL = 'http://localhost:5000';

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
      const err = new Error(errorMessage);
      err.status = response.status;
      err.data = data;
      throw err;
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

/**
 * Practical 13: Generate AI Task Description
 * Calls Express backend route POST /api/ai/generate-description
 * API key is safely stored on the backend, NEVER called directly from React!
 */
export const generateAIDescription = async (title, options = {}) => {
  return apiRequest('/api/ai/generate-description', {
    method: 'POST',
    body: JSON.stringify({
      title,
      ...options
    })
  });
};

/**
 * Fetch AI Service Health / Provider Status
 */
export const getAIStatus = async () => {
  return apiRequest('/api/ai/status');
};

/**
 * Step 6 / Studio: Simulate 401 Third-Party Failure for Graceful Degradation Testing
 */
export const testFailureSimulation = async (title = 'Deploy Microservices to AWS with Docker') => {
  return apiRequest('/api/ai/test-failure', {
    method: 'POST',
    body: JSON.stringify({ title })
  });
};

export { BASE_URL };

