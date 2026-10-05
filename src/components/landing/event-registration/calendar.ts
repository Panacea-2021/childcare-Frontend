import type { WebinarEvent } from './data';

function toGoogleDate(iso: string): string {
  const d = new Date(iso);
  return d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

export function buildGoogleCalendarUrl(event: WebinarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toGoogleDate(event.startDateTime)}/${toGoogleDate(event.endDateTime)}`,
    details: `${event.description}${
      event.confirmation.joinLink ? `\n\nJoin: ${event.confirmation.joinLink}` : ''
    }`,
    location: event.locationLabel,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildOutlookCalendarUrl(event: WebinarEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: new Date(event.startDateTime).toISOString(),
    enddt: new Date(event.endDateTime).toISOString(),
    body: `${event.description}${
      event.confirmation.joinLink ? `\n\nJoin: ${event.confirmation.joinLink}` : ''
    }`,
    location: event.locationLabel,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function formatIcsDate(iso: string): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

export function downloadIcs(event: WebinarEvent): void {
  const uid = `${event.id}@panacea.events`;
  const stamp = formatIcsDate(new Date().toISOString());
  const desc = [
    event.description,
    event.confirmation.joinLink ? `Join: ${event.confirmation.joinLink}` : '',
  ]
    .filter(Boolean)
    .join('\\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Panacea//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${formatIcsDate(event.startDateTime)}`,
    `DTEND:${formatIcsDate(event.endDateTime)}`,
    `SUMMARY:${event.title.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${desc.replace(/,/g, '\\,')}`,
    `LOCATION:${event.locationLabel.replace(/,/g, '\\,')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.slug}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatEventWhen(
  startIso: string,
  endIso: string,
  timeZone: string,
): { dateLine: string; timeLine: string } {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dateLine = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone,
  }).format(start);

  const timeFmt = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short',
  });
  const startPart = timeFmt.format(start);
  const endPart = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(end);
  const tzName = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  })
    .formatToParts(start)
    .find((p) => p.type === 'timeZoneName')?.value;

  return {
    dateLine,
    timeLine: `${startPart.replace(` ${tzName}`, '')} – ${endPart}${tzName ? ` ${tzName}` : ''}`,
  };
}

export function detectBrowserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}
