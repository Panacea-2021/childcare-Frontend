'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { CalendarsView } from '@/components/modules/tour-management/CalendarsView';
import { SAMPLE_CALENDARS } from '@/components/modules/tour-management/calendarDefaults';
import type { TourCalendarConfig } from '@/components/modules/tour-management/calendarTypes';
import { TOUR_BASE } from '@/lib/appointments/types';
import '@/components/ui/module.css';
import '@/components/modules/tour-management.css';
import '@/components/modules/appointments/appointments.css';

const KEY = 'panacea.tourManagement.v2';

export default function TourCalendarsPage() {
  const router = useRouter();
  const [calendars, setCalendars] = useState<TourCalendarConfig[]>(SAMPLE_CALENDARS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { calendars?: TourCalendarConfig[] };
      if (parsed.calendars?.length) setCalendars(parsed.calendars);
    } catch {
      /* ignore */
    }
  }, []);

  const onChange = (next: TourCalendarConfig[]) => {
    setCalendars(next);
    try {
      const raw = localStorage.getItem(KEY);
      const prev = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      localStorage.setItem(KEY, JSON.stringify({ ...prev, calendars: next }));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mod-page appt-page">
      <PageHeader
        title="Calendar Settings"
        description="Configure booking calendars, availability and public forms"
        crumbs={['Panacea', 'Enquiries', 'Tour', 'Calendars']}
        actions={
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={() => router.push(TOUR_BASE)}
          >
            <ArrowLeft size={15} />
            Back to Tour
          </button>
        }
      />
      <div className="appt-panel" style={{ padding: 16 }}>
        <CalendarsView calendars={calendars} onChange={onChange} />
      </div>
    </div>
  );
}
