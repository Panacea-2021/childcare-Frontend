/** Pricing page content — preserve wording; presentation lives in components. */

export type PlanFeatureKind = 'included' | 'addon';

export type PlanFeature = {
  label: string;
  kind?: PlanFeatureKind;
};

export type PricingPlan = {
  id: 'standard' | 'business' | 'enterprise';
  name: string;
  description: string;
  popular?: boolean;
  ctaLabel: string;
  ctaHref: string;
  features: PlanFeature[];
  footerNote?: string;
};

export type ComparisonValue = boolean | 'addon' | string;

export type ComparisonFeature = {
  name: string;
  standard: ComparisonValue;
  business: ComparisonValue;
  enterprise: ComparisonValue;
};

export type ComparisonCategory = {
  id: string;
  name: string;
  features: ComparisonFeature[];
};

export type PricingTestimonial = {
  id: string;
  quote: string;
  highlightPhrases?: string[];
  name: string;
  role: string;
  company: string;
  imageUrl: string;
};

export type PricingFaq = {
  question: string;
  answer: string;
};

export type TrustBadge = {
  id: string;
  label: string;
  sublabel: string;
};

export const PRICING_HERO = {
  headline: 'Plans That Pay for Themselves',
  subtitle: 'Transparent Pricing With Zero Hidden Fees',
} as const;

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'standard',
    name: 'Standard',
    description:
      'For single centres, to streamline daily operations and bring efficiency and consistency.',
    ctaLabel: 'Talk To An Expert',
    ctaHref: '/pricing/talk-to-expert',
    features: [
      { label: 'Parent Communication App' },
      { label: 'Digital Attendance' },
      { label: 'Food Menu & Meal Tracking' },
      { label: 'Events & Holiday Calendar' },
      { label: 'Contactless Check-in & Check-out' },
      { label: 'Daily Reports & News Feed' },
      { label: 'Unlimited Messaging' },
      { label: 'Voice Note & Document Sharing' },
      { label: '20 GB Storage' },
      { label: 'Upto 5 Staffs' },
      { label: 'Incident & Accident Report' },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For businesses to centralize their operations and build brand consistency.',
    popular: true,
    ctaLabel: 'Talk To An Expert',
    ctaHref: '/pricing/talk-to-expert',
    features: [
      { label: 'Everything in Standard Package, and' },
      { label: 'Childcare Billing & Invoicing' },
      { label: 'Online Fee Payment & Reports' },
      { label: 'Automated Recurring Payment' },
      { label: 'Child Ratios & Alerts' },
      { label: 'Lesson Planning' },
      { label: 'Parent Concerns Management System' },
      { label: 'Allergy Tracking' },
      { label: '100 GB Storage' },
      { label: 'Programs & Capacity Planning' },
      { label: 'Bulk Onboarding Support' },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description:
      'For large enterprises or businesses, to make informed decisions and scale their business.',
    ctaLabel: 'Talk To Sales',
    ctaHref: '/pricing/talk-to-expert',
    features: [
      { label: 'Everything in Business Package, and' },
      { label: 'Multicenter Management' },
      { label: 'Child Assessments' },
      { label: 'AI Enabled Newsletter' },
      { label: 'Staff Leave Management' },
      { label: 'Inquiry Management (CRM)' },
      { label: 'Subsidy Management' },
      { label: 'Form Builder' },
      { label: '200 GB Storage' },
      { label: 'Custom Reports' },
      { label: 'Dedicated Account Manager' },
    ],
  },
];

export const TRUST_BADGES: TrustBadge[] = [
  { id: 'g2-hp', label: 'High Performer', sublabel: 'G2' },
  { id: 'g2-support', label: 'Best Support', sublabel: 'G2' },
  { id: 'g2-leader', label: 'Leader', sublabel: 'G2' },
  { id: 'soc2', label: 'SOC 2', sublabel: 'Type II' },
  { id: 'gdpr', label: 'GDPR', sublabel: 'Compliant' },
];

