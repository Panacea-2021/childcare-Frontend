import {
  downloadRecordCsv,
  downloadRecordExcel,
  downloadRecordPdf,
} from '@/components/reports/shared/generatedReport';
import type { ExportOptions, InstallationRecord } from './types';

export function buildParentExportTable(rows: InstallationRecord[], options: ExportOptions) {
  const columns = [
    'Student Name',
    'Admission Number',
    'Campus',
    'Program',
    'Student Status',
    ...(options.includeParentEmails ? ['Mother Name', 'Mother Email', 'Father Name', 'Father Email'] : []),
    ...(options.includeInvitationStatus ? ['Invitation Status'] : []),
    'Parent Installation Status',
    ...(options.includeInstalledDate ? ['Installed On', 'Installed Time'] : []),
    'Last Invite Sent',
    'Last Invite Time',
  ];

  const data = rows.map((r) => {
    const row: Record<string, string> = {
      'Student Name': r.studentName,
      'Admission Number': r.admissionNumber,
      Campus: r.campus,
      Program: r.program,
      'Student Status': r.studentStatus,
      'Parent Installation Status': r.installationStatus === 'installed' ? 'Installed' : 'Pending',
      'Last Invite Sent': r.lastInviteSent ?? '',
      'Last Invite Time': r.lastInviteTime ?? '',
    };

    if (options.includeParentEmails) {
      row['Mother Name'] = r.mother.name;
      row['Mother Email'] = r.mother.email;
      row['Father Name'] = r.father.name;
      row['Father Email'] = r.father.email;
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

export function downloadParentInstallationExport(
  rows: InstallationRecord[],
  options: ExportOptions,
) {
  const { columns, data } = buildParentExportTable(rows, options);
  const stamp = new Date().toISOString().slice(0, 10);
  const base = `Parent_App_Installation_Report_${stamp}`;
  const title = 'Parent App Installation Report';

  if (options.format === 'pdf') {
    downloadRecordPdf(`${base}.pdf`, title, columns, data);
    return;
  }
  if (options.format === 'excel') {
    downloadRecordExcel(`${base}.xlsx`, columns, data, 'Parent Installation');
    return;
  }
  downloadRecordCsv(`${base}.csv`, columns, data);
}
