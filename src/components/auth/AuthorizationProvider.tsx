'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { clearSession, getSession, type AuthSession } from '@/lib/auth';
import {
  can as canCheck,
  fetchMePermissions,
  hasAllPermissions as hasAllCheck,
  hasAnyPermission as hasAnyCheck,
  type MePermissionsPayload,
} from '@/lib/access-control';

type AuthorizationContextValue = {
  ready: boolean;
  loading: boolean;
  authenticated: boolean;
  session: AuthSession | null;
  me: MePermissionsPayload | null;
  role: string | null;
  permissions: Set<string>;
  can: (permissionId: string) => boolean;
  hasAnyPermission: (permissionIds: string[]) => boolean;
  hasAllPermissions: (permissionIds: string[]) => boolean;
  refresh: () => Promise<void>;
  logout: () => void;
};

const AuthorizationContext = createContext<AuthorizationContextValue | null>(null);

export function AuthorizationProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [me, setMe] = useState<MePermissionsPayload | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const current = getSession();
    setSession(current);
    if (!current) {
      setMe(null);
      setLoading(false);
      setReady(true);
      return;
    }
    try {
      const payload = await fetchMePermissions();
      setMe(payload);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    setMe(null);
    setReady(true);
    setLoading(false);
  }, []);

  const permissions = useMemo(() => new Set(me?.permissions ?? []), [me]);

  const value = useMemo<AuthorizationContextValue>(
    () => ({
      ready,
      loading,
      authenticated: Boolean(session),
      session,
      me,
      role: me?.user.roleName ?? null,
      permissions,
      can: (permissionId: string) => canCheck(permissions, permissionId),
      hasAnyPermission: (ids: string[]) => hasAnyCheck(permissions, ids),
      hasAllPermissions: (ids: string[]) => hasAllCheck(permissions, ids),
      refresh,
      logout,
    }),
    [ready, loading, session, me, permissions, refresh, logout],
  );

  return (
    <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>
  );
}

export function usePermissions(): AuthorizationContextValue {
  const ctx = useContext(AuthorizationContext);
  if (!ctx) {
    throw new Error('usePermissions must be used within AuthorizationProvider');
  }
  return ctx;
}

/** Safe variant for optional usage outside provider (returns deny-all until ready). */
export function usePermissionsOptional(): AuthorizationContextValue | null {
  return useContext(AuthorizationContext);
}
