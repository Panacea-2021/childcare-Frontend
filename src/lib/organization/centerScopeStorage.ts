import type { CenterScope, OrgSession, UserRole } from '@/types/organization';
import { DEFAULT_CENTER_ID, DEMO_ORGANIZATION } from './centers';

const SCOPE_KEY = 'panacea.org.activeScope';
const SESSION_KEY = 'panacea.org.session';

const DEFAULT_SESSION: OrgSession = {
  role: 'organization_admin',
  orgId: DEMO_ORGANIZATION.id,
  centerIds: DEMO_ORGANIZATION.centers.map((c) => c.id),
  activeScope: 'all',
};

export function loadOrgSession(): OrgSession {
  if (typeof window === 'undefined') return DEFAULT_SESSION;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(DEFAULT_SESSION));
      return DEFAULT_SESSION;
    }
    const parsed = JSON.parse(raw) as Partial<OrgSession>;
    return {
      role: (parsed.role as UserRole) || DEFAULT_SESSION.role,
      orgId: parsed.orgId || DEFAULT_SESSION.orgId,
      centerIds: parsed.centerIds?.length ? parsed.centerIds : DEFAULT_SESSION.centerIds,
      activeScope: normalizeScope(parsed.activeScope, parsed.centerIds ?? DEFAULT_SESSION.centerIds),
    };
  } catch {
    return DEFAULT_SESSION;
  }
}

export function saveOrgSession(session: OrgSession) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem(SCOPE_KEY, session.activeScope);
}

export function loadActiveScope(): CenterScope {
  if (typeof window === 'undefined') return 'all';
  const session = loadOrgSession();
  return session.activeScope;
}

export function saveActiveScope(scope: CenterScope) {
  if (typeof window === 'undefined') return;
  const session = loadOrgSession();
  const next = { ...session, activeScope: normalizeScope(scope, session.centerIds) };
  saveOrgSession(next);
}

function normalizeScope(scope: CenterScope | undefined, centerIds: string[]): CenterScope {
  if (!scope || scope === 'all') return 'all';
  if (centerIds.includes(scope)) return scope;
  return centerIds[0] ?? DEFAULT_CENTER_ID;
}

export function canUseAllCenters(role: UserRole) {
  return role === 'organization_admin';
}
