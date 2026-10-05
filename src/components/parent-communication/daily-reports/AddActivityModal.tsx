'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock3, Layers, Sparkles, Tag, X } from 'lucide-react';
import { PremiumSelect } from '@/components/modules/calendar/PremiumSelect';
import { PremiumTimeField } from '@/components/modules/calendar/PremiumTimeField';
import { ADDABLE_CHECKLIST_PRESETS } from '@/lib/mock/mockDailyReports';
import type { ChecklistItemDef, RoomDailyReport } from '@/types/dailyReport';
import { slugify } from './utils';

type Props = {
  open: boolean;
  report: RoomDailyReport | null;
  onClose: () => void;
  onAdd: (payload: {
    reportId: string;
    item: ChecklistItemDef;
    time?: string;
    remarks?: string;
  }) => void;
};

export function AddActivityModal({ open, report, onClose, onAdd }: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [preset, setPreset] = useState('');
  const [customName, setCustomName] = useState('');
  const [time, setTime] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setPreset('');
    setCustomName('');
    setTime('');
    setRemarks('');
    setError('');
  }, [open]);

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

  const submit = () => {
    if (!report) return;
    const name = (customName.trim() || preset).trim();
    if (!name) {
      setError('Choose or enter an activity name');
      return;
    }
    const id = `cl-room-${report.id}-${slugify(name)}-${Date.now()}`;
    const item: ChecklistItemDef = {
      id,
      name,
      enabled: true,
      order: 100 + report.extraItems.length,
      isSystem: false,
      key: slugify(name) || id,
    };
    onAdd({ reportId: report.id, item, time: time || undefined, remarks: remarks || undefined });
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && report ? (
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
            initial={{ opacity: 0, x: 48, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cal-dialog-header">
              <div className="cal-dialog-title-block">
                <span className="cal-dialog-emoji" aria-hidden>
                  ✨
                </span>
                <div>
                  <h2 id={titleId}>Add Activity</h2>
                  <p>
                    Add a checklist activity for <strong>{report.room}</strong> today only
                  </p>
                </div>
              </div>
              <button type="button" className="cal-dialog-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="cal-dialog-body">
              <motion.section
                className="cal-form-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <header className="cal-form-section-head">
                  <span className="cal-form-section-ico" aria-hidden>
                    <Sparkles size={15} />
                  </span>
                  <h3>Activity Details</h3>
                </header>
                <div className="cal-form-section-body">
                  <div className="cal-modal-grid">
                    <PremiumSelect
                      id="dr-activity-preset"
                      className="cal-span-2"
                      placeholder="Choose activity"
                      icon={<Layers size={16} />}
                      value={preset}
                      onChange={(v) => {
                        setPreset(v);
                        if (v) setCustomName('');
                      }}
                      options={ADDABLE_CHECKLIST_PRESETS.map((p) => ({ value: p, label: p }))}
                    />

                    <div className="cal-float-field cal-span-2">
                      <div className="cal-float-shell">
                        <span className="cal-float-icon" aria-hidden>
                          <Tag size={16} />
                        </span>
                        <div className="cal-float-control">
                          <input
                            id="dr-custom-activity"
                            className={`cal-float-input ${customName ? 'has-value' : ''}`}
                            placeholder=" "
                            value={customName}
                            onChange={(e) => {
                              setCustomName(e.target.value);
                              if (e.target.value) setPreset('');
                            }}
                          />
                          <label htmlFor="dr-custom-activity" className="cal-float-label">
                            Or type a custom activity
                          </label>
                        </div>
                      </div>
                      {error ? <p className="cal-field-error">{error}</p> : null}
                    </div>

                    <PremiumTimeField
                      id="dr-activity-time"
                      placeholder="Activity time"
                      value={time}
                      onChange={setTime}
                    />

                    <div className="cal-float-field">
                      <div className="cal-float-shell">
                        <span className="cal-float-icon" aria-hidden>
                          <Clock3 size={16} />
                        </span>
                        <div className="cal-float-control">
                          <input
                            id="dr-activity-room"
                            className="cal-float-input has-value"
                            placeholder=" "
                            value={report.room}
                            readOnly
                          />
                          <label htmlFor="dr-activity-room" className="cal-float-label">
                            Room
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="cal-float-field cal-span-2">
                      <div className="cal-float-shell">
                        <span className="cal-float-icon" aria-hidden>
                          <Tag size={16} />
                        </span>
                        <div className="cal-float-control">
                          <textarea
                            id="dr-activity-notes"
                            className={`cal-float-input cal-float-textarea ${remarks ? 'has-value' : ''}`}
                            rows={3}
                            placeholder=" "
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                          />
                          <label htmlFor="dr-activity-notes" className="cal-float-label">
                            Remarks (optional)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            </div>

            <footer className="cal-dialog-footer">
              <button type="button" className="cal-btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="cal-btn-save" onClick={submit}>
                <span className="cal-btn-save-shine" aria-hidden />
                Add to Checklist
              </button>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
