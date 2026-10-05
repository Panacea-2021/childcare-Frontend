# Dashboard Frontend Implementation Specification

**Document type:** Enterprise implementation blueprint (specification only — no application code)  
**Product target:** Panacea ChildCare FrontEnd (Next.js App Router)  
**Reference source:** Illumine childcare dashboard walkthrough videos  
**Videos analyzed:**

| Video | Path | Approx. duration |
|-------|------|------------------|
| Dashboard_1 | `c:\Users\kgree\Desktop\childCare_illumini\Dashboard_1.mp4` | ~17.7 min |
| dashboard_2 | `c:\Users\kgree\Desktop\childCare_illumini\dashboard_2.mp4` | ~25.3 min |
| dashboard_3 | `c:\Users\kgree\Desktop\childCare_illumini\dashboard_3.mp4` | ~3.5 min |

**Reference app observed:** `school.illumine.app` (Illumine v7.3.15)  
**Demo center observed:** Hams Kids Home \| Daycare (date context **30/07/2026**)  
**Design contract for implementation:** Panacea Design System (`docs/DESIGN_SYSTEM.md`, `.cursor/rules/panacea-design-system.mdc`)

> **Important:** Illumine uses teal accents in the videos. Panacea implementation **must** use Panacea tokens (`--color-accent` `#5D5FEF`, Poppins, `ui-btn` / `ui-input` / `ui-table` / `Modal` / `Drawer`). Do not copy Illumine one-off colors.

> Items not clearly proven in frames are marked **Inferred**.

---

# Dashboard Overview

## What the Dashboard does

The **Center Dashboard** is the authenticated home surface for childcare center operators. It provides a live operational snapshot of:

- Rooms, staff, students, and student/staff ratio
- Live attendance (In / Out / Absent / Pending) with Center vs Class scope
- Leave and multi-day absence signals
- Daily activity volume (incidents, photos, videos, announcements, approvals)
- Upcoming birthdays and holidays
- Notes and leave action queues
- Enquiries & admissions funnel with conversion chart
- Billing summary and overdue ageing
- Parent/staff mobile app installation status

From the dashboard, users drill into Rooms, Staff, Students, Attendance & Leaves, Parent Communication, Billing, Calendar, Reports, and Parent App Installation — as demonstrated across the three videos.

## Purpose

Give center admins (and similar privileged roles) a single place to:

1. Understand “what is happening today”
2. Act quickly (check-in, leave, post activity, invite parents, generate reports)
3. Spot risk (pending attendance, overdue follow-ups, unapproved posts, unpaid debit notes, uninstalled parent apps)

## User journey (as filmed)

1. Land on **Center Dashboard** (`/dashboard`) with date **30/07/2026**.
2. Expand **Center Management** and manage Rooms / Staff / Students.
3. Open staff detail (Profile, Personal Files, Attendance, Leave, Forms, Notes).
4. Manage student profiles (sibling add, health/allergy, billing, immunization, timeline).
5. Use **Attendance & Leaves** (check-in modal with parent notify, student/staff leaves).
6. Use **Parent Communication** (post activities, activity settings, concerns permissions).
7. Use **Billing** (debit notes, record payment, invoice PDF customize, invoice form).
8. Use **Reports** hub (attendance, billing, staff report generators).
9. Use **Parent Installation Status** (invite parents, edit invite email, invitation log).
10. Return to dashboard widgets (Installations, Billing, Attendance live counts update after check-in).

## Who uses it

| Role (observed / inferred) | Typical use |
|----------------------------|-------------|
| Super Admin (e.g. Malika Thimisetty) | Full center setup, invites, reports, billing, permissions |
| Principal / Administrator / Center Head | Oversight of attendance, leaves, staff |
| Teacher / Senior Teacher / Head Teacher | Attendance, activities, notes, student daily care |
| Finance Admin **Inferred** | Billing, invoices, debit notes, fee plans |

## Business objective

Operate a daycare/preschool center digitally: enrollment & family linkage, daily attendance compliance, staffing ratios, parent engagement (app + invites), learning/observations, and fee collection — with auditability via reports and activity approvals.

---

# Complete Screen Analysis

## Shared application shell (all screens)

| Aspect | Detail |
|--------|--------|
| **Screen Name** | App Shell (Sidebar + Top Navbar) |
| **Purpose** | Global navigation and global actions |
| **Description** | White sidebar + white top bar. Logo; collapse `<<`; center name (**Hams Kids Home \| Daycare**); **BOOK A DEMO**; lightning quick actions; Search; **POST**; utility icons (calendar/heart, messages, people/group); notification bell with badge; profile avatar; floating chat FAB. |
| **Components** | Sidebar nav, collapse control, search, primary CTAs, icon buttons, badge, avatar, chat widget |
| **User Actions** | Expand/collapse modules; search; open quick actions; POST; open notifications; open profile; chat |
| **Navigation** | Sidebar routes to modules; Dashboard active highlight often persists on nested Illumine routes (**observed quirk**) |
| **Business Logic** | Module access by role **Inferred**; center context in header |
| **Required Permissions** | Authenticated staff/admin session |
| **Expected API Integration** | Session/me, notification count, center profile, search/quick-actions catalog |
| **Loading Behaviour** | Shell may show loading gate until session ready (Panacea already does this) |
| **Error Behaviour** | Redirect to login if unauthenticated **Inferred** for Panacea |
| **Empty State** | N/A |
| **Success State** | Persistent chrome ready; children route renders |

### Sidebar items observed

Get Started · **Dashboard** · Center Management ▾ · Program ▾ · Attendance & Leaves ▾ · Parent Communication ▾ · Messages ▾ · Billing & Accounting ▾ · Tour Management · Enquiries · Calendar · Learning & Assessment ▾ · Forms · Tools ▾ · Reports · Settings ▾

**Center Management children (observed expanded):** Students · Staff · Rooms · Groups · Labels · Email Templates  

**Parent Communication children (observed expanded):** Activities · Daily Reports · Notes · Concerns · Newsletters · Resource Center  

---

## Screen 1 — Center Dashboard (Home)

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Center Dashboard |
| **Purpose** | Live operational overview for the selected date |
| **Description** | Title **Center Dashboard**; date control **30/07/2026**; KPI row; Attendance widget; lower widgets (activity summary, birthdays/holidays, notes/leaves, enquiries chart, billing, installations). |
| **Components** | Date picker; 4 KPI cards; Attendance card (toggle, leave stats, status grid, live ratio, donuts); activity counters; celebration cards; notes/leaves card; Enquiries & Admissions; Billing & Accounting card; Installations card; charts/donuts |
| **User Actions** | Change date; toggle Center/Class; click KPI/leave/attendance cells to drill down; View All on widgets; open installations/billing |
| **Navigation** | KPI Rooms/Staff/Students → Center Management lists **Inferred**; attendance cells → Student Attendance Record; Installations → Parent Installation Status; Enquiries View All → Enquiries module |
| **Business Logic** | Counts scoped by date + Center/Class; Live Ratio uses currently **In** students/staff; pending = not yet marked |
| **Required Permissions** | Dashboard view |
| **Expected API Integration** | `GET /dashboard/summary?date=&scope=center\|class` aggregating KPIs, attendance, widgets |
| **Loading Behaviour** | Skeleton for KPI row + attendance + widgets |
| **Error Behaviour** | Per-widget error with retry; do not blank entire page |
| **Empty State** | Zeros with empty chart placeholders (observed frequently) |
| **Success State** | Populated metrics; interactive drill-downs |

### KPI cards (observed)

