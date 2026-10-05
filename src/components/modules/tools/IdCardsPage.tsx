'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Download, IdCard } from 'lucide-react';
import { CenterManagementPageHeader } from '@/components/modules/center-management/CenterManagementPageHeader';
import { IdCardPreview } from './IdCardPreview';
import { IdCardStudentStep } from './IdCardStudentStep';
import {
  ID_CARD_TEMPLATES,
  MOCK_PICKUPS,
  MOCK_STAFF,
  MOCK_STUDENTS,
  type IdCardAudience,
  type MockStudent,
} from './toolsData';
import '../center-management/students.css';
import './tools.css';

function stepsFor(audience: IdCardAudience) {
  const selectLabel =
    audience === 'Staff'
      ? 'Select Staff'
      : audience === 'Authorized Pickup'
        ? 'Select Pickup'
        : 'Select Student';
  return ['Select Template', 'Customize Template', selectLabel, 'Download'] as const;
}

function peopleFor(audience: IdCardAudience): MockStudent[] {
  if (audience === 'Staff') return MOCK_STAFF;
  if (audience === 'Authorized Pickup') return MOCK_PICKUPS;
  return MOCK_STUDENTS;
}

const FIELD_OPTIONS = [
  { id: 'admission', label: 'Admission No.' },
  { id: 'blood', label: 'Blood Group' },
  { id: 'dob', label: 'Date of Birth' },
  { id: 'motherPhone', label: "Mother's No." },
  { id: 'fatherPhone', label: "Father's No." },
  { id: 'emergency', label: 'Emergency No.' },
  { id: 'admissionDate', label: 'Admission Date' },
  { id: 'allergies', label: 'Allergies' },
] as const;

const BACK_FIELD_OPTIONS = [
  { id: 'motherName', label: "Mother's Name" },
  { id: 'motherPhone', label: "Mother's Phone No." },
  { id: 'fatherName', label: "Father's Name" },
  { id: 'fatherPhone', label: "Father's Phone No." },
  { id: 'schoolAddress', label: 'School Address' },
  { id: 'schoolPhone', label: 'School Phone' },
  { id: 'schoolEmail', label: 'School Email' },
  { id: 'website', label: 'Website' },
] as const;

export type DisplayFieldId = (typeof FIELD_OPTIONS)[number]['id'];
export type BackFieldId = (typeof BACK_FIELD_OPTIONS)[number]['id'];

