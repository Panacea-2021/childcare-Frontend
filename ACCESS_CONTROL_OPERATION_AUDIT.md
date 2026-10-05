# Admin Panel Access Control Operation Audit

> **Scope:** `ChilldCare_FrontEnd` (childcare Admin Panel)  
> **Date:** 2026-08-12  
> **Mode:** Analysis only — **no code was modified**  
> **Source of truth:** Codebase (routes, `APP_MODULES`, components, stores, Settings Access Control UI)  
> **Not source of truth alone:** Screenshots / intended UX

---

## 1. Executive Summary

| Metric | Count / Finding |
|---|---|
| Sidebar top-level modules | **19** (`src/lib/modules.ts`) |
| Sidebar nested items | **~70+** |
| App Router pages under `src/app/(app)/` | **~121** `page.tsx` files |
| Real HTTP Admin APIs in this repo | **0** (`src/app/api` absent) |
| Persistence model | Almost entirely **localStorage / sessionStorage / in-memory mock** |
| Existing Access Control permission IDs (UI catalog) | **~100+** hardcoded in `SettingsAccessControlSection.tsx` |
| Permission **enforcement** | **None** (UI Save does not persist; nav/routes/actions unguarded) |
| Roles in Access Control UI | 8 (Finance Admin, Super Admin, Administrator, Principal, Center Head, Teacher, Senior Teacher, Head Teacher) |
| Parallel role models | Settings job roles ≠ Org scope roles ≠ Staff profile roles |
| Auth gate | Login session in `localStorage` (`panacea_auth`) → redirect to `/login` if missing |
| Middleware / route guards | **None** |

### Architecture reality (critical)

This Admin Panel is a **frontend demo/product shell**:

- Operations are implemented as **UI + client stores** (`src/lib/**/**Store.ts`, component state).
- `src/lib/api.ts` defines `apiGet` against `NEXT_PUBLIC_API_URL` / `localhost:3000/api/v1`, but **admin modules do not call it**.
- Therefore: **API maps below are “intended capability / store function” maps**, not live REST endpoints.
- When a real backend is added, each store mutation becomes a candidate API + permission check.

### High-level risk

| Risk | Status |
|---|---|
| Any logged-in user can open **any** admin route | **SECURITY GAP** |
| Delete student / refund / role editing UI available without permission checks | **SECURITY GAP** |
| Access Control “Save” is toast-only (no persistence) | **FUNCTIONAL GAP** |
| Destructive + financial ops exist in UI | Treat as **HIGH / CRITICAL** for future RBAC |

---

## 2. Complete Module Tree

Derived from `src/lib/modules.ts` (`APP_MODULES`) plus **hidden/orphan routes** discovered under `src/app/(app)/`.

```
Admin Panel
├── Dashboard                          /dashboard
├── Center Management
│   ├── Students                       /center-management/students
│   │   ├── Student Profile            /center-management/students/[id]
│   │   ├── Bulk Upload                /center-management/students/bulk
│   │   ├── Progress create            .../progress/create
│   │   └── Assessment create          .../progress/create-assessment
│   ├── Staff                          /center-management/staff
│   │   ├── Add / Edit                 /staff/add , /staff/[id]/edit
│   │   ├── Staff Profile              /staff/[id]
│   │   └── Bulk Upload                /staff/bulk
│   ├── Rooms                          /center-management/rooms
│   ├── Groups                         /center-management/groups
│   ├── Labels                         /center-management/labels
│   └── Email Templates                /center-management/email-templates
├── Program
│   ├── Program List                   /program
│   ├── Dashboard                      /program/dashboard
│   └── Program Movement               /program/program-movement
├── Attendance & Leaves
│   ├── Student Attendance             /attendance-leaves/student-attendance
│   ├── Staff Attendance               /attendance-leaves/staff-attendance
│   ├── Student Staff Ratio            /attendance-leaves/student-staff-ratio
│   └── Attendance Forecast            /attendance-leaves/attendance-forecast
├── Parent Communication
│   ├── Activities                     /parent-communication/activities
│   │   ├── Post Activity              .../activities/post
│   │   └── Activity Settings          .../activities/settings
│   ├── Daily Reports                  /parent-communication/daily-reports
│   ├── Notes                          /parent-communication/notes
│   ├── Concerns                       /parent-communication/concerns
│   ├── Newsletters                    /parent-communication/newsletters
│   │   └── Create/Edit                .../newsletters/create
│   └── Resource Center                /parent-communication/resource-center
├── Messages
│   ├── Parent Messages                /messages/parent-messages
│   ├── Staff Messages                 /messages/staff-messages
│   └── Staff Announcement             /messages/staff-announcement
├── Billing & Accounting
│   ├── Dashboard                      /billing-accounting
│   ├── Invoices                       /billing-accounting/invoices
│   │   ├── Detail                     .../invoices/[id]
│   │   ├── Create/Edit/Clone          .../invoices/create
│   │   ├── Customize PDF              .../invoices/customize-pdf
│   │   └── Debit Create               .../invoices/debit/create
│   ├── Student Balances               /billing-accounting/student-balances
│   │   ├── Credit History             .../credit-history
│   │   └── Deposit History            .../deposit-history
│   ├── Payments                       /billing-accounting/payments
│   ├── Fee Plan                       /billing-accounting/fee-plan
│   │   ├── Create                     .../fee-plan/create
│   │   └── Detail                     .../fee-plan/[id]
│   └── Fee Reminders                  /billing-accounting/fee-reminders
├── Enquiries
│   ├── Dashboard                      /enquiries/dashboard
│   ├── Enquiries                      /enquiries
│   ├── Tasks                          /tasks  (sidebar points /tasks; /enquiries/tasks redirects)
│   ├── Enquiry Forms                  /enquiries/forms (+ builder, pdf)
│   ├── Automations                    /enquiries/marketing (+ builder, templates)
│   ├── Email Campaigns                /enquiries/marketing/email-campaigns (+ create/edit/templates)
│   ├── Facebook                       /enquiries/facebook
│   ├── WhatsApp                       /enquiries/whatsapp
│   └── Tour Management (hidden nav)   /enquiries/tour (+ new, calendars, [id])
├── Calendar
│   ├── School Calendar                /calendar
│   ├── Staff Schedule                 /calendar/staff-schedule
│   ├── Student Schedule               /calendar/student-schedule
│   ├── Staff Holidays                 /calendar/staff-holidays
│   ├── Birthday Calendar              /calendar/birthday-calendar
│   └── Meal Planner                   /calendar/meal-planner
├── Progress Tracking
│   ├── Progress Grid                  /progress-tracking/progress-grid
│   ├── Student Progress               /progress-tracking/student-progress
│   ├── Lesson Plan                    /progress-tracking/lesson-plan
│   ├── Lesson Set Mapping             /progress-tracking/lesson-set-mapping
│   ├── Progress Boards                /progress-tracking/progress-boards (+ edit lesson)
│   ├── Observations                   /progress-tracking/observations
│   └── Learning Journey               /progress-tracking/learning-journey (+ create)
├── Learning & Assessment
│   ├── Assessments                    /learning-assessment
│   ├── Lessons                        /learning-assessment/lessons
│   ├── Curriculum Document            /learning-assessment/curriculum-document
│   └── Manage                         /learning-assessment/manage
├── Forms
│   ├── All Forms                      /forms (+ [id], builder)
│   └── Admission Process              /forms/admission-process (+ [id])
├── Tools
│   ├── Hub                            /tools
│   ├── ID Cards                       /tools/id-cards
│   └── Certificates                   /tools/certificates
├── Reports                            /reports  (in-page catalog; no nested routes)
├── Settings                           /settings?section=*
│   ├── Programs
│   ├── Access Control
│   ├── Activity Posts
│   ├── Attendance
│   ├── Billing
│   ├── Bus Tracking
│   ├── CCTV
│   ├── Forms
│   ├── Lesson
│   ├── Roles
│   ├── School Details
│   ├── Staff Leave Management
│   ├── Vaccine Library
│   ├── Email Templates
│   └── Other Settings
├── Help                               /help?section=*
├── Language                           /language
├── Profile                            /profile
├── Notifications                      /notifications
└── Account extras (not sidebar)
    ├── /my-account
    ├── /get-started
    ├── /onboarding
    ├── /premium-features
    ├── /reset-password
    └── /notification-preferences
```

