'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageSquarePlus,
  Search,
  Ticket,
  X,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import {
  isParentLanguage,
  PARENT_LANGUAGES,
  useParentLocale,
  type ParentLanguage,
} from '@/lib/parent-i18n';
import { ParentModuleIcon } from '../ParentModuleIcon';
import {
  ParentEmptyState,
  ParentPageHeader,
  ParentSkeleton,
} from '../shared';
import '../shared/parent-shared.css';
import './parent-support-page.css';

const APP_VERSION = '7.3.15';
const SUPPORT_EMAIL = 'info@myillumine.com';

type ToastState = { message: string } | null;

type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

/** Frontend-only FAQ mock — replace with CMS/API later. */
const SUPPORT_FAQ: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Account',
    question: 'How do I switch between children?',
    answer:
      'Use the student selector in the top bar. Choose another child to refresh Timeline, Calendar, Invoices and Profile for that student.',
  },
  {
    id: 'faq-2',
    category: 'Attendance',
    question: 'Where can I see attendance history?',
    answer:
      'Open Profile → Attendance to view present, absent and leave records, plus the overall attendance percentage.',
  },
  {
    id: 'faq-3',
    category: 'Fees & Payments',
    question: 'How do I pay an outstanding invoice?',
    answer:
      'Go to Student Invoices, open a pending invoice, then choose Pay Now. You can also download receipts after payment.',
  },
  {
    id: 'faq-4',
    category: 'Calendar',
    question: 'How do I filter school events?',
    answer:
      'On School Calendar, use the filter card to search by keyword, category, or student. Switch between month and list views anytime.',
  },
  {
    id: 'faq-5',
    category: 'Assignments',
    question: 'Where are lesson assignments?',
    answer:
      'Open Lessons from the sidebar. Filter by date range and status to see weekly plans, pending work and completed activities.',
  },
  {
    id: 'faq-6',
    category: 'Notifications',
    question: 'How do I mark notifications as read?',
    answer:
      'Open Notifications from the bell icon. Tap any item to mark it read, or use Mark all as read at the top of the list.',
  },
  {
    id: 'faq-7',
    category: 'Technical Issues',
    question: 'The page looks blank or stuck loading. What should I do?',
    answer:
      'Refresh the browser, confirm you selected a student, then try again. If it continues, raise a support ticket with the page name and time.',
  },
];

const FAQ_CATEGORIES = [
  'All',
  'Account',
  'Attendance',
  'Fees & Payments',
  'Calendar',
  'Assignments',
  'Notifications',
  'Technical Issues',
] as const;

