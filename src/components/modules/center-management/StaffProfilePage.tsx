'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Cake,
  Check,
  ChevronDown,
  KeyRound,
  Loader2,
  Pencil,
  RotateCcw,
  Send,
  UserRound,
  VenusAndMars,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/loading';
import {
  STAFF_ROLES,
  STAFF_ROOM_OPTIONS,
  STAFF_GROUP_OPTIONS,
  generateKioskPin,
  loadStaff,
  saveStaff,
  type StaffMember,
  type StaffRole,
} from '@/lib/center-management/staffStore';
import { initials } from '@/lib/center-management/studentsStore';
import { readImageAsDataUrl } from '@/components/modules/center-management/photoUpload';
import { AppSelect, DayDatePicker } from './ui';
import { MultiSelectDropdown } from '@/components/modules/view-profile/MultiSelectDropdown';
import { PersonalFilesPanel } from '@/components/modules/view-profile/PersonalFilesPanel';
import { AttendancePanel } from '@/components/modules/view-profile/AttendancePanel';
import { LeavePanel } from '@/components/modules/view-profile/LeavePanel';
import { StaffFormsPanel } from '@/components/modules/view-profile/StaffFormsPanel';
import { NotesPanel } from '@/components/modules/view-profile/NotesPanel';
import '@/components/modules/attendance-leaves/student-attendance.css';
import '@/components/modules/view-profile.css';
import './students.css';

type Props = {
  staffId: string;
};

const TABS = [
  { id: 'profile', label: 'My Profile' },
  { id: 'personal-files', label: 'Personal Files' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'leave', label: 'Leave' },
  { id: 'forms', label: 'Forms' },
  { id: 'notes', label: 'Notes' },
];

