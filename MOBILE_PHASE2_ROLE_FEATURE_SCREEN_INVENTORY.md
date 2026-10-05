# PHASE 2 — Mobile Role Definition, Feature Classification & Flutter Screen Inventory

**Project:** ChilldCare / Panacea  
**Depends on:** `FRONTEND_COMPLETE_FUNCTIONAL_AUDIT.md` (Phase 1 ✅)  
**Date:** 2026-08-24  
**Scope of this document:** Phase 2 only  
**Out of scope:** Flutter UI/UX design (Phase 3), Flutter code (Phase 4), Backend APIs (Phase 5)

**Rules applied:**
- Roles and permission IDs are taken from frontend code (`ACCESS_CONTROL_ROLES`, `catalog.ts`, `modulePermissions.ts`, `PARENT_MODULES`).
- Classifications are **preliminary product recommendations** based on web workflows + mobile usability — not final product decisions.
- No Flutter screens are invented beyond mapping existing web functionality.

---

## Roadmap status

```text
PHASE 1  Frontend Web Audit                         ✅ COMPLETED
PHASE 2  Role + Permission → Mobile Roles →
         Feature Classification → Nav → Screen Inventory   ← THIS DOCUMENT
PHASE 3  Flutter UI/UX Design                       ⏳ NOT STARTED
PHASE 4  Flutter Implementation                     ⏳ NOT STARTED
PHASE 5  Backend API + Server-side RBAC             ⏳ NOT STARTED
```

---

## 1. Role + Permission Analysis (from Phase 1 evidence)

### 1.1 Staff roles (exact names from code)

| Role (web) | Source | Default permission rule |
|------------|--------|-------------------------|
| Super Admin | `ACCESS_CONTROL_ROLES` | All permission IDs |
| Administrator | `ACCESS_CONTROL_ROLES` | All permission IDs |
| Finance Admin | `ACCESS_CONTROL_ROLES` | Large curated billing-heavy set |
| Principal | `ACCESS_CONTROL_ROLES` | IDs containing `view` |
| Center Head | `ACCESS_CONTROL_ROLES` | IDs containing `view` |
| Teacher | `ACCESS_CONTROL_ROLES` | `view` ∪ `sa-`/`sl-`/`msg-`/`cal-`/`les-`/`pc-` |
| Senior Teacher | `ACCESS_CONTROL_ROLES` | Same teacher-family rule |
| Head Teacher | `ACCESS_CONTROL_ROLES` | Same teacher-family rule |
| Super User | Staff role alias | Normalized → **Super Admin** |

### 1.2 Parent (separate auth surface)

| Role | Source | Permissions |
|------|--------|-------------|
| Parent | `parent-auth` + `PARENT_MODULES` | **No AC catalog IDs** — portal session only |

### 1.3 Permission enforcement today (web)

| Layer | Behavior | Mobile implication |
|-------|----------|--------------------|
| Nav filter | `requiredAny` permission lists | Mobile bottom tabs / drawer must use same IDs |
| Route guard | `pathAllows` ANY of list | Flutter routes must gate with same IDs (server later) |
| Action gates | Sparse (`cm-staff-edit/delete`, dashboard widgets) | Mobile must plan action gates even if web is weak |
| Runtime overrides | `panacea.ac.rolePermissions` | Phase 5 must replace with server RBAC |

---

## 2. Mobile Role Definition

Consolidate web roles into **mobile personas** without inventing new permission codes.

| Mobile Role ID | Maps from web role(s) | App shell | Primary job on mobile |
|----------------|----------------------|-----------|------------------------|
| `MOBILE_ADMIN` | Super Admin, Administrator | Staff app | Oversee center; approve; escalate; light config |
| `MOBILE_FINANCE` | Finance Admin | Staff app | Invoices, payments, balances, reminders |
| `MOBILE_LEADER` | Principal, Center Head | Staff app | Monitor dashboards, attendance, enquiries, messages (mostly view + communicate) |
| `MOBILE_TEACHER` | Teacher, Senior Teacher, Head Teacher | Staff app | Daily classroom ops: attendance, leaves, messages, posts, observations |
| `MOBILE_PARENT` | Parent portal user | Parent app | Timeline, messages, calendar, invoices, resources |

### 2.1 Mapping rules

```text
Web role "Super Admin" | "Administrator"  → MOBILE_ADMIN
Web role "Finance Admin"                  → MOBILE_FINANCE
Web role "Principal" | "Center Head"      → MOBILE_LEADER
Web role "Teacher" | "Senior Teacher" | "Head Teacher" → MOBILE_TEACHER
Parent session                            → MOBILE_PARENT
Web "Super User"                          → treat as MOBILE_ADMIN (same as Super Admin)
```

