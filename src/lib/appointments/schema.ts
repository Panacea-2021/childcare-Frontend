import { z } from 'zod';

export const createAppointmentSchema = z.object({
  calendarId: z.string().min(1, 'Select a calendar'),
  date: z.string().min(1, 'Select a date'),
  startTime: z.string().min(1, 'Select a time slot'),
  endTime: z.string().min(1),
  repeat: z.enum(['never', 'daily', 'weekly', 'monthly', 'custom']),
  audience: z.enum(['enquiry', 'student']),
  parentName: z.string().min(1, 'Parent name is required'),
  countryCode: z.string().min(1),
  phone: z.string().min(8, 'Phone number is required'),
  email: z.string().email('Enter a valid email').or(z.literal('')).optional(),
  childName: z.string().min(1, 'Child name is required'),
  gender: z.string().min(1, 'Gender is required'),
  preferredCourse: z.string().optional(),
  campus: z.string().optional(),
  facultyName: z.string().min(1, 'Assign faculty'),
  notes: z.string().optional(),
  studentId: z.string().optional(),
  relationship: z.string().optional(),
});

export type CreateAppointmentValues = z.infer<typeof createAppointmentSchema>;

export const taskSchema = z.object({
  assignedTo: z.string().min(1, 'Assigned to is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  taskType: z.string().min(1, 'Task type is required'),
  /** Optional — single label stored as a one-item array for API readiness */
  labels: z.array(z.string()).optional(),
  description: z.string().max(2000).optional(),
  /** Auto-derived from task type + enquiry when omitted */
  title: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
