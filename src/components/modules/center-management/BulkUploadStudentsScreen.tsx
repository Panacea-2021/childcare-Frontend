'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Download,
  FileSpreadsheet,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  School,
  Shield,
  Trash2,
  UploadCloud,
  UserRound,
  Users,
} from 'lucide-react';
import type { Gender, StudentStatus } from '@/lib/center-management/types';
import {
  createStudent,
  loadStudents,
  saveStudents,
  ROOM_OPTIONS,
} from '@/lib/center-management/studentsStore';
import { defaultCenterIdForNewRecord } from '@/lib/organization/migrateCenterIds';
import './students.css';
import './student-bulk-upload.css';

type RowStatus = 'Valid' | 'Warning' | 'Error';

type ParsedRow = {
  id: string;
  rowNum: number;
  name: string;
  gender: string;
  status: string;
  room: string;
  admissionNumber: string;
  dob: string;
  admissionDate: string;
  registrationDate: string;
  bloodGroup: string;
  medication: string;
  address: string;
  fatherName: string;
  fatherEmail: string;
  fatherPhone: string;
  motherName: string;
  motherEmail: string;
  motherPhone: string;
  allergy1: string;
  allergy2: string;
  emergency1: string;
  emergency2: string;
  pickup1: string;
  pickup2: string;
  ok: boolean;
  rowStatus: RowStatus;
  warnings: string[];
  message?: string;
};

const GENDERS: Gender[] = ['Male', 'Female', 'Prefer not to say'];
const STATUSES: StudentStatus[] = [
  'Active',
  'Inactive',
  'On Hold',
  'Withdrawn',
  'Signed up',
  'Transferred',
  'Graduated',
];

/** Matches docs/student.csv column headers (55 fields). */
const STUDENT_TEMPLATE_HEADER =
  'classroom,studentName,gender,birthDate(DD/MM/YY),admissionDate(DD/MM/YY)(Optional),registrationDate(DD/MM/YY)(Optional),bloodGroup(Optional),medication(Optional),fatherName,fatherEmail,fatherCountryCode,fatherNumber,motherName,motherEmail,motherCountryCode,motherNumber,address,allergy 1 allergy name,allergy 1 allergy category,allergy 1 severity,allergy 1 symptoms(optional),allergy 1 notes(optional),allergy 1 treatment plan(optional),allergy 2 allergy name,allergy 2 allergy category,allergy 2 severity,allergy 2 symptoms(optional),allergy 2 notes(optional),allergy 2 treatment plan(optional),emergency contact 1 name,emergency contact 1 relation,emergency contact 1 country code,emergency contact 1 phone number,emergency contact 1 email (optional),emergency contact 1 address (optional),emergency contact 1 primary (optional),emergency contact 2 name,emergency contact 2 relation,emergency contact 2 country code,emergency contact 2 phone number,emergency contact 2 email (optional),emergency contact 2 address (optional),emergency contact 2 primary (optional),authorized pickup 1 name,authorized pickup 1 relation,authorized pickup 1 country code (optional),authorized pickup 1 phone number (optional),authorized pickup 1 email (optional),authorized pickup 1 address (optional),authorized pickup 2 name,authorized pickup 2 relation,authorized pickup 2 country code (optional),authorized pickup 2 phone number (optional),authorized pickup 2 email (optional),authorized pickup 2 address (optional)';

