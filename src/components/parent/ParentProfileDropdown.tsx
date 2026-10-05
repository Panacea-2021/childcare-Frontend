'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { User } from 'lucide-react';
import './parent-profile-dropdown.css';

export type ParentProfileDropdownActions = {
  onSwitchProfile?: () => void;
  onResetPassword: () => void;
  onNotificationPreferences: () => void;
  onLogout: () => void;
};

type MenuItem = {
  id: string;
  label: string;
  action: keyof ParentProfileDropdownActions;
  danger?: boolean;
};

type Props = ParentProfileDropdownActions & {
  userName?: string;
  userContact?: string;
  avatarLabel?: string;
  photoUrl?: string;
  /** When false, Switch Profile is still shown but handled gracefully by caller */
  canSwitchProfile?: boolean;
};

export function ParentProfileDropdown({
  photoUrl,
  canSwitchProfile = true,
  onSwitchProfile,
  onResetPassword,
  onNotificationPreferences,
  onLogout,
}: Props) {
  const [open, setOpen] = useState(false);
  const [shiftLeft, setShiftLeft] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const items: MenuItem[] = [
    ...(canSwitchProfile && onSwitchProfile
      ? [{ id: 'switch-profile', label: 'Switch Profile', action: 'onSwitchProfile' as const }]
      : []),
    { id: 'reset-password', label: 'Reset Password', action: 'onResetPassword' },
    {
      id: 'notification-preferences',
      label: 'Notification Preferences',
      action: 'onNotificationPreferences',
    },
    { id: 'logout', label: 'Logout', action: 'onLogout', danger: true },
  ];

  const actions: ParentProfileDropdownActions = {
    onSwitchProfile,
    onResetPassword,
    onNotificationPreferences,
    onLogout,
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setShiftLeft(false);
      return;
    }

    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const rect = panel.getBoundingClientRect();
      if (rect.left < 8) setShiftLeft(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [open]);

  const closeAndRun = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <div className="parent-profile-dd" ref={rootRef}>
      <button
        type="button"
        className="parent-profile-dd__trigger"
        aria-label="Open profile menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="parent-profile-dd__avatar"
          style={
            photoUrl
              ? {
                  backgroundImage: `url(${photoUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        >
          {photoUrl ? null : <User size={20} strokeWidth={1.75} aria-hidden />}
        </span>
        <span className="parent-profile-dd__online" aria-hidden title="Online" />
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={menuId}
          className={`parent-profile-dd__panel${shiftLeft ? ' is-shift-left' : ''}`}
          role="menu"
          aria-label="Profile menu"
        >
          <ul className="parent-profile-dd__list">
            {items.map((item) => {
              const fn = actions[item.action];
              if (!fn) return null;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    role="menuitem"
                    className={`parent-profile-dd__item${
                      item.danger ? ' parent-profile-dd__item--danger' : ''
                    }`}
                    onClick={() => closeAndRun(fn)}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