| Card | Example values over time | Accent (reference) |
|------|--------------------------|--------------------|
| Rooms | 1 → 2 | Soft blue |
| Staff | 2 → 3 | Soft orange/yellow |
| Students | 2 → 4 | Soft green |
| Student/Staff | 1:1 | Soft red/pink |

### Attendance widget (observed)

- Toggle: **Center** (default) \| **Class**
- Left stats: Students on leave today · Staff on leave today · Students absent from 3 days
- Grid columns: **In \| Out \| Absent \| Pending** for Students and Staff
- **Live Ratio:** Student count · Staff count
- After check-in in video 3: Students In **1**, Pending **2**; leave today **1**

### Lower widgets (observed)

1. **Activity summary:** Incidents, Photos, Videos, Announcements, Approval Pending  
2. **Upcoming Birthday / Upcoming Holiday** (illustration empty states `---`)  
3. **Notes:** Pending / Created Today · **Leaves:** Pending / Out today  
4. **Enquiries & Admissions:** New Enquiries · Total Admissions · Followup Overdue · chart **Enquiries by Source to Conversion** (filter This Month)  
5. **Billing & Accounting:** Total Billed · Total Collected · Ageing Bucket for Overdue Invoices (1–15 / 16–30 / 31–45 / 45+ days)  
6. **Installations:** Installed by parents · Installed by staff · dual donuts + legends  

---

## Screen 2 — Rooms List

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Rooms |
| **Purpose** | Manage classrooms/rooms |
| **Description** | Room cards with student/staff active counts, capacity, age range; search; sort; Add Room |
| **Components** | `+ Add Room`; Search by Room; Default Order sort; room cards; ⋮ menus; toasts |
| **User Actions** | Add room; search/sort; assign staff; open room menu |
| **Navigation** | From Center Management → Rooms (or dashboard Rooms KPI) |
| **Business Logic** | Capacity and age band constraints; staff assignment updates card counts |
| **Required Permissions** | Rooms read/write |
| **Expected API Integration** | List/create/update rooms; assign staff |
| **Loading Behaviour** | Card skeletons |
| **Error Behaviour** | Toast on failure |
| **Empty State** | No rooms **Inferred** |
| **Success State** | Cards + toast e.g. **Staff is added in the room** |

### Add Room modal (observed)

Fields: Name\* · Capacity · Min Age (Year/Month) · Max Age (Year/Month) · Cancel / Submit  

Example created: **Demo Roomie**, capacity **120**, age **12y 5m – 18y 5m**; existing **Demo Room** capacity **100**.

---

## Screen 3 — Staff List

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Staff |
| **Purpose** | List and filter staff |
| **Description** | Table with filters Rooms / Roles / Status; search; pagination; Add Staff / Add Multiple Staff |
| **Components** | Filters, search, table, pagination (30/page), CTAs |
| **User Actions** | Filter by role; search; open profile; add staff; add multiple → onboarding |
| **Navigation** | Row → Teacher Detailed View; Add Multiple → `/onboarding` |
| **Business Logic** | Status Active default; multi-room tags |
| **Required Permissions** | Staff management |
| **Expected API Integration** | Paginated staff list with filters |
| **Loading Behaviour** | Table skeleton |
| **Error Behaviour** | Inline/table error |
| **Empty State** | No staff **Inferred** |
| **Success State** | Rows e.g. Malika (Super Admin), Darshan (Principal), Simran Jain (Teacher) |

**Roles observed in dropdowns:** All Roles · Teacher · Finance Admin / Finance · Super Admin · Administrator · Center Head · Principal · Senior Teacher · Head Teacher  

---

## Screen 4 — Add / Edit Staff (Teacher Detailed View · Profile)

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Staff Profile (Add & Edit) |
| **Purpose** | Create/update staff identity and assignment |
| **Description** | Tabs: Profile · Personal Files · Attendance · Leave · Forms · Notes. Add mode via `addTeacher=true`. |
| **Components** | Form fields, date pickers, role/room/group selects, Save/Cancel, avatar, Send Invite, status badge, KPI chips (Gender, DOB, EMP code, Kiosk code) |
| **User Actions** | Fill/save; edit; send invite; upload avatar **Inferred** |
| **Navigation** | Back to Staff list |
| **Business Logic** | System assigns Employee Code (e.g. EMP-3) and Kiosk Code (e.g. 9089); status Active |
| **Required Permissions** | Staff create/update |
| **Expected API Integration** | Create/update teacher; invite |
| **Loading Behaviour** | Skeleton bars on reload after save (observed) |
| **Error Behaviour** | Validation on required fields |
| **Empty State** | Empty optional fields |
| **Success State** | Read-only profile with Edit |

**Fields observed:** Name\* · Birth Date · Gender\* · Email · Contact (+country) · Address · Role\* · Joining Date · Room\* · Groups · Employee Code  

---

## Screen 5 — Staff Personal Files

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Staff · Personal Files |
| **Purpose** | Folders and documents for a staff member |
| **Description** | Empty state → folders list; Add Folder; Add Document (Document \| Website Url); search; Select All; Actions |
| **Components** | Folder rows, modals, OS file picker, toasts (**Folder added**, **Settings saved!**) |
| **User Actions** | Add/rename folders; upload docs/URLs; select; settings gear |
| **Navigation** | Tab within teacher detail |
| **Business Logic** | Uploaded By + date metadata |
| **Required Permissions** | Staff documents |
| **Expected API Integration** | Folder CRUD; document upload; URL attach |
| **Loading Behaviour** | List skeleton |
| **Error Behaviour** | Upload failure toast **Inferred** |
| **Empty State** | **No Documents Added** |
| **Success State** | Folders e.g. Simran Folder, Nested Folder |

---

## Screen 6 — Staff Attendance (detail tab)

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Staff · Attendance |
| **Purpose** | Monthly attendance KPIs for one staff |
| **Description** | Month picker; KPIs Attendance % · Days Present · Days Absent · Leaves Count; table |
| **Components** | Month filter, KPI cards, table |
| **User Actions** | Change month; sort columns |
| **Navigation** | Staff detail tab |
| **Business Logic** | Aggregate from check-in records |
| **Required Permissions** | Staff attendance view |
| **Expected API Integration** | Staff attendance by month |
| **Loading Behaviour** | KPI/table skeleton |
| **Error Behaviour** | Error banner |
| **Empty State** | **No Attendance Record Found** (all KPIs 0 observed) |
| **Success State** | Populated KPIs/table |

**Table quirk observed:** duplicate **Room** header columns — treat as product bug; implement clean columns (Room, Check In, Check Out, Marked Absent, Leave).

---

## Screen 7 — Staff Leave (detail + create)

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Staff Leaves (create + balance table) |
| **Purpose** | Request and track staff leave balances |
| **Description** | New leave form; balance table by leave type; date range filter |
| **Components** | Form (Dates, Leave Type, Half Day, Reason, Attachment); summary table; New Leave; toasts |
| **User Actions** | Create leave; filter range; open New Leave |
| **Navigation** | From staff Leave tab or Attendance & Leaves → Staff Leaves |
| **Business Logic** | Allocated/Approved/Pending/Denied/Leaves Left; posting Medical Leave 01–13 Aug consumed Pending **11** / Left **1** (of 12) |
| **Required Permissions** | Leave create/approve **Inferred** by role |
| **Expected API Integration** | Leave types, create leave, balances |
| **Loading Behaviour** | Spinner + **No Data** while loading (observed on Darshan) |
| **Error Behaviour** | Validation on required fields |
| **Empty State** | **No leave requests in this period** / **No Data** |
| **Success State** | Toast **Leave has been posted**; balances update |

