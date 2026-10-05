'use client';

import Link from 'next/link';
import type { DashboardBundle } from '@/data/dashboard.types';
import { Reveal } from './Reveal';

type Props = {
  data: DashboardBundle;
};

export function UpcomingEventsWidget({ data }: Props) {
  const nextEvent = data.upcomingEvents[0];
  const nextBirthday = data.upcomingBirthdays[0];
  const nextHoliday = data.upcomingHolidays[0];

  return (
    <Reveal as="article" className="dash-widget" delayMs={70}>
      <div className="dash-widgetHead">
        <h3 className="dash-widgetTitle">
          <span className="dash-iconChip" aria-hidden>
            📅
          </span>
          Important Dates
        </h3>
      </div>

      <div className="dash-upcomingStack">
        <div className="dash-upcomingCard dash-upcomingEvent">
          <div className="dash-upcomingCopy">
            <p className="dash-upcomingLabel">Upcoming Event</p>
            {nextEvent ? (
              <>
                <strong>{nextEvent.title}</strong>
                <span className="dash-upcomingMeta">
                  {nextEvent.when} · {nextEvent.room}
                </span>
              </>
            ) : (
              <Link href="/calendar" className="dash-addEventLink">
                Add new event
              </Link>
            )}
          </div>
          <div className="dash-upcomingArt" aria-hidden>
            🎉
          </div>
        </div>

        <div className="dash-upcomingCard dash-upcomingBirthday">
          <div className="dash-upcomingCopy">
            <p className="dash-upcomingLabel">Upcoming Birthday</p>
            {nextBirthday ? (
              <>
                <strong>{nextBirthday.name}</strong>
                <span className="dash-upcomingMeta">
                  {nextBirthday.when} · {nextBirthday.room}
                </span>
              </>
            ) : (
              <strong className="dash-upcomingEmpty">---</strong>
            )}
          </div>
          <div className="dash-upcomingArt" aria-hidden>
            🎂
          </div>
        </div>

        <div className="dash-upcomingCard dash-upcomingHoliday">
          <div className="dash-upcomingCopy">
            <p className="dash-upcomingLabel">Upcoming Holiday</p>
            {nextHoliday ? (
              <>
                <strong>{nextHoliday.title}</strong>
                <span className="dash-upcomingMeta">{nextHoliday.when}</span>
              </>
            ) : (
              <strong className="dash-upcomingEmpty">---</strong>
            )}
          </div>
          <div className="dash-upcomingArt" aria-hidden>
            🏖️
          </div>
        </div>
      </div>
    </Reveal>
  );
}
