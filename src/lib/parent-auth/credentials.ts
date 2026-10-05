/**
 * Demo parent portal credentials for frontend testing.
 * OTP codes are generated per challenge (never a fixed production OTP).
 */
export const PARENT_DEMO_PASSWORD = 'Parent@123';

export const PARENT_DEMO_ACCOUNTS = [
  {
    email: 'lizel@email.com',
    password: PARENT_DEMO_PASSWORD,
    label: 'Multiple students',
    hint: 'Alex Demo Student & Kavya Sharma',
  },
  {
    email: 'divya.reddy@email.com',
    password: PARENT_DEMO_PASSWORD,
    label: 'Single student',
    hint: 'Ananya Reddy → goes straight to portal',
  },
  {
    email: 'guest.parent@email.com',
    password: PARENT_DEMO_PASSWORD,
    label: 'No students',
    hint: 'Shows the empty state after OTP',
  },
] as const;

export function isValidParentDemoPassword(password: string) {
  return password.trim() === PARENT_DEMO_PASSWORD;
}