export function ParentSupportPage() {
  const { ready: localeReady, language, setLanguage, t } = useParentLocale();
  const [booting, setBooting] = useState(true);
  const [pendingLanguage, setPendingLanguage] = useState<ParentLanguage>(language);
  const [langOpen, setLangOpen] = useState(false);
  const [langQuery, setLangQuery] = useState('');
  const [langDirty, setLangDirty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [issue, setIssue] = useState('');
  const [ticketCategory, setTicketCategory] = useState('General');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Normal');
  const [toast, setToast] = useState<ToastState>(null);
  const [helpQuery, setHelpQuery] = useState('');
  const [faqCategory, setFaqCategory] = useState<(typeof FAQ_CATEGORIES)[number]>('All');
  const [openFaq, setOpenFaq] = useState<string | null>('faq-1');
  const langRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const faqRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!localeReady) return;
    setPendingLanguage(language);
    const tmr = window.setTimeout(() => setBooting(false), 550);
    return () => window.clearTimeout(tmr);
  }, [localeReady, language]);

  useEffect(() => {
    if (!toast) return;
    const tmr = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(tmr);
  }, [toast]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
        setLangQuery('');
        setLangDirty(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (langOpen) {
      searchRef.current?.focus();
      searchRef.current?.select();
    }
  }, [langOpen]);

  const filteredLanguages = useMemo(() => {
    if (!langDirty) return [...PARENT_LANGUAGES];
    const q = langQuery.trim().toLowerCase();
    return PARENT_LANGUAGES.filter((l) => !q || l.toLowerCase().includes(q));
  }, [langQuery, langDirty]);

  const filteredFaq = useMemo(() => {
    const q = helpQuery.trim().toLowerCase();
    return SUPPORT_FAQ.filter((item) => {
      const catOk = faqCategory === 'All' || item.category === faqCategory;
      if (!catOk) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [helpQuery, faqCategory]);

  const openLanguageMenu = () => {
    setLangQuery(language);
    setLangDirty(false);
    setLangOpen(true);
  };

  const pickLanguage = (next: string) => {
    if (!isParentLanguage(next)) return;
    setPendingLanguage(next);
    setLangOpen(false);
    setLangQuery('');
    setLangDirty(false);
    if (next !== language) setConfirmOpen(true);
  };

  const confirmLanguage = () => {
    setConfirmOpen(false);
    setBooting(true);
    window.setTimeout(() => {
      setLanguage(pendingLanguage);
    }, 200);
  };

  const cancelLanguage = () => {
    setPendingLanguage(language);
    setConfirmOpen(false);
  };

  const openTicket = () => {
    setIssue('');
    setTicketSubject('');
    setTicketCategory('General');
    setTicketPriority('Normal');
    setTicketSuccess(false);
    setTicketOpen(true);
  };

  const submitTicket = () => {
    if (!issue.trim() && !ticketSubject.trim()) return;
    setTicketSuccess(true);
    window.setTimeout(() => {
      setTicketOpen(false);
      setTicketSuccess(false);
      setIssue('');
      setTicketSubject('');
      setToast({ message: t('support.toastSuccess') });
    }, 1400);
  };

  const scrollToFaq = () => {
    faqRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (booting || !localeReady) {
    return (
      <div className="psh-page psp-page">
        <ParentSkeleton variant="cards" rows={3} />
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="psh-page psp-page">
          <ParentPageHeader
            title="Support"
            description="Find answers, raise a request, or connect with the school support team."
            icon={<ParentModuleIcon id="support" />}
          />

          <m.section
            className="psp-hero"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <div className="psp-hero-shapes" aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <div className="psp-hero-copy">
              <p className="psp-hero-kicker">
                <LifeBuoy size={14} /> Parent Support
              </p>
              <h2 className="psp-hero-title">{t('support.needSupport')}</h2>
              <p className="psp-hero-email">
                {t('support.emailUsOn')}{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="psp-email-link">
                  {SUPPORT_EMAIL}
                </a>
              </p>
              <p className="psp-hero-version">
                {t('support.version')} {APP_VERSION}
              </p>
            </div>

            <div className="psh-search psp-hero-search">
              <Search size={18} className="psh-search-ico" aria-hidden />
              <input
                className="ui-input psh-search-input"
                type="search"
                placeholder="Search for help..."
                value={helpQuery}
                onChange={(e) => setHelpQuery(e.target.value)}
                aria-label="Search for help"
              />
              {helpQuery ? (
                <button
                  type="button"
                  className="psh-search-clear"
                  aria-label="Clear search"
                  onClick={() => setHelpQuery('')}
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
          </m.section>

          <div className="psh-option-grid">
            <button type="button" className="psh-option" onClick={scrollToFaq}>
              <span className="psh-option-icon" aria-hidden>
                <BookOpen size={20} />
              </span>
              <span className="psh-option-body">
                <p className="psh-option-title">Help Center</p>
                <p className="psh-option-desc">Browse common questions and helpful guides.</p>
              </span>
              <ArrowRight size={18} className="psh-option-arrow" aria-hidden />
            </button>

            <button type="button" className="psh-option" onClick={openTicket}>
              <span className="psh-option-icon psh-option-icon--amber" aria-hidden>
                <MessageSquarePlus size={20} />
              </span>
              <span className="psh-option-body">
                <p className="psh-option-title">Raise a Ticket</p>
                <p className="psh-option-desc">Tell us what you need help with.</p>
              </span>
              <ArrowRight size={18} className="psh-option-arrow" aria-hidden />
            </button>

            <a href={`mailto:${SUPPORT_EMAIL}`} className="psh-option">
              <span className="psh-option-icon psh-option-icon--mint" aria-hidden>
                <Mail size={20} />
              </span>
              <span className="psh-option-body">
                <p className="psh-option-title">Contact School</p>
                <p className="psh-option-desc">Connect with the school support team.</p>
              </span>
              <ArrowRight size={18} className="psh-option-arrow" aria-hidden />
            </a>

            <button
              type="button"
              className="psh-option"
              onClick={() => {
                setToast({
                  message: 'No open requests yet. Raise a ticket to start tracking support.',
                });
              }}
            >
              <span className="psh-option-icon psh-option-icon--rose" aria-hidden>
                <Ticket size={20} />
              </span>
              <span className="psh-option-body">
                <p className="psh-option-title">Track Requests</p>
                <p className="psh-option-desc">Check the status of your existing requests.</p>
              </span>
              <ArrowRight size={18} className="psh-option-arrow" aria-hidden />
            </button>
          </div>

          <section className="psh-surface psh-surface--pad psp-lang-card" aria-label="Language">
            <div className="psp-lang-head">
              <h2 className="psp-section-title">
                <HelpCircle size={16} aria-hidden />
                {t('support.changeLanguage')}
              </h2>
            </div>
            <div className="psp-lang-wrap" ref={langRef}>
              {langOpen ? (
                <div className="psp-lang-trigger is-open" role="combobox" aria-expanded>
                  <input
                    ref={searchRef}
                    className="ui-input psp-lang-input"
                    value={langQuery}
                    onChange={(e) => {
                      setLangDirty(true);
                      setLangQuery(e.target.value);
                    }}
                    aria-label={t('support.searchLanguage')}
                  />
                  <Search size={15} aria-hidden />
                </div>
              ) : (
                <button
                  type="button"
                  className="psp-lang-trigger"
                  aria-expanded={false}
                  aria-haspopup="listbox"
                  onClick={openLanguageMenu}
                >
                  <span>{language}</span>
                  <ChevronDown size={16} aria-hidden />
                </button>
              )}

              {langOpen ? (
                <div className="psp-lang-menu" role="listbox">
                  {filteredLanguages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      role="option"
                      aria-selected={language === lang}
                      className={`psp-lang-option${language === lang ? ' is-active' : ''}`}
                      onClick={() => pickLanguage(lang)}
                    >
                      {lang}
                    </button>
                  ))}
                  {filteredLanguages.length === 0 ? (
                    <p className="psp-lang-empty">{t('support.noLanguages')}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
            <button type="button" className="ui-btn ui-btn-primary" onClick={openTicket}>
              {t('support.raiseTicket')}
            </button>
          </section>

          <section className="psp-faq" ref={faqRef} aria-label="Frequently asked questions">
            <div className="psp-faq-head">
              <h2 className="psp-section-title">
                <ClipboardList size={16} aria-hidden />
                Frequently asked questions
              </h2>
              <p className="psp-faq-sub">Quick answers about attendance, fees, calendar and more.</p>
            </div>

            <div className="psp-faq-cats" role="tablist" aria-label="FAQ categories">
              {FAQ_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={faqCategory === cat}
                  className={`psp-faq-cat${faqCategory === cat ? ' is-active' : ''}`}
                  onClick={() => setFaqCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredFaq.length === 0 ? (
              <ParentEmptyState
                icon={<Search size={26} />}
                title="No matching answers"
                description="Try another keyword or browse a different category."
                action={
                  <button
                    type="button"
                    className="ui-btn ui-btn-outline"
                    onClick={() => {
                      setHelpQuery('');
                      setFaqCategory('All');
                    }}
                  >
                    Clear filters
                  </button>
                }
              />
            ) : (
              <div className="psh-accordion">
                {filteredFaq.map((item) => {
                  const open = openFaq === item.id;
                  return (
                    <div key={item.id} className={`psh-acc-item${open ? ' is-open' : ''}`}>
                      <button
                        type="button"
                        className="psh-acc-trigger"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? null : item.id)}
                      >
                        <span className="psh-acc-q">
                          <span className="psp-faq-tag">{item.category}</span>
                          {item.question}
                        </span>
                        <ChevronDown size={18} className="psh-acc-chevron" aria-hidden />
                      </button>
                      <AnimatePresence initial={false}>
                        {open ? (
                          <m.div
                            className="psh-acc-panel"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                          >
                            {item.answer}
                          </m.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <Modal
            open={confirmOpen}
            title={t('support.confirmTitle')}
            onClose={cancelLanguage}
            footer={
              <button type="button" className="ui-btn ui-btn-primary" onClick={confirmLanguage}>
                {t('support.ok')}
              </button>
            }
          >
            <p className="psp-confirm-text">{t('support.confirmBody')}</p>
          </Modal>

          <Modal
            open={ticketOpen}
            title={ticketSuccess ? 'Request submitted' : t('support.ticketTitle')}
            onClose={() => {
              if (!ticketSuccess) setTicketOpen(false);
            }}
            footer={
              ticketSuccess ? null : (
                <>
                  <button
                    type="button"
                    className="ui-btn ui-btn-outline"
                    onClick={() => setTicketOpen(false)}
                  >
                    {t('support.cancel')}
                  </button>
                  <button type="button" className="ui-btn ui-btn-primary" onClick={submitTicket}>
                    {t('support.submit')}
                  </button>
                </>
              )
            }
          >
            {ticketSuccess ? (
              <div className="psp-success">
                <span className="psp-success-ico" aria-hidden>
                  <CheckCircle2 size={36} />
                </span>
                <p className="psp-success-title">Thanks — we got your request</p>
                <p className="psp-success-desc">
                  Our support team typically responds within 24 hours.
                </p>
              </div>
            ) : (
              <div className="ui-grid-2">
                <div className="ui-field">
                  <label className="ui-label" htmlFor="psp-cat">
                    Category
                  </label>
                  <select
                    id="psp-cat"
                    className="ui-select"
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                  >
                    <option>General</option>
                    <option>Account</option>
                    <option>Attendance</option>
                    <option>Fees & Payments</option>
                    <option>Calendar</option>
                    <option>Assignments</option>
                    <option>Technical Issues</option>
                  </select>
                </div>
                <div className="ui-field">
                  <label className="ui-label" htmlFor="psp-priority">
                    Priority
                  </label>
                  <select
                    id="psp-priority"
                    className="ui-select"
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                  >
                    <option>Low</option>
                    <option>Normal</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="ui-label" htmlFor="psp-subject">
                    Subject
                  </label>
                  <input
                    id="psp-subject"
                    className="ui-input"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Short summary of your request"
                  />
                </div>
                <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="ui-label" htmlFor="parent-support-issue">
                    {t('support.describeIssue')}
                  </label>
                  <textarea
                    id="parent-support-issue"
                    className="ui-textarea"
                    rows={6}
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            )}
          </Modal>

          <AnimatePresence>
            {toast ? (
              <m.div
                className="psp-toast"
                role="status"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                <CheckCircle2 size={16} aria-hidden />
                <span>{toast.message}</span>
                <button
                  type="button"
                  className="psp-toast-close"
                  onClick={() => setToast(null)}
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </m.div>
            ) : null}
          </AnimatePresence>

        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
