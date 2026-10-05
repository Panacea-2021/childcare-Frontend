'use client';

import Link from 'next/link';
import type { AttendanceScope, AttendanceSnapshot } from './types';
import { LiveRatioRing } from './LiveRatioRing';
import { Reveal } from './Reveal';

type Props = {
  scope: AttendanceScope;
  onScopeChange: (scope: AttendanceScope) => void;
  data: AttendanceSnapshot;
};

export function AttendanceOverview({ scope, onScopeChange, data }: Props) {
  return (
    <Reveal as="section" className="dash-attendanceCard" delayMs={40}>
      <div className="dash-attendanceHead">
        <h2>
          <span className="dash-iconChip" aria-hidden>
            🗓️
          </span>
          Attendance
        </h2>
        <div className="dash-toggle" role="group" aria-label="Attendance scope">
          <button
            type="button"
            className={scope === 'center' ? 'dash-toggleActive' : ''}
            aria-pressed={scope === 'center'}
            onClick={() => onScopeChange('center')}
          >
            Center
          </button>
          <button
            type="button"
            className={scope === 'class' ? 'dash-toggleActive' : ''}
            aria-pressed={scope === 'class'}
            onClick={() => onScopeChange('class')}
          >
            Class
          </button>
        </div>
      </div>

      <div className="dash-attendanceBody">
        <div className="dash-leaveCol">
          <Link href="/attendance-leaves" className="dash-leaveLink">
            <b className="dash-greenText">{data.studentLeave}</b>
            <span>Students on leave today</span>
          </Link>
          <div className="dash-leaveDivider" />
          <Link href="/attendance-leaves" className="dash-leaveLink">
            <b className="dash-orangeText">{data.staffLeave}</b>
            <span>Staff on leave today</span>
          </Link>
          <div className="dash-leaveDivider" />
          <Link href="/attendance-leaves" className="dash-leaveLink">
            <b className="dash-redText">{data.absentFrom3Days}</b>
            <span>Students absent from 3 days</span>
          </Link>
        </div>

        <div className="dash-statusPanel">
          <div className="dash-statusGrid" role="table" aria-label="Attendance status">
            <div className="dash-statusHead" />
            <div className="dash-statusColHead">In</div>
            <div className="dash-statusColHead">Out</div>
            <div className="dash-statusColHead">Absent</div>
            <div className="dash-statusColHead">Pending</div>

            <div className="dash-rowLabel">Students</div>
            <div className="dash-statusCell dash-greenText">{data.students.in}</div>
            <div className="dash-statusCell dash-orangeText">{data.students.out}</div>
            <div className="dash-statusCell dash-redText">{data.students.absent}</div>
            <div className="dash-statusCell dash-blueText">{data.students.pending}</div>

            <div className="dash-statusRowDivider" />

            <div className="dash-rowLabel">Staff</div>
            <div className="dash-statusCell dash-greenText">{data.staff.in}</div>
            <div className="dash-statusCell dash-orangeText">{data.staff.out}</div>
            <div className="dash-statusCell dash-redText">{data.staff.absent}</div>
            <div className="dash-statusCell dash-blueText">{data.staff.pending}</div>
          </div>
        </div>

        <div className="dash-ratioPanel">
          <h3>Live Ratio</h3>
          <LiveRatioRing student={data.students.in} staff={data.staff.in} />
          <div className="dash-ratioCounts">
            <span>
              Student <b className="dash-greenText">{data.students.in}</b>
            </span>
            <span>
              Staff <b className="dash-orangeText">{data.staff.in}</b>
            </span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