**Leave types observed:** Sick Leave · Casual Leave · Medical Leave · Others (students)  

---

## Screen 8 — Staff Forms & Notes tabs

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Staff · Forms / Notes |
| **Purpose** | Assigned forms; internal notes |
| **Description** | Forms table empty; Notes with Add/Edit note modal, private flag, staff chips, media attach |
| **Components** | Search/status filters; notes cards; modals; OS picker |
| **User Actions** | Sort forms; add/edit/delete notes; attach media; mark private |
| **Navigation** | Tabs |
| **Business Logic** | Private notes for selected staff; notification badge may increase after note (**Inferred**) |
| **Required Permissions** | Notes/forms access |
| **Expected API Integration** | Forms list; notes CRUD + attachments |
| **Loading Behaviour** | Table/list skeleton |
| **Error Behaviour** | Toast failure |
| **Empty State** | Forms **No Data** |
| **Success State** | Toast **Note updated successfully**; note card “Be Happy” |

---

## Screen 9 — Students List

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Students |
| **Purpose** | Roster and status pipeline |
| **Description** | Status KPI chips; filters Rooms/Groups/Programs; Program\|Health view; table; Add Student / Add Sibling |
| **Components** | Status cards, filters, search, table, Actions, trash, pagination |
| **User Actions** | Filter status; add student/sibling; open profile; Add Father |
| **Navigation** | Row → Student Detailed View |
| **Business Logic** | Statuses: Active, Inactive, On Hold, Withdrawn, Signed up, Transferred, Graduated |
| **Required Permissions** | Students management |
| **Expected API Integration** | Paginated students |
| **Loading Behaviour** | Table skeleton |
| **Error Behaviour** | Error state |
| **Empty State** | No students **Inferred** |
| **Success State** | Rows (Abhi, Alex Demo Student, Narasimha, priya jain) |

**Add Student vs Add Sibling:** Sibling pre-fills parents, room, Copy Emergency Contact / Copy Authorized Pickup toggles; Student create requires Select Room without parent copy block.

---

## Screen 10 — Student Detailed View

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Student Profile |
| **Purpose** | Full student record |
| **Description** | Tabs: Profile · Programs · Attendance · Billing · Timeline · Documents · Notes · Forms · Gallery · Immunization · Progress. Banner **Multiple Family Member Access [COMING SOON]**. |
| **Components** | Avatar, status, kiosk code, sibling badge, Invite Parents, accordions (Health, Emergency, Allergy), parents list, modals |
| **User Actions** | Edit profile; add allergy; invite parents; switch tabs |
| **Navigation** | From students list; sibling add lands here |
| **Business Logic** | Admission number, kiosk code generation; DOB required for immunization schedule |
| **Required Permissions** | Student read/write |
| **Expected API Integration** | Student CRUD; parents; health/allergy; invites |
| **Loading Behaviour** | Section skeletons |
| **Error Behaviour** | Validation; immunization warning if DOB missing |
| **Empty State** | No medication; empty programs; timeline empty |
| **Success State** | Toast **Sibling Added**; populated profile |

### Billing sub-tabs (student)

Generated Invoice · Credit Balance · Debit · Deposit · Upcoming Invoice · Fee Plan  

KPIs observed all **INR 0.00** with filters Due/Paid · This Year · table **No Data**.

### Immunization

Warning when DOB missing; Exempt toggle; vaccines e.g. Boostrix 0/5, Rotarix 0/2, Infanrix hexa 0/3; Send Reminder.

### Timeline

Auto \| Calendar; Show All; empty: **No activity posted on {date}.**

---

## Screen 11 — Student Attendance Record

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Student Attendance |
| **Purpose** | Daily/monthly check-in operations |
| **Description** | Tabs Student Attendance \| Student Leaves; leave banner; Reports; Attendance QR; DAILY/MONTHLY; filters; KPI cards; bulk Check In/Out/Mark Absent; per-row actions |
| **Components** | Banner, KPIs, filters, table, Record Attendance modal, QR modal |
| **User Actions** | Check-in/out; mark absent; open QR; open reports; change date/room/group/program |
| **Navigation** | From Attendance & Leaves or dashboard attendance links |
| **Business Logic** | Pending → Check In updates KPIs; records “By {staff}”; optional parent notification |
| **Required Permissions** | Attendance mark |
| **Expected API Integration** | Attendance list; check-in/out/absent; QR payload |
| **Loading Behaviour** | Table spinner after modal submit (observed) |
| **Error Behaviour** | Failed check-in toast **Inferred** |
| **Empty State** | All pending zeros for in/out |
| **Success State** | Abhi checked in **10:51 PM** by Malika; Room Demo Room; Pending 2 / Check In 1 |

### Record Attendance modal (observed)

Check-in time (HH : MM AM/PM) · Mark late check-in · Notes · Temperature (°F) · Notify/Select staff · Send Notification to parent · Cancel / Check-in  

### Attendance QR modal

**Scan or download QR** · center name · QR · steps to scan in Illumine app · Student Kiosk QR Codes flow also exists (Download This QR / Download All).

---

## Screen 12 — Student Leaves

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Student Leaves |
| **Purpose** | Leave requests for students |
| **Description** | KPIs All requests / Out today / Out this week / Approved / Pending; filters; New Leave full page; comments |
| **Components** | KPI cards, filters, table, create form (select students + details), comments UI with emoji picker |
| **User Actions** | Create leave; comment; open permissions/settings |
| **Navigation** | Attendance & Leaves |
| **Business Logic** | Example: priya jain · Others · wedding · Approved · 1 day · comments 1 |
| **Required Permissions** | Leaves manage |
| **Expected API Integration** | Leaves CRUD; comments; permissions |
| **Loading Behaviour** | Table skeleton |
| **Error Behaviour** | Validation |
| **Empty State** | **No matching requests** |
| **Success State** | Populated row + KPIs |

---

## Screen 13 — Parent Communication · Activities

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Activities |
| **Purpose** | Post and approve parent-facing activities |
| **Description** | Feed/composer empty state; activity detail with Approve; Post Activity full screen; Activity Settings; Select Any Activity grid |
| **Components** | Composer chips, filters, Post Summary rail, approval card, full-screen form, settings toggles, custom activity/field modals |
| **User Actions** | Post/draft; approve; configure activity types; add custom activity/fields |
| **Navigation** | Parent Communication → Activities; header **POST** **Inferred** opens post flow |
| **Business Logic** | Unapproved posts require Approve; Staff Only; tags; notify parents; draft mode; comments; approval flags per activity type |
| **Required Permissions** | Activities post/approve/settings |
| **Expected API Integration** | Activities feed; post; approve; settings |
| **Loading Behaviour** | Feed skeleton |
| **Error Behaviour** | Upload Failed counter in Post Summary |
| **Empty State** | “What did your little learners discover today?” |
| **Success State** | Announcement card with tagged students |

**Activity types observed (partial):** Name to Face · Announcement · Photo · Video · Diary · Nap · Potty · Food · Bottle · Medicine · Milestone · Kudos · Observations · Dancing · Stem · Sensorial · EPL · Gross Motor · Accident · Fine Motor · Dramatics · Circle Time · Self Reliance · Block Hour · Language · Math · Rhyme · Today's Mood · Reminder · File Upload · Incident · Medical Log · Science · Stories · etc.

---