### 2.2 Permission strategy for mobile (Phase 2 definition)

- **Do not invent new permission IDs.**
- Mobile feature visibility = intersection of:
  1. Feature classified as MOBILE or BOTH
  2. User holds **any** of the web permission IDs already used for that nav/route in `modulePermissions.ts` / `routePermissions.ts`
- Action buttons (record payment, approve leave, delete staff) should require the **specific action permission** from catalog when one exists (even if web under-enforces today).

### 2.3 Needs product decision

| Question | Why |
|----------|-----|
| One Flutter app with role switch vs Staff app + Parent app? | Different auth stores today |
| Should Senior/Head Teacher get extra mobile tools vs Teacher? | Web defaults are identical family rule |
| Should Principal get edit actions on mobile or view-only? | Web defaults are view-* |
| Multi-center switcher on mobile (`mc-*`)? | Weakly wired on web |

---

## 3. Module / Feature Classification

Legend:

| Code | Meaning |
|------|---------|
| **MOBILE** | Primary mobile workflow |
| **BOTH** | Useful on both; mobile may be simplified |
| **WEB-OPT** | Possible on mobile but desktop-first |
| **WEB-ONLY** | Keep on web for Phase 2–4 |
| **DEFER** | Coming soon / incomplete on web — do not prioritize mobile |
| **DECIDE** | Needs product decision |

### 3.1 Master classification table

| Web module / feature | Classification | Required perms (nav ANY — from code) | Rationale |
|----------------------|----------------|--------------------------------------|-----------|
| Dashboard (KPIs) | BOTH | authenticated | Glanceable; simplify widgets |
| Students list | BOTH | `cm-students-view-page`, `cm-stu-view` | Frequent lookup |
| Student profile (full tabs) | WEB-OPT | `cm-stu-view` (+ edit perms for edits) | Dense forms |
| Student add / bulk import | WEB-ONLY | `cm-stu-add` / bulk UI | Bulk + forms |
| Staff list | BOTH | `cm-staff-view` | Lookup |
| Staff add/edit/delete | WEB-OPT | `cm-staff-edit`, `cm-staff-delete` | Forms + sensitive |
| Rooms / Groups / Labels | WEB-ONLY | rooms/groups/`cm-ac-settings` | Config density |
| Email templates | WEB-ONLY | `cm-ac-email-templates` | Editor |
| Program list | BOTH | `prog-view`, `prog-add-update` | View OK |
| Program dashboard | BOTH | `prog-view`, `prog-reports` | Charts simplified |
| Program movement | DECIDE | `prog-assign`, `prog-add-update` | Complex transfers |
| Student attendance | **MOBILE** | `sa-record`, `sa-update`, `sl-view` | Daily high-frequency |
| Staff attendance | **MOBILE** | `sta-record`, `sta-update`, `stl-view` | Daily |
| Leaves approve/create | **MOBILE** | `sl-*` / `stl-*` | Approvals on the go |
| Student–staff ratio | BOTH | attendance perms | Monitoring |
| Attendance forecast | WEB-OPT | `sa-record`, `rep-stu-att` | Analytical |
| Activities / posts | **MOBILE** | `pc-post-*` | Teachers post often |
| Daily reports | BOTH | `pc-post-view`, `pc-notes-view` | |
| Notes / Concerns | **MOBILE** | `pc-notes-*`, `pc-concern-*` | |
| Newsletters | WEB-OPT | `pc-nl-*` | Compose heavy |
| Resource center (staff) | BOTH | `cm-ac-resource-view/add` | View on mobile |
| Parent messages | **MOBILE** | `msg-parent-*` | Core |
| Staff messages | **MOBILE** | `msg-staff-send` | Core |
| Staff announcement | BOTH | `msg-staff-announce` | |
| Billing dashboard | BOTH | `bill-view-dashboard`, `bill-view-module` | Finance |
| Invoices list / detail / PDF | **MOBILE** (view+download) | `bill-inv-*`, `bill-view-module` | High value |
| Record payment / refund | DECIDE | `bill-record-payment`, … | Needs API + UX |
| Fee plan builder | WEB-ONLY | `bill-fp-*` | Complex |
| Fee reminders | BOTH | `bill-send-reminders` | Trigger OK; template edit WEB-ONLY |
| Student balances | BOTH | `bill-view-module` | Finance |
| Payments list | BOTH | `bill-record-payment`, `bill-pay-update` | |
| Enquiries list / add | BOTH | `enq-view`, `enq-add-update` | Sales on mobile |
| Enquiry dashboard | BOTH | `enq-view` | |
| Enquiry forms builder | WEB-ONLY | `enq-form-*` | Builder |
| Automations / email campaigns | WEB-ONLY | `enq-view` | Builders |
| Facebook / WhatsApp | DEFER | `enq-fb-*`, `enq-wa-*` | Coming soon on web |
| Tasks | BOTH | `enq-view` | |
| Tour appointments | BOTH | `tour-appt-*` | |
| Calendar (day/week) | BOTH | `cal-view`, `cal-ss-view` | |
| Meal planner / holidays admin | WEB-OPT | `cal-view` | |
| Progress grid / boards | WEB-OPT | `as-view`, … | Dense |
| Observations add | **MOBILE** | `as-view-obs`, `as-add-obs` | Teachers |
| Learning journey | WEB-OPT | `as-view-journey`, … | |
| Lessons / assessments manage | WEB-OPT | `les-*`, `as-*` | |
| Forms / admission builder | WEB-ONLY | `form-*` | |
| ID cards / certificates | DECIDE | `tools-*` | Print-oriented |
| Reports catalog | WEB-ONLY | `rep-*` | Wide tables |
| Settings (most) | WEB-ONLY | `cm-ac-settings`, … | |
| Access Control / Roles | WEB-ONLY | `cm-ac-settings` | Matrix UI |
| CCTV / Bus settings | WEB-ONLY | `safe-*` | |
| Help / Notifications / Profile (self) | BOTH | authenticated | |
| Get Started / Onboarding / Premium | WEB-OPT | authenticated | |
| **Parent Timeline** | **MOBILE** | Parent session | Core |
| Parent Lessons | **MOBILE** | Parent session | |
| Parent Messages | **MOBILE** | Parent session | |
| Parent Calendar | **MOBILE** | Parent session | |
| Parent Invoices + PDF | **MOBILE** | Parent session | |
| Parent Profile / Resources / Support | BOTH | Parent session | |
| Parent Pay Now | DECIDE | Parent session | Gateway NOT CONFIRMED |

