'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Crown } from 'lucide-react';
import './profile-dropdown.css';

export type ProfileDropdownActions = {
  onMyAccount: () => void;
  onViewProfile: () => void;
  onSettings: () => void;
  onPremium: () => void;
  onGetStarted: () => void;
  onOnboarding: () => void;
  onResetPassword: () => void;
  onNotificationPreferences: () => void;
  onLogout: () => void;
};

type ProfileMenuItem = {
  id: string;
  label: string;
  action: keyof ProfileDropdownActions;
  badge?: 'crown';
  danger?: boolean;
  dividerBefore?: boolean;
};

const MENU_ITEMS: ProfileMenuItem[] = [
  { id: 'my-account', label: 'My Account', action: 'onMyAccount' },
  { id: 'view-profile', label: 'View Profile', action: 'onViewProfile' },
  { id: 'settings', label: 'Settings', action: 'onSettings' },
  { id: 'premium', label: 'Premium Features', action: 'onPremium', badge: 'crown' },
  { id: 'get-started', label: 'Get Started', action: 'onGetStarted' },
  { id: 'onboarding', label: 'Onboarding', action: 'onOnboarding' },
  { id: 'reset-password', label: 'Reset Password', action: 'onResetPassword' },
  { id: 'notification-preferences', label: 'Notification Preferences', action: 'onNotificationPreferences' },
  { id: 'logout', label: 'Logout', action: 'onLogout', danger: true, dividerBefore: true },
];

type Props = ProfileDropdownActions & {
  userName: string;
  userContact: string;
  avatarLabel?: string;
};

export function ProfileDropdown({
  userName,
  userContact,
  avatarLabel = 'P',
  ...actions
}: Props) {
  const [open, setOpen] = useState(false);
  const [shiftLeft, setShiftLeft] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

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
    <div className="profile-dd" ref={rootRef}>
      <button
        type="button"
        className="shell-avatar profile-dd__trigger"
        aria-label="Open profile menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        {avatarLabel}
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={menuId}
          className={`profile-dd__panel is-open ${shiftLeft ? 'is-shift-left' : ''}`}
          role="menu"
          aria-label="Profile menu"
        >
          <div className="profile-dd__header">
            <div className="profile-dd__headerText">
              <p className="profile-dd__name">{userName}</p>
              <p className="profile-dd__contact">{userContact}</p>
            </div>
            <div className="profile-dd__photo" aria-hidden>
              {avatarLabel}
            </div>
          </div>

          <ul className="profile-dd__list">
            {MENU_ITEMS.map((item) => (
              <li key={item.id}>
                {item.dividerBefore ? <hr className="profile-dd__divider" /> : null}
                <button
                  type="button"
                  role="menuitem"
                  className={`profile-dd__item ${item.danger ? 'profile-dd__item--danger' : ''}`}
                  onClick={() => closeAndRun(actions[item.action])}
                >
                  <span>{item.label}</span>
                  {item.badge === 'crown' ? (
                    <span className="profile-dd__crown" aria-hidden>
                      <Crown strokeWidth={2.4} />
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
