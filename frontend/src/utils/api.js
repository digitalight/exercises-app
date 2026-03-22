const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// Exercises
export const getExercises = () => request('/exercises');
export const getActiveExercises = () => request('/exercises/active');
export const getExercise = (id) => request(`/exercises/${id}`);
export const createExercise = (formData) =>
  request('/exercises', { method: 'POST', body: formData });
export const updateExercise = (id, formData) =>
  request(`/exercises/${id}`, { method: 'PUT', body: formData });
export const deleteExercise = (id) =>
  request(`/exercises/${id}`, { method: 'DELETE' });

// Sessions
export const getSessions = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`/sessions${q ? '?' + q : ''}`);
};
export const createOrUpdateSession = (data) =>
  request('/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
export const updateSession = (id, data) =>
  request(`/sessions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
export const deleteSession = (id) =>
  request(`/sessions/${id}`, { method: 'DELETE' });

// Daily logs
export const getDailyLog = (date) => request(`/daily-logs/${date}`);
export const getDailyLogs = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`/daily-logs${q ? '?' + q : ''}`);
};
export const upsertDailyLog = (data) =>
  request('/daily-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

// Progress
export const getProgressSummary = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`/progress/summary${q ? '?' + q : ''}`);
};
export const getDailyProgress = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`/progress/daily${q ? '?' + q : ''}`);
};

// Weight logs
export const getWeightLog = (date) => request(`/weight-logs/${date}`);
export const getWeightLogs = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`/weight-logs${q ? '?' + q : ''}`);
};
export const upsertWeightLog = (data) =>
  request('/weight-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
export const deleteWeightLog = (date) =>
  request(`/weight-logs/${date}`, { method: 'DELETE' });
