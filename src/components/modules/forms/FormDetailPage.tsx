'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  FolderKanban,
  Hourglass,
  Layers,
  Pencil,
  ScrollText,
  Search,
  Share2,
  Timer,
  Users,
  XCircle,
} from 'lucide-react';
import { analyticsFromSubmissions, SUBMISSIONS_BY_FORM } from './mockData';
import { getFormById, upsertForm } from './formsStore';
import type { FormItem, FormSubmission } from './types';
import './forms.css';
import './form-detail.css';

type Props = { formId: string };

function statusClass(status: FormSubmission['status']) {
  if (status === 'Approved') return 'fd-badge ok';
  if (status === 'Rejected') return 'fd-badge bad';
  if (status === 'Changes Requested') return 'fd-badge warn';
  if (status === 'Pending Review') return 'fd-badge review';
  return 'fd-badge pending';
}

export function FormDetailPage({ formId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormItem | null>(null);
  const [tab, setTab] = useState<'submissions' | 'summary'>('submissions');
  const [search, setSearch] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const current = getFormById(formId);
    if (!current) {
      setForm(null);
      return;
    }

    // Refresh seed analytics/sharedWith when localStorage still has empty KPIs
    // but we now have mock submissions for this form.
    const seedRows = SUBMISSIONS_BY_FORM[formId] ?? [];
    if (seedRows.length > 0) {
      const nextAnalytics = analyticsFromSubmissions(seedRows);
      const needsSync =
        current.sharedWith !== seedRows.length ||
        current.analytics.submitted !== nextAnalytics.submitted ||
        current.analytics.rejected !== nextAnalytics.rejected ||
        current.analytics.changesRequested !== nextAnalytics.changesRequested ||
        current.analytics.pendingReview !== nextAnalytics.pendingReview ||
        current.analytics.pendingSubmission !== nextAnalytics.pendingSubmission;

      if (needsSync) {
        const updated = {
          ...current,
          sharedWith: seedRows.length,
          analytics: nextAnalytics,
        };
        upsertForm(updated);
        setForm(updated);
        return;
      }
    }

    setForm(current);
  }, [formId]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  };

  const rows = useMemo(() => {
    const list = SUBMISSIONS_BY_FORM[formId] ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => r.studentName.toLowerCase().includes(q));
  }, [formId, search]);

  if (!form) {
    return (
      <div className="fd-page">
        <p className="fd-missing">
          Form not found. <Link href="/forms">Back to All Forms</Link>
        </p>
      </div>
    );
  }

  const a =
    rows.length > 0
      ? analyticsFromSubmissions(SUBMISSIONS_BY_FORM[formId] ?? [])
      : form.analytics;

  return (
    <div className="fd-page">
      <div className="fd-card">
        <div className="fd-crumb">
          <Link href="/forms">All Forms</Link>
          <span>/</span>
          <span>Submissions</span>
        </div>

        <div className="fd-header">
          <div>
            <h1>{form.name}</h1>
            <p className="fd-meta">
              Form shared with {form.sharedWith ?? 0} students
              {form.openUntil ? (
                <>
                  , responses open until <strong>{form.openUntil}</strong>
                  <button type="button" className="fd-inline-edit" aria-label="Edit open until date">
                    <Pencil size={12} />
                  </button>
                </>
              ) : null}
            </p>
          </div>
          <div className="fd-header-actions">
            <button
              type="button"
              className="fd-icon"
              title="Preview"
              onClick={() => router.push(`/forms/builder?id=${form.id}&title=${encodeURIComponent(form.name)}&mode=preview`)}
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              className="fd-icon"
              title="Edit"
              onClick={() => router.push(`/forms/builder?id=${form.id}&title=${encodeURIComponent(form.name)}`)}
            >
              <Pencil size={16} />
            </button>
            <div className="fd-share-wrap">
              <button type="button" className="fd-share-btn" onClick={() => setShareOpen((v) => !v)}>
                <Share2 size={15} />
                Share
              </button>
              {shareOpen ? (
                <div className="forms-menu fd-share-menu" role="menu">
                  <button type="button" role="menuitem" onClick={() => { setShareOpen(false); flash('Share with students'); }}>
                    Share With Students
                  </button>
                  <button type="button" role="menuitem" onClick={() => { setShareOpen(false); flash('Prefill & share'); }}>
                    Prefill &amp; Share
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      void navigator.clipboard?.writeText(`${window.location.origin}/forms/${form.id}`);
                      setShareOpen(false);
                      flash('Shareable link copied');
                    }}
                  >
                    Copy Shareable Link
                  </button>
                  <button type="button" role="menuitem" onClick={() => { setShareOpen(false); flash('QR download started'); }}>
                    Download QR Code
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="fd-stats">
          <div className="fd-stat">
            <CheckCircle2 size={18} className="ok" />
            <div>
              <span>Approved</span>
              <strong>{a.submitted}</strong>
            </div>
          </div>
          <div className="fd-stat">
            <XCircle size={18} className="bad" />
            <div>
              <span>Rejected</span>
              <strong>{a.rejected}</strong>
            </div>
          </div>
          <div className="fd-stat">
            <Pencil size={18} className="chg" />
            <div>
              <span>Changes Requested</span>
              <strong>{a.changesRequested}</strong>
            </div>
          </div>
          <div className="fd-stat">
            <Clock3 size={18} className="rev" />
            <div>
              <span>Pending Review</span>
              <strong>{a.pendingReview}</strong>
            </div>
          </div>
          <div className="fd-stat">
            <Hourglass size={18} className="pen" />
            <div>
              <span>Pending Submission</span>
              <strong>{a.pendingSubmission}</strong>
            </div>
          </div>
        </div>

        <div className="fd-tabs">
          <button type="button" className={tab === 'submissions' ? 'is-active' : undefined} onClick={() => setTab('submissions')}>
            Submissions
          </button>
          <button type="button" className={tab === 'summary' ? 'is-active' : undefined} onClick={() => setTab('summary')}>
            Form Summary
          </button>
        </div>

        {tab === 'submissions' ? (
          <>
            <div className="fd-toolbar">
              <label className="fd-search">
                <Search size={15} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name" />
              </label>
              <div className="fd-range">01/01/2026 - 31/12/2026</div>
              <div className="fd-tools">
                <button type="button" className="fd-icon" title="Export Excel" onClick={() => flash('Export started')}>
                  <FileSpreadsheet size={16} />
                </button>
                <button type="button" className="fd-icon" title="History" onClick={() => flash('Opening history')}>
                  <ScrollText size={16} />
                </button>
                <button type="button" className="fd-link" onClick={() => flash('Opening logs')}>
                  <Download size={14} />
                  View Logs
                </button>
              </div>
            </div>

            <div className="fd-table-wrap">
              {rows.length === 0 ? (
                <div className="fd-empty">
                  <div className="fd-empty-box" aria-hidden />
                  <strong>No data</strong>
                </div>
              ) : (
                <table className="fd-table">
                  <thead>
                    <tr>
                      <th />
                      <th>Student Name</th>
                      <th>Shared On</th>
                      <th>Submission Status</th>
                      <th>Expiry Date</th>
                      <th>Expiry Schedule</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <input type="checkbox" aria-label={`Select ${r.studentName}`} />
                        </td>
                        <td>{r.studentName}</td>
                        <td>{r.sharedOn}</td>
                        <td>
                          <span className={statusClass(r.status)}>{r.status}</span>
                        </td>
                        <td>{r.expiryDate}</td>
                        <td>{r.expirySchedule}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="fd-summary">
            <div className="fd-summary-hero">
              <div>
                <p className="fd-summary-kicker">Form overview</p>
                <h2>{form.name}</h2>
                <p>
                  Shared with <strong>{form.sharedWith ?? rows.length}</strong> students
                  {form.openUntil ? (
                    <>
                      {' '}
                      · Open until <strong>{form.openUntil}</strong>
                    </>
                  ) : null}
                </p>
              </div>
              <span className={`fd-summary-status ${form.status === 'Live' ? 'is-live' : 'is-draft'}`}>
                {form.status}
              </span>
            </div>

            <div className="fd-summary-grid">
              <div className="fd-summary-tile">
                <span className="fd-summary-icon is-accent">
                  <Layers size={18} />
                </span>
                <div>
                  <span>Form type</span>
                  <strong>{form.type}</strong>
                </div>
              </div>
              <div className="fd-summary-tile">
                <span className="fd-summary-icon is-purple">
                  <FolderKanban size={18} />
                </span>
                <div>
                  <span>Category</span>
                  <strong>{form.category}</strong>
                </div>
              </div>
              <div className="fd-summary-tile">
                <span className="fd-summary-icon is-green">
                  <CalendarDays size={18} />
                </span>
                <div>
                  <span>Created</span>
                  <strong>{form.date}</strong>
                </div>
              </div>
              <div className="fd-summary-tile">
                <span className="fd-summary-icon is-orange">
                  <Timer size={18} />
                </span>
                <div>
                  <span>Est. completion</span>
                  <strong>{form.durationMin ?? 0} minute(s)</strong>
                </div>
              </div>
              <div className="fd-summary-tile">
                <span className="fd-summary-icon is-blue">
                  <Users size={18} />
                </span>
                <div>
                  <span>Audience reach</span>
                  <strong>{form.sharedWith ?? rows.length} students</strong>
                </div>
              </div>
              <div className="fd-summary-tile">
                <span className="fd-summary-icon is-teal">
                  <CheckCircle2 size={18} />
                </span>
                <div>
                  <span>Total responses</span>
                  <strong>
                    {a.submitted + a.rejected + a.changesRequested + a.pendingReview + a.pendingSubmission}
                  </strong>
                </div>
              </div>
            </div>

            <div className="fd-summary-panels">
              <section className="fd-summary-panel">
                <h3>Response breakdown</h3>
                <ul className="fd-summary-bars">
                  {[
                    { label: 'Approved', value: a.submitted, tone: 'ok' },
                    { label: 'Rejected', value: a.rejected, tone: 'bad' },
                    { label: 'Changes Requested', value: a.changesRequested, tone: 'chg' },
                    { label: 'Pending Review', value: a.pendingReview, tone: 'rev' },
                    { label: 'Pending Submission', value: a.pendingSubmission, tone: 'pen' },
                  ].map((item) => {
                    const total =
                      a.submitted +
                        a.rejected +
                        a.changesRequested +
                        a.pendingReview +
                        a.pendingSubmission || 1;
                    const pct = Math.round((item.value / total) * 100);
                    return (
                      <li key={item.label}>
                        <div className="fd-summary-bar-head">
                          <span>{item.label}</span>
                          <strong>
                            {item.value} · {pct}%
                          </strong>
                        </div>
                        <div className="fd-summary-track">
                          <i className={item.tone} style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="fd-summary-panel">
                <h3>Form details</h3>
                <dl className="fd-summary-dl">
                  <div>
                    <dt>Form type</dt>
                    <dd>{form.type}</dd>
                  </div>
                  <div>
                    <dt>Category</dt>
                    <dd>{form.category}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>
                      <span className={`fd-summary-status sm ${form.status === 'Live' ? 'is-live' : 'is-draft'}`}>
                        {form.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Created on</dt>
                    <dd>{form.date}</dd>
                  </div>
                  <div>
                    <dt>Responses open until</dt>
                    <dd>{form.openUntil ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>Est. completion time</dt>
                    <dd>{form.durationMin ?? 0} minute(s)</dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>
        )}
      </div>

      {toast ? <div className="forms-toast">{toast}</div> : null}
    </div>
  );
}
