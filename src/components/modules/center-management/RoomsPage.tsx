'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowDownUp,
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  Edit2,
  Eye,
  GraduationCap,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  UserX,
  X,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CenterManagementPageHeader } from './CenterManagementPageHeader';
import { PageLoader } from '@/components/ui/loading';
import { AppSelect, AppTooltip, ProfileTablePagination, useClientPagination } from './ui';
import { loadRooms, saveRooms, type RoomItem } from '@/lib/center-management/roomsStore';
import { loadStudents } from '@/lib/center-management/studentsStore';
import { loadStaff } from '@/lib/center-management/staffStore';
import type { Student, StudentStatus } from '@/lib/center-management/types';
import type { StaffMember, StaffStatus } from '@/lib/center-management/staffStore';
import './students.css';

type SortKey = 'name' | 'capacity' | 'status' | 'default';
type SortDir = 'asc' | 'desc';

/** Status dropdown — portals menu above cards / sections so it stays clickable. */
function StatusDropdownCell({
  status,
  onChange,
}: {
  status: 'Active' | 'Inactive';
  onChange: (newStatus: 'Active' | 'Inactive') => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const width = 140;
      const left = Math.min(rect.left, window.innerWidth - width - 8);
      setPos({
        top: rect.bottom + 6,
        left: Math.max(8, left),
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const menu =
    open && mounted && pos ? (
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.96, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -4 }}
        transition={{ duration: 0.15 }}
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          minWidth: 140,
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          boxShadow: '0 14px 36px rgba(15, 23, 42, 0.18)',
          zIndex: 4000,
          padding: 6,
          textAlign: 'left',
        }}
        role="listbox"
        aria-label="Room status"
      >
        <button
          type="button"
          role="option"
          aria-selected={status === 'Active'}
          onClick={() => {
            onChange('Active');
            setOpen(false);
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 8,
            border: 'none',
            background: status === 'Active' ? '#f0fdf4' : 'transparent',
            color: '#15803d',
            fontWeight: 600,
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
          Active
        </button>
        <button
          type="button"
          role="option"
          aria-selected={status === 'Inactive'}
          onClick={() => {
            onChange('Inactive');
            setOpen(false);
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 8,
            border: 'none',
            background: status === 'Inactive' ? '#fef2f2' : 'transparent',
            color: '#b91c1c',
            fontWeight: 600,
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
          Inactive
        </button>
      </motion.div>
    ) : null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`cm-status-pill ${status === 'Active' ? 'mint' : 'blush'}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 10px',
        }}
      >
        <span>{status || 'Active'}</span>
        <ChevronDown
          size={12}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>
      {mounted ? createPortal(<AnimatePresence>{menu}</AnimatePresence>, document.body) : null}
    </div>
  );
}

export function RoomsPage() {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [ready, setReady] = useState(false);

  // DRILL-DOWN ROOM DETAILS STATE
  const [selectedDetailRoom, setSelectedDetailRoom] = useState<RoomItem | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'students' | 'staff'>('students');

  // Detail View Filters
  const [detailSearch, setDetailSearch] = useState('');
  const [detailStatusFilter, setDetailStatusFilter] = useState('All Statuses');
  const [detailRoleFilter, setDetailRoleFilter] = useState('All Roles');

  // Filters & Sorting for main list
  const [search, setSearch] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('All Capacities');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Checkbox Selection State for Delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination matching StaffPage
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [targetRoom, setTargetRoom] = useState<RoomItem | null>(null);

  // Form input state for Add / Edit
  const [formName, setFormName] = useState('');
  const [formCapacity, setFormCapacity] = useState<number | ''>(30);
  const [formMinYears, setFormMinYears] = useState<number | ''>(2);
  const [formMinMonths, setFormMinMonths] = useState<number | ''>(0);
  const [formMaxYears, setFormMaxYears] = useState<number | ''>(5);
  const [formMaxMonths, setFormMaxMonths] = useState<number | ''>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  useEffect(() => {
    setRooms(loadRooms());
    setStudents(loadStudents());
    setStaffList(loadStaff());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveRooms(rooms);
  }, [rooms, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  // Click outside to close three-dots menu
  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.room-menu-wrap')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  // Column Header Toggle Sorting Logic
  const handleSortHeader = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Filtered & Sorted Rooms
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((r) => {
        if (search.trim() && !r.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
        if (statusFilter !== 'All Statuses' && r.status !== statusFilter) return false;
        if (capacityFilter !== 'All Capacities') {
          if (capacityFilter === '< 30' && r.capacity >= 30) return false;
          if (capacityFilter === '30 - 50' && (r.capacity < 30 || r.capacity > 50)) return false;
          if (capacityFilter === '> 50' && r.capacity <= 50) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortKey === 'name') {
          const res = a.name.localeCompare(b.name);
          return sortDir === 'asc' ? res : -res;
        }
        if (sortKey === 'capacity') {
          const res = a.capacity - b.capacity;
          return sortDir === 'asc' ? res : -res;
        }
        if (sortKey === 'status') {
          const res = (a.status || 'Active').localeCompare(b.status || 'Active');
          return sortDir === 'asc' ? res : -res;
        }
        return 0;
      });
  }, [rooms, search, capacityFilter, statusFilter, sortKey, sortDir]);

  // Latest 2 to 3 rooms for Summary Section
  const summaryRooms = useMemo(() => {
    return rooms.slice(0, 3);
  }, [rooms]);

  // Paginated rooms for table
  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / pageSize));
  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRooms.slice(start, start + pageSize);
  }, [filteredRooms, currentPage, pageSize]);

  const allSelected =
    paginatedRooms.length > 0 && paginatedRooms.every((r) => selectedIds.includes(r.id));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Checkbox selection logic
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedRooms.some((r) => r.id === id)));
      return;
    }
    setSelectedIds((prev) => [
      ...new Set([...prev, ...paginatedRooms.map((r) => r.id)]),
    ]);
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Open Confirmation Modal for Bulk Delete
  const openBulkDeleteModal = () => {
    if (selectedIds.length === 0) return;
    setBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    setIsSubmitting(true);
    setRooms((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
    setIsSubmitting(false);
    setBulkDeleteModalOpen(false);
    setToast({ type: 'ok', message: `${selectedIds.length} room(s) deleted` });
    setSelectedIds([]);
  };

  const openAddModal = () => {
    setFormName('');
    setFormCapacity(30);
    setFormMinYears(2);
    setFormMinMonths(0);
    setFormMaxYears(5);
    setFormMaxMonths(0);
    setAddModalOpen(true);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setToast({ type: 'err', message: 'Room name is required' });
      return;
    }

    setIsSubmitting(true);

    const minY = typeof formMinYears === 'number' ? formMinYears : 0;
    const minM = typeof formMinMonths === 'number' ? formMinMonths : 0;
    const maxY = typeof formMaxYears === 'number' ? formMaxYears : 0;
    const maxM = typeof formMaxMonths === 'number' ? formMaxMonths : 0;

    let ageStr = '';
    if (minY || maxY) {
      if (minM || maxM) {
        ageStr = `${minY}y ${minM}m - ${maxY}y ${maxM}m`;
      } else {
        ageStr = `${minY}Y - ${maxY}Y`;
      }
    }

    const newRoom: RoomItem = {
      id: `room-${Date.now()}`,
      name: formName.trim(),
      capacity: Number(formCapacity) || 30,
      occupiedStudents: 0,
      activeStudents: 0,
      staffCount: 0,
      activeStaff: 0,
      minAgeYears: minY,
      minAgeMonths: minM,
      maxAgeYears: maxY,
      maxAgeMonths: maxM,
      ageRange: ageStr || 'All Ages',
      status: 'Active',
    };

    setRooms((prev) => [newRoom, ...prev]);
    setIsSubmitting(false);
    setAddModalOpen(false);
    setToast({ type: 'ok', message: `Room "${newRoom.name}" created successfully` });
  };

  const handleToggleStatus = (room: RoomItem, nextStatus: 'Active' | 'Inactive') => {
    setRooms((prev) =>
      prev.map((r) => (r.id === room.id ? { ...r, status: nextStatus } : r)),
    );
    setToast({ type: 'ok', message: `Room "${room.name}" status changed to ${nextStatus}` });
  };

  const openRenameModal = (room: RoomItem) => {
    setTargetRoom(room);
    setFormName(room.name);
    setActiveMenuId(null);
    setRenameModalOpen(true);
  };

  const handleRenameRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoom || !formName.trim()) return;

    setIsSubmitting(true);

    setRooms((prev) =>
      prev.map((r) => (r.id === targetRoom.id ? { ...r, name: formName.trim() } : r)),
    );

    setIsSubmitting(false);
    setRenameModalOpen(false);
    setToast({ type: 'ok', message: `Room renamed to "${formName.trim()}"` });
  };

  const openDeleteModal = (room: RoomItem) => {
    setTargetRoom(room);
    setActiveMenuId(null);
    setDeleteModalOpen(true);
  };

  const handleDeleteRoom = async () => {
    if (!targetRoom) return;

    setIsSubmitting(true);

    setRooms((prev) => prev.filter((r) => r.id !== targetRoom.id));
    setIsSubmitting(false);
    setDeleteModalOpen(false);
    setToast({ type: 'ok', message: `Room "${targetRoom.name}" deleted` });
  };

  // Open Room Details View for a specific room & tab
  const handleOpenRoomDetails = (room: RoomItem, tab: 'students' | 'staff') => {
    setSelectedDetailRoom(room);
    setActiveDetailTab(tab);
    setDetailSearch('');
    setDetailStatusFilter('All Statuses');
    setDetailRoleFilter('All Roles');
  };

  // Room Specific Linked Students
  const roomStudents = useMemo(() => {
    if (!selectedDetailRoom) return [];
    return students.filter((s) => {
      // Students store roomIds uses the same IDs as roomsStore (room-1 through room-5)
      const roomMatch = s.roomIds?.includes(selectedDetailRoom.id);
      if (!roomMatch) return false;
      if (detailSearch.trim() && !s.name.toLowerCase().includes(detailSearch.trim().toLowerCase())) return false;
      if (detailStatusFilter !== 'All Statuses' && s.status !== detailStatusFilter) return false;
      return true;
    });
  }, [students, selectedDetailRoom, detailSearch, detailStatusFilter]);

  // Room Specific Linked Staff
  const roomStaff = useMemo(() => {
    if (!selectedDetailRoom) return [];
    return staffList.filter((st) => {
      // Staff store uses room name strings in the rooms[] array
      const roomMatch = st.rooms?.includes(selectedDetailRoom.name);
      if (!roomMatch) return false;
      if (detailSearch.trim() && !st.name.toLowerCase().includes(detailSearch.trim().toLowerCase())) return false;
      if (detailStatusFilter !== 'All Statuses' && st.status !== detailStatusFilter) return false;
      if (detailRoleFilter !== 'All Roles' && st.role !== detailRoleFilter) return false;
      return true;
    });
  }, [staffList, selectedDetailRoom, detailSearch, detailStatusFilter, detailRoleFilter]);

  const roomStudentsPaging = useClientPagination(roomStudents, 10);
  const roomStaffPaging = useClientPagination(roomStaff, 10);

  // Stagger Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
  };

  if (!ready) return <PageLoader context="students" title="Loading rooms…" />;

  // =========================================================================
  // VIEW 2: ROOM DETAILS EXPANDED DRILL-DOWN VIEW
  // =========================================================================
  if (selectedDetailRoom) {
    const occupied = selectedDetailRoom.occupiedStudents || 0;
    const cap = selectedDetailRoom.capacity || 30;
    const pct = Math.min(100, Math.round((occupied / cap) * 100));

    // Compute active counts from ALL students/staff in this room (ignore search/status filter)
    const allRoomStudents = students.filter((s) => s.roomIds?.includes(selectedDetailRoom.id));
    const allRoomStaff = staffList.filter((st) => st.rooms?.includes(selectedDetailRoom.name));
    const activeStudentCount = allRoomStudents.filter((s) => s.status === 'Active').length;
    const activeStaffCount = allRoomStaff.filter((st) => st.status === 'Active').length;


    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        className="cm-page"
      >
        {/* Header: Back Button then Room Details below */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Row 1: Back button */}
          <div>
            <button
              type="button"
              onClick={() => setSelectedDetailRoom(null)}
              className="ui-btn ui-btn-outline"
              style={{
                height: '38px',
                borderRadius: '9999px',
                padding: '0 16px',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <ArrowLeft size={15} /> Back to Rooms
            </button>
          </div>

          {/* Row 2: Room name + age badge + description */}
          <div>
            <h1 style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              {selectedDetailRoom.name}
              <span style={{ background: '#eef2ff', color: '#5d5fef', fontSize: '0.78rem', fontWeight: 700, padding: '3px 12px', borderRadius: '999px', border: '1px solid #c7d2fe' }}>
                Age: {selectedDetailRoom.ageRange || 'All Ages'}
              </span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.86rem', margin: '4px 0 0', fontWeight: 500 }}>
              Classroom management &amp; assigned members list.
            </p>
          </div>
        </div>

        {/* Room Header Summary Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Card 1: Students */}
          <motion.div
            whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(93, 95, 239, 0.12)' }}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#eef2ff', color: '#5d5fef', display: 'grid', placeItems: 'center' }}>
              <GraduationCap size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Assigned Students</span>
              <strong style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
                {allRoomStudents.length} <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>({activeStudentCount} active)</span>
              </strong>
            </div>
          </motion.div>

          {/* Card 2: Staff */}
          <motion.div
            whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(93, 95, 239, 0.12)' }}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#eef2ff', color: '#5d5fef', display: 'grid', placeItems: 'center' }}>
              <Users size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Assigned Staff</span>
              <strong style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
                {allRoomStaff.length} <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>({activeStaffCount} active)</span>
              </strong>
            </div>
          </motion.div>

          {/* Card 3: Capacity */}
          <motion.div
            whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(93, 95, 239, 0.12)' }}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#eef2ff', color: '#5d5fef', display: 'grid', placeItems: 'center' }}>
              <Building2 size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Max Capacity</span>
              <strong style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>{cap}</strong>
            </div>
          </motion.div>

          {/* Card 4: Occupancy */}
          <motion.div
            whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(93, 95, 239, 0.12)' }}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              <span>Occupancy</span>
              <strong style={{ color: '#5d5fef' }}>{pct}%</strong>
            </div>
            <div style={{ width: '100%', background: '#e2e8f0', height: '6px', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #5d5fef 0%, #4f46e5 100%)', borderRadius: '999px' }} />
            </div>
          </motion.div>
        </div>

        {/* Animated Tabs: Students | Staff */}
        <div style={{ borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => setActiveDetailTab('students')}
            style={{
              position: 'relative',
              padding: '12px 20px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeDetailTab === 'students' ? '#5d5fef' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <GraduationCap size={18} />
            Students ({selectedDetailRoom.occupiedStudents || roomStudents.length})
            {activeDetailTab === 'students' ? (
              <motion.div
                layoutId="detail-tab-pill"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: '#5d5fef',
                  borderRadius: '999px',
                }}
              />
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveDetailTab('staff')}
            style={{
              position: 'relative',
              padding: '12px 20px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: activeDetailTab === 'staff' ? '#5d5fef' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Users size={18} />
            Staff ({selectedDetailRoom.staffCount || roomStaff.length})
            {activeDetailTab === 'staff' ? (
              <motion.div
                layoutId="detail-tab-pill"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: '#5d5fef',
                  borderRadius: '999px',
                }}
              />
            ) : null}
          </button>
        </div>

        {/* TAB 1: STUDENTS LIST */}
        {activeDetailTab === 'students' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Filter Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={detailSearch}
                  onChange={(e) => setDetailSearch(e.target.value)}
                  className="ui-input"
                  style={{
                    height: '42px',
                    borderRadius: '12px',
                    paddingLeft: '38px',
                    paddingRight: detailSearch ? '36px' : '14px',
                    fontSize: '0.88rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    width: '100%',
                  }}
                />
                {detailSearch ? (
                  <button
                    type="button"
                    onClick={() => setDetailSearch('')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Status:</label>
                <AppSelect
                  value={detailStatusFilter}
                  onChange={setDetailStatusFilter}
                  options={['All Statuses', 'Active', 'Inactive', 'On Hold', 'Withdrawn'].map((s) => ({ value: s, label: s }))}
                />
              </div>
            </div>

            {/* Students Table */}
            {roomStudents.length > 0 ? (
              <div className="cm-table-card">
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                    <thead style={{ background: '#5d5fef', color: '#ffffff' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', color: '#ffffff' }}>#</th>
                        <th style={{ padding: '12px 16px', color: '#ffffff' }}>STUDENT NAME</th>
                        <th style={{ padding: '12px 16px', color: '#ffffff' }}>AGE</th>
                        <th style={{ padding: '12px 16px', color: '#ffffff' }}>STATUS</th>
                        <th style={{ padding: '12px 16px', color: '#ffffff' }}>PARENTS</th>
                        <th style={{ padding: '12px 16px', color: '#ffffff' }}>PROGRAMS</th>
                        <th style={{ padding: '12px 16px', color: '#ffffff', textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomStudentsPaging.pageItems.map((st, idx) => (
                        <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover:bg-indigo-50/30">
                          <td style={{ padding: '14px 16px', color: '#94a3b8', fontWeight: 600 }}>
                            {(roomStudentsPaging.page - 1) * roomStudentsPaging.pageSize + idx + 1}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#eef2ff', color: '#5d5fef', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '0.84rem' }}>
                                {st.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong style={{ color: '#0f172a', display: 'block' }}>{st.name}</strong>
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{st.gender}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 500 }}>{st.ageLabel || '—'}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className={`cm-status-pill ${st.status === 'Active' ? 'mint' : st.status === 'On Hold' ? 'lavender' : 'blush'}`}>
                              {st.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#475569' }}>
                            {st.parents?.map((p) => p.name).join(', ') || '—'}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#475569' }}>
                            {st.programEnrollments?.map((pe) => pe.programName).join(', ') || '—'}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => window.open(`/center-management/students/${st.id}`, '_blank')}
                              style={{ border: 'none', background: '#f1f5f9', color: '#334155', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                              className="hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ProfileTablePagination
                  page={roomStudentsPaging.page}
                  pageSize={roomStudentsPaging.pageSize}
                  totalItems={roomStudentsPaging.totalItems}
                  onPageChange={roomStudentsPaging.setPage}
                  onPageSizeChange={roomStudentsPaging.setPageSize}
                />
              </div>
            ) : (
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1.5px dashed #cbd5e1' }}>
                <GraduationCap size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1rem', fontWeight: 700 }}>No Students Assigned</h3>
                <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '4px 0 16px' }}>No students are currently linked to {selectedDetailRoom.name}.</p>
              </div>
            )}
          </div>
        ) : null}

        {/* TAB 2: STAFF LIST */}
        {activeDetailTab === 'staff' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Filter Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  type="text"
                  placeholder="Search staff name..."
                  value={detailSearch}
                  onChange={(e) => setDetailSearch(e.target.value)}
                  className="ui-input"
                  style={{
                    height: '42px',
                    borderRadius: '12px',
                    paddingLeft: '38px',
                    paddingRight: detailSearch ? '36px' : '14px',
                    fontSize: '0.88rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    width: '100%',
                  }}
                />
                {detailSearch ? (
                  <button
                    type="button"
                    onClick={() => setDetailSearch('')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Role:</label>
                  <AppSelect
                    value={detailRoleFilter}
                    onChange={setDetailRoleFilter}
                    options={['All Roles', 'Super Admin', 'Teacher', 'Principal'].map((r) => ({ value: r, label: r }))}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Status:</label>
                  <AppSelect
                    value={detailStatusFilter}
                    onChange={setDetailStatusFilter}
                    options={['All Statuses', 'Active', 'Inactive'].map((s) => ({ value: s, label: s }))}
                  />
                </div>
              </div>
            </div>

            {/* Staff Table */}
            {roomStaff.length > 0 ? (
              <div className="cm-table-card">
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                    <thead style={{ background: '#5d5fef', color: '#ffffff' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', color: '#ffffff' }}>#</th>
                        <th style={{ padding: '12px 16px', color: '#ffffff' }}>STAFF NAME</th>
                        <th style={{ padding: '12px 16px', color: '#ffffff' }}>PHONE NUMBER</th>
                        <th style={{ padding: '12px 16px', color: '#ffffff' }}>ROOMS</th>
                        <th style={{ padding: '12px 16px', color: '#ffffff' }}>STATUS</th>
                        <th style={{ padding: '12px 16px', color: '#ffffff', textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomStaffPaging.pageItems.map((st, idx) => (
                        <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover:bg-indigo-50/30">
                          <td style={{ padding: '14px 16px', color: '#94a3b8', fontWeight: 600 }}>
                            {(roomStaffPaging.page - 1) * roomStaffPaging.pageSize + idx + 1}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#eef2ff', color: '#5d5fef', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '0.84rem' }}>
                                {st.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong style={{ color: '#0f172a', display: 'block' }}>{st.name}</strong>
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{st.role}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 500 }}>{st.phone || '—'}</td>
                          <td style={{ padding: '14px 16px', color: '#475569' }}>
                            {st.rooms?.join(', ') || '—'}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className={`cm-status-pill ${st.status === 'Active' ? 'mint' : 'blush'}`}>
                              {st.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => window.open('/center-management/staff', '_self')}
                              style={{ border: 'none', background: '#f1f5f9', color: '#334155', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                              className="hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              View Staff
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ProfileTablePagination
                  page={roomStaffPaging.page}
                  pageSize={roomStaffPaging.pageSize}
                  totalItems={roomStaffPaging.totalItems}
                  onPageChange={roomStaffPaging.setPage}
                  onPageSizeChange={roomStaffPaging.setPageSize}
                />
              </div>
            ) : (
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1.5px dashed #cbd5e1' }}>
                <Users size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1rem', fontWeight: 700 }}>No Staff Assigned</h3>
                <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '4px 0 16px' }}>No staff members are currently assigned to {selectedDetailRoom.name}.</p>
              </div>
            )}
          </div>
        ) : null}
      </motion.div>
    );
  }

  // =========================================================================
  // VIEW 1: MAIN ROOMS LIST (CARDS + DATA TABLE)
  // =========================================================================
  return (
    <div className="cm-page cm-page--rooms">
      <CenterManagementPageHeader
        title="Rooms"
        description="Manage classrooms and room assignments."
        icon={<DoorOpen />}
        actions={
          <motion.button
            type="button"
            className="ui-btn ui-btn-primary"
            whileTap={{ scale: 0.98 }}
            onClick={openAddModal}
          >
            <Plus size={16} /> Add Room
          </motion.button>
        }
      />

      {/* 2. SECTION 1: LATEST 2-3 SUMMARY CARDS */}
      {summaryRooms.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Latest Created Rooms
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {summaryRooms.map((room) => {
              const occupied = room.occupiedStudents || 0;
              const cap = room.capacity || 30;
              const pct = Math.min(100, Math.round((occupied / cap) * 100));
              const isMenuOpen = activeMenuId === `summary-${room.id}`;

              return (
                <motion.div
                  key={`summary-${room.id}`}
                  variants={cardVariants}
                  whileHover={{
                    y: -5,
                    scale: 1.02,
                    borderColor: '#5d5fef',
                    boxShadow: '0 12px 28px rgba(93, 95, 239, 0.12)',
                  }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="group"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    position: 'relative',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  {/* Header Row: Room Icon + Name & Three Dots Menu */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                      onClick={() => handleOpenRoomDetails(room, 'students')}
                    >
                      <div
                        className="transition-transform group-hover:rotate-6 group-hover:scale-110"
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: '#f0f4ff',
                          color: '#5d5fef',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <DoorOpen size={22} />
                      </div>

                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700, color: '#0f172a' }} className="hover:text-indigo-600">
                          {room.name}
                        </h3>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>
                          Capacity {room.capacity} {room.ageRange ? `• ${room.ageRange}` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Action Menu (Contains ONLY Rename Room & Delete Room) */}
                    <div className="room-menu-wrap" style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : `summary-${room.id}`)}
                        style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}
                        className="hover:bg-slate-100 hover:text-slate-700"
                      >
                        <span style={{ fontSize: '1.2rem', lineHeight: 1, fontWeight: 700 }}>⋮</span>
                      </button>

                      <AnimatePresence>
                        {isMenuOpen ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 4 }}
                            exit={{ opacity: 0, scale: 0.92, y: -4 }}
                            transition={{ duration: 0.15 }}
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: '100%',
                              width: '160px',
                              background: '#ffffff',
                              borderRadius: '14px',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
                              zIndex: 99,
                              padding: '6px',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => openRenameModal(room)}
                              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#334155', fontWeight: 600, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                              className="hover:bg-slate-100"
                            >
                              <Edit2 size={14} color="#5d5fef" /> Rename Room
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteModal(room)}
                              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#ef4444', fontWeight: 600, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                              className="hover:bg-red-50"
                            >
                              <Trash2 size={14} /> Delete Room
                            </button>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Stat Pills (INTERACTIVE CLICK TO DRILL DOWN!) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Students Stat Pill */}
                    <motion.div
                      whileHover={{ scale: 1.03, borderColor: '#5d5fef' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleOpenRoomDetails(room, 'students')}
                      title="Click to view assigned students"
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '6px 10px',
                        fontSize: '0.78rem',
                        flex: 1,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ color: '#5d5fef', display: 'block', fontWeight: 700 }}>Students ↗</span>
                      <strong style={{ color: '#0f172a' }}>{room.occupiedStudents || 0} ({room.activeStudents || 0} active)</strong>
                    </motion.div>

                    {/* Staff Stat Pill */}
                    <motion.div
                      whileHover={{ scale: 1.03, borderColor: '#5d5fef' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleOpenRoomDetails(room, 'staff')}
                      title="Click to view assigned staff"
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '6px 10px',
                        fontSize: '0.78rem',
                        flex: 1,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ color: '#5d5fef', display: 'block', fontWeight: 700 }}>Staff ↗</span>
                      <strong style={{ color: '#0f172a' }}>{room.staffCount || 0} ({room.activeStaff || 0} active)</strong>
                    </motion.div>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                      <span>Capacity: <strong style={{ color: '#0f172a' }}>{cap}</strong></span>
                      <span>Occupied: <strong style={{ color: '#5d5fef' }}>{occupied} ({pct}%)</strong></span>
                    </div>
                    <div style={{ width: '100%', background: '#e2e8f0', height: '6px', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #5d5fef 0%, #4f46e5 100%)', borderRadius: '999px' }} />
                    </div>
                  </div>

                  {/* Footer Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ background: '#eef2ff', color: '#5d5fef', border: '1px solid #c7d2fe', padding: '2px 10px', borderRadius: '999px', fontSize: '0.76rem', fontWeight: 700 }}>
                      Age: {room.ageRange || 'All Ages'}
                    </span>

                    {/* Status Dropdown Cell */}
                    <StatusDropdownCell
                      status={room.status || 'Active'}
                      onChange={(next) => handleToggleStatus(room, next)}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      ) : null}

      {/* 3. SECTION 2: DIVIDED & HIGHLIGHTED DATA TABLE SECTION WITH SEARCH & SORT ABOVE IT */}
      <div
        style={{
          marginTop: '12px',
          paddingTop: '24px',
          borderTop: '2px dashed #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Filter Toolbar Directly Above Table */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              All Classrooms{' '}
              <span style={{ background: '#eef2ff', color: '#5d5fef', fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', border: '1px solid #c7d2fe' }}>
                {filteredRooms.length} Total
              </span>
            </h2>

            {/* Bulk Delete Action Button */}
            {selectedIds.length > 0 ? (
              <motion.button
                type="button"
                className="ui-btn"
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: 'none',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openBulkDeleteModal}
              >
                <Trash2 size={14} /> Delete Selected ({selectedIds.length})
              </motion.button>
            ) : null}
          </div>

          {/* Filter Dropdowns & Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginLeft: 'auto' }}>
            {/* Capacity Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Capacity:</label>
              <AppSelect
                value={capacityFilter}
                onChange={setCapacityFilter}
                options={['All Capacities', '< 30', '30 - 50', '> 50'].map((c) => ({ value: c, label: c }))}
              />
            </div>

            {/* Status Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Status:</label>
              <AppSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={['All Statuses', 'Active', 'Inactive'].map((s) => ({ value: s, label: s }))}
              />
            </div>

            {/* Search Box */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="Search room name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ui-input"
                style={{
                  height: '40px',
                  borderRadius: '12px',
                  paddingLeft: '38px',
                  paddingRight: search ? '36px' : '14px',
                  fontSize: '0.88rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  width: '100%',
                }}
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* DATA TABLE (INTERACTIVE STUDENTS & STAFF CELLS) */}
        {filteredRooms.length > 0 ? (
          <div className="cm-table-card">
            <div style={{ overflowX: 'auto' }} className="hide-scrollbar">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead style={{ background: '#5d5fef', color: '#ffffff' }}>
                  <tr>
                    {/* Master Checkbox Header Column */}
                    <th style={{ padding: '14px 16px', width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#ffffff' }}
                      />
                    </th>
                    <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem' }}>#</th>
                    
                    {/* ROOM NAME with Tooltip on Hover */}
                    <th
                      onClick={() => handleSortHeader('name')}
                      style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <AppTooltip content="Click to sort by name">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          ROOM NAME <ArrowDownUp size={13} style={{ opacity: sortKey === 'name' ? 1 : 0.7 }} />
                        </div>
                      </AppTooltip>
                    </th>

                    {/* CAPACITY with Tooltip on Hover */}
                    <th
                      onClick={() => handleSortHeader('capacity')}
                      style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <AppTooltip content="Click to sort by capacity">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          CAPACITY <ArrowDownUp size={13} style={{ opacity: sortKey === 'capacity' ? 1 : 0.7 }} />
                        </div>
                      </AppTooltip>
                    </th>

                    <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem' }}>STUDENTS</th>
                    <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem' }}>STAFF</th>
                    <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem' }}>OCCUPANCY</th>
                    <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem' }}>AGE GROUP</th>
                    
                    {/* STATUS with Tooltip on Hover */}
                    <th
                      onClick={() => handleSortHeader('status')}
                      style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <AppTooltip content="Click to sort by status">
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          STATUS <ArrowDownUp size={13} style={{ opacity: sortKey === 'status' ? 1 : 0.7 }} />
                        </div>
                      </AppTooltip>
                    </th>

                    <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem' }}>CREATED DATE</th>
                    <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRooms.map((room, idx) => {
                    const rowNum = (currentPage - 1) * pageSize + idx + 1;
                    const occupied = room.occupiedStudents || 0;
                    const cap = room.capacity || 30;
                    const pct = Math.min(100, Math.round((occupied / cap) * 100));
                    const isMenuOpen = activeMenuId === `table-${room.id}`;
                    const isSelected = selectedIds.includes(room.id);

                    return (
                      <tr
                        key={`table-${room.id}`}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isSelected ? '#eef2ff' : idx % 2 === 0 ? '#ffffff' : '#fbfcfd',
                          transition: 'background-color 0.15s ease',
                        }}
                        className="hover:bg-indigo-50/40"
                      >
                        {/* Checkbox Column */}
                        <td style={{ padding: '14px 16px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(room.id)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#5d5fef' }}
                          />
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#94a3b8' }}>{rowNum}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                            onClick={() => handleOpenRoomDetails(room, 'students')}
                          >
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#f0f4ff', color: '#5d5fef', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                              <DoorOpen size={16} />
                            </div>
                            <strong style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.92rem' }} className="hover:text-indigo-600">
                              {room.name}
                            </strong>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>{cap}</td>

                        {/* Interactive Students Column */}
                        <td style={{ padding: '14px 16px', color: '#475569' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenRoomDetails(room, 'students')}
                            style={{ border: 'none', background: 'transparent', padding: 0, textAlign: 'left', cursor: 'pointer' }}
                            title="Click to view assigned students"
                            className="hover:text-indigo-600"
                          >
                            <strong style={{ color: '#0f172a' }}>{occupied}</strong>{' '}
                            <span style={{ color: '#16a34a', fontSize: '0.78rem', fontWeight: 600 }}>({room.activeStudents || 0} active) ↗</span>
                          </button>
                        </td>

                        {/* Interactive Staff Column */}
                        <td style={{ padding: '14px 16px', color: '#475569' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenRoomDetails(room, 'staff')}
                            style={{ border: 'none', background: 'transparent', padding: 0, textAlign: 'left', cursor: 'pointer' }}
                            title="Click to view assigned staff"
                            className="hover:text-indigo-600"
                          >
                            <strong style={{ color: '#0f172a' }}>{room.staffCount || 0}</strong>{' '}
                            <span style={{ color: '#16a34a', fontSize: '0.78rem', fontWeight: 600 }}>({room.activeStaff || 0} active) ↗</span>
                          </button>
                        </td>

                        {/* Occupancy Progress Bar */}
                        <td style={{ padding: '14px 16px', minWidth: '140px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b', marginBottom: '4px' }}>
                            <span>{occupied} / {cap}</span>
                            <span style={{ color: '#5d5fef', fontWeight: 700 }}>{pct}%</span>
                          </div>
                          <div style={{ width: '100%', background: '#e2e8f0', height: '6px', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #5d5fef 0%, #4f46e5 100%)', borderRadius: '999px' }} />
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: '#eef2ff', color: '#5d5fef', border: '1px solid #c7d2fe', padding: '2px 10px', borderRadius: '999px', fontSize: '0.76rem', fontWeight: 700 }}>
                            {room.ageRange || 'All Ages'}
                          </span>
                        </td>
                        {/* Status Dropdown Cell */}
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <StatusDropdownCell
                            status={room.status || 'Active'}
                            onChange={(next) => handleToggleStatus(room, next)}
                          />
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.82rem' }}>01-08-2026</td>
                        {/* Actions Column (Contains ONLY Rename Room & Delete Room) */}
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div className="room-menu-wrap" style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              type="button"
                              onClick={() => setActiveMenuId(isMenuOpen ? null : `table-${room.id}`)}
                              style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px' }}
                              className="hover:bg-slate-100 hover:text-slate-700"
                            >
                              <span style={{ fontSize: '1.2rem', lineHeight: 1, fontWeight: 700 }}>⋮</span>
                            </button>

                            <AnimatePresence>
                              {isMenuOpen ? (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.92, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 4 }}
                                  exit={{ opacity: 0, scale: 0.92, y: -4 }}
                                  transition={{ duration: 0.15 }}
                                  style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    width: '160px',
                                    background: '#ffffff',
                                    borderRadius: '14px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
                                    zIndex: 99,
                                    padding: '6px',
                                    textAlign: 'left',
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => openRenameModal(room)}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#334155', fontWeight: 600, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    className="hover:bg-slate-100"
                                  >
                                    <Edit2 size={14} color="#5d5fef" /> Rename Room
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openDeleteModal(room)}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#ef4444', fontWeight: 600, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    className="hover:bg-red-50"
                                  >
                                    <Trash2 size={14} /> Delete Room
                                  </button>
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ProfileTablePagination
              page={currentPage}
              pageSize={pageSize}
              totalItems={filteredRooms.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              pageSizeOptions={[10, 30, 50]}
            />
          </div>
        ) : (
          /* EMPTY STATE */
          <div
            style={{
              background: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: '20px',
              padding: '48px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#eef2ff',
                color: '#5d5fef',
                display: 'grid',
                placeItems: 'center',
                marginBottom: '14px',
              }}
            >
              <DoorOpen size={30} />
            </div>
            <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 700, fontSize: '1.1rem' }}>
              No Rooms Found
            </h3>
            <p style={{ margin: '6px 0 16px', color: '#64748b', fontSize: '0.86rem', maxWidth: '360px' }}>
              {search ? `No room matches "${search}". Try searching for another name.` : 'Create your first classroom to organize students.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                style={{ background: '#5d5fef', borderRadius: '12px', padding: '10px 20px', fontWeight: 600 }}
                onClick={openAddModal}
              >
                <Plus size={16} /> Add Room
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. ADD ROOM MODAL */}
      <Modal
        open={addModalOpen}
        title="Add New Room"
        onClose={() => setAddModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setAddModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              style={{
                background: 'linear-gradient(135deg, #5d5fef 0%, #4f46e5 100%)',
                padding: '10px 22px',
                borderRadius: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onClick={handleCreateRoom}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating Room...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              <span style={{ color: '#e11d48' }}>*</span> Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sunshine Room"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="ui-input"
              style={{ height: '46px', borderRadius: '12px', width: '100%', background: '#ffffff' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Capacity
            </label>
            <div style={{ position: 'relative' }}>
              <Users
                size={16}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="number"
                min={1}
                max={500}
                placeholder="30"
                value={formCapacity}
                onChange={(e) => setFormCapacity(e.target.value ? Number(e.target.value) : '')}
                className="ui-input"
                style={{ height: '46px', borderRadius: '12px', width: '100%', paddingLeft: '38px', background: '#ffffff' }}
              />
            </div>
          </div>

          {/* Min Age (Years & Months) */}
          <div>
            <label style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Min. Age
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input
                type="number"
                min={0}
                max={18}
                placeholder="Year"
                value={formMinYears}
                onChange={(e) => setFormMinYears(e.target.value ? Number(e.target.value) : '')}
                className="ui-input"
                style={{ height: '46px', borderRadius: '12px', background: '#ffffff' }}
              />
              <input
                type="number"
                min={0}
                max={11}
                placeholder="Month"
                value={formMinMonths}
                onChange={(e) => setFormMinMonths(e.target.value ? Number(e.target.value) : '')}
                className="ui-input"
                style={{ height: '46px', borderRadius: '12px', background: '#ffffff' }}
              />
            </div>
          </div>

          {/* Max Age (Years & Months) */}
          <div>
            <label style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Max. Age
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input
                type="number"
                min={0}
                max={18}
                placeholder="Year"
                value={formMaxYears}
                onChange={(e) => setFormMaxYears(e.target.value ? Number(e.target.value) : '')}
                className="ui-input"
                style={{ height: '46px', borderRadius: '12px', background: '#ffffff' }}
              />
              <input
                type="number"
                min={0}
                max={11}
                placeholder="Month"
                value={formMaxMonths}
                onChange={(e) => setFormMaxMonths(e.target.value ? Number(e.target.value) : '')}
                className="ui-input"
                style={{ height: '46px', borderRadius: '12px', background: '#ffffff' }}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 5. RENAME ROOM MODAL */}
      <Modal
        open={renameModalOpen}
        title="Rename Room"
        onClose={() => setRenameModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setRenameModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              style={{ background: '#5d5fef', borderRadius: '12px', padding: '10px 20px', fontWeight: 700 }}
              onClick={handleRenameRoom}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Rename Room'}
            </button>
          </>
        }
      >
        <form onSubmit={handleRenameRoom} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.86rem' }}>Update classroom name.</p>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="ui-input"
            style={{ height: '46px', borderRadius: '12px', width: '100%', background: '#ffffff' }}
            required
          />
        </form>
      </Modal>

      {/* 6. SINGLE DELETE CONFIRMATION DIALOG */}
      <Modal
        open={deleteModalOpen}
        title="Are you sure ?"
        onClose={() => setDeleteModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              No
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '12px',
                padding: '10px 20px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
              }}
              onClick={handleDeleteRoom}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Yes'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#ef4444',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: '#334155', fontSize: '0.92rem', lineHeight: 1.55 }}>
              Confirm to delete <strong style={{ color: '#0f172a' }}>{targetRoom?.name}</strong>. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>

      {/* 7. BULK DELETE CONFIRMATION DIALOG */}
      <Modal
        open={bulkDeleteModalOpen}
        title="Are you sure ?"
        onClose={() => setBulkDeleteModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="ui-btn ui-btn-outline"
              onClick={() => setBulkDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              No
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                borderRadius: '12px',
                padding: '10px 20px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
              }}
              onClick={confirmBulkDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Yes'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#ef4444',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: '#334155', fontSize: '0.92rem', lineHeight: 1.55 }}>
              Confirm to delete {selectedIds.length} classroom{selectedIds.length === 1 ? '' : 's'}. This action cannot be undone.
            </p>
          </div>
        </div>
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