**Evidence:** `src/lib/modules.ts`, `src/app/(app)/**/page.tsx`

---

## 3. Detailed Module Analysis

### Legend

| Column | Meaning |
|---|---|
| Type | CRUD / BUSINESS / FILE / WORKFLOW / SECURITY / SYSTEM |
| Backend | Store function or “N/A (UI/mock)” — **no REST in-repo** |
| Risk | LOW / MEDIUM / HIGH / CRITICAL |
| Confidence | HIGH = UI + store confirmed; MEDIUM = UI clear, persistence weak; LOW = inferred |

---

### 3.1 Center Management — Students

| Operation | Type | Page / UI | Backend / Store | Risk | Suggested Permission | Confidence |
|---|---|---|---|---|---|---|
| View student list | READ | `StudentsPage` | `loadStudents` | LOW | `STUDENT_VIEW_LIST` | HIGH |
| View student profile | READ | `StudentProfilePage` | `loadStudents` | LOW | `STUDENT_VIEW` | HIGH |
| Add student | CREATE | Add modal / form | `createStudent` / `saveStudents` | MEDIUM | `STUDENT_CREATE` | HIGH |
| Edit student info/health/allergy/emergency/photo | UPDATE | Profile tabs | `saveStudents` | MEDIUM | `STUDENT_UPDATE` | HIGH |
| Change student status | WORKFLOW | Status UI | `saveStudents` | HIGH | `STUDENT_CHANGE_STATUS` | HIGH |
| Delete student | DELETE | Confirm delete | filter + `saveStudents` | HIGH | `STUDENT_DELETE` | HIGH |
| Bulk upload students | FILE | `BulkUploadStudentsScreen` | `createStudent` loop | HIGH | `STUDENT_BULK_UPLOAD` | HIGH |
| Export selected roster | FILE | Toolbar | client export | MEDIUM | `STUDENT_EXPORT` | HIGH |
| Add sibling | CREATE | `AddSiblingModal` | `createSibling` | MEDIUM | `STUDENT_ADD_SIBLING` | HIGH |
| Profile notes add/update | UPDATE | Notes tab | student notes in store | MEDIUM | `STUDENT_NOTES_MANAGE` | HIGH |
| Documents access | FILE | Personal files panel | localStorage files | MEDIUM | `STUDENT_DOCUMENTS_ACCESS` | HIGH |
| Immunization edit / exempt / remind | BUSINESS | `ImmunizationTab` | vaccines on student | HIGH | `STUDENT_IMMUNIZATION_*` | HIGH |
| Generate student QR / kiosk | BUSINESS | QR modals | student data | MEDIUM | `STUDENT_QR_GENERATE` | HIGH |
| Message parents (from profile) | BUSINESS | Message flow | messaging store | MEDIUM | `MSG_PARENT_SEND` | HIGH |

**Existing AC IDs (partial map):** `cm-stu-view`, `cm-stu-add`, `cm-stu-edit`, `cm-stu-delete`, `cm-students-view-page`, `cm-students-phone`, `cm-students-signed-up`, `cm-notes-student`, `cm-docs-student`

---

### 3.2 Center Management — Staff

| Operation | Type | Evidence | Risk | Suggested Permission | Confidence |
|---|---|---|---|---|---|
| View staff list/profile | READ | `StaffPage`, `StaffProfilePage` | LOW | `STAFF_VIEW` | HIGH |
| Add staff | CREATE | `StaffFormScreen` `/add` | MEDIUM | `STAFF_CREATE` | HIGH |
| Edit staff | UPDATE | form / profile | MEDIUM | `STAFF_UPDATE` | HIGH |
| Delete / bulk delete | DELETE | `StaffPage` | HIGH | `STAFF_DELETE` | HIGH |
| Change Active/Inactive | WORKFLOW | status change | HIGH | `STAFF_CHANGE_STATUS` | HIGH |
| Regenerate kiosk PIN | SECURITY | profile | HIGH | `STAFF_REGENERATE_PIN` | HIGH |
| Bulk upload | FILE | `BulkUploadStaffScreen` | HIGH | `STAFF_BULK_UPLOAD` | HIGH |
| Update own/other role | SECURITY | AC labels + staff forms | CRITICAL | `STAFF_UPDATE_ROLE_*` | MEDIUM |

