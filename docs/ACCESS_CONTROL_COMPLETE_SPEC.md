# Access Control — Complete Spec (Permissions + Navbar + Design)

> **Product:** ChilldCare / Panacea Admin Panel (FrontEnd)  
> **Source of truth (UI catalog):** `src/components/modules/SettingsAccessControlSection.tsx`  
> **Source of truth (navbar):** `src/lib/modules.ts` (`APP_MODULES`)  
> **Source of truth (design):** `docs/DESIGN_SYSTEM.md` + `src/app/globals.css`  
> **Route:** Settings → Access Control → `/settings?section=access-control`  
> **Date:** 2026-08-12  

---

## 1. Purpose of this document

Use this as the blueprint to analyse and build a **real** Access Control dashboard:

1. Full **permission catalog** (IDs + labels + groups) as configured in the UI  
2. **Role defaults** currently coded for Finance Admin / Teachers / Super Admin  
3. Entire project **sidebar / navbar** tree with routes  
4. **Design tokens & UI contract** for the Access Control screen  
5. Gaps vs a production RBAC system (what to build next)

---

## 2. Current implementation reality

| Item | Status |
|------|--------|
| Permission catalog in Settings UI | **Yes** — single source `src/lib/access-control/catalog.ts` |
| Role selector + Select all / Save UX | **Yes** — persists to `panacea.ac.rolePermissions` |
| Persist permissions (API / DB) | **Yes (client store)** — RolePermission localStorage; swap for real API later |
| Enforce on routes / nav / buttons | **Yes** — RouteGuard + filtered APP_MODULES + PermissionGate |
| Auth gate | Staff session `panacea_auth` + AuthorizationProvider |
| Staff mobile OTP → role → permissions | **Yes** — staff phone uses existing OTP challenge; role from `staffStore` |
| Middleware / Next route guards | Client RouteGuard (no `middleware.ts` yet — add when JWT backend lands) |

---

## 3. Access Control UI — screen contract

### 3.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│ SettingsSectionShell — title "Access Control"               │
│ description: Manage role permissions across modules…        │
├─────────────────────────────────────────────────────────────┤
│ Select Role [dropdown]          ○ Give all permissions      │
├──────────────┬──────────────────────────────────────────────┤
│ Control      │  Category title          Select all ○        │
│ Permissions  │  ┌────────────────────────────────────────┐  │
│ [Search]     │  │ ▼ Group label           Select all ○   │  │
│              │  │   ○ perm  ○ perm                       │  │
│ Category list│  │   ○ perm  ○ perm                       │  │
│ (left rail)  │  └────────────────────────────────────────┘  │
│              │  …more groups…                               │
├──────────────┴──────────────────────────────────────────────┤
│ Unsaved changes?          [Cancel]  [Save]                  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Behaviours to preserve in a real build

| Control | Behaviour |
|---------|-----------|
| Select Role | Loads `defaultCheckedForRole(role)` into checked set + baseline |
| Give all permissions | Checks / clears every permission ID |
| Category click | Switches right pane; resets group collapse map |
| Category Select all | Toggles all IDs in that category |
| Group Select all | Toggles all IDs in that group |
| Empty group | Shows **"No Data"** (Subsidy, Quickbooks, Learning Journey, SMS, Phone Calls, Daily Report) |
| Search | Filters permission labels (and hides empty groups when searching) |
| Cancel | Reverts checked → baseline |
| Save | Sets baseline = checked; toast *"Permissions saved successfully"* (no API yet) |

### 3.3 Component file map

| Piece | Path |
|-------|------|
| Access Control section | `src/components/modules/SettingsAccessControlSection.tsx` |
| AC styles | `src/components/modules/SettingsAccessControlSection.module.css` |
| Settings shell | `src/components/modules/SettingsSectionShell.tsx` |
| Shared buttons | `ui-btn ui-btn-primary` / `ui-btn-outline` |

---

## 4. Roles

Defined in UI as:

| Role | Default permission strategy (current code) |
|------|--------------------------------------------|
| **Super Admin** | All permission IDs |
| **Administrator** | All permission IDs |
| **Finance Admin** | Explicit curated set (see §6) — reference-product aligned |
| **Principal** | All IDs whose `id` includes `"view"` |
| **Center Head** | All IDs whose `id` includes `"view"` |
| **Teacher** | `view*` + prefixes `sa-`, `sl-`, `msg-`, `cal-`, `les-`, `pc-` |
| **Senior Teacher** | Same as Teacher |
| **Head Teacher** | Same as Teacher |

---

## 5. Complete permission catalog

> **ID** = machine key for API/DB. **Label** = UI text.  
> Empty groups are intentional placeholders (No Data).

