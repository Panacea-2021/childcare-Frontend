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
import type { Center, CenterScope, Organization, UserRole } from '@/types/organization';
import {
  getCenterById,
  getCenterName,
  getCenters,
  getOrganization,
} from '@/lib/organization/centers';
import {
  canUseAllCenters,
  loadOrgSession,
  saveActiveScope,
  saveOrgSession,
} from '@/lib/organization/centerScopeStorage';

type CenterScopeContextValue = {
  organization: Organization;
  centers: Center[];
  role: UserRole;
  activeScope: CenterScope;
  isAllCenters: boolean;
  activeCenter: Center | null;
  scopeLabel: string;
  setActiveScope: (scope: CenterScope) => void;
  canSwitchCenters: boolean;
};

const CenterScopeContext = createContext<CenterScopeContextValue | null>(null);

export function CenterScopeProvider({ children }: { children: ReactNode }) {
  const organization = getOrganization();
  const centers = getCenters();
  const [role, setRole] = useState<UserRole>('organization_admin');
  const [activeScope, setActiveScopeState] = useState<CenterScope>('all');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = loadOrgSession();
    setRole(session.role);
    setActiveScopeState(session.activeScope);
    setReady(true);
  }, []);

  const setActiveScope = useCallback(
    (scope: CenterScope) => {
      const session = loadOrgSession();
      if (!canUseAllCenters(session.role) && scope === 'all') {
        const fallback = session.centerIds[0] ?? centers[0]?.id ?? 'all';
        setActiveScopeState(fallback);
        saveActiveScope(fallback);
        return;
      }
      if (scope !== 'all' && !session.centerIds.includes(scope)) return;
      setActiveScopeState(scope);
      saveActiveScope(scope);
      saveOrgSession({ ...session, activeScope: scope });
    },
    [centers],
  );

  const value = useMemo<CenterScopeContextValue>(() => {
    const isAllCenters = activeScope === 'all';
    const activeCenter = isAllCenters ? null : getCenterById(activeScope) ?? null;
    return {
      organization,
      centers,
      role,
      activeScope,
      isAllCenters,
      activeCenter,
      scopeLabel: isAllCenters ? 'All Centers' : getCenterName(activeScope),
      setActiveScope,
      canSwitchCenters: canUseAllCenters(role) || centers.length > 1,
    };
  }, [activeScope, centers, organization, role, setActiveScope]);

  if (!ready) {
    return <CenterScopeContext.Provider value={value}>{children}</CenterScopeContext.Provider>;
  }

  return <CenterScopeContext.Provider value={value}>{children}</CenterScopeContext.Provider>;
}

export function useCenterScope() {
  const ctx = useContext(CenterScopeContext);
  if (!ctx) {
    throw new Error('useCenterScope must be used within CenterScopeProvider');
  }
  return ctx;
}
