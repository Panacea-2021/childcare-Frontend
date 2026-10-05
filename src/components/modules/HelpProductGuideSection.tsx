'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './HelpProductGuideSection.module.css';

type GuideCategory = {
  id: string;
  title: string;
  description: string;
  icon: 'rocket' | 'play' | 'folder' | 'book' | 'people' | 'teacher' | 'parent' | 'faq';
  authors: string[];
  others: number;
  articles: string[];
};

const CATEGORIES: GuideCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Panacea',
    description: 'Set up your childcare center on Panacea — rooms, programs, staff, and families.',
    icon: 'rocket',
    authors: ['Priya', 'Sam'],
    others: 1,
    articles: [
      'Create your first center profile',
      'Add rooms and age groups',
      'Invite staff and set roles',
      'Enroll your first students',
      'Connect parent accounts',
      'Checklist before go-live',
      'Welcome tour walkthrough',
    ],
  },
  {
    id: 'training-videos',
    title: 'Product Training Videos',
    description: 'Short training videos to help your team learn Panacea features quickly.',
    icon: 'play',
    authors: ['Alex'],
    others: 2,
    articles: [
      'Attendance overview (video)',
      'Posting classroom activities',
      'Messaging parents',
      'Billing walkthrough',
      'Reports and exports',
    ],
  },
  {
    id: 'release-notes',
    title: 'Product Release Notes',
    description: 'Latest updates, improvements, and new features shipped in Panacea.',
    icon: 'folder',
    authors: ['Jordan', 'Mia'],
    others: 0,
    articles: [
      'August 2026 release highlights',
      'Program module improvements',
      'Capacity planner updates',
      'Help center refresh',
      'Bug fixes and polish',
      'Upcoming roadmap peek',
    ],
  },
  {
    id: 'product-guide',
    title: 'Product Guide',
    description: 'Complete guide to configure and run day-to-day operations in Panacea.',
    icon: 'book',
    authors: ['Shivree'],
    others: 1,
    articles: [
      'Center setup checklist',
      'Daily operations guide',
      'Programs and capacity',
      'Billing basics',
      'Parent communication',
      'Staff scheduling tips',
      'Safety and permissions',
      'Troubleshooting common issues',
    ],
  },
  {
    id: 'admin-guide',
    title: 'Using Panacea: Admin Guide',
    description: 'Admin workflows for settings, permissions, billing, and center management.',
    icon: 'people',
    authors: ['Riley', 'Casey'],
    others: 3,
    articles: [
      'Admin permissions overview',
      'School and brand settings',
      'Fee plans and invoices',
      'User access control',
      'Data export and backups',
      'Multi-center tips',
    ],
  },
  {
    id: 'staff-guide',
    title: 'Teacher & Staff Instructions',
    description: 'Classroom tools for teachers — attendance, learning, posts, and messages.',
    icon: 'teacher',
    authors: ['Taylor'],
    others: 2,
    articles: [
      'Morning check-in flow',
      'Recording activities',
      'Learning observations',
      'Messaging a parent',
      'End-of-day checklist',
    ],
  },
  {
    id: 'parent-guide',
    title: "Parent's Guide",
    description: 'How families use Panacea to stay connected with their child’s day.',
    icon: 'parent',
    authors: ['Morgan', 'Ava'],
    others: 1,
    articles: [
      'Download and sign in',
      'View daily updates',
      'Message the teacher',
      'Invoices and payments',
      'Update profile details',
    ],
  },
  {
    id: 'faqs',
    title: 'Frequently Asked Questions (FAQs)',
    description: 'Quick answers to the most common questions from centers and families.',
    icon: 'faq',
    authors: ['Support'],
    others: 4,
    articles: [
      'How do I reset a password?',
      'Why can’t a parent see posts?',
      'How is attendance calculated?',
      'Can I change a program mid-month?',
      'Where do I download reports?',
      'How do I contact support?',
    ],
  },
];

