export type CaseStudyProcessStep = {
  title: string;
  description?: string;
};

export type CaseStudyStat = {
  value: number;
  suffix: string;
  label: string;
};

export type CaseStudySolutionImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type CaseStudy = {
  id: string;
  slug: string;
  customer: string;
  logoText: string;
  logoTone: 'cyan' | 'violet' | 'rose' | 'amber' | 'mint' | 'sky';
  title: string;
  category: string;
  /** Listing card preview image (designed / editorial visual). */
  image: string;
  imageFit: 'cover' | 'contain';
  cardStyle: 'photo' | 'graphic';
  graphicTags?: string[];
  result: string;
  location: string;
  testimonial: string;
  author: string;
  role: string;
  /** Detail hero — original photograph / artwork. */
  heroImage: string;
  heroCaption?: string;
  excerpt: string;
  challenge: { title: string; content: string };
  needs: { title: string; content: string };
  process: CaseStudyProcessStep[];
  solution: {
    title: string;
    content: string;
    images: CaseStudySolutionImage[];
  };
  whatsNext: { title: string; content: string };
  stats: CaseStudyStat[];
  relatedSlugs: string[];
  featured?: boolean;
  seoDescription: string;
};

const IMG = {
  classroom: '/images/parent-communication/classroom.jpg',
  activity: '/images/parent-communication/activity.jpg',
  learning: '/images/parent-communication/learning.jpg',
  teacher: '/images/parent-communication/teacher.jpg',
  amelia: '/images/testimonials/amelia.jpg',
  elena: '/images/testimonials/elena.jpg',
  hannah: '/images/testimonials/hannah.jpg',
  jordan: '/images/testimonials/jordan.jpg',
  marcus: '/images/testimonials/marcus.jpg',
  priya: '/images/testimonials/priya.jpg',
  rajesh: '/images/testimonials/rajesh.jpg',
  ryan: '/images/testimonials/ryan.jpg',
} as const;

