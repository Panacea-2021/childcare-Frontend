export const PC_TRUST = [
  { label: 'Preschool', hint: 'Daily moments shared' },
  { label: 'Daycare', hint: 'Live family updates' },
  { label: 'Montessori', hint: 'Progress with care' },
  { label: 'Early Learning', hint: 'Clear daily reports' },
  { label: 'Kindergarten', hint: 'Stronger parent trust' },
] as const;

export const PC_REALTIME_POINTS = [
  {
    title: 'Real-Time Updates',
    detail: 'Share important moments and classroom updates the moment they happen.',
  },
  {
    title: 'In-App Messaging',
    detail: 'Keep parent and staff conversations organized in one secure thread.',
  },
  {
    title: 'Daily Reports',
    detail: 'Give families a clear picture of meals, naps, activities, and mood.',
  },
  {
    title: 'Personalized Communication',
    detail: 'Make every message feel relevant to the child and the family.',
  },
] as const;

export const PC_SAFETY_POINTS = [
  {
    title: 'Authorized Pick-ups',
    detail:
      'QR based check-ins and check-outs with secure, verified access for trusted individuals.',
  },
  {
    title: 'Allergy and Medical Records',
    detail: 'Track key health information, including allergies and medications, for every child.',
  },
  {
    title: 'Parental Consent Controls',
    detail: 'Ensure parental consent for photo tagging and other essential actions.',
  },
  {
    title: 'An App for Parents to Communicate',
    detail: 'Allow parents to share notes, concerns, and messages with teachers in one place.',
  },
] as const;

export const PC_SAFETY_FLOATS = [
  { id: 'radius', tone: 'blue', title: '500 meter radius of nursery', detail: null },
  { id: 'allergy', tone: 'blush', title: 'Allergy Note', detail: 'Allergy to Peanuts and Egg' },
  {
    id: 'med',
    tone: 'gold',
    title: 'Medication Note',
    detail: 'Scheduled reminder at 1:00 PM',
  },
  {
    id: 'checkin',
    tone: 'orange',
    title: 'Checked in by Grandmom',
    detail: 'Student was checked in at 8:00 AM',
  },
] as const;

export const PC_ENGAGE_POINTS = [
  {
    title: 'Progress Updates',
    detail: 'Keep families informed about development without jargon overload.',
  },
  {
    title: 'Meaningful Conversations',
    detail: 'Turn everyday moments into personal, warm parent communication.',
  },
  {
    title: 'Digital Portfolios',
    detail: 'Share learning moments, photos, and notes in one lasting record.',
  },
  {
    title: 'Family Engagement',
    detail: 'Build stronger connections between home and the classroom.',
  },
] as const;

export const PC_AI_POINTS = [
  {
    title: 'Quick Summaries',
    detail: 'Turn detailed notes into clear updates parents actually read.',
  },
  {
    title: 'Smart Suggestions',
    detail: 'Help staff communicate faster with thoughtful message drafts.',
  },
  {
    title: 'Live Translation',
    detail: 'Make communication accessible for multilingual families.',
  },
  {
    title: 'Clearer Daily Reports',
    detail: 'Generate polished daily updates with less manual typing.',
  },
] as const;

export const PC_TESTIMONIALS = [
  {
    id: 't1',
    quote:
      'Parents love receiving updates without calling the front desk. Communication finally feels calm and consistent.',
    name: 'Priya Nair',
    role: 'Center Director, Bright Path',
    avatar: '/images/testimonials/priya.jpg',
    tone: 'mint' as const,
  },
  {
    id: 't2',
    quote:
      'Daily reports and messaging live in one place. Staff spend less time chasing replies and more time with children.',
    name: 'Marcus Ellison',
    role: 'Multi-site Owner, Ellison Childcare',
    avatar: '/images/testimonials/marcus.jpg',
    tone: 'gold' as const,
  },
  {
    id: 't3',
    quote:
      'Families feel closer to the classroom. Photos, progress notes, and check-in alerts arrive when they matter.',
    name: 'Elena Brooks',
    role: 'Operations Manager, Little Nest',
    avatar: '/images/testimonials/elena.jpg',
    tone: 'blush' as const,
  },
  {
    id: 't4',
    quote:
      'AI drafts help our teachers write clearer updates in minutes. Parents notice the difference immediately.',
    name: 'Jordan Hale',
    role: 'Preschool Owner, Hale Early Learning',
    avatar: '/images/testimonials/jordan.jpg',
    tone: 'accent' as const,
  },
  {
    id: 't5',
    quote:
      'We stopped juggling texts and paper notes. Panacea keeps every family conversation organized and trustworthy.',
    name: 'Hannah Ortiz',
    role: 'Owner, Say Yes Childcare',
    avatar: '/images/testimonials/hannah.jpg',
    tone: 'mint' as const,
  },
] as const;

export const PC_COMPARE_OLD = [
  'Scattered texts and group chats',
  'Manual updates that get delayed',
  'Missed pickup and alert details',
  'Paper notes that families lose',
  'Phone calls that interrupt the day',
] as const;

export const PC_COMPARE_NEW = [
  'Real-time updates in one feed',
  'Organized teacher–parent messaging',
  'Digital daily reports and photos',
  'Secure, role-based communication',
  'AI-assisted summaries and drafts',
] as const;

export const PC_FAQS = [
  {
    id: 'q1',
    question: 'What is parent communication software for childcare?',
    answer:
      'It is a secure platform that helps centers share daily updates, photos, messages, check-in alerts, and progress notes with families — without relying on scattered texts or paper notes.',
  },
  {
    id: 'q2',
    question: 'Can parents receive real-time classroom updates?',
    answer:
      'Yes. Staff can post activities, meals, naps, and moments as they happen so families stay informed throughout the day.',
  },
  {
    id: 'q3',
    question: 'Does Panacea support two-way messaging?',
    answer:
      'Parents and staff can message in organized threads with clear history, so important conversations stay easy to find and follow.',
  },
  {
    id: 'q4',
    question: 'Can daily reports be shared automatically?',
    answer:
      'Centers can publish daily reports with learning moments, care notes, and photos so parents get a clear end-of-day summary.',
  },
  {
    id: 'q5',
    question: 'How does check-in connect to parent communication?',
    answer:
      'Arrival and pickup events can notify families instantly, keeping attendance and communication connected in one experience.',
  },
  {
    id: 'q6',
    question: 'Can Panacea help with multilingual families?',
    answer:
      'AI-assisted translation and clearer summaries help teams communicate more accessibly with diverse parent communities.',
  },
  {
    id: 'q7',
    question: 'Is parent communication secure?',
    answer:
      'Messages, photos, and child updates stay inside a controlled platform with clear access permissions for staff and families.',
  },
  {
    id: 'q8',
    question: 'Can teachers use AI to write updates faster?',
    answer:
      'Yes. Panacea can help draft daily summaries and improve tone so teachers spend less time typing and more time teaching.',
  },
] as const;
