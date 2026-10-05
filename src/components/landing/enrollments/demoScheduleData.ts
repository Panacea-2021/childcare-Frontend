export type DemoTimezone = {
  id: string;
  offset: string;
  label: string;
};

export const DEMO_TIMEZONES: DemoTimezone[] = [
  { id: 'asia-kolkata', offset: 'UTC +05:30', label: 'New Delhi, Mumbai, Calcutta' },
  { id: 'asia-dubai', offset: 'UTC +04:00', label: 'Dubai, Abu Dhabi, Muscat' },
  { id: 'asia-singapore', offset: 'UTC +08:00', label: 'Singapore, Kuala Lumpur' },
  { id: 'asia-tokyo', offset: 'UTC +09:00', label: 'Tokyo, Seoul' },
  { id: 'australia-sydney', offset: 'UTC +10:00', label: 'Sydney, Melbourne' },
  { id: 'europe-london', offset: 'UTC +00:00', label: 'London, Dublin' },
  { id: 'europe-berlin', offset: 'UTC +01:00', label: 'Berlin, Paris, Rome' },
  { id: 'europe-moscow', offset: 'UTC +03:00', label: 'Moscow, Istanbul' },
  { id: 'america-new-york', offset: 'UTC -05:00', label: 'New York, Toronto' },
  { id: 'america-chicago', offset: 'UTC -06:00', label: 'Chicago, Mexico City' },
  { id: 'america-denver', offset: 'UTC -07:00', label: 'Denver, Phoenix' },
  { id: 'america-los-angeles', offset: 'UTC -08:00', label: 'Los Angeles, Vancouver' },
  { id: 'pacific-auckland', offset: 'UTC +12:00', label: 'Auckland, Fiji' },
];

export const DEMO_TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
];

export type StoryStat = { value: number; suffix: string; label: string };

export type CustomerStory = {
  id: string;
  slug: string;
  tag: string;
  title: string;
  location: string;
  flag: string;
  features: string[];
  profileTags: string[];
  summary: string;
  tone: 'photo' | 'mint' | 'blush' | 'quote';
  headline: string;
  intro: string;
  quote: string;
  person: string;
  challenges: string;
  solutions: string;
  stats: StoryStat[];
};