---

## 4. Role-specific Mobile Navigation

### 4.1 Staff app — bottom navigation (max 5) + More drawer

#### MOBILE_TEACHER

| Tab | Screen group | Gate (ANY) |
|-----|--------------|------------|
| Home | Teacher dashboard (attendance summary, today’s tasks) | authenticated |
| Attendance | Student attendance (+ staff if permitted) | `sa-*` / `sta-*` |
| Messages | Parent + staff messages | `msg-*` |
| Classroom | Activities / notes / concerns / observations | `pc-*`, `as-view-obs` |
| More | Leaves, calendar, students lookup, profile, notifications, help | respective |

#### MOBILE_FINANCE

| Tab | Screen group | Gate |
|-----|--------------|------|
| Home | Billing KPIs | `bill-view-dashboard` |
| Invoices | List → detail → PDF | `bill-view-module` / `bill-inv-*` |
| Payments | Payments + record payment (**if DECIDE = yes**) | `bill-record-payment` |
| Balances | Student balances / credit-deposit view | `bill-view-module` |
| More | Students, reminders, messages, reports links (web deep-link), profile | |

#### MOBILE_LEADER

| Tab | Screen group | Gate |
|-----|--------------|------|
| Home | Center dashboard (view widgets) | authenticated |
| Attendance | Overview / ratio | attendance view perms |
| Enquiries | Pipeline list + tasks | `enq-view` |
| Messages | Parent/staff | `msg-*` |
| More | Calendar, students, billing glance (if permitted), profile | |

#### MOBILE_ADMIN

Same as Leader **plus** Finance glance + Staff list + Approvals; **Settings / Access Control remain web-only** (open in browser or “Manage on web” CTA).

### 4.2 Parent app — bottom navigation

| Tab | Maps to web `PARENT_MODULES` |
|-----|------------------------------|
| Timeline | `timeline` → `/parent/timeline` |
| Messages | `messages` |
| Calendar | `school-calendar` |
| Invoices | `student-invoices` |
| More | Lessons, Profile, Resources, Support, Notifications, Prefs |

---

## 5. Complete Flutter Screen Inventory

IDs are proposed Flutter route names. Each maps to an existing web capability.

### 5.1 Shared / Auth screens