**Existing AC IDs:** `cm-staff-view`, `cm-staff-edit`, `cm-staff-delete`, `cm-staff-update-own-role`, `cm-staff-update-other-role`

---

### 3.3 Rooms / Groups / Labels / Email Templates

| Sub-module | Operations found | Suggested permissions | Confidence |
|---|---|---|---|
| Rooms | Create, rename, delete, status change, view assignees | `ROOM_VIEW`, `ROOM_CREATE`, `ROOM_RENAME`, `ROOM_DELETE`, `ROOM_CHANGE_STATUS` | HIGH |
| Groups | Create, rename, delete, assign students | `GROUP_VIEW`, `GROUP_CREATE`, `GROUP_DELETE`, `GROUP_ASSIGN_STUDENTS` | HIGH |
| Labels | Create, edit, delete, feature bulk delete | `LABEL_VIEW`, `LABEL_CREATE`, `LABEL_UPDATE`, `LABEL_DELETE` | HIGH |
| Email templates | Template CRUD, fee automation CRUD, attachments UI | `EMAIL_TEMPLATE_*`, `FEE_REMINDER_TEMPLATE_*` | HIGH |

**Existing AC IDs:** `cm-rooms-*`, `cm-groups-*`, `cm-ac-email-templates`, `cm-ac-fee-reminder`, `cm-ac-parent-invite`

**Gap vs code:** Groups **rename** and **assign** exist in UI but AC catalog only has create/delete for groups. Rooms **status change** and **view** not explicit in AC.

---

### 3.4 Program

| Operation | Type | Evidence | Risk | Permission | Confidence |
|---|---|---|---|---|---|
| View programs / dashboard | READ | `ProgramPage`, `ProgramDashboardPage` | LOW | `PROGRAM_VIEW` | HIGH |
| Create / edit / delete program | CRUD | `programsStore` | MEDIUM–HIGH | `PROGRAM_CREATE/UPDATE/DELETE` | HIGH |
| Assign students/staff | BUSINESS | assignments store | MEDIUM | `PROGRAM_ASSIGN` | HIGH |
| Export CSV | FILE | Program page | MEDIUM | `PROGRAM_EXPORT` | HIGH |
| Program movement rules / room move | WORKFLOW | `ProgramMovementPage` | HIGH | `PROGRAM_MOVEMENT_MANAGE` | HIGH |

**Existing AC IDs:** `prog-view/create/edit/delete`

---

### 3.5 Attendance & Leaves

#### Student Attendance (`StudentAttendancePage`)

| Operation | Type | Handler / store | Risk | Permission | Confidence |
|---|---|---|---|---|---|
| View daily/monthly attendance | READ | page + `attendanceStore` | LOW | `ATTENDANCE_STUDENT_VIEW` | HIGH |
| Check In (row + bulk) | BUSINESS | `upsertDayRecord(s)` | HIGH | `ATTENDANCE_STUDENT_CHECK_IN` | HIGH |
| Check Out (row + bulk) | BUSINESS | same | HIGH | `ATTENDANCE_STUDENT_CHECK_OUT` | HIGH |
| Mark Absent (row + bulk) | BUSINESS | same | HIGH | `ATTENDANCE_STUDENT_MARK_ABSENT` | HIGH |
| Edit attendance entry | UPDATE | edit modal | HIGH | `ATTENDANCE_STUDENT_EDIT` | HIGH |
| Delete attendance entry | DELETE | `clearDayRecord` | HIGH | `ATTENDANCE_STUDENT_DELETE` | HIGH |
| Download monthly PDF | FILE | `downloadMonthlyPdf` | MEDIUM | `ATTENDANCE_STUDENT_EXPORT_PDF` | HIGH |
| Attendance QR download | FILE | `downloadQr` | MEDIUM | `ATTENDANCE_QR_DOWNLOAD` | HIGH |
| Reports navigation | READ | Reports button | LOW | `ATTENDANCE_REPORT_VIEW` | MEDIUM |

**Existing AC IDs:** `sa-view`, `sa-mark`, `sa-edit`, `sa-report` — **too coarse** vs Check In / Out / Absent split.

#### Staff Attendance

Same pattern via `StaffAttendancePage` + `staffAttendanceStore` → `ATTENDANCE_STAFF_*`

**Existing:** `sta-update`, `sta-record`

#### Leaves

| Operation | Evidence | Permission | Risk |
|---|---|---|---|
| View leaves | leave panels | `LEAVE_*_VIEW` | LOW |
| Add leave | `saveNewLeaves` | `LEAVE_*_CREATE` | MEDIUM |
| Edit / delete leave | panels | `LEAVE_*_UPDATE/DELETE` | MEDIUM |
| Approve / Deny | `approve`, `deny` | `LEAVE_*_APPROVE` / `LEAVE_*_DENY` | HIGH |
| Comment | `postComment` | `LEAVE_*_COMMENT` | LOW |
| Leave settings / types / policies | settings panels | `LEAVE_SETTINGS_MANAGE` | HIGH |

**Existing:** `stl-view/add/edit/approve` (staff leaves). Student leave approve not fully mirrored in AC catalog.

#### Ratio / Forecast

| Page | Ops | Permission | Confidence |
|---|---|---|---|
| Student Staff Ratio | View/filter only | `RATIO_VIEW` | HIGH |
| Attendance Forecast | View + navigate | `FORECAST_VIEW` | HIGH |

---

### 3.6 Parent Communication

| Feature | Operations | Risk | Suggested permissions | Confidence |
|---|---|---|---|---|
| Activities | View feed, Post (publish/draft), Edit, Delete, Settings CRUD defs | MED–HIGH | `PC_ACTIVITY_VIEW/CREATE/EDIT/DELETE`, `PC_ACTIVITY_SETTINGS` | HIGH |
| Daily reports | Generate draft/publish, checklist config | MEDIUM | `PC_DAILY_REPORT_*` | MEDIUM |
| Notes | Mark read, archive, restore | LOW–MED | `PC_NOTES_VIEW/MANAGE` | MEDIUM (in-memory mock) |
| Concerns | View, comment, status → Resolved | MEDIUM | `PC_CONCERN_VIEW/COMMENT/RESOLVE` | MEDIUM |
| Newsletters | CRUD editor | MEDIUM | `PC_NEWSLETTER_*` | HIGH |
| Resource Center | Add/update/delete docs | MEDIUM | `PC_RESOURCE_*` | HIGH |