## Screen 14 — Concerns

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Concerns |
| **Purpose** | Parent/staff concerns + permissions |
| **Description** | Concerns list with date range; Concerns permissions modal (role grants) |
| **Components** | Date range, permissions modal |
| **User Actions** | Open permissions; filter |
| **Navigation** | Parent Communication → Concerns |
| **Business Logic** | Role-based grants |
| **Required Permissions** | Concerns admin |
| **Expected API Integration** | Concerns list; permissions matrix |
| **Loading Behaviour** | Modal/list loading |
| **Error Behaviour** | Error toast |
| **Empty State** | **No matching permissions found in your workspace** |
| **Success State** | Grants listed **Inferred** |

Observation/Concern create form also observed: Observation Date · Hidden from parents · Students/Staff tags · Milestones & lessons filters.

---

## Screen 15 — School Calendar

| Aspect | Detail |
|--------|--------|
| **Screen Name** | School Calendar |
| **Purpose** | Center events/holidays/important dates |
| **Description** | Month/List views; category filters; Create Event form; Staff Holiday Calendar under leave management |
| **Components** | Calendar grid, legend (Event/Holiday/Important Date), Add Holiday modal, Create Event form |
| **User Actions** | Add event/holiday; filter category/rooms; toggle staff only |
| **Navigation** | Calendar module / Staff Leave Management Holiday Calendar |
| **Business Logic** | Categories color-coded; staff-only events |
| **Required Permissions** | Calendar manage |
| **Expected API Integration** | Events CRUD; holidays |
| **Loading Behaviour** | Calendar skeleton |
| **Error Behaviour** | Validation |
| **Empty State** | **0 total** events (July 2026 Important Date empty observed) |
| **Success State** | Events on grid |

---

## Screen 16 — Billing · Debit Notes / Payments / Invoices

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Invoices · Debit Notes · Record Payment · Invoice Form · Fee Plan PDF |
| **Purpose** | Fee operations |
| **Description** | Debit Notes tab with KPIs and table; Record Payment; Create Debit; Invoice Form; Customize Invoice PDF |
| **Components** | Tabs, filters, KPI cards, table, payment form, PDF style editor + preview |
| **User Actions** | Create debit; record payment; customize PDF; create invoice |
| **Navigation** | Billing & Accounting |
| **Business Logic** | Currency INR; statuses DUE; email to parent; tax exclusive/inclusive; discounts |
| **Required Permissions** | Billing |
| **Expected API Integration** | Debits, payments, invoices, PDF config |
| **Loading Behaviour** | Table/form skeletons |
| **Error Behaviour** | Payment validation |
| **Empty State** | Zero totals / empty items |
| **Success State** | DEB-1 DUE ₹480 for Abhi; PDF preview totals |

**Debit KPIs observed:** Debit Note Amount ₹480 · Pending ₹480 · Paid ₹0  

**Record Payment fields:** Amount · Payment Mode (Cash) · Payment Date · Send email to parent · Reference Number  

---

## Screen 17 — Reports Hub

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Reports (`allReports`) |
| **Purpose** | Catalog and generate operational reports |
| **Description** | Category tabs; report cards with favorites; generate modals (date range, classroom/staff filter, rooms, columns); Recently Generated; Parent/Staff App Installation Report tabs |
| **Components** | Tabs, cards, modals, column pickers, generate CTA |
| **User Actions** | Open report modal; select columns/rooms; Generate Report; download recent |
| **Navigation** | Sidebar Reports |
| **Business Logic** | Filters vary by report; lifetime vs date range; overdue-only options |
| **Required Permissions** | Reports |
| **Expected API Integration** | Report definitions; generate job; download |
| **Loading Behaviour** | Modal submit → job progress **Inferred** |
| **Error Behaviour** | Generation failure toast |
| **Empty State** | Empty Recently Generated band |
| **Success State** | e.g. Monthly Staff Attendance generated entry |

### Report categories / cards observed

**Student Attendance:** Attendance Summary · Absentees Report · Late Attendance · Daily Time Card · Monthly Attendance · Weekly Attendance Report · Drop Off And Pickup Sheet · Daily Schedule Report  

**Billing:** Student Balance · Invoices · Fee Plan · Line Item · Monthly Charges Report · Credit Note Report · Discount Report · Payment Report · Deposit History  

**Staff:** Staff Report · Staff Attendance Summary · Absentees · Late Attendance · Monthly Attendance · Daily Time Card  

Also: Student Info · Enquiry · Admissions · Form Submissions · Favorite Reports · Excel Reports · Parent App Installation Report · Staff App Installation Report  

---

## Screen 18 — Parent Installation Status

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Parent Installation Status / Installations |
| **Purpose** | Track parent app installs and invite parents |
| **Description** | KPIs Installed / Not Installed; filters; table Student · MOTHER · FATHER · Invite; Send Email Invite; Edit Email Invite; Invitation Log |
| **Components** | KPI cards, filters, table, Invite buttons, email editor with templates `{{email}}` `{{password}}` `{{schoolName}}` |
| **User Actions** | Invite; edit email; open invitation log; filter |
| **Navigation** | Dashboard Installations View All; Reports Parent App Installation tab |
| **Business Logic** | Invite statuses: open · dropped · delivered; toast **Invitation will be delivered in a while** |
| **Required Permissions** | Parent invites |
| **Expected API Integration** | Installation matrix; send invite; email template; invite log |
| **Loading Behaviour** | Table skeleton |
| **Error Behaviour** | Invite failure toast **Inferred** |
| **Empty State** | All installed **Inferred** |
| **Success State** | KPIs 0 installed / 6 not installed (parent slots); invites updating |

---

## Screen 19 — Quick Actions / Command Palette

| Aspect | Detail |
|--------|--------|
| **Screen Name** | Quick Actions (lightning) |
| **Purpose** | Jump to actions/pages |
| **Description** | “Find actions or pages…”; Recent Searches; Actions and Pages |
| **Components** | Modal/palette, search, mic **Inferred** |
| **User Actions** | Search and navigate |
| **Navigation** | Global header lightning |
| **Business Logic** | Recents persisted **Inferred** |
| **Required Permissions** | Authenticated |
| **Expected API Integration** | Actions catalog |
| **Loading Behaviour** | Instant local + remote suggestions **Inferred** |
| **Error Behaviour** | No results |
| **Empty State** | No recent searches |
| **Success State** | Navigate to Students / Attendance / etc. |

---

# UI Components

## Purpose

Reusable Panacea UI building blocks required to reproduce the dashboard experience observed in the videos, mapped to the design system.

## Layout

- App shell: sidebar (white) + top navbar (white) + scrollable main (`--page-bg` `#FAFAF7`)
- Dashboard: vertical stack — header/date → KPI row (4) → Attendance → widget grid (2–3 columns desktop)
- Detail pages: breadcrumbs + title + tabs + content cards
- Lists: toolbar → filters → KPI chips → `ui-table` → pagination
- Full-screen flows: Post Activity, Customize Invoice PDF (replace shell chrome)

## Spacing

- Consistent card padding (~16–24px)
- KPI cards equal height in a row with gap
- Form fields stacked with `ui-field`; popups prefer `ui-grid-2`
- Table toolbar spacing via `ui-table-toolbar`

## Typography

- **Poppins only** (`--font-body` / `--font-display`)
- Weights 400 / 500 / 600
- Page titles large semibold; labels muted secondary; KPI numbers large bold

## Colors (Panacea tokens — mandatory)