### 5.1 Center Management (`center-management`)

#### Staff Management
| ID | Label |
|----|-------|
| `cm-staff-update-other-role` | Update other 'Staff' member role |
| `cm-staff-edit` | Add or edit 'Staff' information |
| `cm-staff-update-own-role` | Update own role |
| `cm-staff-view` | View 'Staff' page |
| `cm-staff-delete` | Delete 'Staff' information |

#### Student Management
| ID | Label |
|----|-------|
| `cm-stu-edit` | Edit 'Student' profile details |
| `cm-stu-delete` | Delete 'Student' profile |
| `cm-stu-add` | Add new 'Student' profile |
| `cm-stu-view` | View 'Student' profile page |

#### Students
| ID | Label |
|----|-------|
| `cm-students-view-page` | View 'Students' page with list of students |
| `cm-students-signed-up` | Show 'Signed Up Students' |
| `cm-students-phone` | Show 'Phone No' on student list |
| `cm-students-info` | View 'Student' information details |

#### Rooms
| ID | Label |
|----|-------|
| `cm-rooms-delete` | Delete 'Rooms' |
| `cm-rooms-create` | Create 'Rooms' |
| `cm-rooms-rename` | Rename 'Rooms' |

#### Groups
| ID | Label |
|----|-------|
| `cm-groups-create` | Create 'Groups' |
| `cm-groups-delete` | Delete 'Groups' |

#### Access Control (settings-related)
| ID | Label |
|----|-------|
| `cm-ac-email-templates` | Edit 'System Email templates' within 'Settings' |
| `cm-ac-fee-reminder` | Edit 'Fee Reminder Template' |
| `cm-ac-invoices` | Show 'illumine invoices' generated for the preschool |
| `cm-ac-parent-invite` | Edit 'Parent Invitation Email template' |
| `cm-ac-resource-add` | Add or Update 'Resource Center' documents |
| `cm-ac-install-report` | View 'Installation Report' |
| `cm-ac-resource-view` | View 'Resource Center' |
| `cm-ac-settings` | View or update 'Settings' |

#### Notes within Profile
| ID | Label |
|----|-------|
| `cm-notes-student` | Add / update notes within 'Student Profile' |
| `cm-notes-staff` | Add / update notes within 'Staff Profile' |
| `cm-notes-view-staff` | View staff notes within 'Staff Profile' |

#### Documents within Profile
| ID | Label |
|----|-------|
| `cm-docs-staff` | Access 'Documents' uploaded within 'Staff Profile' |
| `cm-docs-student` | Access 'Documents' within 'Student Profile' |

---

### 5.2 Student Attendance (`student-attendance`)

#### Student Attendance
| ID | Label |
|----|-------|
| `sa-record` | Record 'Student Attendance' |
| `sa-update` | Update 'Student Attendance' details |

#### Student Leaves
| ID | Label |
|----|-------|
| `sl-view` | View 'Student Leaves' |
| `sl-add` | Add 'Student Leaves' |
| `sl-approve` | Approve 'Student Leave Requests' |
| `sl-edit` | Edit 'Student Leave' details |
| `sl-comment` | Comment on 'Student Leave Requests' |

---

### 5.3 Staff Attendance (`staff-attendance`)

#### Staff Attendance
| ID | Label |
|----|-------|
| `sta-update` | Update 'Staff Attendance' |
| `sta-record` | Record 'Staff attendance' |

#### Staff Leaves
| ID | Label |
|----|-------|
| `stl-edit` | Edit 'Staff Leave' |
| `stl-add` | Add 'Staff Leave' |
| `stl-approve` | Approve Staff 'Leave Requests' |
| `stl-view` | View 'Staff Leave' page |

---

### 5.4 Messages (`messages`)

#### Group Messages
| ID | Label |
|----|-------|
| `msg-group-edit` | Edit 'Group' details |
| `msg-group-create` | Create a new 'Group' |
| `msg-group-view` | View or reply to 'Group Messages' |

#### Parent Messages
| ID | Label |
|----|-------|
| `msg-parent-send` | Send 'Direct Message' to parents |
| `msg-parent-shared` | View or reply to Shared Messages from parents |
| `msg-parent-read-all` | Read 'Direct message' and 'Group message's sent by all 'Staff' members |

#### Staff Messages
| ID | Label |
|----|-------|
| `msg-staff-announce` | Post 'Staff Announcement' |
| `msg-staff-send` | Send a message to 'Staff' via 'Staff Messages' |

---

### 5.5 Calendar (`calendar`)