**Existing AC:** `pc-post-*`, `pc-voice`, `pc-concern-*`, `pc-view-notes`, `pc-fb-configure`, `pc-mkt-*`, empty SMS/Phone groups

---

### 3.7 Messages

| Feature | Ops | Store | Permission | Confidence |
|---|---|---|---|---|
| Parent messages | Send text/attachment/voice, new chat, create group | mostly in-memory | `MSG_PARENT_*` | MEDIUM |
| Staff messages | Send | in-memory | `MSG_STAFF_SEND` | MEDIUM |
| Staff announcements | Create/edit/preview/delete | in-memory | `MSG_ANNOUNCE_*` | MEDIUM |

**Existing AC:** `msg-parent-*`, `msg-staff-*`, `msg-group-*`

---

### 3.8 Billing & Accounting

| Operation | Type | Evidence | Risk | Permission | Confidence |
|---|---|---|---|---|---|
| View dashboard / KPIs | READ | `BillingDashboardPage` | LOW | `BILLING_DASHBOARD_VIEW` | HIGH |
| View invoices | READ | `InvoicesPage` | LOW | `INVOICE_VIEW` | HIGH |
| Create / edit / clone invoice | CRUD | create page + actions | HIGH | `INVOICE_CREATE/UPDATE/CLONE` | HIGH |
| Delete invoice | DELETE | delete modal | CRITICAL | `INVOICE_DELETE` | HIGH |
| Cancel invoice | WORKFLOW | cancel action | HIGH | `INVOICE_CANCEL` | HIGH |
| Record payment | BUSINESS | `recordInvoicePayment` | CRITICAL | `PAYMENT_RECORD` | HIGH |
| Refund invoice | BUSINESS | `recordInvoiceRefund` | CRITICAL | `PAYMENT_REFUND` | HIGH |
| Email invoice / reminder | BUSINESS | email/remind actions | HIGH | `INVOICE_EMAIL` / `FEE_REMINDER_SEND` | HIGH |
| Download invoice/receipt PDF | FILE | preview pages | MEDIUM | `INVOICE_DOWNLOAD` / `RECEIPT_DOWNLOAD` | HIGH |
| Customize invoice PDF settings | SYSTEM | `CustomizeInvoicePdfPage` | HIGH | `INVOICE_PDF_SETTINGS` | HIGH |
| Debit note create/view | CRUD | debit flows | HIGH | `DEBIT_CREATE/VIEW` | HIGH |
| Credit / deposit allocate | BUSINESS | balances + `BillingTab` | CRITICAL | `CREDIT_*` / `DEPOSIT_*` | HIGH |
| Credit note issue | BUSINESS | ledger ops | HIGH | `CREDIT_NOTE_ISSUE` | HIGH |
| Transfer deposit → credit | BUSINESS | `transferDepositToCredit` | CRITICAL | `DEPOSIT_TRANSFER_TO_CREDIT` | HIGH |
| Fee plan CRUD / assign | CRUD | fee plan pages/stores | HIGH | `FEE_PLAN_*` | HIGH |
| Discount / tax manage | UPDATE | fee plan / stores | HIGH | `DISCOUNT_*` / `TAX_*` | HIGH |
| Payments list view | READ | `PaymentsPage` | LOW | `PAYMENT_VIEW` | HIGH |
| Export CSV (balances/history) | FILE | history pages | MEDIUM | `BILLING_EXPORT` | HIGH |

**Existing AC (partial):** `bill-record-payment`, `bill-send-reminders`, `bill-inv-*`, `bill-disc-*`, `bill-tax-add`  
**Missing vs code:** Refund, debit notes, fee plan CRUD, balances allocate, PDF customize, clone — **must be added** to permission catalog.

---

### 3.9 Enquiries / Tasks / Marketing / Tour

| Area | Key ops | Risk | Permissions | Confidence |
|---|---|---|---|---|
| Enquiries | Create/edit/view, stage move, import, export Excel/CSV/PDF | HIGH | `ENQUIRY_*`, `ENQUIRY_IMPORT`, `ENQUIRY_EXPORT`, `ENQUIRY_MOVE_STAGE` | HIGH (UI); MEDIUM (in-memory persistence) |
| Stages / sources / lost reasons | CRUD | MEDIUM | `ENQUIRY_META_*` | HIGH |
| Tasks | CRUD, status, duplicate, bulk update, CSV export | MEDIUM | `TASK_*` | HIGH |
| Enquiry forms | CRUD, publish, duplicate, print, download | HIGH | `ENQUIRY_FORM_*` | HIGH |
| Automations | Create/delete/view/builder save | HIGH | `AUTOMATION_*` | HIGH |
| Email campaigns | Draft, send test, duplicate, delete | HIGH | `CAMPAIGN_*` | HIGH |
| Facebook / WhatsApp | Connect/configure UI | MEDIUM | `INTEGRATION_*` | MEDIUM |
| Tour appointments | CRUD appointments/calendars | HIGH | `TOUR_*` | HIGH |

**Existing AC:** coarse `enq-*`; tour blockoff/calendar IDs; marketing `pc-mkt-*`  
**Gap:** Tasks, form builder, campaign send, enquiry import/export not fully covered.

---

### 3.10 Calendar

| Sub-module | Ops | Permissions | Confidence |
|---|---|---|---|
| School calendar | CRUD events, media, comment (AC) | `CALENDAR_*` | HIGH/MEDIUM |
| Staff / student schedule | Add/edit, export CSV | `SCHEDULE_*` | HIGH |
| Staff holidays / weekends / leave policy | Configure | `HOLIDAY_*` / `LEAVE_POLICY_*` | HIGH |
| Birthday calendar | Add/edit | `BIRTHDAY_*` | MEDIUM |
| Meal planner | Foods/categories/templates/plans | `MEAL_PLANNER_*` | MEDIUM |

**Existing AC:** school calendar + student schedule only — **meal planner / holidays / staff schedule underrepresented**.

---

### 3.11 Progress Tracking & Learning

