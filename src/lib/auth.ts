const AUTH_KEY = 'panacea_auth';

export type AuthSession = {
  method: 'phone' | 'email' | 'google' | 'microsoft';
  identifier: string;
  loggedInAt: string;
  /** Bound staff identity — role always comes from staff record / RolePermission store */
  staffId?: string;
  roleName?: string;
  centerId?: string;
  name?: string;
};

export function saveSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}

export function isLoggedIn() {
  return Boolean(getSession());
}
