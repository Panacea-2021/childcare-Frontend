'use client';

import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlignLeft,
  CheckCircle2,
  ClipboardList,
  Layers,
  Upload,
  X,
} from 'lucide-react';
import { PremiumSelect } from '@/components/modules/calendar/PremiumSelect';
import { PremiumDateField } from '@/components/modules/calendar/PremiumDateField';
import {
  DAILY_REPORT_ROOMS,
  TODAY_DATE,
  createEmptyItems,
} from '@/lib/mock/mockDailyReports';
import type {
  ChecklistItemDef,
  GenerateReportFormValues,
  IncidentSeverity,
  RoomDailyReport,
} from '@/types/dailyReport';
import { enabledChecklist } from './utils';

type Props = {
  open: boolean;
  checklist: ChecklistItemDef[];
  editing?: RoomDailyReport | null;
  onClose: () => void;
  onSaveDraft: (report: RoomDailyReport) => void;
  onPublish: (report: RoomDailyReport) => void;
};

const emptyForm = (): GenerateReportFormValues => ({
  room: DAILY_REPORT_ROOMS[0]?.name ?? '',
  date: TODAY_DATE,
  overallNotes: '',
  notifyParent: true,
  itemIds: [],
  remarks: {},
});

function SectionCard({
  title,
  icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      className="cal-form-section"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28 }}
    >
      <header className="cal-form-section-head">
        <span className="cal-form-section-ico" aria-hidden>
          {icon}
        </span>
        <h3>{title}</h3>
      </header>
      <div className="cal-form-section-body">{children}</div>
    </motion.section>
  );
}

