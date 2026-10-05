'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Suspense,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import {
  CalendarDays,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  MessageCircle,
  PenLine,
  Search,
  Users,
  Zap,
} from 'lucide-react';
import { APP_MODULES, type AppModule, type AppModuleChild } from '@/lib/modules';
import { clearSession, getSession } from '@/lib/auth';
import { usePermissions } from '@/components/auth/AuthorizationProvider';
import { filterModulesByPermissions } from '@/lib/access-control';
import { ModuleIcon } from './ModuleIcon';
import { AttendanceSubIcon } from './AttendanceSubIcon';
import { BillingSubIcon } from './BillingSubIcon';
import { CalendarSubIcon } from './CalendarSubIcon';
import { CenterSubIcon } from './CenterSubIcon';
import { EnquirySubIcon } from './EnquirySubIcon';
import { FormsSubIcon } from './FormsSubIcon';
import { HelpSubIcon } from './HelpSubIcon';
import { LearningSubIcon } from './LearningSubIcon';
import { SettingsSubIcon } from './SettingsSubIcon';
import { ToolsSubIcon } from './ToolsSubIcon';
import { ProfileDropdown } from './ProfileDropdown';
import { PageLoader } from '@/components/ui/loading';
import { NotificationsDropdown } from './NotificationsDropdown';
import { migrateCenterIdsIfNeeded } from '@/lib/organization/migrateCenterIds';
import './appshell.css';

const ChatWidgetLazy = dynamic(
  () => import('../ChatWidget').then((m) => m.ChatWidget),
  { ssr: false, loading: () => null },
);

function SubNavIcon({ moduleId, childId }: { moduleId: string; childId: string }) {
  if (moduleId === 'enquiries') return <EnquirySubIcon id={childId} />;
  if (moduleId === 'forms') return <FormsSubIcon id={childId} />;
  if (moduleId === 'tools') return <ToolsSubIcon id={childId} />;
  if (moduleId === 'center-management') return <CenterSubIcon id={childId} />;
  if (moduleId === 'learning-assessment') return <LearningSubIcon id={childId} />;
  if (moduleId === 'attendance-leaves') return <AttendanceSubIcon id={childId} />;
  if (moduleId === 'billing-accounting') return <BillingSubIcon id={childId} />;
  if (moduleId === 'settings') return <SettingsSubIcon id={childId} />;
  if (moduleId === 'help') return <HelpSubIcon id={childId} />;
  return <CalendarSubIcon id={childId} />;
}

function isModuleActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isChildActive(
  pathname: string,
  queryString: string,
  href: string,
  siblings: { href: string }[] = [],
) {
  const [path, query = ''] = href.split('?');

  if (query) {
    if (pathname !== path) return false;
    const want = new URLSearchParams(query);
    const have = new URLSearchParams(queryString);
    for (const [key, value] of want.entries()) {
      if (have.get(key) !== value) return false;
    }
    return true;
  }

  if (pathname === path) return true;
  if (!pathname.startsWith(`${path}/`)) return false;
  const claimedBySibling = siblings.some((s) => {
    const siblingPath = s.href.split('?')[0];
    return (
      siblingPath !== path &&
      siblingPath.length > path.length &&
      (pathname === siblingPath || pathname.startsWith(`${siblingPath}/`))
    );
  });
  return !claimedBySibling;
}

function getDefaultChildHref(mod: AppModule) {
  return mod.children?.[0]?.href ?? mod.href;
}

type LeafNavItemProps = {
  mod: AppModule;
  active: boolean;
  collapsed: boolean;
};

const LeafNavItem = memo(function LeafNavItem({ mod, active, collapsed }: LeafNavItemProps) {
  return (
    <Link
      href={mod.href}
      prefetch
      className={`shell-navItem ${active ? 'shell-active' : ''}`}
      title={mod.label}
      aria-current={active ? 'page' : undefined}
    >
      <ModuleIcon id={mod.id} />
      {!collapsed && <span className="shell-navLabel">{mod.label}</span>}
    </Link>
  );
});

type SubNavLinkProps = {
  moduleId: string;
  child: AppModuleChild;
  active: boolean;
  textOnly: boolean;
};