| Token | Value | Use |
|-------|-------|-----|
| `--color-accent` | `#5D5FEF` | Primary buttons, table headers, focus, active accents |
| `--color-accent-hover` | `#4B51E0` | Primary hover |
| `--color-accent-soft` | `#E8F2FF` | Soft surfaces |
| `--color-input-bg` | `#F8FAFC` | Inputs |
| `--border` | `#E8EDF5` | Borders |
| `--modal-header-bg` | `#DEECFF` | Modal/drawer header only |
| `--color-close` | `#E53935` | Close control |
| Semantic pastels | soft blue/orange/green/red | KPI icon chips (Rooms/Staff/Students/Ratio) — extend tokens if needed; do not invent random hex per page |

Dark/Light: implement theme-compatible tokens; videos show light theme only.

## Icons

Line icons in sidebar; colored circular icon chips on KPI cards; status icons (thermometer, document) on attendance rows; paper-plane for invites; syringe for immunization.

## Buttons

Always: `ui-btn` + `ui-btn-primary` \| `ui-btn-outline` \| `ui-btn-secondary` \| `ui-btn-danger`  
Examples: Save, Check-in, Generate Report, Invite, Approve, + Add Room, POST.

## Cards

Dashboard widgets and KPI cards — white surface, border `--border`, soft radius. Prefer shared dashboard card primitives; avoid one-off shadows/colors.

## Tables

`ui-table` with accent header + white text. Sortable headers; row hover; checkboxes; status pills; pagination footer (“Showing x–y of z”, page size 25/30).

## Charts

- Enquiries by Source to Conversion (line/bar) with period filter
- Ageing Bucket for Overdue Invoices (bucket chart)
- Installations dual donuts (parents/staff with vs without)
- Attendance optional donuts beside In counts (observed)

Use lazy-loaded chart library; empty axes when no data.

## Badges

Active (green) · Unapproved (red) · DUE (yellow) · Pending counts · notification bell numeric badge · sibling count · COMING SOON banner.

## Filters

Dropdowns: All Rooms/Groups/Programs/Roles/Status/Leave types; date range; Center/Class; DAILY/MONTHLY; Program/Health view toggle.

## Dropdowns

`ui-select` / styled selects; multi-select chips (rooms, parents, staff); open lists with highlight/hover.

## Inputs

`ui-input`, `ui-textarea`, phone with country code, temperature with °F suffix, rich text note editors.

## Date Pickers

Single date (dashboard, attendance); ranges (leaves, reports, invoices); month picker (staff attendance); datetime Now/Schedule for activities.

## Search Bars

Global header Search; module searches (staff name, student name/phone, room, file/folder, reports, activity).

## Pagination

Page number · page size (25/30) · Showing x–y of z · QR pager 1/2 style.

## Widgets

Dashboard widget set listed in Screen 1; Post Summary rail on Activities.

## Progress Indicators

Loading dots/spinners; skeleton bars; upload/in-progress counters.

## Notifications

Bell badge; toast success/error (green check); permissions updated toast.

## Modals

**Must use shared `Modal`** — Add Room, Add Folder, Upload Document, Add Allergy, Add Sibling/Student, Record Attendance, Report generators, Holiday Calendar, Concerns permissions, Add Father, QR display, Quick Actions, etc.  
Footer pattern: outline Cancel + primary action.

## Drawers

Use shared `Drawer` for side panels when appropriate (not heavily shown in videos; **Inferred** optional for filters on mobile).

## Tabs

Staff detail tabs; Student detail tabs; Attendance/Leaves; Billing sub-tabs; Reports categories; Invoice tabs.

## Tooltips

Sort ascending tooltips; link hover URLs; emoji hover labels.

## Other visible elements

- Empty illustrations (leaves, activities mailbox, permissions folder)
- OS file picker integration for uploads
- Floating chat FAB
- Sticky full-screen headers (Post Activity, PDF customize)
- Toggle switches (Exempt immunizations, Staff Only, Hidden from parents, Send email Yes/No)

---

# Component Hierarchy

```
app/(app)/layout.tsx                          → AppShell (Server/Client boundary)
├── AppShell (Client)                         → SHARED
│   ├── SidebarNav (SHARED)
│   │   └── NavItem / NavGroup (SHARED)
│   ├── TopNavbar (SHARED)
│   │   ├── CenterTitle
│   │   ├── GlobalSearch
│   │   ├── QuickActionsPalette (Client)
│   │   ├── PostEntryButton
│   │   ├── NotificationBell
│   │   └── ProfileMenu
│   └── ChatWidget (SHARED existing)
└── children
    └── features/dashboard/                   → FEATURE MODULE
        ├── DashboardPage (Server)
        ├── DashboardHeader (date)
        ├── KpiStatsRow
        │   └── KpiStatCard (REUSABLE)
        ├── AttendanceOverviewCard (Client for toggle)
        │   ├── ScopeToggle
        │   ├── LeaveStatList
        │   ├── AttendanceStatusGrid
        │   └── LiveRatioPanel
        ├── DashboardWidgetGrid
        │   ├── ActivitySummaryWidget
        │   ├── UpcomingEventsWidget
        │   ├── NotesLeavesWidget
        │   ├── EnquiriesAdmissionsWidget (+ Chart lazy)
        │   ├── BillingSummaryWidget (+ Chart lazy)
        │   └── InstallationsWidget (+ Donut lazy)
        ├── loading.tsx / error.tsx / skeletons
        └── (drill-down routes live in their feature modules)
```

## Reusable (shared UI)

`Modal`, `Drawer`, `ui-btn*`, `ui-input`, `ui-select`, `ui-textarea`, `ui-table`, `ui-field`, `ui-label`, `ui-grid-2`, pagination, toast, skeleton primitives, date range picker, status badge, avatar initials, empty state, confirm dialog.

## Shared feature-level

`KpiStatCard`, filter bar, report-card grid, person name cell (avatar + meta), invite status cell, attendance action buttons.

## Isolated (dashboard feature only)

Dashboard widget compositions, Live Ratio panel, Center/Class attendance scope wiring, dashboard-specific skeletons.

## Isolated (other modules; linked from dashboard)

Rooms, Staff, Students, Attendance, Leaves, Activities, Billing, Reports, Installations — own feature folders; dashboard only deep-links.

---

# Frontend Architecture

## Stack (mandatory)

- Latest stable **Next.js** (App Router only — **no Pages Router**)
- Latest stable **React** + **TypeScript** (strict)
- **Tailwind CSS** latest + Panacea tokens/classes in `globals.css`
- Server Components by default; Client Components only for interactivity
- ESLint + Prettier; no deprecated APIs; no `.js` source files

## App Router structure (recommended)

```
src/app/(app)/dashboard/
  page.tsx                 # Center Dashboard (RSC)
  loading.tsx
  error.tsx
src/features/dashboard/
  components/
  hooks/
  services/
  types/
  constants/
src/components/ui/         # Modal, Drawer, shared primitives
src/lib/                   # auth, api client, modules
```

Related modules remain under existing routes (`/center-management`, `/attendance-leaves`, `/billing-accounting`, `/reports`, etc.) per `src/lib/modules.ts`.

## Layouts

`(app)/layout.tsx` wraps `AppShell`. Dashboard page uses `mod-page` patterns already used by `DashboardHome`.

## Shared UI / Feature Modules / Hooks / Contexts

- Prefer RSC data fetch + small Client islands
- Contexts only for shell theme/notifications if needed — avoid global dashboard context bloat
- Feature hooks: `useAttendanceScope`, `useDashboardDate`, `useDashboardSummary` (client refresh)

## Services / API Layer

