// MVP token storage: both tokens live in localStorage for simplicity.
// A production build should move the refresh token to an httpOnly cookie
// so it isn't reachable from JS (see docs/api.md notes on invite tokens
// for the same "MVP tradeoff, harden later" pattern used on the backend).
const ACCESS_TOKEN_KEY = 'cfg_access_token';
const REFRESH_TOKEN_KEY = 'cfg_refresh_token';
const USER_KEY = 'cfg_user';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setSession({ accessToken, refreshToken, user }) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
