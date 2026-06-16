const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res: Response) => {
  if (res.status === 204) return null;
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'An unexpected error occurred.');
  }
  return res.json();
};

export const api = {
  auth: {
    register: (data: any) => 
      fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(handleResponse),

    login: (data: any) => 
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(handleResponse),

    getMe: () => 
      fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders()
      }).then(handleResponse)
  },

  subjects: {
    list: () => 
      fetch(`${API_BASE}/subjects/`, { headers: getHeaders() }).then(handleResponse),
    create: (data: any) => 
      fetch(`${API_BASE}/subjects/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),
    delete: (id: number) => 
      fetch(`${API_BASE}/subjects/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      }).then(handleResponse)
  },

  plans: {
    list: () => 
      fetch(`${API_BASE}/study-plans/`, { headers: getHeaders() }).then(handleResponse),
    generate: (data: any) => 
      fetch(`${API_BASE}/study-plans/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),
    delete: (id: number) => 
      fetch(`${API_BASE}/study-plans/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      }).then(handleResponse)
  },

  tasks: {
    list: (filters: { subject_id?: number; is_completed?: boolean; due_date?: string } = {}) => {
      const params = new URLSearchParams();
      if (filters.subject_id !== undefined) params.append('subject_id', String(filters.subject_id));
      if (filters.is_completed !== undefined) params.append('is_completed', String(filters.is_completed));
      if (filters.due_date !== undefined) params.append('due_date', filters.due_date);
      
      return fetch(`${API_BASE}/tasks/?${params.toString()}`, { 
        headers: getHeaders() 
      }).then(handleResponse);
    },
    create: (data: any) => 
      fetch(`${API_BASE}/tasks/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),
    update: (id: number, data: any) => 
      fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),
    delete: (id: number) => 
      fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      }).then(handleResponse),
    reschedule: () => 
      fetch(`${API_BASE}/tasks/reschedule`, {
        method: 'POST',
        headers: getHeaders()
      }).then(handleResponse)
  },

  sessions: {
    list: () => 
      fetch(`${API_BASE}/sessions/`, { headers: getHeaders() }).then(handleResponse),
    create: (data: any) => 
      fetch(`${API_BASE}/sessions/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse)
  },

  notes: {
    list: (subjectId?: number) => {
      const url = subjectId ? `${API_BASE}/notes/?subject_id=${subjectId}` : `${API_BASE}/notes/`;
      return fetch(url, { headers: getHeaders() }).then(handleResponse);
    },
    get: (id: number) => 
      fetch(`${API_BASE}/notes/${id}`, { headers: getHeaders() }).then(handleResponse),
    create: (data: any) => 
      fetch(`${API_BASE}/notes/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),
    update: (id: number, data: any) => 
      fetch(`${API_BASE}/notes/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      }).then(handleResponse),
    delete: (id: number) => 
      fetch(`${API_BASE}/notes/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      }).then(handleResponse)
  },

  analytics: {
    dashboard: () => 
      fetch(`${API_BASE}/analytics/dashboard`, { headers: getHeaders() }).then(handleResponse),
    insights: () => 
      fetch(`${API_BASE}/analytics/insights`, { headers: getHeaders() }).then(handleResponse)
  }
};