| Feature | Ops | Permissions | Confidence |
|---|---|---|---|
| Progress grid / boards / records | Add/save records | `PROGRESS_RECORD_*` | MEDIUM |
| Lesson plan | Assign, record, PDF | `LESSON_PLAN_*` | HIGH |
| Observations | Submit | `OBSERVATION_*` | MEDIUM |
| Learning journey | Create/update/delete/share PDF | `LEARNING_JOURNEY_*` | HIGH |
| Lessons (L&A) | CRUD + import | `LESSON_*` | HIGH |
| Assessments | CRUD + portfolio | `ASSESSMENT_*` | HIGH |
| Curriculum documents | Folder/doc CRUD, download | `CURRICULUM_*` | HIGH |
| Manage (frameworks/scales) | Configure | `ASSESSMENT_SETTINGS_*` | HIGH |
| AI lesson generate | UI | `AI_USE` | MEDIUM |

**Existing AC:** assessment/journey/observation/lessons/AI groups — good coverage; progress grid specifics weaker.

---

### 3.12 Forms / Tools / Reports

| Module | Ops | Permissions | Confidence |
|---|---|---|---|
| Forms | CRUD, publish, builder | `FORM_*` | HIGH |
| Admission process | CRUD process/steps | `ADMISSION_PROCESS_*` | HIGH |
| ID Cards / Certificates | Wizard + download (mock people) | `TOOLS_ID_CARD_*`, `TOOLS_CERTIFICATE_*` | MEDIUM |
| Reports | View catalog, favorite, generate, download CSV/Excel/PDF | `REPORT_VIEW`, `REPORT_FAVORITE`, `REPORT_GENERATE`, `REPORT_EXPORT` | HIGH |

**Existing AC:** `form-*`, `tools-view/configure`, `rep-view/favorite/export`  
**Recommendation:** Prefer per-report-category generate permissions later if needed; start with `REPORT_GENERATE` + `REPORT_EXPORT`.

---

### 3.13 Settings (HIGH RISK surface)

| Section | Ops | Risk | Permission | Confidence |
|---|---|---|---|---|
| Access Control | Toggle perms, Save (non-persistent) | CRITICAL | `SETTINGS_ACCESS_CONTROL_MANAGE` | HIGH |
| Roles | Add/edit roles (in-memory) | CRITICAL | `SETTINGS_ROLES_MANAGE` | HIGH |
| School Details | Save org info | HIGH | `SETTINGS_SCHOOL_UPDATE` | HIGH |
| Billing settings | Edit billing/email settings | HIGH | `SETTINGS_BILLING_UPDATE` | HIGH |
| Attendance settings | Leave types, toggles | HIGH | `SETTINGS_ATTENDANCE_UPDATE` | HIGH |
| Staff leave management | Policies/holidays | HIGH | `SETTINGS_STAFF_LEAVE_UPDATE` | HIGH |
| Bus tracking | CRUD routes/stops | HIGH | `SETTINGS_BUS_*` | HIGH |
| CCTV | Add/assign/delete cameras | HIGH | `SETTINGS_CCTV_*` | HIGH |
| Forms settings | Field/section config | HIGH | `SETTINGS_FORMS_UPDATE` | HIGH |
| Lesson / Vaccine / Programs / Email / Other | Configure | MED–HIGH | `SETTINGS_*` | MEDIUM–HIGH |

**Existing AC:** `cm-ac-settings` (broad). Recommend **splitting** Settings into section permissions.

---

## 4. Business Operations (non-CRUD)

| Module | Action | Evidence | Risk | Suggested Permission |
|---|---|---|---|---|
| Student Attendance | Check In | `StudentAttendancePage` | HIGH | `ATTENDANCE_STUDENT_CHECK_IN` |
| Student Attendance | Check Out | same | HIGH | `ATTENDANCE_STUDENT_CHECK_OUT` |
| Student Attendance | Mark Absent | same | HIGH | `ATTENDANCE_STUDENT_MARK_ABSENT` |
| Staff Attendance | Check In/Out/Absent | `StaffAttendancePage` | HIGH | `ATTENDANCE_STAFF_*` |
| Leaves | Approve / Deny | leave panels | HIGH | `LEAVE_*_APPROVE/DENY` |
| Invoices | Record Payment | `recordInvoicePayment` | CRITICAL | `PAYMENT_RECORD` |
| Invoices | Refund | `recordInvoiceRefund` | CRITICAL | `PAYMENT_REFUND` |
| Invoices | Cancel | cancel flow | HIGH | `INVOICE_CANCEL` |
| Invoices | Email / Remind | PaymentActions / list | HIGH | `INVOICE_EMAIL`, `FEE_REMINDER_SEND` |
| Invoices | Clone | clone create | MEDIUM | `INVOICE_CLONE` |
| Balances | Allocate credit/deposit | allocation modal | CRITICAL | `BALANCE_ALLOCATE` |
| Billing profile | Transfer deposit→credit | `transferDepositToCredit` | CRITICAL | `DEPOSIT_TRANSFER_TO_CREDIT` |
| Enquiries | Move stage | stage move | HIGH | `ENQUIRY_MOVE_STAGE` |
| Concerns | Resolve | status change | MEDIUM | `PC_CONCERN_RESOLVE` |
| Activities | Publish / Draft | post activity | MEDIUM | `PC_ACTIVITY_PUBLISH` |
| Forms | Publish | form builder | HIGH | `FORM_PUBLISH` |
| Staff | Regenerate PIN | profile | HIGH | `STAFF_REGENERATE_PIN` |
| Students | Status change | students list | HIGH | `STUDENT_CHANGE_STATUS` |
| Program | Room movement confirm | movement page | HIGH | `PROGRAM_MOVEMENT_CONFIRM` |

---

## 5. File Operations

| Module | Operation | Evidence | Risk | Permission |
|---|---|---|---|---|
| Students | Bulk upload | BulkUploadStudentsScreen | HIGH | `STUDENT_BULK_UPLOAD` |
| Staff | Bulk upload | BulkUploadStaffScreen | HIGH | `STAFF_BULK_UPLOAD` |
| Enquiries | Import Excel/CSV | EnquiryImportDialog | HIGH | `ENQUIRY_IMPORT` |
| Enquiries | Export Excel/CSV/PDF | export dropdown | MEDIUM | `ENQUIRY_EXPORT` |
| Attendance | Monthly PDF / QR | attendance pages | MEDIUM | `ATTENDANCE_EXPORT_*` |
| Billing | Invoice/receipt PDF download | preview pages | MEDIUM | `INVOICE_DOWNLOAD` |
| Billing | CSV export histories | balance history pages | MEDIUM | `BILLING_EXPORT` |
| Reports | CSV/Excel/PDF download | report modals | MEDIUM | `REPORT_EXPORT` |
| Forms | Print / PDF / JSON download | forms pages | MEDIUM | `FORM_EXPORT` |
| Tools | ID card / certificate download | tools wizards | MEDIUM | `TOOLS_DOWNLOAD` |
| Documents | Upload/download ZIP | PersonalFilesPanel | MEDIUM | `DOCUMENTS_*` |

