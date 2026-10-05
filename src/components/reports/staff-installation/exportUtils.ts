import {
  downloadRecordCsv,
  downloadRecordExcel,
  downloadRecordPdf,
} from '@/components/reports/shared/generatedReport';
import type { ExportOptions, StaffInstallationRecord } from './types';

export function buildStaffExportTable(rows: StaffInstallationRecord[], options: ExportOptions) {
  const columns = [
    'Staff Name',
    'Employee ID',
    'Campus',
    'Department',
    'Designation',
    'Staff Status',
    ...(options.includeStaffEmail ? ['Email'] : []),
    ...(options.includeInvitationStatus ? ['Invitation Status'] : []),
    'Staff Installation Status',
    ...(options.includeInstalledDate ? ['Installed On', 'Installed Time'] : []),
    'Last Invite Sent',
    'Last Invite Time',
  ];

  const data = rows.map((r) => {
    const row: Record<string, string> = {
      'Staff Name': r.staffName,
      'Employee ID': r.employeeId,
      Campus: r.campus,
      Department: r.department,
      Designation: r.designation,
      'Staff Status': r.staffStatus,
      'Staff Installation Status': r.installationStatus === 'installed' ? 'Installed' : 'Pending',
      'Last Invite Sent': r.lastInviteSent ?? '',
      'Last Invite Time': r.lastInviteTime ?? '',
    };

    if (options.includeStaffEmail) {
      row.Email = r.email;
    }
    if (options.includeInvitationStatus) {
      row['Invitation Status'] = r.invitationStatus === 'sent' ? 'Sent' : 'Not Sent';
    }
    if (options.includeInstalledDate) {
      row['Installed On'] = r.installedOn ?? '';
      row['Installed Time'] = r.installedTime ?? '';
    }

    return row;
  });

  return { columns, data };
}

export function downloadStaffInstallationExport(
  rows: StaffInstallationRecord[],
  options: ExportOptions,
) {
  const { columns, data } = buildStaffExportTable(rows, options);
  const stamp = new Date().toISOString().slice(0, 10);
  const base = `Staff_App_Installation_Report_${stamp}`;
  const title = 'Staff App Installation Report';

  if (options.format === 'pdf') {
    downloadRecordPdf(`${base}.pdf`, title, columns, data);
    return;
  }
  if (options.format === 'excel') {
    downloadRecordExcel(`${base}.xlsx`, columns, data, 'Staff Installation');
    return;
  }
  downloadRecordCsv(`${base}.csv`, columns, data);
}
