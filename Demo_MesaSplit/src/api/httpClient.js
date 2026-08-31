// src/api/httpClient.js — cliente HTTP del front hacia el backend LabTab.
// Reemplaza a mockFetch cuando VITE_DEMO_MODE='backend'. Maneja JWT (Bearer),
// el envelope de respuesta { data, meta } y el envelope de error { error: { code, message } }.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const TOKEN_KEY = 'labtab_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const err = payload?.error || { code: 'ERROR', message: `HTTP ${res.status}` };
    const error = new Error(err.message || 'Error de red');
    error.code = err.code;
    error.status = res.status;
    error.detail = err.detail;
    throw error;
  }

  // El backend envuelve todo en { data, meta }.
  return payload?.data ?? payload;
}

export const http = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};

// Flag de modo: 'backend' usa este cliente; 'same-device' usa mockFetch (demo sin back).
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE || 'same-device';
export const isBackendMode = () => DEMO_MODE === 'backend';