const SAMPLE: ParsedRow[] = [
  {
    id: 'r1',
    rowNum: 1,
    name: 'Kavya Sharma',
    gender: 'Female',
    status: 'Active',
    room: 'Nursery A',
    admissionNumber: 'ADM-003',
    dob: '12/03/21',
    admissionDate: '01/06/24',
    registrationDate: '20/05/24',
    bloodGroup: 'B+',
    medication: 'None',
    address: '12 Lake View, Hyderabad',
    fatherName: 'Rohit Sharma',
    fatherEmail: 'rohit.sharma@email.com',
    fatherPhone: '+91 98765 43210',
    motherName: 'Ananya Sharma',
    motherEmail: 'ananya.sharma@email.com',
    motherPhone: '+91 98765 43211',
    allergy1: 'Peanuts · Severe',
    allergy2: '',
    emergency1: 'Priya Rao · Aunt',
    emergency2: 'Vikram Rao · Uncle',
    pickup1: 'Priya Rao · Aunt',
    pickup2: '',
    ok: true,
    rowStatus: 'Valid',
    warnings: [],
  },
  {
    id: 'r2',
    rowNum: 2,
    name: 'Arjun Mehta',
    gender: 'Male',
    status: 'Signed up',
    room: 'Sunshine Room',
    admissionNumber: 'ADM-104',
    dob: '08/11/20',
    admissionDate: '15/07/24',
    registrationDate: '10/07/24',
    bloodGroup: '',
    medication: '',
    address: '88 Green Park, Bangalore',
    fatherName: 'Nikhil Mehta',
    fatherEmail: 'nikhil.mehta@email.com',
    fatherPhone: '+91 99887 76655',
    motherName: 'Sneha Mehta',
    motherEmail: 'sneha.mehta@email.com',
    motherPhone: '+91 99887 76656',
    allergy1: '',
    allergy2: '',
    emergency1: 'Karan Mehta · Brother',
    emergency2: '',
    pickup1: 'Sneha Mehta · Mother',
    pickup2: 'Nikhil Mehta · Father',
    ok: true,
    rowStatus: 'Warning',
    warnings: ['Missing Blood Group', 'Medication Empty'],
  },
  {
    id: 'r3',
    rowNum: 3,
    name: 'Missing Name',
    gender: 'Female',
    status: 'Active',
    room: '',
    admissionNumber: '',
    dob: '99/99/99',
    admissionDate: '',
    registrationDate: '',
    bloodGroup: 'O+',
    medication: '',
    address: '',
    fatherName: '',
    fatherEmail: 'bad-email',
    fatherPhone: '',
    motherName: '',
    motherEmail: '',
    motherPhone: '',
    allergy1: '',
    allergy2: '',
    emergency1: '',
    emergency2: '',
    pickup1: '',
    pickup2: '',
    ok: false,
    rowStatus: 'Error',
    warnings: [],
    message: 'Student name is required · Invalid birth date · Classroom missing',
  },
  {
    id: 'r4',
    rowNum: 4,
    name: 'Ishaan Reddy',
    gender: 'Male',
    status: 'Active',
    room: 'Star Room',
    admissionNumber: 'ADM-210',
    dob: '02/02/22',
    admissionDate: '01/08/24',
    registrationDate: '28/07/24',
    bloodGroup: 'A+',
    medication: 'Inhaler as needed',
    address: '4 River Road, Hyderabad',
    fatherName: 'Suresh Reddy',
    fatherEmail: 'suresh.reddy@email.com',
    fatherPhone: '+91 91234 56780',
    motherName: 'Lakshmi Reddy',
    motherEmail: 'lakshmi.reddy@email.com',
    motherPhone: '+91 91234 56781',
    allergy1: 'Dust · Mild',
    allergy2: 'Pollen · Mild',
    emergency1: 'Ravi Reddy · Uncle',
    emergency2: '',
    pickup1: 'Lakshmi Reddy · Mother',
    pickup2: 'Ravi Reddy · Uncle',
    ok: true,
    rowStatus: 'Valid',
    warnings: [],
  },
];

const FEATURE_BADGES = [
  'Smart Validation',
  'Duplicate Detection',
  'Parent Mapping',
  'Emergency Contacts',
  'Authorized Pickup',
];

const VALIDATION_STEPS = [
  { id: 'required', label: 'Required Fields', detail: 'Name, classroom, gender' },
  { id: 'dates', label: 'Date Format', detail: 'DD/MM/YY checked' },
  { id: 'dupes', label: 'Duplicate Detection', detail: 'Emails & phones' },
  { id: 'parents', label: 'Parent Validation', detail: 'Father & mother details' },
  { id: 'classroom', label: 'Classroom Validation', detail: 'Mapped to center rooms' },
  { id: 'emergency', label: 'Emergency Contact Validation', detail: 'Contacts present' },
  { id: 'pickup', label: 'Pickup Validation', detail: 'Authorized pickups' },
  { id: 'allergy', label: 'Allergy Validation', detail: 'Severity & treatment' },
];

const ease = [0.22, 1, 0.36, 1] as const;

function useCountUp(target: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const steps = 16;
    const id = requestAnimationFrame(function tick() {
      frame += 1;
      setValue(Math.round((target * frame) / steps));
      if (frame < steps) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, [target]);
  return value;
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  tone: string;
}) {
  const n = useCountUp(value);
  return (
    <motion.div className={`sbu-stat sbu-stat-${tone}`} whileHover={{ y: -3 }}>
      <span className="sbu-stat-ico" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div>
        <strong>{n}</strong>
        <span>{label}</span>
      </div>
    </motion.div>
  );
}

