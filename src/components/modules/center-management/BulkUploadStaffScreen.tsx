'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { loadStaff, saveStaff, type StaffMember } from '@/lib/center-management/staffStore';
import './students.css';

export type ParsedStaffRow = {
  id: string;
  rowNum: number;
  teacherName: string;
  gender: string;
  emailAddress: string;
  address: string;
  countryCode: string;
  phoneNumber: string;
  classroom: string;
  role: string;
  status: 'Valid' | 'Warning' | 'Invalid';
  validationMessage?: string;
};

const SAMPLE_PREVIEW_ROWS: ParsedStaffRow[] = [
  {
    id: 'row-1',
    rowNum: 1,
    teacherName: 'Rajesh Sharma',
    gender: 'Male',
    emailAddress: 'rajesh12@gmail.com',
    address: 'Hyderabad',
    countryCode: 'India',
    phoneNumber: '9988776655',
    classroom: '10th',
    role: 'Admin',
    status: 'Valid',
  },
  {
    id: 'row-2',
    rowNum: 2,
    teacherName: 'Priya Verma',
    gender: 'Female',
    emailAddress: 'priya.verma@panacea.care',
    address: 'Bangalore',
    countryCode: 'India',
    phoneNumber: '9876543210',
    classroom: 'Sunshine Room',
    role: 'Teacher',
    status: 'Valid',
  },
  {
    id: 'row-3',
    rowNum: 3,
    teacherName: 'Amit Patel',
    gender: 'Male',
    emailAddress: 'amit.patel@gmail.com',
    address: 'Mumbai',
    countryCode: 'India',
    phoneNumber: '9123456789',
    classroom: 'Rainbow Room',
    role: 'Assistant',
    status: 'Valid',
  },
  {
    id: 'row-4',
    rowNum: 4,
    teacherName: 'Sunita Reddy',
    gender: 'Female',
    emailAddress: 'sunita.reddy@panacea.care',
    address: 'Hyderabad',
    countryCode: 'India',
    phoneNumber: '9849012345',
    classroom: 'Star Room',
    role: 'Teacher',
    status: 'Warning',
    validationMessage: 'Duplicate phone number format',
  },
  {
    id: 'row-5',
    rowNum: 5,
    teacherName: 'Vikram Singh',
    gender: 'Male',
    emailAddress: 'vikram.singh@panacea.care',
    address: 'Delhi',
    countryCode: 'India',
    phoneNumber: '9711223344',
    classroom: 'Demo Room',
    role: 'Lead Teacher',
    status: 'Valid',
  },
  {
    id: 'row-6',
    rowNum: 6,
    teacherName: 'Ananya Roy',
    gender: 'Female',
    emailAddress: 'ananya.roy@gmail.com',
    address: 'Kolkata',
    countryCode: 'India',
    phoneNumber: '9654321098',
    classroom: 'Sunshine Room',
    role: 'Teacher',
    status: 'Valid',
  },
];