#### School Calendar
| ID | Label |
|----|-------|
| `cal-comment` | Comment on 'Calender' |
| `cal-delete` | Delete 'Calender' |
| `cal-create` | Create new 'Calender' |
| `cal-media` | Add media to 'Calender' details |
| `cal-view` | View 'Calender' page |
| `cal-edit` | Edit 'Calender' details |

#### Student Schedule
| ID | Label |
|----|-------|
| `cal-ss-view` | View 'Student Schedule' |
| `cal-ss-edit` | Edit 'Student Schedule' |
| `cal-ss-create` | Create 'Student Schedule' |
| `cal-ss-delete` | Delete 'Student Schedule' |

---

### 5.6 Billing (`billing`)

#### Billing
| ID | Label |
|----|-------|
| `bill-view-dashboard` | View 'Billing' Dashboard |
| `bill-view-module` | View 'Billing' module |

#### Fee Plan
| ID | Label |
|----|-------|
| `bill-fp-view` | View 'Fee Plans' |
| `bill-fp-create-update` | Create and update 'Fee Plan' |
| `bill-fp-delete` | Delete 'Fee Plan' |
| `bill-fp-component` | Add or update 'Fee Component' |

#### Payment
| ID | Label |
|----|-------|
| `bill-pay-update` | Update 'Payment Record' |
| `bill-record-payment` | Record payment |
| `bill-send-reminders` | Send 'Reminders' |

#### Invoice
| ID | Label |
|----|-------|
| `bill-inv-credit` | Add a 'Credit Note' |
| `bill-inv-edit` | Edit 'Invoice' |
| `bill-inv-fee` | Apply 'Fee Component' in an 'Invoice' |
| `bill-inv-create` | Create 'Invoice' |
| `bill-inv-delete` | Delete 'Invoice' |
| `bill-inv-cancel` | Cancel 'Invoice' |

#### Discount & Taxes
| ID | Label |
|----|-------|
| `bill-disc-apply` | Apply 'Discount in Fee plan or Invoice' |
| `bill-disc-update` | Add or update discount |
| `bill-tax-add` | Add 'Taxes' |

#### Subsidy
*(No Data — empty group)*

#### Quickbooks
*(No Data — empty group)*

---

### 5.7 Assessment (`assessment`)

#### Assessments
| ID | Label |
|----|-------|
| `as-share` | Share 'Assessments' with 'Parents' |
| `as-create` | Create 'Assessments' |
| `as-view` | View 'Assessments' |
| `as-delete` | Delete 'Assessments' |

#### Student Assessment
| ID | Label |
|----|-------|
| `as-milestones` | Add or delete milestones and category |

#### Assessment Settings
| ID | Label |
|----|-------|
| `as-framework` | Add or update 'Learning Framework' |
| `as-manage-page` | Show 'Manage Assessments Page' |

#### Assessment Reports
| ID | Label |
|----|-------|
| `as-delete-journey` | Delete 'Learning Journey' |
| `as-create-journey` | Create or update 'Learning Journey' |
| `as-share-journey` | Share 'Learning Journey PDF' with 'Parents' |
| `as-view-journey` | View 'Learning Journey' Page |
| `as-view-reports` | View 'Assessment Reports' |

#### Observation
| ID | Label |
|----|-------|
| `as-view-obs-report` | View 'Observation Report' |
| `as-delete-obs` | Delete 'Observations' |
| `as-edit-obs` | Edit 'Observations' |
| `as-add-obs` | Add 'Observations' |
| `as-view-obs` | View 'Observations' |

#### Assessment Template
| ID | Label |
|----|-------|
| `as-tmpl-delete` | Delete 'Assessment Template' |
| `as-tmpl-create` | Create 'Assessment Template' |
| `as-tmpl-edit` | Edit 'Assessment Template' |

#### Learning Journey
*(No Data — empty group)*

---

### 5.8 AI features (`ai-features`)

| ID | Label |
|----|-------|
| `ai-use` | Use 'AI' features |
| `ai-configure` | Configure 'AI' settings |

---

### 5.9 Lessons (`lessons`)

#### Lesson Group
| ID | Label |
|----|-------|
| `les-add-update` | Add or update 'Lessons' |
| `les-delete` | Delete Lessons |
| `les-view` | View Lessons |
| `les-share` | Share Lessons |

#### Lesson Plan
| ID | Label |
|----|-------|
| `les-plan-edit` | Add or edit 'Weekly Lesson Plan' |
| `les-plan-view` | View 'Weekly Lesson Plan' |

#### Curriculum Document
| ID | Label |
|----|-------|
| `les-curr-view` | View 'Curriculum Documents' |
| `les-curr-download` | Download 'Curriculum Documents' |
| `les-curr-add` | Add 'Curriculum Documents' |

