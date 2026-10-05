'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, Save, UserRound } from 'lucide-react';
import {
  STAFF_ROLES,
  STAFF_ROOM_OPTIONS,
  STAFF_GROUP_OPTIONS,
  generateEmployeeCode,
  generateKioskPin,
  loadStaff,
  saveStaff,
  type StaffMember,
  type StaffRole,
} from '@/lib/center-management/staffStore';
import { AppSelect, DayDatePicker } from './ui';
import { MultiSelectDropdown } from '@/components/modules/view-profile/MultiSelectDropdown';
import { PageLoader } from '@/components/ui/loading';
import '@/components/modules/attendance-leaves/student-attendance.css';
import './students.css';

type Props = {
  staffId?: string; // If provided, edit mode
};

function CustomTimePicker12h({
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
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const hourRef = useRef<HTMLButtonElement>(null);
  const minRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!openType) return;
    const btnRef = openType === 'hour' ? hourRef.current : minRef.current;
    if (!btnRef) return;

    const updatePosition = () => {
      const rect = btnRef.getBoundingClientRect();
      const dropdownHeight = 180;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight + 12;
      const width = Math.max(rect.width, 76);
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);

      setDropdownPos({
        top: openUp ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
        left,
        width,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    const id = window.setTimeout(updatePosition, 0);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [openType]);

  useEffect(() => {
    if (!openType) return;

    const handleDocumentClick = (event: PointerEvent) => {
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenType(null);
    };

    document.addEventListener('pointerdown', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openType]);

  const items = openType === 'hour' ? hours : minutes;
  const activeValue = openType === 'hour' ? hour : minute;

  const dropdownPortal =
    openType && dropdownPos
      ? createPortal(
          <div
            ref={panelRef}
            className="hide-scrollbar"
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
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
                  padding: '8px 0',
                  textAlign: 'center',
                  fontSize: '0.88rem',
                  fontWeight: item === activeValue ? 700 : 500,
                  color: item === activeValue ? 'var(--color-accent)' : '#334155',
                  background: item === activeValue ? 'var(--color-accent-soft)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                {item}
              </div>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        ref={hourRef}
        type="button"
        onClick={() => setOpenType((prev) => (prev === 'hour' ? null : 'hour'))}
        className="ui-input"
        style={{
          width: '74px',
          height: '38px',
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

      <button
        ref={minRef}
        type="button"
        onClick={() => setOpenType((prev) => (prev === 'min' ? null : 'min'))}
        className="ui-input"
        style={{
          width: '74px',
          height: '38px',
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

      <div
        style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '10px',
          padding: '2px',
          border: '1px solid #cbd5e1',
          height: '38px',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => update(hour, minute, 'AM')}
          style={{
            border: 'none',
            background: period === 'AM' ? 'var(--color-accent)' : 'transparent',
            color: period === 'AM' ? '#ffffff' : '#64748b',
            borderRadius: '7px',
            padding: '5px 12px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            height: '32px',
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
            background: period === 'PM' ? 'var(--color-accent)' : 'transparent',
            color: period === 'PM' ? '#ffffff' : '#64748b',
            borderRadius: '7px',
            padding: '5px 12px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            height: '32px',
            transition: 'all 0.15s ease',
          }}
        >
          PM
        </button>
      </div>
      {dropdownPortal}
    </div>
  );
}

export function StaffFormScreen({ staffId }: Props) {
  const router = useRouter();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [ready, setReady] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [form, setForm] = useState({
    name: '',
    dob: '',
    gender: 'Male' as 'Male' | 'Female' | 'Prefer not to say',
    email: '',
    phone: '',
    address: '',
    role: 'Teacher' as StaffRole,
    joiningDate: '',
    rooms: ['Demo Room'] as string[],
    groups: ['Administration'] as string[],
    shiftStart: '09:00 AM',
    shiftEnd: '05:00 PM',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    const list = loadStaff();
    setStaffList(list);
    setReady(true);

    if (staffId) {
      const found = list.find((s) => s.id === staffId);
      if (found) {
        setEditingStaff(found);
        setForm({
          name: found.name,
          dob: found.dob || '',
          gender: found.gender,
          email: found.email || '',
          phone: found.phone || '',
          address: found.address || '',
          role: found.role,
          joiningDate: found.joiningDate || '',
          rooms: found.rooms.length ? found.rooms : ['Demo Room'],
          groups: found.groups.length ? found.groups : ['Administration'],
          shiftStart: found.shiftStart || '09:00 AM',
          shiftEnd: found.shiftEnd || '05:00 PM',
        });
      }
    } else {
      setForm((prev) => ({
        ...prev,
        joiningDate: new Date().toISOString().slice(0, 10),
      }));
    }
  }, [staffId]);

  if (!ready) return <PageLoader context="staff" title="Loading form…" />;

  const handleSave = () => {
    if (!form.name.trim()) {
      setError('Staff Name is required.');
      return;
    }
    if (!form.rooms.length) {
      setError('At least one Room must be selected.');
      return;
    }

    if (editingStaff) {
      const updated = staffList.map((s) =>
        s.id === editingStaff.id
          ? {
              ...s,
              name: form.name.trim(),
              dob: form.dob,
              gender: form.gender,
              email: form.email.trim(),
              phone: form.phone.trim(),
              address: form.address.trim(),
              role: form.role,
              joiningDate: form.joiningDate,
              rooms: form.rooms,
              groups: form.groups,
              shiftStart: form.shiftStart,
              shiftEnd: form.shiftEnd,
              lastUpdatedBy: 'Malika Thimisetty',
            }
          : s,
      );
      saveStaff(updated);
    } else {
      const newStaff: StaffMember = {
        id: `staff-${Date.now()}`,
        name: form.name.trim(),
        role: form.role,
        status: 'Active',
        gender: form.gender,
        dob: form.dob,
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        employeeCode: generateEmployeeCode(staffList.length),
        kioskPin: generateKioskPin(),
        joiningDate: form.joiningDate || new Date().toISOString().slice(0, 10),
        rooms: form.rooms,
        groups: form.groups,
        shiftStart: form.shiftStart,
        shiftEnd: form.shiftEnd,
        lastUpdatedBy: 'Malika Thimisetty',
      };
      saveStaff([...staffList, newStaff]);
    }

    router.push('/center-management/staff');
  };

  const handleCancel = () => {
    router.push('/center-management/staff');
  };

  return (
    <motion.div
      className="cm-page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Top Header Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <button
          type="button"
          onClick={handleCancel}
          style={{
            border: 'none',
            background: 'none',
            color: 'var(--color-accent)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0,
          }}
        >
          <ArrowLeft size={16} /> Staff
        </button>
        <span style={{ color: '#94a3b8', fontWeight: 500 }}>|</span>
        <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.95rem' }}>
          {editingStaff ? editingStaff.name : 'Add Staff'}
        </span>
      </div>

      {/* Subheader Tab */}
      <div style={{ marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '6px' }}>
        <span
          style={{
            color: 'var(--color-accent)',
            fontWeight: 600,
            fontSize: '0.92rem',
            borderBottom: '2px solid var(--color-accent)',
            paddingBottom: '6px',
          }}
        >
          Profile
        </span>
      </div>

      {/* Main Staff Information Card Container */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: '0 2px 14px rgba(0,0,0,0.03)',
        }}
      >
        {/* Card Header Bar */}
        <div
          style={{
            background: 'var(--color-accent-soft)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #d5deea',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--color-accent)',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <UserRound size={17} />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)', margin: 0 }}>
              {editingStaff ? 'Edit Staff Information' : 'Staff Information'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="button" className="ui-btn ui-btn-outline" onClick={handleCancel}>
              Cancel
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={handleSave}>
              <Save size={15} /> Save
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error ? (
          <div
            style={{
              background: '#fef2f2',
              borderLeft: '4px solid #ef4444',
              color: '#991b1b',
              padding: '12px 24px',
              fontSize: '0.88rem',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        ) : null}

        {/* Form Grid */}
        <div style={{ padding: '32px 28px', maxWidth: '850px' }}>
          {/* Row: Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '20px', marginBottom: '22px' }}>
            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Name<span style={{ color: '#e11d48', marginLeft: '4px' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Enter name"
              className="ui-input"
              value={form.name}
              onChange={(e) => {
                setError('');
                setForm({ ...form, name: e.target.value });
              }}
            />
          </div>

          {/* Row: Birth Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '20px', marginBottom: '22px' }}>
            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Birth Date
            </label>
            <DayDatePicker
              value={form.dob}
              onChange={(dob) => setForm({ ...form, dob })}
              placeholder="dd-mm-yyyy"
              className="cm-staff-day-picker"
            />
          </div>

          {/* Row: Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '20px', marginBottom: '22px' }}>
            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Gender<span style={{ color: '#e11d48', marginLeft: '4px' }}>*</span>
            </label>
            <AppSelect
              value={form.gender}
              onChange={(v) => setForm({ ...form, gender: v as any })}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Prefer not to say', label: 'Prefer not to say' },
              ]}
            />
          </div>

          {/* Row: Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '20px', marginBottom: '22px' }}>
            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              placeholder="Enter email"
              className="ui-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* Row: Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '20px', marginBottom: '22px' }}>
            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Contact
            </label>
            <div className="cm-phone-row" style={{ width: '100%' }}>
              <span className="cm-phone-code">🇮🇳 +91</span>
              <input
                type="text"
                placeholder="Phone number"
                className="ui-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Row: Address */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '20px', marginBottom: '22px' }}>
            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Address
            </label>
            <input
              type="text"
              placeholder="Enter address"
              className="ui-input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          {/* Row: Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '20px', marginBottom: '22px' }}>
            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Role<span style={{ color: '#e11d48', marginLeft: '4px' }}>*</span>
            </label>
            <AppSelect
              value={form.role}
              onChange={(v) => setForm({ ...form, role: v as StaffRole })}
              options={STAFF_ROLES.map((r) => ({ value: r, label: r }))}
            />
          </div>

          {/* Row: Joining Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '20px', marginBottom: '22px' }}>
            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Joining Date
            </label>
            <DayDatePicker
              value={form.joiningDate}
              onChange={(joiningDate) => setForm({ ...form, joiningDate })}
              placeholder="dd-mm-yyyy"
              className="cm-staff-day-picker"
            />
          </div>

          {/* Row: Room (Multi-Select) */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '20px', marginBottom: '22px' }}>
            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Room<span style={{ color: '#e11d48', marginLeft: '4px' }}>*</span>
            </label>
            <MultiSelectDropdown
              label="Room"
              options={STAFF_ROOM_OPTIONS}
              value={form.rooms}
              onChange={(nextRooms) => setForm({ ...form, rooms: nextRooms })}
              placeholder="Select room(s)…"
            />
          </div>

          {/* Row: Groups (Multi-Select) */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '20px', marginBottom: '22px' }}>
            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Groups
            </label>
            <MultiSelectDropdown
              label="Groups"
              options={STAFF_GROUP_OPTIONS}
              value={form.groups}
              onChange={(nextGroups) => setForm({ ...form, groups: nextGroups })}
              placeholder="Select group(s)…"
            />
          </div>

          {/* Row: Shift Start Time (Custom Popover 12h AM/PM Picker with 00-59 minutes & no scrollbars) */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '20px', marginBottom: '22px' }}>
            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Shift Start Time
            </label>
            <CustomTimePicker12h
              value={form.shiftStart}
              onChange={(val) => setForm({ ...form, shiftStart: val })}
            />
          </div>

          {/* Row: Shift End Time (Custom Popover 12h AM/PM Picker with 00-59 minutes & no scrollbars) */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center', gap: '20px', marginBottom: '22px' }}>
            <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
              Shift End Time
            </label>
            <CustomTimePicker12h
              value={form.shiftEnd}
              onChange={(val) => setForm({ ...form, shiftEnd: val })}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
