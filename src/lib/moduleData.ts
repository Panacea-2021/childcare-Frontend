/** Presentation data for module UIs — rooms, staff, and students from Center Management. */

import { liveArray } from '@/lib/center-management/liveList';
import {
  loadActiveCenterRooms,
  loadActiveCenterStaff,
  loadEnrolledCenterStudents,
} from '@/lib/center-management/programCatalog';
import { roomName } from '@/lib/center-management/studentsStore';

export const rooms = liveArray(() =>
  loadActiveCenterRooms().map((room) => ({
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    ageGroup: room.ageRange || '—',
    teacher: '—',
    status: room.status || 'Active',
  })),
);

export const staff = liveArray(() =>
  loadActiveCenterStaff().map((member) => ({
    id: member.id,
    name: member.name,
    role: member.role as string,
    email: member.email,
    phone: member.phone,
    status: member.status as string,
  })),
);

export const students = liveArray(() =>
  loadEnrolledCenterStudents().map((student) => ({
    id: student.id,
    name: student.name,
    room: roomName(student.roomIds[0] || ''),
    age: student.ageLabel,
    parent: student.parents[0]?.name || '—',
    status: student.status === 'On Hold' ? 'Waitlist' : 'Enrolled',
  })),
);

export const programs = [
  { id: 'p1', name: 'Early Explorers', ageGroup: '1–2 yrs', sessions: 'Mon–Fri', seats: 8, enrolled: 6 },
  { id: 'p2', name: 'Little Learners', ageGroup: '2–3 yrs', sessions: 'Mon–Fri', seats: 12, enrolled: 11 },
  { id: 'p3', name: 'Pre-K Prep', ageGroup: '4–5 yrs', sessions: 'Mon–Fri', seats: 15, enrolled: 14 },
  { id: 'p4', name: 'Weekend Play Club', ageGroup: '2–5 yrs', sessions: 'Sat', seats: 20, enrolled: 9 },
];

export const activities = [
  { id: 'a1', title: 'Story Circle', program: 'Little Learners', day: 'Monday', time: '10:00 AM' },
  { id: 'a2', title: 'Sensory Play', program: 'Early Explorers', day: 'Tuesday', time: '11:00 AM' },
  { id: 'a3', title: 'Outdoor Adventure', program: 'Pre-K Prep', day: 'Wednesday', time: '09:30 AM' },
  { id: 'a4', title: 'Art & Craft', program: 'Little Learners', day: 'Thursday', time: '02:00 PM' },
];

export const attendanceRows = [
  { id: 'at1', name: 'Aarav Sharma', type: 'Student', room: 'Sunshine Room', status: 'Present', checkIn: '08:42', checkOut: '—' },
  { id: 'at2', name: 'Diya Patel', type: 'Student', room: 'Rainbow Room', status: 'Present', checkIn: '08:55', checkOut: '—' },
  { id: 'at3', name: 'Kabir Singh', type: 'Student', room: 'Star Room', status: 'Absent', checkIn: '—', checkOut: '—' },
  { id: 'at4', name: 'Priya Nair', type: 'Staff', room: 'Sunshine Room', status: 'Present', checkIn: '08:10', checkOut: '—' },
  { id: 'at5', name: 'Meera Shah', type: 'Staff', room: 'Star Room', status: 'Leave', checkIn: '—', checkOut: '—' },
];

export const leaveRequests = [
  { id: 'lv1', name: 'Kabir Singh', type: 'Student', from: '31 Jul 2026', to: '31 Jul 2026', reason: 'Fever', status: 'Approved' },
  { id: 'lv2', name: 'Meera Shah', type: 'Staff', from: '30 Jul 2026', to: '01 Aug 2026', reason: 'Personal', status: 'Pending' },
  { id: 'lv3', name: 'Anaya Joshi', type: 'Student', from: '02 Aug 2026', to: '03 Aug 2026', reason: 'Family travel', status: 'Pending' },
];

export const announcements = [
  { id: 'an1', title: 'Monsoon Safety Reminder', audience: 'All Parents', date: '28 Jul 2026', status: 'Published' },
  { id: 'an2', title: 'Parent-Teacher Meet', audience: 'Pre-K Parents', date: '25 Jul 2026', status: 'Published' },
  { id: 'an3', title: 'New Snack Menu', audience: 'All Parents', date: '22 Jul 2026', status: 'Draft' },
];

