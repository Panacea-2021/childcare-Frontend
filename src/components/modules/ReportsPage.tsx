'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { badgeClass } from '@/lib/moduleData';
import {
  ALL_REPORTS,
  REPORT_CATEGORIES,
  type ReportCategoryId,
  type ReportDefinition,
} from '@/components/reports/data/reportCatalog';
import { useReportFavorites } from '@/components/reports/hooks/useReportFavorites';
import { TopReportTabs, type TopTabId } from '@/components/reports/TopReportTabs';
import { ReportHero } from '@/components/reports/ReportHero';
import { QuickActions, type QuickActionId } from '@/components/reports/QuickActions';
import { CategoryTabs } from '@/components/reports/CategoryTabs';
import { SearchBar } from '@/components/reports/SearchBar';
import { ReportSection } from '@/components/reports/ReportSection';
import { FavoriteReports } from '@/components/reports/FavoriteReports';
import { SkeletonLoader } from '@/components/reports/SkeletonLoader';
import {
  InstallationReportPanel,
  AttendanceSummaryModal,
  AbsenteesReportModal,
  LateAttendanceModal,
  DailyTimeCardModal,
  MonthlyAttendanceModal,
  WeeklyAttendanceModal,
  DropoffPickupModal,
  DailyScheduleModal,
  CheckInCheckoutModal,
  StudentsReportModal,
  StudentsAgeModal,
  StudentsAllergyModal,
  StudentsEmergencyModal,
  StudentNotesModal,
  AuthorisedPickupsModal,
  StudentCountAgeGroupModal,
  AgeGroupDashboardPreview,
  StudentInfoSheetModal,
  ImmunizationModal,
  StudentBalanceModal,
  FeePlanModal,
  InvoicesReportModal,
  MonthlyChargesModal,
  CreditNoteReportModal,
  LineItemReportModal,
  DiscountReportModal,
  PaymentReportModal,
  DepositHistoryReportModal,
  CreditHistoryReportModal,
  CreditBalanceReportModal,
  DepositReportModal,
  RefundListingReportModal,
  DailyCollectionSummaryModal,
  CustomerStatementModal,
  ExpenseReportModal,
  MonthlyAgingReportModal,
  InvoiceAgeingReportModal,
  SubsidyCollectionReportModal,
  StaffReportModal,
  StaffAttendanceSummaryModal,
  StaffAbsenteesReportModal,
  StaffLateAttendanceModal,
  StaffMonthlyAttendanceModal,
  StaffDailyTimeCardModal,
  EnquiryReportModal,
  EnquiryActivityLogModal,
  LostEnquiryReasonsModal,
  EnquirySourceReportModal,
  EnquiryCountByStageModal,
  CumulativeEnquiryByStageModal,
  WeeklyEnquirySummaryModal,
  AppointmentReportModal,
  StudentFormSubmissionModal,
  StaffFormSubmissionModal,
  ActivityExcelReportModal,
  ProgramStudentsModal,
  ProgramsReportModal,
  DeferredListModal,
  TransferCampusProgramsModal,
  NewJoinerBreakdownModal,
  ActiveStudentsModal,
  StudentStatusModal,
  TransferCampusListModal,
  WithdrawalReportModal,
  RoomCapacityModal,
  GraduatedStudentsModal,
  GeneratedReportsSection,
} from '@/components/reports/lazyReportModals';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import {
  downloadGeneratedReport,
  downloadRecordExcel,
} from '@/components/reports/shared/generatedReport';
import '@/components/reports/reports.css';
import '@/components/reports/attendance-summary/attendance-summary.css';
import '@/components/reports/absentees-report/absentees-report.css';
import '@/components/reports/weekly-attendance/weekly-attendance.css';

type PreviewState = {
  report: ReportDefinition | { id: string; name: string };
  mode: string;
};

const PREVIEW_SUMMARY_COLUMNS = ['Summary', 'Current', 'Previous', 'Change'];
const PREVIEW_SUMMARY_ROWS: Record<string, string>[] = [
  { Summary: 'Total records', Current: '128', Previous: '121', Change: '+5.8%' },
  { Summary: 'Completed', Current: '114', Previous: '109', Change: '+4.6%' },
  { Summary: 'Needs attention', Current: '14', Previous: '12', Change: '+2' },
];

const EXCEL_CATEGORIES = REPORT_CATEGORIES.filter((c) => c.id !== 'favorites');

function mostUsedCategoryLabel(favorites: string[]) {
  if (!favorites.length) return 'Attendance';
  const counts = new Map<string, number>();
  for (const id of favorites) {
    const report = ALL_REPORTS.find((r) => r.id === id);
    if (!report) continue;
    counts.set(report.categoryId, (counts.get(report.categoryId) ?? 0) + 1);
  }
  let best = 'student-attendance';
  let max = -1;
  for (const [key, value] of counts) {
    if (value > max) {
      max = value;
      best = key;
    }
  }
  return REPORT_CATEGORIES.find((c) => c.id === best)?.label.replace(' Report', '') ?? 'Attendance';
}

