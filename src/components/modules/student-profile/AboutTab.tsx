'use client';

import { motion } from 'framer-motion';
import { ClipboardList, UserRound, Users } from 'lucide-react';
import type { StudentProfile } from '@/lib/students/profileTypes';
import { InfoSectionCard } from './InfoSectionCard';
import { staggerContainer } from './animations';

type Props = { student: StudentProfile };

export function AboutTab({ student }: Props) {
  return (
    <motion.div
      className="sp-about"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <InfoSectionCard
        icon={<UserRound size={18} />}
        title="Child Information"
        fields={[
          { label: 'Student Name', value: student.name },
          { label: 'Student ID', value: student.studentId },
          { label: 'Gender', value: student.gender },
          { label: 'DOB', value: student.dob },
          { label: 'Age', value: student.age },
          { label: 'Nationality', value: student.nationality },
          { label: 'Mobile Number', value: student.mobile },
          { label: 'Email', value: student.email },
          { label: 'Address', value: student.address },
          { label: 'City', value: student.city },
          { label: 'State', value: student.state },
          { label: 'Pincode', value: student.pincode },
          { label: 'Program', value: student.program },
          { label: 'Batch', value: student.batch },
          { label: 'Course', value: student.course },
          { label: 'Campus', value: student.campus },
          { label: 'Admission Status', value: student.admissionStatus },
          { label: 'Current Stage', value: student.currentStage },
        ]}
      />

      <InfoSectionCard
        icon={<ClipboardList size={18} />}
        title="Enquiry Information"
        fields={[
          { label: 'Enquiry Date', value: student.enquiry.enquiryDate },
          { label: 'Lead Source', value: student.enquiry.leadSource },
          { label: 'Campaign', value: student.enquiry.campaign },
          { label: 'Assigned Counselor', value: student.enquiry.counselor },
          { label: 'Current Stage', value: student.enquiry.stage },
          { label: 'Status', value: student.enquiry.status },
          { label: 'Interested Program', value: student.enquiry.interestedProgram },
          { label: 'Follow-up Date', value: student.enquiry.followUpDate },
          { label: 'Remarks', value: student.enquiry.remarks },
        ]}
      />

      <InfoSectionCard
        icon={<Users size={18} />}
        title="Parent Information"
        fields={[
          { label: 'Father Name', value: student.parent.fatherName },
          { label: 'Mother Name', value: student.parent.motherName },
          { label: 'Guardian Name', value: student.parent.guardianName },
          { label: 'Relationship', value: student.parent.relationship },
          { label: 'Mobile', value: student.parent.mobile },
          { label: 'Alternative Mobile', value: student.parent.altMobile },
          { label: 'Email', value: student.parent.email },
          { label: 'Occupation', value: student.parent.occupation },
          { label: 'Address', value: student.parent.address },
          { label: 'Emergency Contact', value: student.parent.emergencyContact },
        ]}
      />
    </motion.div>
  );
}