---

## 6. Reports & Export Operations

- Catalog: `src/components/reports/data/reportCatalog.ts`
- Page: `ReportsPage` + many `*Modal.handleGenerate` under `src/components/reports/`
- Categories observed: attendance, student info, billing, staff, enquiry, tour, admissions, forms, activity excel

| Operation | Permission | Risk |
|---|---|---|
| View reports catalog | `REPORT_VIEW` | LOW |
| Favorite reports | `REPORT_FAVORITE` | LOW |
| Generate report | `REPORT_GENERATE` | MEDIUM |
| Export/download generated report | `REPORT_EXPORT` | MEDIUM |

Optional later: `REPORT_GENERATE_<CATEGORY>` if business requires segregation.

---

## 7. Workflow / Status Operations

| Entity | Transitions found | Permission |
|---|---|---|
| Student status | Active / Inactive / On Hold / Withdrawn / Signed up / etc. | `STUDENT_CHANGE_STATUS` |
| Staff status | Active ↔ Inactive | `STAFF_CHANGE_STATUS` |
| Leave request | Pending → Approved / Denied | `LEAVE_*_APPROVE/DENY` |
| Invoice | Due/Paid/Overdue/Cancelled/Refund paths | `INVOICE_CANCEL`, `PAYMENT_RECORD`, `PAYMENT_REFUND` |
| Enquiry stage | Board move between stages | `ENQUIRY_MOVE_STAGE` |
| Concern | Open → In Progress → Resolved | `PC_CONCERN_RESOLVE` |
| Activity / form | Draft → Published | `PC_ACTIVITY_PUBLISH`, `FORM_PUBLISH` |
| Task status | Status updates | `TASK_UPDATE_STATUS` |

---

## 8. Settings Operations

| Section | View | Update | Risk |
|---|---|---|---|
| Access Control | Yes | Toggle + Save (non-persistent) | CRITICAL |
| Roles | Yes | Add/Edit (in-memory) | CRITICAL |
| School Details | Yes | Save | HIGH |
| Billing / Attendance / Leave / Lesson / Vaccine / Forms / Bus / CCTV / Email / Other / Programs / Activity Posts | Yes | Section-specific saves | MED–HIGH |

---

## 9. Role Management Operations

### Implemented in UI (`SettingsRolesSection`)

| Op | Exists? | Persisted? |
|---|---|---|
| View roles list | Yes | No (SEED in memory) |
| Add role | Yes | No |
| Edit role (name, attendance/ratio flags) | Yes | No |
| Delete role | Yes | No |
| Open permissions UI | Yes (navigates to Access Control) | N/A |
| Clone role | **Not found** | — |
| Assign role to staff | Via staff forms / role dropdowns (string lists) | Staff store LS |

### Access Control ops (`SettingsAccessControlSection`)

| Op | Exists? | Persisted? |
|---|---|---|
| Select role | Yes | Session UI only |
| Toggle permissions | Yes | No |
| Give all permissions | Yes | No |
| Save | Yes (baseline in React state + toast) | **No localStorage/API** |
| Cancel / reload defaults | Yes | N/A |

---

## 10. Existing Authorization

| Location | Check | Type | Status |
|---|---|---|---|
| `AppShell.tsx` | `getSession()` → redirect `/login` | Authn only | Active |
| `src/lib/auth.ts` | localStorage `panacea_auth` | Authn | Active — **no role** |
| `modules.ts` + AppShell nav | Renders all modules | None | No filtering |
| `SettingsAccessControlSection` | UI checkboxes | Mock authz | **Not enforced** |
| `SettingsRolesSection` | Role CRUD UI | Mock | **Not persisted** |
| Org `centerScopeStorage` / `CenterScopeContext` | `organization_admin` / `center_admin` / `staff` | Scope | Active for center switcher only |
| `src/lib/tasks/currentUser.ts` | demo `isAdmin` | Local demo | Tasks UI only |
| Next.js middleware | — | — | **Absent** |
| Backend guards | — | — | **Absent (no admin API)** |

---

## 11. Authorization Gaps / Security Risks

1. **No route-level RBAC** — any authenticated session reaches any `(app)` URL.  
2. **No action-level RBAC** — Delete Student, Refund, Approve Leave, Record Payment all unprotected.  
3. **Access Control Save is cosmetic** — permissions reset on reload.  
4. **Triple role model** — Settings roles vs Org roles vs Staff roles can diverge.  
5. **Financial CRITICAL ops** present without approval workflow enforcement.  
6. **UI-only “security”** — hiding buttons later without backend checks will be insufficient once APIs exist.  
7. **Parent portal** is separate (`(parent)` layout) — out of Admin RBAC scope but shares some stores (students, invoices, timeline).

---

## 12. Recommended Permission Catalog

### Naming standard

```
DOMAIN_RESOURCE_ACTION
```

Examples: `STUDENT_VIEW`, `ATTENDANCE_STUDENT_CHECK_IN`, `PAYMENT_REFUND`

Keep existing short IDs (`cm-stu-view`) as **legacy aliases** during migration if needed.

### Recommended catalog (HIGH confidence, code-backed)

> Includes both: (A) operations proven in code, and (B) existing AC UI IDs that map cleanly.  
> Empty AC groups (SMS, Phone, Subsidy) omitted until implemented.

#### Center Management

