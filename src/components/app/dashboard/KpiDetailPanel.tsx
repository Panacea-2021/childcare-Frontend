'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { DashboardBundle, KpiPanelId } from '@/data/dashboard.types';

type Props = {
  active: KpiPanelId | null;
  data: DashboardBundle;
  onClose: () => void;
};

const titles: Record<KpiPanelId, string> = {
  rooms: 'Rooms overview',
  staff: 'Staff overview',
  students: 'Students overview',
  ratio: 'Student / Staff ratio',
};

export function KpiDetailPanel({ active, data, onClose }: Props) {
  return (
    <AnimatePresence mode="wait">
      {active ? (
        <motion.section
          key={active}
          className="dash-kpiPanel"
          initial={{ opacity: 0, height: 0, y: -8 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -6 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          aria-label={titles[active]}
        >
          <div className="dash-kpiPanelInner">
            <div className="dash-kpiPanelHead">
              <div>
                <p className="dash-kpiPanelEyebrow">In-dashboard detail</p>
                <h3>{titles[active]}</h3>
              </div>
              <button type="button" className="ui-btn ui-btn-outline dash-kpiPanelClose" onClick={onClose}>
                Close
              </button>
            </div>

            {active === 'rooms' ? <RoomsPanel data={data} /> : null}
            {active === 'staff' ? <StaffPanel data={data} /> : null}
            {active === 'students' ? <StudentsPanel data={data} /> : null}
            {active === 'ratio' ? <RatioPanel data={data} /> : null}
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}

function RoomsPanel({ data }: { data: DashboardBundle }) {
  const avg =
    Math.round(data.rooms.reduce((sum, r) => sum + r.occupancyPct, 0) / Math.max(data.rooms.length, 1));

  return (
    <div className="dash-panelBody">
      <div className="dash-panelStats">
        <div className="dash-panelStat">
          <strong>{data.rooms.length}</strong>
          <span>Active rooms</span>
        </div>
        <div className="dash-panelStat">
          <strong>{avg}%</strong>
          <span>Avg occupancy</span>
        </div>
        <div className="dash-panelStat">
          <strong>{data.rooms.reduce((s, r) => s + r.students, 0)}</strong>
          <span>Children placed</span>
        </div>
        <div className="dash-panelStat">
          <strong>{data.rooms.reduce((s, r) => s + r.staff, 0)}</strong>
          <span>Staff assigned</span>
        </div>
      </div>

      <div className="dash-roomGrid">
        {data.rooms.map((room, i) => (
          <motion.article
            key={room.id}
            className={`dash-roomCard dash-room-${room.status}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
          >
            <div className="dash-roomCardTop">
              <h4>{room.name}</h4>
              <span className={`dash-statusChip dash-status-${room.status}`}>{room.status}</span>
            </div>
            <div className="dash-roomMeta">
              <span>{room.students} Students</span>
              <span>{room.staff} Staff</span>
            </div>
            <div className="dash-progressTrack" aria-hidden>
              <div className="dash-progressFill" style={{ width: `${room.occupancyPct}%` }} />
            </div>
            <div className="dash-roomFooter">
              <span>Capacity: {room.capacity}</span>
              <span>Age: {room.ageRange}</span>
              <strong>{room.occupancyPct}%</strong>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function StaffPanel({ data }: { data: DashboardBundle }) {
  return (
    <div className="dash-panelBody">
      <div className="dash-panelStats">
        <div className="dash-panelStat">
          <strong>{data.staff.length}</strong>
          <span>Listed staff</span>
        </div>
        <div className="dash-panelStat">
          <strong>{data.staff.filter((s) => s.status === 'Active').length}</strong>
          <span>Active today</span>
        </div>
        <div className="dash-panelStat">
          <strong>{data.staff.filter((s) => s.status === 'On Leave').length}</strong>
          <span>On leave</span>
        </div>
        <div className="dash-panelStat">
          <strong>{data.attendance.center.staff.pending}</strong>
          <span>Pending check-in</span>
        </div>
      </div>

      <div className="dash-tableWrap">
        <table className="ui-table dash-inlineTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Room</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.staff.map((person) => (
              <tr key={person.id}>
                <td>
                  <div className="dash-personCell">
                    <span className="dash-avatar">{person.initials}</span>
                    <strong>{person.name}</strong>
                  </div>
                </td>
                <td>{person.role}</td>
                <td>{person.room}</td>
                <td>
                  <span className={`dash-statusChip dash-status-${person.status === 'Active' ? 'active' : person.status === 'On Leave' ? 'quiet' : 'full'}`}>
                    {person.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentsPanel({ data }: { data: DashboardBundle }) {
  const maxAge = Math.max(...data.ageGroups.map((g) => g.count), 1);

  return (
    <div className="dash-panelBody">
      <div className="dash-panelStats">
        <div className="dash-panelStat">
          <strong>{data.kpis.find((k) => k.id === 'students')?.value}</strong>
          <span>Enrolled</span>
        </div>
        <div className="dash-panelStat">
          <strong>{data.attendance.center.students.in}</strong>
          <span>In today</span>
        </div>
        <div className="dash-panelStat">
          <strong>{data.attendance.center.students.pending}</strong>
          <span>Pending</span>
        </div>
        <div className="dash-panelStat">
          <strong>{data.attendance.center.studentLeave}</strong>
          <span>On leave</span>
        </div>
      </div>

      <div className="dash-splitPanels">
        <div className="dash-miniCard">
          <h4>Age distribution</h4>
          <div className="dash-ageBars">
            {data.ageGroups.map((g) => (
              <div key={g.label} className="dash-ageRow">
                <span>{g.label}</span>
                <div className="dash-ageTrack">
                  <motion.div
                    className="dash-ageFill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(g.count / maxAge) * 100}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <b>{g.count}</b>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-tableWrap dash-miniCard">
          <h4>Sample roster</h4>
          <table className="ui-table dash-inlineTable">
            <thead>
              <tr>
                <th>Student</th>
                <th>Age</th>
                <th>Room</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="dash-personCell">
                      <span className="dash-avatar">{s.initials}</span>
                      <strong>{s.name}</strong>
                    </div>
                  </td>
                  <td>{s.age}</td>
                  <td>{s.room}</td>
                  <td>
                    <span className={`dash-statusChip dash-status-${s.status === 'Active' ? 'active' : s.status === 'On Leave' ? 'quiet' : 'full'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RatioPanel({ data }: { data: DashboardBundle }) {
  const insight = data.ratioInsights;

  return (
    <div className="dash-panelBody">
      <div className="dash-panelStats">
        <div className="dash-panelStat">
          <strong>{insight.current}</strong>
          <span>Current ratio</span>
        </div>
        <div className="dash-panelStat">
          <strong>{insight.target}</strong>
          <span>Target</span>
        </div>
        <div className="dash-panelStat">
          <strong>{insight.compliantRooms}</strong>
          <span>Compliant rooms</span>
        </div>
        <div className="dash-panelStat">
          <strong>{insight.watchRooms}</strong>
          <span>Needs attention</span>
        </div>
      </div>

      <div className="dash-tableWrap">
        <table className="ui-table dash-inlineTable">
          <thead>
            <tr>
              <th>Room</th>
              <th>Live ratio</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {insight.byRoom.map((row) => (
              <tr key={row.room}>
                <td>{row.room}</td>
                <td>
                  <strong>{row.ratio}</strong>
                </td>
                <td>
                  <span className={`dash-statusChip dash-status-${row.status === 'ok' ? 'active' : 'quiet'}`}>
                    {row.status === 'ok' ? 'Compliant' : 'Watch'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
