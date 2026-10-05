export type TextStyle = {
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
};

export type FooterFieldStyle = TextStyle & {
  enabled: boolean;
  label: string;
};

export type SignatureType = 'none' | 'digital' | 'upload';

export type SignatureFieldStyle = FooterFieldStyle & {
  signatureType: SignatureType;
  /** Drawn or uploaded signature image (data URL). Optional. */
  imageDataUrl: string | null;
};

export type CertificateStyleState = {
  schoolName: TextStyle & { text: string };
  header: TextStyle & { text: string };
  subheader: TextStyle & { text: string };
  name: TextStyle & { text: string; outlined: boolean };
  body: TextStyle & { text: string };
  date: FooterFieldStyle;
  signature: SignatureFieldStyle;
};

/** Panacea uses Poppins only — keep a single option for style pickers. */
export const FONT_FAMILIES = ['Poppins'] as const;

export const FONT_WEIGHTS = ['Normal', 'Medium', 'SemiBold', 'Bold'] as const;

export function fontWeightValue(weight: string): number {
  switch (weight) {
    case 'Normal':
      return 400;
    case 'Medium':
      return 500;
    case 'SemiBold':
      return 600;
    case 'Bold':
    default:
      return 700;
  }
}

export function fontFamilyCss(_family?: string): string {
  return `var(--font-body), Poppins, sans-serif`;
}

export function createDefaultCertificateStyles(opts?: {
  schoolName?: string;
  title?: string;
  subtitle?: string;
  sampleName?: string;
  body?: string;
  signatory?: string;
}): CertificateStyleState {
  return {
    schoolName: {
      text: opts?.schoolName ?? 'Panacea | Childcare',
      color: '#242424',
      fontSize: 20,
      fontFamily: 'Poppins',
      fontWeight: 'Bold',
    },
    header: {
      text: opts?.title ?? 'Certificate of Participation',
      color: '#9B2C2C',
      fontSize: 32,
      fontFamily: 'Poppins',
      fontWeight: 'Bold',
    },
    subheader: {
      text: opts?.subtitle ?? 'This Certificate is Proudly Presented To :',
      color: '#749F8B',
      fontSize: 18,
      fontFamily: 'Poppins',
      fontWeight: 'Medium',
    },
    name: {
      text: opts?.sampleName ?? 'Olivia Wilson',
      color: '#111827',
      fontSize: 48,
      fontFamily: 'Poppins',
      fontWeight: 'Bold',
      outlined: true,
    },
    body: {
      text:
        opts?.body ??
        'In Recognition For a Record of Outstanding Accomplishments. For your hard work and dedication. For inspiring children to learn. For your willingness to give your all beyond what you earn.',
      color: '#4B5563',
      fontSize: 13,
      fontFamily: 'Poppins',
      fontWeight: 'Normal',
    },
    date: {
      enabled: true,
      label: 'Date',
      color: '#749F8B',
      fontSize: 14,
      fontFamily: 'Poppins',
      fontWeight: 'Medium',
    },
    signature: {
      enabled: true,
      label: opts?.signatory ?? 'Signature',
      color: '#749F8B',
      fontSize: 14,
      fontFamily: 'Poppins',
      fontWeight: 'Medium',
      signatureType: 'upload',
      imageDataUrl: null,
    },
  };
}
