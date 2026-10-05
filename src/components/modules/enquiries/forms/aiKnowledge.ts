import type { FieldType, FormField } from './types';

export type AiFormKind =
  | 'admission'
  | 'event-rsvp'
  | 'parent-feedback'
  | 'volunteer'
  | 'attendance'
  | 'incident'
  | 'document-request'
  | 'medical'
  | 'generic';

type FieldDef = {
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  width?: FormField['width'];
  helpText?: string;
};

function makeFields(defs: FieldDef[], prefix: string): FormField[] {
  return defs.map((d, i) => ({
    id: `${prefix}-${i}-${Math.random().toString(36).slice(2, 6)}`,
    type: d.type,
    label: d.label,
    placeholder:
      d.type === 'heading' || d.type === 'paragraph' || d.type === 'divider' || d.type === 'spacer'
        ? undefined
        : `Enter ${d.label.toLowerCase()}`,
    required: d.required ?? !['heading', 'paragraph', 'divider', 'spacer', 'multi-step'].includes(d.type),
    width: d.width ?? 'full',
    size: 'md' as const,
    visibility: 'visible' as const,
    options: d.options ? [...d.options] : undefined,
    helpText: d.helpText ?? '',
    defaultValue: '',
    validation: '',
    conditionalLogic: '',
  }));
}

/** Essential packs the “AI” is trained on (frontend mock knowledge). */
const KNOWLEDGE: Record<
  AiFormKind,
  { title: string; description: string; category: string; sections: FieldDef[] }
