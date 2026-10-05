'use client';

import dynamic from 'next/dynamic';

const modalLoading = () => null;

export const InstallationReportPanel = dynamic(
  () =>
    import('@/components/reports/InstallationReportPanel').then(
      (m) => m.InstallationReportPanel,
    ),
  { ssr: false, loading: modalLoading },
);

export const AttendanceSummaryModal = dynamic(
  () =>
    import('@/components/reports/attendance-summary/AttendanceSummaryModal').then(
      (m) => m.AttendanceSummaryModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const AbsenteesReportModal = dynamic(
  () =>
    import('@/components/reports/absentees-report/AbsenteesReportModal').then(
      (m) => m.AbsenteesReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const LateAttendanceModal = dynamic(
  () =>
    import('@/components/reports/late-attendance/LateAttendanceModal').then(
      (m) => m.LateAttendanceModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const DailyTimeCardModal = dynamic(
  () =>
    import('@/components/reports/daily-time-card/DailyTimeCardModal').then(
      (m) => m.DailyTimeCardModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const MonthlyAttendanceModal = dynamic(
  () =>
    import('@/components/reports/monthly-attendance/MonthlyAttendanceModal').then(
      (m) => m.MonthlyAttendanceModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const WeeklyAttendanceModal = dynamic(
  () =>
    import('@/components/reports/weekly-attendance/WeeklyAttendanceModal').then(
      (m) => m.WeeklyAttendanceModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const DropoffPickupModal = dynamic(
  () =>
    import('@/components/reports/dropoff-pickup/DropoffPickupModal').then(
      (m) => m.DropoffPickupModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const DailyScheduleModal = dynamic(
  () =>
    import('@/components/reports/daily-schedule/DailyScheduleModal').then(
      (m) => m.DailyScheduleModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const CheckInCheckoutModal = dynamic(
  () =>
    import('@/components/reports/checkin-checkout/CheckInCheckoutModal').then(
      (m) => m.CheckInCheckoutModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const StudentsReportModal = dynamic(
  () =>
    import('@/components/reports/students-report/StudentsReportModal').then(
      (m) => m.StudentsReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const StudentsAgeModal = dynamic(
  () =>
    import('@/components/reports/students-age/StudentsAgeModal').then((m) => m.StudentsAgeModal),
  { ssr: false, loading: modalLoading },
);

export const StudentsAllergyModal = dynamic(
  () =>
    import('@/components/reports/students-allergy/StudentsAllergyModal').then(
      (m) => m.StudentsAllergyModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const StudentsEmergencyModal = dynamic(
  () =>
    import('@/components/reports/students-emergency/StudentsEmergencyModal').then(
      (m) => m.StudentsEmergencyModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const StudentNotesModal = dynamic(
  () =>
    import('@/components/reports/student-notes/StudentNotesModal').then(
      (m) => m.StudentNotesModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const AuthorisedPickupsModal = dynamic(
  () =>
    import('@/components/reports/authorised-pickups/authorisedPickupsModal').then(
      (m) => m.AuthorisedPickupsModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const StudentCountAgeGroupModal = dynamic(
  () =>
    import('@/components/reports/student-count-age/StudentCountAgeGroupModal').then(
      (m) => m.StudentCountAgeGroupModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const AgeGroupDashboardPreview = dynamic(
  () =>
    import('@/components/reports/student-count-age/AgeGroupDashboardPreview').then(
      (m) => m.AgeGroupDashboardPreview,
    ),
  { ssr: false, loading: modalLoading },
);

export const StudentInfoSheetModal = dynamic(
  () =>
    import('@/components/reports/student-info-sheet/StudentInfoSheetModal').then(
      (m) => m.StudentInfoSheetModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const ImmunizationModal = dynamic(
  () =>
    import('@/components/reports/immunization/ImmunizationModal').then(
      (m) => m.ImmunizationModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const StudentBalanceModal = dynamic(
  () =>
    import('@/components/reports/student-balance/StudentBalanceModal').then(
      (m) => m.StudentBalanceModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const FeePlanModal = dynamic(
  () => import('@/components/reports/fee-plan/FeePlanModal').then((m) => m.FeePlanModal),
  { ssr: false, loading: modalLoading },
);

export const InvoicesReportModal = dynamic(
  () =>
    import('@/components/reports/invoices/InvoicesReportModal').then(
      (m) => m.InvoicesReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const MonthlyChargesModal = dynamic(
  () =>
    import('@/components/reports/monthly-charges/MonthlyChargesModal').then(
      (m) => m.MonthlyChargesModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const CreditNoteReportModal = dynamic(
  () =>
    import('@/components/reports/credit-note/CreditNoteReportModal').then(
      (m) => m.CreditNoteReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const LineItemReportModal = dynamic(
  () =>
    import('@/components/reports/line-item/LineItemReportModal').then(
      (m) => m.LineItemReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const DiscountReportModal = dynamic(
  () =>
    import('@/components/reports/discount/DiscountReportModal').then(
      (m) => m.DiscountReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const PaymentReportModal = dynamic(
  () =>
    import('@/components/reports/payment/PaymentReportModal').then((m) => m.PaymentReportModal),
  { ssr: false, loading: modalLoading },
);

export const DepositHistoryReportModal = dynamic(
  () =>
    import('@/components/reports/deposit-history/DepositHistoryReportModal').then(
      (m) => m.DepositHistoryReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const CreditHistoryReportModal = dynamic(
  () =>
    import('@/components/reports/credit-history/CreditHistoryReportModal').then(
      (m) => m.CreditHistoryReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const CreditBalanceReportModal = dynamic(
  () =>
    import('@/components/reports/credit-balance/CreditBalanceReportModal').then(
      (m) => m.CreditBalanceReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const DepositReportModal = dynamic(
  () =>
    import('@/components/reports/deposit/DepositReportModal').then((m) => m.DepositReportModal),
  { ssr: false, loading: modalLoading },
);

export const RefundListingReportModal = dynamic(
  () =>
    import('@/components/reports/refund-listing/RefundListingReportModal').then(
      (m) => m.RefundListingReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const DailyCollectionSummaryModal = dynamic(
  () =>
    import('@/components/reports/daily-collection/DailyCollectionSummaryModal').then(
      (m) => m.DailyCollectionSummaryModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const CustomerStatementModal = dynamic(
  () =>
    import('@/components/reports/customer-statement/CustomerStatementModal').then(
      (m) => m.CustomerStatementModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const ExpenseReportModal = dynamic(
  () =>
    import('@/components/reports/expense/ExpenseReportModal').then((m) => m.ExpenseReportModal),
  { ssr: false, loading: modalLoading },
);

export const MonthlyAgingReportModal = dynamic(
  () =>
    import('@/components/reports/monthly-aging/MonthlyAgingReportModal').then(
      (m) => m.MonthlyAgingReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const InvoiceAgeingReportModal = dynamic(
  () =>
    import('@/components/reports/invoice-ageing/InvoiceAgeingReportModal').then(
      (m) => m.InvoiceAgeingReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const SubsidyCollectionReportModal = dynamic(
  () =>
    import('@/components/reports/subsidy-collection/SubsidyCollectionReportModal').then(
      (m) => m.SubsidyCollectionReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const StaffReportModal = dynamic(
  () =>
    import('@/components/reports/staff-report/StaffReportModal').then((m) => m.StaffReportModal),
  { ssr: false, loading: modalLoading },
);

export const StaffAttendanceSummaryModal = dynamic(
  () =>
    import('@/components/reports/staff-attendance/StaffAttendanceSummaryModal').then(
      (m) => m.StaffAttendanceSummaryModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const StaffAbsenteesReportModal = dynamic(
  () =>
    import('@/components/reports/staff-attendance/StaffAbsenteesReportModal').then(
      (m) => m.StaffAbsenteesReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const StaffLateAttendanceModal = dynamic(
  () =>
    import('@/components/reports/staff-attendance/StaffLateAttendanceModal').then(
      (m) => m.StaffLateAttendanceModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const StaffMonthlyAttendanceModal = dynamic(
  () =>
    import('@/components/reports/staff-attendance/StaffMonthlyAttendanceModal').then(
      (m) => m.StaffMonthlyAttendanceModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const StaffDailyTimeCardModal = dynamic(
  () =>
    import('@/components/reports/staff-attendance/StaffDailyTimeCardModal').then(
      (m) => m.StaffDailyTimeCardModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const EnquiryReportModal = dynamic(
  () =>
    import('@/components/reports/enquiry-report/EnquiryReportModal').then(
      (m) => m.EnquiryReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const EnquiryActivityLogModal = dynamic(
  () =>
    import('@/components/reports/enquiry-activity/EnquiryActivityLogModal').then(
      (m) => m.EnquiryActivityLogModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const LostEnquiryReasonsModal = dynamic(
  () =>
    import('@/components/reports/lost-enquiry-reasons/LostEnquiryReasonsModal').then(
      (m) => m.LostEnquiryReasonsModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const EnquirySourceReportModal = dynamic(
  () =>
    import('@/components/reports/enquiry-source/EnquirySourceReportModal').then(
      (m) => m.EnquirySourceReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const EnquiryCountByStageModal = dynamic(
  () =>
    import('@/components/reports/enquiry-count-stage/EnquiryCountByStageModal').then(
      (m) => m.EnquiryCountByStageModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const CumulativeEnquiryByStageModal = dynamic(
  () =>
    import('@/components/reports/cumulative-enquiry-stage/CumulativeEnquiryByStageModal').then(
      (m) => m.CumulativeEnquiryByStageModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const WeeklyEnquirySummaryModal = dynamic(
  () =>
    import('@/components/reports/weekly-enquiry-summary/WeeklyEnquirySummaryModal').then(
      (m) => m.WeeklyEnquirySummaryModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const AppointmentReportModal = dynamic(
  () =>
    import('@/components/reports/appointment-report/AppointmentReportModal').then(
      (m) => m.AppointmentReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const StudentFormSubmissionModal = dynamic(
  () =>
    import('@/components/reports/student-form-submission/StudentFormSubmissionModal').then(
      (m) => m.StudentFormSubmissionModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const StaffFormSubmissionModal = dynamic(
  () =>
    import('@/components/reports/staff-form-submission/StaffFormSubmissionModal').then(
      (m) => m.StaffFormSubmissionModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const ActivityExcelReportModal = dynamic(
  () =>
    import('@/components/reports/activity-excel/ActivityExcelReportModal').then(
      (m) => m.ActivityExcelReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const ProgramStudentsModal = dynamic(
  () =>
    import('@/components/reports/program-students/ProgramStudentsModal').then(
      (m) => m.ProgramStudentsModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const ProgramsReportModal = dynamic(
  () =>
    import('@/components/reports/programs-report/ProgramsReportModal').then(
      (m) => m.ProgramsReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const DeferredListModal = dynamic(
  () =>
    import('@/components/reports/deferred-list/DeferredListModal').then(
      (m) => m.DeferredListModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const TransferCampusProgramsModal = dynamic(
  () =>
    import('@/components/reports/transfer-campus-programs/TransferCampusProgramsModal').then(
      (m) => m.TransferCampusProgramsModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const NewJoinerBreakdownModal = dynamic(
  () =>
    import('@/components/reports/new-joiner-breakdown/NewJoinerBreakdownModal').then(
      (m) => m.NewJoinerBreakdownModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const ActiveStudentsModal = dynamic(
  () =>
    import('@/components/reports/active-students/ActiveStudentsModal').then(
      (m) => m.ActiveStudentsModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const StudentStatusModal = dynamic(
  () =>
    import('@/components/reports/student-status/StudentStatusModal').then(
      (m) => m.StudentStatusModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const TransferCampusListModal = dynamic(
  () =>
    import('@/components/reports/transfer-campus-list/TransferCampusListModal').then(
      (m) => m.TransferCampusListModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const WithdrawalReportModal = dynamic(
  () =>
    import('@/components/reports/withdrawal/WithdrawalReportModal').then(
      (m) => m.WithdrawalReportModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const RoomCapacityModal = dynamic(
  () =>
    import('@/components/reports/room-capacity/RoomCapacityModal').then(
      (m) => m.RoomCapacityModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const GraduatedStudentsModal = dynamic(
  () =>
    import('@/components/reports/graduated-students/GraduatedStudentsModal').then(
      (m) => m.GraduatedStudentsModal,
    ),
  { ssr: false, loading: modalLoading },
);

export const GeneratedReportsSection = dynamic(
  () =>
    import('@/components/reports/attendance-summary/GeneratedReportsSection').then(
      (m) => m.GeneratedReportsSection,
    ),
  { ssr: false, loading: modalLoading },
);