| Permission Code | Module | Operation | Risk |
|---|---|---|---|
| STUDENT_VIEW_LIST | Students | View list | LOW |
| STUDENT_VIEW | Students | View profile | LOW |
| STUDENT_CREATE | Students | Create | MEDIUM |
| STUDENT_UPDATE | Students | Update profile | MEDIUM |
| STUDENT_DELETE | Students | Delete | HIGH |
| STUDENT_CHANGE_STATUS | Students | Status change | HIGH |
| STUDENT_BULK_UPLOAD | Students | Bulk upload | HIGH |
| STUDENT_EXPORT | Students | Export roster | MEDIUM |
| STUDENT_NOTES_MANAGE | Students | Notes | MEDIUM |
| STUDENT_DOCUMENTS_ACCESS | Students | Documents | MEDIUM |
| STUDENT_IMMUNIZATION_MANAGE | Students | Immunization edit/exempt | HIGH |
| STUDENT_QR_GENERATE | Students | QR/kiosk | MEDIUM |
| STAFF_VIEW | Staff | View | LOW |
| STAFF_CREATE | Staff | Create | MEDIUM |
| STAFF_UPDATE | Staff | Update | MEDIUM |
| STAFF_DELETE | Staff | Delete | HIGH |
| STAFF_CHANGE_STATUS | Staff | Status | HIGH |
| STAFF_BULK_UPLOAD | Staff | Bulk upload | HIGH |
| STAFF_REGENERATE_PIN | Staff | Kiosk PIN | HIGH |
| STAFF_UPDATE_OWN_ROLE | Staff | Update own role | CRITICAL |
| STAFF_UPDATE_OTHER_ROLE | Staff | Update other role | CRITICAL |
| ROOM_VIEW / CREATE / RENAME / DELETE / CHANGE_STATUS | Rooms | CRUD+status | MED–HIGH |
| GROUP_VIEW / CREATE / RENAME / DELETE / ASSIGN | Groups | CRUD+assign | MED–HIGH |
| LABEL_VIEW / CREATE / UPDATE / DELETE | Labels | CRUD | MEDIUM |
| EMAIL_TEMPLATE_MANAGE | Email Templates | CRUD | HIGH |
| FEE_REMINDER_TEMPLATE_MANAGE | Fee Reminders | CRUD | HIGH |

#### Attendance

| Permission Code | Risk |
|---|---|
| ATTENDANCE_STUDENT_VIEW | LOW |
| ATTENDANCE_STUDENT_CHECK_IN | HIGH |
| ATTENDANCE_STUDENT_CHECK_OUT | HIGH |
| ATTENDANCE_STUDENT_MARK_ABSENT | HIGH |
| ATTENDANCE_STUDENT_EDIT | HIGH |
| ATTENDANCE_STUDENT_DELETE | HIGH |
| ATTENDANCE_STUDENT_EXPORT | MEDIUM |
| ATTENDANCE_STAFF_VIEW / RECORD / UPDATE | MED–HIGH |
| LEAVE_STUDENT_* / LEAVE_STAFF_* (VIEW/CREATE/EDIT/DELETE/APPROVE/DENY) | MED–HIGH |
| RATIO_VIEW / FORECAST_VIEW | LOW |

#### Billing

| Permission Code | Risk |
|---|---|
| BILLING_DASHBOARD_VIEW | LOW |
| INVOICE_VIEW / CREATE / UPDATE / DELETE / CLONE / CANCEL | MED–CRITICAL |
| PAYMENT_VIEW / RECORD / REFUND | HIGH–CRITICAL |
| INVOICE_EMAIL / FEE_REMINDER_SEND | HIGH |
| INVOICE_DOWNLOAD / RECEIPT_DOWNLOAD | MEDIUM |
| INVOICE_PDF_SETTINGS | HIGH |
| DEBIT_VIEW / CREATE | HIGH |
| CREDIT_* / DEPOSIT_* / CREDIT_NOTE_ISSUE / BALANCE_ALLOCATE / DEPOSIT_TRANSFER_TO_CREDIT | HIGH–CRITICAL |
| FEE_PLAN_VIEW / CREATE / UPDATE / DELETE / ASSIGN | HIGH |
| DISCOUNT_MANAGE / TAX_MANAGE | HIGH |
| BILLING_EXPORT | MEDIUM |

#### Parent Communication / Messages / Calendar / Program / Enquiries / Learning / Forms / Tools / Reports / Settings / Multi-center / AI

Mirror existing AC categories with the finer ops listed in §3. Prefer splitting Settings into:

- `SETTINGS_ACCESS_CONTROL_MANAGE` (**CRITICAL**)
- `SETTINGS_ROLES_MANAGE` (**CRITICAL**)
- `SETTINGS_SCHOOL_UPDATE`, `SETTINGS_BILLING_UPDATE`, … per section (**HIGH**)

---

## 13. Permission Dependencies

| Permission | Requires |
|---|---|
| *_UPDATE / *_DELETE / business actions | Corresponding `*_VIEW` |
| PAYMENT_RECORD / PAYMENT_REFUND | `INVOICE_VIEW` |
| ATTENDANCE_*_CHECK_IN/OUT/ABSENT | `ATTENDANCE_*_VIEW` |
| LEAVE_*_APPROVE | `LEAVE_*_VIEW` |
| SETTINGS_ACCESS_CONTROL_MANAGE | none (gate carefully; Super Admin only recommended) |
| STAFF_UPDATE_OTHER_ROLE | `STAFF_VIEW` + typically Super Admin |

Do **not** create permissions for Search / Filter / Sort / Pagination — include under VIEW.

---

## 14. Suggested Role Permission Matrix

Roles present in Access Control UI:

`Super Admin` | `Administrator` | `Finance Admin` | `Principal` | `Center Head` | `Teacher` | `Senior Teacher` | `Head Teacher`

| Module | Permission | Super Admin | Admin | Finance Admin | Staff-facing roles |
|---|---|---|---|---|---|
| All | * | ✅ default all | ✅ default all (UI) | Partial (billing + some CM in UI defaults) | View/teach subsets in UI defaults |
| Access Control / Roles | MANAGE | ✅ | ⚠ confirm | ❌ | ❌ |
| Payment Refund | PAYMENT_REFUND | ✅ | ⚠ confirm | ⚠ confirm | ❌ |
| Student Delete | STUDENT_DELETE | ✅ | ⚠ confirm | ❌ | ❌ |

**Role assignment requires business confirmation.**  
Do not invent final grants beyond what `defaultCheckedForRole()` already encodes in `SettingsAccessControlSection.tsx`.

Org roles (`organization_admin`, `center_admin`, `staff`) should be modeled as **scope**, not duplicate job-role permissions.

---

## 15. Duplicate / Redundant Permissions