export function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topTab, setTopTab] = useState<TopTabId>('excel');
  const [category, setCategory] = useState<ReportCategoryId>('student-attendance');
  const [search, setSearch] = useState('');
  const [booting, setBooting] = useState(true);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [recentCount, setRecentCount] = useState(0);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [absenteesOpen, setAbsenteesOpen] = useState(false);
  const [lateOpen, setLateOpen] = useState(false);
  const [dailyTimeCardOpen, setDailyTimeCardOpen] = useState(false);
  const [monthlyOpen, setMonthlyOpen] = useState(false);
  const [weeklyOpen, setWeeklyOpen] = useState(false);
  const [dropoffOpen, setDropoffOpen] = useState(false);
  const [dailyScheduleOpen, setDailyScheduleOpen] = useState(false);
  const [checkInCheckoutOpen, setCheckInCheckoutOpen] = useState(false);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [studentsAgeOpen, setStudentsAgeOpen] = useState(false);
  const [studentsAllergyOpen, setStudentsAllergyOpen] = useState(false);
  const [studentsEmergencyOpen, setStudentsEmergencyOpen] = useState(false);
  const [studentNotesOpen, setStudentNotesOpen] = useState(false);
  const [authorisedPickupsOpen, setAuthorisedPickupsOpen] = useState(false);
  const [studentCountAgeOpen, setStudentCountAgeOpen] = useState(false);
  const [studentInfoSheetOpen, setStudentInfoSheetOpen] = useState(false);
  const [immunizationOpen, setImmunizationOpen] = useState(false);
  const [studentBalanceOpen, setStudentBalanceOpen] = useState(false);
  const [feePlanOpen, setFeePlanOpen] = useState(false);
  const [invoicesOpen, setInvoicesOpen] = useState(false);
  const [monthlyChargesOpen, setMonthlyChargesOpen] = useState(false);
  const [creditNoteOpen, setCreditNoteOpen] = useState(false);
  const [lineItemOpen, setLineItemOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [depositHistoryOpen, setDepositHistoryOpen] = useState(false);
  const [creditHistoryOpen, setCreditHistoryOpen] = useState(false);
  const [depositReportOpen, setDepositReportOpen] = useState(false);
  const [creditBalanceOpen, setCreditBalanceOpen] = useState(false);
  const [refundListingOpen, setRefundListingOpen] = useState(false);
  const [dailyCollectionOpen, setDailyCollectionOpen] = useState(false);
  const [customerStatementOpen, setCustomerStatementOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [monthlyAgingOpen, setMonthlyAgingOpen] = useState(false);
  const [invoiceAgeingOpen, setInvoiceAgeingOpen] = useState(false);
  const [subsidyCollectionOpen, setSubsidyCollectionOpen] = useState(false);
  const [staffReportOpen, setStaffReportOpen] = useState(false);
  const [staffAttSummaryOpen, setStaffAttSummaryOpen] = useState(false);
  const [staffAbsenteesOpen, setStaffAbsenteesOpen] = useState(false);
  const [staffLateOpen, setStaffLateOpen] = useState(false);
  const [staffMonthlyOpen, setStaffMonthlyOpen] = useState(false);
  const [staffTimeCardOpen, setStaffTimeCardOpen] = useState(false);
  const [enquiryReportOpen, setEnquiryReportOpen] = useState(false);
  const [enquiryActivityOpen, setEnquiryActivityOpen] = useState(false);
  const [lostEnquiryOpen, setLostEnquiryOpen] = useState(false);
  const [enquirySourceOpen, setEnquirySourceOpen] = useState(false);
  const [enquiryCountStageOpen, setEnquiryCountStageOpen] = useState(false);
  const [cumulativeEnquiryOpen, setCumulativeEnquiryOpen] = useState(false);
  const [weeklyEnquiryOpen, setWeeklyEnquiryOpen] = useState(false);
  const [appointmentReportOpen, setAppointmentReportOpen] = useState(false);
  const [studentFormSubmissionOpen, setStudentFormSubmissionOpen] = useState(false);
  const [activityExcelOpen, setActivityExcelOpen] = useState(false);
  const [staffFormSubmissionOpen, setStaffFormSubmissionOpen] = useState(false);
  const [programStudentsOpen, setProgramStudentsOpen] = useState(false);
  const [programsReportOpen, setProgramsReportOpen] = useState(false);
  const [deferredListOpen, setDeferredListOpen] = useState(false);
  const [transferCampusProgramsOpen, setTransferCampusProgramsOpen] = useState(false);
  const [newJoinerBreakdownOpen, setNewJoinerBreakdownOpen] = useState(false);
  const [activeStudentsOpen, setActiveStudentsOpen] = useState(false);
  const [studentStatusOpen, setStudentStatusOpen] = useState(false);
  const [transferCampusListOpen, setTransferCampusListOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [roomCapacityOpen, setRoomCapacityOpen] = useState(false);
  const [graduatedStudentsOpen, setGraduatedStudentsOpen] = useState(false);
  const [ageDashboard, setAgeDashboard] = useState<GeneratedExcelReport | null>(null);
  const [generatedReports, setGeneratedReports] = useState<GeneratedExcelReport[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const { favorites, isFavorite, toggleFavorite, hydrated } = useReportFavorites();
  const scrollingToRef = useRef(false);

  useEffect(() => {
    if (!successToast) return;
    const t = window.setTimeout(() => setSuccessToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [successToast]);

  useEffect(() => {
    const t = window.setTimeout(() => setBooting(false), 420);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (topTab !== 'excel') return;
    const ids = REPORT_CATEGORIES.map((c) => c.id);
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingToRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target.id) return;
        const next = visible.target.id.replace('rp-cat-', '') as ReportCategoryId;
        if (ids.includes(next)) setCategory(next);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.15, 0.4, 0.7] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(`rp-cat-${id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [topTab, booting, hydrated, search]);

  const favoriteReports = useMemo(
    () => ALL_REPORTS.filter((r) => favorites.includes(r.id)),
    [favorites],
  );

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<ReportCategoryId, number>> = {
      favorites: favorites.length,
    };
    for (const cat of EXCEL_CATEGORIES) {
      counts[cat.id] = ALL_REPORTS.filter((r) => r.categoryId === cat.id).length;
    }
    return counts;
  }, [favorites.length]);

  const filteredBySearch = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL_REPORTS;
    return ALL_REPORTS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.categoryId.includes(q) ||
        (r.section?.toLowerCase().includes(q) ?? false),
    );
  }, [search]);

  const openPreview = useCallback((report: PreviewState['report'], action: string) => {
    setPreview({ report, mode: action });
  }, []);

  const handleGenerate = useCallback(
    (report: ReportDefinition) => {
      if (report.id === 'att-summary') {
        setAttendanceOpen(true);
        return;
      }
      if (report.id === 'att-absentees') {
        setAbsenteesOpen(true);
        return;
      }
      if (report.id === 'att-late') {
        setLateOpen(true);
        return;
      }
      if (report.id === 'att-daily-timecard') {
        setDailyTimeCardOpen(true);
        return;
      }
      if (report.id === 'att-monthly') {
        setMonthlyOpen(true);
        return;
      }
      if (report.id === 'att-weekly') {
        setWeeklyOpen(true);
        return;
      }
      if (report.id === 'att-dropoff-pickup') {
        setDropoffOpen(true);
        return;
      }
      if (report.id === 'att-daily-schedule') {
        setDailyScheduleOpen(true);
        return;
      }
      if (report.id === 'att-checkin-checkout') {
        setCheckInCheckoutOpen(true);
        return;
      }
      if (report.id === 'si-students') {
        setStudentsOpen(true);
        return;
      }
      if (report.id === 'si-age') {
        setStudentsAgeOpen(true);
        return;
      }
      if (report.id === 'si-allergy') {
        setStudentsAllergyOpen(true);
        return;
      }
      if (report.id === 'si-emergency') {
        setStudentsEmergencyOpen(true);
        return;
      }
      if (report.id === 'si-notes') {
        setStudentNotesOpen(true);
        return;
      }
      if (report.id === 'si-pickups') {
        setAuthorisedPickupsOpen(true);
        return;
      }
      if (report.id === 'si-count-age') {
        setStudentCountAgeOpen(true);
        return;
      }
      if (report.id === 'si-info-sheet') {
        setStudentInfoSheetOpen(true);
        return;
      }
      if (report.id === 'si-immunization') {
        setImmunizationOpen(true);
        return;
      }
      if (report.id === 'bill-balance') {
        setStudentBalanceOpen(true);
        return;
      }
      if (report.id === 'bill-fee-plan') {
        setFeePlanOpen(true);
        return;
      }
      if (report.id === 'bill-invoices') {
        setInvoicesOpen(true);
        return;
      }
      if (report.id === 'bill-monthly-charges') {
        setMonthlyChargesOpen(true);
        return;
      }
      if (report.id === 'bill-credit-note') {
        setCreditNoteOpen(true);
        return;
      }
      if (report.id === 'bill-line-item') {
        setLineItemOpen(true);
        return;
      }
      if (report.id === 'bill-discount') {
        setDiscountOpen(true);
        return;
      }
      if (report.id === 'bill-payment') {
        setPaymentOpen(true);
        return;
      }
      if (report.id === 'bill-deposit-history') {
        setDepositHistoryOpen(true);
        return;
      }
      if (report.id === 'bill-credit-history') {
        setCreditHistoryOpen(true);
        return;
      }
      if (report.id === 'bill-credit-balance') {
        setCreditBalanceOpen(true);
        return;
      }
      if (report.id === 'bill-deposit') {
        setDepositReportOpen(true);
        return;
      }
      if (report.id === 'bill-refund') {
        setRefundListingOpen(true);
        return;
      }
      if (report.id === 'bill-daily-collection') {
        setDailyCollectionOpen(true);
        return;
      }
      if (report.id === 'bill-customer-statement') {
        setCustomerStatementOpen(true);
        return;
      }
      if (report.id === 'bill-expense') {
        setExpenseOpen(true);
        return;
      }
      if (report.id === 'bill-monthly-aging') {
        setMonthlyAgingOpen(true);
        return;
      }
      if (report.id === 'bill-invoice-ageing') {
        setInvoiceAgeingOpen(true);
        return;
      }
      if (report.id === 'bill-subsidy') {
        setSubsidyCollectionOpen(true);
        return;
      }
      if (report.id === 'staff-report') {
        setStaffReportOpen(true);
        return;
      }
      if (report.id === 'staff-att-summary') {
        setStaffAttSummaryOpen(true);
        return;
      }
      if (report.id === 'staff-att-absentees') {
        setStaffAbsenteesOpen(true);
        return;
      }
      if (report.id === 'staff-att-late') {
        setStaffLateOpen(true);
        return;
      }
      if (report.id === 'staff-att-monthly') {
        setStaffMonthlyOpen(true);
        return;
      }
      if (report.id === 'staff-att-timecard') {
        setStaffTimeCardOpen(true);
        return;
      }
      if (report.id === 'enq-report') {
        setEnquiryReportOpen(true);
        return;
      }
      if (report.id === 'enq-activity') {
        setEnquiryActivityOpen(true);
        return;
      }
      if (report.id === 'enq-lost') {
        setLostEnquiryOpen(true);
        return;
      }
      if (report.id === 'enq-source') {
        setEnquirySourceOpen(true);
        return;
      }
      if (report.id === 'enq-count-stage') {
        setEnquiryCountStageOpen(true);
        return;
      }
      if (report.id === 'enq-cumulative') {
        setCumulativeEnquiryOpen(true);
        return;
      }
      if (report.id === 'enq-weekly') {
        setWeeklyEnquiryOpen(true);
        return;
      }
      if (report.id === 'tour-appointment') {
        setAppointmentReportOpen(true);
        return;
      }
      if (report.id === 'form-student') {
        setStudentFormSubmissionOpen(true);
        return;
      }
      if (report.id === 'form-staff') {
        setStaffFormSubmissionOpen(true);
        return;
      }
      if (report.id === 'activity-excel') {
        setActivityExcelOpen(true);
        return;
      }
      if (report.id === 'adm-program-students') {
        setProgramStudentsOpen(true);
        return;
      }
      if (report.id === 'adm-programs') {
        setProgramsReportOpen(true);
        return;
      }
      if (report.id === 'adm-deferred') {
        setDeferredListOpen(true);
        return;
      }
      if (report.id === 'adm-transfer-programs') {
        setTransferCampusProgramsOpen(true);
        return;
      }
      if (report.id === 'adm-new-joiner') {
        setNewJoinerBreakdownOpen(true);
        return;
      }
      if (report.id === 'adm-active') {
        setActiveStudentsOpen(true);
        return;
      }
      if (report.id === 'adm-status') {
        setStudentStatusOpen(true);
        return;
      }
      if (report.id === 'adm-transfer-campus') {
        setTransferCampusListOpen(true);
        return;
      }
      if (report.id === 'adm-withdrawal') {
        setWithdrawalOpen(true);
        return;
      }
      if (report.id === 'adm-room-capacity') {
        setRoomCapacityOpen(true);
        return;
      }
      if (report.id === 'adm-graduated') {
        setGraduatedStudentsOpen(true);
        return;
      }
      setGeneratingId(report.id);
      window.setTimeout(() => {
        setGeneratingId(null);
        setRecentCount((n) => n + 1);
        openPreview(report, 'Generate');
      }, 650);
    },
    [openPreview],
  );

  /** Deep-link from Students Quick Actions: /reports?open=si-students|si-allergy */
  useEffect(() => {
    const openId = searchParams.get('open');
    if (!openId) return;
    const report = ALL_REPORTS.find((r) => r.id === openId);
    if (!report) {
      router.replace('/reports', { scroll: false });
      return;
    }
    setTopTab('excel');
    setCategory(report.categoryId);
    // Open after paint so the Student Info section is on screen behind the modal
    const t = window.setTimeout(() => {
      handleGenerate(report);
      document.getElementById(`rp-cat-${report.categoryId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      router.replace('/reports', { scroll: false });
    }, 80);
    return () => window.clearTimeout(t);
  }, [searchParams, handleGenerate, router]);

  const handleExcelGenerated = useCallback((report: GeneratedExcelReport, toast: string) => {
    setGeneratedReports((prev) => [report, ...prev]);
    setRecentCount((n) => n + 1);
    setSuccessToast(toast);
    window.setTimeout(() => {
      document.getElementById('asr-generated-reports')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
  }, []);

  const handleQuickAction = useCallback(
    (id: QuickActionId) => {
      if (id === 'favorites') {
        setCategory('favorites');
        document.getElementById('rp-cat-favorites')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (id === 'generate' || id === 'export') {
        setCategory('student-attendance');
        document.getElementById('rp-cat-student-attendance')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        return;
      }
      if (id === 'recent') {
        document.getElementById('asr-generated-reports')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        if (!generatedReports.length) {
          setSuccessToast('No generated reports yet. Generate a report first.');
        }
        return;
      }
      if (id === 'history') {
        const latest = generatedReports[0];
        if (latest) {
          downloadGeneratedReport(latest);
          setSuccessToast(`Downloaded ${latest.name}`);
          document.getElementById('asr-generated-reports')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
          return;
        }
        setSuccessToast('No download history yet. Generate a report first.');
        document.getElementById('asr-generated-reports')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    },
    [generatedReports],
  );

  const handlePreviewPrimary = useCallback(() => {
    if (!preview) return;

    const wantsDownload = /download/i.test(preview.mode);
    if (wantsDownload) {
      const needle = preview.report.name.toLowerCase();
      const match =
        generatedReports.find(
          (r) =>
            r.name.toLowerCase().includes(needle) ||
            needle.includes(r.kind.replace(/-/g, ' ')),
        ) ?? generatedReports[0];

      if (match) {
        downloadGeneratedReport(match);
        setSuccessToast(`Downloaded ${match.name}`);
      } else {
        downloadRecordExcel(
          `${preview.report.name.replace(/\s+/g, '_')}.xlsx`,
          PREVIEW_SUMMARY_COLUMNS,
          PREVIEW_SUMMARY_ROWS,
          preview.report.name.slice(0, 31),
        );
        setSuccessToast(`${preview.report.name} downloaded`);
      }
      setPreview(null);
      return;
    }

    if (preview.mode.includes('ready')) {
      const match = generatedReports[0];
      if (match) {
        downloadGeneratedReport(match);
        setSuccessToast(`Downloaded ${match.name}`);
      } else {
        downloadRecordExcel(
          `${preview.report.name.replace(/\s+/g, '_')}.xlsx`,
          PREVIEW_SUMMARY_COLUMNS,
          PREVIEW_SUMMARY_ROWS,
          preview.report.name.slice(0, 31),
        );
        setSuccessToast(`${preview.report.name} downloaded`);
      }
      setPreview(null);
      return;
    }

    setPreview({
      ...preview,
      mode: `${preview.mode} ready`,
    });
  }, [preview, generatedReports]);

  const onCategoryChange = useCallback((id: ReportCategoryId) => {
    setCategory(id);
    scrollingToRef.current = true;
    const el = document.getElementById(`rp-cat-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      scrollingToRef.current = false;
    }, 700);
  }, []);

  const heroStats = useMemo(
    () => [
      { label: 'Total Reports', value: ALL_REPORTS.length },
      { label: 'Favourite Reports', value: favorites.length },
      { label: 'Recently Generated', value: recentCount },
      { label: 'Most Used Category', value: mostUsedCategoryLabel(favorites) },
    ],
    [favorites, recentCount],
  );

  const visibleCategories = useMemo(() => {
    if (search.trim()) {
      const ids = new Set(filteredBySearch.map((r) => r.categoryId));
      return EXCEL_CATEGORIES.filter((c) => ids.has(c.id as typeof filteredBySearch[number]['categoryId']));
    }
    return EXCEL_CATEGORIES;
  }, [filteredBySearch, search]);

  const filteredFavorites = useMemo(() => {
    if (!search.trim()) return favoriteReports;
    return favoriteReports.filter((r) => filteredBySearch.some((f) => f.id === r.id));
  }, [favoriteReports, filteredBySearch, search]);

  return (
    <div className="mod-page rp-page">
      <TopReportTabs active={topTab} onChange={setTopTab} />

      <AnimatePresence mode="wait">
        {topTab === 'excel' ? (
          <motion.div
            key="excel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
          >
            <ReportHero
              subtitle="Generate and manage attendance, admissions, staff, enquiry, billing and activity reports from one centralized dashboard."
              stats={heroStats}
            />

            <QuickActions onAction={handleQuickAction} />

            <GeneratedReportsSection
              reports={generatedReports}
              onChange={setGeneratedReports}
            />

            <div className="rp-sticky-band">
              <CategoryTabs
                categories={REPORT_CATEGORIES}
                active={category}
                counts={categoryCounts}
                onChange={onCategoryChange}
              />
              <SearchBar value={search} onChange={setSearch} />
            </div>

            {booting || !hydrated ? (
              <SkeletonLoader count={6} />
            ) : (
              <>
                {(category === 'favorites' || filteredFavorites.length > 0 || !search.trim()) && (
                  <FavoriteReports
                    reports={filteredFavorites}
                    isFavorite={isFavorite}
                    generatingId={generatingId}
                    onToggleFavorite={toggleFavorite}
                    onGenerate={handleGenerate}
                  />
                )}

                {visibleCategories.map((cat) => (
                  <ReportSection
                    key={cat.id}
                    category={cat}
                    reports={filteredBySearch.filter((r) => r.categoryId === cat.id)}
                    isFavorite={isFavorite}
                    generatingId={generatingId}
                    onToggleFavorite={toggleFavorite}
                    onGenerate={handleGenerate}
                  />
                ))}

                {search.trim() && !filteredBySearch.length ? (
                  <div className="rp-empty-fav">
                    <h3>No reports match “{search}”</h3>
                    <p>Try another keyword or clear the search to browse all categories.</p>
                  </div>
                ) : null}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={topTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            <InstallationReportPanel
              variant={topTab === 'parent-install' ? 'parent' : 'staff'}
              onGenerate={() =>
                openPreview(
                  {
                    id: topTab,
                    name:
                      topTab === 'parent-install'
                        ? 'Parent App Installation Report'
                        : 'Staff App Installation Report',
                  },
                  'Generate',
                )
              }
              onDownload={() =>
                openPreview(
                  {
                    id: topTab,
                    name:
                      topTab === 'parent-install'
                        ? 'Parent App Installation Report'
                        : 'Staff App Installation Report',
                  },
                  'Download',
                )
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        wide
        open={!!preview}
        title={`${preview?.report.name ?? ''} preview`}
        onClose={() => setPreview(null)}
        footer={
          <>
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => setPreview(null)}>
              Close
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={handlePreviewPrimary}
            >
              {/download/i.test(preview?.mode ?? '')
                ? 'Download report'
                : preview?.mode.includes('ready')
                  ? 'Download report'
                  : `${preview?.mode ?? 'Generate'} report`}
            </button>
          </>
        }
      >
        <div className="mod-toggle-row">
          <div>
            <strong>{preview?.report.name}</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>
              July 1–31, 2026 · Entire center
            </p>
          </div>
          <span className={badgeClass(preview?.mode.includes('ready') ? 'Completed' : 'Active')}>
            {preview?.mode.includes('ready') ? preview.mode : 'Preview'}
          </span>
        </div>
        <div className="mod-scroll" style={{ marginTop: 16 }}>
          <table className="ui-table">
            <thead>
              <tr>
                <th>Summary</th>
                <th>Current</th>
                <th>Previous</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total records</td>
                <td>128</td>
                <td>121</td>
                <td>+5.8%</td>
              </tr>
              <tr>
                <td>Completed</td>
                <td>114</td>
                <td>109</td>
                <td>+4.6%</td>
              </tr>
              <tr>
                <td>Needs attention</td>
                <td>14</td>
                <td>12</td>
                <td>+2</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>

      {attendanceOpen ? (
      <AttendanceSummaryModal
        open={attendanceOpen}
        onClose={() => setAttendanceOpen(false)}
        onGenerated={(report) => handleExcelGenerated(report, 'Attendance Report Generated Successfully')}
      />
      ) : null}

      {absenteesOpen ? (
      <AbsenteesReportModal
        open={absenteesOpen}
        onClose={() => setAbsenteesOpen(false)}
        onGenerated={(report) => handleExcelGenerated(report, 'Absentees Report Generated Successfully')}
      />
      ) : null}

      {lateOpen ? (
      <LateAttendanceModal
        open={lateOpen}
        onClose={() => setLateOpen(false)}
        onGenerated={(report) => handleExcelGenerated(report, 'Late Attendance Report Generated Successfully')}
      />
      ) : null}

      {dailyTimeCardOpen ? (
      <DailyTimeCardModal
        open={dailyTimeCardOpen}
        onClose={() => setDailyTimeCardOpen(false)}
        onGenerated={(report) => handleExcelGenerated(report, 'Daily Time Card Report Generated Successfully')}
      />
      ) : null}

      {monthlyOpen ? (
      <MonthlyAttendanceModal
        open={monthlyOpen}
        onClose={() => setMonthlyOpen(false)}
        onGenerated={(report) => handleExcelGenerated(report, 'Monthly Attendance Report Generated Successfully')}
      />
      ) : null}

      {weeklyOpen ? (
      <WeeklyAttendanceModal
        open={weeklyOpen}
        onClose={() => setWeeklyOpen(false)}
        onGenerated={(report) => handleExcelGenerated(report, 'Weekly Attendance Report Generated Successfully')}
      />
      ) : null}

      {dropoffOpen ? (
      <DropoffPickupModal
        open={dropoffOpen}
        onClose={() => setDropoffOpen(false)}
        onGenerated={(report) => handleExcelGenerated(report, 'Drop Off & Pickup Sheet Generated Successfully')}
      />
      ) : null}

      {dailyScheduleOpen ? (
      <DailyScheduleModal
        open={dailyScheduleOpen}
        onClose={() => setDailyScheduleOpen(false)}
        onGenerated={(report) => handleExcelGenerated(report, 'Daily Schedule Report Generated Successfully')}
      />
      ) : null}

      {checkInCheckoutOpen ? (
      <CheckInCheckoutModal
        open={checkInCheckoutOpen}
        onClose={() => setCheckInCheckoutOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Check-In / Check-Out Form Records Generated Successfully')
        }
      />
      ) : null}

      {studentsOpen ? (
      <StudentsReportModal
        open={studentsOpen}
        onClose={() => setStudentsOpen(false)}
        onGenerated={(report) => handleExcelGenerated(report, 'Students Report Generated Successfully')}
      />
      ) : null}

      {studentsAgeOpen ? (
      <StudentsAgeModal
        open={studentsAgeOpen}
        onClose={() => setStudentsAgeOpen(false)}
        onGenerated={(report) => handleExcelGenerated(report, 'Students Age Report Generated Successfully')}
      />
      ) : null}

      {studentsAllergyOpen ? (
      <StudentsAllergyModal
        open={studentsAllergyOpen}
        onClose={() => setStudentsAllergyOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Students Allergy Report Generated Successfully')
        }
      />
      ) : null}

      {studentsEmergencyOpen ? (
      <StudentsEmergencyModal
        open={studentsEmergencyOpen}
        onClose={() => setStudentsEmergencyOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Students Emergency Contacts Report Generated Successfully')
        }
      />
      ) : null}

      {studentNotesOpen ? (
      <StudentNotesModal
        open={studentNotesOpen}
        onClose={() => setStudentNotesOpen(false)}
        onGenerated={(report) => handleExcelGenerated(report, 'Student Notes Report Generated Successfully')}
      />
      ) : null}

      {authorisedPickupsOpen ? (
      <AuthorisedPickupsModal
        open={authorisedPickupsOpen}
        onClose={() => setAuthorisedPickupsOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Authorised Pickups Report Generated Successfully')
        }
      />
      ) : null}

      {studentCountAgeOpen ? (
      <StudentCountAgeGroupModal
        open={studentCountAgeOpen}
        onClose={() => setStudentCountAgeOpen(false)}
        onGenerated={(report) => {
          handleExcelGenerated(report, 'Student Count By Age Group Report Generated Successfully');
          setAgeDashboard(report);
        }}
      />
      ) : null}

      {studentInfoSheetOpen ? (
      <StudentInfoSheetModal
        open={studentInfoSheetOpen}
        onClose={() => setStudentInfoSheetOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Student Information Sheet Generated Successfully')
        }
      />
      ) : null}

      {immunizationOpen ? (
      <ImmunizationModal
        open={immunizationOpen}
        onClose={() => setImmunizationOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Immunization Report Generated Successfully')
        }
      />
      ) : null}

      {studentBalanceOpen ? (
      <StudentBalanceModal
        open={studentBalanceOpen}
        onClose={() => setStudentBalanceOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Student Balance Report Generated Successfully')
        }
      />
      ) : null}

      {feePlanOpen ? (
      <FeePlanModal
        open={feePlanOpen}
        onClose={() => setFeePlanOpen(false)}
        onGenerated={(report) => handleExcelGenerated(report, 'Fee Plan Report Generated Successfully')}
      />
      ) : null}

      {invoicesOpen ? (
      <InvoicesReportModal
        open={invoicesOpen}
        onClose={() => setInvoicesOpen(false)}
        onGenerated={(report) => handleExcelGenerated(report, 'Invoices Report Generated Successfully')}
      />
      ) : null}

      {monthlyChargesOpen ? (
      <MonthlyChargesModal
        open={monthlyChargesOpen}
        onClose={() => setMonthlyChargesOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Monthly Charges Report Generated Successfully')
        }
      />
      ) : null}

      {creditNoteOpen ? (
      <CreditNoteReportModal
        open={creditNoteOpen}
        onClose={() => setCreditNoteOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Credit Note Report Generated Successfully')
        }
      />
      ) : null}

      {lineItemOpen ? (
      <LineItemReportModal
        open={lineItemOpen}
        onClose={() => setLineItemOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Line Item Report Generated Successfully')
        }
      />
      ) : null}

      {discountOpen ? (
      <DiscountReportModal
        open={discountOpen}
        onClose={() => setDiscountOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Discount Report Generated Successfully')
        }
      />
      ) : null}

      {paymentOpen ? (
      <PaymentReportModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Payment Report Generated Successfully')
        }
      />
      ) : null}

      {depositHistoryOpen ? (
      <DepositHistoryReportModal
        open={depositHistoryOpen}
        onClose={() => setDepositHistoryOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Deposit History Report Generated Successfully')
        }
      />
      ) : null}

      {creditHistoryOpen ? (
      <CreditHistoryReportModal
        open={creditHistoryOpen}
        onClose={() => setCreditHistoryOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Credit History Report Generated Successfully')
        }
      />
      ) : null}

      {creditBalanceOpen ? (
      <CreditBalanceReportModal
        open={creditBalanceOpen}
        onClose={() => setCreditBalanceOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Credit Balance Report Generated Successfully')
        }
      />
      ) : null}

      {depositReportOpen ? (
      <DepositReportModal
        open={depositReportOpen}
        onClose={() => setDepositReportOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Deposit Report Generated Successfully')
        }
      />
      ) : null}

      {refundListingOpen ? (
      <RefundListingReportModal
        open={refundListingOpen}
        onClose={() => setRefundListingOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Refund Listing Report Generated Successfully')
        }
      />
      ) : null}

      {dailyCollectionOpen ? (
      <DailyCollectionSummaryModal
        open={dailyCollectionOpen}
        onClose={() => setDailyCollectionOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Daily Collection Summary Generated Successfully')
        }
      />
      ) : null}

      {customerStatementOpen ? (
      <CustomerStatementModal
        open={customerStatementOpen}
        onClose={() => setCustomerStatementOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Customer Statement Generated Successfully')
        }
      />
      ) : null}

      {expenseOpen ? (
      <ExpenseReportModal
        open={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Expense Report Generated Successfully')
        }
      />
      ) : null}

      {monthlyAgingOpen ? (
      <MonthlyAgingReportModal
        open={monthlyAgingOpen}
        onClose={() => setMonthlyAgingOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Monthly Aging Report Generated Successfully')
        }
      />
      ) : null}

      {invoiceAgeingOpen ? (
      <InvoiceAgeingReportModal
        open={invoiceAgeingOpen}
        onClose={() => setInvoiceAgeingOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Invoice Ageing Report Generated Successfully')
        }
      />
      ) : null}

      {subsidyCollectionOpen ? (
      <SubsidyCollectionReportModal
        open={subsidyCollectionOpen}
        onClose={() => setSubsidyCollectionOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Subsidy Collection Report Generated Successfully')
        }
      />
      ) : null}

      {staffReportOpen ? (
      <StaffReportModal
        open={staffReportOpen}
        onClose={() => setStaffReportOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Staff Report Generated Successfully')
        }
      />
      ) : null}

      {staffAttSummaryOpen ? (
      <StaffAttendanceSummaryModal
        open={staffAttSummaryOpen}
        onClose={() => setStaffAttSummaryOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Staff Attendance Summary Generated Successfully')
        }
      />
      ) : null}

      {staffAbsenteesOpen ? (
      <StaffAbsenteesReportModal
        open={staffAbsenteesOpen}
        onClose={() => setStaffAbsenteesOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Staff Absentees Report Generated Successfully')
        }
      />
      ) : null}

      {staffLateOpen ? (
      <StaffLateAttendanceModal
        open={staffLateOpen}
        onClose={() => setStaffLateOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Staff Late Attendance Generated Successfully')
        }
      />
      ) : null}

      {staffMonthlyOpen ? (
      <StaffMonthlyAttendanceModal
        open={staffMonthlyOpen}
        onClose={() => setStaffMonthlyOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Staff Monthly Attendance Generated Successfully')
        }
      />
      ) : null}

      {staffTimeCardOpen ? (
      <StaffDailyTimeCardModal
        open={staffTimeCardOpen}
        onClose={() => setStaffTimeCardOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Staff Daily Time Card Generated Successfully')
        }
      />
      ) : null}

      {enquiryReportOpen ? (
      <EnquiryReportModal
        open={enquiryReportOpen}
        onClose={() => setEnquiryReportOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Enquiry Report Generated Successfully')
        }
      />
      ) : null}

      {enquiryActivityOpen ? (
      <EnquiryActivityLogModal
        open={enquiryActivityOpen}
        onClose={() => setEnquiryActivityOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Enquiry Activity Log Generated Successfully')
        }
      />
      ) : null}

      {lostEnquiryOpen ? (
      <LostEnquiryReasonsModal
        open={lostEnquiryOpen}
        onClose={() => setLostEnquiryOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Lost Enquiry Reasons Report Generated Successfully')
        }
      />
      ) : null}

      {enquirySourceOpen ? (
      <EnquirySourceReportModal
        open={enquirySourceOpen}
        onClose={() => setEnquirySourceOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Enquiry Source Report Generated Successfully')
        }
      />
      ) : null}

      {enquiryCountStageOpen ? (
      <EnquiryCountByStageModal
        open={enquiryCountStageOpen}
        onClose={() => setEnquiryCountStageOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Enquiry Count By Stage Generated Successfully')
        }
      />
      ) : null}

      {cumulativeEnquiryOpen ? (
      <CumulativeEnquiryByStageModal
        open={cumulativeEnquiryOpen}
        onClose={() => setCumulativeEnquiryOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Cumulative Enquiry By Stage Generated Successfully')
        }
      />
      ) : null}

      {weeklyEnquiryOpen ? (
      <WeeklyEnquirySummaryModal
        open={weeklyEnquiryOpen}
        onClose={() => setWeeklyEnquiryOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Weekly Enquiry Summary Generated Successfully')
        }
      />
      ) : null}

      {appointmentReportOpen ? (
      <AppointmentReportModal
        open={appointmentReportOpen}
        onClose={() => setAppointmentReportOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Appointment Report Generated Successfully')
        }
      />
      ) : null}

      {studentFormSubmissionOpen ? (
      <StudentFormSubmissionModal
        open={studentFormSubmissionOpen}
        onClose={() => setStudentFormSubmissionOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Student Form Submission Report Generated Successfully')
        }
      />
      ) : null}

      {staffFormSubmissionOpen ? (
      <StaffFormSubmissionModal
        open={staffFormSubmissionOpen}
        onClose={() => setStaffFormSubmissionOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Staff Form Submission Report Generated Successfully')
        }
      />
      ) : null}

      {activityExcelOpen ? (
      <ActivityExcelReportModal
        open={activityExcelOpen}
        onClose={() => setActivityExcelOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Activity Excel Report Generated Successfully')
        }
      />
      ) : null}

      {programStudentsOpen ? (
      <ProgramStudentsModal
        open={programStudentsOpen}
        onClose={() => setProgramStudentsOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Program Students Report Generated Successfully')
        }
      />
      ) : null}

      {programsReportOpen ? (
      <ProgramsReportModal
        open={programsReportOpen}
        onClose={() => setProgramsReportOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Programs Report Generated Successfully')
        }
      />
      ) : null}

      {deferredListOpen ? (
      <DeferredListModal
        open={deferredListOpen}
        onClose={() => setDeferredListOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Deferred List Report Generated Successfully')
        }
      />
      ) : null}

      {transferCampusProgramsOpen ? (
      <TransferCampusProgramsModal
        open={transferCampusProgramsOpen}
        onClose={() => setTransferCampusProgramsOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Transfer Campus List With Programs Generated Successfully')
        }
      />
      ) : null}

      {newJoinerBreakdownOpen ? (
      <NewJoinerBreakdownModal
        open={newJoinerBreakdownOpen}
        onClose={() => setNewJoinerBreakdownOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'New Joiner Breakdown By Month Generated Successfully')
        }
      />
      ) : null}

      {activeStudentsOpen ? (
      <ActiveStudentsModal
        open={activeStudentsOpen}
        onClose={() => setActiveStudentsOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Active Students Report Generated Successfully')
        }
      />
      ) : null}

      {studentStatusOpen ? (
      <StudentStatusModal
        open={studentStatusOpen}
        onClose={() => setStudentStatusOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Student Status Report Generated Successfully')
        }
      />
      ) : null}

      {transferCampusListOpen ? (
      <TransferCampusListModal
        open={transferCampusListOpen}
        onClose={() => setTransferCampusListOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Transfer Campus List Report Generated Successfully')
        }
      />
      ) : null}

      {withdrawalOpen ? (
      <WithdrawalReportModal
        open={withdrawalOpen}
        onClose={() => setWithdrawalOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Withdrawal Report Generated Successfully')
        }
      />
      ) : null}

      {roomCapacityOpen ? (
      <RoomCapacityModal
        open={roomCapacityOpen}
        onClose={() => setRoomCapacityOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Room Capacity Report Generated Successfully')
        }
      />
      ) : null}

      {graduatedStudentsOpen ? (
      <GraduatedStudentsModal
        open={graduatedStudentsOpen}
        onClose={() => setGraduatedStudentsOpen(false)}
        onGenerated={(report) =>
          handleExcelGenerated(report, 'Graduated Students Report Generated Successfully')
        }
      />
      ) : null}

      {ageDashboard ? (
        <AgeGroupDashboardPreview report={ageDashboard} onClose={() => setAgeDashboard(null)} />
      ) : null}

      <AnimatePresence>
        {successToast ? (
          <motion.div
            className="asr-toast"
            role="status"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
          >
            <strong>✓ {successToast}</strong>
            <span>Report downloaded successfully.</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
