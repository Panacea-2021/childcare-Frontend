'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, Check, ChevronDown, Info, Search, X } from 'lucide-react';
import { FORM_CATEGORIES, STAFF_OPTIONS } from './mockData';
import type { FormCategory } from './types';

export type SavePublishPayload = {
  name: string;
  parentFacingName: boolean;
  categories: FormCategory[];
  disableAfter: string;
  selfInitiate: boolean;
  notifyVia: 'inapp' | 'email';
  staff: string[];
  expiryMode: 'never' | 'fixed' | 'field';
  expiryDate: string;
  remindDays: number;
  remindEnabled: boolean;
  reshareDays: number;
  reshareEnabled: boolean;
  prefillReshare: boolean;
};

type Props = {
  open: boolean;
  formName: string;
  mode?: 'save' | 'publish';
  onClose: () => void;
  onSave: (payload: SavePublishPayload) => void;
};

export function SavePublishModal({ open, formName, mode = 'publish', onClose, onSave }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(formName);
  const [parentFacing, setParentFacing] = useState(false);
  const [categories, setCategories] = useState<FormCategory[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [catQ, setCatQ] = useState('');
  const [customCats, setCustomCats] = useState<string[]>([]);
  const [disableAfter, setDisableAfter] = useState('');
  const [selfInitiate, setSelfInitiate] = useState(false);
  const [notifyVia, setNotifyVia] = useState<'inapp' | 'email'>('inapp');
  const [staff, setStaff] = useState<string[]>(['Darshan', 'Simran Jain']);
  const [staffOpen, setStaffOpen] = useState(false);
  const [staffQ, setStaffQ] = useState('');
  const [expiryMode, setExpiryMode] = useState<'never' | 'fixed' | 'field'>('never');
  const [expiryDate, setExpiryDate] = useState('');
  const [remindEnabled, setRemindEnabled] = useState(true);
  const [remindDays, setRemindDays] = useState(3);
  const [reshareEnabled, setReshareEnabled] = useState(true);
  const [reshareDays, setReshareDays] = useState(7);
  const [prefillReshare, setPrefillReshare] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setName(formName);
    setParentFacing(false);
    setCategories([]);
    setCatQ('');
    setCatOpen(false);
    setDisableAfter('');
    setSelfInitiate(false);
    setStaffOpen(false);
    setExpiryMode('never');
    setExpiryDate('');
  }, [open, formName]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const catOptions = useMemo(() => {
    const base = FORM_CATEGORIES.filter((c) => c !== 'All Categories') as FormCategory[];
    const extras = customCats.filter((c) => !base.includes(c as FormCategory));
    return [...base, ...extras] as FormCategory[];
  }, [customCats]);

  const filteredCats = catOptions.filter((c) => c.toLowerCase().includes(catQ.toLowerCase()));
  const filteredStaff = STAFF_OPTIONS.filter((s) => s.toLowerCase().includes(staffQ.toLowerCase()));

  const canSave = useMemo(() => {
    if (expiryMode === 'fixed' && !expiryDate) return false;
    if (expiryMode === 'field') return false;
    return Boolean(name.trim());
  }, [expiryMode, expiryDate, name]);

  if (!open) return null;

  const title =
    mode === 'publish'
      ? `Publish ${name.trim() || formName || 'New Form'}`
      : `Save ${name.trim() || formName || 'New Form'}`;

  const toggleCat = (c: FormCategory) => {
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const addCustomCategory = () => {
    const value = catQ.trim();
    if (!value) return;
    const exists = catOptions.some((c) => c.toLowerCase() === value.toLowerCase());
    if (!exists) setCustomCats((prev) => [...prev, value]);
    const asCat = value as FormCategory;
    setCategories((prev) => (prev.includes(asCat) ? prev : [...prev, asCat]));
    setCatQ('');
  };

  const toggleStaff = (s: string) => {
    setStaff((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const submit = () => {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      parentFacingName: parentFacing,
      categories,
      disableAfter,
      selfInitiate,
      notifyVia,
      staff,
      expiryMode,
      expiryDate,
      remindDays,
      remindEnabled,
      reshareDays,
      reshareEnabled,
      prefillReshare,
    });
  };

  return (
    <div className="spm-backdrop" role="presentation" onClick={onClose}>
      <div
        className="spm-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="spm-header">
          <div className="spm-header-left">
            <h2>{title}</h2>
          </div>
          <div className="spm-header-right">
            <button type="button" className="spm-x" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
            <span className="spm-step">Step {step} of 2</span>
          </div>
        </div>

        <div className="spm-body">
          {step === 1 ? (
            <>
              <section className="spm-section">
                <h3>Form details</h3>
                <div className="spm-field">
                  <div className="spm-label-row">
                    <label htmlFor="spm-name">Form Name</label>
                    <label className="spm-mini-toggle">
                      Set parent-facing name
                      <button
                        type="button"
                        role="switch"
                        aria-checked={parentFacing}
                        className={`fps-switch ${parentFacing ? 'is-on' : ''}`}
                        onClick={() => setParentFacing((v) => !v)}
                      >
                        <i />
                      </button>
                    </label>
                  </div>
                  <input id="spm-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="spm-field">
                  <label>Category</label>
                  <div className="spm-multi">
                    <button
                      type="button"
                      className="spm-multi-trigger"
                      onClick={() => setCatOpen((v) => !v)}
                    >
                      <span className="spm-chips">
                        {categories.length === 0 ? (
                          <em>Select or type to add a custom category</em>
                        ) : (
                          categories.map((c) => (
                            <span key={c} className="spm-chip">
                              {c}
                              <button
                                type="button"
                                aria-label={`Remove ${c}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCat(c);
                                }}
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </span>
                      <ChevronDown size={16} />
                    </button>
                    {catOpen ? (
                      <div className="spm-multi-panel">
                        <input
                          placeholder="Select or type to add a custom category"
                          value={catQ}
                          onChange={(e) => setCatQ(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCustomCategory();
                            }
                          }}
                          autoFocus
                        />
                        <ul>
                          {filteredCats.map((c) => (
                            <li key={c}>
                              <button
                                type="button"
                                className={categories.includes(c) ? 'is-active' : undefined}
                                onClick={() => toggleCat(c)}
                              >
                                {c}
                                {categories.includes(c) ? <Check size={14} /> : null}
                              </button>
                            </li>
                          ))}
                          {catQ.trim() &&
                          !catOptions.some((c) => c.toLowerCase() === catQ.trim().toLowerCase()) ? (
                            <li>
                              <button type="button" onClick={addCustomCategory}>
                                Add &ldquo;{catQ.trim()}&rdquo;
                              </button>
                            </li>
                          ) : null}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="spm-section">
                <h3>Publishing</h3>
                <div className="spm-field">
                  <label htmlFor="spm-disable">Disable responses after</label>
                  <div className="spm-date">
                    <input
                      id="spm-disable"
                      type="date"
                      value={disableAfter}
                      onChange={(e) => setDisableAfter(e.target.value)}
                      placeholder="Select date"
                    />
                    {!disableAfter ? <span className="spm-date-ph">Select date</span> : null}
                    <Calendar size={14} aria-hidden />
                  </div>
                </div>
                <label className="spm-check">
                  <input
                    type="checkbox"
                    checked={selfInitiate}
                    onChange={(e) => setSelfInitiate(e.target.checked)}
                  />
                  Allow users to self-initiate this form
                </label>
              </section>
            </>
          ) : (
            <>
              <section className="spm-section">
                <h3>Notifications</h3>
                <p className="spm-q">Notify staff members via</p>
                <div className="spm-radios">
                  <label>
                    <input
                      type="radio"
                      checked={notifyVia === 'inapp'}
                      onChange={() => setNotifyVia('inapp')}
                    />
                    In-App Only
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={notifyVia === 'email'}
                      onChange={() => setNotifyVia('email')}
                    />
                    Email &amp; In-App
                  </label>
                </div>
                <div className="spm-field">
                  <label>Select staff to be notified</label>
                  <div className="spm-multi">
                    <button
                      type="button"
                      className="spm-multi-trigger"
                      onClick={() => setStaffOpen((v) => !v)}
                    >
                      <span className="spm-chips">
                        {staff.length === 0 ? (
                          <em>Select staff</em>
                        ) : (
                          staff.map((s) => (
                            <span key={s} className="spm-chip">
                              {s}
                              <button
                                type="button"
                                aria-label={`Remove ${s}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStaff(s);
                                }}
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </span>
                      <Search size={14} />
                    </button>
                    {staffOpen ? (
                      <div className="spm-multi-panel">
                        <input
                          placeholder="Search staff"
                          value={staffQ}
                          onChange={(e) => setStaffQ(e.target.value)}
                          autoFocus
                        />
                        <ul>
                          {filteredStaff.map((s) => (
                            <li key={s}>
                              <button
                                type="button"
                                className={staff.includes(s) ? 'is-active' : undefined}
                                onClick={() => toggleStaff(s)}
                              >
                                {s}
                                {staff.includes(s) ? <Check size={14} /> : null}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="spm-section">
                <h3>Upon submission</h3>
                <div className="spm-field">
                  <label>When does a submission expire?</label>
                  <select
                    value={expiryMode}
                    onChange={(e) => setExpiryMode(e.target.value as typeof expiryMode)}
                  >
                    <option value="never">Never expires</option>
                    <option value="fixed">On a fixed date</option>
                    <option value="field">From a date field in the form</option>
                  </select>
                  <p className="spm-hint">
                    <Info size={13} />
                    {expiryMode === 'never'
                      ? 'Submissions stay valid indefinitely — no reminders or renewals.'
                      : expiryMode === 'fixed'
                        ? 'Every submission expires on the same calendar date, no matter when it was submitted.'
                        : 'Expiry follows a date the respondent fills in — e.g. a passport or insurance expiry date entered on the form.'}
                  </p>
                </div>

                {expiryMode === 'fixed' ? (
                  <div className="spm-field">
                    <label htmlFor="spm-expiry">Expiry Date</label>
                    <div className="spm-date">
                      <input
                        id="spm-expiry"
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                      />
                      <Calendar size={14} />
                    </div>
                    <p className="spm-warn">
                      Responses will be accepted until this date. If you need to close submissions earlier, set a
                      response disable date in Step 1.
                    </p>
                  </div>
                ) : null}

                {expiryMode === 'field' ? (
                  <p className="spm-warn">Add a mandatory date field to the form to use this option</p>
                ) : null}

                {expiryMode !== 'never' ? (
                  <div className="spm-checks">
                    <label className="spm-check">
                      <input
                        type="checkbox"
                        checked={remindEnabled}
                        onChange={(e) => setRemindEnabled(e.target.checked)}
                      />
                      Remind family &amp; staff
                      <input
                        className="spm-num"
                        type="number"
                        min={1}
                        value={remindDays}
                        onChange={(e) => setRemindDays(Number(e.target.value) || 1)}
                      />
                      day(s) before expiry
                    </label>
                    <label className="spm-check">
                      <input
                        type="checkbox"
                        checked={reshareEnabled}
                        onChange={(e) => setReshareEnabled(e.target.checked)}
                      />
                      Auto-reshare a fresh form
                      <input
                        className="spm-num"
                        type="number"
                        min={1}
                        value={reshareDays}
                        onChange={(e) => setReshareDays(Number(e.target.value) || 1)}
                      />
                      day(s) before expiry
                    </label>
                    <label className="spm-check">
                      <input
                        type="checkbox"
                        checked={prefillReshare}
                        onChange={(e) => setPrefillReshare(e.target.checked)}
                      />
                      Pre-fill the reshared form with their last response
                    </label>
                  </div>
                ) : null}
              </section>
            </>
          )}
        </div>

        <div className="spm-footer">
          <button type="button" className="spm-btn ghost" onClick={onClose}>
            Cancel
          </button>
          <div className="spm-footer-right">
            {step === 2 ? (
              <button type="button" className="spm-btn ghost" onClick={() => setStep(1)}>
                Back
              </button>
            ) : null}
            {step === 1 ? (
              <button type="button" className="spm-btn primary" onClick={() => setStep(2)}>
                Next
              </button>
            ) : (
              <button type="button" className="spm-btn primary" disabled={!canSave} onClick={submit}>
                {mode === 'publish' ? 'Publish' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