- `features/dashboard/services/dashboardApi.ts` typed fetchers
- Central API client with auth headers, error normalization, retry policy
- No fetch inside random components

## Utilities / Constants / Types / Assets / Theme / Configuration

- Types for DashboardSummary, AttendanceScope, Widget payloads
- Constants for widget IDs, refresh intervals
- Theme via CSS variables; next/font Poppins
- Charts/images via `next/image` and dynamic import

## Routing Strategy

- `/dashboard` = home overview
- Drill-downs use existing module hrefs (do not nest entire Illumine `/dashboard/*` tree unless product decides otherwise)
- Preserve query params for filters (date, status, pageSize) as observed

## Authentication Strategy

- Session gate in AppShell (existing pattern)
- Server-side session verification for RSC fetches **Inferred** enhancement

## Authorization Strategy

- Hide/disable widgets and CTAs by permission claims
- Permissions screens (Concerns, Leaves) must enforce server-side too **Inferred**

## State Management Strategy

- Server state: RSC + cache tags / `revalidate`
- Client state: component state for toggles/modals; URL searchParams for filters
- No Redux unless complexity demands — prefer React Query/SWR **Inferred** optional for polling Live Ratio

## Caching Strategy

- Cache dashboard summary briefly (e.g. 15–60s) with explicit refresh
- Report generation results cached by job id
- Static report catalog can be longer-lived

## Data Fetching Strategy

- Initial dashboard payload on server
- Client refetch on date/scope change
- Suspense boundaries per widget group
- Polling for Live Ratio/attendance while dashboard focused **Inferred**

## Error Handling Strategy

- `error.tsx` route boundaries
- Widget-level error cards with Retry
- Toast for mutations
- Never fail entire dashboard if one widget fails

## Loading Strategy

- `loading.tsx` + skeleton loaders matching layout
- Button pending states on Save/Check-in/Generate

## Performance Strategy

- Dynamic import charts
- Code-split heavy modals (PDF designer, rich text, emoji picker)
- `next/image` for illustrations
- Avoid shipping unused activity-type editors on home page

## Accessibility Strategy (WCAG)

- Keyboard operable toggles, tabs, modals
- Focus trap in Modal/Drawer
- `aria-label` on icon buttons; live regions for toasts
- Color not sole status indicator (icons + text)
- Sufficient contrast on pastel KPI chips

## Responsive Strategy

See **Responsive Behaviour** section.

---

# API Requirements

> Paths are **Inferred** contracts for Panacea backend alignment. Methods/shapes based on observed UI.

## 1. Dashboard Summary

| Field | Spec |
|-------|------|
| **Purpose** | Populate Center Dashboard |
| **Method** | `GET` |
| **Expected Request** | `date=YYYY-MM-DD&scope=center\|class&classId?` |
| **Expected Response** | `{ kpis:{rooms,staff,students,ratio}, attendance:{leaves,absent3Days,students,staff,liveRatio}, activity, upcoming, notesLeaves, enquiries, billing, installations }` |
| **Pagination** | N/A |
| **Sorting** | N/A |
| **Filtering** | date, scope |
| **Caching** | Short TTL + tag `dashboard:{centerId}:{date}` |
| **Error Handling** | 401/403/500 standardized |
| **Loading** | Suspense |
| **Retry Behaviour** | 2 retries idempotent GET |

## 2. Rooms CRUD / Assign Staff

| Field | Spec |
|-------|------|
| **Purpose** | List/create rooms; assign staff |
| **Method** | `GET/POST/PATCH` |
| **Expected Request** | `{ name, capacity, minAge:{y,m}, maxAge:{y,m} }` · assign `{ staffId, roomId }` |
| **Expected Response** | Room entities with student/staff active counts |
| **Pagination** | Optional |
| **Sorting** | Default Order |
| **Filtering** | search string |
| **Caching** | Invalidate on mutation |
| **Error Handling** | 400 validation |
| **Loading** | Mutation pending |
| **Retry Behaviour** | No auto-retry POST |

## 3. Staff List / Teacher Detail

| Field | Spec |
|-------|------|
| **Purpose** | Staff directory and profile |
| **Method** | `GET/POST/PATCH` |
| **Expected Request** | filters `room,role,status,string,page,pageSize` |
| **Expected Response** | `{ items, total }` · teacher detail with codes |
| **Pagination** | page/pageSize (30) |
| **Sorting** | name, status |
| **Filtering** | rooms, roles, status, search |
| **Caching** | List short TTL |
| **Error Handling** | 404 teacher |
| **Loading** | Skeleton |
| **Retry Behaviour** | GET retry |

## 4. Staff Documents / Notes / Leaves / Attendance

| Field | Spec |
|-------|------|
| **Purpose** | Tab data under teacher |
| **Method** | `GET/POST/PATCH/DELETE` + multipart upload |
| **Expected Request** | folder name; document file or website URL; leave payload; note payload; month |
| **Expected Response** | lists + balances + KPIs |
| **Pagination** | As needed |
| **Sorting** | Column sorts |
| **Filtering** | date ranges, createdBy, labels |
| **Caching** | Invalidate on write |
| **Error Handling** | Upload size/type errors |
| **Loading** | Spinners |
| **Retry Behaviour** | Retry GET only |

## 5. Students / Sibling / Parents / Allergy / Immunization

| Field | Spec |
|-------|------|
| **Purpose** | Student lifecycle |
| **Method** | `GET/POST/PATCH` |
| **Expected Request** | student fields; sibling copy flags; allergy fields; DOB |
| **Expected Response** | student aggregate; immunization schedule |
| **Pagination** | pageSize 30 |
| **Sorting** | name, status, upcoming program |
| **Filtering** | statusType, room, group, program, search |
| **Caching** | Invalidate profile on save |
| **Error Handling** | DOB-missing schedule warning (soft) |
| **Loading** | Skeletons |
| **Retry Behaviour** | GET retry |

## 6. Attendance Check-in / QR

| Field | Spec |
|-------|------|
| **Purpose** | Mark attendance; QR payloads |
| **Method** | `GET` list · `POST` check-in/out/absent · `GET` QR |
| **Expected Request** | `{ studentId, time, late, notes, temperatureF, notifyStaffIds, notifyParent }` |
| **Expected Response** | updated row + KPI deltas |
| **Pagination** | Daily list |
| **Sorting** | name |
| **Filtering** | date, room, group, program, daily/monthly |
| **Caching** | Near-real-time; short TTL |
| **Error Handling** | Conflict if already checked in |
| **Loading** | Row/button pending; table refresh spinner |
| **Retry Behaviour** | Cautious POST retry only if idempotency key **Inferred** |

## 7. Student/Staff Leaves + Comments

| Field | Spec |
|-------|------|
| **Purpose** | Leave workflow |
| **Method** | `GET/POST` · comments `POST` |
| **Expected Request** | students/staff, type, dates, reason, halfDay, attachment |
| **Expected Response** | leave entity + KPI aggregates |
| **Pagination** | 25/page observed |
| **Sorting** | applied date **Inferred** |
| **Filtering** | period, room, person, leave type |
| **Caching** | Invalidate lists |
| **Error Handling** | Balance exceeded **Inferred** |
| **Loading** | Form/table |
| **Retry Behaviour** | GET retry |

## 8. Activities / Settings / Approve