export function IdCardsPage() {
  const [step, setStep] = useState(0);
  const [audience, setAudience] = useState<IdCardAudience>('Student');
  const [templateId, setTemplateId] = useState(ID_CARD_TEMPLATES[0].id);
  const [schoolName, setSchoolName] = useState('Panacea | Childcare');
  const [showQr, setShowQr] = useState(true);
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');
  const [displayFields, setDisplayFields] = useState<DisplayFieldId[]>(['admission', 'blood', 'dob']);
  const [backFields, setBackFields] = useState<BackFieldId[]>([
    'motherName',
    'motherPhone',
    'fatherName',
    'fatherPhone',
    'schoolAddress',
    'schoolPhone',
    'schoolEmail',
  ]);
  const [nameFontSize, setNameFontSize] = useState(44);
  const [typeFontSize, setTypeFontSize] = useState(36);
  const [textColor, setTextColor] = useState('#000000');
  const [bodyFontSize, setBodyFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Poppins');
  const [backTextColor, setBackTextColor] = useState('#000000');
  const [backFontSize, setBackFontSize] = useState(32);
  const [backFontFamily, setBackFontFamily] = useState('Poppins');
  const [schoolAddress, setSchoolAddress] = useState('12 Park Lane, Childcare Campus');
  const [schoolPhone, setSchoolPhone] = useState('+91 80 4000 1200');
  const [schoolEmail, setSchoolEmail] = useState('hello@panacea.care');
  const [showParentPhotos, setShowParentPhotos] = useState(true);
  const [showBackQr, setShowBackQr] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const visibleTemplates = useMemo(
    () => ID_CARD_TEMPLATES.filter((t) => t.audiences.includes(audience)),
    [audience],
  );

  const template =
    visibleTemplates.find((t) => t.id === templateId) ??
    visibleTemplates[0] ??
    ID_CARD_TEMPLATES[0];

  const people = peopleFor(audience);
  const steps = stepsFor(audience);
  const selectedPeople = people.filter((s) => selectedIds.includes(s.id));
  const previewStudent =
    selectedPeople[0] ?? people[0] ?? MOCK_STUDENTS[0];

  const personRoleLabel = (person?: MockStudent) => {
    if (audience === 'Staff') return person?.group ?? template.sampleRole;
    if (audience === 'Authorized Pickup') return 'PICKUP';
    return 'STUDENT';
  };

  const roleLabel = personRoleLabel(previewStudent);

  const fieldLabel = (id: DisplayFieldId, fallback: string) => {
    if (audience === 'Staff') {
      if (id === 'admission') return 'Staff ID';
      if (id === 'admissionDate') return 'Join Date';
      if (id === 'motherPhone') return 'Phone No.';
      if (id === 'fatherPhone') return 'Alt Phone';
    }
    if (audience === 'Authorized Pickup' && id === 'admission') return 'Pickup ID';
    return fallback;
  };

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  };

  const onAudienceChange = (next: IdCardAudience) => {
    setAudience(next);
    setSelectedIds([]);
    const first = ID_CARD_TEMPLATES.find((t) => t.audiences.includes(next));
    if (first) setTemplateId(first.id);
  };

  const pickTemplate = (id: string) => {
    setTemplateId(id);
    setStep(1);
    setCardSide('front');
  };

  const toggleField = (id: DisplayFieldId) => {
    setDisplayFields((prev) => {
      if (prev.includes(id)) return prev.filter((f) => f !== id);
      if (prev.length >= 3) {
        flash('You can select up to 3 fields');
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleBackField = (id: BackFieldId) => {
    setBackFields((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const canNext =
    step === 0
      ? Boolean(template?.id)
      : step === 1
        ? displayFields.length > 0
        : step === 2
          ? selectedIds.length > 0
          : true;

  const goNext = () => {
    if (!canNext) return;
    if (step < steps.length - 1) setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAllVisible = (visibleIds: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = visibleIds.length > 0 && visibleIds.every((id) => prev.includes(id));
      if (allSelected) return prev.filter((id) => !visibleIds.includes(id));
      const next = new Set(prev);
      visibleIds.forEach((id) => next.add(id));
      return Array.from(next);
    });
  };

  return (
    <div className="cm-page cm-page--tools tools-page">
      <CenterManagementPageHeader
        title="ID Cards"
        description="Create printable student or staff ID cards in four guided steps."
        icon={<IdCard size={22} strokeWidth={2.1} />}
      />

      <motion.section
        className="cm-panel tools-panel"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <ol className="tools-stepper" aria-label="ID card steps">
          {steps.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={label} className={`${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`}>
                <button
                  type="button"
                  onClick={() => {
                    if (i <= step) setStep(i);
                  }}
                >
                  <span className="tools-step-num">{done ? <Check size={14} /> : i + 1}</span>
                  <span className="tools-step-label">{label}</span>
                </button>
                {i < steps.length - 1 ? <ChevronRight className="tools-step-sep" size={16} /> : null}
              </li>
            );
          })}
        </ol>

        {step === 0 ? (
          <section className="tools-section">
            <label className="tools-inline-field">
              Show ID Cards for
              <select
                value={audience}
                onChange={(e) => onAudienceChange(e.target.value as IdCardAudience)}
              >
                <option value="Student">Student</option>
                <option value="Staff">Staff</option>
                <option value="Authorized Pickup">Authorized Pickup</option>
              </select>
            </label>
            <div className="idc-template-grid">
              {visibleTemplates.map((tpl) => (
                <IdCardPreview
                  key={tpl.id}
                  template={tpl}
                  roleLabel={
                    audience === 'Staff'
                      ? tpl.sampleRole
                      : audience === 'Authorized Pickup'
                        ? 'PICKUP'
                        : 'STUDENT'
                  }
                  schoolName={schoolName}
                  selected={template.id === tpl.id}
                  onSelect={() => pickTemplate(tpl.id)}
                />
              ))}
              <div className="idc-custom-card">
                <span className="idc-custom-plus" aria-hidden>
                  +
                </span>
                <strong>Add Custom Design</strong>
                <p className="idc-premium">
                  Premium feature · Talk to sales for custom branding from <b>$99</b>
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="tools-section idc-customize-step">
            <div className="idc-customize-head">
              <h2>Customize ID Card</h2>
              <div className="idc-customize-nav">
                <button type="button" className="tools-btn ghost sm" onClick={goBack}>
                  <ChevronLeft size={15} />
                  Previous
                </button>
                <button type="button" className="tools-btn primary sm" disabled={!canNext} onClick={goNext}>
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <div className="idc-customize-layout">
              <div className="idc-customize-panel">
                <div className="idc-side-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={cardSide === 'front'}
                    className={cardSide === 'front' ? 'is-active' : undefined}
                    onClick={() => setCardSide('front')}
                  >
                    Front Card
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={cardSide === 'back'}
                    className={cardSide === 'back' ? 'is-active' : undefined}
                    onClick={() => setCardSide('back')}
                  >
                    Back Card
                  </button>
                </div>

                {cardSide === 'front' ? (
                  <>
                    <p className="idc-field-title">Select fields to display (max 3)</p>
                    <div className="idc-field-grid">
                      {FIELD_OPTIONS.map((f) => (
                        <label key={f.id} className="idc-field-check">
                          <input
                            type="checkbox"
                            checked={displayFields.includes(f.id)}
                            onChange={() => toggleField(f.id)}
                          />
                          {fieldLabel(f.id, f.label)}
                        </label>
                      ))}
                    </div>

                    <div className="idc-style-grid">
                      <div className="tools-field">
                        <label htmlFor="idc-name-size">Name Font Size</label>
                        <input
                          id="idc-name-size"
                          type="number"
                          min={24}
                          max={72}
                          value={nameFontSize}
                          onChange={(e) => setNameFontSize(Number(e.target.value) || 44)}
                        />
                      </div>
                      <div className="tools-field">
                        <label htmlFor="idc-type-size">Type Font Size</label>
                        <input
                          id="idc-type-size"
                          type="number"
                          min={18}
                          max={56}
                          value={typeFontSize}
                          onChange={(e) => setTypeFontSize(Number(e.target.value) || 36)}
                        />
                      </div>
                    </div>

                    <div className="idc-style-grid three">
                      <div className="tools-field">
                        <label htmlFor="idc-color">Text Color</label>
                        <input
                          id="idc-color"
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                        />
                      </div>
                      <div className="tools-field">
                        <label htmlFor="idc-body-size">Font Size</label>
                        <input
                          id="idc-body-size"
                          type="number"
                          min={18}
                          max={48}
                          value={bodyFontSize}
                          onChange={(e) => setBodyFontSize(Number(e.target.value) || 32)}
                        />
                      </div>
                      <div className="tools-field">
                        <label htmlFor="idc-font">Font Family</label>
                        <select
                          id="idc-font"
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                        >
                          <option value="Poppins">Poppins</option>
                        </select>
                      </div>
                    </div>

                    <div className="tools-field">
                      <label htmlFor="idc-school">School / Center name</label>
                      <input
                        id="idc-school"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                      />
                    </div>

                    <label className="tools-check">
                      <input
                        type="checkbox"
                        checked={showQr}
                        onChange={(e) => setShowQr(e.target.checked)}
                      />
                      Show QR code
                    </label>
                  </>
                ) : (
                  <>
                    <p className="idc-field-title">Select fields to display on back</p>
                    <div className="idc-field-grid">
                      {BACK_FIELD_OPTIONS.map((f) => (
                        <label key={f.id} className="idc-field-check">
                          <input
                            type="checkbox"
                            checked={backFields.includes(f.id)}
                            onChange={() => toggleBackField(f.id)}
                          />
                          {f.label}
                        </label>
                      ))}
                    </div>

                    <p className="idc-field-title">Text</p>
                    <div className="idc-style-grid three">
                      <div className="tools-field">
                        <label htmlFor="idc-back-color">Text color</label>
                        <input
                          id="idc-back-color"
                          type="color"
                          value={backTextColor}
                          onChange={(e) => setBackTextColor(e.target.value)}
                        />
                      </div>
                      <div className="tools-field">
                        <label htmlFor="idc-back-size">Font size</label>
                        <input
                          id="idc-back-size"
                          type="number"
                          min={18}
                          max={48}
                          value={backFontSize}
                          onChange={(e) => setBackFontSize(Number(e.target.value) || 32)}
                        />
                      </div>
                      <div className="tools-field">
                        <label htmlFor="idc-back-font">Font Family</label>
                        <select
                          id="idc-back-font"
                          value={backFontFamily}
                          onChange={(e) => setBackFontFamily(e.target.value)}
                        >
                          <option value="Poppins">Poppins</option>
                        </select>
                      </div>
                    </div>

                    <div className="tools-field">
                      <label htmlFor="idc-address">School Address</label>
                      <input
                        id="idc-address"
                        value={schoolAddress}
                        onChange={(e) => setSchoolAddress(e.target.value)}
                      />
                    </div>
                    <div className="idc-style-grid">
                      <div className="tools-field">
                        <label htmlFor="idc-school-phone">School Phone</label>
                        <input
                          id="idc-school-phone"
                          value={schoolPhone}
                          onChange={(e) => setSchoolPhone(e.target.value)}
                        />
                      </div>
                      <div className="tools-field">
                        <label htmlFor="idc-school-email">School Email</label>
                        <input
                          id="idc-school-email"
                          value={schoolEmail}
                          onChange={(e) => setSchoolEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <label className="tools-check">
                      <input
                        type="checkbox"
                        checked={showParentPhotos}
                        onChange={(e) => setShowParentPhotos(e.target.checked)}
                      />
                      Show parent photos
                    </label>
                    <label className="tools-check">
                      <input
                        type="checkbox"
                        checked={showBackQr}
                        onChange={(e) => setShowBackQr(e.target.checked)}
                      />
                      Show QR / attendance code on back
                    </label>
                  </>
                )}
              </div>

              <button
                type="button"
                className="idc-live-preview"
                onClick={goNext}
                title="Click preview to continue to Select Student"
              >
                <span className="idc-live-label">Live preview · click to continue</span>
                <IdCardPreview
                  template={template}
                  student={previewStudent}
                  schoolName={schoolName}
                  roleLabel={roleLabel}
                  showBlood={displayFields.includes('blood')}
                  showQr={cardSide === 'front' ? showQr : showBackQr}
                  displayFields={displayFields}
                  backFields={backFields}
                  nameFontSize={nameFontSize}
                  typeFontSize={typeFontSize}
                  textColor={textColor}
                  bodyFontSize={bodyFontSize}
                  fontFamily={fontFamily}
                  backTextColor={backTextColor}
                  backFontSize={backFontSize}
                  backFontFamily={backFontFamily}
                  schoolAddress={schoolAddress}
                  schoolPhone={schoolPhone}
                  schoolEmail={schoolEmail}
                  showParentPhotos={showParentPhotos}
                  previewSide={cardSide}
                />
              </button>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <IdCardStudentStep
            key={audience}
            audience={audience}
            people={people}
            selectedIds={selectedIds}
            onToggle={toggleStudent}
            onToggleAllVisible={toggleAllVisible}
            onPrevious={goBack}
            onNext={goNext}
            canNext={selectedIds.length > 0}
          />
        ) : null}

        {step === 3 ? (
          <section className="tools-section">
            <div className="idc-download-grid">
              {(selectedPeople.length ? selectedPeople : [people[0]]).map((s) => (
                <IdCardPreview
                  key={s.id}
                  template={template}
                  student={s}
                  schoolName={schoolName}
                  roleLabel={personRoleLabel(s)}
                  showBlood={displayFields.includes('blood')}
                  showQr={showQr || showBackQr}
                  displayFields={displayFields}
                  backFields={backFields}
                  nameFontSize={nameFontSize}
                  typeFontSize={typeFontSize}
                  textColor={textColor}
                  bodyFontSize={bodyFontSize}
                  fontFamily={fontFamily}
                  backTextColor={backTextColor}
                  backFontSize={backFontSize}
                  backFontFamily={backFontFamily}
                  schoolAddress={schoolAddress}
                  schoolPhone={schoolPhone}
                  schoolEmail={schoolEmail}
                  showParentPhotos={showParentPhotos}
                  compact
                />
              ))}
            </div>
            <div className="tools-download-actions">
              <button
                type="button"
                className="tools-btn primary"
                onClick={() => flash(`Downloading ${selectedIds.length || 1} ID card(s)…`)}
              >
                <Download size={16} />
                Download PDF
              </button>
              <button
                type="button"
                className="tools-btn ghost"
                onClick={() => flash('Print dialog opened')}
              >
                Print
              </button>
            </div>
          </section>
        ) : null}

        {step === 0 || step === 3 ? (
          <footer className="tools-footer">
            <button type="button" className="tools-btn ghost" disabled={step === 0} onClick={goBack}>
              Back
            </button>
            {step < steps.length - 1 ? (
              <button type="button" className="tools-btn primary" disabled={!canNext} onClick={goNext}>
                Continue
              </button>
            ) : (
              <button type="button" className="tools-btn primary" onClick={() => flash('ID cards ready')}>
                Done
              </button>
            )}
          </footer>
        ) : null}
      </motion.section>

      {toast ? (
        <div className="tools-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
