'use client';

import type { ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { usePermissions } from '@/components/auth/AuthorizationProvider';
import { AccessDenied } from '@/components/auth/AccessDenied';
import { pathAllows } from '@/lib/access-control';
import { DashboardSkeleton } from '@/components/app/dashboard/DashboardSkeleton';

/**
 * Client route guard — hides unauthorized pages (sidebar hide is not enough).
 * Public routes live outside (app) layout.
 */
export function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams();
  const { ready, loading, authenticated, permissions } = usePermissions();

  if (!ready || loading) {
    return (
      <div className="mod-page">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  const allowed = pathAllows(pathname, permissions, searchParams);
  if (!allowed) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