| Field | Spec |
|-------|------|
| **Purpose** | Parent communication posts |
| **Method** | `GET/POST/PATCH` |
| **Expected Request** | activity type, students, tags, note HTML, attachments, schedule, draft |
| **Expected Response** | activity entity; feed; settings |
| **Pagination** | Feed pages |
| **Sorting** | date desc **Inferred** |
| **Filtering** | room, type, label, createdBy, student, status, unapproved, attachments, staffOnly |
| **Caching** | Feed short TTL |
| **Error Handling** | Upload failed statuses |
| **Loading** | Composer + feed |
| **Retry Behaviour** | GET retry |

## 9. Billing Debits / Payments / Invoices / PDF Config

| Field | Spec |
|-------|------|
| **Purpose** | Fee operations |
| **Method** | `GET/POST/PATCH` |
| **Expected Request** | debit/invoice lines; payment `{amount,mode,date,emailParent,ref}`; PDF column flags |
| **Expected Response** | documents + totals |
| **Pagination** | List pages |
| **Sorting** | dates, pending |
| **Filtering** | creation date, time range, student status, status, room, group |
| **Caching** | Invalidate on payment |
| **Error Handling** | Overpay validation |
| **Loading** | Forms/tables |
| **Retry Behaviour** | No blind payment retry |

## 10. Reports Generate / Download

| Field | Spec |
|-------|------|
| **Purpose** | Export operational reports |
| **Method** | `POST /reports/{type}/generate` · `GET /reports/jobs/{id}` |
| **Expected Request** | date range, filterBy classroom\|staff, rooms[], columns[], lifetime flags, format |
| **Expected Response** | job id → file URL |
| **Pagination** | Column picker pages (e.g. 0/22, 0/12) |
| **Sorting** | N/A |
| **Filtering** | Per-report options |
| **Caching** | Job results |
| **Error Handling** | Failed job |
| **Loading** | Generate pending |
| **Retry Behaviour** | Retry failed jobs manually |

## 11. Parent Installations / Invites / Email Template

| Field | Spec |
|-------|------|
| **Purpose** | Parent app adoption |
| **Method** | `GET` matrix · `POST` invite · `GET/PUT` email template · `GET` invitation log |
| **Expected Request** | studentId, parentRole mother\|father; template body |
| **Expected Response** | statuses open/dropped/delivered; KPIs |
| **Pagination** | Table |
| **Sorting** | student name **Inferred** |
| **Filtering** | student status, installation status, search |
| **Caching** | Short TTL |
| **Error Handling** | Invite delivery async toast |
| **Loading** | Table |
| **Retry Behaviour** | GET retry |

## 12. Notifications / Quick Actions

| Field | Spec |
|-------|------|
| **Purpose** | Bell badge + command palette |
| **Method** | `GET` notifications count/list · `GET` actions catalog |
| **Expected Request** | query string |
| **Expected Response** | `{ unread, items }` · actions |
| **Pagination** | Notifications list **Inferred** |
| **Caching** | Poll/badge |
| **Error Handling** | Silent degrade badge |
| **Retry Behaviour** | Backoff poll |

---

# UX Analysis

## User Flow

Dashboard glance → drill to module → mutate (modal/form) → toast → list/KPI refresh → return to dashboard for confirmation widgets.

## Interaction Pattern

- Primary actions teal-equivalent → Panacea accent primary buttons
- Destructive/secondary via outline/danger
- Tables for operational lists; cards for overview
- Full-screen for complex composers (activity, PDF)

## Navigation Flow

Sidebar + in-page tabs + breadcrumbs (`← Staff`, `All Students > Student Profile`) + header POST/quick actions.

## Expected Behaviour

- Filters apply immediately or on select (observed immediate)
- Modals block background
- Toasts auto-dismiss with close
- Approval required for some posts before parent visibility

## Hover Behaviour

Row highlight; button hover; sidebar active/hover; report card hover; chart point hover **Inferred**.

## Animation Behaviour

Subtle: modal fade/scale; toast slide; tab underline; skeleton shimmer; chat FAB presence. Keep restrained; no decorative noise.

## Loading Experience

Skeletons matching final layout; avoid full-page blank; button spinners on submit.

## Accessibility

Focus visible with accent ring; modal focus trap; labels for all inputs; announce toasts.

## Keyboard Support

Tab order through filters/tables; Enter submits primary; Esc closes Modal; arrow keys in calendars/palettes **Inferred**.

## Responsive Behaviour

See next section.

---

# Responsive Behaviour

| Breakpoint | Behaviour |
|------------|-----------|
| **Desktop (≥1280)** | Full sidebar labels; 4 KPI row; attendance 3-column; widgets 2–3 columns; tables full |
| **Laptop (1024–1279)** | Sidebar collapsible; KPI 4-wrap; widgets 2 columns; horizontal scroll tables if needed |
| **Tablet (768–1023)** | Collapsed/off-canvas sidebar; KPI 2×2; attendance stacks; widgets 1–2 columns; sticky table headers |
| **Mobile (<768)** | Hamburger sidebar; KPI single column; attendance sections stacked; filters in Drawer; tables cardized or horizontal scroll; modals full-screen |
| **Large displays (≥1536)** | Constrain main content max-width for readability; keep shell edge-to-edge white |

Touch targets ≥44px for primary actions. Charts simplify (fewer ticks) on small screens.

---

# Development Roadmap

## Phase 0 — Foundations (first)

- Confirm Panacea tokens/classes for dashboard cards
- Dashboard types + API client stubs
- Route `loading`/`error` boundaries
- **Depends on:** auth session, design system Modal/table

## Phase 1 — Center Dashboard Home (priority P0)

- KPI row, date control, Attendance Center/Class, Live Ratio
- Skeleton + empty zeros
- **Depends on:** summary API

## Phase 2 — Dashboard Widgets (P0/P1)

- Activity, upcoming, notes/leaves, enquiries chart, billing, installations
- Lazy charts
- **Depends on:** widget endpoints or extended summary

## Phase 3 — Drill-down wiring (P1)

- Link KPIs/widgets to existing module routes
- Ensure deep-link query params (date, status)

## Phase 4 — Attendance operations alignment (P1)

- Ensure Record Attendance modal + parent notify + QR match spec (Attendance module)
- Reflect live dashboard after check-in

## Phase 5 — Cross-module polish shown in videos (P2)

- Installations page + invite email
- Reports generate modals
- Activities approval counters feeding dashboard
- Debit/payment totals feeding billing widget

## Phase 6 — Performance, a11y, theme, tests (P2)

- Code splitting, WCAG audit, light/dark token pass, e2e critical flows

### Priority order

1. Dashboard home accuracy  
2. Attendance live correctness  
3. Widget data fidelity  
4. Installations + billing widgets  
5. Nice-to-have parity with every Illumine sub-screen  

---

# Development Guidelines

All future implementation **must** use:

- Latest Next.js stable version  
- Latest React stable version  
- Latest TypeScript (strict)  
- Latest Tailwind CSS  
- Latest official Next.js App Router architecture  
- Latest React patterns (Server Components default; Client only when needed)  
- Latest optimization techniques (Suspense, dynamic import, streaming)  
- Latest accessibility standards (WCAG)  
- Latest performance recommendations  
- Latest coding conventions (ESLint, Prettier)  

**Forbidden:**

- Deprecated APIs  
- Legacy React patterns (class components unless unavoidable for libs)  
- Pages Router  
- JavaScript source files (`.js`/`.jsx`) — **TypeScript everywhere**  
- Hand-rolled modal chrome (must use `Modal`/`Drawer`)  
- One-off colors bypassing Panacea tokens  

Write maintainable, scalable, reusable, production-ready code following Clean Architecture, SOLID, and DRY.

---

# Best Practices

## Naming conventions