/** Comparison matrix aligned to published Standard / Business / Enterprise packages. */
export const COMPARISON_CATEGORIES: ComparisonCategory[] = [
  {
    id: 'parent-comms',
    name: 'Parent Comms & Engagement',
    features: [
      { name: 'Parent Communication App', standard: true, business: true, enterprise: true },
      { name: 'Unlimited Messaging', standard: true, business: true, enterprise: true },
      { name: 'Voice Note & Document Sharing', standard: true, business: true, enterprise: true },
      { name: 'Daily Reports & News Feed', standard: true, business: true, enterprise: true },
      { name: 'Parent Concerns Management System', standard: false, business: true, enterprise: true },
      { name: 'AI Enabled Newsletter', standard: false, business: false, enterprise: true },
      { name: 'AI Writing Assistant', standard: 'addon', business: 'addon', enterprise: 'addon' },
    ],
  },
  {
    id: 'center-mgmt',
    name: 'Center Management',
    features: [
      { name: 'Digital Attendance', standard: true, business: true, enterprise: true },
      { name: 'Contactless Check-in & Check-out', standard: true, business: true, enterprise: true },
      { name: 'Food Menu & Meal Tracking', standard: true, business: true, enterprise: true },
      { name: 'Events & Holiday Calendar', standard: true, business: true, enterprise: true },
      { name: 'Incident & Accident Report', standard: true, business: true, enterprise: true },
      { name: 'Allergy Tracking', standard: false, business: true, enterprise: true },
      { name: 'Child Ratios & Alerts', standard: false, business: true, enterprise: true },
      { name: 'Staff Leave Management', standard: false, business: false, enterprise: true },
      { name: 'Upto 5 Staffs', standard: true, business: true, enterprise: true },
    ],
  },
  {
    id: 'programs',
    name: 'Programs Management',
    features: [
      { name: 'Programs & Capacity Planning', standard: false, business: true, enterprise: true },
      { name: 'Bulk Onboarding Support', standard: false, business: true, enterprise: true },
      { name: 'Tour Scheduling', standard: 'addon', business: 'addon', enterprise: 'addon' },
      { name: 'Form Builder', standard: false, business: false, enterprise: true },
    ],
  },
  {
    id: 'billing',
    name: 'Billing Operations',
    features: [
      { name: 'Childcare Billing & Invoicing', standard: false, business: true, enterprise: true },
      { name: 'Online Fee Payment & Reports', standard: false, business: true, enterprise: true },
      { name: 'Automated Recurring Payment', standard: false, business: true, enterprise: true },
      { name: 'Subsidy Management', standard: false, business: false, enterprise: true },
    ],
  },
  {
    id: 'learning',
    name: 'Learning & Observation',
    features: [
      { name: 'Lesson Planning', standard: false, business: true, enterprise: true },
      { name: 'Child Assessments', standard: false, business: false, enterprise: true },
      { name: 'Assessment 2.0', standard: false, business: 'addon', enterprise: 'addon' },
      {
        name: 'AI Powered Lesson Planner',
        standard: false,
        business: 'addon',
        enterprise: 'addon',
      },
    ],
  },
  {
    id: 'inquiry',
    name: 'Inquiry & Waitlist Management',
    features: [
      { name: 'Inquiry Management (CRM)', standard: false, business: false, enterprise: true },
      { name: 'Tour management', standard: 'addon', business: 'addon', enterprise: 'addon' },
    ],
  },
  {
    id: 'multi-center',
    name: 'Multi-Center Management',
    features: [
      { name: 'Multicenter Management', standard: false, business: false, enterprise: true },
      { name: 'Dedicated Account Manager', standard: false, business: false, enterprise: true },
    ],
  },
  {
    id: 'reports',
    name: 'Business Reports',
    features: [
      { name: 'Custom Reports', standard: false, business: false, enterprise: true },
      { name: 'Online Fee Payment & Reports', standard: false, business: true, enterprise: true },
    ],
  },
  {
    id: 'access',
    name: 'Access Control',
    features: [
      { name: 'Role-Based Access', standard: true, business: true, enterprise: true },
      { name: 'GDPR Compliance', standard: true, business: true, enterprise: true },
      { name: '20 GB Storage', standard: true, business: false, enterprise: false },
      { name: '100 GB Storage', standard: false, business: true, enterprise: false },
      { name: '200 GB Storage', standard: false, business: false, enterprise: true },
    ],
  },
  {
    id: 'addons',
    name: 'Add-Ons',
    features: [
      { name: 'Tour Scheduling / Tour Management', standard: 'addon', business: 'addon', enterprise: 'addon' },
      { name: 'AI Writing Assistant', standard: 'addon', business: 'addon', enterprise: 'addon' },
      { name: 'Assessment 2.0', standard: false, business: 'addon', enterprise: 'addon' },
      { name: 'AI Powered Lesson Planner', standard: false, business: 'addon', enterprise: 'addon' },
    ],
  },
];