const SubNavLink = memo(function SubNavLink({
  moduleId,
  child,
  active,
  textOnly,
}: SubNavLinkProps) {
  return (
    <Link
      href={child.href}
      prefetch
      className={`shell-subnavItem ${textOnly ? 'shell-subnavItemText' : ''} ${active ? 'shell-subActive' : ''}`}
      aria-current={active ? 'page' : undefined}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
    >
      {!textOnly ? <SubNavIcon moduleId={moduleId} childId={child.id} /> : null}
      <span>{child.label}</span>
    </Link>
  );
});

type BranchNavItemProps = {
  mod: AppModule;
  pathname: string;
  queryString: string;
  collapsed: boolean;
  iconOnly: boolean;
  expanded: boolean;
  onToggle: (mod: AppModule, branchActive: boolean, isExpanded: boolean) => void;
};

const BranchNavItem = memo(function BranchNavItem({
  mod,
  pathname,
  queryString,
  collapsed,
  iconOnly,
  expanded,
  onToggle,
}: BranchNavItemProps) {
  const children = mod.children!;
  const branchActive = isModuleActive(pathname, mod.href);
  const parentActive =
    branchActive &&
    !children.some((c) => isChildActive(pathname, queryString, c.href, children));
  const defaultHref = getDefaultChildHref(mod);
  const showSubnav = !iconOnly && expanded;

  return (
    <div className="shell-navGroup">
      <Link
        href={defaultHref}
        prefetch
        className={`shell-navItem shell-navParent ${branchActive ? 'shell-active-parent' : ''} ${parentActive ? 'shell-active' : ''}`}
        title={mod.label}
        aria-expanded={expanded}
        aria-controls={`subnav-${mod.id}`}
        onClick={(e) => {
          if (iconOnly) {
            onToggle(mod, branchActive, expanded);
            return;
          }
          // Second click on open section: collapse only.
          if (expanded) {
            e.preventDefault();
            onToggle(mod, branchActive, expanded);
            return;
          }
          // Already in this module: expand submenu without jumping to default child.
          if (branchActive) {
            e.preventDefault();
          }
          onToggle(mod, branchActive, expanded);
        }}
      >
        <ModuleIcon id={mod.id} />
        {!collapsed && <span className="shell-navLabel">{mod.label}</span>}
        {!collapsed && (
          <span className={`shell-chevron ${expanded ? 'is-open' : ''}`} aria-hidden>
            <ChevronDown size={16} strokeWidth={2.25} />
          </span>
        )}
      </Link>

      {!iconOnly ? (
        <div
          id={`subnav-${mod.id}`}
          className={`shell-subnav shell-subnavEditorial${mod.id === 'parent-communication' ? ' shell-subnav--parent-communication' : ''}${showSubnav ? ' is-open' : ''}`}
          role="group"
          aria-label={`${mod.label} submenu`}
        >
          <div className="shell-subnav-inner">
            {children.map((child) => (
              <SubNavLink
                key={child.id}
                moduleId={mod.id}
                child={child}
                textOnly={false}
                active={isChildActive(pathname, queryString, child.href, children)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
});

type SidebarNavProps = {
  items: AppModule[];
  pathname: string;
  queryString: string;
  collapsed: boolean;
  iconOnly: boolean;
  expandedId: string | null;
  onToggleBranch: (mod: AppModule, branchActive: boolean, isExpanded: boolean) => void;
};

const SidebarNav = memo(function SidebarNav({
  items,
  pathname,
  queryString,
  collapsed,
  iconOnly,
  expandedId,
  onToggleBranch,
}: SidebarNavProps) {
  return (
    <nav className="shell-nav" aria-label="Main">
      {items.map((mod) => {
        const hasRealChildren = Boolean(mod.children?.length);

        if (!hasRealChildren) {
          return (
            <LeafNavItem
              key={mod.id}
              mod={mod}
              active={isModuleActive(pathname, mod.href)}
              collapsed={collapsed}
            />
          );
        }

        return (
          <BranchNavItem
            key={mod.id}
            mod={mod}
            pathname={pathname}
            queryString={queryString}
            collapsed={collapsed}
            iconOnly={iconOnly}
            expanded={expandedId === mod.id}
            onToggle={onToggleBranch}
          />
        );
      })}
    </nav>
  );
});

function AppShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const router = useRouter();
  const {
    ready: authReady,
    loading: authLoading,
    authenticated,
    me,
    permissions,
    logout: authLogout,
  } = usePermissions();
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [railMode, setRailMode] = useState(false);
  const [search, setSearch] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(() => {
    const match = APP_MODULES.find(
      (m) => m.children?.length && (pathname === m.href || pathname.startsWith(`${m.href}/`)),
    );
    return match?.id ?? null;
  });
  const [userName, setUserName] = useState('Center Administrator');
  const [userContact, setUserContact] = useState('admin@panacea.care');
  const quickWrapRef = useRef<HTMLDivElement>(null);

  const iconOnly = collapsed || railMode;

  const navModules = useMemo(
    () => filterModulesByPermissions(APP_MODULES, permissions),
    [permissions],
  );

  useEffect(() => {
    if (!authReady || authLoading) return;
    if (!authenticated || !getSession()) {
      router.replace('/login');
      return;
    }
    migrateCenterIdsIfNeeded();
    if (me) {
      setUserName(me.user.name || 'Staff');
      setUserContact(me.user.email || me.user.mobile || me.user.roleName);
    } else {
      const session = getSession();
      if (session) {
        setUserContact(session.identifier);
        if (session.name) setUserName(session.name);
      }
    }
    setReady(true);
  }, [authReady, authLoading, authenticated, me, router]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const sync = () => setRailMode(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Prefetch child routes so first clicks feel instant.
  useEffect(() => {
    for (const mod of navModules) {
      if (!mod.children?.length) continue;
      for (const child of mod.children) {
        router.prefetch(child.href);
      }
    }
  }, [router, navModules]);

  // Keep the active module's submenu expanded after route changes.
  useEffect(() => {
    const match = navModules.find(
      (m) => m.children?.length && (pathname === m.href || pathname.startsWith(`${m.href}/`)),
    );
    if (!match) return;
    setExpandedId((cur) => (cur === match.id ? cur : match.id));
  }, [pathname, navModules]);

  useEffect(() => {
    if (!quickOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!quickWrapRef.current?.contains(event.target as Node)) {
        setQuickOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setQuickOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [quickOpen]);

  const onToggleBranch = useCallback(
    (mod: AppModule, _branchActive: boolean, isExpanded: boolean) => {
      // Navigation is handled by the parent Link (prefetch-friendly).
      if (iconOnly) {
        setExpandedId(mod.id);
        return;
      }
      if (isExpanded) {
        setExpandedId(null);
        return;
      }
      setExpandedId(mod.id);
    },
    [iconOnly],
  );

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;
    for (const m of navModules) {
      if (m.label.toLowerCase().includes(q) || m.id.includes(q.replace(/\s+/g, '-'))) {
        router.push(getDefaultChildHref(m));
        setSearch('');
        return;
      }
      const child = m.children?.find(
        (c) => c.label.toLowerCase().includes(q) || c.id.includes(q.replace(/\s+/g, '-')),
      );
      if (child) {
        router.push(child.href);
        setSearch('');
        return;
      }
    }
  };

  if (!ready || !authReady || authLoading) {
    return <PageLoader context="app" />;
  }

  const hideSidebar =
    pathname === '/profile' ||
    pathname.startsWith('/profile/') ||
    pathname === '/view-profile' ||
    pathname.startsWith('/view-profile/') ||
    pathname === '/my-account' ||
    pathname.startsWith('/my-account/');

  const builderMode =
    pathname.startsWith('/forms/builder') ||
    pathname.startsWith('/enquiries/forms/builder') ||
    pathname.startsWith('/enquiries/forms/pdf');

  return (
    <div
      className={`shell-layout${hideSidebar ? ' shell-layout--full' : ''}${builderMode ? ' shell-builderMode' : ''}`}
    >
      {!hideSidebar ? (
        <aside className={`shell-sidebar ${collapsed ? 'shell-collapsed' : ''}`}>
          <div className="shell-sidebarTop">
            <Link
              href="/dashboard"
              className={`shell-brandLink ${collapsed || iconOnly ? 'shell-brandLink--compact' : ''}`}
              aria-label="Panacea Childcare Group home"
              prefetch
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/panacea-logo.jpeg"
                alt=""
                className="shell-brandLogo"
                width={36}
                height={36}
              />
              {!collapsed && !iconOnly ? (
                <span className="shell-brandWordmark">
                  <span className="shell-brandWordmarkPrimary">Panacea</span>
                  <span className="shell-brandWordmarkSecondary">Childcare Group</span>
                </span>
              ) : null}
            </Link>
          </div>

          <SidebarNav
            items={navModules}
            pathname={pathname}
            queryString={queryString}
            collapsed={collapsed}
            iconOnly={iconOnly}
            expandedId={expandedId}
            onToggleBranch={onToggleBranch}
          />
        </aside>
      ) : null}

      <div className="shell-mainCol">
        <header className="shell-topbar">
          <div className="shell-centerBrand">
            {!hideSidebar ? (
              <button
                type="button"
                className="shell-collapseBtn"
                onClick={() => setCollapsed((v) => !v)}
                aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
                aria-pressed={collapsed}
                title={collapsed ? 'Expand menu' : 'Collapse menu'}
              >
                {collapsed ? (
                  <ChevronsRight size={18} strokeWidth={2.25} aria-hidden />
                ) : (
                  <ChevronsLeft size={18} strokeWidth={2.25} aria-hidden />
                )}
              </button>
            ) : null}
            <span className="shell-brandName">Panacea Childcare Group</span>
          </div>
          <div className="shell-topCenter">
            <div className="shell-quickWrap" ref={quickWrapRef}>
              <button
                type="button"
                className={`shell-iconBtn shell-iconBtn--accent${quickOpen ? ' is-active' : ''}`}
                aria-label="Quick actions"
                aria-expanded={quickOpen}
                aria-haspopup="menu"
                onClick={() => setQuickOpen((v) => !v)}
              >
                <Zap size={18} strokeWidth={2.1} aria-hidden />
              </button>
              {quickOpen ? (
                <div className="shell-quickMenu" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setQuickOpen(false);
                      router.push('/enquiries');
                    }}
                  >
                    New enquiry
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setQuickOpen(false);
                      router.push('/messages');
                    }}
                  >
                    Messages
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setQuickOpen(false);
                      router.push('/attendance-leaves');
                    }}
                  >
                    Attendance
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setQuickOpen(false);
                      router.push('/billing-accounting');
                    }}
                  >
                    Create invoice
                  </button>
                </div>
              ) : null}
            </div>
            <form className="shell-search" onSubmit={onSearch}>
              <Search size={16} strokeWidth={2} className="shell-searchIcon" aria-hidden />
              <input
                placeholder="Search modules..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search modules"
              />
            </form>
            <Link href="/parent-communication" className="shell-tealBtn" prefetch>
              <PenLine size={15} strokeWidth={2.1} aria-hidden />
              <span>Post</span>
            </Link>
          </div>
          <div className="shell-topRight">
            <Link
              href="/calendar/staff-schedule"
              className="shell-iconBtn"
              aria-label="Events"
              title="Calendar"
              prefetch
            >
              <CalendarDays size={18} strokeWidth={2} aria-hidden />
            </Link>
            <Link
              href="/messages"
              className="shell-iconBtn"
              aria-label="Community"
              title="Messages"
              prefetch
            >
              <MessageCircle size={18} strokeWidth={2} aria-hidden />
            </Link>
            <Link
              href="/center-management/students"
              className="shell-iconBtn"
              aria-label="People"
              title="Students"
              prefetch
            >
              <Users size={18} strokeWidth={2} aria-hidden />
            </Link>
            <NotificationsDropdown />
            <ProfileDropdown
              userName={userName}
              userContact={userContact}
              avatarLabel="P"
              onMyAccount={() => router.push('/my-account')}
              onViewProfile={() => router.push('/profile')}
              onSettings={() => router.push('/settings')}
              onPremium={() => router.push('/premium-features')}
              onGetStarted={() => router.push('/get-started')}
              onOnboarding={() => router.push('/onboarding')}
              onResetPassword={() => router.push('/reset-password')}
              onNotificationPreferences={() => router.push('/notification-preferences')}
              onLogout={() => {
                authLogout();
                clearSession();
                router.push('/login');
              }}
            />
            <button
              type="button"
              className="shell-iconBtn shell-iconBtn--danger"
              title="Logout"
              aria-label="Logout"
              onClick={() => {
                authLogout();
                clearSession();
                router.push('/login');
              }}
            >
              <LogOut size={17} strokeWidth={2.1} aria-hidden />
            </button>
          </div>
        </header>
        <main className="shell-content">{children}</main>
      </div>
      {!builderMode ? <ChatWidgetLazy /> : null}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="shell-loading">Loading Panacea...</div>}>
      <AppShellInner>{children}</AppShellInner>
    </Suspense>
  );
}
