'use client';

import { useEffect, useRef, useState, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgePercent,
  Building2,
  CalendarDays,
  CalendarRange,
  Check,
  CircleDollarSign,
  ClipboardList,
  CloudUpload,
  Coins,
  Download,
  FileSpreadsheet,
  HandCoins,
  MessageCircleQuestion,
  Percent,
  ShieldAlert,
  Syringe,
  Users,
  UserRound,
  X,
} from 'lucide-react';
import '@/components/ui/module.css';
import './onboarding.css';

type Tone =
  | 'mint'
  | 'rose'
  | 'amber'
  | 'violet'
  | 'coral'
  | 'sky'
  | 'pink'
  | 'teal'
  | 'indigo'
  | 'lime'
  | 'slate'
  | 'cyan'
  | 'orange'
  | 'blue'
  | 'red';

type UploadModule = {
  id: string;
  label: string;
  tone: Tone;
  icon: 'student' | 'staff' | 'holiday' | 'schedule' | 'enquiry' | 'calendar' | 'program' | 'fee' | 'discount' | 'room' | 'tax' | 'credit' | 'deposit' | 'allergies' | 'immunization';
  headers: string[];
  instructions: string[];
};

const MODULES: UploadModule[] = [
  {
    id: 'student',
    label: 'Student',
    tone: 'mint',
    icon: 'student',
    headers: [
      'first_name',
      'last_name',
      'date_of_birth',
      'gender',
      'room',
      'program',
      'parent_email',
      'parent_phone',
      'status',
    ],
    instructions: [
      'Download the CSV format and do not remove the header row.',
      'Use date format DD/MM/YYYY for date of birth.',
      'Parent email and phone numbers must be unique across rows.',
      'For multiple authorized pickups, repeat columns with suffixes such as pickup_1_name, pickup_1_relation, then pickup_2_name, and so on.',
    ],
  },
  {
    id: 'staff',
    label: 'Staff',
    tone: 'rose',
    icon: 'staff',
    headers: [
      'first_name',
      'last_name',
      'email',
      'phone',
      'role',
      'room',
      'joining_date',
      'status',
    ],
    instructions: [
      'Download the CSV format and do not remove the header row.',
      'Use date format DD/MM/YYYY for joining date.',
      'Email addresses must be unique for each staff member.',
      'Role should match an existing center role (Teacher, Admin, etc.).',
    ],
  },
  {
    id: 'holiday',
    label: 'Holiday',
    tone: 'amber',
    icon: 'holiday',
    headers: ['title', 'start_date', 'end_date', 'type', 'notes'],
    instructions: [
      'Download the CSV format and do not remove the header row.',
      'Use date format DD/MM/YYYY for start and end dates.',
      'Type can be Public, Center Closed, or Optional.',
      'End date should be the same as or after the start date.',
    ],
  },
  {
    id: 'schedule',
    label: 'Schedule',
    tone: 'violet',
    icon: 'schedule',
    headers: ['title', 'day', 'start_time', 'end_time', 'room', 'staff_email'],
    instructions: [
      'Download the CSV format and do not remove the header row.',
      'Use 24-hour time format HH:MM for start and end times.',
      'Day should be Monday through Sunday.',
      'Staff email must match an existing staff profile when applicable.',
    ],
  },
  {
    id: 'enquiry',
    label: 'Enquiry',
    tone: 'coral',
    icon: 'enquiry',
    headers: [
      'parent_name',
      'email',
      'phone',
      'child_name',
      'preferred_program',
      'enquiry_date',
      'source',
      'notes',
    ],
    instructions: [
      'Download the CSV format and do not remove the header row.',
      'Use date format DD/MM/YYYY for enquiry date.',
      'Email or phone should be provided for follow-up contact.',
      'Source can be Website, Walk-in, Referral, or Other.',
    ],
  },
  {
    id: 'school-calendar',
    label: 'School Calendar',
    tone: 'sky',
    icon: 'calendar',
    headers: ['event_title', 'event_date', 'end_date', 'category', 'description'],
    instructions: [
      'Download the CSV format and do not remove the header row.',
      'Use date format DD/MM/YYYY for event dates.',
      'Category can be Event, Holiday, Closure, or Activity.',
      'Keep event titles concise and unique for the same date when possible.',
    ],
  },
  {
    id: 'program',
    label: 'Program',
    tone: 'pink',
    icon: 'program',
    headers: ['program_name', 'age_from', 'age_to', 'capacity', 'fee_code', 'status'],
    instructions: [
      'Download the CSV format and do not remove the header row.',
      'Age values should be numbers in years (for example 2 or 3.5).',
      'Capacity must be a positive whole number.',
      'Fee code should match an existing fee component when used.',
    ],
  },
  {
    id: 'fee-component',
    label: 'Fee Component',
    tone: 'teal',
    icon: 'fee',
    headers: ['name', 'code', 'amount', 'frequency', 'taxable', 'status'],
    instructions: [
      'Download the CSV format and do not remove the header row.',
      'Amount should be a number without currency symbols.',
      'Frequency can be Monthly, Quarterly, Annual, or One-time.',
      'Taxable should be Yes or No.',
    ],
  },
  {
    id: 'discount',
    label: 'Discount',
    tone: 'indigo',
    icon: 'discount',
    headers: ['name', 'code', 'type', 'value', 'applies_to', 'status'],
    instructions: [
      'Download the CSV format and do not remove the header row.',
      'Type can be Percentage or Flat.',
      'Value should be a number (percent or amount).',
      'Applies_to can be All, Program, or Sibling.',
    ],
  },
  {
    id: 'room',
    label: 'Room',
    tone: 'lime',
    icon: 'room',
    headers: ['room_name', 'capacity', 'age_group', 'floor', 'status'],
    instructions: [
      'Download the CSV format and do not remove the header row.',
      'Capacity must be a positive whole number.',
      'Age group examples: Infant, 2–3 years, 3–4 years.',
      'Room names should be unique within the center.',
    ],
  },
  {
    id: 'tax',
    label: 'Tax',
    tone: 'slate',
    icon: 'tax',
    headers: ['tax_name', 'code', 'rate', 'inclusive', 'status'],
    instructions: [
      'Download the CSV format and do not remove the header row.',
      'Rate should be a percentage number (for example 18).',
      'Inclusive should be Yes or No.',
      'Tax codes must be unique.',
    ],
  },
  {
    id: 'credit',
    label: 'Credit',
    tone: 'cyan',
    icon: 'credit',
    headers: ['student_id', 'amount', 'credit_date', 'reason', 'status'],
    instructions: [
      'Download the CSV format and do not remove the header row.',
      'Use date format DD/MM/YYYY for credit date.',
      'Amount should be a positive number.',
      'Student ID must match an existing student record.',
    ],
  },
  {
    id: 'deposit',
    label: 'Deposit',
    tone: 'orange',
    icon: 'deposit',
    headers: ['student_id', 'amount', 'deposit_date', 'payment_mode', 'status'],
    instructions: [
      'Download the CSV format and do not remove the header row.',
      'Use date format DD/MM/YYYY for deposit date.',
      'Payment mode can be Cash, Card, UPI, or Bank Transfer.',
      'Student ID must match an existing student record.',
    ],
  },
  {
    id: 'student-allergies',
    label: 'Student Allergies',
    tone: 'red',
    icon: 'allergies',
    headers: ['student_id', 'allergy_name', 'severity', 'reaction', 'notes'],
    instructions: [
      'Download the CSV format and do not remove the header row.',
      'Severity can be Mild, Moderate, or Severe.',
      'Student ID must match an existing student record.',
      'List one allergy per row for the same student if needed.',
    ],
  },
  {
    id: 'student-immunization',
    label: 'Student Immunization Records',
    tone: 'blue',
    icon: 'immunization',
    headers: ['student_id', 'vaccine_name', 'dose', 'date_given', 'next_due', 'notes'],
    instructions: [
      'Download the CSV format and do not remove the header row.',
      'Use date format DD/MM/YYYY for date given and next due.',
      'Dose can be 1, 2, Booster, or Complete.',
      'Student ID must match an existing student record.',
    ],
  },
];

