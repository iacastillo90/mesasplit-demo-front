// src/api/authService.js — autenticación del front contra el backend LabTab.
// Expone login/logout y el mapeo de rol del backend hacia la vista del front.
// Se usa solo en modo backend (VITE_DEMO_MODE='backend'); en modo demo la auth
// queda mockeada y este servicio no interviene.

// http y setToken/getToken: cliente HTTP + manejo del JWT en localStorage.
import { http, setToken, getToken } from './httpClient';

// Mapeo rol del backend → clave de vista del front.
// El back expone SUPERADMIN/OWNER/MANAGER/STAFF/KITCHEN/GUEST; el front usa
// super/admin/garzon/cocina/cliente para rutas y permisos de UI.
const ROLE_MAP = {
  SUPERADMIN: 'super',
  OWNER: 'super',
  MANAGER: 'admin',
  STAFF: 'garzon',
  KITCHEN: 'cocina',
  GUEST: 'cliente',
};

// Clave del localStorage donde se persiste la persona autenticada.
const USER_KEY = 'labtab_user';

// getStoredUser: recupera la persona guardada tras el login (o null).
export function getStoredUser() {
  // try/catch: si el JSON del storage está corrupto, devuelve null en vez de romper.
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

// isAuthenticated: true si hay un access token (JWT) guardado.
export function isAuthenticated() {
  return Boolean(getToken());
}

// login: autentica contra POST /auth/login y persiste token + persona.
export async function login(email, password) {
  // http.post ya desenvuelve el envelope {data}; data = {accessToken, refreshToken, expiresIn, person}.
  const data = await http.post('/api/v1/auth/login', { email, password });
  // Guarda el access token (JWT) para las llamadas siguientes.
  setToken(data.accessToken);
  // Guarda la persona (id, email, fullName, role, branchId, avatarUrl).
  localStorage.setItem(USER_KEY, JSON.stringify(data.person));
  // Devuelve la persona para que el caller decida a qué vista redirigir.
  return data.person;
}

// logout: limpia token y persona (sesión cerrada).
export function logout() {
  setToken(null);
  localStorage.removeItem(USER_KEY);
}

// mapRole: traduce el rol del backend a la clave de vista del front.
export function mapRole(backendRole) {
  return ROLE_MAP[backendRole] || 'garzon';
}
