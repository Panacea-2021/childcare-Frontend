'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { ChevronsLeft, ChevronsRight, Menu, X } from 'lucide-react';
import { PARENT_MODULES, PARENT_PORTAL_HOME } from '@/lib/parent-modules';
import { NAV_KEY_BY_MODULE_ID, useParentLocale } from '@/lib/parent-i18n';
import {
  clearAllParentAuth,
  getParentSession,
  hasSelectedStudent,
  isParentVerified,
} from '@/lib/parent-auth';
import { NotificationsDropdown } from '@/components/app/NotificationsDropdown';
import { PageLoader } from '@/components/ui/loading';
import { ParentModuleIcon } from './ParentModuleIcon';
import { ParentProfileDropdown } from './ParentProfileDropdown';
import { useParentStudent } from './ParentStudentContext';
import '@/components/app/appshell.css';
import './parent-shell.css';

function isModuleActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ParentAppShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    ready: ctxReady,
    email,
    displayName,
    avatarLabel,
    schoolName,
    selectedStudent,
    studentCount,
    refresh,
  } = useParentStudent();
  const { t } = useParentLocale();

  const [authReady, setAuthReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [railMode, setRailMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const iconOnly = collapsed || railMode;

  useEffect(() => {
    if (!isParentVerified()) {
      router.replace('/login');
      return;
    }
    if (!hasSelectedStudent()) {
      router.replace('/select-student');
      return;
    }
    const session = getParentSession();
    const selected = session?.students.find((s) => s.id === session.selectedStudentId);
    if (!selected) {
      router.replace('/select-student');
      return;
    }
    refresh();
    setAuthReady(true);
  }, [router, refresh]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const sync = () => setRailMode(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  if (!authReady || !ctxReady || !selectedStudent) {
    return <PageLoader context="app" />;
  }

  return (
    <div
      className={`shell-layout shell-layout--parent${mobileOpen ? ' is-mobile-nav-open' : ''}${
        pathname.startsWith('/parent/messages') ? ' shell-layout--messages' : ''
      }`}
    >
      <button
        type="button"
        className={`parent-shell-backdrop${mobileOpen ? ' is-open' : ''}`}
        aria-label={t('shell.closeMenu')}
        tabIndex={mobileOpen ? 0 : -1}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`shell-sidebar parent-shell-sidebar ${iconOnly ? 'shell-collapsed' : ''}${
          mobileOpen ? ' is-drawer-open' : ''
        }`}
      >
            <div className="shell-sidebarTop">
              <Link
                href={PARENT_PORTAL_HOME}
                className="shell-logoMark"
                aria-label="Panacea Parent Portal home"
                prefetch
                onClick={() => setMobileOpen(false)}
              >
                <svg width="30" height="30" viewBox="0 0 40 40" aria-hidden>
                  <path
                    d="M20 4 L34 14 L28 32 L12 32 L6 14 Z"
                    fill="rgba(93, 95, 239, 0.12)"
                    stroke="#5D5FEF"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 10 L28 16 L20 28 L12 16 Z"
                    fill="#5D5FEF"
                    stroke="#4B51E0"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <button
                type="button"
                className="parent-shell-drawerClose"
                aria-label={t('shell.closeMenu')}
                onClick={() => setMobileOpen(false)}
              >
                <X size={18} strokeWidth={2.25} aria-hidden />
              </button>
            </div>

            <nav className="shell-nav" aria-label={t('shell.parentPortal')}>
              {PARENT_MODULES.map((mod) => {
                const active = isModuleActive(pathname, mod.href);
                const label = t(NAV_KEY_BY_MODULE_ID[mod.id] ?? 'nav.support');
                return (
                  <Link
                    key={mod.id}
                    href={mod.href}
                    prefetch
                    className={`shell-navItem ${active ? 'shell-active' : ''}`}
                    title={label}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <ParentModuleIcon id={mod.id} />
                    {!iconOnly && <span className="shell-navLabel">{label}</span>}
                    {iconOnly ? <span className="parent-shell-tooltip">{label}</span> : null}
                  </Link>
                );
              })}
            </nav>
          </aside>

      <div className="shell-mainCol">
        <header className="shell-topbar">
          <div className="shell-centerBrand parent-shell-brand">
            <button
              type="button"
              className="shell-collapseBtn parent-shell-menuBtn"
              onClick={() => setMobileOpen(true)}
              aria-label={t('shell.openMenu')}
            >
              <Menu size={18} strokeWidth={2.25} aria-hidden />
            </button>
            <button
              type="button"
              className="shell-collapseBtn parent-shell-collapseBtn"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? t('shell.expandMenu') : t('shell.collapseMenu')}
              aria-pressed={collapsed}
              title={collapsed ? t('shell.expandMenu') : t('shell.collapseMenu')}
            >
              {collapsed ? (
                <ChevronsRight size={18} strokeWidth={2.25} aria-hidden />
              ) : (
                <ChevronsLeft size={18} strokeWidth={2.25} aria-hidden />
              )}
            </button>
            <span className="shell-brandName">Panacea Childcare Group</span>
            <span className="parent-shell-schoolName" title={schoolName}>
              {schoolName}
            </span>
          </div>

          <div className="shell-topRight">
            <NotificationsDropdown
              viewAllHref="/parent/notifications"
              useParentStore
            />
            <ParentProfileDropdown
              userName={displayName}
              userContact={email}
              avatarLabel={avatarLabel}
              canSwitchProfile={studentCount > 1}
              onSwitchProfile={() => router.push('/select-student')}
              onResetPassword={() => router.push('/parent/reset-password')}
              onNotificationPreferences={() =>
                router.push('/parent/notification-preferences')
              }
              onLogout={() => {
                clearAllParentAuth();
                router.push('/login');
              }}
            />
          </div>
        </header>

        <main
          className={`shell-content${pathname.startsWith('/parent/messages') ? ' shell-content--messages' : ''}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export function ParentAppShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="shell-loading">Loading Parent Portal…</div>}>
      <ParentAppShellInner>{children}</ParentAppShellInner>
    </Suspense>
  );
}
