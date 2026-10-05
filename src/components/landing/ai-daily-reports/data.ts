export const ADR_VIDEO = {
  poster: '/images/parent-communication/classroom.jpg',
  embedSrc: 'https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1&rel=0',
  overlayTitle: 'How Panacea is Transforming Childcare Centers with the Power of AI.',
  watchLabel: 'Watch on YouTube',
  captionName: 'Emma',
  captionMeta: 'Room B',
} as const;

export const ADR_STEPS = [
  {
    id: 'snap',
    title: 'Snap a few photos',
    badge: 'Photo starts here ✨',
    image: '/images/parent-communication/activity.jpg',
    alt: 'Educator capturing classroom moments on a phone',
  },
  {
    id: 'ai',
    title: 'AI writes report',
    badge: 'Our AI does the rest 🪄',
    image: '/images/parent-communication/learning.jpg',
    alt: 'AI generating a daily report on a phone',
  },
  {
    id: 'send',
    title: 'Parent smiles',
    badge: 'One click to send ❤️',
    image: '/images/parent-communication/teacher.jpg',
    alt: 'Parent smiling while reading a daily report',
  },
] as const;

export const ADR_AI_PHASES = [
  'Analyzing photos...',
  'Generating report...',
  'Daily Report Ready',
] as const;

export const ADR_STATS = [
  {
    value: 10,
    prefix: '',
    suffix: '+',
    unit: 'hours',
    label: 'reclaimed weekly for teaching.',
  },
  {
    value: 500,
    prefix: '',
    suffix: '+',
    unit: 'educators',
    label: 'rely on AI for daily reporting.',
  },
  {
    value: 3,
    prefix: '',
    suffix: 'x',
    unit: 'faster',
    label: 'end-of-day reporting.',
  },
] as const;