| Screen ID | Title | Roles | Web reference | Priority |
|-----------|-------|-------|---------------|----------|
| `auth_login` | Login | All | `/login` | P0 |
| `auth_otp` | Verify OTP | Staff/Parent | `/verify-otp` | P0 |
| `auth_select_student` | Select child | Parent | `/select-student` | P0 |
| `auth_reset_password` | Reset password | Staff/Parent | reset pages | P2 |
| `shell_staff` | Staff shell | Staff roles | `AppShell` | P0 |
| `shell_parent` | Parent shell | Parent | `ParentAppShell` | P0 |
| `access_denied` | Access denied | Staff | `AccessDenied` | P0 |
| `profile_self` | My profile | All | `/profile`, parent profile | P1 |
| `notifications` | Notifications | All | `/notifications`, parent | P1 |
| `notification_prefs` | Prefs | All | prefs pages | P2 |
| `help_support` | Help / Support | All | help / parent support | P2 |
| `open_on_web` | Deep-link CTA | Staff | — | P1 |

### 5.2 Staff — Core mobile screens (P0)

| Screen ID | Title | Roles | Classification | Key perms |
|-----------|-------|-------|----------------|-----------|
| `staff_home` | Home | All staff | BOTH | auth |
| `attendance_student` | Student Attendance | Teacher, Leader, Admin | MOBILE | `sa-record`, `sa-update` |
| `attendance_staff` | Staff Attendance | Admin, Leader, Finance† | MOBILE | `sta-record`, `sta-update` |
| `leave_student_list` | Student Leaves | Teacher+ | MOBILE | `sl-view` |
| `leave_student_action` | Approve/Deny Leave | Teacher+/Leader | MOBILE | `sl-approve` |
| `leave_staff_list` | Staff Leaves | Admin/Leader | MOBILE | `stl-view` |
| `messages_parent` | Parent Messages | Teacher+ | MOBILE | `msg-parent-*` |
| `messages_staff` | Staff Messages | Staff | MOBILE | `msg-staff-send` |
| `messages_thread` | Thread detail | Staff | MOBILE | same |
| `pc_activities_list` | Activities | Teacher+ | MOBILE | `pc-post-view` |
| `pc_activity_compose` | Post activity | Teacher+ | MOBILE | `pc-post-add` |
| `pc_notes` | Notes | Teacher+ | MOBILE | `pc-notes-view` |
| `pc_concerns` | Concerns | Teacher+ | MOBILE | `pc-concern-view` |
| `students_list` | Students | Staff w/ perm | BOTH | `cm-students-view-page` |
| `student_detail_mobile` | Student (summary) | Staff | BOTH | `cm-stu-view` |
| `invoice_list` | Invoices | Finance, Admin | MOBILE | `bill-view-module` |
| `invoice_detail` | Invoice detail | Finance, Admin | MOBILE | same |
| `invoice_pdf_preview` | Invoice PDF | Finance, Admin, Parent | MOBILE | same |
| `receipt_pdf_preview` | Receipt PDF | Finance, Admin, Parent | MOBILE | payments exist |
| `calendar_day` | Calendar | Staff | BOTH | `cal-view` |

†If permitted by role permissions.

### 5.3 Staff — P1 screens

| Screen ID | Title | Roles | Class |
|-----------|-------|-------|-------|
| `billing_home` | Billing dashboard | Finance, Admin | BOTH |
| `payments_list` | Payments | Finance | BOTH |
| `balances_list` | Student balances | Finance | BOTH |
| `enquiry_list` | Enquiries | Leader, Admin, Finance | BOTH |
| `enquiry_detail` | Enquiry detail | same | BOTH |
| `enquiry_create` | Add enquiry | same | BOTH |
| `tasks_list` | Tasks | Leader, Admin | BOTH |
| `tour_list` | Tours | Leader, Admin | BOTH |
| `observation_create` | Add observation | Teacher | MOBILE |
| `announcement_compose` | Staff announcement | Admin/Leader | BOTH |
| `staff_list` | Staff directory | Admin, Leader | BOTH |
| `ratio_view` | Student–staff ratio | Leader, Admin | BOTH |
| `resources_staff` | Resource center | Staff | BOTH |
| `fee_reminder_send` | Send reminders | Finance | BOTH |

### 5.4 Staff — P2 / Web CTA only

| Screen ID | Title | Note |
|-----------|-------|------|
| `program_list` | Programs | BOTH simplified |
| `program_movement` | Movement | DECIDE |
| `payment_record` | Record payment | DECIDE + Phase 5 API |
| `payment_refund` | Refund | DECIDE |
| `tools_id_cards` | ID cards | DECIDE |
| `reports_hub` | Reports | WEB-ONLY → `open_on_web` |
| `settings_hub` | Settings | WEB-ONLY → `open_on_web` |
| `fee_plan_builder` | Fee plans | WEB-ONLY |
| `form_builder` | Forms | WEB-ONLY |
| `campaign_builder` | Email campaigns | WEB-ONLY |
| `access_control` | Roles/permissions | WEB-ONLY |

