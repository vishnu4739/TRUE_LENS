/**
 * TrueLens Client-Side Authentication Engine
 * 
 * Provides resilient offline authentication and user profile management
 * when the remote API backend is offline, unreachable, or blocked by browser
 * mixed-content security policies on static hosting (e.g. Netlify).
 */

const LOCAL_USERS_KEY = 'truelens_registered_users';
const LOCAL_SESSION_KEY = 'truelens_active_session';

// Helper to hash password using native Web Crypto API SHA-256
async function hashPassword(password) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '_truelens_salt');
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple hash if crypto.subtle is not accessible
  let hash = 0;
  const str = password + '_truelens_salt';
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
}

// Generate JWT-shaped client token
function createClientToken(user) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      id: user._id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    })
  );
  const signature = btoa('truelens_client_signature');
  return `${header}.${payload}.${signature}`;
}

export function getLocalUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function clientRegister(name, email, password) {
  const users = getLocalUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const exists = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (exists) {
    throw new Error('A user with this email address already exists.');
  }

  const passwordHash = await hashPassword(password);
  const newUser = {
    _id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

  const safeUser = {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    createdAt: newUser.createdAt,
  };

  const token = createClientToken(safeUser);
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(safeUser));

  return {
    message: 'User registered successfully',
    user: safeUser,
    token,
  };
}

export async function clientLogin(email, password) {
  const users = getLocalUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);

  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user || user.passwordHash !== passwordHash) {
    throw new Error('Invalid email or password.');
  }

  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };

  const token = createClientToken(safeUser);
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(safeUser));

  return {
    message: 'Login successful',
    user: safeUser,
    token,
  };
}

export function getClientProfile() {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return { user };
  } catch {
    return null;
  }
}

export function clientLogout() {
  localStorage.removeItem(LOCAL_SESSION_KEY);
}
