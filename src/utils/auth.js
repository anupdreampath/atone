import * as neonDb from './neonDb.js';

const ADMIN_TOKEN_KEY = 'atone_admin_token';
const ADMIN_INFO_KEY = 'atone_admin_info';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'admin-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function login(email, password) {
  try {
    const admin = await neonDb.getAdmin(email);
    if (!admin) {
      throw new Error('Invalid email or password');
    }

    const passwordHash = await hashPassword(password);
    if (admin.password_hash !== passwordHash) {
      throw new Error('Invalid email or password');
    }

    if (!admin.is_active) {
      throw new Error('Admin account is inactive');
    }

    const token = Date.now().toString(36) + Math.random().toString(36).substr(2);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    }));

    return { token, admin };
  } catch (error) {
    throw error;
  }
}

export async function signup(email, password, name) {
  try {
    const admin = await neonDb.getAdmin(email);
    if (admin) {
      throw new Error('Email already registered');
    }

    const passwordHash = await hashPassword(password);
    const result = await neonDb.createAdmin(email, passwordHash, name);

    const token = Date.now().toString(36) + Math.random().toString(36).substr(2);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(result));

    return { token, admin: result };
  } catch (error) {
    throw error;
  }
}

export function logout() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_INFO_KEY);
}

export function getToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getAdmin() {
  const info = localStorage.getItem(ADMIN_INFO_KEY);
  return info ? JSON.parse(info) : null;
}

export function isAuthenticated() {
  return !!getToken() && !!getAdmin();
}

export async function changePassword(email, oldPassword, newPassword) {
  try {
    const admin = await neonDb.getAdmin(email);
    if (!admin) {
      throw new Error('Admin not found');
    }

    const oldPasswordHash = await hashPassword(oldPassword);
    if (admin.password_hash !== oldPasswordHash) {
      throw new Error('Current password is incorrect');
    }

    const newPasswordHash = await hashPassword(newPassword);
    const result = await neonDb.updateAdminPassword(email, newPasswordHash);
    
    return result;
  } catch (error) {
    throw error;
  }
}
