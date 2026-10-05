export type SchoolBranding = {
  schoolName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  affiliation: string;
  academicYear: string;
};

/** Mock Panacea / daycare branding used on every official PDF-style form. */
export const DEFAULT_SCHOOL_BRANDING: SchoolBranding = {
  schoolName: 'Panacea Early Learning Academy',
  tagline: 'Nurturing Curious Minds · Excellence in Early Childhood',
  address: '12 Oakridge Avenue, Green Park, New Delhi — 110016',
  phone: '+91 11 4567 8900',
  email: 'admissions@panacea.school',
  website: 'www.panacea.school',
  affiliation: 'Recognised Early Years Centre',
  academicYear: '2026–27',
};