---

### 5.10 Programs (`programs`)

| ID | Label |
|----|-------|
| `prog-view` | View 'Programs' page |
| `prog-export` | Export 'Programs' Data |
| `prog-reports` | Access 'Program Reports' |
| `prog-assign` | Assign 'Students' to 'Programs' |
| `prog-add-update` | Add or update 'Programs' |

---

### 5.11 Enquiries (`enquiries`)

#### Enquiry
| ID | Label |
|----|-------|
| `enq-add-update` | Add or update 'Enquiry' |
| `enq-view` | View 'Enquiry' page |
| `enq-delete` | Delete 'Enquiry' |

#### Enquiry Forms
| ID | Label |
|----|-------|
| `enq-form-reject` | Reject 'Enquiry Forms Submissions' |
| `enq-form-add-update` | Add or update 'Enquiry Forms' |
| `enq-form-delete` | Delete 'Enquiry Forms' |
| `enq-form-status` | Update 'Enquiry Form Submission Status' after initial approval or rejection or submission |
| `enq-form-view-subs` | View 'Enquiry Form Submissions' |
| `enq-form-view-page` | View 'Enquiry Forms' page |
| `enq-form-request-changes` | Request changes in 'Enquiry Form Submissions' |
| `enq-form-approve` | Approve 'Enquiry Form Submissions' |
| `enq-form-share` | Share Enquiry Forms |

#### Whatsapp
| ID | Label |
|----|-------|
| `enq-wa-create-tmpl` | Create 'Whatsapp Template' |
| `enq-wa-view-msgs` | View 'Whatsapp Messages' |
| `enq-wa-view-tmpls` | View 'Whatsapp Templates' |
| `enq-wa-configure` | Configure 'Whatsapp' |
| `enq-wa-send` | Send 'Whatsapp Messages' |

#### SMS
*(No Data)*

#### Facebook
| ID | Label |
|----|-------|
| `enq-fb-configure` | Configure 'Facebook Leads Page' |

#### Phone Calls
*(No Data)*

---

### 5.12 Safety and security (`safety`)

#### CCTV
| ID | Label |
|----|-------|
| `safe-cctv` | View or update 'CCTV' configuration |

#### Bus Tracking
| ID | Label |
|----|-------|
| `safe-bus-edit` | Add or edit or delete 'Bus Routes' |
| `safe-bus-view` | View or track 'Bus Routes' |

---

### 5.13 Parent communication (`parent-communication`)

#### Notes
| ID | Label |
|----|-------|
| `pc-notes-view` | View 'Notes' page |
| `pc-notes-done` | 'Mark as Done' |
| `pc-notes-comment` | 'Comment' on 'Notes' |

#### Post Activity
| ID | Label |
|----|-------|
| `pc-post-announce` | Post 'Student Announcement' |
| `pc-post-view` | View 'Activity Page' |
| `pc-post-add` | Add new 'Post' |
| `pc-post-no-approval` | Post 'Activities' without approval |
| `pc-post-delete` | Delete 'Post' |
| `pc-post-edit` | Edit 'Post' |

#### Voice notes
| ID | Label |
|----|-------|
| `pc-voice` | Add or delete 'Voice Note' |

#### Concern
| ID | Label |
|----|-------|
| `pc-concern-comment` | Comment on 'Concern' |
| `pc-concern-resolve` | Resolve 'Concern' |
| `pc-concern-view` | View 'Concerns page' |

#### Newsletter
| ID | Label |
|----|-------|
| `pc-nl-create` | Create 'Newsletters' |
| `pc-nl-share` | Share 'Newsletters' with 'Students' |
| `pc-nl-templates` | Add/edit/delete 'Newsletter Templates' |

#### Daily Report
*(No Data)*

#### Parent Comments
| ID | Label |
|----|-------|
| `pc-comment-delete` | Delete Parent Comment |

---

### 5.14 Tour Management (`tour-management`)

#### Appointments / Tours
| ID | Label |
|----|-------|
| `tour-appt-add` | Add an 'Appointment' |
| `tour-appt-edit` | Edit 'Appointments' |
| `tour-appt-view` | View 'Tour Management' page |

#### Blockoff Period
| ID | Label |
|----|-------|
| `tour-bo-delete` | Delete 'Blockoff period' |
| `tour-bo-edit` | Edit 'Blockoff period' |
| `tour-bo-add` | Add 'Blockoff period' |
| `tour-bo-view` | View 'Blockoff periods' |