export const CASE_STUDY_LOGOS = [
  { label: 'Kids Spot', domain: 'kidsspotnursery.com' },
  { label: 'Real Kids', domain: 'realkids.com.au' },
  { label: 'Aiqish', domain: 'aiqish.com' },
  { label: 'Morningstar', domain: 'morningstar.org' },
  { label: 'Falcon British', domain: 'falconbritishnursery.com' },
  { label: 'Little Steps', domain: 'littlesteps.com' },
  { label: 'Bright Horizons', domain: 'brighthorizons.com' },
  { label: 'KinderCare', domain: 'kindercare.com' },
] as const;

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'kids-spot',
    slug: 'kids-spot-billing',
    customer: 'Kids Spot Nursery',
    logoText: 'Kids Spot',
    logoTone: 'cyan',
    title: 'How Kids Spot streamlined billing across 3 centers with Panacea',
    category: 'Multi-center Billing',
    image: IMG.elena,
    imageFit: 'cover',
    cardStyle: 'graphic',
    graphicTags: ['Billing', 'Parent Pay', 'QuickBooks'],
    result: '80% Reduction in admin workload',
    location: 'UAE',
    testimonial:
      "We used to spend hours jumping between platforms just to keep billing up to date. Now, everything's in one place — and it works.",
    author: 'Jessa Mae Reyes',
    role: 'Accountant',
    heroImage: IMG.elena,
    heroCaption: 'Customer Spotlight: Kids Spot Nursery',
    excerpt:
      'Kids Spot unified fee plans, parent payments, and reconciliations across three UAE centers.',
    challenge: {
      title: 'The Challenge: Growing complexity, limited visibility.',
      content:
        'As Kids Spot expanded across three centers, billing lived in spreadsheets, chat threads, and disconnected tools. Finance spent evenings chasing overdue fees, while center heads lacked a clear view of what parents owed — or what had already been paid. Manual follow-ups created delays, duplicate invoices, and stressful month-end closes.',
    },
    needs: {
      title: 'What was needed: Complete Automation of the Kids Spot Billing System.',
      content:
        'Kids Spot needed one system that could create invoices automatically, collect payments online, apply center-wise fee rules, and keep every ledger audit-ready — without asking accountants to bounce between platforms.',
    },
    process: [
      { title: 'Eliminate manual visibility', description: 'One live balance per family' },
      { title: 'Connect payments to parents', description: 'Secure links for UAE centers' },
      { title: 'Set center-wise fee rules', description: 'Follow-ups that match each site' },
      { title: 'Track payments in real time', description: 'Dashboards for finance leads' },
      { title: 'Share invoices & reports', description: 'Parents stay informed' },
    ],
    solution: {
      title: 'Solution: Fully integrated payments with CCAvenue and QuickBooks.',
      content:
        'Panacea connected recurring fee plans, parent payment collection, and cross-center reconciliation so Kids Spot could close books faster without rebuilding their finance stack.',
      images: [
        {
          src: IMG.classroom,
          alt: 'Kids Spot classroom operations supporting accurate billing attendance',
          caption: 'Automatic billing grounded in daily classroom operations',
        },
        {
          src: IMG.activity,
          alt: 'Families engaged through clear parent payment experiences',
          caption: 'Online payment collection parents actually complete',
        },
        {
          src: IMG.learning,
          alt: 'Finance teams reviewing cross-center reconciliations',
          caption: 'Cross-center financial reconciliations in one place',
        },
      ],
    },
    whatsNext: {
      title: "What's Next",
      content:
        'Kids Spot is expanding automated reminders and subsidy-ready invoices so every new enrollment starts with the right fee plan — and finance stays ahead of collection cycles.',
    },
    stats: [
      { value: 80, suffix: '%', label: 'Reduction in admin workload' },
      { value: 2, suffix: 'x', label: 'Faster payment cycles' },
      { value: 100, suffix: '%', label: 'Audit-ready records' },
    ],
    relatedSlugs: ['real-kids', 'aiqish', 'morningstar-family'],
    featured: true,
    seoDescription:
      'See how Kids Spot streamlined billing across 3 UAE centers with Panacea — cutting admin work and speeding payment cycles.',
  },
  {
    id: 'real-kids',
    slug: 'real-kids',
    customer: 'Real Kids',
    logoText: 'Real Kids',
    logoTone: 'violet',
    title: 'How Real Kids cut cash collection time to 14 days across 43 centers',
    category: 'Multi-center Billing',
    image: IMG.classroom,
    imageFit: 'cover',
    cardStyle: 'photo',
    result: '40% Reduction in Overdue Fees',
    location: 'Australia',
    testimonial:
      'Collection used to stretch past a month. With Panacea, we see balances clearly and parents pay in days — not weeks.',
    author: 'Marcus Chen',
    role: 'Group Finance Lead',
    heroImage: IMG.classroom,
    heroCaption: 'Customer Spotlight: Real Kids',
    excerpt: 'Real Kids standardized billing and reminders across a 43-center network.',
    challenge: {
      title: 'The Challenge: Scale without losing financial control.',
      content:
        'With 43 centers, Real Kids struggled to keep fee plans consistent. Late payments piled up, and regional teams spent more time chasing parents than supporting classrooms.',
    },
    needs: {
      title: 'What was needed: Network-wide billing discipline.',
      content:
        'A shared billing engine with automated reminders, clear overdue views, and center-level accountability.',
    },
    process: [
      { title: 'Standardize fee plans' },
      { title: 'Automate reminders' },
      { title: 'Parent self-serve pay' },
      { title: 'Regional dashboards' },
      { title: 'Close the month faster' },
    ],
    solution: {
      title: 'Solution: One billing system for every Real Kids center.',
      content:
        'Panacea gave Real Kids recurring invoices, reminder workflows, and live overdue tracking — so cash landed in 14 days on average.',
      images: [
        { src: IMG.teacher, alt: 'Educators supported by reliable billing operations at Real Kids' },
        { src: IMG.activity, alt: 'Families engaging with clear fee communication' },
        { src: IMG.learning, alt: 'Leadership reviewing multi-center billing outcomes' },
      ],
    },
    whatsNext: {
      title: "What's Next",
      content:
        'Real Kids is rolling out subsidy-aware invoices and deeper QuickBooks sync for regional controllers.',
    },
    stats: [
      { value: 40, suffix: '%', label: 'Reduction in overdue fees' },
      { value: 14, suffix: ' days', label: 'Average cash collection' },
      { value: 43, suffix: '', label: 'Centers on one billing stack' },
    ],
    relatedSlugs: ['kids-spot-billing', 'falcon-british-nursery', 'aiqish'],
    seoDescription:
      'How Real Kids cut cash collection to 14 days across 43 Australian centers with Panacea billing.',
  },
  {
    id: 'aiqish',
    slug: 'aiqish',
    customer: 'Aiqish',
    logoText: 'Aiqish',
    logoTone: 'rose',
    title: 'How Aiqish unified parent updates and daily reports across Singapore sites',
    category: 'Parent Communication',
    image: IMG.learning,
    imageFit: 'cover',
    cardStyle: 'graphic',
    graphicTags: ['Daily Reports', 'Billing', 'Parent Communication'],
    result: '3x Faster parent replies',
    location: 'Singapore',
    testimonial:
      'Parents finally get the right update in their language — without teachers rewriting the same message three times.',
    author: 'Priya Nair',
    role: 'Center Director',
    heroImage: IMG.priya,
    heroCaption: 'Customer Spotlight: Aiqish',
    excerpt: 'Aiqish modernized family communication while keeping classrooms calm.',
    challenge: {
      title: 'The Challenge: Fragmented family messaging.',
      content:
        'Teachers juggled WhatsApp, paper notes, and email. Important updates got lost, and parents asked the same questions every afternoon.',
    },
    needs: {
      title: 'What was needed: One trusted communication hub.',
      content:
        'Daily reports, media sharing, and bilingual messages in a single parent experience.',
    },
    process: [
      { title: 'Capture classroom moments' },
      { title: 'Publish daily reports' },
      { title: 'Translate for families' },
      { title: 'Track engagement' },
      { title: 'Close the loop' },
    ],
    solution: {
      title: 'Solution: Real-time parent communication that teachers actually use.',
      content:
        'Panacea replaced scattered chats with structured daily reports and media that families open every day.',
      images: [
        { src: IMG.learning, alt: 'Learning moments shared with Aiqish families' },
        { src: IMG.activity, alt: 'Classroom activities captured for daily reports' },
        { src: IMG.teacher, alt: 'Teachers publishing updates from the classroom' },
      ],
    },
    whatsNext: {
      title: "What's Next",
      content: 'Aiqish plans to connect attendance alerts with parent messaging for same-day clarity.',
    },
    stats: [
      { value: 3, suffix: 'x', label: 'Faster parent replies' },
      { value: 92, suffix: '%', label: 'Daily report open rate' },
      { value: 45, suffix: ' min', label: 'Saved per teacher daily' },
    ],
    relatedSlugs: ['kids-spot-billing', 'real-kids', 'morningstar-family'],
    seoDescription:
      'How Aiqish unified parent updates and daily reports across Singapore sites with Panacea.',
  },
  {
    id: 'morningstar',
    slug: 'morningstar-family',
    customer: 'Morningstar Family',
    logoText: 'Morningstar',
    logoTone: 'amber',
    title: 'How Morningstar Family digitized attendance without slowing drop-off',
    category: 'Digital Attendance',
    image: IMG.activity,
    imageFit: 'cover',
    cardStyle: 'graphic',
    graphicTags: ['Attendance', 'Safety', 'Ratio'],
    result: '60% Faster check-in',
    location: 'India',
    testimonial:
      'Drop-off used to bottleneck at the door. Now guardians check in in seconds and ratios stay visible all day.',
    author: 'Rajesh Patel',
    role: 'Operations Manager',
    heroImage: IMG.rajesh,
    heroCaption: 'Customer Spotlight: Morningstar Family',
    excerpt: 'Morningstar Family replaced paper sign-in with live attendance and ratio views.',
    challenge: {
      title: 'The Challenge: Paper attendance that could not keep up.',
      content:
        'Manual registers delayed openings, created ratio risk, and made compliance audits painful.',
    },
    needs: {
      title: 'What was needed: Fast, trustworthy digital attendance.',
      content:
        'Guardian check-in, live room counts, and exportable records for licensing.',
    },
    process: [
      { title: 'Digital check-in' },
      { title: 'Live room ratios' },
      { title: 'Staff attendance sync' },
      { title: 'Parent notifications' },
      { title: 'Audit exports' },
    ],
    solution: {
      title: 'Solution: Attendance that protects both pace and compliance.',
      content:
        'Panacea gave Morningstar Family frictionless check-in and real-time visibility leaders could trust.',
      images: [
        { src: IMG.activity, alt: 'Morning arrival flow at Morningstar Family' },
        { src: IMG.classroom, alt: 'Classrooms tracked with live attendance' },
        { src: IMG.teacher, alt: 'Staff confirming ratios throughout the day' },
      ],
    },
    whatsNext: {
      title: "What's Next",
      content: 'Morningstar is adding forecasted staffing views tied to attendance trends.',
    },
    stats: [
      { value: 60, suffix: '%', label: 'Faster check-in' },
      { value: 100, suffix: '%', label: 'Digital attendance records' },
      { value: 0, suffix: '', label: 'Lost paper registers' },
    ],
    relatedSlugs: ['real-kids', 'aiqish', 'little-orchard'],
    seoDescription:
      'How Morningstar Family digitized attendance without slowing drop-off using Panacea.',
  },
  {
    id: 'falcon',
    slug: 'falcon-british-nursery',
    customer: 'Falcon British Nursery',
    logoText: 'Falcon',
    logoTone: 'violet',
    title: 'Why Falcon British Nursery chose Panacea for enrollment growth',
    category: 'Enrollments',
    image: IMG.hannah,
    imageFit: 'cover',
    cardStyle: 'photo',
    result: '35% More tour conversions',
    location: 'Abu Dhabi',
    testimonial:
      'Follow-ups used to slip. Now every inquiry gets a smart next step — and our waitlist finally moves.',
    author: 'Hannah Brooks',
    role: 'Enrollment Lead',
    heroImage: IMG.hannah,
    heroCaption: 'Customer Spotlight: Falcon British Nursery, Abu Dhabi',
    excerpt: 'Falcon British Nursery turned inquiries into enrolled families with structured follow-up.',
    challenge: {
      title: 'The Challenge: Leads without a reliable pipeline.',
      content:
        'Tours were booked on sticky notes. Families waited days for replies, and competitors won the enrollment.',
    },
    needs: {
      title: 'What was needed: A full enrollment workflow.',
      content:
        'Inquiry capture, tour scheduling, automated follow-up, and a live waitlist.',
    },
    process: [
      { title: 'Capture inquiry' },
      { title: 'Schedule tour' },
      { title: 'Smart follow-up' },
      { title: 'Offer & forms' },
      { title: 'Enroll & onboard' },
    ],
    solution: {
      title: 'Solution: Enrollment journeys families finish.',
      content:
        'Panacea gave Falcon a clear pipeline from first message to first day — with fewer dropped leads.',
      images: [
        { src: IMG.hannah, alt: 'Enrollment lead at Falcon British Nursery' },
        { src: IMG.classroom, alt: 'Tour-ready classrooms at Falcon' },
        { src: IMG.learning, alt: 'Families experiencing the Falcon learning environment' },
      ],
    },
    whatsNext: {
      title: "What's Next",
      content: 'Falcon is connecting enrollment status to billing so fee plans start on day one.',
    },
    stats: [
      { value: 35, suffix: '%', label: 'More tour conversions' },
      { value: 48, suffix: ' hrs', label: 'Average follow-up time' },
      { value: 2, suffix: 'x', label: 'Waitlist movement' },
    ],
    relatedSlugs: ['kids-spot-billing', 'real-kids', 'sunrise-preschool'],
    featured: true,
    seoDescription:
      'Why Falcon British Nursery in Abu Dhabi chose Panacea to grow enrollments and convert more tours.',
  },
  {
    id: 'little-orchard',
    slug: 'little-orchard',
    customer: 'Little Orchard',
    logoText: 'Orchard',
    logoTone: 'mint',
    title: 'How Little Orchard made lesson planning collaborative for every room',
    category: 'Learning',
    image: IMG.learning,
    imageFit: 'cover',
    cardStyle: 'photo',
    result: '50% Less planning time',
    location: 'USA',
    testimonial:
      'Our teachers finally plan together instead of reinventing every week. Quality went up — stress went down.',
    author: 'Amelia Torres',
    role: 'Curriculum Lead',
    heroImage: IMG.amelia,
    heroCaption: 'Customer Spotlight: Little Orchard',
    excerpt: 'Little Orchard standardized curriculum workflows across rooms.',
    challenge: {
      title: 'The Challenge: Planning that lived in silos.',
      content:
        'Each classroom invented its own weekly plan. Sharing ideas was hard, and evidence for assessments was scattered.',
    },
    needs: {
      title: 'What was needed: Shared learning workflows.',
      content:
        'Templates, observations, and parent-visible learning stories in one place.',
    },
    process: [
      { title: 'Shared templates' },
      { title: 'Room collaboration' },
      { title: 'Capture observations' },
      { title: 'Link to outcomes' },
      { title: 'Share with parents' },
    ],
    solution: {
      title: 'Solution: Learning plans teachers finish on Friday — not Sunday night.',
      content:
        'Panacea Learning helped Little Orchard reuse strong plans and keep documentation consistent.',
      images: [
        { src: IMG.learning, alt: 'Children engaged in Little Orchard learning activities' },
        { src: IMG.classroom, alt: 'Collaborative classroom planning environment' },
        { src: IMG.activity, alt: 'Hands-on activities documented for families' },
      ],
    },
    whatsNext: {
      title: "What's Next",
      content: 'Little Orchard is piloting AI-assisted weekly plan drafts reviewed by curriculum leads.',
    },
    stats: [
      { value: 50, suffix: '%', label: 'Less planning time' },
      { value: 4, suffix: 'x', label: 'Shared templates reused' },
      { value: 88, suffix: '%', label: 'Teacher satisfaction' },
    ],
    relatedSlugs: ['aiqish', 'morningstar-family', 'brightpath'],
    seoDescription:
      'How Little Orchard made lesson planning collaborative for every room with Panacea Learning.',
  },
  {
    id: 'sunrise',
    slug: 'sunrise-preschool',
    customer: 'Sunrise Preschool',
    logoText: 'Sunrise',
    logoTone: 'sky',
    title: 'How Sunrise Preschool turned daily reports into a parent habit',
    category: 'Daily Reports',
    image: IMG.teacher,
    imageFit: 'cover',
    cardStyle: 'photo',
    result: '95% Parent open rate',
    location: 'Canada',
    testimonial:
      "Parents stopped calling at 4pm asking 'how was today?' — the report already answered them.",
    author: 'Jordan Lee',
    role: 'Lead Teacher',
    heroImage: IMG.jordan,
    heroCaption: 'Customer Spotlight: Sunrise Preschool',
    excerpt: 'Sunrise Preschool made daily reports effortless for teachers and irresistible for parents.',
    challenge: {
      title: 'The Challenge: Reports that took too long to love.',
      content:
        'Teachers delayed writing reports until evening. Parents received thin updates — or nothing at all.',
    },
    needs: {
      title: 'What was needed: Fast, rich daily storytelling.',
      content:
        'Photo-first reports, quick meal/nap logging, and delivery parents actually open.',
    },
    process: [
      { title: 'Capture moments' },
      { title: 'Log care notes' },
      { title: 'Compose report' },
      { title: 'Send to parents' },
      { title: 'Review engagement' },
    ],
    solution: {
      title: 'Solution: Daily reports parents open before pickup.',
      content:
        'Panacea helped Sunrise ship richer reports in less time — and keep families connected.',
      images: [
        { src: IMG.teacher, alt: 'Teacher preparing daily reports at Sunrise Preschool' },
        { src: IMG.activity, alt: 'Classroom moments included in parent reports' },
        { src: IMG.learning, alt: 'Learning highlights shared with Sunrise families' },
      ],
    },
    whatsNext: {
      title: "What's Next",
      content: 'Sunrise is expanding AI summaries so teachers review drafts instead of writing from scratch.',
    },
    stats: [
      { value: 95, suffix: '%', label: 'Parent open rate' },
      { value: 12, suffix: ' min', label: 'Avg report time' },
      { value: 70, suffix: '%', label: 'Fewer afternoon calls' },
    ],
    relatedSlugs: ['aiqish', 'little-orchard', 'falcon-british-nursery'],
    seoDescription:
      'How Sunrise Preschool turned daily reports into a parent habit with Panacea.',
  },
  {
    id: 'brightpath',
    slug: 'brightpath',
    customer: 'BrightPath',
    logoText: 'BrightPath',
    logoTone: 'violet',
    title: 'How BrightPath reduced billing disputes with transparent parent statements',
    category: 'Parent Pay',
    image: IMG.marcus,
    imageFit: 'cover',
    cardStyle: 'photo',
    result: '70% Fewer billing disputes',
    location: 'UK',
    testimonial:
      'When parents can see every charge clearly, the inbox stays quiet — and payments arrive on time.',
    author: 'Marcus Reid',
    role: 'Business Manager',
    heroImage: IMG.marcus,
    heroCaption: 'Customer Spotlight: BrightPath',
    excerpt: 'BrightPath replaced confusing fee emails with clear statements parents trust.',
    challenge: {
      title: 'The Challenge: Opaque statements, endless disputes.',
      content:
        'Parents questioned every line item. Staff spent hours explaining fees that should have been self-explanatory.',
    },
    needs: {
      title: 'What was needed: Crystal-clear parent billing.',
      content:
        'Itemized statements, online pay, and a single source of truth for balances.',
    },
    process: [
      { title: 'Publish fee plans' },
      { title: 'Generate statements' },
      { title: 'Enable parent pay' },
      { title: 'Track disputes' },
      { title: 'Reconcile quickly' },
    ],
    solution: {
      title: 'Solution: Transparent statements that reduce support load.',
      content:
        'Panacea gave BrightPath parent-facing clarity and faster collections.',
      images: [
        { src: IMG.classroom, alt: 'BrightPath centers supported by clear billing' },
        { src: IMG.teacher, alt: 'Staff focused on care instead of fee disputes' },
        { src: IMG.activity, alt: 'Families engaging confidently with fee statements' },
      ],
    },
    whatsNext: {
      title: "What's Next",
      content: 'BrightPath is introducing installment plans for premium programs.',
    },
    stats: [
      { value: 70, suffix: '%', label: 'Fewer billing disputes' },
      { value: 25, suffix: '%', label: 'Faster collections' },
      { value: 1, suffix: '', label: 'Source of truth for balances' },
    ],
    relatedSlugs: ['kids-spot-billing', 'real-kids', 'sunrise-preschool'],
    seoDescription:
      'How BrightPath reduced billing disputes with transparent parent statements in Panacea.',
  },
  {
    id: 'cedar-grove',
    slug: 'cedar-grove',
    customer: 'Cedar Grove',
    logoText: 'Cedar',
    logoTone: 'mint',
    title: 'How Cedar Grove kept ratios safe while growing enrollment',
    category: 'Student–Staff Ratio',
    image: IMG.ryan,
    imageFit: 'cover',
    cardStyle: 'photo',
    result: '100% Ratio compliance days',
    location: 'USA',
    testimonial:
      'Growth used to scare us on ratio days. Now we see staffing needs before the morning rush.',
    author: 'Ryan Cole',
    role: 'Director',
    heroImage: IMG.ryan,
    heroCaption: 'Customer Spotlight: Cedar Grove',
    excerpt: 'Cedar Grove paired attendance with ratio forecasting as enrollment grew.',
    challenge: {
      title: 'The Challenge: Growth vs. compliance.',
      content:
        'New enrollments arrived faster than staffing plans. Directors discovered ratio issues mid-morning.',
    },
    needs: {
      title: 'What was needed: Live ratio intelligence.',
      content:
        'Attendance-linked ratios, staff coverage views, and early warnings.',
    },
    process: [
      { title: 'Link attendance' },
      { title: 'Watch live ratios' },
      { title: 'Alert early' },
      { title: 'Rebalance rooms' },
      { title: 'Prove compliance' },
    ],
    solution: {
      title: 'Solution: Ratio confidence that scales with enrollment.',
      content:
        'Panacea helped Cedar Grove grow without gambling on staffing guesswork.',
      images: [
        { src: IMG.classroom, alt: 'Cedar Grove classrooms with healthy ratios' },
        { src: IMG.teacher, alt: 'Staff coverage planned with ratio visibility' },
        { src: IMG.learning, alt: 'Children learning in well-staffed rooms' },
      ],
    },
    whatsNext: {
      title: "What's Next",
      content: 'Cedar Grove is connecting ratio forecasts to hiring pipelines.',
    },
    stats: [
      { value: 100, suffix: '%', label: 'Ratio compliance days' },
      { value: 18, suffix: '%', label: 'Enrollment growth' },
      { value: 30, suffix: ' min', label: 'Earlier staffing alerts' },
    ],
    relatedSlugs: ['morningstar-family', 'little-orchard', 'real-kids'],
    seoDescription:
      'How Cedar Grove kept student–staff ratios safe while growing enrollment with Panacea.',
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}

export function getRelatedCaseStudies(study: CaseStudy): CaseStudy[] {
  return study.relatedSlugs
    .map((s) => getCaseStudyBySlug(s))
    .filter((c): c is CaseStudy => Boolean(c))
    .slice(0, 3);
}

export function getFeaturedCaseStudy(): CaseStudy {
  return CASE_STUDIES.find((c) => c.featured && c.slug === 'falcon-british-nursery')
    ?? CASE_STUDIES.find((c) => c.featured)
    ?? CASE_STUDIES[0];
}
