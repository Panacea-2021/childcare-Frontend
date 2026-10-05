import type {
  ConcernStatus,
  ConcernTimelineEvent,
  ParentConcern,
} from '@/types/concern';

const STATUS_ORDER: ConcernStatus[] = ['Open', 'In Progress', 'Resolved'];

const STATUS_LABELS: Record<ConcernStatus, string> = {
  Open: 'Case opened',
  'In Progress': 'In progress',
  Resolved: 'Resolved',
};

function formatStamp(date = new Date()) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function indexForStatus(status: ConcernStatus): number {
  return STATUS_ORDER.indexOf(status);
}

/** Timeline shows only Open → In Progress → Resolved from the live status. */
export function buildTimelineForStatus(
  status: ConcernStatus,
  previous?: ConcernTimelineEvent[],
  openedAt?: string,
): ConcernTimelineEvent[] {
  const completeThrough = indexForStatus(status);
  const now = formatStamp();

  return STATUS_ORDER.map((step, index) => {
    const prior = previous?.find((e) => e.step === step);
    const completed = index <= completeThrough;
    let at = prior?.at;

    if (completed && !at) {
      at = index === 0 ? (openedAt ?? now) : now;
    }
    if (!completed) at = undefined;

    return {
      step,
      label: STATUS_LABELS[step],
      completed,
      at,
    };
  });
}

export function applyConcernStatus(
  concern: ParentConcern,
  status: ConcernStatus,
): ParentConcern {
  const openedAt =
    concern.timeline.find((e) => e.step === 'Open')?.at ??
    `${concern.date} · ${concern.time}`;

  return {
    ...concern,
    status,
    timeline: buildTimelineForStatus(status, concern.timeline, openedAt),
  };
}
