'use client';

import { motion } from 'framer-motion';
import { DateRangeField } from '@/components/reports/attendance-summary/DateRangeField';
import { reportItemVariants } from '@/components/reports/shared/reportMotion';
import { DepartmentMultiSelect } from './DepartmentMultiSelect';
import { StaffCombobox } from './StaffCombobox';
import { StaffFilterByRadios } from './StaffFilterByRadios';
import type { StaffAttendanceBaseForm, StaffFilterBy } from './types';

type Props = {
  values: StaffAttendanceBaseForm;
  errors: Partial<Record<'range' | 'staff', string>>;
  onChange: (patch: Partial<StaffAttendanceBaseForm>) => void;
};

export function StaffAttendanceFields({ values, errors, onChange }: Props) {
  return (
    <>
      <motion.div variants={reportItemVariants}>
        <DateRangeField
          startDate={values.startDate}
          endDate={values.endDate}
          error={errors.range}
          onChange={({ startDate, endDate }) => onChange({ startDate, endDate })}
        />
      </motion.div>

      <motion.div variants={reportItemVariants}>
        <StaffFilterByRadios
          value={values.filterBy}
          onChange={(filterBy: StaffFilterBy) =>
            onChange({
              filterBy,
              departments: filterBy === 'department' ? values.departments : [],
              staffId: filterBy === 'staff' ? values.staffId : null,
            })
          }
        />
      </motion.div>

      <motion.div variants={reportItemVariants}>
        {values.filterBy === 'department' ? (
          <DepartmentMultiSelect
            value={values.departments}
            onChange={(departments) => onChange({ departments })}
          />
        ) : (
          <StaffCombobox
            value={values.staffId}
            error={errors.staff}
            onChange={(staffId) => onChange({ staffId })}
          />
        )}
      </motion.div>
    </>
  );
}

export function validateStaffAttendanceBase(
  values: StaffAttendanceBaseForm,
): Partial<Record<'range' | 'staff', string>> {
  const next: Partial<Record<'range' | 'staff', string>> = {};
  if (!values.startDate || !values.endDate) {
    next.range = 'Attendance Date Range is mandatory.';
  } else if (values.startDate > values.endDate) {
    next.range = 'Start date must be on or before end date.';
  }
  if (values.filterBy === 'staff' && !values.staffId) {
    next.staff = 'Please select a staff member.';
  }
  return next;
}
