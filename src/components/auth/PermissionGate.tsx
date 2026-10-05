'use client';

import type { ReactNode } from 'react';
import { usePermissions } from '@/components/auth/AuthorizationProvider';

type PermissionGateProps = {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  fallback?: ReactNode;
  children: ReactNode;
};

/** Renders children only when the current staff has the required permission(s). */
export function PermissionGate({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { ready, loading, can, hasAnyPermission, hasAllPermissions } = usePermissions();
  if (!ready || loading) return null;

  if (permission && !can(permission)) return <>{fallback}</>;
  if (anyOf?.length && !hasAnyPermission(anyOf)) return <>{fallback}</>;
  if (allOf?.length && !hasAllPermissions(allOf)) return <>{fallback}</>;

  return <>{children}</>;
}
