'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { DashboardBundle } from '@/data/dashboard.types';
import { Reveal } from './Reveal';

type Props = {
  data: DashboardBundle;
};

export function TodaySummaryWidget({ data }: Props) {
  const s = data.todaySummary;
  const items = [
    { label: 'Check-ins', value: s.checkIns },
    { label: 'Check-outs', value: s.checkOuts },
    { label: 'Posts', value: s.posts },
    { label: 'Messages', value: s.messages },
  ];

  return (
    <Reveal as="article" className="dash-widget" delayMs={30}>
      <div className="dash-widgetHead">
        <h3 className="dash-widgetTitle">
          <span className="dash-iconChip" aria-hidden>
            ⚡
          </span>
          Today&apos;s summary
        </h3>
        <span className="dash-chip">{s.utilization}% util.</span>
      </div>
      <div className="dash-todayGrid">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            className="dash-todayCell"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 * i }}
          >
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </motion.div>
        ))}
      </div>
      <div className="dash-progressTrack dash-utilTrack" aria-label={`Utilization ${s.utilization}%`}>
        <motion.div
          className="dash-progressFill"
          initial={{ width: 0 }}
          whileInView={{ width: `${s.utilization}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </Reveal>
  );
}

export function QuickActionsWidget({ data }: Props) {
  return (
    <Reveal as="article" className="dash-widget" delayMs={45}>
      <div className="dash-widgetHead">
        <h3 className="dash-widgetTitle">
          <span className="dash-iconChip" aria-hidden>
            🚀
          </span>
          Quick actions
        </h3>
      </div>
      <div className="dash-quickGrid">
        {data.quickActions.map((action) => (
          <Link key={action.id} href={action.href} className="dash-quickAction">
            <strong>{action.title}</strong>
            <span>{action.description}</span>
          </Link>
        ))}
      </div>
    </Reveal>
  );
}

export function WeeklyAttendanceWidget({ data }: Props) {
  const max = Math.max(...data.weeklyAttendance.map((d) => d.present + d.absent), 1);

  return (
    <Reveal as="article" className="dash-widget" delayMs={55}>
      <div className="dash-widgetHead">
        <h3 className="dash-widgetTitle">
          <span className="dash-iconChip" aria-hidden>
            📈
          </span>
          Weekly attendance
        </h3>
      </div>
      <div className="dash-weekChart" role="img" aria-label="Weekly attendance chart">
        {data.weeklyAttendance.map((d) => (
          <div key={d.day} className="dash-weekCol">
            <div className="dash-weekStack">
              <motion.div
                className="dash-weekAbsent"
                initial={{ height: 0 }}
                whileInView={{ height: `${(d.absent / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.65 }}
              />
              <motion.div
                className="dash-weekPresent"
                initial={{ height: 0 }}
                whileInView={{ height: `${(d.present / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.75, delay: 0.05 }}
              />
            </div>
            <span>{d.day}</span>
          </div>
        ))}
      </div>
      <div className="dash-weekLegend">
        <span>
          <i className="dash-dotPresent" /> Present
        </span>
        <span>
          <i className="dash-dotAbsent" /> Absent
        </span>
      </div>
    </Reveal>
  );
}

export function RecentActivityWidget({ data }: Props) {
  return (
    <Reveal as="article" className="dash-widget" delayMs={70}>
      <div className="dash-widgetHead">
        <h3 className="dash-widgetTitle">
          <span className="dash-iconChip" aria-hidden>
            🕒
          </span>
          Recent activity
        </h3>
      </div>
      <ul className="dash-timeline">
        {data.recentActivities.map((item) => (
          <li key={item.id} className={`dash-timelineItem dash-tone-${item.tone}`}>
            <span className="dash-timelineDot" aria-hidden />
            <div>
              <strong>{item.title}</strong>
              <p>{item.meta}</p>
            </div>
            <time>{item.time}</time>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export function FeedWidgets({ data }: Props) {
  return (
    <div className="dash-widgetGrid dash-widgetGridBottom">
      <Reveal as="article" className="dash-widget" delayMs={80}>
        <div className="dash-widgetHead">
          <h3 className="dash-widgetTitle">
            <span className="dash-iconChip" aria-hidden>
              🔔
            </span>
            Notifications
          </h3>
        </div>
        <ul className="dash-feedList">
          {data.notifications.map((n) => (
            <li key={n.id} className={n.unread ? 'dash-feedUnread' : ''}>
              <strong>{n.title}</strong>
              <span>{n.when}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal as="article" className="dash-widget" delayMs={95}>
        <div className="dash-widgetHead">
          <h3 className="dash-widgetTitle">
            <span className="dash-iconChip" aria-hidden>
              📣
            </span>
            Announcements
          </h3>
        </div>
        <ul className="dash-feedList">
          {data.announcements.map((a) => (
            <li key={a.id}>
              <strong>{a.title}</strong>
              <p>{a.body}</p>
              <span>{a.when}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}

export function DatesFeedWidget({ data }: Props) {
  return (
    <Reveal as="article" className="dash-widget dash-widgetWide" delayMs={100}>
      <div className="dash-widgetHead">
        <h3 className="dash-widgetTitle">
          <span className="dash-iconChip" aria-hidden>
            🗓️
          </span>
          Calendar highlights
        </h3>
      </div>
      <div className="dash-datesTriple">
        <div>
          <h4>Birthdays</h4>
          <ul>
            {data.upcomingBirthdays.map((b) => (
              <li key={`${b.name}-${b.room}-${b.when}`}>
                <strong>{b.name}</strong>
                <span>
                  {b.when} · {b.room}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Events</h4>
          <ul>
            {data.upcomingEvents.map((e) => (
              <li key={`${e.title}-${e.room}-${e.when}`}>
                <strong>{e.title}</strong>
                <span>
                  {e.when} · {e.room}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Holidays</h4>
          <ul>
            {data.upcomingHolidays.map((h) => (
              <li key={`${h.title}-${h.when}`}>
                <strong>{h.title}</strong>
                <span>{h.when}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}
