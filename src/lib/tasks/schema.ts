import { z } from 'zod';

export const createTaskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  assignedTo: z.string().min(1, 'Assigned to is required'),
  assignedBy: z.string().min(1),
  dueDate: z.string().min(1, 'Due date is required'),
  dueTime: z.string().optional(),
  type: z.string().min(1, 'Task type is required'),
  label: z.string().min(1, 'Label is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Overdue', 'Cancelled']),
  description: z.string().max(2000).optional(),
});

export type CreateTaskValues = z.infer<typeof createTaskSchema>;
