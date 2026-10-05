'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ChevronDown, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { FloatingMenu } from '@/components/modules/center-management/ui';
import './parent-profile-actions.css';

type DisableDuration = '8h' | '1d' | 'indefinite';

const DURATIONS: {
  id: DisableDuration;
  label: string;
  hint: string;
}[] = [
  {
    id: '8h',
    label: '8 hours',
    hint: 'Re-enables automatically after 8 hours',
  },
  {
    id: '1d',
    label: '1 day',
    hint: 'Re-enables automatically after 24 hours',
  },
  {
    id: 'indefinite',
    label: 'Indefinitely',
    hint: 'Stays off until you turn 2FA back on',
  },
];

const ease = [0.22, 1, 0.36, 1] as const;
const STORAGE_KEY = 'panacea.parent.2faDisabled.v1';

type Props = {
  parentName: string;
  onToast?: (type: 'ok' | 'err', message: string) => void;
};

export function ParentProfileActions({ parentName, onToast }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [duration, setDuration] = useState<DisableDuration>('8h');
  const [busy, setBusy] = useState(false);
  const [disabledUntil, setDisabledUntil] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { until?: string | null; indefinite?: boolean };
      if (parsed.indefinite) {
        setDisabledUntil('indefinite');
        return;
      }
      if (parsed.until && new Date(parsed.until).getTime() > Date.now()) {
        setDisabledUntil(parsed.until);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const openDisableModal = () => {
    setMenuOpen(false);
    setDuration('8h');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (busy) return;
    setModalOpen(false);
  };

  const confirmDisable = () => {
    setBusy(true);
    window.setTimeout(() => {
      let until: string | null = null;
      let indefinite = false;
      if (duration === '8h') {
        until = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
      } else if (duration === '1d') {
        until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else {
        indefinite = true;
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ until, indefinite, at: new Date().toISOString() }));
      } catch {
        /* ignore */
      }
      setDisabledUntil(indefinite ? 'indefinite' : until);
      setBusy(false);
      setModalOpen(false);
      onToast?.(
        'ok',
        indefinite
          ? 'Two-factor authentication disabled indefinitely'
          : 'Two-factor authentication temporarily disabled',
      );
    }, 320);
  };

  return (
    <>
      <FloatingMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        align="end"
        minWidth={220}
        menuClassName="ppa-menu"
        trigger={
          <motion.button
            type="button"
            className={`ui-btn ui-btn-outline ppa-trigger${menuOpen ? ' is-open' : ''}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.985 }}
          >
            <span>Actions</span>
            <motion.span
              className="ppa-trigger-chevron"
              animate={{ rotate: menuOpen ? 180 : 0 }}
              transition={{ duration: 0.22, ease }}
            >
              <ChevronDown size={16} />
            </motion.span>
          </motion.button>
        }
      >
        <div className="ppa-menu-inner" role="menu">
          <motion.button
            type="button"
            role="menuitem"
            className="ppa-menu-item"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease }}
            whileHover={{ x: 2 }}
            onClick={openDisableModal}
          >
            <span className="ppa-menu-ico" aria-hidden>
              <ShieldCheck size={16} />
            </span>
            <span>Disable 2FA</span>
          </motion.button>
          {disabledUntil ? (
            <p className="ppa-menu-hint">
              {disabledUntil === 'indefinite'
                ? '2FA is currently off'
                : `2FA off until ${new Date(disabledUntil).toLocaleString()}`}
            </p>
          ) : null}
        </div>
      </FloatingMenu>

      <Modal
        open={modalOpen}
        title="Disable Two-Factor Authentication"
        subtitle={
          <>
            For <strong>{parentName || 'Parent'}</strong>
          </>
        }
        onClose={closeModal}
        icon={<ShieldCheck size={18} />}
        className="ppa-2fa-modal"
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={closeModal}
              disabled={busy}
            >
              Cancel
            </button>
            <motion.button
              type="button"
              className="ui-btn ui-btn-danger"
              onClick={confirmDisable}
              disabled={busy}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {busy ? 'Disabling…' : 'Disable 2FA'}
            </motion.button>
          </>
        }
      >
        <motion.div
          className="ppa-2fa-body"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease }}
        >
          <div className="ppa-2fa-warn" role="alert">
            <AlertTriangle size={18} />
            <p>
              Disabling 2FA lowers account security. This account will be able to sign in with only a
              password.
            </p>
          </div>

          <div className="ppa-2fa-section">
            <h3>How long should 2FA stay disabled?</h3>
            <div className="ppa-2fa-options" role="radiogroup" aria-label="Disable duration">
              <AnimatePresence initial={false}>
                {DURATIONS.map((opt, i) => {
                  const selected = duration === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`ppa-2fa-option${selected ? ' is-selected' : ''}`}
                      onClick={() => setDuration(opt.id)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * i, duration: 0.28, ease }}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.995 }}
                    >
                      <span className={`ppa-2fa-radio${selected ? ' is-on' : ''}`} aria-hidden />
                      <span className="ppa-2fa-option-copy">
                        <strong>{opt.label}</strong>
                        <em>{opt.hint}</em>
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </Modal>
    </>
  );
}
