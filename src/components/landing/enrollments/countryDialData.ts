export type DialCountry = {
  code: string;
  iso: string;
  name: string;
  flag: string;
  /** National significant number length (digits only). */
  maxDigits: number;
  minDigits?: number;
};

/** Curated dial list used by enrollment demo booking. */
export const DIAL_COUNTRIES: DialCountry[] = [
  { code: '+91', iso: 'IN', name: 'India', flag: '🇮🇳', maxDigits: 10, minDigits: 10 },
  { code: '+1', iso: 'US', name: 'United States', flag: '🇺🇸', maxDigits: 10, minDigits: 10 },
  { code: '+1', iso: 'CA', name: 'Canada', flag: '🇨🇦', maxDigits: 10, minDigits: 10 },
  { code: '+44', iso: 'GB', name: 'United Kingdom', flag: '🇬🇧', maxDigits: 10, minDigits: 10 },
  { code: '+971', iso: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', maxDigits: 9, minDigits: 9 },
  { code: '+65', iso: 'SG', name: 'Singapore', flag: '🇸🇬', maxDigits: 8, minDigits: 8 },
  { code: '+61', iso: 'AU', name: 'Australia', flag: '🇦🇺', maxDigits: 9, minDigits: 9 },
  { code: '+64', iso: 'NZ', name: 'New Zealand', flag: '🇳🇿', maxDigits: 9, minDigits: 8 },
  { code: '+966', iso: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', maxDigits: 9, minDigits: 9 },
  { code: '+974', iso: 'QA', name: 'Qatar', flag: '🇶🇦', maxDigits: 8, minDigits: 8 },
  { code: '+965', iso: 'KW', name: 'Kuwait', flag: '🇰🇼', maxDigits: 8, minDigits: 8 },
  { code: '+973', iso: 'BH', name: 'Bahrain', flag: '🇧🇭', maxDigits: 8, minDigits: 8 },
  { code: '+968', iso: 'OM', name: 'Oman', flag: '🇴🇲', maxDigits: 8, minDigits: 8 },
  { code: '+60', iso: 'MY', name: 'Malaysia', flag: '🇲🇾', maxDigits: 10, minDigits: 9 },
  { code: '+62', iso: 'ID', name: 'Indonesia', flag: '🇮🇩', maxDigits: 12, minDigits: 9 },
  { code: '+63', iso: 'PH', name: 'Philippines', flag: '🇵🇭', maxDigits: 10, minDigits: 10 },
  { code: '+66', iso: 'TH', name: 'Thailand', flag: '🇹🇭', maxDigits: 9, minDigits: 9 },
  { code: '+84', iso: 'VN', name: 'Vietnam', flag: '🇻🇳', maxDigits: 10, minDigits: 9 },
  { code: '+81', iso: 'JP', name: 'Japan', flag: '🇯🇵', maxDigits: 10, minDigits: 10 },
  { code: '+82', iso: 'KR', name: 'South Korea', flag: '🇰🇷', maxDigits: 10, minDigits: 9 },
  { code: '+86', iso: 'CN', name: 'China', flag: '🇨🇳', maxDigits: 11, minDigits: 11 },
  { code: '+852', iso: 'HK', name: 'Hong Kong', flag: '🇭🇰', maxDigits: 8, minDigits: 8 },
  { code: '+49', iso: 'DE', name: 'Germany', flag: '🇩🇪', maxDigits: 11, minDigits: 10 },
  { code: '+33', iso: 'FR', name: 'France', flag: '🇫🇷', maxDigits: 9, minDigits: 9 },
  { code: '+39', iso: 'IT', name: 'Italy', flag: '🇮🇹', maxDigits: 10, minDigits: 9 },
  { code: '+34', iso: 'ES', name: 'Spain', flag: '🇪🇸', maxDigits: 9, minDigits: 9 },
  { code: '+31', iso: 'NL', name: 'Netherlands', flag: '🇳🇱', maxDigits: 9, minDigits: 9 },
  { code: '+46', iso: 'SE', name: 'Sweden', flag: '🇸🇪', maxDigits: 9, minDigits: 7 },
  { code: '+47', iso: 'NO', name: 'Norway', flag: '🇳🇴', maxDigits: 8, minDigits: 8 },
  { code: '+41', iso: 'CH', name: 'Switzerland', flag: '🇨🇭', maxDigits: 9, minDigits: 9 },
  { code: '+353', iso: 'IE', name: 'Ireland', flag: '🇮🇪', maxDigits: 9, minDigits: 9 },
  { code: '+27', iso: 'ZA', name: 'South Africa', flag: '🇿🇦', maxDigits: 9, minDigits: 9 },
  { code: '+234', iso: 'NG', name: 'Nigeria', flag: '🇳🇬', maxDigits: 10, minDigits: 10 },
  { code: '+254', iso: 'KE', name: 'Kenya', flag: '🇰🇪', maxDigits: 9, minDigits: 9 },
  { code: '+55', iso: 'BR', name: 'Brazil', flag: '🇧🇷', maxDigits: 11, minDigits: 10 },
  { code: '+52', iso: 'MX', name: 'Mexico', flag: '🇲🇽', maxDigits: 10, minDigits: 10 },
  { code: '+57', iso: 'CO', name: 'Colombia', flag: '🇨🇴', maxDigits: 10, minDigits: 10 },
  { code: '+56', iso: 'CL', name: 'Chile', flag: '🇨🇱', maxDigits: 9, minDigits: 9 },
  { code: '+54', iso: 'AR', name: 'Argentina', flag: '🇦🇷', maxDigits: 10, minDigits: 10 },
  { code: '+92', iso: 'PK', name: 'Pakistan', flag: '🇵🇰', maxDigits: 10, minDigits: 10 },
  { code: '+880', iso: 'BD', name: 'Bangladesh', flag: '🇧🇩', maxDigits: 10, minDigits: 10 },
  { code: '+94', iso: 'LK', name: 'Sri Lanka', flag: '🇱🇰', maxDigits: 9, minDigits: 9 },
  { code: '+977', iso: 'NP', name: 'Nepal', flag: '🇳🇵', maxDigits: 10, minDigits: 10 },
];

export type SelectedDial = {
  iso: string;
  code: string;
};

export function findDialCountry(iso: string): DialCountry {
  return DIAL_COUNTRIES.find((c) => c.iso === iso) ?? DIAL_COUNTRIES[0];
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function clampPhoneDigits(value: string, maxDigits: number): string {
  return digitsOnly(value).slice(0, maxDigits);
}

export function isValidPhoneForCountry(phone: string, country: DialCountry): boolean {
  const digits = digitsOnly(phone);
  const min = country.minDigits ?? country.maxDigits;
  return digits.length >= min && digits.length <= country.maxDigits;
}

export const DEMO_LEAD_STORAGE_KEY = 'panacea-demo-lead';

export type DemoLeadPayload = {
  fullName: string;
  schoolName: string;
  email: string;
  countryIso: string;
  countryCode: string;
  phone: string;
  centers: string;
  role: string;
};