export const dailyReports = [
  { id: 'dr1', student: 'Aarav Sharma', mood: 'Happy', meals: 'Full', naps: '1.5 hrs', notes: 'Loved outdoor play' },
  { id: 'dr2', student: 'Diya Patel', mood: 'Calm', meals: 'Partial', naps: '1 hr', notes: 'Enjoyed painting' },
  { id: 'dr3', student: 'Kabir Singh', mood: '—', meals: '—', naps: '—', notes: 'Absent today' },
];

export const conversations = [
  { id: 'c1', name: 'Neha Sharma', preview: 'Will Aarav need an extra change of clothes?', time: '10:24', unread: 2 },
  { id: 'c2', name: 'Amit Patel', preview: 'Thanks for the daily update!', time: '09:12', unread: 0 },
  { id: 'c3', name: 'Ritu Singh', preview: 'Kabir is recovering well.', time: 'Yesterday', unread: 1 },
  { id: 'c4', name: 'Pooja Gupta', preview: 'Any update on waitlist?', time: 'Mon', unread: 0 },
];

export const invoices = [
  { id: 'inv1', family: 'Sharma', student: 'Aarav Sharma', amount: '₹12,500', due: '05 Aug 2026', status: 'Due' },
  { id: 'inv2', family: 'Patel', student: 'Diya Patel', amount: '₹12,500', due: '05 Aug 2026', status: 'Paid' },
  { id: 'inv3', family: 'Singh', student: 'Kabir Singh', amount: '₹13,200', due: '05 Aug 2026', status: 'Overdue' },
  { id: 'inv4', family: 'Joshi', student: 'Anaya Joshi', amount: '₹12,500', due: '05 Aug 2026', status: 'Paid' },
];

export const feePlans = [
  { id: 'fp1', name: 'Full Day', amount: '₹12,500', cycle: 'Monthly', programs: 'Little Learners, Pre-K' },
  { id: 'fp2', name: 'Half Day', amount: '₹8,500', cycle: 'Monthly', programs: 'Early Explorers' },
  { id: 'fp3', name: 'Weekend Club', amount: '₹2,000', cycle: 'Weekly', programs: 'Weekend Play Club' },
];

export const tours = [
  { id: 't1', family: 'Kapoor Family', date: '01 Aug 2026', time: '11:00 AM', interest: 'Pre-K Prep', status: 'Scheduled' },
  { id: 't2', family: 'Desai Family', date: '02 Aug 2026', time: '03:00 PM', interest: 'Little Learners', status: 'Confirmed' },
  { id: 't3', family: 'Nair Family', date: '28 Jul 2026', time: '10:30 AM', interest: 'Early Explorers', status: 'Completed' },
  { id: 't4', family: 'Banerjee Family', date: '04 Aug 2026', time: '12:00 PM', interest: 'Nest Room', status: 'Scheduled' },
];

export const enquiries = [
  {
    id: 'e1',
    name: 'Sneha Kapoor',
    source: 'Website',
    subSource: 'Contact Form',
    interest: 'Pre-K Prep',
    date: '29 Jul 2026',
    status: 'New',
  },
  {
    id: 'e2',
    name: 'Vikram Desai',
    source: 'Referral',
    subSource: 'Friend',
    interest: 'Little Learners',
    date: '28 Jul 2026',
    status: 'Contacted',
  },
  {
    id: 'e3',
    name: 'Leena Banerjee',
    source: 'Walk-in',
    subSource: 'Reception',
    interest: 'Nest Room',
    date: '27 Jul 2026',
    status: 'Tour Booked',
  },
  {
    id: 'e4',
    name: 'Arjun Mehta',
    source: 'Instagram',
    subSource: 'Story Ad',
    interest: 'Weekend Club',
    date: '25 Jul 2026',
    status: 'Closed',
  },
];