function ModuleIcon({ type }: { type: UploadModule['icon'] }) {
  const props = { size: 28, strokeWidth: 1.75 };
  switch (type) {
    case 'student':
      return <Users {...props} />;
    case 'staff':
      return <UserRound {...props} />;
    case 'holiday':
      return <CalendarDays {...props} />;
    case 'schedule':
      return <CalendarRange {...props} />;
    case 'enquiry':
      return <MessageCircleQuestion {...props} />;
    case 'calendar':
      return <CalendarDays {...props} />;
    case 'program':
      return <ClipboardList {...props} />;
    case 'fee':
      return <Coins {...props} />;
    case 'discount':
      return <BadgePercent {...props} />;
    case 'room':
      return <Building2 {...props} />;
    case 'tax':
      return <Percent {...props} />;
    case 'credit':
      return <CircleDollarSign {...props} />;
    case 'deposit':
      return <HandCoins {...props} />;
    case 'allergies':
      return <ShieldAlert {...props} />;
    case 'immunization':
      return <Syringe {...props} />;
    default:
      return <FileSpreadsheet {...props} />;
  }
}

function downloadCsvFormat(mod: UploadModule) {
  const csv = `${mod.headers.join(',')}\n`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${mod.id}-upload-format.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function OnboardingPage() {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const active = MODULES.find((m) => m.id === activeId) ?? null;

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setFile(null);
    setDragging(false);
  }, [activeId]);

  const acceptFile = (next: File | null | undefined) => {
    if (!next) return;
    const name = next.name.toLowerCase();
    const ok =
      name.endsWith('.csv') ||
      name.endsWith('.xlsx') ||
      name.endsWith('.xls') ||
      next.type.includes('sheet') ||
      next.type.includes('csv');
    if (!ok) {
      setToast('Please drop a CSV or Excel file.');
      return;
    }
    setFile(next);
    setToast(`“${next.name}” ready (mock — not uploaded).`);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="mod-page ob-page">
      <nav className="ob-crumbs" aria-label="Breadcrumb">
        <span>Panacea</span>
        <span className="ob-crumbsSep" aria-hidden>
          {'>>'}
        </span>
        <strong>Onboarding</strong>
      </nav>

      <div className="ob-pageTitleRow">
        <button
          type="button"
          className="ob-pageBackBtn"
          onClick={() => (activeId ? setActiveId(null) : router.back())}
          aria-label="Go back"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </button>
        <div>
          <h1 className="ob-pageTitle">Onboarding</h1>
          <p className="ob-pageDesc">
            Bulk upload students, staff, calendars, fees, and more using the Excel or CSV templates.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!active ? (
          <motion.div
            key="grid"
            className="ob-grid"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {MODULES.map((mod) => (
              <button
                key={mod.id}
                type="button"
                className="ob-tile"
                onClick={() => setActiveId(mod.id)}
              >
                <span className={`ob-tileIcon ob-tone-${mod.tone}`} aria-hidden>
                  <ModuleIcon type={mod.icon} />
                </span>
                <p className="ob-tileLabel">{mod.label}</p>
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
          >
            <div className="ob-toolbar">
              <div className="ob-backRow">
                <button
                  type="button"
                  className="ob-backBtn"
                  aria-label="Back to onboarding modules"
                  onClick={() => setActiveId(null)}
                >
                  <ArrowLeft size={18} />
                </button>
                <p className="ob-backLabel">
                  <span>Onboarding dropzone</span>
                  <span className="ob-crumbsSep" aria-hidden>
                    {'>>'}
                  </span>
                  <strong>{active.label}</strong>
                </p>
              </div>
              <button
                type="button"
                className="ui-btn ui-btn-primary ob-downloadBtn"
                onClick={() => {
                  downloadCsvFormat(active);
                  setToast('Format downloaded.');
                }}
              >
                <Download size={15} aria-hidden />
                Download Format
              </button>
            </div>

            <div className="ob-dropCard">
              <label
                className={`ob-dropzone${dragging ? ' is-drag' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <span className="ob-dropIcon" aria-hidden>
                  <CloudUpload size={32} />
                </span>
                <p className="ob-dropTitle">Drop or Browse file here to upload</p>
                <p className="ob-dropHint">Accepted: .csv, .xlsx, .xls (UI mock — no server upload)</p>
                {file ? (
                  <span className="ob-fileChip">
                    <FileSpreadsheet size={14} aria-hidden />
                    {file.name}
                    <button
                      type="button"
                      className="ob-fileClear"
                      aria-label="Remove file"
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                      }}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ) : null}
                <input
                  ref={inputRef}
                  className="ob-fileInput"
                  type="file"
                  accept=".csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                  onChange={(e) => acceptFile(e.target.files?.[0])}
                />
              </label>
            </div>

            <section className="ob-instructions" aria-label="Upload instructions">
              <h2 className="ob-instructionsTitle">Instructions to upload</h2>
              <ul className="ob-instructionsList">
                {active.instructions.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="ob-toast"
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            <Check size={15} aria-hidden />
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