- Components: `PascalCase`
- Hooks: `useCamelCase`
- Files: match export (`AttendanceOverviewCard.tsx`)
- Types: `PascalCase` with domain prefix (`DashboardKpis`)
- API functions: `getDashboardSummary`, `postStudentCheckIn`

## Folder / file conventions

- Feature-first under `src/features/dashboard`
- Shared UI only in `src/components/ui`
- No dumping dashboard-only components into global UI

## State management

- URL for shareable filters
- Server data via fetchers/cache
- Local UI state colocated

## API handling

- Typed DTOs; zod/io-ts validation **Inferred** recommended
- Central error mapper → toast + widget error

## Reusable UI

- Extend `globals.css` tokens/classes before page CSS
- Table headers always accent + white

## Error handling

- Boundary per route + per widget
- User-safe messages; log correlation ids **Inferred**

## Performance

- Split charts/emoji/PDF editors
- Prefer RSC for static chrome/text

## Security

- Auth on all APIs; CSRF/session cookies per backend
- Sanitize rich text notes before render
- Signed upload URLs **Inferred**

## Accessibility

- Semantic headings; label associations; keyboard modals

## Testing readiness

- Unit: ratio calculator, leave balance display
- Integration: dashboard summary mapping
- E2E: date change, scope toggle, drill to attendance, check-in updates KPI

## Code readability / maintainability / scalability

- Small components; clear feature boundaries; document Inferred assumptions in code only when necessary; prefer this spec as source of truth for product parity

---

# Future Improvements

## Features present in the videos (confirmed)

- Center Dashboard KPIs + Attendance Center/Class + Live Ratio + leave/absent stats  
- Activity / birthday / holiday / notes / leaves widgets  
- Enquiries chart widget  
- Billing billed/collected + ageing buckets  
- Installations parents/staff donuts + Parent Installation Status page  
- Rooms add/list/assign staff  
- Staff list/profile/files/attendance/leave/forms/notes  
- Students list/profile/sibling/allergy/billing/immunization/timeline/notes  
- Student attendance check-in with parent notify + QR  
- Student/staff leaves + comments/emoji  
- Activities feed/post/settings/custom fields/approve  
- Concerns permissions  
- School calendar + create event + holiday calendar  
- Debit notes, record payment, invoice form, invoice PDF customizer  
- Reports hub with generate modals + recent reports  
- Edit email invite template + invitation statuses  
- Quick actions palette  
- Global POST, search, notifications badge, chat FAB  

## Features inferred from the videos

- Real-time/polling Live Ratio  
- WebSocket attendance updates  
- Role-permission matrix beyond Concerns modal  
- Exact notification triggers (badge 1→3)  
- Multi-center switching (name OCR variants)  
- Mobile app scan flow behind QR  
- Report async job lifecycle UI beyond generate button  
- Dark theme (not shown)  
- Full Activity type catalog completeness  
- Add Multiple Staff onboarding wizard details  

## Suggested future improvements

- Dashboard personalization (widget reorder/hide)  
- Accessibility contrast pass on pastel celebration cards  
- Fix duplicate Room column in staff attendance table  
- Unify leave banner grammar (“1 student” vs “2 student”)  
- Optimistic check-in with rollback  
- Offline-tolerant draft activity posting  
- Stronger empty-state guidance for new centers  
- Analytics on which widgets drive actions  

---

# Final Checklist

## Shell & navigation

- [ ] White sidebar + top navbar per Panacea  
- [ ] All primary nav modules reachable  
- [ ] Center Management children: Students, Staff, Rooms, Groups, Labels, Email Templates  
- [ ] Parent Communication children: Activities, Daily Reports, Notes, Concerns, Newsletters, Resource Center  
- [ ] Collapse sidebar, search, POST, quick actions, notifications badge, profile, chat FAB  

## Center Dashboard

- [ ] Title + date picker  
- [ ] KPI cards: Rooms, Staff, Students, Student/Staff ratio  
- [ ] Attendance widget Center/Class toggle  
- [ ] Leave today (students/staff) + absent from 3 days  
- [ ] In/Out/Absent/Pending grids for students & staff  
- [ ] Live Ratio panel  
- [ ] Activity counters (Incidents, Photos, Videos, Announcements, Approval Pending)  
- [ ] Upcoming Birthday / Holiday empty states  
- [ ] Notes & Leaves pending/out widgets  
- [ ] Enquiries & Admissions KPIs + conversion chart + View All  
- [ ] Billing billed/collected + ageing chart + View All  
- [ ] Installations parents/staff + donuts + View All  
- [ ] Skeletons, error per widget, empty zeros  
- [ ] Drill-down links wired  

## Rooms

- [ ] List cards with counts/capacity/age  
- [ ] Add Room modal (name, capacity, min/max age)  
- [ ] Search/sort + staff assign toast  

## Staff

- [ ] List filters + pagination + Add Staff / Add Multiple  
- [ ] Profile tabs + EMP/Kiosk codes + Send Invite  
- [ ] Personal Files folders/documents/URL upload  
- [ ] Attendance month KPIs + empty table  
- [ ] Leave create + balances + toast  
- [ ] Forms empty + Notes CRUD/private/media  

## Students

- [ ] Status chips + filters + Program/Health views  
- [ ] Add Student / Add Sibling / Add Father  
- [ ] Profile accordions + parents + Invite Parents  
- [ ] Allergy modal  
- [ ] Billing sub-tabs empty/zero states  
- [ ] Immunization warning without DOB  
- [ ] Timeline empty state  

## Attendance & Leaves

- [ ] Daily KPIs + banner on leave  
- [ ] Record Attendance modal (time, late, notes, temp, staff, notify parent)  
- [ ] QR scan/download flows  
- [ ] Student Leaves list/create/comments  
- [ ] Staff Leaves parallel UI + permissions toast  

## Parent Communication

- [ ] Activities feed/composer/Post Summary  
- [ ] Approve unapproved announcement  
- [ ] Post Activity full screen (types, tags, rich note, attachments, voice)  
- [ ] Activity Settings (Name to Face, Nap, custom activity/fields)  
- [ ] Concerns permissions modal  
- [ ] Observation/Concern create (hidden from parents)  

## Billing

- [ ] Debit Notes KPIs/table  
- [ ] Record Payment  
- [ ] Debit/Invoice forms  
- [ ] Customize Invoice PDF preview  

## Reports & Installations

- [ ] Report category cards + generate modals (rooms, columns, lifetime, overdue)  
- [ ] Recently generated list  
- [ ] Parent Installation Status KPIs/table/Invite  
- [ ] Edit Email Invite + Invitation Log  
- [ ] Parent/Staff App Installation Report tabs  

## Engineering quality

- [ ] TypeScript strict · App Router · RSC default  
- [ ] Panacea tokens/classes only  
- [ ] Modal/Drawer for all popups  
- [ ] Suspense · Error Boundaries · skeletons  
- [ ] Lazy charts · dynamic heavy editors  
- [ ] WCAG keyboard/focus/labels  
- [ ] Responsive desktop→mobile  
- [ ] ESLint/Prettier clean  
- [ ] No Pages Router · no JS files · no deprecated APIs  

---

## Document control

| Item | Value |
|------|-------|
| Spec filename | `DASHBOARD_FRONTEND_IMPLEMENTATION.md` |
| Scope | Specification only (no React/Next implementation in this deliverable) |
| Design system | Panacea (mandatory) |
| Analysis method | Full review of three MP4 walkthroughs via dense keyframe extraction + structured UI transcription |
| Last updated | 2026-07-31 |

---

*End of specification.*