export const calendarEvents = [
  { day: 1, title: 'Tour — Kapoor', tone: 'mint' as const },
  { day: 2, title: 'Parent Meet', tone: 'lavender' as const },
  { day: 5, title: 'Invoice due', tone: 'beige' as const },
  { day: 8, title: 'Staff training', tone: 'blush' as const },
  { day: 12, title: 'Field trip', tone: 'mint' as const },
  { day: 18, title: 'Open day', tone: 'lavender' as const },
  { day: 22, title: 'Assessment week', tone: 'beige' as const },
  { day: 28, title: 'Birthday — Diya', tone: 'blush' as const },
];

export const assessments = [
  { id: 'as1', student: 'Aarav Sharma', area: 'Motor Skills', score: 'Emerging', date: '20 Jul 2026' },
  { id: 'as2', student: 'Diya Patel', area: 'Language', score: 'Proficient', date: '20 Jul 2026' },
  { id: 'as3', student: 'Kabir Singh', area: 'Social', score: 'Developing', date: '21 Jul 2026' },
  { id: 'as4', student: 'Anaya Joshi', area: 'Cognitive', score: 'Proficient', date: '22 Jul 2026' },
];

export const formTemplates = [
  { id: 'f1', name: 'Enrollment Form', submissions: 24, updated: '12 Jul 2026', status: 'Active' },
  { id: 'f2', name: 'Allergy & Medical', submissions: 18, updated: '08 Jul 2026', status: 'Active' },
  { id: 'f3', name: 'Field Trip Consent', submissions: 9, updated: '25 Jul 2026', status: 'Active' },
  { id: 'f4', name: 'Staff Feedback', submissions: 4, updated: '01 Jul 2026', status: 'Draft' },
];

export const formSubmissions = [
  { id: 'fs1', form: 'Enrollment Form', submitter: 'Neha Sharma', date: '29 Jul 2026', status: 'Reviewed' },
  { id: 'fs2', form: 'Allergy & Medical', submitter: 'Amit Patel', date: '28 Jul 2026', status: 'Pending' },
  { id: 'fs3', form: 'Field Trip Consent', submitter: 'Ritu Singh', date: '27 Jul 2026', status: 'Pending' },
];

export const reportCards = [
  { id: 'rp1', title: 'Attendance Summary', category: 'Operations', updated: 'Today' },
  { id: 'rp2', title: 'Fee Collection', category: 'Finance', updated: 'Yesterday' },
  { id: 'rp3', title: 'Enrollment Pipeline', category: 'CRM', updated: '2 days ago' },
  { id: 'rp4', title: 'Staff Hours', category: 'HR', updated: '3 days ago' },
  { id: 'rp5', title: 'Learning Progress', category: 'Academics', updated: '1 week ago' },
  { id: 'rp6', title: 'Parent Engagement', category: 'Communication', updated: '1 week ago' },
];

export const notifications = [
  { id: 'n1', title: 'Leave request pending', body: 'Meera Shah requested leave through 1 Aug.', time: '12 min ago', type: 'Alert', read: false },
  { id: 'n2', title: 'Invoice overdue', body: 'Singh family invoice is past due.', time: '1 hr ago', type: 'Billing', read: false },
  { id: 'n3', title: 'Tour confirmed', body: 'Desai Family confirmed for 2 Aug, 3:00 PM.', time: '3 hrs ago', type: 'CRM', read: true },
  { id: 'n4', title: 'Daily report ready', body: 'Sunshine Room reports are ready to share.', time: 'Yesterday', type: 'Updates', read: true },
  { id: 'n5', title: 'New enquiry', body: 'Sneha Kapoor submitted a website enquiry.', time: 'Yesterday', type: 'CRM', read: true },
];

export function badgeClass(status: string) {
  const s = status.toLowerCase();
  if (['active', 'paid', 'present', 'published', 'approved', 'confirmed', 'completed', 'enrolled', 'proficient', 'reviewed'].includes(s)) {
    return 'ui-badge ui-badge-mint';
  }
  if (['pending', 'due', 'draft', 'new', 'scheduled', 'waitlist', 'contacted', 'emerging', 'developing'].includes(s)) {
    return 'ui-badge ui-badge-lavender';
  }
  if (['overdue', 'absent', 'leave', 'on leave', 'closed', 'full'].includes(s)) {
    return 'ui-badge ui-badge-blush';
  }
  return 'ui-badge';
}
