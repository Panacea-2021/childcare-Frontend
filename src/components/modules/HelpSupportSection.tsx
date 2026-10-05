'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import '@/components/ui/module.css';
import styles from './HelpSupportSection.module.css';

const LANGUAGES = [
  'English',
  'English (UK)',
  'Arabic',
  'Bulgarian',
  'Dutch',
  'French',
  'German',
  'Greek',
  'Hindi',
  'Italian',
  'Portuguese',
  'Spanish',
  'Tamil',
  'Telugu',
];

const APP_VERSION = '7.3.15';
const SUPPORT_EMAIL = 'info@myillumine.com';

type ToastState = { type: 'ok' | 'err'; message: string } | null;

export function HelpSupportSection() {
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('English');
  const [pendingLanguage, setPendingLanguage] = useState('English');
  const [langOpen, setLangOpen] = useState(false);
  const [langQuery, setLangQuery] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [issue, setIssue] = useState('');
  const [toast, setToast] = useState<ToastState>(null);
  const langRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 600);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filteredLanguages = useMemo(() => {
    const q = langQuery.trim().toLowerCase();
    return LANGUAGES.filter((l) => !q || l.toLowerCase().includes(q));
  }, [langQuery]);

  const pickLanguage = (next: string) => {
    setPendingLanguage(next);
    setLangOpen(false);
    setLangQuery('');
    if (next !== language) setConfirmOpen(true);
  };

  const confirmLanguage = () => {
    setLanguage(pendingLanguage);
    setConfirmOpen(false);
    setToast({ type: 'ok', message: 'Language updated' });
  };

  const cancelLanguage = () => {
    setPendingLanguage(language);
    setConfirmOpen(false);
  };

  const submitTicket = () => {
    if (!issue.trim()) {
      setToast({ type: 'err', message: 'Please describe your issue' });
      return;
    }
    setTicketOpen(false);
    setIssue('');
    setToast({ type: 'ok', message: 'Support ticket submitted' });
  };

  if (loading) {
    return (
      <div className={styles.root}>
        <div className={styles.loading} role="status" aria-label="Loading">
          <span className={styles.spinner} aria-hidden />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <section className={styles.card}>
        <h1 className={styles.title}>Need Support?</h1>
        <p className={styles.email}>
          Email us on{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className={styles.emailLink}>
            {SUPPORT_EMAIL}
          </a>
        </p>
        <p className={styles.version}>Version {APP_VERSION}</p>

        <div className={styles.langBlock}>
          <h2 className={styles.langLabel}>Change Language</h2>
          <div className={styles.langWrap} ref={langRef}>
            <button
              type="button"
              className={styles.langTrigger}
              aria-expanded={langOpen}
              onClick={() => setLangOpen((v) => !v)}
            >
              <span>{language}</span>
              <span className={styles.langChevron} aria-hidden>
                ▾
              </span>
            </button>
            {langOpen ? (
              <div className={styles.langMenu} role="listbox">
                <div className={styles.langSearch}>
                  <input
                    className="ui-input"
                    placeholder="Search language"
                    value={langQuery}
                    onChange={(e) => setLangQuery(e.target.value)}
                    aria-label="Search language"
                    autoFocus
                  />
                </div>
                <div className={styles.langList}>
                  {filteredLanguages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      role="option"
                      aria-selected={language === lang}
                      className={`${styles.langOption} ${language === lang ? styles.langOptionOn : ''}`}
                      onClick={() => pickLanguage(lang)}
                    >
                      {lang}
                    </button>
                  ))}
                  {filteredLanguages.length === 0 ? (
                    <p className={styles.langEmpty}>No languages found</p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className={`ui-btn ui-btn-primary ${styles.ticketBtn}`}
          onClick={() => {
            setIssue('');
            setTicketOpen(true);
          }}
        >
          Raise Support Ticket
        </button>
      </section>

      <Modal
        open={confirmOpen}
        title="Are you sure ?"
        onClose={cancelLanguage}
        footer={
          <button type="button" className="ui-btn ui-btn-primary" onClick={confirmLanguage}>
            OK
          </button>
        }
      >
        <p className={styles.confirmText}>The web portal will refresh for the changes to take effect.</p>
      </Modal>

      <Modal
        open={ticketOpen}
        title="Support Ticket"
        onClose={() => setTicketOpen(false)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setTicketOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={submitTicket}>
              Submit
            </button>
          </>
        }
      >
        <div className="ui-field">
          <label className="ui-label" htmlFor="support-issue">
            Describe your issue
          </label>
          <textarea
            id="support-issue"
            className={`ui-textarea ${styles.issueArea}`}
            rows={8}
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            autoFocus
          />
        </div>
      </Modal>

      {toast ? (
        <div className={styles.toast} role="status">
          <span className={toast.type === 'ok' ? styles.toastOk : styles.toastErr} aria-hidden>
            {toast.type === 'ok' ? '✓' : '!'}
          </span>
          <span>{toast.message}</span>
          <button type="button" className={styles.toastClose} onClick={() => setToast(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}
