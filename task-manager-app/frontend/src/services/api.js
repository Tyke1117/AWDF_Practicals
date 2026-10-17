const API_BASE = "http://localhost:5000/api";

export const getTasks = async (token = null, bypassCache = false) => {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const url = bypassCache ? `${API_BASE}/tasks?nocache=true` : `${API_BASE}/tasks`;
  const start = performance.now();
  const res = await fetch(url, { headers });
  const latency = (performance.now() - start).toFixed(1);
  const cacheHeader = res.headers.get("X-Cache") || "MISS";
  const json = await res.json();
  return { ...json, measuredLatency: latency, cacheStatus: cacheHeader };
};

export const getSingleTask = async (id, token = null) => {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const start = performance.now();
  const res = await fetch(`${API_BASE}/tasks/${id}`, { headers });
  const latency = (performance.now() - start).toFixed(1);
  const cacheHeader = res.headers.get("X-Cache") || "MISS";
  const json = await res.json();
  return { ...json, measuredLatency: latency, cacheStatus: cacheHeader };
};

export const createTask = async (taskData, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers,
    body: JSON.stringify(taskData)
  });
  return res.json();
};

export const updateTask = async (id, updateData, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(updateData)
  });
  return res.json();
};

export const deleteTask = async (id, token = null) => {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "DELETE",
    headers
  });
  return res.json();
};

export const getCacheStats = async () => {
  const res = await fetch(`${API_BASE}/cache/stats`);
  return res.json();
};

export const flushCache = async () => {
  const res = await fetch(`${API_BASE}/cache/flush`, { method: "POST" });
  return res.json();
};
