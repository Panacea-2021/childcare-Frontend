import type { Metadata } from 'next';
import { AttendanceExperience } from '@/components/landing/attendance/AttendanceExperience';

export const metadata: Metadata = {
  title: 'Attendance & Occupancy | Panacea Childcare Software',
  description:
    'Ensure accurate childcare attendance with Panacea — contactless check-in, live occupancy, safety compliance, and attendance-based billing.',
};

export default function AttendanceFeaturePage() {
  return <AttendanceExperience />;
}