| Redundant / overlapping | Recommendation |
|---|---|
| `cm-stu-view` + `cm-students-view-page` + `cm-students-info` | Keep `STUDENT_VIEW_LIST` + `STUDENT_VIEW` |
| `sa-mark` vs Check In/Out/Absent | Split into three business permissions |
| `sta-update` + `sta-record` | Clarify or merge to `ATTENDANCE_STAFF_RECORD` + `EDIT` |
| `tools-view` + `tools-configure` | Keep; add download if needed |
| Search/filter/sort as separate perms | **Do not create** |
| Broad `cm-ac-settings` | Split by settings section |

---

## 16. Missing Permissions (ops exist in code, weak/absent in AC UI)

| Implemented operation | AC gap |
|---|---|
| Invoice refund | No `bill-refund` |
| Debit notes | Not in AC |
| Fee plan CRUD/assign | Not in AC |
| Credit/deposit allocate & transfer | Not in AC |
| Student Check In/Out/Absent separately | Collapsed into `sa-mark` |
| Student leave approve | Weak vs staff leave |
| Tasks module | Not in AC |
| Enquiry import/export | Not in AC |
| Campaign send/test | Partial via marketing |
| Meal planner / birthday / staff schedule | Under-covered |
| Program movement | Not explicit |
| Immunization manage | Not explicit |
| Bulk upload students/staff | Not explicit |
| ID cards / certificates download | Only tools-configure |
| Access Control persistence/enforce | Feature incomplete |

---

## 17. Recommended Final Permission Architecture

```
Module
 └── Sub-module / Resource
      └── Permission (DOMAIN_RESOURCE_ACTION)
           └── Operation (UI button / store mutation / future API)
```

Example:

```
Students
 └── Student Management
      ├── STUDENT_VIEW_LIST
      ├── STUDENT_VIEW
      ├── STUDENT_CREATE
      ├── STUDENT_UPDATE
      ├── STUDENT_DELETE
      ├── STUDENT_CHANGE_STATUS
      ├── STUDENT_BULK_UPLOAD
      ├── STUDENT_EXPORT
      ├── STUDENT_NOTES_MANAGE
      ├── STUDENT_DOCUMENTS_ACCESS
      ├── STUDENT_IMMUNIZATION_MANAGE
      └── STUDENT_QR_GENERATE

Attendance
 └── Student Attendance
      ├── ATTENDANCE_STUDENT_VIEW
      ├── ATTENDANCE_STUDENT_CHECK_IN
      ├── ATTENDANCE_STUDENT_CHECK_OUT
      ├── ATTENDANCE_STUDENT_MARK_ABSENT
      ├── ATTENDANCE_STUDENT_EDIT
      └── ATTENDANCE_STUDENT_EXPORT

Billing
 └── Invoices / Payments
      ├── INVOICE_VIEW / CREATE / UPDATE / DELETE / CLONE / CANCEL
      ├── PAYMENT_RECORD / PAYMENT_REFUND
      ├── INVOICE_EMAIL / INVOICE_DOWNLOAD
      └── ...
```

### Enforcement layers (future — not implemented now)

1. **Persist** role → permission map (store/API)  
2. **Nav filter** in AppShell using permissions  
3. **Route guard** (layout or middleware)  
4. **Action guard** on destructive buttons  
5. **Backend authorize** when APIs exist (mandatory for CRITICAL ops)

---

## Evidence Index (key files)

| Concern | Path |
|---|---|
| Nav tree | `src/lib/modules.ts` |
| Shell / login redirect | `src/components/app/AppShell.tsx` |
| Auth session | `src/lib/auth.ts` |
| Access Control UI + permission catalog | `src/components/modules/SettingsAccessControlSection.tsx` |
| Roles UI | `src/components/modules/SettingsRolesSection.tsx` |
| Settings hub | `src/components/modules/SettingsPage.tsx` |
| Org scope roles | `src/types/organization.ts`, `src/lib/organization/centerScopeStorage.ts` |
| Student attendance ops | `src/components/modules/attendance-leaves/StudentAttendancePage.tsx` |
| Invoice/payment ops | `src/lib/billing-accounting/invoiceStore.ts`, billing pages |
| Thin unused API client | `src/lib/api.ts` |

---

## 24. Final Summary

| # | Item | Result |
|---|---|---|
| A | Total sidebar modules | **19** |
| B | Total sub-modules (sidebar children + settings sections) | **~85+** |
| C | Total `(app)` pages | **~121** |
| D | Total Admin REST APIs in-repo | **0** (store mutations = future APIs) |
| E | CRUD operation families | Present across CM, Program, Billing, Enquiries, Forms, Learning, Calendar, etc. |
| F | Business operations | Check In/Out, Mark Absent, Approve/Deny Leave, Record/Refund Payment, Stage Move, Publish, Resolve, Allocate, Transfer, etc. |
| G | Workflow/status ops | Student/staff status, invoice states, leave, enquiry stage, concern, publish |
| H | File ops | Bulk upload, import/export, PDF/CSV/Excel, documents ZIP, QR |
| I | Report/export ops | Catalog generate + download CSV/Excel/PDF |
| J | Recommended permissions | **~150–200** granular codes (consolidate carefully with product) |
| K | High-risk examples | Delete student/staff, mark attendance, approve leave, email invoice, fee plan delete |
| L | Critical examples | Access Control manage, role manage, payment refund, balance allocate, update other staff role |
| M | Existing authorization coverage | **Authn only** + mock AC UI + org center scope |
| N | Authorization gaps | No enforcement, no persistence, no middleware, no API guards |
| O | Next implementation steps | 1) Freeze permission catalog from this audit 2) Persist role-permissions 3) Wire nav/route/action checks 4) Align backend later 5) Business sign-off on role matrix |

---

### Recommended next implementation steps (ordered)

1. **Product workshop:** Confirm role matrix for the 8 Access Control roles (blank cells need owners).  
2. **Normalize catalog:** Merge legacy `cm-*` IDs with `DOMAIN_RESOURCE_ACTION` codes; fill gaps in §16.  
3. **Persistence:** Role + permission storage (local first, then API).  
4. **Enforce in AppShell:** Filter `APP_MODULES` children by permissions.  
5. **Route guard:** Deny deep links without VIEW permission.  
6. **Action wrappers:** Gate CRITICAL buttons (delete/refund/approve).  
7. **Backend:** When APIs arrive, mirror every CRITICAL/HIGH permission server-side.

---

**End of audit.**  
This document is the master reference for implementing Admin Panel Role & Permission RBAC.  
**No application code was changed during this analysis.**
