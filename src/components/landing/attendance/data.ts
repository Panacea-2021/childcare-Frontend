export const ATTENDANCE_BENEFITS = [
  {
    id: 'manual',
    title: 'Minimize Manual Work',
    description:
      'Replace paper sign-ins with digital check-in so staff spend less time on attendance admin.',
  },
  {
    id: 'forecast',
    title: 'Maximize Revenue with Forecasting',
    description:
      'See occupancy trends early and plan staffing, rooms, and enrollment capacity more confidently.',
  },
  {
    id: 'safety',
    title: 'Ensure Safety & Compliance',
    description:
      'Know who is in the building in real time and keep accurate attendance records for audits and licensing.',
  },
] as const;

export const ATTENDANCE_CHECKIN_POINTS = [
  {
    title: 'QR-Based Attendance',
    detail: 'Parents can quickly check children in and out using a secure QR workflow.',
  },
  {
    title: 'Touchless & Fast',
    detail: 'Reduce queues and keep arrival and pickup moving smoothly.',
  },
  {
    title: 'Manage Leave Effectively',
    detail: 'Track absences and attendance changes without unnecessary paperwork.',
  },
] as const;

export const ATTENDANCE_BILLING_POINTS = [
  {
    title: 'Attendance-Based Billing',
    detail: 'Automatically connect attendance data with billing.',
  },
  {
    title: 'Payroll Management',
    detail: 'Reduce manual calculations and simplify staff-related reporting.',
  },
  {
    title: 'Accurate Reporting',
    detail: 'Keep attendance and financial records synchronized.',
  },
] as const;

export const ATTENDANCE_SAFETY_POINTS = [
  {
    title: 'Track Presence',
    detail: 'Know precisely who is present, absent, or authorized to leave.',
  },
  {
    title: 'Monitor Child Activity',
    detail: 'Keep attendance and classroom activity records organized.',
  },
  {
    title: 'Improve Pickup Security',
    detail: 'Make authorized pickup verification easier.',
  },
  {
    title: 'Student Safety Reports',
    detail: 'Maintain reliable records for compliance and parent communication.',
  },
] as const;

export const ATTENDANCE_TESTIMONIALS = [
  {
    id: 't1',
    quote:
      'Check-in used to take forever at the door. With Panacea, parents scan and go — and staff finally have accurate records.',
    name: 'Priya Nair',
    role: 'Center Director, Bright Path',
    avatar: '/images/testimonials/priya.jpg',
    tone: 'mint' as const,
  },
  {
    id: 't2',
    quote:
      'Occupancy tracking helped us plan staffing more confidently. Everything is visible in one place.',
    name: 'Marcus Ellison',
    role: 'Multi-site Owner, Ellison Childcare',
    avatar: '/images/testimonials/marcus.jpg',
    tone: 'gold' as const,
  },
  {
    id: 't3',
    quote:
      'Audits used to mean digging through binders. Now we have everything organized and accessible.',
    name: 'Elena Brooks',
    role: 'Operations Manager, Little Nest',
    avatar: '/images/testimonials/elena.jpg',
    tone: 'blush' as const,
  },
  {
    id: 't4',
    quote:
      'Parents love the simple phone check-in. Our front desk finally starts the day calm instead of chaotic.',
    name: 'Jordan Hale',
    role: 'Preschool Owner, Hale Early Learning',
    avatar: '/images/testimonials/jordan.jpg',
    tone: 'accent' as const,
  },
  {
    id: 't5',
    quote:
      "Panacea's digital attendance made check-in and check-out so much easier. Our hallway finally feels calm.",
    name: 'Hannah Ortiz',
    role: 'Owner, Say Yes Childcare',
    avatar: '/images/testimonials/hannah.jpg',
    tone: 'mint' as const,
  },
  {
    id: 't6',
    quote:
      'Precise tracking helps us stay compliant without chasing paper. Directors can trust what they see.',
    name: 'Amelia J Brown',
    role: 'Owner, Falcon British Nursery',
    avatar: '/images/testimonials/amelia.jpg',
    tone: 'gold' as const,
  },
  {
    id: 't7',
    quote:
      'Contactless check-in gave parents peace of mind and gave our staff more time with children.',
    name: 'Ryan Salazar',
    role: 'Owner, Maple Grove Academy',
    avatar: '/images/testimonials/ryan.jpg',
    tone: 'blush' as const,
  },
  {
    id: 't8',
    quote:
      'We customized rooms, ratios, and pickup rules quickly. Attendance finally matches how our center runs.',
    name: 'Rajesh Mehta',
    role: 'Director, Sunshine Circle',
    avatar: '/images/testimonials/rajesh.jpg',
    tone: 'accent' as const,
  },
] as const;

export const ATTENDANCE_FAQS = [
  {
    id: 'q1',
    question: 'What is a childcare attendance app, and why is it useful?',
    answer:
      'A childcare attendance app replaces paper sign-in sheets with digital check-in and check-out. Panacea helps directors see who is present, track occupancy, and keep accurate records for billing, safety, and compliance.',
  },
  {
    id: 'q2',
    question: 'Can Panacea handle both check-in and check-out?',
    answer:
      'Yes. Families can complete secure check-in and check-out with QR, PIN, or the parent app while staff monitor live arrivals and departures across rooms.',
  },
  {
    id: 'q3',
    question: 'Can I manage attendance across multiple rooms?',
    answer:
      'Directors get a birds-eye occupancy view by room and center, including present, absent, and pending counts throughout the day.',
  },
  {
    id: 'q4',
    question: 'Is attendance history available for compliance?',
    answer:
      'Yes. Keep searchable check-in and check-out history with authorized pickup details ready for licensing reviews and parent requests.',
  },
  {
    id: 'q5',
    question: 'Can staff track who is visiting during the day?',
    answer:
      'Staff can monitor live presence, authorized pickups, and visitor activity so the building stays accountable without clipboard chaos.',
  },
  {
    id: 'q6',
    question: 'Does attendance connect to billing?',
    answer:
      'Attendance records can drive drop-in charges and attendance-based invoicing so billed hours stay aligned with actual presence.',
  },
  {
    id: 'q7',
    question: 'Can parents use their phones for check-in?',
    answer:
      'Yes. Parents can use a phone-based QR or app workflow for contactless arrival and pickup while staff see updates instantly.',
  },
  {
    id: 'q8',
    question: 'Can Panacea support multiple centers?',
    answer:
      'Multi-site teams can review occupancy and attendance patterns across centers from one connected attendance experience.',
  },
  {
    id: 'q9',
    question: 'How secure is attendance and child data?',
    answer:
      'Attendance and child records stay in a secure platform with clear access controls, so directors can trust both convenience and privacy.',
  },
  {
    id: 'q10',
    question: 'Can I integrate Panacea with other systems?',
    answer:
      'Panacea is built to connect attendance with billing and center operations so teams are not stuck reconciling separate tools by hand.',
  },
] as const;
