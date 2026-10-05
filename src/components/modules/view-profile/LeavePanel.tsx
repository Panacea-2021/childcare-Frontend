'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { FilePlus2, Plus, Upload } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { PillDatePicker } from '@/components/modules/view-profile/PillDatePicker';
import { SearchableSelect } from '@/components/modules/view-profile/SearchableSelect';
import '@/components/ui/module.css';
import './leave-panel.css';

const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Medical Leave'] as const;
type LeaveType = (typeof LEAVE_TYPES)[number];
type LeaveStatus = 'Pending' | 'Approved' | 'Denied';

type LeaveEntry = {
  id: string;
  leaveType: LeaveType;
  from: string; // YYYY-MM-DD
  to: string;
  reason: string;
  status: LeaveStatus;
  attachmentName?: string;
  attachmentMimeType?: string;
  attachmentDataBase64?: string;
  createdAt: string;
};

type LeaveBalance = {
  leaveType: LeaveType;
  allocated: number;
};

type StoredPayload = {
  entries: LeaveEntry[];
};

type Props = {
  ownerName: string;
  storageKey?: string;
};

const DEFAULT_BALANCES: LeaveBalance[] = [
  { leaveType: 'Sick Leave', allocated: 12 },
  { leaveType: 'Casual Leave', allocated: 12 },
  { leaveType: 'Medical Leave', allocated: 12 },
];

