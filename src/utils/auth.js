const SESSION_KEY = "carwash_session";

export function setAuthSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getAuthSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getAuthToken() {
  return getAuthSession()?.token || null;
}

export function isAdminAuthenticated() {
  return getAuthSession()?.role === "admin";
}

export function isCustomerAuthenticated() {
  return getAuthSession()?.role === "customer";
}
