'use client';

import { motion } from 'framer-motion';
import { Filter, Users } from 'lucide-react';
import { DateRangePicker } from './DateRangePicker';
import type { ScheduleStaff } from './types';
import { scheduleRooms } from './mockData';

type Props = {
  weekStart: Date;
  onWeekChange: (next: Date) => void;
  staffId: string;
  roomId: string;
  staff: ScheduleStaff[];
  onStaffChange: (id: string) => void;
  onRoomChange: (id: string) => void;
};

export function FilterToolbar({
  weekStart,
  onWeekChange,
  staffId,
  roomId,
  staff,
  onStaffChange,
  onRoomChange,
}: Props) {
  return (
    <motion.section
      className="cal-filter-card"
      aria-label="Schedule filters"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06, duration: 0.38 }}
    >
      <div className="cal-filter-field cal-filter-span">
        <label htmlFor="cal-date-range">
          <Filter size={12} aria-hidden />
          Select date range
        </label>
        <DateRangePicker weekStart={weekStart} onWeekChange={onWeekChange} />
      </div>

      <div className="cal-filter-field">
        <label htmlFor="cal-staff-filter">
          <Users size={12} aria-hidden />
          Filter by staff
        </label>
        <select
          id="cal-staff-filter"
          className="cal-select"
          value={staffId}
          onChange={(e) => onStaffChange(e.target.value)}
        >
          <option value="all">All Staff</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="cal-filter-field">
        <label htmlFor="cal-room-filter">
          <Filter size={12} aria-hidden />
          Filter by classroom
        </label>
        <select
          id="cal-room-filter"
          className="cal-select"
          value={roomId}
          onChange={(e) => onRoomChange(e.target.value)}
        >
          <option value="all">All Rooms</option>
          {scheduleRooms.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
    </motion.section>
  );
}