### 5.5 Parent screens (P0–P1)

| Screen ID | Title | Web module | Priority |
|-----------|-------|------------|----------|
| `parent_timeline` | Timeline | timeline | P0 |
| `parent_timeline_comments` | Comments | timeline comments | P0 |
| `parent_messages` | Messages | messages | P0 |
| `parent_calendar` | School Calendar | school-calendar | P0 |
| `parent_invoices` | Invoices | student-invoices | P0 |
| `parent_invoice_detail` | Invoice detail | invoices | P0 |
| `parent_invoice_pdf` | Invoice PDF | preview/download | P0 |
| `parent_receipt_pdf` | Receipt PDF | receipt preview | P1 |
| `parent_lessons` | Lessons | lessons | P1 |
| `parent_profile` | Profile | profile | P1 |
| `parent_resources` | Resources | resource-center | P1 |
| `parent_support` | Support | support | P2 |
| `parent_pay` | Pay Now | invoices | DECIDE |

### 5.6 Screen count summary

| Bucket | Count (approx.) |
|--------|-----------------|
| Auth / shell / shared | 12 |
| Staff P0 | 22 |
| Staff P1 | 14 |
| Staff P2 / web-CTA | 12 |
| Parent P0–P2 | 13 |
| **Total Flutter screens (planned inventory)** | **~73** |
| Of which P0 build-first | **~35** |

---

## 6. Role × Mobile Feature Matrix

| Feature area | ADMIN | FINANCE | LEADER | TEACHER | PARENT |
|--------------|------:|--------:|-------:|--------:|-------:|
| Staff Home dashboard | ✓ | ✓ | ✓ | ✓ | — |
| Student attendance | ✓ | ? | ✓ | ✓ | — |
| Staff attendance | ✓ | ? | ✓ | ? | — |
| Leaves | ✓ | ? | ✓ | ✓ | — |
| Messages | ✓ | ✓ | ✓ | ✓ | ✓ |
| Activities / notes / concerns | ✓ | ? | ✓ | ✓ | — (consume via timeline) |
| Students list/detail | ✓ | ✓ | ✓ | ✓ | — (own children) |
| Invoices / PDF | ✓ | ✓ | ? | — | ✓ |
| Record payment | ✓ | ✓ | — | — | DECIDE pay |
| Enquiries / tasks | ✓ | ✓ | ✓ | — | — |
| Calendar | ✓ | ? | ✓ | ✓ | ✓ |
| Observations | ✓ | — | ? | ✓ | — |
| Settings / AC / Reports / Builders | Web CTA | Web CTA | Web CTA | — | — |
| Timeline / Lessons / Resources | — | — | — | — | ✓ |

`?` = only if permission IDs granted (do not assume from role name alone).  
`—` = not in mobile nav for that persona.

---

## 7. Phase 2 → Phase 3 handoff checklist

Before UI/UX design (Phase 3), product should confirm:

1. [ ] Single app vs Staff + Parent apps  
2. [ ] Record Payment / Refund on mobile: yes / no / Phase 5 only  
3. [ ] Parent Pay Now: yes / no / needs gateway  
4. [ ] Program Movement on mobile: yes / no  
5. [ ] Multi-center switcher on mobile: yes / no  
6. [ ] Teacher vs Senior/Head Teacher: same mobile nav or differentiated  
7. [ ] P0 scope lock: Teacher + Parent + Finance view (recommended)

---

## 8. Explicit non-goals of Phase 2

- No Flutter widgets, themes, or navigation code  
- No Figma/UI mock production (Phase 3)  
- No API client generation (Phase 5)  
- No changes to the web app  

---

## 9. Recommended Phase 3 starting set (after product confirms §7)

**Design first:**
1. Parent app: Timeline, Messages, Calendar, Invoices (+ PDF)  
2. Teacher app: Home, Student Attendance, Messages, Classroom (activities), More  
3. Finance app: Home, Invoices, Invoice Detail, PDF/Receipt preview  

**Design later:** Leader/Admin shells as overlays on Teacher + Finance + Enquiries.

---

**Document owner:** Phase 2 output for Flutter planning  
**Next document (Phase 3):** Flutter UI/UX Design Spec (when requested)