function storageId(ownerName: string, storageKey?: string) {
  const raw = (storageKey || ownerName || 'default').trim().toLowerCase().replace(/\s+/g, '-');
  return `panacea.staffLeave.${raw || 'default'}`;
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

function overlapsRange(from: string, to: string, rangeFrom: string, rangeTo: string) {
  if (!from || !to || !rangeFrom || !rangeTo) return true;
  return from <= rangeTo && to >= rangeFrom;
}

function daysInRange(from: string, to: string) {
  const a = new Date(`${from}T00:00:00`);
  const b = new Date(`${to}T00:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return 1;
  return Math.floor((b.getTime() - a.getTime()) / 86400000) + 1;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function openAttachment(entry: LeaveEntry) {
  if (!entry.attachmentDataBase64) {
    window.alert('This attachment is unavailable. Please add the leave again with the file.');
    return;
  }

  const mime = entry.attachmentMimeType || 'application/octet-stream';
  const binary = atob(entry.attachmentDataBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const blob = new Blob([buffer], { type: mime });
  const url = URL.createObjectURL(blob);

  const viewable =
    mime.startsWith('image/') || mime === 'application/pdf' || mime.startsWith('text/');

  if (viewable) {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (opened) {
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return;
    }
  }

  const a = document.createElement('a');
  a.href = url;
  a.download = entry.attachmentName || 'attachment';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function LeavePanel({ ownerName, storageKey }: Props) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const persistKey = storageId(ownerName, storageKey);

  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [entries, setEntries] = useState<LeaveEntry[]>([]);
  const [rangeFrom, setRangeFrom] = useState('2026-01-01');
  const [rangeTo, setRangeTo] = useState('2027-01-01');

  const [formOpen, setFormOpen] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveType | ''>('');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(persistKey);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredPayload;
        setEntries(Array.isArray(parsed.entries) ? parsed.entries : []);
      } else {
        setEntries([]);
      }
    } catch {
      setEntries([]);
    }
    setLoadedKey(persistKey);
  }, [persistKey]);

  useEffect(() => {
    if (loadedKey !== persistKey) return;
    try {
      localStorage.setItem(persistKey, JSON.stringify({ entries } satisfies StoredPayload));
    } catch {
      /* quota */
    }
  }, [entries, persistKey, loadedKey]);

  const filteredEntries = useMemo(
    () => entries.filter((e) => overlapsRange(e.from, e.to, rangeFrom, rangeTo)),
    [entries, rangeFrom, rangeTo],
  );

  const summary = useMemo(() => {
    return DEFAULT_BALANCES.map((balance) => {
      const typed = filteredEntries.filter((e) => e.leaveType === balance.leaveType);
      const approved = typed
        .filter((e) => e.status === 'Approved')
        .reduce((sum, e) => sum + daysInRange(e.from, e.to), 0);
      const pending = typed
        .filter((e) => e.status === 'Pending')
        .reduce((sum, e) => sum + daysInRange(e.from, e.to), 0);
      const denied = typed
        .filter((e) => e.status === 'Denied')
        .reduce((sum, e) => sum + daysInRange(e.from, e.to), 0);
      const leaveLeft = Math.max(0, balance.allocated - approved - pending);
      return {
        ...balance,
        approved,
        pending,
        denied,
        leaveLeft,
      };
    });
  }, [filteredEntries]);

  const openForm = () => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setFrom(iso);
    setTo(iso);
    setLeaveType('');
    setReason('');
    setAttachment(null);
    setFormError('');
    setDragActive(false);
    setFormOpen(true);
  };

  const saveLeave = async () => {
    if (!from || !to) {
      setFormError('Please select from and to dates.');
      return;
    }
    if (to < from) {
      setFormError('To date cannot be before from date.');
      return;
    }
    if (!leaveType) {
      setFormError('Please select a leave type.');
      return;
    }
    if (!reason.trim()) {
      setFormError('Please enter a reason for leave.');
      return;
    }

    const days = daysInRange(from, to);
    const row = summary.find((s) => s.leaveType === leaveType);
    if (row && days > row.leaveLeft) {
      setFormError(`Only ${row.leaveLeft} day(s) left for ${leaveType}.`);
      return;
    }

    let attachmentDataBase64: string | undefined;
    let attachmentMimeType: string | undefined;
    let attachmentName: string | undefined;
    if (attachment) {
      try {
        attachmentDataBase64 = await fileToBase64(attachment);
        attachmentMimeType = attachment.type || 'application/octet-stream';
        attachmentName = attachment.name;
      } catch {
        setFormError('Could not read the attachment. Try another file.');
        return;
      }
    }

    const entry: LeaveEntry = {
      id: uid(),
      leaveType,
      from,
      to,
      reason: reason.trim(),
      status: 'Pending',
      attachmentName,
      attachmentMimeType,
      attachmentDataBase64,
      createdAt: new Date().toISOString(),
    };

    setEntries((prev) => [entry, ...prev]);
    setFormOpen(false);
  };

  const onDropFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setAttachment(files[0]);
  };

  return (
    <section className="lv-panel" aria-label="Leave">
      <div className="lv-toolbar">
        <div className="lv-range">
          <PillDatePicker
            mode="date"
            value={rangeFrom}
            onChange={setRangeFrom}
            label="From"
            ariaLabel="Select from date"
          />
          <span className="lv-range__sep" aria-hidden>
            →
          </span>
          <PillDatePicker
            mode="date"
            value={rangeTo}
            onChange={setRangeTo}
            label="To"
            ariaLabel="Select to date"
          />
        </div>

        <button type="button" className="ui-btn ui-btn-primary lv-newBtn" onClick={openForm}>
          <FilePlus2 size={16} aria-hidden />
          New Leave
        </button>
      </div>

      <div className="lv-tableCard">
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Allocated</th>
                <th>Approved</th>
                <th>Pending</th>
                <th>Denied</th>
                <th>Leave Left</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((row) => (
                <tr key={row.leaveType}>
                  <td>{row.leaveType}</td>
                  <td>{row.allocated}</td>
                  <td>{row.approved}</td>
                  <td>{row.pending}</td>
                  <td>{row.denied}</td>
                  <td>{row.leaveLeft}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lv-entries">
        <div className="lv-entries__head">
          <h3>Leave Applications</h3>
        </div>
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Attachment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="lv-empty">No leave applications in this date range.</div>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.leaveType}</td>
                    <td>{toDisplayDate(entry.from)}</td>
                    <td>{toDisplayDate(entry.to)}</td>
                    <td>{daysInRange(entry.from, entry.to)}</td>
                    <td>{entry.reason}</td>
                    <td>
                      {entry.attachmentName ? (
                        <button
                          type="button"
                          className="lv-fileLink"
                          onClick={() => openAttachment(entry)}
                          title={`Open ${entry.attachmentName}`}
                        >
                          {entry.attachmentName}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <span
                        className={`lv-status lv-status--${entry.status.toLowerCase()}`}
                      >
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={formOpen}
        title="Staff Leaves"
        onClose={() => setFormOpen(false)}
        wide
        icon={<FilePlus2 size={18} />}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setFormOpen(false)}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={() => void saveLeave()}>
              Save
            </button>
          </>
        }
      >
        <div className="ui-grid-2">
          <div className="ui-field">
            <span className="ui-label">
              From Date <span className="req">*</span>
            </span>
            <PillDatePicker
              mode="date"
              value={from}
              onChange={setFrom}
              ariaLabel="From date"
            />
          </div>
          <div className="ui-field">
            <span className="ui-label">
              To Date <span className="req">*</span>
            </span>
            <PillDatePicker
              mode="date"
              value={to}
              onChange={setTo}
              ariaLabel="To date"
            />
          </div>
        </div>

        <div className="ui-field">
          <span className="ui-label">
            Leave Type <span className="req">*</span>
          </span>
          <SearchableSelect
            value={leaveType}
            onChange={(v) => setLeaveType(v as LeaveType | '')}
            options={LEAVE_TYPES.map((type) => ({ value: type, label: type }))}
            placeholder="Leave Type"
            searchPlaceholder="Search leave types…"
            ariaLabel="Leave Type"
          />
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="lv-reason">
            Reason for leave <span className="req">*</span>
          </label>
          <textarea
            id="lv-reason"
            className="ui-textarea"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for leave"
          />
        </div>

        <div className="ui-field">
          <span className="ui-label">Attachment</span>
          <div
            className={`lv-dropzone${dragActive ? ' is-active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              onDropFiles(e.dataTransfer.files);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
            }}
          >
            <span className="lv-dropzone__icon" aria-hidden>
              {attachment ? <Upload size={18} /> : <Plus size={20} />}
            </span>
            <p>
              {attachment ? (
                <strong>{attachment.name}</strong>
              ) : (
                'Click or drag attachment to this area to upload'
              )}
            </p>
            <input
              ref={fileInputRef}
              id={fileInputId}
              className="lv-hidden"
              type="file"
              onChange={(e) => onDropFiles(e.target.files)}
            />
          </div>
        </div>

        {formError ? <p className="ui-field-error" style={{ color: 'var(--color-close)', margin: 0 }}>{formError}</p> : null}
      </Modal>
    </section>
  );
}