export const PRICING_TESTIMONIALS: PricingTestimonial[] = [
  {
    id: 'lauren',
    quote:
      'Our dedicated account manager was with us every step of the way. The responses were almost real-time! Switching to illumine was incredibly smooth, and the support made all the difference for our team.',
    highlightPhrases: ['almost real-time', 'incredibly smooth'],
    name: 'Lauren McCord',
    role: 'Owner',
    company: 'The Little Learning Center',
    imageUrl: '/images/testimonials/elena.jpg',
  },
  {
    id: 'hannah',
    quote:
      'illumine has helped us streamline billing and invoicing, student information, and managing incoming enquiries, all from a single platform.',
    highlightPhrases: ['single platform'],
    name: 'Hannah',
    role: 'Owner',
    company: 'Say Yes, Buffalo',
    imageUrl: '/images/testimonials/hannah.jpg',
  },
  {
    id: 'amelia',
    quote:
      'Compared to other companies, illumine is head and shoulders above for responsiveness and communication.',
    highlightPhrases: ['head and shoulders above'],
    name: 'Amelia J Brown',
    role: 'Owner',
    company: 'Falcon British Nursery',
    imageUrl: '/images/testimonials/amelia.jpg',
  },
  {
    id: 'ryan',
    quote:
      'With illumine, we no longer need multiple tools to get the job done. It has streamlined parent engagement, billing as well as enriched our school’s interactions.',
    highlightPhrases: ['no longer need multiple tools'],
    name: 'Ryan Salazar',
    role: 'Owner',
    company: 'Maple Grove Childcare Academy',
    imageUrl: '/images/testimonials/ryan.jpg',
  },
  {
    id: 'rajesh',
    quote:
      'illumine has improved the way we run our nurseries. we are in firm control of our financial health and parent satisfaction has greatly improved.',
    highlightPhrases: ['firm control', 'greatly improved'],
    name: 'Rajesh kumar',
    role: 'Director',
    company: 'Kids Kingdom Group',
    imageUrl: '/images/testimonials/rajesh.jpg',
  },
];

export const PRICING_FAQS: PricingFaq[] = [
  {
    question: 'How long are your contracts?',
    answer:
      'We offer flexible contract options to suit your needs! Choose from Annual, Semi-Annual, Quarterly, or Monthly plans — whatever works best for you.',
  },
  {
    question: 'Is there a discount for Annual service?',
    answer:
      "Absolutely! When you opt for an annual plan with illumine, you unlock special discounts and added value. It's our way of saying thank you for your long-term partnership!",
  },
  {
    question: 'My student numbers change every month. How will you handle billing?',
    answer:
      'We often suggest having a center-based package where you have to pay a fixed amount irrespective of a number of students. If you opt for the student-based package we make the necessary adjustments at the end of the month billing.',
  },
  {
    question: 'Are they any hidden costs?',
    answer:
      'None at all! We believe in complete transparency. Every cost is shared with you upfront, so there are no surprises along the way.',
  },
  {
    question: 'Is there any setup cost?',
    answer:
      'None! Getting started with illumine is simple, smooth, and cost-free. No setup charges involved.',
  },
  {
    question: 'I am using some other software. Will I be able to migrate data?',
    answer:
      'Yes, of course! We make data migration seamless. Our team will help you import your data from your existing system with ease. Just reach out to our friendly support team or email us at info@illumine.com, and we’ll take care of it.',
  },
  {
    question: 'Do you provide APIs?',
    answer:
      'Yes, we provide APIs to integrate with your existing system. You can request the API documentation and even request additional APIs.',
  },
  {
    question: 'Are there any payment processing charges?',
    answer: 'No, illumine does not charge you any payment processing fees.',
  },
  {
    question: 'Can I request a feature to be developed for me?',
    answer:
      'Yes, our team will work rigorously to develop a requested feature, especially for your business. Our customization capabilities are what make us the best.',
  },
];