export function GenerateReportModal({
  open,
  checklist,
  editing,
  onClose,
  onSaveDraft,
  onPublish,
}: Props) {
  const titleId = useId();
  const columns = useMemo(() => enabledChecklist(checklist), [checklist]);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<GenerateReportFormValues>(emptyForm);
  const [incidentType, setIncidentType] = useState('Minor Injury');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('low');
  const [incidentNotify, setIncidentNotify] = useState(true);
  const [photoName, setPhotoName] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const enabledIds = checklist.filter((c) => c.enabled).map((c) => c.id);
    if (editing) {
      setForm({
        room: editing.room,
        date: editing.date,
        overallNotes: editing.overallNotes ?? '',
        notifyParent: editing.notifyParent,
        itemIds: editing.items.filter((i) => i.completed).map((i) => i.itemId),
        remarks: Object.fromEntries(
          editing.items.filter((i) => i.remarks).map((i) => [i.itemId, i.remarks as string]),
        ),
      });
      const inc = editing.items.find((i) => i.itemId === 'cl-incident' && i.incident);
      if (inc?.incident) {
        setIncidentType(inc.incident.type);
        setIncidentDesc(inc.incident.description);
        setSeverity(inc.incident.severity);
        setIncidentNotify(inc.incident.notifyParent);
        setPhotoName(inc.incident.photoName);
      }
    } else {
      setForm({
        ...emptyForm(),
        itemIds: enabledIds.filter((id) => id !== 'cl-incident'),
      });
      setIncidentDesc('');
      setPhotoName(undefined);
    }
    setErrors({});
    setSaving(false);
  }, [open, editing, checklist]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const toggleItem = (id: string) => {
    setForm((prev) => {
      const has = prev.itemIds.includes(id);
      return {
        ...prev,
        itemIds: has ? prev.itemIds.filter((x) => x !== id) : [...prev.itemIds, id],
      };
    });
  };

  const buildReport = (mode: 'draft' | 'publish'): RoomDailyReport | null => {
    const nextErrors: Record<string, string> = {};
    if (!form.room) nextErrors.room = 'Select a room';
    if (!form.date) nextErrors.date = 'Select a date';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return null;

    const roomMeta = DAILY_REPORT_ROOMS.find((r) => r.name === form.room);
    const baseItems = createEmptyItems(checklist);
    const extraDefs = editing?.extraItems ?? [];
    const extraItems = createEmptyItems(extraDefs);
    const allItems = [...baseItems, ...extraItems.filter((e) => !baseItems.some((b) => b.itemId === e.itemId))];

    const items = allItems.map((item) => {
      const completed = form.itemIds.includes(item.itemId);
      const remarks = form.remarks[item.itemId];
      const entry = {
        ...item,
        completed,
        completedAt: completed ? '10:30' : undefined,
        completedBy: completed ? 'Ms. Ananya' : undefined,
        remarks: remarks || undefined,
      };
      if (item.itemId === 'cl-incident' && completed) {
        entry.incident = {
          type: incidentType,
          description: incidentDesc || remarks || 'Incident recorded.',
          severity,
          notifyParent: incidentNotify,
          photoName,
        };
        entry.remarks = entry.incident.description;
      }
      return entry;
    });

    const completable = items.filter((i) => i.itemId !== 'cl-incident');
    const done = completable.filter((i) => i.completed).length;
    const percent =
      completable.length === 0 ? 0 : Math.round((done / completable.length) * 100);

    return {
      id: editing?.id ?? `room-dr-new-${Date.now()}`,
      room: form.room,
      date: form.date,
      studentCount: roomMeta?.studentCount ?? editing?.studentCount ?? 12,
      presentCount: editing?.presentCount ?? roomMeta?.studentCount ?? 12,
      items,
      extraItems: extraDefs,
      overallNotes: form.overallNotes || undefined,
      status:
        mode === 'publish'
          ? percent >= 100
            ? 'completed'
            : 'partially_completed'
          : 'draft',
      completionPercent: percent,
      notifyParent: form.notifyParent,
      hasIncident: items.some((i) => i.itemId === 'cl-incident' && i.completed),
    };
  };

  const submit = async (mode: 'draft' | 'publish') => {
    const report = buildReport(mode);
    if (!report) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 280));
    if (mode === 'draft') onSaveDraft(report);
    else onPublish(report);
    setSaving(false);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="cal-dialog-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="cal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, x: 56, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 28, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cal-dialog-header">
              <div className="cal-dialog-title-block">
                <span className="cal-dialog-emoji" aria-hidden>
                  📋
                </span>
                <div>
                  <h2 id={titleId}>
                    {editing ? 'Edit Daily Report' : 'Generate Daily Report'}
                  </h2>
                  <p>Record today’s checklist activities for a classroom</p>
                </div>
              </div>
              <button type="button" className="cal-dialog-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="cal-dialog-body">
              <SectionCard title="Report Information" icon={<Layers size={15} />} delay={0.04}>
                <div className="cal-modal-grid">
                  <PremiumSelect
                    id="dr-gen-room"
                    className="cal-span-2"
                    placeholder="Select Room"
                    icon={<Layers size={16} />}
                    value={form.room}
                    error={errors.room}
                    onChange={(v) => setForm((p) => ({ ...p, room: v }))}
                    options={DAILY_REPORT_ROOMS.map((r) => ({ value: r.name, label: r.name }))}
                  />
                  <PremiumDateField
                    id="dr-gen-date"
                    placeholder="Select Date"
                    value={form.date}
                    error={errors.date}
                    onChange={(v) => setForm((p) => ({ ...p, date: v }))}
                  />
                  <PremiumSelect
                    id="dr-gen-notify"
                    placeholder="Parent Notification"
                    icon={<CheckCircle2 size={16} />}
                    value={form.notifyParent ? 'yes' : 'no'}
                    onChange={(v) => setForm((p) => ({ ...p, notifyParent: v === 'yes' }))}
                    options={[
                      { value: 'yes', label: 'Notify Parents' },
                      { value: 'no', label: 'Do Not Notify' },
                    ]}
                  />
                  <div className="cal-float-field cal-span-2">
                    <div className="cal-float-shell">
                      <span className="cal-float-icon" aria-hidden>
                        <AlignLeft size={16} />
                      </span>
                      <div className="cal-float-control">
                        <textarea
                          id="dr-gen-notes"
                          className={`cal-float-input cal-float-textarea ${form.overallNotes ? 'has-value' : ''}`}
                          rows={3}
                          placeholder=" "
                          value={form.overallNotes}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, overallNotes: e.target.value }))
                          }
                        />
                        <label htmlFor="dr-gen-notes" className="cal-float-label">
                          Overall Notes
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Checklist Items" icon={<ClipboardList size={15} />} delay={0.08}>
                <div className="dr-check-grid">
                  {columns.map((col) => {
                    const checked = form.itemIds.includes(col.id);
                    return (
                      <label key={col.id} className="dr-check-option">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleItem(col.id)}
                        />
                        <div style={{ flex: 1 }}>
                          <strong>{col.name}</strong>
                          {checked ? (
                            <textarea
                              className="ui-textarea"
                              placeholder={`Remarks for ${col.name}`}
                              value={form.remarks[col.id] ?? ''}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  remarks: { ...prev.remarks, [col.id]: e.target.value },
                                }))
                              }
                            />
                          ) : null}
                          {col.key === 'incident' && checked ? (
                            <div className="dr-incident-box">
                              <PremiumSelect
                                id="dr-inc-type"
                                placeholder="Incident Type"
                                value={incidentType}
                                onChange={setIncidentType}
                                options={[
                                  { value: 'Minor Injury', label: 'Minor Injury' },
                                  { value: 'Behavioral', label: 'Behavioral' },
                                  { value: 'Health', label: 'Health' },
                                  { value: 'Other', label: 'Other' },
                                ]}
                              />
                              <textarea
                                className="ui-textarea"
                                rows={3}
                                placeholder="Description"
                                value={incidentDesc}
                                onChange={(e) => setIncidentDesc(e.target.value)}
                              />
                              <PremiumSelect
                                id="dr-inc-sev"
                                placeholder="Severity"
                                value={severity}
                                onChange={(v) => setSeverity(v as IncidentSeverity)}
                                options={[
                                  { value: 'low', label: 'Low' },
                                  { value: 'medium', label: 'Medium' },
                                  { value: 'high', label: 'High' },
                                ]}
                              />
                              <label
                                style={{
                                  display: 'flex',
                                  gap: 8,
                                  alignItems: 'center',
                                  fontSize: 14,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={incidentNotify}
                                  onChange={(e) => setIncidentNotify(e.target.checked)}
                                />
                                Notify Parent
                              </label>
                              <label className="dr-upload" style={{ cursor: 'pointer' }}>
                                <Upload size={18} />
                                {photoName || 'Photo Upload (static UI)'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={(e) => setPhotoName(e.target.files?.[0]?.name)}
                                />
                              </label>
                            </div>
                          ) : null}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </SectionCard>
            </div>

            <footer className="cal-dialog-footer">
              <button type="button" className="cal-btn-ghost" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button
                type="button"
                className="cal-btn-ghost"
                onClick={() => submit('draft')}
                disabled={saving}
              >
                Save Draft
              </button>
              <button
                type="button"
                className="cal-btn-save"
                onClick={() => submit('publish')}
                disabled={saving}
              >
                <span className="cal-btn-save-shine" aria-hidden />
                {saving ? (
                  <span className="cal-saving">
                    <span className="cal-spinner" aria-hidden />
                    Saving…
                  </span>
                ) : (
                  'Publish Report'
                )}
              </button>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
