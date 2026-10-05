import { z } from 'zod';
import { isLostStageName } from '@/lib/enquiries/stagesStore';

export const enquiryFormSchema = z
  .object({
    studentName: z.string().trim().min(1, 'Student name is required'),
    stage: z.string().trim().min(1, 'Stage is required'),
    gender: z.enum(['Male', 'Female', 'Prefer Not to Say']),
    dateOfBirth: z.string().optional().default(''),
    preferredName: z.string().optional().default(''),
    emergencyContactName: z.string().optional().default(''),
    emergencyContactNumber: z
      .string()
      .optional()
      .default('')
      .refine((v) => !v || /^[+0-9\s()-]{7,}$/.test(v), 'Enter a valid phone number'),
    school: z.string().optional().default(''),
    address: z.string().optional().default(''),
    subParent: z.string().optional().default(''),
    createdOn: z.string().min(1, 'Created on is required'),
    assignedTo: z.string().min(1, 'Assigned to is required'),
    source: z.string().min(1, 'Source is required'),
    subSource: z.string().optional().default(''),
    lostReason: z.string().optional().default(''),
    program: z.string().min(1, 'Program is required'),
    expectedStartDate: z.string().optional().default(''),
    additionalNotes: z.string().max(1000, 'Maximum 1000 characters').optional().default(''),
    motherName: z.string().optional().default(''),
    motherPhone: z
      .string()
      .optional()
      .default('')
      .refine((v) => !v || /^[+0-9\s()-]{7,}$/.test(v), 'Enter a valid phone number'),
    motherEmail: z
      .string()
      .optional()
      .default('')
      .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email'),
    motherCompany: z.string().optional().default(''),
    fatherName: z.string().optional().default(''),
    fatherPhone: z
      .string()
      .optional()
      .default('')
      .refine((v) => !v || /^[+0-9\s()-]{7,}$/.test(v), 'Enter a valid phone number'),
    fatherEmail: z
      .string()
      .optional()
      .default('')
      .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email'),
    fatherCompany: z.string().optional().default(''),
    customValues: z.record(z.string(), z.union([z.string(), z.boolean()])).default({}),
  })
  .superRefine((val, ctx) => {
    if (isLostStageName(val.stage) && !val.lostReason?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Lost reason is required',
        path: ['lostReason'],
      });
    }
    if (!val.subSource?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Sub Source is required',
        path: ['subSource'],
      });
    }
  });

export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;

export const customFieldSchema = z
  .object({
    label: z.string().trim().min(1, 'Field label is required'),
    type: z.enum([
      'Text',
      'Number',
      'Email',
      'Phone',
      'Date',
      'Textarea',
      'Dropdown',
      'Checkbox',
      'Radio Button',
    ]),
    required: z.boolean(),
    placeholder: z.string().optional().default(''),
    optionsText: z.string().optional().default(''),
  })
  .superRefine((val, ctx) => {
    if (val.type === 'Dropdown' || val.type === 'Radio Button') {
      const opts = (val.optionsText ?? '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      if (opts.length < 2) {
        ctx.addIssue({
          code: 'custom',
          message: 'Add at least two options (one per line)',
          path: ['optionsText'],
        });
      }
    }
  });

export type CustomFieldFormValues = z.infer<typeof customFieldSchema>;