/** Portal-rendered 12-Hour Time Picker to prevent clipping */
function PortalTimePicker12h({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const raw = (value || '09:00 AM').trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  let hour = match ? match[1].padStart(2, '0') : '09';
  let minute = match ? match[2].padStart(2, '0') : '00';
  let period = match && match[3] ? match[3].toUpperCase() : 'AM';

  const numericHour = parseInt(hour, 10);
  if (numericHour > 12) {
    hour = String(numericHour - 12).padStart(2, '0');
    period = 'PM';
  } else if (numericHour === 0) {
    hour = '12';
    period = 'AM';
  }

  const update = (h: string, m: string, p: string) => {
    onChange(`${h}:${m} ${p}`);
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const [openType, setOpenType] = useState<'hour' | 'min' | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const hourRef = useRef<HTMLButtonElement>(null);
  const minRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!openType) return;
    const btnRef = openType === 'hour' ? hourRef.current : minRef.current;
    if (!btnRef) return;

    const updatePos = () => {
      const rect = btnRef.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 185;
      const openUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      setPos({
        top: openUp ? rect.top - dropdownHeight - 6 : rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 76),
      });
    };

    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [openType]);

  useEffect(() => {
    if (!openType) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        hourRef.current?.contains(target) ||
        minRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpenType(null);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenType(null);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openType]);

  const items = openType === 'hour' ? hours : minutes;
  const activeVal = openType === 'hour' ? hour : minute;

  const dropdownPortal =
    openType && mounted && pos ? (
      <div
        ref={panelRef}
        className="hide-scrollbar"
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          width: pos.width,
          maxHeight: '180px',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.18)',
          zIndex: 99999,
          padding: '4px 0',
        }}
      >
        {items.map((item) => (
          <div
            key={item}
            onClick={() => {
              if (openType === 'hour') update(item, minute, period);
              else update(hour, item, period);
              setOpenType(null);
            }}
            style={{
              padding: '6px 0',
              textAlign: 'center',
              fontSize: '0.86rem',
              fontWeight: item === activeVal ? 700 : 500,
              color: item === activeVal ? 'var(--color-accent, #5d5fef)' : '#334155',
              background: item === activeVal ? 'var(--color-accent-soft, #eef2ff)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    ) : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
      {/* Hour Button */}
      <button
        ref={hourRef}
        type="button"
        onClick={() => setOpenType((prev) => (prev === 'hour' ? null : 'hour'))}
        className="ui-input"
        style={{
          width: '74px',
          height: '44px',
          padding: '0 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 600,
          fontSize: '0.88rem',
          cursor: 'pointer',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #cbd5e1',
        }}
      >
        <span>{hour}</span>
        <ChevronDown size={14} style={{ opacity: 0.6 }} />
      </button>

      <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>:</span>

      {/* Minute Button */}
      <button
        ref={minRef}
        type="button"
        onClick={() => setOpenType((prev) => (prev === 'min' ? null : 'min'))}
        className="ui-input"
        style={{
          width: '74px',
          height: '44px',
          padding: '0 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 600,
          fontSize: '0.88rem',
          cursor: 'pointer',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #cbd5e1',
        }}
      >
        <span>{minute}</span>
        <ChevronDown size={14} style={{ opacity: 0.6 }} />
      </button>

      {/* AM / PM Toggle */}
      <div
        style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '12px',
          padding: '3px',
          border: '1px solid #cbd5e1',
          height: '44px',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => update(hour, minute, 'AM')}
          style={{
            border: 'none',
            background: period === 'AM' ? 'var(--color-accent, #5d5fef)' : 'transparent',
            color: period === 'AM' ? '#ffffff' : '#64748b',
            borderRadius: '9px',
            padding: '6px 12px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            height: '36px',
            transition: 'all 0.15s ease',
          }}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => update(hour, minute, 'PM')}
          style={{
            border: 'none',
            background: period === 'PM' ? 'var(--color-accent, #5d5fef)' : 'transparent',
            color: period === 'PM' ? '#ffffff' : '#64748b',
            borderRadius: '9px',
            padding: '6px 12px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            height: '36px',
            transition: 'all 0.15s ease',
          }}
        >
          PM
        </button>
      </div>

      {mounted ? createPortal(dropdownPortal, document.body) : null}
    </div>
  );
}

export function StaffProfilePage({ staffId }: Props) {
  const router = useRouter();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('profile');

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStaffList(loadStaff());
    setReady(true);
  }, []);

  const staff = useMemo(() => {
    return staffList.find((s) => s.id === staffId) || staffList[0];
  }, [staffList, staffId]);

  const [editForm, setEditForm] = useState<StaffMember | null>(null);

  useEffect(() => {
    if (staff) setEditForm({ ...staff });
  }, [staff]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (!ready || !staff || !editForm) return <PageLoader context="staff" title="Loading staff profile…" />;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageAsDataUrl(file);
      const updated = { ...staff, avatarUrl: dataUrl };
      const updatedList = staffList.map((s) => (s.id === staff.id ? updated : s));
      setStaffList(updatedList);
      saveStaff(updatedList);
      setToast({ type: 'ok', message: 'Profile photo updated' });
    } catch (err) {
      setToast({ type: 'err', message: 'Failed to upload photo' });
    }
  };

  const handleStartEdit = () => {
    setEditForm({ ...staff });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditForm({ ...staff });
    setIsEditing(false);
  };

  const handleSaveChanges = async () => {
    if (!editForm.name.trim()) {
      setToast({ type: 'err', message: 'Staff name is required' });
      return;
    }

    setIsSaving(true);
    await new Promise((res) => setTimeout(res, 500));

    const updated = { ...editForm, lastUpdatedBy: 'Malika Thimisetty' };
    const updatedList = staffList.map((s) => (s.id === staff.id ? updated : s));
    setStaffList(updatedList);
    saveStaff(updatedList);

    setIsSaving(false);
    setSaveSuccess(true);

    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
      setToast({ type: 'ok', message: 'Staff profile updated successfully' });
    }, 800);
  };

  const handleResetPin = () => {
    const nextPin = generateKioskPin();
    const updated = { ...staff, kioskPin: nextPin };
    const updatedList = staffList.map((s) => (s.id === staff.id ? updated : s));
    setStaffList(updatedList);
    saveStaff(updatedList);
    setToast({ type: 'ok', message: `Kiosk PIN reset to ${nextPin}` });
  };

  // Stagger container animation for hero cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="cm-page">
      {/* Hidden photo file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoUpload}
      />

      {/* Row 1: Breadcrumb Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <motion.button
          type="button"
          onClick={() => router.push('/center-management/staff')}
          whileHover={{ backgroundColor: '#f1f5f9', scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--color-accent, #5d5fef)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '10px',
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowLeft size={16} /> Staff
        </motion.button>
        <span style={{ color: '#94a3b8', fontWeight: 500 }}>|</span>
        <h1 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>
          {staff.name}
        </h1>
      </div>

      {/* Row 2: Navigation Tabs + Right-Aligned Send Invite Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        {/* Animated Tabs */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: '#f8fafc',
            padding: '4px',
            borderRadius: '9999px',
            border: '1px solid #e2e8f0',
            overflowX: 'auto',
          }}
          className="hide-scrollbar"
          aria-label="Profile section tabs"
        >
          {TABS.map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  position: 'relative',
                  border: 'none',
                  background: 'transparent',
                  color: isActive ? '#ffffff' : '#475569',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  zIndex: 1,
                  transition: 'color 0.2s ease',
                }}
              >
                {isActive ? (
                  <motion.div
                    layoutId="activeProfileTabPill"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: '#5d5fef',
                      borderRadius: '9999px',
                      boxShadow: '0 4px 12px rgba(93, 95, 239, 0.25)',
                      zIndex: -1,
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 30, duration: 0.25 }}
                  />
                ) : null}
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Send Invite Button */}
        <motion.button
          type="button"
          className="ui-btn ui-btn-primary"
          style={{
            background: '#5d5fef',
            padding: '10px 20px',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.88rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: 'auto',
          }}
          whileHover={{ y: -2, boxShadow: '0 6px 16px rgba(93, 95, 239, 0.25)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setInviteModalOpen(true)}
        >
          <Send size={15} /> Send Invite
        </motion.button>
      </div>

      {/* Row 3: Compact 5 Summary Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        {/* Card 1: Avatar & Basic Info */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02, borderColor: '#5d5fef', boxShadow: '0 8px 20px rgba(93, 95, 239, 0.1)' }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="group"
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
          }}
        >
          <div
            style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
            onClick={() => fileInputRef.current?.click()}
            title="Click to upload photo"
          >
            {staff.avatarUrl ? (
              <motion.img
                src={staff.avatarUrl}
                alt={staff.name}
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.2 }}
                style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <motion.span
                className="cm-avatar"
                whileHover={{ scale: 1.06 }}
                style={{ width: '46px', height: '46px', fontSize: '0.95rem' }}
              >
                {initials(staff.name)}
              </motion.span>
            )}
            <motion.div
              whileHover={{ rotate: 15 }}
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                background: '#ffffff',
                borderRadius: '50%',
                padding: '3px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Pencil size={10} color="#5d5fef" />
            </motion.div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2
              className="transition-colors group-hover:text-[#5d5fef]"
              style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#0f172a', lineHeight: 1.2 }}
            >
              {staff.name}
            </h2>
            <div style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 4px' }}>{staff.role}</div>
            <span className={`cm-status-pill ${staff.status === 'Active' ? 'mint' : 'blush'}`} style={{ fontSize: '0.7rem', padding: '1px 8px' }}>
              {staff.status}
            </span>
          </div>
        </motion.div>

        {/* Card 2: Gender */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02, borderColor: '#5d5fef', boxShadow: '0 8px 20px rgba(93, 95, 239, 0.1)' }}
          transition={{ duration: 0.22 }}
          className="group"
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <div
            className="transition-transform group-hover:scale-110 group-hover:rotate-3"
            style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#f0f4ff', color: '#5d5fef', display: 'grid', placeItems: 'center', flexShrink: 0 }}
          >
            <VenusAndMars size={17} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', lineHeight: 1.2 }}>Gender</span>
            <strong className="transition-colors group-hover:text-[#5d5fef]" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
              {staff.gender}
            </strong>
          </div>
        </motion.div>

        {/* Card 3: Date of Birth */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02, borderColor: '#5d5fef', boxShadow: '0 8px 20px rgba(93, 95, 239, 0.1)' }}
          transition={{ duration: 0.22 }}
          className="group"
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <div
            className="transition-transform group-hover:scale-110 group-hover:rotate-3"
            style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'grid', placeItems: 'center', flexShrink: 0 }}
          >
            <Cake size={17} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', lineHeight: 1.2 }}>Date Of Birth</span>
            <strong className="transition-colors group-hover:text-[#5d5fef]" style={{ fontSize: '0.86rem', color: '#0f172a' }}>
              {staff.dob || 'Birth date not found'}
            </strong>
          </div>
        </motion.div>

        {/* Card 4: Employee Code */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02, borderColor: '#5d5fef', boxShadow: '0 8px 20px rgba(93, 95, 239, 0.1)' }}
          transition={{ duration: 0.22 }}
          className="group"
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <div
            className="transition-transform group-hover:scale-110 group-hover:rotate-3"
            style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'grid', placeItems: 'center', flexShrink: 0 }}
          >
            <Building2 size={17} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', lineHeight: 1.2 }}>Employee Code</span>
            <strong className="transition-colors group-hover:text-[#5d5fef]" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
              {staff.employeeCode || 'EMP-1'}
            </strong>
          </div>
        </motion.div>

        {/* Card 5: Kiosk Code */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02, borderColor: '#5d5fef', boxShadow: '0 8px 20px rgba(93, 95, 239, 0.1)' }}
          transition={{ duration: 0.22 }}
          className="group"
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <div
            className="transition-transform group-hover:scale-110 group-hover:rotate-3"
            style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#fae8ff', color: '#c026d3', display: 'grid', placeItems: 'center', flexShrink: 0 }}
          >
            <KeyRound size={17} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', lineHeight: 1.2 }}>Kiosk Code</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong className="transition-colors group-hover:text-[#5d5fef]" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                {staff.kioskPin || '8343'}
              </strong>
              <button
                type="button"
                onClick={handleResetPin}
                style={{ border: 'none', background: 'none', color: '#5d5fef', cursor: 'pointer', padding: 0, fontSize: '0.72rem', textDecoration: 'underline' }}
              >
                Reset PIN
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Row 4: Active Tab Panel Content */}
      {tab === 'profile' ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
          }}
        >
          {/* Details Box Header Bar */}
          <div
            style={{
              padding: '16px 24px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              borderRadius: '16px 16px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>
              <UserRound size={20} color="#5d5fef" /> Staff details
            </div>

            {/* Action Buttons (Edit vs Cancel + Save Changes) */}
            {!isEditing ? (
              <motion.button
                type="button"
                className="ui-btn ui-btn-primary"
                style={{ background: '#5d5fef', padding: '8px 18px', fontSize: '0.86rem', borderRadius: '12px' }}
                whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(93, 95, 239, 0.25)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartEdit}
              >
                <Pencil size={14} /> Edit
              </motion.button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <motion.button
                  type="button"
                  className="ui-btn ui-btn-outline"
                  style={{ borderRadius: '12px', padding: '8px 16px' }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </motion.button>

                <motion.button
                  type="button"
                  className="ui-btn ui-btn-primary"
                  style={{
                    background: saveSuccess ? '#16a34a' : '#5d5fef',
                    borderRadius: '12px',
                    padding: '8px 20px',
                    minWidth: '130px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(93, 95, 239, 0.25)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check size={16} /> Saved
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </motion.button>
              </div>
            )}
          </div>

          {/* Grid of Fields (Read-Only vs Inline Input) */}
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Field: Name */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Name {isEditing ? <span style={{ color: '#e11d48' }}>*</span> : null}
              </label>
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="read-name"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}
                    className="hover:bg-slate-100/80"
                  >
                    {staff.name}
                  </motion.div>
                ) : (
                  <motion.input
                    key="edit-name"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    type="text"
                    className="ui-input"
                    style={{ height: '44px', borderRadius: '12px', width: '100%', background: '#ffffff' }}
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Field: Role */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Role {isEditing ? <span style={{ color: '#e11d48' }}>*</span> : null}
              </label>
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="read-role"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}
                    className="hover:bg-slate-100/80"
                  >
                    {staff.role}
                  </motion.div>
                ) : (
                  <motion.div
                    key="edit-role"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AppSelect
                      value={editForm.role}
                      onChange={(v) => setEditForm({ ...editForm, role: v as StaffRole })}
                      options={STAFF_ROLES.map((r) => ({ value: r, label: r }))}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Field: Gender */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Gender {isEditing ? <span style={{ color: '#e11d48' }}>*</span> : null}
              </label>
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="read-gender"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}
                    className="hover:bg-slate-100/80"
                  >
                    {staff.gender}
                  </motion.div>
                ) : (
                  <motion.div
                    key="edit-gender"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AppSelect
                      value={editForm.gender}
                      onChange={(v) => setEditForm({ ...editForm, gender: v as any })}
                      options={[
                        { value: 'Male', label: 'Male' },
                        { value: 'Female', label: 'Female' },
                        { value: 'Prefer not to say', label: 'Prefer not to say' },
                      ]}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Field: Birth Date */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Date Of Birth
              </label>
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="read-dob"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}
                    className="hover:bg-slate-100/80"
                  >
                    {staff.dob || 'Birth date not found'}
                  </motion.div>
                ) : (
                  <motion.div
                    key="edit-dob"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DayDatePicker
                      value={editForm.dob || ''}
                      onChange={(dob) => setEditForm({ ...editForm, dob })}
                      placeholder="dd-mm-yyyy"
                      className="cm-staff-day-picker"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Field: Employee Code (Read-Only) */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Employee Code
              </label>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 600, color: '#64748b' }}>
                {staff.employeeCode || 'EMP-1'}
              </div>
            </div>

            {/* Field: Kiosk Code (Read-Only) */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Kiosk Code
              </label>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 600, color: '#64748b' }}>
                {staff.kioskPin || '8343'}
              </div>
            </div>

            {/* Field: Email */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Email
              </label>
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="read-email"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}
                    className="hover:bg-slate-100/80"
                  >
                    {staff.email || '—'}
                  </motion.div>
                ) : (
                  <motion.input
                    key="edit-email"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    type="email"
                    className="ui-input"
                    style={{ height: '44px', borderRadius: '12px', width: '100%', background: '#ffffff' }}
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Field: Contact */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Contact
              </label>
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="read-contact"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}
                    className="hover:bg-slate-100/80"
                  >
                    {staff.phone || '—'}
                  </motion.div>
                ) : (
                  <motion.div
                    key="edit-contact"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="cm-phone-row"
                    style={{ width: '100%' }}
                  >
                    <span className="cm-phone-code">🇮🇳 +91</span>
                    <input
                      type="text"
                      className="ui-input"
                      style={{ height: '44px', borderRadius: '12px', background: '#ffffff' }}
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Field: Address */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Address
              </label>
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="read-address"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}
                    className="hover:bg-slate-100/80"
                  >
                    {staff.address || '—'}
                  </motion.div>
                ) : (
                  <motion.input
                    key="edit-address"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    type="text"
                    className="ui-input"
                    style={{ height: '44px', borderRadius: '12px', width: '100%', background: '#ffffff' }}
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Field: Joining Date */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Joining Date
              </label>
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="read-joining"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}
                    className="hover:bg-slate-100/80"
                  >
                    {staff.joiningDate || '—'}
                  </motion.div>
                ) : (
                  <motion.div
                    key="edit-joining"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DayDatePicker
                      value={editForm.joiningDate || ''}
                      onChange={(joiningDate) => setEditForm({ ...editForm, joiningDate })}
                      placeholder="dd-mm-yyyy"
                      className="cm-staff-day-picker"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Field: Room (Multi-Select with Tag Pills) */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Room {isEditing ? <span style={{ color: '#e11d48' }}>*</span> : null}
              </label>
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="read-room"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 600, display: 'flex', flexWrap: 'wrap', gap: '6px' }}
                    className="hover:bg-slate-100/80"
                  >
                    {staff.rooms.length > 0 ? (
                      staff.rooms.map((r) => (
                        <span key={r} style={{ background: '#eef2ff', color: '#5d5fef', border: '1px solid #c7d2fe', borderRadius: '16px', padding: '2px 10px', fontSize: '0.8rem', fontWeight: 600 }}>
                          {r}
                        </span>
                      ))
                    ) : (
                      '—'
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="edit-room"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MultiSelectDropdown
                      label="Room"
                      options={STAFF_ROOM_OPTIONS}
                      value={editForm.rooms}
                      onChange={(nextRooms) => setEditForm({ ...editForm, rooms: nextRooms })}
                      placeholder="Select room(s)…"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Field: Groups (Multi-Select with Tag Pills) */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Groups
              </label>
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="read-groups"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 600, display: 'flex', flexWrap: 'wrap', gap: '6px' }}
                    className="hover:bg-slate-100/80"
                  >
                    {staff.groups.length > 0 ? (
                      staff.groups.map((g) => (
                        <span key={g} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '2px 10px', fontSize: '0.8rem', fontWeight: 600 }}>
                          {g}
                        </span>
                      ))
                    ) : (
                      '—'
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="edit-groups"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MultiSelectDropdown
                      label="Groups"
                      options={STAFF_GROUP_OPTIONS}
                      value={editForm.groups}
                      onChange={(nextGroups) => setEditForm({ ...editForm, groups: nextGroups })}
                      placeholder="Select group(s)…"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Field: Shift Start Time (Portal Time Picker) */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Shift Start Time
              </label>
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="read-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}
                    className="hover:bg-slate-100/80"
                  >
                    {staff.shiftStart || '09:00 AM'}
                  </motion.div>
                ) : (
                  <motion.div
                    key="edit-start"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PortalTimePicker12h
                      value={editForm.shiftStart}
                      onChange={(val) => setEditForm({ ...editForm, shiftStart: val })}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Field: Shift End Time (Portal Time Picker) */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Shift End Time
              </label>
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="read-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 600, color: '#0f172a' }}
                    className="hover:bg-slate-100/80"
                  >
                    {staff.shiftEnd || '05:00 PM'}
                  </motion.div>
                ) : (
                  <motion.div
                    key="edit-end"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PortalTimePicker12h
                      value={editForm.shiftEnd}
                      onChange={(val) => setEditForm({ ...editForm, shiftEnd: val })}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      ) : tab === 'personal-files' ? (
        <PersonalFilesPanel ownerName={staff.name} />
      ) : tab === 'attendance' ? (
        <AttendancePanel />
      ) : tab === 'leave' ? (
        <LeavePanel ownerName={staff.name} />
      ) : tab === 'forms' ? (
        <StaffFormsPanel ownerName={staff.name} />
      ) : (
        <NotesPanel ownerName={staff.name} />
      )}

      {/* Send Invite Modal */}
      <Modal
        open={inviteModalOpen}
        title="Send invite"
        onClose={() => setInviteModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setInviteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              style={{ background: '#5d5fef' }}
              onClick={() => {
                setInviteModalOpen(false);
                setToast({ type: 'ok', message: `Invite sent to ${staff.email || staff.name}` });
              }}
            >
              Send invite
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '0.92rem' }}>
          Send an invite to <strong style={{ color: '#0f172a' }}>{staff.email || 'admin@panacea.care'}</strong> so they can download the Panacea app and access their account.
        </p>
      </Modal>

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
    </div>
  );
}