function DetailCard({
  title,
  icon: Icon,
  fields,
}: {
  title: string;
  icon: typeof UserRound;
  fields: { label: string; value: string }[];
}) {
  return (
    <div className="sbu-card">
      <h4>
        <Icon size={14} /> {title}
      </h4>
      <dl>
        {fields.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value || '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function BulkUploadStudentsScreen() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState<'idle' | 'uploading' | 'ready'>('idle');
  const [progress, setProgress] = useState(0);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    sizeStr: string;
    uploadedAt: string;
  } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [stepsDone, setStepsDone] = useState(0);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (state !== 'ready') {
      setStepsDone(0);
      return;
    }
    setStepsDone(0);
    let i = 0;
    const t = window.setInterval(() => {
      i += 1;
      setStepsDone(i);
      if (i >= VALIDATION_STEPS.length) window.clearInterval(t);
    }, 140);
    return () => window.clearInterval(t);
  }, [state, rows]);

  const counts = useMemo(() => {
    const valid = rows.filter((r) => r.rowStatus === 'Valid').length;
    const warnings = rows.filter((r) => r.rowStatus === 'Warning').length;
    const errors = rows.filter((r) => r.rowStatus === 'Error').length;
    const parents = rows.reduce(
      (n, r) => n + (r.fatherName ? 1 : 0) + (r.motherName ? 1 : 0),
      0,
    );
    const emergencies = rows.reduce(
      (n, r) => n + (r.emergency1 ? 1 : 0) + (r.emergency2 ? 1 : 0),
      0,
    );
    const pickups = rows.reduce(
      (n, r) => n + (r.pickup1 ? 1 : 0) + (r.pickup2 ? 1 : 0),
      0,
    );
    return {
      rows: rows.length,
      valid,
      warnings,
      errors,
      parents,
      emergencies,
      pickups,
      importable: rows.filter((r) => r.ok).length,
    };
  }, [rows]);

  const downloadTemplate = () => {
    const sample =
      '"Nursery A","Kavya Sharma","Female","12/03/21","01/06/24","20/05/24","B+","None","Rohit Sharma","rohit.sharma@email.com","+91","9876543210","Ananya Sharma","ananya.sharma@email.com","+91","9876543211","12 Lake View, Hyderabad","Peanuts","Food","Severe","Hives","","EpiPen","","","","","","","Priya Rao","Aunt","+91","9876500001","","","","Vikram Rao","Uncle","+91","9876500002","","","","Priya Rao","Aunt","+91","9876500001","","","","","",""\n';
    const blob = new Blob([`${STUDENT_TEMPLATE_HEADER}\n${sample}`], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-bulk-template.csv';
    a.click();
    URL.revokeObjectURL(url);
    setToast('Student template downloaded');
  };

  const finishUpload = (file: File) => {
    setRows(
      SAMPLE.map((r) => ({
        ...r,
        id: `${file.name}-${r.rowNum}-${Date.now()}`,
      })),
    );
    setState('ready');
    setExpanded(null);
    setToast(`Parsed ${file.name}`);
  };

  const simulateUpload = (file?: File) => {
    if (!file) return;
    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
      setToast('Please upload a CSV or Excel file');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setToast('File must be under 20 MB');
      return;
    }

    setFileInfo({
      name: file.name,
      sizeStr: `${(file.size / 1024).toFixed(1)} KB`,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setState('uploading');
    setProgress(0);
    let p = 0;
    const tick = window.setInterval(() => {
      p += 12;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        window.clearInterval(tick);
        finishUpload(file);
      }
    }, 90);
  };

  const removeFile = () => {
    setState('idle');
    setRows([]);
    setFileInfo(null);
    setExpanded(null);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  const validateAgain = () => {
    if (!fileInfo) return;
    setState('uploading');
    setProgress(0);
    let p = 0;
    const tick = window.setInterval(() => {
      p += 20;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        window.clearInterval(tick);
        setRows((prev) => prev.map((r) => ({ ...r })));
        setState('ready');
        setToast('Validation complete');
      }
    }, 80);
  };

  const saveValid = () => {
    const valid = rows.filter((r) => r.ok);
    if (!valid.length) {
      setToast('No valid rows to import');
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      const existing = loadStudents();
      const roomByName = new Map(ROOM_OPTIONS.map((r) => [r.name.toLowerCase(), r.id]));
      const created = valid.map((r) => {
        const roomId = roomByName.get(r.room.toLowerCase()) || ROOM_OPTIONS[0]?.id || '';
        return createStudent({
          name: r.name,
          preferredName: r.name.split(/\s+/)[0] || r.name,
          gender: (GENDERS.includes(r.gender as Gender) ? r.gender : 'Prefer not to say') as Gender,
          status: (STATUSES.includes(r.status as StudentStatus)
            ? r.status
            : 'Active') as StudentStatus,
          admissionDate: new Date().toISOString().slice(0, 10),
          roomId,
          centerId: defaultCenterIdForNewRecord('all'),
        });
      });
      const stamped = created.map((s, i) =>
        valid[i]?.admissionNumber
          ? { ...s, admissionNumber: valid[i].admissionNumber }
          : s,
      );
      saveStudents([...stamped, ...existing]);
      setSaving(false);
      setToast(`Imported ${stamped.length} students`);
      window.setTimeout(() => router.push('/center-management/students'), 700);
    }, 700);
  };

  return (
    <div className="cm-page sbu">
      <div className="sbu-blobs" aria-hidden="true">
        <span className="sbu-blob sbu-blob-a" />
        <span className="sbu-blob sbu-blob-b" />
        <span className="sbu-blob sbu-blob-c" />
      </div>

      <button
        type="button"
        className="sbu-back"
        onClick={() => router.push('/center-management/students')}
      >
        <ArrowLeft size={16} strokeWidth={2.25} aria-hidden />
        <span>Students</span>
      </button>

      <motion.header
        className="sbu-hero"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease }}
      >
        <div>
          <span className="sbu-kicker">
            <UploadCloud size={13} /> Bulk onboarding
          </span>
          <h1>Bulk Upload Students</h1>
          <p>
            Upload your Excel/CSV file to create multiple student records at once — parents,
            allergies, emergency contacts, and pickups included.
          </p>
          <div className="sbu-badges">
            {FEATURE_BADGES.map((b) => (
              <span key={b} className="sbu-badge">
                <CheckCircle2 size={12} /> {b}
              </span>
            ))}
          </div>
        </div>
        <motion.button
          type="button"
          className="sbu-dl"
          onClick={downloadTemplate}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FileSpreadsheet size={18} />
          </motion.span>
          Download Template
        </motion.button>
      </motion.header>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) simulateUpload(file);
        }}
      />

      <AnimatePresence mode="wait">
        {state === 'idle' ? (
          <motion.div
            key="drop"
            className={`sbu-drop${dragging ? ' is-drag' : ''}`}
            role="button"
            tabIndex={0}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) simulateUpload(file);
            }}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileRef.current?.click();
              }
            }}
          >
            <motion.span
              className="sbu-drop-ico"
              aria-hidden="true"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <UploadCloud size={32} />
            </motion.span>
            <strong>
              Drag &amp; Drop Student CSV or <em>Browse Files</em>
            </strong>
            <p>We&apos;ll validate and preview before importing into your center.</p>
            <div className="sbu-drop-meta">
              <span>CSV</span>
              <span>XLSX</span>
              <span>Max 20 MB</span>
              <span>55-column student template</span>
            </div>
          </motion.div>
        ) : state === 'uploading' ? (
          <motion.div
            key="progress"
            className="sbu-progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 size={34} className="sla-spin" color="#5b5ceb" />
            <div className="sbu-progress-track" aria-hidden="true">
              <motion.div
                className="sbu-progress-fill"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>
            <strong>Processing {fileInfo?.name || 'file'}… {progress}%</strong>
          </motion.div>
        ) : (
          <motion.div
            key="file"
            className="sbu-file"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="sbu-file-main">
              <span className="sbu-file-ico" aria-hidden="true">
                <FileSpreadsheet size={26} />
              </span>
              <div className="sbu-file-copy">
                <strong>{fileInfo?.name}</strong>
                <span className="sbu-file-status">
                  <CheckCircle2 size={12} /> Successfully uploaded
                </span>
                <div className="sbu-file-meta">
                  <span>Size: {fileInfo?.sizeStr}</span>
                  <span>
                    <b>{counts.rows}</b> rows found
                  </span>
                  <span>Uploaded {fileInfo?.uploadedAt}</span>
                </div>
              </div>
            </div>
            <div className="sbu-file-actions">
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                onClick={() => fileRef.current?.click()}
              >
                <RefreshCw size={14} /> Replace File
              </button>
              <button type="button" className="ui-btn ui-btn-danger" onClick={removeFile}>
                <Trash2 size={14} /> Remove File
              </button>
              <button type="button" className="ui-btn ui-btn-outline" onClick={downloadTemplate}>
                <Download size={14} /> Template
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {state === 'ready' ? (
        <>
          <section className="sbu-stats" aria-label="Validation summary">
            <StatCard label="Rows Found" value={counts.rows} icon={ClipboardList} tone="purple" />
            <StatCard label="Valid Students" value={counts.valid} icon={BadgeCheck} tone="green" />
            <StatCard label="Warnings" value={counts.warnings} icon={AlertTriangle} tone="amber" />
            <StatCard label="Errors" value={counts.errors} icon={Shield} tone="red" />
            <StatCard label="Parents Mapped" value={counts.parents} icon={Users} tone="blue" />
            <StatCard label="Emergency Contacts" value={counts.emergencies} icon={Phone} tone="soft" />
            <StatCard label="Authorized Pickups" value={counts.pickups} icon={UserRound} tone="pink" />
            <StatCard label="Ready to Import" value={counts.importable} icon={School} tone="teal" />
          </section>

          <div className="sbu-main">
            <section className="sbu-preview" aria-label="Student data preview">
              <div className="sbu-preview-head">
                <div>
                  <h3>Interactive Data Preview</h3>
                  <p>
                    Showing key columns · expand a row to inspect the full 55-field student profile
                  </p>
                </div>
              </div>

              <div className="sbu-table-wrap">
                <table className="sbu-table">
                  <thead>
                    <tr>
                      <th />
                      <th>#</th>
                      <th>Student</th>
                      <th>Classroom</th>
                      <th>Gender</th>
                      <th>DOB</th>
                      <th>Father</th>
                      <th>Mother</th>
                      <th>Phone</th>
                      <th>Blood</th>
                      <th>Validation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const rowKey = r.id || `row-${r.rowNum}`;
                      const open = expanded === rowKey;
                      const tone =
                        r.rowStatus === 'Valid' ? 'ok' : r.rowStatus === 'Warning' ? 'warn' : 'err';
                      return (
                        <Fragment key={rowKey}>
                          <tr className={`sbu-row-tr is-${tone}${open ? ' is-open' : ''}`}>
                            <td colSpan={11} style={{ padding: 0, border: 0 }}>
                              <button
                                type="button"
                                className="sbu-row"
                                aria-expanded={open}
                                onClick={() => setExpanded(open ? null : rowKey)}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns:
                                    '28px 36px minmax(120px,1.3fr) repeat(7, minmax(70px,1fr)) 110px',
                                  gap: 0,
                                  width: '100%',
                                  alignItems: 'center',
                                  padding: '0.85rem 0.9rem',
                                }}
                              >
                                <motion.span
                                  animate={{ rotate: open ? 180 : 0 }}
                                  style={{ color: '#94a3b8', display: 'inline-flex' }}
                                >
                                  <ChevronDown size={16} />
                                </motion.span>
                                <span>{r.rowNum}</span>
                                <span>
                                  <span className="sbu-name">{r.name || '—'}</span>
                                  <span className="sbu-sub">{r.admissionNumber || 'No admission #'}</span>
                                </span>
                                <span>{r.room || '—'}</span>
                                <span>{r.gender || '—'}</span>
                                <span>{r.dob || '—'}</span>
                                <span>{r.fatherName || '—'}</span>
                                <span>{r.motherName || '—'}</span>
                                <span>{r.fatherPhone || r.motherPhone || '—'}</span>
                                <span>{r.bloodGroup || '—'}</span>
                                <span className={`sbu-pill sbu-pill-${tone}`}>
                                  {r.rowStatus === 'Valid' ? (
                                    <CheckCircle2 size={12} />
                                  ) : (
                                    <AlertTriangle size={12} />
                                  )}
                                  {r.rowStatus}
                                </span>
                              </button>
                            </td>
                          </tr>
                          {open ? (
                            <tr key={`${rowKey}-detail`}>
                              <td colSpan={11} style={{ padding: 0, border: 0 }}>
                                <motion.div
                                  className="sbu-expand"
                                  initial={{ opacity: 0, y: -6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.22 }}
                                >
                                  <div className="sbu-expand-grid">
                                    <DetailCard
                                      title="Student Information"
                                      icon={School}
                                      fields={[
                                        { label: 'Status', value: r.status },
                                        { label: 'Admission', value: r.admissionDate },
                                        { label: 'Registration', value: r.registrationDate },
                                        { label: 'Gender', value: r.gender },
                                      ]}
                                    />
                                    <DetailCard
                                      title="Parent Information"
                                      icon={Users}
                                      fields={[
                                        { label: 'Father', value: `${r.fatherName} · ${r.fatherPhone}` },
                                        { label: 'Father email', value: r.fatherEmail },
                                        { label: 'Mother', value: `${r.motherName} · ${r.motherPhone}` },
                                        { label: 'Mother email', value: r.motherEmail },
                                      ]}
                                    />
                                    <DetailCard
                                      title="Emergency Contacts"
                                      icon={Phone}
                                      fields={[
                                        { label: 'Contact 1', value: r.emergency1 },
                                        { label: 'Contact 2', value: r.emergency2 },
                                      ]}
                                    />
                                    <DetailCard
                                      title="Authorized Pickups"
                                      icon={UserRound}
                                      fields={[
                                        { label: 'Pickup 1', value: r.pickup1 },
                                        { label: 'Pickup 2', value: r.pickup2 },
                                      ]}
                                    />
                                    <DetailCard
                                      title="Allergies"
                                      icon={Heart}
                                      fields={[
                                        { label: 'Allergy 1', value: r.allergy1 },
                                        { label: 'Allergy 2', value: r.allergy2 },
                                      ]}
                                    />
                                    <DetailCard
                                      title="Medical & Address"
                                      icon={MapPin}
                                      fields={[
                                        { label: 'Blood group', value: r.bloodGroup },
                                        { label: 'Medication', value: r.medication },
                                        { label: 'Address', value: r.address },
                                      ]}
                                    />
                                  </div>
                                  {r.message || r.warnings.length ? (
                                    <div
                                      className={`sbu-issues${r.rowStatus === 'Error' ? ' is-error' : ''}`}
                                    >
                                      {r.message || r.warnings.join(' · ')}
                                    </div>
                                  ) : null}
                                </motion.div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="sbu-panel" aria-label="Validation timeline">
              <h3>Validation Timeline</h3>
              <ul className="sbu-timeline">
                {VALIDATION_STEPS.map((step, i) => {
                  const done = i < stepsDone;
                  return (
                    <motion.li
                      key={step.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <span className={`sbu-timeline-ico${done ? '' : ' is-wait'}`} aria-hidden="true">
                        {done ? <CheckCircle2 size={14} /> : <Loader2 size={14} className="sla-spin" />}
                      </span>
                      <div>
                        <strong>{step.label}</strong>
                        <span>{step.detail}</span>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </aside>
          </div>

          <motion.footer
            className="sbu-dock"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="sbu-dock-meta">
              <span>
                File <strong>{fileInfo?.name}</strong>
              </span>
              <span>
                Rows <strong>{counts.rows}</strong>
              </span>
              <span>
                Valid <strong>{counts.valid}</strong>
              </span>
              <span>
                Warnings <strong>{counts.warnings}</strong>
              </span>
              <span>
                Errors <strong>{counts.errors}</strong>
              </span>
            </div>
            <div className="sbu-dock-actions">
              <button
                type="button"
                className="ui-btn ui-btn-outline"
                onClick={() => router.push('/center-management/students')}
              >
                Cancel
              </button>
              <button type="button" className="ui-btn ui-btn-outline" onClick={validateAgain}>
                <RefreshCw size={14} /> Validate Again
              </button>
              <motion.button
                type="button"
                className="sbu-continue"
                disabled={saving || !counts.importable}
                onClick={saveValid}
                whileHover={counts.importable && !saving ? { y: -2 } : undefined}
                whileTap={counts.importable && !saving ? { scale: 0.98 } : undefined}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="sla-spin" /> Importing…
                  </>
                ) : (
                  <>
                    Import Students
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </div>
          </motion.footer>
        </>
      ) : (
        <div className="sbu-instructions">
          <h3>Instructions to upload</h3>
          <ol>
            <li>Download the student template — do not remove the header row (55 columns).</li>
            <li>Use date format DD/MM/YY for birth, admission, and registration dates.</li>
            <li>Parent emails and phone numbers must be unique across the roster.</li>
            <li>
              Fill allergy, emergency contact, and authorized pickup columns using the numbered
              field names in the template (e.g. allergy 1 allergy name, emergency contact 1 phone
              number).
            </li>
            <li>Upload CSV or Excel (max 20 MB), review validation, then import valid students.</li>
          </ol>
        </div>
      )}

      {toast ? <div className="cm-toast ok">{toast}</div> : null}
    </div>
  );
}