> = {
  admission: {
    title: 'Student Admission Form',
    description: 'Complete official admission application for new enrollments.',
    category: 'Documents',
    sections: [
      { type: 'heading', label: '1. Student Particulars', required: false },
      { type: 'text', label: 'Full Name of Student (as per birth certificate)', width: 'half' },
      { type: 'text', label: 'Preferred / Nick Name', width: 'half', required: false },
      { type: 'date', label: 'Date of Birth', width: 'half' },
      { type: 'text', label: 'Place of Birth', width: 'half' },
      { type: 'radio', label: 'Gender', options: ['Male', 'Female', 'Other'], width: 'half' },
      { type: 'dropdown', label: 'Blood Group', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'], width: 'half' },
      { type: 'text', label: 'Nationality', width: 'half' },
      { type: 'text', label: 'Mother Tongue', width: 'half' },
      { type: 'text', label: 'Religion', width: 'half', required: false },
      { type: 'text', label: 'Aadhaar / ID Number', width: 'half', required: false },

      { type: 'heading', label: '2. Program / Class Seeking Admission', required: false },
      { type: 'dropdown', label: 'Program Applied For', options: ['Playgroup', 'Nursery', 'LKG', 'UKG', 'Daycare Only', 'After-School'] },
      { type: 'date', label: 'Preferred Date of Joining', width: 'half' },
      { type: 'dropdown', label: 'Session Preference', options: ['Full Day', 'Half Day (Morning)', 'Half Day (Afternoon)'], width: 'half' },
      { type: 'dropdown', label: 'Academic Year', options: ['2026–27', '2027–28'], width: 'half' },
      { type: 'text', label: 'Previous School / Daycare (if any)', width: 'half', required: false },

      { type: 'heading', label: '3. Father / Guardian Information', required: false },
      { type: 'text', label: "Father's Full Name", width: 'half' },
      { type: 'text', label: 'Occupation', width: 'half' },
      { type: 'text', label: 'Organisation / Workplace', width: 'half', required: false },
      { type: 'phone', label: 'Mobile Number', width: 'half' },
      { type: 'email', label: 'Email Address', width: 'half' },
      { type: 'phone', label: 'Office Telephone', width: 'half', required: false },

      { type: 'heading', label: '4. Mother / Guardian Information', required: false },
      { type: 'text', label: "Mother's Full Name", width: 'half' },
      { type: 'text', label: 'Occupation', width: 'half' },
      { type: 'text', label: 'Organisation / Workplace', width: 'half', required: false },
      { type: 'phone', label: 'Mobile Number', width: 'half' },
      { type: 'email', label: 'Email Address', width: 'half' },

      { type: 'heading', label: '5. Residential Address', required: false },
      { type: 'address', label: 'Permanent Address' },
      { type: 'text', label: 'City', width: 'third' },
      { type: 'text', label: 'State', width: 'third' },
      { type: 'text', label: 'PIN / Postal Code', width: 'third' },
      { type: 'textarea', label: 'Correspondence Address (if different)', required: false },

      { type: 'heading', label: '6. Emergency Contact & Pickup Authorization', required: false },
      { type: 'text', label: 'Emergency Contact Name', width: 'half' },
      { type: 'text', label: 'Relationship to Child', width: 'half' },
      { type: 'phone', label: 'Emergency Phone', width: 'half' },
      { type: 'text', label: 'Authorized Pickup Person 1', width: 'half' },
      { type: 'phone', label: 'Pickup Person 1 Phone', width: 'half' },
      { type: 'text', label: 'Authorized Pickup Person 2', width: 'half', required: false },

      { type: 'heading', label: '7. Medical Information', required: false },
      { type: 'textarea', label: 'Known Allergies', required: false },
      { type: 'textarea', label: 'Current Medication / Special Needs', required: false },
      { type: 'textarea', label: 'Pediatrician Name & Clinic Contact', required: false },
      { type: 'checkbox', label: 'Immunization Status', options: ['Up to date', 'Partial', 'Exemption on file'], required: false },

      { type: 'heading', label: '8. Documents to be Submitted', required: false },
      {
        type: 'checkbox',
        label: 'Documents Enclosed',
        options: [
          'Birth Certificate',
          'Passport-size Photographs (4)',
          'Address Proof',
          'Immunization Record',
          'Previous School TC / Report',
          'Aadhaar / ID Copy',
        ],
        required: false,
      },
      { type: 'upload', label: 'Upload Supporting Documents', required: false },

      { type: 'heading', label: '9. Declaration by Parent / Guardian', required: false },
      {
        type: 'paragraph',
        label:
          'I hereby declare that the information furnished above is true and complete to the best of my knowledge. I agree to abide by the rules and regulations of Panacea Early Learning Academy.',
        required: false,
      },
      { type: 'terms', label: 'I confirm the above declaration and consent to processing of this information for admission purposes.' },
      { type: 'signature', label: "Parent / Guardian's Signature", width: 'half' },
      { type: 'date', label: 'Date', width: 'half' },
    ],
  },
  'event-rsvp': {
    title: 'Event RSVP Form',
    description: 'Official RSVP for school events and celebrations.',
    category: 'Events',
    sections: [
      { type: 'heading', label: '1. Event Details', required: false },
      { type: 'text', label: 'Event Name' },
      { type: 'date', label: 'Event Date', width: 'half' },
      { type: 'time', label: 'Reporting Time', width: 'half' },
      { type: 'heading', label: '2. Attendee Information', required: false },
      { type: 'text', label: 'Student Name', width: 'half' },
      { type: 'text', label: 'Class / Section', width: 'half' },
      { type: 'text', label: 'Parent / Guardian Name', width: 'half' },
      { type: 'phone', label: 'Contact Number', width: 'half' },
      { type: 'radio', label: 'Will you attend?', options: ['Yes', 'No', 'Maybe'] },
      { type: 'number', label: 'Number of Family Members Attending', width: 'half' },
      { type: 'textarea', label: 'Food Allergies / Dietary Requirements', required: false },
      { type: 'signature', label: 'Parent Signature', width: 'half' },
      { type: 'date', label: 'Date', width: 'half' },
    ],
  },
  'parent-feedback': {
    title: 'Parent Feedback Form',
    description: 'Official parent feedback questionnaire.',
    category: 'Feedback',
    sections: [
      { type: 'heading', label: '1. Respondent Details', required: false },
      { type: 'text', label: 'Parent Name', width: 'half' },
      { type: 'text', label: 'Student Name', width: 'half' },
      { type: 'text', label: 'Class / Program', width: 'half' },
      { type: 'date', label: 'Date', width: 'half' },
      { type: 'heading', label: '2. Feedback', required: false },
      { type: 'rating', label: 'Overall Satisfaction' },
      { type: 'rating', label: 'Teaching Quality' },
      { type: 'rating', label: 'Communication with Parents' },
      { type: 'rating', label: 'Safety & Hygiene' },
      { type: 'textarea', label: 'What do you appreciate most?' },
      { type: 'textarea', label: 'Suggestions for Improvement', required: false },
      { type: 'radio', label: 'Would you recommend our academy?', options: ['Yes', 'No', 'Maybe'] },
      { type: 'signature', label: 'Parent Signature', width: 'half' },
    ],
  },
  volunteer: {
    title: 'Volunteer Sign-up Form',
    description: 'Official volunteer registration for parent helpers.',
    category: 'Operations',
    sections: [
      { type: 'heading', label: '1. Volunteer Details', required: false },
      { type: 'text', label: 'Full Name', width: 'half' },
      { type: 'text', label: 'Relationship to Student', width: 'half' },
      { type: 'email', label: 'Email', width: 'half' },
      { type: 'phone', label: 'Phone', width: 'half' },
      { type: 'address', label: 'Address' },
      { type: 'heading', label: '2. Availability & Interests', required: false },
      { type: 'checkbox', label: 'Areas of Interest', options: ['Classroom Support', 'Events', 'Field Trips', 'Fundraising', 'Library', 'Sports'] },
      { type: 'date', label: 'Preferred Start Date', width: 'half' },
      { type: 'textarea', label: 'Days / Hours Available' },
      { type: 'terms', label: 'I consent to a background verification check if required.' },
      { type: 'signature', label: 'Signature', width: 'half' },
      { type: 'date', label: 'Date', width: 'half' },
    ],
  },
  attendance: {
    title: 'Daily Attendance Form',
    description: 'Official daily drop-off and pick-up record.',
    category: 'Attendance',
    sections: [
      { type: 'heading', label: 'Attendance Record', required: false },
      { type: 'text', label: 'Student Name', width: 'half' },
      { type: 'text', label: 'Class / Room', width: 'half' },
      { type: 'date', label: 'Date', width: 'half' },
      { type: 'time', label: 'Drop-off Time', width: 'half' },
      { type: 'text', label: 'Dropped Off By', width: 'half' },
      { type: 'time', label: 'Pick-up Time', width: 'half' },
      { type: 'text', label: 'Picked Up By', width: 'half' },
      { type: 'signature', label: 'Parent / Guardian Signature' },
    ],
  },
  incident: {
    title: 'Incident Report Form',
    description: 'Official incident documentation form.',
    category: 'Operations',
    sections: [
      { type: 'heading', label: '1. Incident Particulars', required: false },
      { type: 'text', label: 'Student Name', width: 'half' },
      { type: 'text', label: 'Class / Room', width: 'half' },
      { type: 'date', label: 'Date of Incident', width: 'half' },
      { type: 'time', label: 'Time of Incident', width: 'half' },
      { type: 'text', label: 'Location' },
      { type: 'textarea', label: 'Description of Incident' },
      { type: 'textarea', label: 'Injuries / Immediate Action Taken' },
      { type: 'textarea', label: 'Witnesses (if any)', required: false },
      { type: 'heading', label: '2. Acknowledgement', required: false },
      { type: 'signature', label: 'Staff Signature', width: 'half' },
      { type: 'signature', label: 'Parent Signature', width: 'half' },
      { type: 'date', label: 'Date', width: 'half' },
    ],
  },
  'document-request': {
    title: 'Document Request Form',
    description: 'Official request for school documents.',
    category: 'Documents',
    sections: [
      { type: 'heading', label: 'Request Details', required: false },
      { type: 'text', label: 'Parent Name', width: 'half' },
      { type: 'text', label: 'Student Name', width: 'half' },
      { type: 'text', label: 'Class / Program', width: 'half' },
      { type: 'dropdown', label: 'Document Required', options: ['Transfer Certificate', 'Bonafide Certificate', 'Fee Receipt', 'Immunization Copy', 'Progress Report', 'Other'] },
      { type: 'textarea', label: 'Purpose of Request' },
      { type: 'date', label: 'Required By Date', width: 'half' },
      { type: 'upload', label: 'Supporting Document (optional)', required: false },
      { type: 'signature', label: 'Parent Signature', width: 'half' },
      { type: 'date', label: 'Date', width: 'half' },
    ],
  },
  medical: {
    title: 'Medical & Consent Form',
    description: 'Official medical information and treatment consent.',
    category: 'Documents',
    sections: [
      { type: 'heading', label: '1. Student Medical Profile', required: false },
      { type: 'text', label: 'Student Name', width: 'half' },
      { type: 'date', label: 'Date of Birth', width: 'half' },
      { type: 'dropdown', label: 'Blood Group', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'], width: 'half' },
      { type: 'textarea', label: 'Allergies' },
      { type: 'textarea', label: 'Chronic Conditions / Medication' },
      { type: 'text', label: 'Pediatrician Name', width: 'half' },
      { type: 'phone', label: 'Pediatrician Phone', width: 'half' },
      { type: 'heading', label: '2. Emergency Consent', required: false },
      { type: 'terms', label: 'I authorize the school to seek emergency medical treatment if I cannot be reached.' },
      { type: 'signature', label: 'Parent Signature', width: 'half' },
      { type: 'date', label: 'Date', width: 'half' },
    ],
  },
  generic: {
    title: 'Student Information Form',
    description: 'Official student information form.',
    category: 'Operations',
    sections: [
      { type: 'heading', label: 'Student Details', required: false },
      { type: 'text', label: 'Student Name', width: 'half' },
      { type: 'text', label: 'Parent Name', width: 'half' },
      { type: 'date', label: 'Date of Birth', width: 'half' },
      { type: 'phone', label: 'Contact Number', width: 'half' },
      { type: 'email', label: 'Email Address' },
      { type: 'address', label: 'Address' },
      { type: 'textarea', label: 'Additional Notes', required: false },
      { type: 'signature', label: 'Parent Signature', width: 'half' },
      { type: 'date', label: 'Date', width: 'half' },
    ],
  },
};

const KIND_KEYWORDS: Array<{ kind: AiFormKind; words: string[] }> = [
  { kind: 'admission', words: ['admission', 'enrollment', 'enrolment', 'registration', 'admit', 'new student', 'application'] },
  { kind: 'event-rsvp', words: ['rsvp', 'event', 'invitation', 'celebration', 'sports day', 'annual day'] },
  { kind: 'parent-feedback', words: ['feedback', 'survey', 'rating', 'satisfaction', 'review'] },
  { kind: 'volunteer', words: ['volunteer', 'helper', 'parent helper'] },
  { kind: 'attendance', words: ['attendance', 'drop-off', 'pickup', 'pick-up', 'daily register'] },
  { kind: 'incident', words: ['incident', 'accident', 'injury', 'report'] },
  { kind: 'document-request', words: ['document request', 'bonafide', 'transfer certificate', 'tc request', 'certificate'] },
  { kind: 'medical', words: ['medical', 'health', 'allergy', 'immunization', 'consent form'] },
];

export function detectFormKind(prompt: string): AiFormKind {
  const p = prompt.toLowerCase();
  for (const row of KIND_KEYWORDS) {
    if (row.words.some((w) => p.includes(w))) return row.kind;
  }
  return 'generic';
}

export function generateFromKnowledge(kind: AiFormKind, prefix = 'ai') {
  const pack = KNOWLEDGE[kind];
  return {
    kind,
    title: pack.title,
    description: pack.description,
    category: pack.category,
    fields: makeFields(pack.sections, prefix),
    sectionTitles: pack.sections.filter((s) => s.type === 'heading').map((s) => s.label),
  };
}

/** Parse free-text additions like "add sibling information in section 3" or a list of field names. */
export function parseRefinePrompt(prompt: string, existing: FormField[]): FormField[] {
  const lines = prompt
    .split(/[\n,;]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const extras: FormField[] = [];
  const lower = prompt.toLowerCase();

  // Insert under a matching section heading when mentioned
  let insertAfterHeading: string | null = null;
  const sectionMatch = lower.match(/section\s*(\d+)|under\s+([a-z0-9 &/.-]+)/i);
  if (sectionMatch) {
    if (sectionMatch[1]) insertAfterHeading = sectionMatch[1];
    else if (sectionMatch[2]) insertAfterHeading = sectionMatch[2].trim();
  }

  const skipWords = /^(add|please|also|include|under|in|the|section|field|fields|more|want|to|with)$/i;
  const labelCandidates = lines
    .flatMap((l) => l.replace(/^(add|include|please add)\s+/i, '').split(/\band\b/i))
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && !skipWords.test(s) && !/^section\s*\d+/i.test(s));

  const inferred = labelCandidates.length
    ? labelCandidates
    : prompt
        .replace(/add|include|please|fields?|under|section\s*\d+/gi, ' ')
        .split(/[\s,]+/)
        .filter((w) => w.length > 3)
        .slice(0, 0);

  const toAdd = inferred.length
    ? inferred
    : [
        // sensible defaults if prompt is vague
        ...(lower.includes('sibling') ? ['Sibling Name', 'Sibling Age / Class'] : []),
        ...(lower.includes('transport') ? ['Transport Required', 'Bus Route / Stop'] : []),
        ...(lower.includes('photo') ? ['Passport Photograph Upload'] : []),
        ...(lower.includes('language') ? ['Languages Spoken at Home'] : []),
      ];

  if (!toAdd.length && prompt.trim()) {
    toAdd.push(prompt.trim().replace(/^(add|include)\s+/i, '').slice(0, 80));
  }

  toAdd.forEach((label, i) => {
    const clean = label.replace(/[.]+$/, '').trim();
    if (!clean) return;
    const type: FieldType = /email/i.test(clean)
      ? 'email'
      : /phone|mobile|contact/i.test(clean)
        ? 'phone'
        : /date|dob|birth/i.test(clean)
          ? 'date'
          : /upload|photo|document/i.test(clean)
            ? 'upload'
            : /address/i.test(clean)
              ? 'address'
              : /signature/i.test(clean)
                ? 'signature'
                : /note|detail|description|remark/i.test(clean)
                  ? 'textarea'
                  : 'text';
    extras.push({
      id: `refine-${Date.now()}-${i}`,
      type,
      label: clean,
      placeholder: `Enter ${clean.toLowerCase()}`,
      required: false,
      width: 'half',
      size: 'md',
      visibility: 'visible',
      helpText: 'Added via AI refine',
      defaultValue: '',
      validation: '',
      conditionalLogic: '',
    });
  });

  if (!extras.length) return existing;

  // Place after matching heading if possible
  if (insertAfterHeading) {
    const idx = existing.findIndex((f) => {
      if (f.type !== 'heading') return false;
      const lab = f.label.toLowerCase();
      if (/^\d+$/.test(insertAfterHeading!)) return lab.startsWith(`${insertAfterHeading}.`) || lab.includes(` ${insertAfterHeading}.`);
      return lab.includes(insertAfterHeading!);
    });
    if (idx >= 0) {
      const next = [...existing];
      // find end of that section (next heading)
      let end = idx + 1;
      while (end < next.length && next[end].type !== 'heading') end += 1;
      next.splice(end, 0, ...extras);
      return next;
    }
  }

  // Before declaration / signature block if present
  const declIdx = existing.findIndex((f) => /declaration|signature/i.test(f.label) && (f.type === 'heading' || f.type === 'terms'));
  if (declIdx > 0) {
    const next = [...existing];
    next.splice(declIdx, 0, { id: `refine-h-${Date.now()}`, type: 'heading', label: 'Additional Information', required: false, width: 'full', size: 'md', visibility: 'visible', helpText: '', defaultValue: '', validation: '', conditionalLogic: '' }, ...extras);
    return next;
  }

  return [...existing, ...extras];
}

export function listKnowledgeKinds(): Array<{ kind: AiFormKind; title: string; description: string }> {
  return (Object.keys(KNOWLEDGE) as AiFormKind[]).map((kind) => ({
    kind,
    title: KNOWLEDGE[kind].title,
    description: KNOWLEDGE[kind].description,
  }));
}