export const CUSTOMER_STORIES: CustomerStory[] = [
  {
    id: '1',
    slug: 'bright-beginnings-academy',
    tag: 'Customer spotlight',
    title: 'Bright Beginnings Academy',
    location: 'United States',
    flag: '🇺🇸',
    features: ['Daily Reports', 'Billing', 'Attendance'],
    profileTags: ['Preschool', 'Parent Portal', 'AI Follow-up'],
    summary: 'Filled 18 open seats in one quarter with AI follow-ups that never miss a family.',
    tone: 'photo',
    headline: 'How Bright Beginnings Academy Filled 18 Seats With Smarter Follow-Ups',
    intro:
      'Bright Beginnings Academy needed a calmer way to capture every inquiry and keep tours on the calendar. With Panacea, admissions became a guided journey instead of a spreadsheet scramble.',
    quote:
      'Families feel answered within minutes — and our directors finally trust the waitlist again.',
    person: 'Maya Collins · Enrollment Lead',
    challenges:
      'Leads arrived from Facebook, website forms, and walk-ins with no single owner. Follow-ups depended on who was free that day, so promising families slipped away before a tour was booked.',
    solutions:
      'Panacea’s AI enrollment agent replies instantly, suggests tour slots, and syncs every conversation into one CRM. Billing and attendance stay connected so new enrollments go live without re-entry.',
    stats: [
      { value: 18, suffix: '', label: 'Seats filled in one quarter' },
      { value: 42, suffix: '%', label: 'Faster tour confirmation' },
      { value: 90, suffix: '%', label: 'Inquiries answered same day' },
    ],
  },
  {
    id: '2',
    slug: 'little-oaks-preschool',
    tag: 'Growth story',
    title: 'Little Oaks Preschool',
    location: 'India',
    flag: '🇮🇳',
    features: ['Enrollments', 'Waitlist', 'Tours'],
    profileTags: ['Daycare Center', 'Waitlist', 'Multilingual'],
    summary: 'Tour show rates jumped after automated reminders and multilingual parent chats.',
    tone: 'mint',
    headline: 'How Little Oaks Preschool Lifted Tour Show Rates Across Languages',
    intro:
      'Little Oaks serves families who message in English, Hindi, and regional languages. Panacea helped them respond warmly in every channel without hiring a larger admissions team.',
    quote: 'Our tour calendar went from guesswork to a rhythm parents can rely on.',
    person: 'Ananya Iyer · Center Director',
    challenges:
      'No-shows were common because reminders were manual. Staff toggled between WhatsApp and email while the waitlist lived in a shared sheet.',
    solutions:
      'Automated nurture sequences confirm tours, reschedule politely, and keep waitlisted families warm until a seat opens — all visible to every educator.',
    stats: [
      { value: 35, suffix: '%', label: 'Higher tour show rate' },
      { value: 2, suffix: 'x', label: 'Faster waitlist conversion' },
      { value: 24, suffix: '/7', label: 'AI replies for families' },
    ],
  },
  {
    id: '3',
    slug: 'harbor-kids-network',
    tag: 'Multi-site',
    title: 'Harbor Kids Network',
    location: 'UAE',
    flag: '🇦🇪',
    features: ['Multi-site', 'CRM', 'AI Agent'],
    profileTags: ['Multi-site', 'Enterprise', 'CRM'],
    summary: 'One admissions playbook across six campuses — leads routed to the right center instantly.',
    tone: 'blush',
    headline: 'How Harbor Kids Network Unified Admissions Across Six Campuses',
    intro:
      'Harbor Kids operates six campuses with different age mixes. Panacea gave them one enrollment standard without forcing every location into the same rigid workflow.',
    quote: 'Leads land with the right campus in seconds — directors stop fighting over the inbox.',
    person: 'Omar Al-Hassan · Regional Operations',
    challenges:
      'Central marketing generated strong demand, but routing was manual. Campuses duplicated follow-ups or ignored leads that belonged elsewhere.',
    solutions:
      'Smart routing, shared pipelines, and campus-level dashboards keep multi-site growth visible while each director still owns their room capacity.',
    stats: [
      { value: 6, suffix: '', label: 'Campuses on one playbook' },
      { value: 55, suffix: '%', label: 'Less duplicate follow-up' },
      { value: 3, suffix: 'wks', label: 'Faster time-to-enroll' },
    ],
  },
  {
    id: '4',
    slug: 'sunrise-montessori',
    tag: 'Testimonial',
    title: 'Sunrise Montessori',
    location: 'Singapore',
    flag: '🇸🇬',
    features: ['Parent App', 'Billing'],
    profileTags: ['Montessori', 'Parent App', 'Billing'],
    summary: 'Directors finally see every inquiry in one place — no more spreadsheet chaos.',
    tone: 'quote',
    headline: 'How Sunrise Montessori Turned Waitlists Into a Predictable Engine',
    intro:
      'Sunrise Montessori wanted admissions that felt as intentional as their classrooms. Panacea connected inquiry, tour, and billing so families experience one calm journey.',
    quote: 'Panacea turned our waitlist into a predictable enrollment engine.',
    person: 'Aisha Rahman · Center Director',
    challenges:
      'Paper interest forms piled up. Parents asked the same questions repeatedly, and billing started only after chaotic handoffs.',
    solutions:
      'Digital registration, parent-ready updates, and fee plans that activate when a seat is confirmed keep the whole loop tidy.',
    stats: [
      { value: 70, suffix: '%', label: 'Less admin on inquiries' },
      { value: 4, suffix: 'hrs', label: 'Saved per week' },
      { value: 98, suffix: '%', label: 'Parent portal adoption' },
    ],
  },
  {
    id: '5',
    slug: 'nest-nestle-daycare',
    tag: 'Customer spotlight',
    title: 'Nest & Nestle Daycare',
    location: 'United Kingdom',
    flag: '🇬🇧',
    features: ['Forms', 'Follow-up', 'Reports'],
    profileTags: ['Daycare', 'Website Forms', 'Reports'],
    summary: 'Website forms sync straight into admissions — families feel answered within minutes.',
    tone: 'mint',
    headline: 'How Nest & Nestle Daycare Made Website Leads Instant',
    intro:
      'Their website was generating interest, but forms sat overnight. Panacea closes the gap between “Submit” and a human (or AI) reply.',
    quote: 'Every form now becomes a conversation before the day ends.',
    person: 'Helen Brooks · Owner',
    challenges:
      'Form submissions arrived as email dumps. Nobody knew who replied last, and reporting was a monthly scramble.',
    solutions:
      'Forms feed the enrollment CRM automatically. AI drafts replies, staff approve, and reports show conversion by source.',
    stats: [
      { value: 12, suffix: 'min', label: 'Median first response' },
      { value: 28, suffix: '%', label: 'More form-to-tour' },
      { value: 1, suffix: '', label: 'Source of truth for leads' },
    ],
  },
  {
    id: '6',
    slug: 'cedar-ridge-childcare',
    tag: 'Growth story',
    title: 'Cedar Ridge Childcare',
    location: 'Canada',
    flag: '🇨🇦',
    features: ['Attendance', 'Ratio', 'Billing'],
    profileTags: ['Childcare', 'Attendance', 'Ratio'],
    summary: 'Enrollment and occupancy planning now live in the same calm dashboard.',
    tone: 'photo',
    headline: 'How Cedar Ridge Aligned Enrollment With Live Occupancy',
    intro:
      'Cedar Ridge struggled to promise seats without knowing next week’s ratios. Panacea tied admissions forecasts to attendance and billing.',
    quote: 'We enroll with confidence because occupancy is finally honest.',
    person: 'Jordan Lee · Operations Manager',
    challenges:
      'Admissions offered seats that classrooms could not staff. Billing lagged when children started mid-cycle.',
    solutions:
      'Forecast views, ratio-aware capacity, and fee plans that activate on start date keep growth sustainable.',
    stats: [
      { value: 22, suffix: '%', label: 'Better seat utilization' },
      { value: 0, suffix: '', label: 'Over-promised classrooms' },
      { value: 15, suffix: '%', label: 'Faster billing start' },
    ],
  },
];

export function getCustomerStory(slug: string): CustomerStory | undefined {
  return CUSTOMER_STORIES.find((s) => s.slug === slug);
}

export function relatedStories(slug: string, limit = 3): CustomerStory[] {
  return CUSTOMER_STORIES.filter((s) => s.slug !== slug).slice(0, limit);
}
