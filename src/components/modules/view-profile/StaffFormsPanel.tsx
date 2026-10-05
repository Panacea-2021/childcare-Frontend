'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownUp, FilePlus2, MoreVertical, Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { MultiSelectDropdown } from '@/components/modules/view-profile/MultiSelectDropdown';
import { PillDatePicker } from '@/components/modules/view-profile/PillDatePicker';
import { SearchableSelect } from '@/components/modules/view-profile/SearchableSelect';
import {
  AppSelect,
  useClientPagination,
} from '@/components/modules/center-management/ui';
import '@/components/ui/module.css';
import '@/components/modules/center-management/students.css';
import './staff-forms-panel.css';

const STATUS_FILTER_OPTIONS = ['Draft', 'Pending', 'Submitted', 'Approved', 'Expired'] as const;
type FormStatus = (typeof STATUS_FILTER_OPTIONS)[number];

type StaffForm = {
  id: string;
  title: string;
  date: string; // DD-MM-YYYY
  status: FormStatus;
  expiryDate: string; // DD-MM-YYYY or —
  expirySchedule: string;
};

type StoredPayload = { forms: StaffForm[] };

type SortKey = 'title' | 'date' | 'status';

type Props = {
  ownerName: string;
  storageKey?: string;
};

const SAMPLE_FORMS: StaffForm[] = [
  {
    id: 'sf1',
    title: 'Emergency Contact Update',
    date: '15-07-2026',
    status: 'Submitted',
    expiryDate: '15-07-2027',
    expirySchedule: 'Yearly',
  },
  {
    id: 'sf2',
    title: 'Health Declaration',
    date: '02-08-2026',
    status: 'Pending',
    expiryDate: '02-02-2027',
    expirySchedule: 'Every 6 months',
  },
  {
    id: 'sf3',
    title: 'Code of Conduct Acknowledgement',
    date: '20-06-2026',
    status: 'Approved',
    expiryDate: '—',
    expirySchedule: 'One-time',
  },
];