export function BulkUploadStaffScreen() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload States
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  // File & Rows Metadata
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    sizeStr: string;
    uploadedAt: string;
  } | null>(null);

  const [previewRows, setPreviewRows] = useState<ParsedStaffRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const csvHeader = 'teacherName,gender,emailAddress,address,countryCode,phoneNumber,classroom,role\n';
    const csvSample1 = 'Rajesh,Male,rajesh12@gmail.com,Hyderabad,India,9988776655,10th,Admin\n';
    const csvSample2 = 'Priya,Female,priya@gmail.com,Bangalore,India,9876543210,Sunshine Room,Teacher\n';

    const blob = new Blob([csvHeader + csvSample1 + csvSample2], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teacher_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToast({ type: 'ok', message: 'Template downloaded successfully' });
  };

  // Process File Selection / Drop
  const processFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setToast({ type: 'err', message: 'Please upload a valid .xlsx, .xls, or .csv file.' });
      return;
    }

    const sizeInKB = (file.size / 1024).toFixed(1);
    setFileInfo({
      name: file.name,
      sizeStr: `${sizeInKB} KB`,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setUploadState('uploading');
    setUploadProgress(0);

    // Simulate progress animation
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setUploadProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploadState('success');

          // Parse CSV or set sample data
          if (file.name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              const text = evt.target?.result as string;
              if (text) {
                const lines = text.split('\n').filter((l) => l.trim());
                if (lines.length > 1) {
                  const rows: ParsedStaffRow[] = lines.slice(1).map((line, idx) => {
                    const parts = line.split(',').map((p) => p.trim());
                    const tName = parts[0] || `Staff ${idx + 1}`;
                    const gender = parts[1] || 'Male';
                    const email = parts[2] || `${tName.toLowerCase().replace(/\s+/g, '.')}@panacea.care`;
                    const addr = parts[3] || 'Hyderabad';
                    const country = parts[4] || 'India';
                    const phone = parts[5] || '9876543210';
                    const cls = parts[6] || 'Sunshine Room';
                    const role = parts[7] || 'Teacher';

                    const isValid = tName.length > 1 && email.includes('@');
                    return {
                      id: `csv-${idx + 1}`,
                      rowNum: idx + 1,
                      teacherName: tName,
                      gender,
                      emailAddress: email,
                      address: addr,
                      countryCode: country,
                      phoneNumber: phone,
                      classroom: cls,
                      role,
                      status: isValid ? 'Valid' : 'Invalid',
                      validationMessage: isValid ? undefined : 'Missing name or valid email',
                    };
                  });
                  setPreviewRows(rows);
                  return;
                }
              }
              setPreviewRows(SAMPLE_PREVIEW_ROWS);
            };
            reader.readAsText(file);
          } else {
            setPreviewRows(SAMPLE_PREVIEW_ROWS);
          }
        }, 300);
      }
    }, 120);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setUploadState('idle');
    setFileInfo(null);
    setPreviewRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Counts for validation summary
  const validCount = previewRows.filter((r) => r.status === 'Valid').length;
  const warningCount = previewRows.filter((r) => r.status === 'Warning').length;
  const errorCount = previewRows.filter((r) => r.status === 'Invalid').length;

  // Save imported staff to store
  const handleSaveStaff = async () => {
    if (previewRows.length === 0) return;

    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 700));

    const existingStaff = loadStaff();
    const newStaffMembers: StaffMember[] = previewRows
      .filter((r) => r.status !== 'Invalid')
      .map((r, idx) => ({
        id: `staff-bulk-${Date.now()}-${idx}`,
        name: r.teacherName,
        role: (r.role as any) || 'Teacher',
        rooms: [r.classroom || 'Sunshine Room'],
        groups: ['Administration'],
        status: 'Active',
        email: r.emailAddress,
        phone: r.phoneNumber,
        address: r.address,
        gender: (r.gender as any) || 'Male',
        joiningDate: new Date().toISOString().split('T')[0],
        shiftStart: '09:00 AM',
        shiftEnd: '05:00 PM',
        employeeCode: `EMP-${existingStaff.length + idx + 1}`,
        kioskPin: String(1000 + Math.floor(Math.random() * 8999)),
        lastUpdatedBy: 'Malika Thimisetty',
      }));

    const updatedList = [...existingStaff, ...newStaffMembers];
    saveStaff(updatedList);

    setIsSaving(false);
    setSaveSuccess(true);

    setTimeout(() => {
      setToast({ type: 'ok', message: `${newStaffMembers.length} Staff members added successfully!` });
      router.push('/center-management/staff');
    }, 900);
  };

  // Stagger Animations for Page Load
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="cm-page"
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* HEADER SECTION */}
      <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => router.push('/center-management/staff')}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--color-accent, #5d5fef)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              borderRadius: '8px',
            }}
            className="hover:bg-slate-100"
          >
            <ArrowLeft size={16} /> Onboarding dropzone
          </button>
          <span style={{ color: '#94a3b8', fontWeight: 500 }}>/</span>
          <span style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Teacher</span>
        </div>

        {/* Title Bar & Download Template Button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.45rem', margin: 0, letterSpacing: '-0.02em' }}>
              Bulk Upload Staff
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0', fontWeight: 500 }}>
              Upload an Excel file to create multiple staff members at once.
            </p>
          </div>

          <motion.button
            type="button"
            className="ui-btn ui-btn-outline"
            style={{
              borderColor: '#cbd5e1',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.88rem',
              borderRadius: '12px',
              padding: '10px 18px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
            }}
            whileHover={{ y: -2, scale: 1.02, boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadTemplate}
          >
            <FileSpreadsheet size={18} color="#16a34a" /> Download Format
          </motion.button>
        </div>
      </motion.div>

      {/* UPLOAD AREA / PROGRESS / FILE CARD */}
      <motion.div variants={itemVariants}>
        <AnimatePresence mode="wait">
          {uploadState === 'idle' ? (
            <motion.div
              key="dropzone-idle"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                height: '240px',
                borderRadius: '20px',
                border: isDragging ? '2.5px dashed #5d5fef' : '2px dashed #cbd5e1',
                background: isDragging
                  ? 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)'
                  : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                boxShadow: isDragging ? '0 0 0 6px rgba(93, 95, 239, 0.12)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.22s ease',
                padding: '24px',
              }}
            >
              {/* Floating Upload Icon */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow: '0 8px 20px rgba(93, 95, 239, 0.15)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#5d5fef',
                  marginBottom: '14px',
                }}
              >
                <UploadCloud size={32} />
              </motion.div>

              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 700, fontSize: '1.05rem' }}>
                Drag & Drop your Excel file or{' '}
                <span style={{ color: '#5d5fef', textDecoration: 'underline' }}>Browse Files</span>
              </h3>

              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.82rem', fontWeight: 500 }}>
                Supported format: <strong style={{ color: '#334155' }}>.xlsx, .xls, .csv</strong> | Maximum size:{' '}
                <strong style={{ color: '#334155' }}>10 MB</strong>
              </p>
            </motion.div>
          ) : uploadState === 'uploading' ? (
            <motion.div
              key="dropzone-uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                height: '200px',
                borderRadius: '20px',
                border: '2px dashed #818cf8',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
              }}
            >
              <Loader2 size={36} className="animate-spin" color="#5d5fef" style={{ marginBottom: '14px' }} />
              <div style={{ width: '240px', background: '#e2e8f0', borderRadius: '999px', height: '8px', overflow: 'hidden', marginBottom: '10px' }}>
                <motion.div
                  style={{ height: '100%', background: '#5d5fef', borderRadius: '999px' }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.15 }}
                />
              </div>
              <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9rem' }}>
                Uploading... {uploadProgress}%
              </span>
            </motion.div>
          ) : (
            /* Upload Success File Card */
            <motion.div
              key="file-card-success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Excel File Icon with Bounce */}
                <motion.div
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: '#dcfce7',
                    color: '#16a34a',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileSpreadsheet size={26} />
                </motion.div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ color: '#0f172a', fontSize: '1rem', fontWeight: 700 }}>
                      {fileInfo?.name || 'teacher.xlsx'}
                    </strong>
                    <span
                      style={{
                        background: '#dcfce7',
                        color: '#15803d',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={12} /> Successfully uploaded
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    <span>Size: {fileInfo?.sizeStr || '24.5 KB'}</span>
                    <span>•</span>
                    <span style={{ fontWeight: 600, color: '#5d5fef' }}>{previewRows.length} Rows Detected</span>
                    <span>•</span>
                    <span>Uploaded {fileInfo?.uploadedAt || 'Just now'}</span>
                  </div>
                </div>
              </div>

              <motion.button
                type="button"
                onClick={handleRemoveFile}
                whileHover={{ scale: 1.05, backgroundColor: '#fee2e2' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  border: '1px solid #fca5a5',
                  background: '#fef2f2',
                  color: '#ef4444',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Trash2 size={14} /> Remove File
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* DATA PREVIEW SECTION */}
      <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Section Header & Validation Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Data Preview
          </h2>

          {uploadState === 'success' && previewRows.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
                {previewRows.length} Staff Found
              </span>

              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
                {validCount} Valid
              </span>

              {warningCount > 0 ? (
                <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
                  {warningCount} Warnings
                </span>
              ) : null}

              {errorCount > 0 ? (
                <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: '999px' }}>
                  {errorCount} Errors
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* PREVIEW TABLE OR EMPTY STATE */}
        {uploadState === 'success' && previewRows.length > 0 ? (
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ overflowX: 'auto', maxHeight: '420px' }} className="hide-scrollbar">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10, borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px 14px', color: '#5d5fef', fontWeight: 700 }}>#</th>
                    <th style={{ padding: '12px 14px', color: '#5d5fef', fontWeight: 700 }}>Teacher Name</th>
                    <th style={{ padding: '12px 14px', color: '#5d5fef', fontWeight: 700 }}>Gender</th>
                    <th style={{ padding: '12px 14px', color: '#5d5fef', fontWeight: 700 }}>Email Address</th>
                    <th style={{ padding: '12px 14px', color: '#5d5fef', fontWeight: 700 }}>Address</th>
                    <th style={{ padding: '12px 14px', color: '#5d5fef', fontWeight: 700 }}>Country</th>
                    <th style={{ padding: '12px 14px', color: '#5d5fef', fontWeight: 700 }}>Phone</th>
                    <th style={{ padding: '12px 14px', color: '#5d5fef', fontWeight: 700 }}>Classroom</th>
                    <th style={{ padding: '12px 14px', color: '#5d5fef', fontWeight: 700 }}>Role</th>
                    <th style={{ padding: '12px 14px', color: '#5d5fef', fontWeight: 700, textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, idx) => {
                    const isErr = row.status === 'Invalid';
                    const isWarn = row.status === 'Warning';

                    return (
                      <tr
                        key={row.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isErr ? '#fef2f2' : idx % 2 === 0 ? '#ffffff' : '#fbfcfd',
                          borderLeft: isErr ? '4px solid #ef4444' : isWarn ? '4px solid #f59e0b' : 'none',
                          transition: 'background-color 0.15s ease',
                        }}
                        className="hover:bg-indigo-50/40"
                      >
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: '#94a3b8' }}>{row.rowNum}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{row.teacherName}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{row.gender}</td>
                        <td style={{ padding: '12px 14px', color: '#5d5fef', fontWeight: 500 }}>{row.emailAddress}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{row.address}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{row.countryCode}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{row.phoneNumber}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{row.classroom}</td>
                        <td style={{ padding: '12px 14px', color: '#475569', fontWeight: 600 }}>{row.role}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          {isErr ? (
                            <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <AlertCircle size={12} /> Invalid
                            </span>
                          ) : isWarn ? (
                            <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              Warning
                            </span>
                          ) : (
                            <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={12} /> Valid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* EMPTY STATE BEFORE UPLOAD */
          <div
            style={{
              background: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: '18px',
              padding: '48px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: '#94a3b8', display: 'grid', placeItems: 'center', marginBottom: '12px' }}>
              <FileSpreadsheet size={28} />
            </div>
            <h3 style={{ margin: 0, color: '#334155', fontWeight: 700, fontSize: '1rem' }}>
              No file uploaded yet
            </h3>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.84rem', maxWidth: '380px' }}>
              Upload an Excel or CSV file above to preview and validate staff records before importing.
            </p>
          </div>
        )}
      </motion.div>

      {/* FOOTER ACTIONS */}
      <motion.div
        variants={itemVariants}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <motion.button
          type="button"
          className="ui-btn ui-btn-outline"
          style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 600 }}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/center-management/staff')}
          disabled={isSaving}
        >
          Cancel
        </motion.button>

        <motion.button
          type="button"
          className="ui-btn ui-btn-primary"
          style={{
            background: saveSuccess
              ? '#16a34a'
              : 'linear-gradient(135deg, #5d5fef 0%, #4f46e5 100%)',
            borderRadius: '12px',
            padding: '10px 24px',
            fontWeight: 700,
            fontSize: '0.9rem',
            minWidth: '170px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(93, 95, 239, 0.25)',
          }}
          whileHover={{ y: -2, boxShadow: '0 6px 18px rgba(93, 95, 239, 0.35)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveStaff}
          disabled={isSaving || previewRows.length === 0}
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Saving Staff...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 size={16} /> ✓ Staff Added Successfully
            </>
          ) : (
            `Save Staff (${validCount || previewRows.length})`
          )}
        </motion.button>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast ? (
          <motion.div
            className={`cm-toast ${toast.type}`}
            initial={{ opacity: 0, y: -8, x: 8 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
