'use client';

import { useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit2,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CenterManagementPageHeader } from './CenterManagementPageHeader';
import { PageLoader } from '@/components/ui/loading';
import { AppSelect, TableActionMenu } from './ui';
import { loadGroups, saveGroups, type GroupItem } from '@/lib/center-management/groupsStore';
import { loadStudents, saveStudents } from '@/lib/center-management/studentsStore';
import { loadRooms, type RoomItem } from '@/lib/center-management/roomsStore';
import type { Student } from '@/lib/center-management/types';
import './students.css';

type SortOrder = 'default' | 'asc' | 'desc';

/** Portaled status menu — avoids clipping under cards / table sections. */
function StatusDropdownCell({
  status,
  onChange,
  align = 'left',
}: {
  status: 'Active' | 'Inactive';
  onChange: (newStatus: 'Active' | 'Inactive') => void;
  align?: 'left' | 'right';
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
      let left =
        align === 'right' ? rect.right - width : rect.left;
      left = Math.min(Math.max(8, left), window.innerWidth - width - 8);
      setPos({ top: rect.bottom + 6, left });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, align]);

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
          border: '1px solid var(--border, #e2e8f0)',
          boxShadow: '0 14px 36px rgba(15, 23, 42, 0.18)',
          zIndex: 4000,
          padding: 6,
          textAlign: 'left',
        }}
        role="listbox"
        aria-label="Group status"
      >
        <button
          type="button"
          role="option"
          aria-selected={status === 'Active'}
          onClick={(e) => {
            e.stopPropagation();
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
          onClick={(e) => {
            e.stopPropagation();
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
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
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

export function GroupsPage() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [ready, setReady] = useState(false);

  // Search & Filter for Table
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');

  // Pagination matching other pages
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; ids: string[] }>({
    open: false,
    ids: [],
  });
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const [targetGroup, setTargetGroup] = useState<GroupItem | null>(null);

  // Detail View State
  const [selectedDetailGroup, setSelectedDetailGroup] = useState<GroupItem | null>(null);
  const [detailSearch, setDetailSearch] = useState('');

  // Form input state
  const [formName, setFormName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  // Assign Student Modal State
  const [assignSearch, setAssignSearch] = useState('');
  const [assignRoomFilter, setAssignRoomFilter] = useState('All Rooms');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  useEffect(() => {
    setGroups(loadGroups());
    setStudents(loadStudents());
    setRooms(loadRooms());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveGroups(groups);
  }, [groups, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  // Click outside to close top card menus
  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.group-menu-wrap')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  const topGroups = useMemo(() => {
    return groups.slice(0, 3);
  }, [groups]);

  const filteredGroups = useMemo(() => {
    let res = [...groups];
    if (search.trim()) {
      res = res.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (sortOrder === 'asc') {
      res.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'desc') {
      res.sort((a, b) => b.name.localeCompare(a.name));
    }
    return res;
  }, [groups, search, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / pageSize));
  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGroups.slice(start, start + pageSize);
  }, [filteredGroups, currentPage, pageSize]);

  const getStudentCount = (groupId: string) => {
    return students.filter(s => s.groupIds?.includes(groupId)).length;
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setToast({ type: 'err', message: 'Group name is required' });
      return;
    }
    setIsSubmitting(true);
    const newGroup: GroupItem = {
      id: `group-${Date.now()}`,
      name: formName.trim(),
      createdAt: new Date().toISOString(),
      status: 'Active',
    };
    setGroups((prev) => [newGroup, ...prev]);
    setIsSubmitting(false);
    setAddModalOpen(false);
    setToast({ type: 'ok', message: `Group "${newGroup.name}" created successfully` });
  };

  const handleRenameGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGroup || !formName.trim()) return;
    setIsSubmitting(true);
    setGroups((prev) =>
      prev.map((g) => (g.id === targetGroup.id ? { ...g, name: formName.trim() } : g)),
    );
    setIsSubmitting(false);
    setRenameModalOpen(false);
    setToast({ type: 'ok', message: `Group renamed to "${formName.trim()}"` });
  };

  const allSelected =
    paginatedGroups.length > 0 && paginatedGroups.every((g) => selected.includes(g.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !paginatedGroups.some((g) => g.id === id)));
      return;
    }
    setSelected((prev) => [...new Set([...prev, ...paginatedGroups.map((g) => g.id)])]);
  };

  const handleConfirmDelete = async () => {
    const ids = deleteConfirm.ids;
    if (!ids.length) return;
    setIsSubmitting(true);
    const idSet = new Set(ids);

    const updatedStudents = students.map((s) => {
      if (!s.groupIds?.some((gid) => idSet.has(gid))) return s;
      return { ...s, groupIds: s.groupIds.filter((gid) => !idSet.has(gid)) };
    });
    setStudents(updatedStudents);
    saveStudents(updatedStudents);

    const deletedNames = groups.filter((g) => idSet.has(g.id)).map((g) => g.name);
    setGroups((prev) => prev.filter((g) => !idSet.has(g.id)));
    setSelected((prev) => prev.filter((id) => !idSet.has(id)));
    setIsSubmitting(false);
    setDeleteConfirm({ open: false, ids: [] });
    setToast({
      type: 'ok',
      message:
        ids.length === 1
          ? `Group "${deletedNames[0] ?? ''}" deleted`
          : `${ids.length} groups deleted`,
    });
  };

  const handleToggleStatus = (group: GroupItem, nextStatus: 'Active' | 'Inactive') => {
    setGroups((prev) =>
      prev.map((g) => (g.id === group.id ? { ...g, status: nextStatus } : g))
    );
    setToast({ type: 'ok', message: `Group "${group.name}" marked as ${nextStatus}` });
  };

  const openAssignModal = (group: GroupItem) => {
    setTargetGroup(group);
    setSelectedStudentIds(students.filter(s => s.groupIds?.includes(group.id)).map(s => s.id));
    setAssignSearch('');
    setAssignRoomFilter('All Rooms');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!targetGroup) return;
    setIsSubmitting(true);
    
    const updatedStudents = students.map(s => {
      const inGroup = s.groupIds?.includes(targetGroup.id);
      const shouldBeInGroup = selectedStudentIds.includes(s.id);
      
      if (inGroup && !shouldBeInGroup) {
        return { ...s, groupIds: s.groupIds.filter(id => id !== targetGroup.id) };
      } else if (!inGroup && shouldBeInGroup) {
        return { ...s, groupIds: [...(s.groupIds || []), targetGroup.id] };
      }
      return s;
    });
    
    setStudents(updatedStudents);
    saveStudents(updatedStudents);
    setIsSubmitting(false);
    setAssignModalOpen(false);
    setToast({ type: 'ok', message: 'Students assigned successfully' });
  };

  const assignFilteredStudents = useMemo(() => {
    return students.filter(s => {
      if (assignSearch.trim() && !s.name.toLowerCase().includes(assignSearch.toLowerCase())) return false;
      if (assignRoomFilter !== 'All Rooms') {
        const roomNameMatch = rooms.find(r => r.id === s.roomIds?.[0])?.name;
        if (roomNameMatch !== assignRoomFilter) return false;
      }
      return true;
    });
  }, [students, assignSearch, assignRoomFilter, rooms]);
  
  const allAssignFilteredSelected = assignFilteredStudents.length > 0 && assignFilteredStudents.every(s => selectedStudentIds.includes(s.id));

  const toggleSelectAllAssign = () => {
    if (allAssignFilteredSelected) {
      const idsToRemove = assignFilteredStudents.map(s => s.id);
      setSelectedStudentIds(prev => prev.filter(id => !idsToRemove.includes(id)));
    } else {
      const idsToAdd = assignFilteredStudents.map(s => s.id).filter(id => !selectedStudentIds.includes(id));
      setSelectedStudentIds(prev => [...prev, ...idsToAdd]);
    }
  };

  if (!ready) return <PageLoader context="students" title="Loading groups…" />;

  // View Details Mode
  if (selectedDetailGroup) {
    const groupStudents = students.filter(s => s.groupIds?.includes(selectedDetailGroup.id));
    const filteredGroupStudents = groupStudents.filter(s => 
      !detailSearch.trim() || s.name.toLowerCase().includes(detailSearch.toLowerCase())
    );

    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="cm-page">
        <div className="cm-top">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button type="button" onClick={() => setSelectedDetailGroup(null)} className="cm-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> Back to Groups
            </button>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {selectedDetailGroup.name}
              <span className="cm-status-pill mint">Group Details</span>
            </h1>
          </div>
        </div>

        <div className="cm-status-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="cm-status-card tone-mint">
            <div className="cm-status-icon mint">
              <Users size={16} />
            </div>
            <div className="cm-status-copy">
              <span className="cm-status-label">Assigned Students</span>
              <span className="cm-status-count">{groupStudents.length}</span>
            </div>
            <span className="cm-status-glow" aria-hidden />
          </div>
        </div>

        <div className="cm-panel">
          <div className="cm-toolbar">
            <div className="cm-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search student name..."
                value={detailSearch}
                onChange={(e) => setDetailSearch(e.target.value)}
              />
              {detailSearch && (
                <button type="button" onClick={() => setDetailSearch('')} style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>STUDENT NAME</th>
                  <th>AGE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroupStudents.length > 0 ? (
                  filteredGroupStudents.map((s, idx) => (
                    <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                      <td style={{ color: 'var(--text-secondary)' }}>{(idx + 1).toString().padStart(2, '0')}</td>
                      <td>
                        <div className="cm-student-cell">
                          <div className="cm-avatar">
                            {s.name.slice(0,2).toUpperCase()}
                          </div>
                          <div className="cm-student-meta">
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{s.name}</span>
                            <span>{s.gender}</span>
                          </div>
                        </div>
                      </td>
                      <td>{s.ageLabel}</td>
                      <td>
                        <span className={`cm-status-pill ${s.status === 'Active' ? 'mint' : 'lavender'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button type="button" className="ui-btn ui-btn-outline" onClick={() => window.open(`/center-management/students/${s.id}`, '_blank')} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                          View Profile
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
                      <Users size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                      <p style={{ margin: 0 }}>No students found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="cm-page cm-page--groups">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, background: toast.type === 'ok' ? '#10b981' : '#ef4444', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <CenterManagementPageHeader
        title="Groups"
        description="Create and manage student and staff groups."
        icon={<Users />}
        actions={
          <button
            type="button"
            onClick={() => {
              setFormName('');
              setAddModalOpen(true);
            }}
            className="ui-btn ui-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} /> Add Group
          </button>
        }
      />

      {topGroups.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 -8px 0' }}>
            Latest Created Groups
          </h3>
          <div className="cm-cards-grid">
            <AnimatePresence>
            {topGroups.map((group, idx) => {
              const count = getStudentCount(group.id);
              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4, boxShadow: '0 8px 22px rgba(93, 95, 239, 0.12)' }}
                  className="cm-status-card"
                  style={{ flexDirection: 'column', alignItems: 'stretch', gap: '16px', padding: '20px', cursor: 'default' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <button type="button" onClick={() => { setSelectedDetailGroup(group); setDetailSearch(''); }} style={{ border: 'none', background: 'none', padding: 0, margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left' }} className="cm-link">
                        {group.name}
                      </button>
                      <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: count > 0 ? 'var(--text-secondary)' : '#94a3b8', fontStyle: count > 0 ? 'normal' : 'italic', fontWeight: count > 0 ? 500 : 400 }}>
                        {count > 0 ? `${count} Student${count > 1 ? 's' : ''}` : 'No students assigned yet'}
                      </p>
                    </div>
                    
                    <div className="group-menu-wrap" style={{ position: 'relative' }}>
                      <button type="button" onClick={() => setActiveMenuId(activeMenuId === group.id ? null : group.id)} className="cm-row-action">
                        <MoreVertical size={16} />
                      </button>
                      <AnimatePresence>
                        {activeMenuId === group.id && (
                          <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 4 }} exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.15 }} style={{ position: 'absolute', top: '100%', right: 0, minWidth: '150px', background: 'var(--color-white)', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0, 0.1)', zIndex: 100, padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <button type="button" onClick={() => { setSelectedDetailGroup(group); setDetailSearch(''); setActiveMenuId(null); }} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left' }} className="hover:bg-slate-50">
                              <Eye size={14} /> View Details
                            </button>
                            <button type="button" onClick={() => { setTargetGroup(group); setFormName(group.name); setActiveMenuId(null); setRenameModalOpen(true); }} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left' }} className="hover:bg-slate-50">
                              <Edit2 size={14} /> Rename
                            </button>
                            <button type="button" onClick={() => { setActiveMenuId(null); setDeleteConfirm({ open: true, ids: [group.id] }); }} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--color-close, #ef4444)', fontWeight: 500, fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left' }} className="hover:bg-red-50">
                              <Trash2 size={14} /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button type="button" onClick={() => openAssignModal(group)} className="ui-btn ui-btn-outline" style={{ padding: '6px 14px', fontSize: '0.82rem', width: 'fit-content' }}>
                      Assign Student
                    </button>
                    <StatusDropdownCell
                      status={group.status || 'Active'}
                      onChange={(next) => handleToggleStatus(group, next)}
                      align="right"
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          </div>
        </div>
      )}

      {/* Table for ALL Groups */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            All Groups{' '}
            <span style={{ background: '#eef2ff', color: '#5d5fef', fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', border: '1px solid #c7d2fe' }}>
              {filteredGroups.length} Total
            </span>
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginLeft: 'auto' }}>
            <div className="cm-search" style={{ minWidth: '220px', minHeight: 'auto', height: '40px' }}>
              <Search size={16} />
              <input type="text" placeholder="Search groups..." value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && (
                <button type="button" onClick={() => setSearch('')} style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <div style={{ width: '160px' }}>
              <AppSelect
                value={sortOrder === 'default' ? 'Default Order' : sortOrder === 'asc' ? 'Ascending Order' : 'Descending Order'}
                onChange={(val) => {
                  if (val === 'Default Order') setSortOrder('default');
                  else if (val === 'Ascending Order') setSortOrder('asc');
                  else setSortOrder('desc');
                  setCurrentPage(1);
                }}
                options={['Default Order', 'Ascending Order', 'Descending Order'].map(v => ({ label: v, value: v }))}
              />
            </div>
          </div>
        </div>

        <div className="cm-panel">
          <div className="cm-toolbar cm-toolbar--groups">
            <span className="cm-toolbar-hint">
              {selected.length
                ? `${selected.length} selected`
                : 'Select groups to bulk delete'}
            </span>
            <button
              type="button"
              className="cm-icon-btn cm-icon-btn--danger"
              title="Delete selected"
              aria-label="Delete selected groups"
              onClick={() => {
                if (!selected.length) {
                  setToast({ type: 'err', message: 'Select groups first' });
                  return;
                }
                setDeleteConfirm({ open: true, ids: selected });
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>
                    <input
                      className="cm-check"
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all groups on this page"
                    />
                  </th>
                  <th>GROUP NAME</th>
                  <th>STUDENTS</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right', paddingRight: '24px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedGroups.length > 0 ? (
                  paginatedGroups.map((group) => {
                    const count = getStudentCount(group.id);
                    const isChecked = selected.includes(group.id);
                    return (
                      <tr key={group.id}>
                        <td>
                          <input
                            className="cm-check"
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelected((prev) =>
                                isChecked
                                  ? prev.filter((id) => id !== group.id)
                                  : [...prev, group.id],
                              );
                            }}
                            aria-label={`Select ${group.name}`}
                          />
                        </td>
                        <td>
                          <button type="button" className="cm-link" onClick={() => { setSelectedDetailGroup(group); setDetailSearch(''); }} style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                            {group.name}
                          </button>
                        </td>
                        <td>
                          <span style={{ color: count > 0 ? 'inherit' : 'var(--text-secondary)', fontStyle: count > 0 ? 'normal' : 'italic', fontWeight: 500 }}>
                            {count > 0 ? `${count} Student${count > 1 ? 's' : ''}` : 'No students assigned yet'}
                          </span>
                        </td>
                        <td>
                          <StatusDropdownCell
                            status={group.status || 'Active'}
                            onChange={(next) => handleToggleStatus(group, next)}
                          />
                        </td>
                        <td style={{ textAlign: 'right', paddingRight: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                            <button type="button" onClick={() => openAssignModal(group)} className="ui-btn ui-btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                              Assign
                            </button>
                            <TableActionMenu
                              onEdit={() => { setTargetGroup(group); setFormName(group.name); setRenameModalOpen(true); }}
                              onDelete={() => setDeleteConfirm({ open: true, ids: [group.id] })}
                              extra={[
                                { id: 'view', label: 'View Details', icon: <Eye size={15} />, onSelect: () => { setSelectedDetailGroup(group); setDetailSearch(''); } }
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
                      No groups found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Footer */}
          {filteredGroups.length > 0 && (
            <div className="cm-pagination">
              <span className="cm-page-info">
                Showing {Math.min(filteredGroups.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredGroups.length, currentPage * pageSize)} of {filteredGroups.length} results
              </span>
              <div className="cm-page-btns">
                <button
                  type="button"
                  className="cm-page-nav"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  ‹
                </button>
                <button type="button" className="cm-page-num is-active">
                  {currentPage}
                </button>
                <button
                  type="button"
                  className="cm-page-nav"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  ›
                </button>
              </div>
              <div className="cm-page-size">
                <AppSelect
                  value={String(pageSize)}
                  onChange={(val) => {
                    setPageSize(Number(val));
                    setCurrentPage(1);
                  }}
                  options={[
                    { label: '10 / page', value: '10' },
                    { label: '30 / page', value: '30' },
                    { label: '50 / page', value: '50' },
                  ]}
                  align="end"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Group">
        <form onSubmit={handleCreateGroup} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Group Name</label>
            <input type="text" placeholder="Enter group name" value={formName} onChange={(e) => setFormName(e.target.value)} className="ui-input" autoFocus required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setAddModalOpen(false)} className="ui-btn ui-btn-outline" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="ui-btn ui-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Rename Modal */}
      <Modal open={renameModalOpen} onClose={() => setRenameModalOpen(false)} title="Rename Group">
        <form onSubmit={handleRenameGroup} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Group Name</label>
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="ui-input" autoFocus required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setRenameModalOpen(false)} className="ui-btn ui-btn-outline" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="ui-btn ui-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal (single + bulk) */}
      <Modal
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, ids: [] })}
        title={deleteConfirm.ids.length > 1 ? 'Delete Groups' : 'Delete Group'}
      >
        <div style={{ padding: '24px' }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            {deleteConfirm.ids.length > 1 ? (
              <>
                Are you sure you want to delete <strong>{deleteConfirm.ids.length} groups</strong>?
              </>
            ) : (
              <>
                Are you sure you want to delete the group{' '}
                <strong>
                  {groups.find((g) => g.id === deleteConfirm.ids[0])?.name ?? 'this group'}
                </strong>
                ?
              </>
            )}
            <br />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Students will be unassigned from{' '}
              {deleteConfirm.ids.length > 1 ? 'these groups' : 'this group'}.
            </span>
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button
              type="button"
              onClick={() => setDeleteConfirm({ open: false, ids: [] })}
              className="ui-btn ui-btn-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="ui-btn"
              style={{ background: 'var(--color-close, #ef4444)', color: '#fff', border: 'none' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Student">
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '65vh', minHeight: '400px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <AppSelect
                value={assignRoomFilter}
                onChange={setAssignRoomFilter}
                options={[
                  { label: 'All Rooms', value: 'All Rooms' },
                  ...rooms.map(r => ({ label: r.name, value: r.name }))
                ]}
              />
            </div>
            <div className="cm-search" style={{ flex: 1, minHeight: 'auto', height: '42px' }}>
              <Search size={16} />
              <input type="text" placeholder="Search By Student Name" value={assignSearch} onChange={(e) => setAssignSearch(e.target.value)} />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
              <input type="checkbox" className="cm-check" checked={allAssignFilteredSelected} onChange={toggleSelectAllAssign} />
              Select all
            </label>
            <div style={{ padding: '4px 12px', background: 'var(--color-accent-soft, #eef2ff)', color: 'var(--color-accent, #5d5fef)', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>
              {selectedStudentIds.length} students selected
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', alignContent: 'start', padding: '4px 0', paddingRight: '8px' }}>
            {assignFilteredStudents.map(student => (
              <label key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s', border: '1px solid var(--border)' }} className="hover:bg-slate-50">
                <input type="checkbox" className="cm-check" checked={selectedStudentIds.includes(student.id)} onChange={() => {
                  setSelectedStudentIds(prev => prev.includes(student.id) ? prev.filter(id => id !== student.id) : [...prev, student.id]);
                }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{student.name}</span>
              </label>
            ))}
            {assignFilteredStudents.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                No students match your filter.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
            <button type="button" onClick={() => setAssignModalOpen(false)} className="ui-btn ui-btn-outline" disabled={isSubmitting}>Cancel</button>
            <button type="button" onClick={handleAssignSubmit} className="ui-btn ui-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