#### Calendar
| ID | Label |
|----|-------|
| `tour-cal-view` | View 'Appointment Calendar' |
| `tour-cal-delete` | Delete 'Appointment Calendar' |
| `tour-cal-add` | Add 'Appointment Calendar' |
| `tour-cal-edit` | Edit 'Appointment Calendar' |

---

### 5.15 Forms (`forms`)

#### Student Forms
| ID | Label |
|----|-------|
| `form-stu-report` | View 'Student Form Submission Report' |
| `form-stu-approve` | Approve 'Student Form Submissions' |
| `form-stu-view-subs` | View 'Student Form Submissions' |
| `form-stu-reject` | Reject 'Student Form Submissions' |
| `form-stu-view-page` | View 'Student Forms' page |
| `form-stu-add-update` | Add or update 'Student Forms' |
| `form-stu-expiry` | Configure expiry for 'Student Forms' |
| `form-stu-status` | Update 'Student Form Submission Status' after initial approval or rejection or submission |
| `form-stu-request-changes` | Request changes in 'Student Form Submissions' |
| `form-stu-delete` | Delete 'Student Forms' |
| `form-stu-share` | Share 'Student Forms' |

#### Staff Forms
| ID | Label |
|----|-------|
| `form-stf-status` | Update 'Staff Form Submission Status' after initial approval or rejection or submission |
| `form-stf-share` | Share 'Staff Forms' |
| `form-stf-add-update` | Add or update 'Staff Forms' |
| `form-stf-delete` | Delete 'Staff Forms' |
| `form-stf-reject` | Reject 'Staff Form Submissions' |
| `form-stf-request-changes` | Request changes in 'Staff Form Submissions' |
| `form-stf-approve` | Approve 'Staff Form Submissions' |
| `form-stf-view-subs` | View 'Staff Forms' Submissions' |
| `form-stf-view-page` | View 'Staff Forms' page |
| `form-stf-expiry` | Configure expiry for 'Staff Forms' |

---

### 5.16 Tools (`tools`)

| ID | Label |
|----|-------|
| `tools-id-cards` | Generate 'ID Cards' |
| `tools-certificates` | Generate 'Certificates' |

---

### 5.17 Multi Center Management (`multi-center`)

| ID | Label |
|----|-------|
| `mc-view` | View centers |
| `mc-switch` | Switch between centers |
| `mc-edit` | Edit multi-center settings |

---

### 5.18 Reports (`reports`)

#### Reports (View report and favorite)
| ID | Label |
|----|-------|
| `rep-stu-att` | Access 'Student Attendance Reports' |
| `rep-activity` | Access 'Activity Report' |
| `rep-enquiry` | Access 'Enquiry Reports' |
| `rep-student` | Access 'Student' Reports' |
| `rep-staff-att` | Access 'Staff Attendance Reports' |
| `rep-billing` | Access 'Billing' Reports' |

---

## 6. Finance Admin — default checked set

These IDs are **on** when role = Finance Admin (curated from reference product):

```
# Center Management (partial)
cm-staff-edit, cm-staff-view, cm-staff-delete
cm-stu-edit, cm-stu-delete, cm-stu-add, cm-stu-view
cm-students-view-page, cm-students-signed-up, cm-students-phone, cm-students-info
cm-rooms-delete, cm-rooms-create
cm-groups-create, cm-groups-delete
cm-ac-fee-reminder, cm-ac-parent-invite, cm-ac-install-report, cm-ac-settings
cm-notes-student, cm-notes-staff, cm-notes-view-staff
cm-docs-staff, cm-docs-student

# Student Attendance + Leaves (all)
sa-record, sa-update
sl-view, sl-add, sl-approve, sl-edit, sl-comment

# Billing (partial)
bill-view-dashboard, bill-view-module
bill-pay-update, bill-record-payment, bill-send-reminders
bill-inv-create, bill-inv-delete
bill-disc-apply

# Assessment (templates only)
as-tmpl-delete, as-tmpl-create, as-tmpl-edit

# Lessons (all)
les-add-update, les-delete, les-view, les-share
les-plan-edit, les-plan-view
les-curr-view, les-curr-download, les-curr-add

# Programs (partial — no prog-reports)
prog-view, prog-export, prog-assign, prog-add-update

# Enquiries (Enquiry + Forms; WhatsApp/Facebook off)
enq-add-update, enq-view, enq-delete
enq-form-reject, enq-form-add-update, enq-form-delete, enq-form-status
enq-form-view-subs, enq-form-view-page, enq-form-request-changes
enq-form-approve, enq-form-share

# Safety (all)
safe-cctv, safe-bus-edit, safe-bus-view

# Parent communication (partial)
pc-notes-view, pc-notes-done, pc-notes-comment
pc-post-announce, pc-post-view, pc-post-add, pc-post-delete, pc-post-edit
pc-concern-comment, pc-concern-resolve, pc-concern-view
pc-nl-create, pc-nl-share, pc-nl-templates
# OFF: pc-post-no-approval, pc-voice, pc-comment-delete

# Tour Management (all)
tour-appt-add, tour-appt-edit, tour-appt-view
tour-bo-delete, tour-bo-edit, tour-bo-add, tour-bo-view
tour-cal-view, tour-cal-delete, tour-cal-add, tour-cal-edit

# Forms (Student almost all; Staff expiry only)
form-stu-approve, form-stu-view-subs, form-stu-reject, form-stu-view-page
form-stu-add-update, form-stu-expiry, form-stu-status, form-stu-request-changes
form-stu-delete, form-stu-share
form-stf-expiry
# OFF: form-stu-report + most staff-form IDs

# Tools (all)
tools-id-cards, tools-certificates

# Reports (partial — no Activity Report)
rep-stu-att, rep-enquiry, rep-student, rep-staff-att, rep-billing
```

