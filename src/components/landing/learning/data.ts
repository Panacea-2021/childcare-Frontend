export const LN_CYCLE_STEPS = [
  {
    id: 'plan',
    label: 'Plan',
    detail: 'Design intentional learning experiences aligned to frameworks.',
  },
  {
    id: 'observe',
    label: 'Observe',
    detail: 'Capture authentic moments as children learn and play.',
  },
  {
    id: 'assess',
    label: 'Assess',
    detail: 'Turn observations into clear developmental insights.',
  },
  {
    id: 'review',
    label: 'Review',
    detail: 'Reflect with families and plan each child’s next steps.',
  },
] as const;

export const LN_FRAMEWORKS = [
  { id: 'eyfs', label: 'EYFS', region: 'UK & Intl' },
  { id: 'eylf', label: 'Early Years Learning Framework', region: 'Australia' },
  { id: 'nel', label: 'NEL', region: 'Singapore' },
  { id: 'te-whariki', label: 'Te Whāriki', region: 'New Zealand' },
] as const;

export const LN_OBSERVE_POINTS = [
  {
    title: 'Capture Moments Instantly',
    detail: 'Record learning moments in the moment — without leaving the classroom floor.',
  },
  {
    title: 'Voice-to-Text Notes',
    detail: 'Speak observations aloud and turn them into clean, ready-to-use notes.',
  },
  {
    title: 'Photos, Videos & Media',
    detail: 'Attach photos, videos, and media so every observation tells a fuller story.',
  },
] as const;

export const LN_LESSON_AI_POINTS = [
  {
    title: 'AI-Generated Lesson Drafts',
    detail: 'Create thoughtful lesson plan drafts in minutes, then refine with your expertise.',
  },
  {
    title: 'Framework Alignment',
    detail: 'Keep plans mapped to EYFS, EYLF, NEL, Te Whāriki, and your center standards.',
  },
  {
    title: 'Resource Suggestions',
    detail: 'Get activity ideas, materials, and extensions tailored to each learning goal.',
  },
] as const;

export const LN_OBSERVATION_AI_POINTS = [
  {
    title: 'Professional Observation Writing',
    detail: 'Transform quick notes into polished, developmentally rich observation language.',
  },
  {
    title: 'Hours Saved Every Week',
    detail: 'Reduce repetitive documentation so educators stay present with children.',
  },
  {
    title: 'Personalized Learning Reports',
    detail: 'Generate child-centered reports families can understand and celebrate.',
  },
] as const;

export const LN_GOALS_POINTS = [
  {
    title: 'Track Development Clearly',
    detail: 'See progress across learning areas with visual milestones and trends.',
  },
  {
    title: 'Share Progress with Parents',
    detail: 'Keep families connected to goals, achievements, and next learning steps.',
  },
  {
    title: 'Set Meaningful Goals',
    detail: 'Define intentional next steps for every child — and follow through with ease.',
  },
] as const;

export const LN_TESTIMONIALS = [
  {
    id: 't1',
    quote:
      'Lesson planning used to take our evenings. With Panacea, drafts are ready in minutes and still feel personal to each room.',
    name: 'Priya Nair',
    role: 'Center Director, Bright Path',
    avatar: '/images/testimonials/priya.jpg',
    tone: 'mint' as const,
  },
  {
    id: 't2',
    quote:
      'Observations finally feel manageable. Teachers capture moments on the floor, and AI helps polish them into clear reports.',
    name: 'Marcus Ellison',
    role: 'Multi-site Owner, Ellison Childcare',
    avatar: '/images/testimonials/marcus.jpg',
    tone: 'gold' as const,
  },
  {
    id: 't3',
    quote:
      'Parents love seeing learning goals and milestones. It makes progress conversations warmer and much more concrete.',
    name: 'Elena Brooks',
    role: 'Operations Manager, Little Nest',
    avatar: '/images/testimonials/elena.jpg',
    tone: 'blush' as const,
  },
  {
    id: 't4',
    quote:
      'Framework alignment used to be stressful. Now every plan and assessment maps cleanly to our curriculum standards.',
    name: 'Jordan Hale',
    role: 'Preschool Owner, Hale Early Learning',
    avatar: '/images/testimonials/jordan.jpg',
    tone: 'accent' as const,
  },
] as const;

export const LN_FAQS = [
  {
    id: 'q1',
    question: 'What is learning and assessment software for childcare?',
    answer:
      'It helps educators plan lessons, capture observations, assess development, and share progress with families — all in one connected workflow instead of spreadsheets and paper binders.',
  },
  {
    id: 'q2',
    question: 'Which early years frameworks does Panacea support?',
    answer:
      'Panacea supports major frameworks including EYFS (UK & international), the Early Years Learning Framework (Australia), NEL (Singapore), and Te Whāriki (New Zealand), so plans and assessments stay aligned to your standards.',
  },
  {
    id: 'q3',
    question: 'Can teachers record observations on mobile devices?',
    answer:
      'Yes. Educators can capture notes, voice-to-text, photos, and videos on the go so documentation happens in the moment without interrupting care.',
  },
  {
    id: 'q4',
    question: 'How does AI help with lesson planning and observations?',
    answer:
      'AI can draft lesson plans, suggest resources, refine observation language, and help generate personalized reports — always with educators in control of the final result.',
  },
  {
    id: 'q5',
    question: 'Can families see learning goals and progress?',
    answer:
      'Centers can share milestones, goals, and learning updates with parents so families stay connected to each child’s development journey.',
  },
] as const;
