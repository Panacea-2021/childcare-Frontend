export const AIP_STATS = [
  { value: 10, suffix: 'x', label: 'Productivity Increase', prefix: '' },
  { value: 5, suffix: ' sec', label: 'To Generate Lessons', prefix: '<' },
  { value: 20, suffix: '+', label: 'Language Translations', prefix: '' },
] as const;

export const AIP_ENGAGE_POINTS = [
  {
    title: 'Personalized Writing',
    detail:
      'AI suggestions that help educators write warm, professional parent updates in seconds.',
  },
  {
    title: 'Communicate in Every Language',
    detail:
      'Translate messages so every family understands, no matter their preferred language.',
  },
] as const;

export const AIP_LESSON_POINTS = [
  {
    title: 'Write Lessons in Seconds',
    detail: 'Generate thoughtful lesson plans aligned to your classroom goals.',
  },
  {
    title: 'Suggest Personalized Observations',
    detail: 'Turn quick notes into clear observation language for each child.',
  },
] as const;

export const AIP_ANALYTICS_POINTS = [
  {
    title: 'Detect early signs of teacher workload',
    detail: 'Spot patterns before burnout and staffing gaps grow.',
  },
  {
    title: 'Make Informed Decisions for Enrollment',
    detail: 'Use forecasts and insights to fill seats with confidence.',
  },
] as const;

export type CompareCell = 'check' | string;

export const AIP_COMPARE_ROWS: {
  feature: string;
  panacea: CompareCell;
  chatgpt: CompareCell;
  copilot: CompareCell;
}[] = [
  {
    feature: 'Personalized parent communications',
    panacea: 'check',
    chatgpt: 'Generic responses',
    copilot: 'Requires expertise',
  },
  {
    feature: 'Weekly lesson planning',
    panacea: 'check',
    chatgpt: 'Manual prompting',
    copilot: 'Limited context',
  },
  {
    feature: 'Lesson creation with AI',
    panacea: 'check',
    chatgpt: 'check',
    copilot: 'check',
  },
  {
    feature: 'Learning journal & progress reports',
    panacea: 'check',
    chatgpt: 'Not childcare-specific',
    copilot: 'Limited',
  },
  {
    feature: 'Attendance & occupancy insights',
    panacea: 'check',
    chatgpt: 'Not available',
    copilot: 'Not available',
  },
  {
    feature: 'Childcare-specific workflows',
    panacea: 'check',
    chatgpt: 'Generic',
    copilot: 'Generic',
  },
];

export const AIP_TRUST = [
  {
    label: 'Bright Horizons',
    domain: 'brighthorizons.com',
    logo: 'https://logo.clearbit.com/brighthorizons.com',
  },
  {
    label: 'KinderCare',
    domain: 'kindercare.com',
    logo: 'https://logo.clearbit.com/kindercare.com',
  },
  {
    label: 'Guidepost',
    domain: 'guidepostmontessori.com',
    logo: 'https://logo.clearbit.com/guidepostmontessori.com',
  },
  {
    label: 'Dibber',
    domain: 'dibber.com',
    logo: 'https://logo.clearbit.com/dibber.com',
  },
  {
    label: 'Primrose',
    domain: 'primroseschools.com',
    logo: 'https://logo.clearbit.com/primroseschools.com',
  },
  {
    label: 'Learning Care',
    domain: 'learningcaregroup.com',
    logo: 'https://logo.clearbit.com/learningcaregroup.com',
  },
  {
    label: 'Goddard',
    domain: 'goddardschool.com',
    logo: 'https://logo.clearbit.com/goddardschool.com',
  },
  {
    label: 'Childcare Aware',
    domain: 'childcareaware.org',
    logo: 'https://logo.clearbit.com/childcareaware.org',
  },
] as const;