**Notably OFF for Finance Admin (examples):** Staff Attendance, Messages, Calendar, AI, Multi Center, Fee Plan CRUD, most Assessment (except templates), WhatsApp, Facebook, Activity Report, Staff Forms (except expiry).

---

## 7. Entire project Navbar (`APP_MODULES`)

Source: `src/lib/modules.ts`

### 7.1 Tree

```
Dashboard                         /dashboard

Center Management                 /center-management
├── Students                      /center-management/students
├── Staff                         /center-management/staff
├── Rooms                         /center-management/rooms
├── Groups                        /center-management/groups
├── Labels                        /center-management/labels
└── Email Templates               /center-management/email-templates

Program                           /program
├── Program                       /program
├── Dashboard                     /program/dashboard
└── Program Movement              /program/program-movement

Attendance & Leaves               /attendance-leaves
├── Student Attendance            /attendance-leaves/student-attendance
├── Staff Attendance              /attendance-leaves/staff-attendance
├── Student Staff Ratio           /attendance-leaves/student-staff-ratio
└── Attendance Forecast           /attendance-leaves/attendance-forecast

Parent Communication              /parent-communication
├── Activities                    /parent-communication/activities
├── Daily Reports                 /parent-communication/daily-reports
├── Notes                         /parent-communication/notes
├── Concerns                      /parent-communication/concerns
├── Newsletters                   /parent-communication/newsletters
└── Resource Center               /parent-communication/resource-center

Messages                          /messages
├── Parent Messages               /messages/parent-messages
├── Staff Messages                /messages/staff-messages
└── Staff Announcement            /messages/staff-announcement

Billing & Accounting              /billing-accounting
├── Dashboard                     /billing-accounting
├── Invoices                      /billing-accounting/invoices
├── Student Balances              /billing-accounting/student-balances
├── Payments                      /billing-accounting/payments
├── Fee Plan                      /billing-accounting/fee-plan
└── Fee Reminders                 /billing-accounting/fee-reminders

Enquiries                         /enquiries
├── Dashboard                     /enquiries/dashboard
├── Enquiries                     /enquiries
├── Tasks                         /tasks
├── Enquiry Forms                 /enquiries/forms
├── Automations                   /enquiries/marketing
├── Email Campaigns               /enquiries/marketing/email-campaigns
├── Facebook                      /enquiries/facebook
└── WhatsApp                      /enquiries/whatsapp
  (Tour Management routes exist under /enquiries/tour — not listed as sidebar child)

Calendar                          /calendar
├── Staff Schedule                /calendar/staff-schedule
├── Student Schedule              /calendar/student-schedule
├── Staff Holidays                /calendar/staff-holidays
├── Birthday Calendar             /calendar/birthday-calendar
├── School Calendar               /calendar
└── Meal Planner                  /calendar/meal-planner

Progress Tracking                 /progress-tracking
├── Progress Grid                 /progress-tracking/progress-grid
├── Student Progress              /progress-tracking/student-progress
├── Lesson Plan                   /progress-tracking/lesson-plan
├── Lesson Set Mapping            /progress-tracking/lesson-set-mapping
├── Progress Boards               /progress-tracking/progress-boards
├── Observations                  /progress-tracking/observations
└── Learning Journey              /progress-tracking/learning-journey

Learning & Assessment             /learning-assessment
├── Lessons                       /learning-assessment/lessons
├── Assessments                   /learning-assessment
├── Curriculum Document           /learning-assessment/curriculum-document
└── Manage                        /learning-assessment/manage

Forms                             /forms
├── All Forms                     /forms
└── Admission Process             /forms/admission-process

Tools                             /tools
├── ID Cards                      /tools/id-cards
└── Certificates                  /tools/certificates

Reports                           /reports

Settings                          /settings
├── Programs                      /settings?section=programs
├── Access Control                /settings?section=access-control
├── Activity Posts                /settings?section=activity-posts
├── Attendance                    /settings?section=attendance
├── Billing                       /settings?section=billing
├── Bus Tracking                  /settings?section=bus-tracking
├── CCTV                          /settings?section=cctv
├── Forms                         /settings?section=forms
├── Lesson                        /settings?section=lesson
├── Roles                         /settings?section=roles
├── School Details                /settings?section=school-details
├── Staff Leave Management        /settings?section=staff-leave-management
├── Vaccine Library               /settings?section=vaccine-library
├── Email Templates               /settings?section=email-templates
└── Other Settings                /settings?section=other-settings

Help                              /help
├── Product Guide                 /help?section=product-guide
└── Support                       /help?section=support

Language                          /language
Profile                           /profile
Notifications                     /notifications
```