function storageId(ownerName: string, storageKey?: string) {
  const raw = (storageKey || ownerName || 'default').trim().toLowerCase().replace(/\s+/g, '-');
  return `panacea.staffForms.${raw || 'default'}`;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toDisplayDate(iso: string) {
  if (!iso) return '—';
  const [yyyy, mm, dd] = iso.split('-');
  if (!yyyy || !mm || !dd) return iso;
  return `${dd}-${mm}-${yyyy}`;
}

function parseDisplayDate(value: string) {
  if (!value || value === '—') return 0;
  const [dd, mm, yyyy] = value.split('-').map(Number);
  if (!dd || !mm || !yyyy) return 0;
  return new Date(yyyy, mm - 1, dd).getTime();
}

function badgeClass(status: FormStatus) {
  return `sf-badge sf-badge--${status.toLowerCase()}`;
}

export function StaffFormsPanel({ ownerName, storageKey }: Props) {
  const persistKey = storageId(ownerName, storageKey);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [forms, setForms] = useState<StaffForm[]>([]);
  const [nameQuery, setNameQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FormStatus | 'All'>('All');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<FormStatus>('Pending');
  const [dateIso, setDateIso] = useState('');
  const [expiryIso, setExpiryIso] = useState('');
  const [schedule, setSchedule] = useState('One-time');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(persistKey);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredPayload;
        setForms(Array.isArray(parsed.forms) ? parsed.forms : []);
      } else {
        setForms(SAMPLE_FORMS);
      }
    } catch {
      setForms(SAMPLE_FORMS);
    }
    setLoadedKey(persistKey);
  }, [persistKey]);

  useEffect(() => {
    if (loadedKey !== persistKey) return;
    try {
      localStorage.setItem(persistKey, JSON.stringify({ forms } satisfies StoredPayload));
    } catch {
      /* quota */
    }
  }, [forms, persistKey, loadedKey]);

  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [moreOpen]);

  const rows = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    let list = forms.filter((f) => {
      const nameOk = !q || f.title.toLowerCase().includes(q);
      const statusOk = statusFilter === 'All' || f.status === statusFilter;
      return nameOk && statusOk;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
      else cmp = parseDisplayDate(a.date) - parseDisplayDate(b.date);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [forms, nameQuery, statusFilter, sortKey, sortDir]);

  const { page, setPage, pageSize, setPageSize, totalItems, totalPages, pageItems } =
    useClientPagination(rows, 10);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir(key === 'title' ? 'asc' : 'desc');
  };

  const openModal = () => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setTitle('');
    setStatus('Pending');
    setDateIso(iso);
    setExpiryIso('');
    setSchedule('One-time');
    setError('');
    setModalOpen(true);
  };

  const saveForm = () => {
    if (!title.trim()) {
      setError('Please enter a form title.');
      return;
    }
    if (!dateIso) {
      setError('Please select a date.');
      return;
    }

    const entry: StaffForm = {
      id: uid(),
      title: title.trim(),
      date: toDisplayDate(dateIso),
      status,
      expiryDate: expiryIso ? toDisplayDate(expiryIso) : '—',
      expirySchedule: schedule,
    };
    setForms((prev) => [entry, ...prev]);
    setModalOpen(false);
  };

  const downloadExcel = () => {
    setMoreOpen(false);
    const headers = ['Title', 'Date', 'Status', 'Expiry Date', 'Expiry Schedule'];
    const escapeCell = (value: string) => `"${String(value).replace(/"/g, '""')}"`;
    const lines = [
      headers.join(','),
      ...rows.map((row) =>
        [row.title, row.date, row.status, row.expiryDate, row.expirySchedule]
          .map(escapeCell)
          .join(','),
      ),
    ];
    // UTF-8 BOM so Excel opens special characters correctly
    const csv = `\uFEFF${lines.join('\r\n')}`;
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-forms-${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="sf-panel" aria-label="Forms">
      <div className="sf-toolbar">
        <div className="sf-filters">
          <label className="sf-search">
            <Search size={16} aria-hidden />
            <input
              type="search"
              placeholder="Search By Name"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
            />
          </label>
          <div className="sf-statusFilter">
            <MultiSelectDropdown
              label="Search By Status"
              options={['All Statuses', ...STATUS_FILTER_OPTIONS]}
              value={statusFilter === 'All' ? [] : [statusFilter]}
              onChange={(next) => {
                const selected = next[0];
                if (!selected || selected === 'All Statuses') {
                  setStatusFilter('All');
                } else {
                  setStatusFilter(selected as FormStatus);
                }
              }}
              placeholder="Search By Status"
              multiple={false}
            />
          </div>
        </div>

        <div className="sf-actions">
          <button type="button" className="ui-btn ui-btn-primary" onClick={openModal}>
            <FilePlus2 size={16} aria-hidden />
            Submit New Form
          </button>
          <div className="sf-moreWrap" ref={moreRef}>
            <button
              type="button"
              className="sf-iconBtn"
              aria-label="More actions"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((v) => !v)}
            >
              <MoreVertical size={18} />
            </button>
            {moreOpen ? (
              <div className="sf-moreMenu" role="menu">
                <button type="button" role="menuitem" onClick={downloadExcel}>
                  Download Excel
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="sf-tableCard">
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th
                  className={`sf-sortable${sortKey === 'title' ? ' is-sorted' : ''}`}
                  onClick={() => toggleSort('title')}
                >
                  <span className="sf-thInner">
                    Title
                    <ArrowDownUp size={14} className="sf-sortIcon" aria-hidden />
                  </span>
                </th>
                <th
                  className={`sf-sortable${sortKey === 'date' ? ' is-sorted' : ''}`}
                  onClick={() => toggleSort('date')}
                >
                  <span className="sf-thInner">
                    Date
                    <ArrowDownUp size={14} className="sf-sortIcon" aria-hidden />
                  </span>
                </th>
                <th
                  className={`sf-sortable${sortKey === 'status' ? ' is-sorted' : ''}`}
                  onClick={() => toggleSort('status')}
                >
                  <span className="sf-thInner">
                    Status
                    <ArrowDownUp size={14} className="sf-sortIcon" aria-hidden />
                  </span>
                </th>
                <th>Expiry Date</th>
                <th>Expiry Schedule</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="sf-empty">No Data</div>
                  </td>
                </tr>
              ) : (
                pageItems.map((row) => (
                  <tr key={row.id}>
                    <td>{row.title}</td>
                    <td>{row.date}</td>
                    <td>
                      <span className={badgeClass(row.status)}>{row.status}</span>
                    </td>
                    <td>{row.expiryDate}</td>
                    <td>{row.expirySchedule}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {rows.length > 0 ? (
          <div className="cm-footer sf-footer">
            <div className="cm-footer-meta">
              Showing{' '}
              {totalItems === 0
                ? '0-0'
                : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalItems)}`}{' '}
              of {totalItems} results
            </div>
            <div className="cm-pager">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ‹
              </button>
              <button type="button" className="is-active">
                {page}
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                ›
              </button>
            </div>
            <div className="cm-page-size">
              <AppSelect
                value={String(pageSize)}
                onChange={(v) => setPageSize(Number(v))}
                options={[
                  { value: '10', label: '10 / page' },
                  { value: '20', label: '20 / page' },
                  { value: '30', label: '30 / page' },
                  { value: '50', label: '50 / page' },
                ]}
                align="end"
              />
            </div>
          </div>
        ) : null}
      </div>

      <Modal
        open={modalOpen}
        title="Submit New Form"
        onClose={() => setModalOpen(false)}
        wide
        icon={<FilePlus2 size={18} />}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={saveForm}>
              Submit
            </button>
          </>
        }
      >
        <div className="ui-field">
          <label className="ui-label" htmlFor="sf-title">
            Title <span className="req">*</span>
          </label>
          <input
            id="sf-title"
            className="ui-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Form title"
          />
        </div>

        <div className="ui-grid-2">
          <div className="ui-field">
            <span className="ui-label">
              Date <span className="req">*</span>
            </span>
            <PillDatePicker mode="date" value={dateIso} onChange={setDateIso} ariaLabel="Form date" />
          </div>
          <div className="ui-field">
            <span className="ui-label">Status</span>
            <SearchableSelect
              value={status}
              onChange={(v) => setStatus(v as FormStatus)}
              options={STATUS_FILTER_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
              placeholder="Status"
              searchPlaceholder="Search status…"
              ariaLabel="Status"
            />
          </div>
        </div>

        <div className="ui-grid-2">
          <div className="ui-field">
            <span className="ui-label">Expiry Date</span>
            <PillDatePicker
              mode="date"
              value={expiryIso}
              onChange={setExpiryIso}
              ariaLabel="Expiry date"
              preferPlacement="above"
            />
          </div>
          <div className="ui-field">
            <span className="ui-label">Expiry Schedule</span>
            <SearchableSelect
              value={schedule}
              onChange={setSchedule}
              options={['One-time', 'Every 6 months', 'Yearly', 'No expiry']}
              placeholder="Expiry schedule"
              searchPlaceholder="Search schedule…"
              ariaLabel="Expiry Schedule"
            />
          </div>
        </div>

        {error ? (
          <p style={{ margin: 0, color: 'var(--color-close)', fontSize: '0.86rem' }}>{error}</p>
        ) : null}
      </Modal>
    </section>
  );
}
