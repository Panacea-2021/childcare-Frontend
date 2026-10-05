'use client';

import { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { CalendarHeader } from './CalendarHeader';
import { FilterToolbar } from './FilterToolbar';
import { ShiftLegend } from './ShiftLegend';
import { ScheduleBoard } from './ScheduleBoard';
import type { ScheduleFormState, ScheduleShift } from './types';
import {
  addDays,
  parseISODate,
  scheduleStaff,
  seedShifts,
  startOfWeek,
  toISODate,
} from './mockData';
import './calendar.css';
import '@/components/ui/module.css';

const ScheduleModal = dynamic(
  () => import('./ScheduleModal').then((m) => m.ScheduleModal),
  { ssr: false },
);

const ShiftDetailModal = dynamic(
  () => import('./ShiftDetailModal').then((m) => m.ShiftDetailModal),
  { ssr: false },
);

function expandFormToShifts(form: ScheduleFormState): ScheduleShift[] {
  if (!form.shiftType || !form.status || !form.startDate || !form.endDate) return [];
  const start = parseISODate(form.startDate);
  const end = parseISODate(form.endDate);
  const dayMap: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  const wanted = new Set(form.daysOfWeek.map((d) => dayMap[d]));
  const out: ScheduleShift[] = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    if (!wanted.has(d.getDay())) continue;
    out.push({
      id: `local-${Date.now()}-${toISODate(d)}-${Math.random().toString(36).slice(2, 7)}`,
      staffId: form.staffId,
      date: toISODate(d),
      shiftType: form.shiftType,
      title: form.title.trim(),
      startTime: form.startTime,
      endTime: form.endTime,
      room: form.room,
      lesson: form.lesson || 'General Duty',
      category: form.category || 'Classroom',
      status: form.status,
      notes: form.notes,
    });
  }
  return out;
}

function applyFormToShift(existing: ScheduleShift, form: ScheduleFormState): ScheduleShift {
  return {
    ...existing,
    staffId: form.staffId || existing.staffId,
    date: form.startDate || existing.date,
    shiftType: form.shiftType || existing.shiftType,
    title: form.title.trim() || existing.title,
    startTime: form.startTime || existing.startTime,
    endTime: form.endTime || existing.endTime,
    room: form.room || existing.room,
    lesson: form.lesson || existing.lesson,
    category: form.category || existing.category,
    status: form.status || existing.status,
    notes: form.notes,
  };
}

export function StaffSchedulePage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(2026, 6, 19)));
  const [staffFilter, setStaffFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [shifts, setShifts] = useState<ScheduleShift[]>(seedShifts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ScheduleShift | null>(null);
  const [detailShift, setDetailShift] = useState<ScheduleShift | null>(null);

  const weekEndIso = toISODate(addDays(weekStart, 6));
  const weekStartIso = toISODate(weekStart);

  const weekShifts = useMemo(() => {
    return shifts.filter((s) => {
      if (s.date < weekStartIso || s.date > weekEndIso) return false;
      if (staffFilter !== 'all' && s.staffId !== staffFilter) return false;
      if (roomFilter !== 'all' && s.room !== roomFilter) return false;
      return true;
    });
  }, [shifts, weekStartIso, weekEndIso, staffFilter, roomFilter]);

  const visibleStaff = useMemo(() => {
    let list = scheduleStaff;
    if (staffFilter !== 'all') list = list.filter((s) => s.id === staffFilter);
    if (roomFilter !== 'all') {
      const ids = new Set(weekShifts.map((s) => s.staffId));
      if (ids.size) list = list.filter((s) => ids.has(s.id) || staffFilter === s.id);
      else if (staffFilter === 'all') {
        /* show all staff so empty cells remain usable */
      }
    }
    return list;
  }, [staffFilter, roomFilter, weekShifts]);

  const onExport = useCallback(() => {
    const rows = [
      ['Staff', 'Date', 'Shift', 'Start', 'End', 'Room', 'Lesson', 'Status'],
      ...weekShifts.map((s) => {
        const person = scheduleStaff.find((p) => p.id === s.staffId);
        return [person?.name ?? s.staffId, s.date, s.title, s.startTime, s.endTime, s.room, s.lesson, s.status];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-schedule-${weekStartIso}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [weekShifts, weekStartIso]);

  const openAdd = useCallback(() => {
    setEditingShift(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((shift: ScheduleShift) => {
    setDetailShift(null);
    setEditingShift(shift);
    setModalOpen(true);
  }, []);

  const onSave = useCallback(async (form: ScheduleFormState, editingId?: string) => {
    if (editingId) {
      setShifts((prev) =>
        prev.map((s) => (s.id === editingId ? applyFormToShift(s, form) : s)),
      );
      return;
    }
    const created = expandFormToShifts(form);
    if (!created.length) return;
    setShifts((prev) => [...prev, ...created]);
  }, []);

  const onDelete = useCallback((shiftId: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
    setDetailShift(null);
  }, []);

  const showEmptyBanner = weekShifts.length === 0;

  return (
    <div className="mod-page cal-page">
      <div className="cal-ambient" aria-hidden>
        <span className="cal-blob b1" />
        <span className="cal-blob b2" />
        <span className="cal-blob b3" />
        <span className="cal-mesh" />
      </div>
      <div className="cal-page-inner">
        <CalendarHeader onExport={onExport} onAdd={openAdd} />
        <FilterToolbar
          weekStart={weekStart}
          onWeekChange={setWeekStart}
          staffId={staffFilter}
          roomId={roomFilter}
          staff={scheduleStaff}
          onStaffChange={setStaffFilter}
          onRoomChange={setRoomFilter}
        />
        <ShiftLegend />

        {showEmptyBanner ? (
          <motion.div
            className="cal-board cal-empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="cal-empty-art" aria-hidden>
              <CalendarDays size={36} />
            </div>
            <h3>Nothing scheduled yet</h3>
            <p>No shifts match this week and filters. Add a schedule or clear filters to continue.</p>
            <button type="button" className="cal-btn-add" onClick={openAdd}>
              Add Schedule
            </button>
          </motion.div>
        ) : (
          <ScheduleBoard
            weekStart={weekStart}
            staff={visibleStaff}
            shifts={weekShifts}
            onWeekChange={setWeekStart}
            onShiftClick={setDetailShift}
          />
        )}

        <ShiftDetailModal
          open={Boolean(detailShift)}
          shift={detailShift}
          staff={scheduleStaff}
          onClose={() => setDetailShift(null)}
          onEdit={openEdit}
          onDelete={onDelete}
        />

        <ScheduleModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingShift(null);
          }}
          staff={scheduleStaff}
          initialDate={weekStartIso}
          editingShift={editingShift}
          onSave={onSave}
        />
      </div>
    </div>
  );
}
