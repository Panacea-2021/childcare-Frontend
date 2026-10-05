export type PersonType = 'student' | 'staff';

export type ProfileColor =
  | 'sky'
  | 'mint'
  | 'yellow'
  | 'pink'
  | 'lavender'
  | 'peach'
  | 'purple'
  | 'rose';

export type BirthdayFilter =
  | 'all'
  | 'students'
  | 'staff'
  | 'today'
  | 'week'
  | 'month'
  | 'upcoming';

export type BirthdayEntry = {
  id: string;
  name: string;
  type: PersonType;
  /** ISO date of birth YYYY-MM-DD */
  birthDate: string;
  profileColor: ProfileColor;
  notes?: string;
  relationship?: string;
  role?: string;
  room?: string;
};

export type BirthdayFormState = {
  type: PersonType;
  name: string;
  birthDate: string;
  profileColor: ProfileColor;
  notes: string;
  relationship: string;
};

export const PROFILE_COLORS: { id: ProfileColor; label: string; hex: string }[] = [
  { id: 'sky', label: 'Sky Blue', hex: '#BAE6FD' },
  { id: 'mint', label: 'Mint', hex: '#A7F3D0' },
  { id: 'yellow', label: 'Light Yellow', hex: '#FEF08A' },
  { id: 'pink', label: 'Baby Pink', hex: '#FBCFE8' },
  { id: 'lavender', label: 'Lavender', hex: '#DDD6FE' },
  { id: 'peach', label: 'Peach', hex: '#FED7AA' },
  { id: 'purple', label: 'Soft Purple', hex: '#E9D5FF' },
  { id: 'rose', label: 'Rose', hex: '#FECDD3' },
];

export const STUDENT_NAME_SUGGESTIONS = [
  'Aarav Patel',
  'Siya Sharma',
  'Emma Wilson',
  'Sophia Chen',
  'Liam Johnson',
  'Olivia Brown',
  'Noah Garcia',
  'Mia Kapoor',
  'Ethan Lee',
  'Ava Martinez',
];

export const STAFF_NAME_SUGGESTIONS = [
  'Priya Nair',
  'Ananya Rao',
  'Meera Shah',
  'Rohit Menon',
  'Kavya Iyer',
  'Malika Thimisetty',
];
