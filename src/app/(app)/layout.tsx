import { AppShell } from '@/components/app/AppShell';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { AuthorizationProvider } from '@/components/auth/AuthorizationProvider';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthorizationProvider>
      <CenterScopeProvider>
        <AppShell>
          <RouteGuard>{children}</RouteGuard>
        </AppShell>
      </CenterScopeProvider>
    </AuthorizationProvider>
  );
}