const AVATAR_TONES = ['#5d5fef', '#8b5cf6', '#0ea5e9', '#14b8a6', '#f59e0b'];

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function CategoryIcon({ kind }: { kind: GuideCategory['icon'] }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    'aria-hidden': true as const,
  };
  if (kind === 'rocket') {
    return (
      <svg {...common}>
        <path d="M4.5 16.5c-1.5 1.3-2 3.5-2 3.5s2.2-.5 3.5-2" />
        <path d="M12 15l-3-3a9 9 0 0 1 9-9 9 9 0 0 1-6 12z" />
        <path d="M9 12H5l-1 4 4-1v-3z" />
        <circle cx="15" cy="9" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (kind === 'play') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M10 9.5v5l5-2.5-5-2.5z" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (kind === 'folder') {
    return (
      <svg {...common}>
        <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2.5h7.5A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-10z" />
      </svg>
    );
  }
  if (kind === 'book') {
    return (
      <svg {...common}>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5z" />
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      </svg>
    );
  }
  if (kind === 'people') {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="3.2" />
        <path d="M22 21v-2a3.5 3.5 0 0 0-2.6-3.35" />
        <path d="M16.5 3.8a3.2 3.2 0 0 1 0 6.2" />
      </svg>
    );
  }
  if (kind === 'teacher') {
    return (
      <svg {...common}>
        <path d="M4 19V7l8-3 8 3v12" />
        <path d="M12 12v7" />
        <path d="M8 19h8" />
        <circle cx="12" cy="10" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (kind === 'parent') {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <path d="M14 19a4.2 4.2 0 0 1 7 0" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function bylineText(authors: string[], others: number) {
  if (authors.length === 0) return 'By Panacea Team';
  if (others <= 0) {
    if (authors.length === 1) return `By ${authors[0]}`;
    return `By ${authors[0]} and ${authors[1]}`;
  }
  return `By ${authors[0]} and ${others} other${others === 1 ? '' : 's'}`;
}

export function HelpProductGuideSection() {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter((c) => {
      const blob = `${c.title} ${c.description} ${c.articles.join(' ')}`.toLowerCase();
      return blob.includes(q);
    });
  }, [query]);

  const active = activeId ? CATEGORIES.find((c) => c.id === activeId) ?? null : null;

  if (active) {
    return (
      <div className={styles.root}>
        <div className={styles.ambient} aria-hidden />
        <div className={styles.detail}>
          <button type="button" className={styles.backBtn} onClick={() => setActiveId(null)}>
            ← Back to Product Guide
          </button>
          <div className={styles.detailHead}>
            <span className={styles.iconBox}>
              <CategoryIcon kind={active.icon} />
            </span>
            <div>
              <h1 className={styles.detailTitle}>{active.title}</h1>
              <p className={styles.detailDesc}>{active.description}</p>
            </div>
          </div>
          <ul className={styles.articleList}>
            {active.articles.map((title) => (
              <li key={title}>
                <button
                  type="button"
                  className={styles.articleItem}
                  onClick={() => setToast('Full article content coming soon')}
                >
                  <span>{title}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {toast ? (
          <div className={styles.toast} role="status">
            {toast}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.ambient} aria-hidden />

      <header className={styles.hero}>
        <div className={styles.brandRow}>
          <span className={styles.brandMark} aria-hidden>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 3l7 4v5c0 4.5-2.8 7.8-7 9-4.2-1.2-7-4.5-7-9V7l7-4z" fill="currentColor" />
            </svg>
          </span>
          <span className={styles.brandName}>Panacea</span>
        </div>
        <h1 className={styles.headline}>Advice and answers from the Panacea Team</h1>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16.5 16.5L21 21" />
            </svg>
          </span>
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for articles..."
            aria-label="Search product guide articles"
          />
        </div>
      </header>

      {filtered.length === 0 ? (
        <p className={styles.empty}>No matching guides. Try another search.</p>
      ) : (
        <div className={styles.grid} role="list">
          {filtered.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={styles.card}
              role="listitem"
              onClick={() => setActiveId(cat.id)}
            >
              <span className={styles.iconBox}>
                <CategoryIcon kind={cat.icon} />
              </span>
              <h2 className={styles.cardTitle}>{cat.title}</h2>
              <p className={styles.cardDesc}>{cat.description}</p>
              <div className={styles.cardFoot}>
                <div className={styles.avatars} aria-hidden>
                  {cat.authors.slice(0, 3).map((name, i) => (
                    <span
                      key={name}
                      className={styles.avatar}
                      style={{ background: AVATAR_TONES[i % AVATAR_TONES.length] }}
                    >
                      {initials(name)}
                    </span>
                  ))}
                </div>
                <span className={styles.byline}>{bylineText(cat.authors, cat.others)}</span>
                <span className={styles.articleCount}>• {cat.articles.length} articles</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