### 7.2 Access Control category ↔ Navbar mapping

| AC category (left rail) | Primary navbar module(s) | Notes |
|-------------------------|--------------------------|--------|
| Center Management | Center Management | Labels / Email Templates not fully permissioned |
| Student Attendance | Attendance & Leaves → Student Attendance | Leaves live on same page tab |
| Staff Attendance | Attendance & Leaves → Staff Attendance | Ratio / Forecast not in AC |
| Messages | Messages | — |
| Calendar | Calendar | Staff Schedule / Holidays / Birthday / Meal not fully covered |
| Billing | Billing & Accounting | — |
| Assessment | Learning & Assessment + Progress Tracking | Split across two nav modules |
| AI features | (no dedicated nav item) | Feature flag style |
| Lessons | Learning & Assessment → Lessons / Curriculum | Lesson Plan also under Progress Tracking |
| Programs | Program | — |
| Enquiries | Enquiries (+ Facebook / WhatsApp) | Automations / Campaigns under PC Marketing historically |
| Safety and security | Settings → CCTV / Bus Tracking | Not top-level nav |
| Parent communication | Parent Communication | Resource Center gated via CM Access Control IDs |
| Tour Management | Enquiries → Tour (hidden/orphan) | AC has full tour catalog |
| Forms | Forms | Student vs Staff forms |
| Tools | Tools | ID Cards / Certificates |
| Multi Center Management | (shell / org switcher) | Not a full sidebar module |
| Reports | Reports | Report category access |

---

## 8. Design document (Panacea) — for Access Control & dashboard chrome

Full system: `docs/DESIGN_SYSTEM.md`. Summary for building/enforcing AC UI:

### 8.1 Typography

| Use | Font |
|-----|------|
| UI / body | **Poppins** (`--font-body`) |
| Sidebar subsection labels | **Bodoni Moda** (`.shell-subnavEditorial`) |
| Center Management list titles | **Source Sans 3** (`.cmph-title`) |
| Forbidden | Georgia, Inter, Arial, system stacks |

### 8.2 Core tokens

| Token | Hex | Use |
|-------|-----|-----|
| `--color-accent` | `#5D5FEF` | Primary buttons, focus, AC active category, checked circle |
| `--color-accent-hover` | `#4B51E0` | Primary hover |
| `--color-accent-soft` | `#E8F2FF` | Soft surfaces / role trigger soft bg (`#eaf4ff` in AC CSS) |
| `--color-input-bg` | `#F8FAFC` | Inputs |
| `--border` | `#E8EDF5` | Borders / AC lines |
| `--modal-header-bg` | `#DEECFF` | Modal header only |
| `--page-bg` | `#FAFAF7` | Page canvas |
| `--color-close` | `#E53935` | Close |
| Sidebar / topbar | `#FFFFFF` | Shell chrome |
| Text primary | `#1F2937` | Labels / titles |
| Text secondary | `#6B7280` | Muted |

### 8.3 Required shared classes

| Element | Classes |
|---------|---------|
| Primary button | `ui-btn ui-btn-primary` |
| Cancel / outline | `ui-btn ui-btn-outline` |
| Inputs | `ui-input` + `ui-label` + `ui-field` |
| Tables | `ui-table` (thead = accent + white) |
| Popups | `Modal` / `Drawer` only |
| Page forms | `mod-form-card` |

### 8.4 Access Control visual specifics

| Element | Spec |
|---------|------|
| Role trigger | Accent border, soft blue fill, accent text, radius 8px |
| Active category | Light blue / soft accent background |
| Permission check | Circular checkbox; filled accent + white tick when on |
| Select all | Label left of circle (`labelFirst`) |
| Footer | Outline Cancel + Primary Save |
| Card | White surface, light border (`#ebeff5` / `--border`) |

**Rule:** Do not invent one-off colors for a new RBAC dashboard — extend tokens in `globals.css` / module CSS.

---

## 9. Recommended architecture for a *real* Access Control system

### 9.1 Data model (suggested)

```
Role                (id, name, is_system, center_id?)
Permission          (id = catalog key, label, category_id, group_id)
RolePermission      (role_id, permission_id)
UserRole            (user_id, role_id, center_id?)
```

Seed `Permission` from §5. Seed system roles from §4. Store Finance Admin defaults from §6 as initial `RolePermission` rows.

### 9.2 API surface (suggested)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/permissions` | Full catalog (categories → groups → permissions) |
| GET | `/api/v1/roles` | List roles |
| GET | `/api/v1/roles/:id/permissions` | Checked IDs for role |
| PUT | `/api/v1/roles/:id/permissions` | Replace permission set (Save) |
| GET | `/api/v1/me/permissions` | Effective permissions for session |

### 9.3 Enforcement layers

1. **Nav** — Filter `APP_MODULES` children by required permission (map route → permission ID).  
2. **Route** — Client gate + Next middleware / server layout check.  
3. **Action** — Hide/disable buttons (Delete, Approve, Record payment, etc.).  
4. **API** — Backend must re-check; never trust UI alone.

### 9.4 Suggested route → permission examples

| Route / action | Suggested permission |
|----------------|----------------------|
| `/center-management/students` | `cm-students-view-page` |
| Delete student | `cm-stu-delete` |
| `/attendance-leaves/student-attendance` | `sa-record` or module-view equivalent |
| Approve student leave | `sl-approve` |
| `/billing-accounting` | `bill-view-dashboard` |
| Create invoice | `bill-inv-create` |
| `/settings?section=access-control` | `cm-ac-settings` (+ dedicated manage-roles later) |
| Generate ID card | `tools-id-cards` |

*(Build an explicit route/permission matrix as phase 2 — current AC categories do not 1:1 match every nav leaf.)*

### 9.5 Frontend refactor steps

1. Extract `CATEGORIES` + role defaults into `src/lib/access-control/catalog.ts` (single source).  
2. Replace in-memory Save with API `PUT`.  
3. Add `usePermissions()` hook reading `/me/permissions`.  
4. Wrap nav + pages with `can(permissionId)`.  
5. Align Settings → Roles with the same role store.

---

## 10. Gaps / analysis checklist

| Gap | Impact | Action |
|-----|--------|--------|
| Save not persisted | Config lost on refresh | Persist RolePermission |
| No route enforcement | Security hole | Middleware + can() |
| AC categories ≠ navbar 1:1 | Hard to map | Explicit matrix (§9.4) |
| Empty groups (Subsidy, SMS, …) | Placeholders | Fill when features ship or hide |
| Staff Attendance / Messages / Calendar defaults weak for Finance Admin | May be intentional | Confirm product policy |
| Progress Tracking / Dashboard / Help / Language | Limited or no AC entries | Add permissions or leave public |
| Tour Management not in sidebar children | Hidden feature | Link nav or keep admin-only |
| Parallel role models (Settings Roles vs AC roles vs staff profile) | Confusion | Unify on one Role table |

---

## 11. File index

| File | Role |
|------|------|
| `src/components/modules/SettingsAccessControlSection.tsx` | Permission catalog + role defaults + UI |
| `src/components/modules/SettingsAccessControlSection.module.css` | AC layout styles |
| `src/lib/modules.ts` | Sidebar / navbar modules |
| `docs/DESIGN_SYSTEM.md` | Design contract |
| `src/app/globals.css` | Design tokens |
| `docs/ACCESS_CONTROL_COMPLETE_SPEC.md` | This document |
| `ACCESS_CONTROL_OPERATION_AUDIT.md` | Earlier ops audit (may be partially stale vs new IDs) |

---

## 12. Quick counts (approx.)

| Metric | Value |
|--------|-------|
| AC categories | **18** |
| Roles in UI | **8** |
| Navbar top-level modules | **19** (`APP_MODULES`) |
| Permission IDs (non-empty) | **~200+** (see §5) |
| Empty AC groups | Subsidy, Quickbooks, Learning Journey, SMS, Phone Calls, Daily Report |

---

*End of spec. Use §5 as the seed catalog and §9 as the build plan for a production Access Control dashboard.*
