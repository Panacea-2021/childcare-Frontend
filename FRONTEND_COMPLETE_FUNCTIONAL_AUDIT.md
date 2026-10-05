# FRONTEND APPLICATION — COMPLETE FUNCTIONAL AUDIT

**Project:** ChilldCare_FrontEnd (Panacea Childcare)  
**Audit date:** 2026-08-24  
**Mode:** Read-only code audit — no application files were modified  
**Scope:** Entire frontend repository, with depth on Admin (`src/app/(app)`), plus Parent portal and Marketing for inventory completeness  

**Evidence rule:** Only functionality confirmed in source code is stated. Gaps are marked `NOT CONFIRMED FROM FRONTEND CODE`.

---

## 1. Executive Summary

This frontend is a **Next.js 15 App Router** application for **Panacea** childcare SaaS. It contains three product surfaces:

1. **Admin / Staff app** — primary operational product (`/(app)/*`, ~121 page routes)
2. **Parent portal** — separate auth + shell (`/(parent)/parent/*`, 14 page routes)
3. **Marketing / public site** — landing, features, pricing, resources, product guide

**Critical architectural finding:** Almost all Admin and Parent operational data is **client-side** (`localStorage` stores + mock seeds). There is **no JWT**, **no Next.js middleware auth**, and **only one optional real HTTP API call** (parent OTP send when `NEXT_PUBLIC_API_URL` is set). RBAC exists as a rich **local permission catalog (~195 IDs)** with route/nav filtering, but **fine-grained action checks are sparse**.

| Metric | Count (approx.) |
|--------|-----------------|
| Admin nav modules (`APP_MODULES`) | 19 top-level entries |
| Admin page routes `(app)` | 121 |
| Parent page routes | 14 |
| Access-control roles (catalog) | 8 |
| Staff assignable roles | 9 (+ Super User alias) |
| Permission IDs (catalog) | ~195 |
| Real backend HTTP endpoints called | 1 (optional) |
| `*Store.ts` data stores | ~45 (all local / mock) |

**Implication for Flutter:** Treat the current frontend as a **high-fidelity product prototype / UI + domain model reference**, not as a backend-integrated production admin. Mobile work must assume a **future API contract** unless a separate backend audit confirms live endpoints.

---

## 2. Technology Stack

| Layer | Technology | Evidence |
|-------|------------|----------|
| Framework | Next.js `^15.5.22` (App Router) | `package.json` |
| UI | React `^19`, TypeScript `5.8.2` | `package.json` |
| Forms | `react-hook-form` + `zod` (mainly Enquiries); elsewhere `useState` | enquiries schemas; other modules |
| Validation | Zod `^4.4.3`, `@hookform/resolvers` | `package.json` |
| Charts | `recharts` | Dashboard / reports |
| Motion | `framer-motion` | Landing + some admin UI |
| PDF | `@react-pdf/renderer`, `jspdf`, `pdfjs-dist` | Billing invoices/receipts; attendance; enquiries |
| Excel | `xlsx` | Enquiry import/export; bulk upload parsers |
| DnD | `@dnd-kit/*` | Boards / builders |
| Icons | `lucide-react` | Throughout |
| Package manager | npm | `package.json` |
| State | React state + Context (`AuthorizationProvider`) + **localStorage stores** — **no Redux / Zustand / React Query** | codebase search |
| HTTP | Bare `fetch` via `apiGet` only | `src/lib/api.ts` |

**NOT CONFIRMED FROM FRONTEND CODE:** GraphQL, RTK Query, axios, server actions for CRUD, WebSockets.

---

## 3. Project Architecture

```
src/
  app/
    (app)/          → Admin shell (AuthorizationProvider + AppShell + RouteGuard)
    (parent)/       → Parent shell (ParentAppShell)
    login/, verify-otp/, select-student/
    features/, pricing/, resources/, … → Marketing
  components/
    app/            → AppShell, Dashboard
    auth/           → RouteGuard, AuthorizationProvider, AccessDenied, Login
    modules/        → Admin feature UIs
    parent/         → Parent portal UIs
    parent-communication/, progress-tracking/, reports/, landing/
  lib/
    access-control/ → Catalog, roles→perms, route/nav rules, authz helpers
    *-Store.ts      → Domain persistence (localStorage)
    auth.ts, parent-auth/, staff-auth/
    api.ts          → Single apiGet helper
```

| Concern | Implementation |
|---------|----------------|
| Entry (admin) | `src/app/(app)/layout.tsx` wraps pages |
| Navigation | `src/lib/modules.ts` → `APP_MODULES` → `AppShell` sidebar |
| Auth session (staff) | `localStorage['panacea_auth']` (`src/lib/auth.ts`) |
| Auth session (parent) | `localStorage['panacea_parent_auth']` |
| Permissions | `panacea.ac.rolePermissions` + `fetchMePermissions()` |
| Route protection | Client `RouteGuard` + `pathAllows()` — **not** middleware |
| Organization scope | Center switcher / `organization/*` helpers |

---

## 4. Complete Module Inventory

### 4.1 Admin navigation modules (`APP_MODULES`)

| Module id | Label | Parent | Submodules | Primary routes | Status |
|-----------|-------|--------|------------|----------------|--------|
| `dashboard` | Dashboard | — | — | `/dashboard` | FULLY IMPLEMENTED (UI + local widgets) |
| `center-management` | Center Management | — | students, staff, rooms, groups, labels, email-templates | `/center-management/*` | FULLY IMPLEMENTED (local stores) |
| `program` | Program | — | list, dashboard, movement | `/program/*` | FULLY IMPLEMENTED (local) |
| `attendance-leaves` | Attendance & Leaves | — | student/staff att, ratio, forecast | `/attendance-leaves/*` | FULLY IMPLEMENTED (local) |
| `parent-communication` | Parent Communication | — | activities, daily-reports, notes, concerns, newsletters, resource-center | `/parent-communication/*` | FULLY IMPLEMENTED (mock/local) |
| `messages` | Messages | — | parent, staff, announcement | `/messages/*` | FULLY IMPLEMENTED (local) |
| `billing-accounting` | Billing & Accounting | — | dashboard, invoices, balances, payments, fee-plan, fee-reminders | `/billing-accounting/*` | FULLY / fee-reminders PARTIAL |
| `enquiries` | Enquiries | — | dashboard, list, tasks, forms, automations, email campaigns, facebook, whatsapp | `/enquiries/*`, `/tasks` | FULLY / FB+WA PARTIAL (coming soon) |
| `calendar` | Calendar | — | staff/student schedule, holidays, birthday, school, meals | `/calendar/*` | FULLY IMPLEMENTED (local) |
| `progress-tracking` | Progress Tracking | — | grid, student progress, lesson plan, mapping, boards, observations, journey | `/progress-tracking/*` | FULLY IMPLEMENTED (mock/local) |
| `learning-assessment` | Learning & Assessment | — | lessons, assessments, curriculum, manage | `/learning-assessment/*` | FULLY IMPLEMENTED (local) |
| `forms` | Forms | — | all forms, admission process | `/forms/*` | FULLY IMPLEMENTED (local) |
| `tools` | Tools | — | id-cards, certificates | `/tools/*` | FULLY IMPLEMENTED (local) |
| `reports` | Reports | — | *(nav `hasChildren: true` but no children in config)* | `/reports` | FULLY IMPLEMENTED (catalog of generators) |
| `settings` | Settings | — | 15 `?section=` children | `/settings?section=` | FULLY IMPLEMENTED (local settings UIs) |
| `help` | Help | — | product-guide, support | `/help?section=` | PARTIALLY IMPLEMENTED |
| `language` | Language | — | — | `/language` | UI ONLY |
| `profile` | Profile | — | — | `/profile` | FULLY / some tabs PARTIAL |
| `notifications` | Notifications | — | — | `/notifications` | FULLY IMPLEMENTED (local) |

### 4.2 Extra admin surfaces (not primary nav leaves)

| Surface | Route(s) | Status |
|---------|----------|--------|
| Get Started | `/get-started` | FULLY (local) |
| Onboarding | `/onboarding` | FULLY (local) |
| Premium Features | `/premium-features` | FULLY (upsell UI) |
| My Account | `/my-account` | FULLY |
| Notification Preferences | `/notification-preferences` | FULLY |
| Reset Password (in-app) | `/reset-password` | FULLY (demo validation) |
| Tour aliases | `/appointments/*`, `/tour-management` → enquiries tour | Redirects |

### 4.3 Parent portal modules

| Area | Routes | Status |
|------|--------|--------|
| Home / Timeline | `/parent`, `/parent/timeline`, comments | FULLY (local) |
| Messages | `/parent/messages` | FULLY (local) |
| Calendar | `/parent/calendar` | FULLY (local) |
| Lessons | `/parent/lessons` | FULLY (local) |
| Invoices | `/parent/invoices`, `/parent/profile/invoices/[invoiceId]` | FULLY (local / mapped PDFs) |
| Resources / Support | `/parent/resources`, `/parent/support` | FULLY / PARTIAL |
| Profile / Notifications / Prefs / Reset | related `/parent/*` | FULLY (local) |

### 4.4 Marketing / public

Landing pages under `/`, `/about`, `/pricing`, `/features/*`, `/resources/*`, `/book-demo`, Product Guide `/resources/product-guide/*`, etc. — **marketing UI**, not admin RBAC.

---

## 5. Complete Route Inventory

### 5.1 Access control pattern

```text
File: src/components/auth/RouteGuard.tsx
Function: RouteGuard
Evidence: pathAllows(pathname, permissions, searchParams) → AccessDenied if false

File: src/lib/access-control/routePermissions.ts
Function: pathAllows
Evidence: unmatched paths return true (allow) — “refine later”
```

### 5.2 Admin routes (summary)

| Route pattern | Page/Component area | Module | Access (`anyOf`) | Status |
|---------------|---------------------|--------|------------------|--------|
| `/dashboard` | `DashboardHome` | Dashboard | authenticated only | FULLY |
| `/center-management/students*` | Students / profile | CM | `cm-students-view-page`, `cm-stu-view` | FULLY |
| `/center-management/staff*` | Staff | CM | `cm-staff-view` | FULLY |
| `/center-management/rooms` | Rooms | CM | rooms create/delete/rename | FULLY |
| `/center-management/groups` | Groups | CM | groups create/delete | FULLY |
| `/center-management/labels` | Labels | CM | `cm-ac-settings` | FULLY |
| `/center-management/email-templates` | Email templates | CM | email-templates + settings | FULLY |
| `/program*` | Program pages | Program | `prog-*` | FULLY |
| `/attendance-leaves/*` | Attendance pages | Attendance | `sa-*` / `sta-*` / `sl-*` / `stl-*` | FULLY |
| `/parent-communication/*` | PC pages | PC | `pc-*` / resource | FULLY |
| `/messages/*` | Messages | Messages | `msg-*` | FULLY |
| `/billing-accounting/*` | Billing | Billing | `bill-*` | FULLY / PARTIAL |
| `/enquiries/*`, `/tasks` | Enquiries | Enquiries | `enq-*` / tour | FULLY / PARTIAL |
| `/calendar/*` | Calendar | Calendar | `cal-*` | FULLY |
| `/progress-tracking/*` | Progress | Progress | `as-*` / `les-plan-*` | FULLY |
| `/learning-assessment/*` | Learning | Learning | `les-*` / `as-*` | FULLY |
| `/forms*` | Forms | Forms | `form-stu-*` / `form-stf-*` | FULLY |
| `/tools*` | Tools | Tools | `tools-id-cards`, `tools-certificates` | FULLY |
| `/reports` | Reports | Reports | `rep-*` | FULLY |
| `/settings` | Settings | Settings | section map | FULLY |
| `/help`, `/language`, `/profile`, `/notifications` | Self-service | — | authenticated or unmatched allow | varies |
| `/get-started`, `/onboarding`, `/premium-features`, `/my-account`, `/notification-preferences` | Extra | — | often **unmatched → allow** | FULLY UI |

**Enumerated count:** 121 `page.tsx` files under `src/app/(app)` including create/edit/detail dynamic segments (students, staff, invoices, fee-plan, campaigns, forms, progress boards, etc.).

### 5.3 Parent routes

| Route | Access | Status |
|-------|--------|--------|
| `/parent/*` (14 pages) | `isParentVerified()` in ParentAppShell | FULLY (local) |

### 5.4 Public auth routes

| Route | Purpose |
|-------|---------|
| `/login` | Staff/parent login entry |
| `/verify-otp` | OTP verification |
| `/select-student` | Parent student selection |

---

## 6. Authentication Architecture

### 6.1 Staff

| Capability | Status | Evidence |
|------------|--------|----------|
| Phone OTP login | FULLY (local OTP) | `staff-auth/otp.ts`, `/verify-otp` |
| Email+password as staff | NOT staff path | Email login uses `startParentEmailLogin` |
| Google / Microsoft | DEMO ONLY | `completeStaffLogin` with demo identifiers |
| Session storage | `panacea_auth` localStorage | `auth.ts` |
| JWT / refresh | **NOT CONFIRMED** | No token code |
| Middleware protection | **NOT CONFIRMED** | No `middleware.ts` |
| Logout | Clears session → `/login` | `AuthorizationProvider`, `AppShell` |
| Forgot password | Toast only | LoginForm |
| Reset password page | Demo old password `Welcome@123` | `/reset-password` |

### 6.2 Parent

| Capability | Status | Evidence |
|------------|--------|----------|
| Email + password | Demo password `Parent@123` | `parent-auth/otp.ts` |
| Phone OTP | Local challenge; optional HTTP send | `tryApiSendOtp` |
| Session | `panacea_parent_auth` | `parent-auth/session.ts` |
| Guard | Redirect `/login` if unverified | `ParentAppShell` |

### 6.3 Optional real API

```text
File: src/lib/api.ts + src/lib/parent-auth/otp.ts
API: GET {NEXT_PUBLIC_API_URL}/auth/parent/otp/send?email=...
Status: FRONTEND API CALL CONFIRMED — BACKEND IMPLEMENTATION NOT VERIFIED
Note: Skipped when NEXT_PUBLIC_API_URL unset → local OTP
```

---

## 7. RBAC Architecture

```
Staff session → resolve staff from staffStore
  → normalizeAccessRoleName(role)
  → getRolePermissions(role) from localStorage panacea.ac.rolePermissions
  → MePermissionsPayload.permissions[]
  → filterModulesByPermissions (sidebar)
  → RouteGuard / pathAllows (pages)
  → sparse PermissionGate / can() / authorizeMutation (actions)
```

| Layer | File | Behavior |
|-------|------|----------|
| Catalog | `access-control/catalog.ts` | Categories, permission IDs, defaultCheckedForRole |
| Persistence | `rolePermissionStore.ts` | Seed + edit role→perm sets |
| Me API mock | `mePermissions.ts` | Local stand-in for `GET /api/v1/me/permissions` |
| Nav | `modulePermissions.ts` | Hide modules without ANY required perm |
| Routes | `routePermissions.ts` | ANY of listed perms; unknown path **allows** |
| UI gate | `PermissionGate.tsx` | permission / anyOf / allOf |
| Mutation authz | `apiAuthorize.ts` | Client-side 401/403 style results + toast |

**Parallel system:** Student/Staff leave panels also store role matrices in leave stores — **not unified** with catalog `PermissionGate`.

---

## 8. Role Inventory

### 8.1 Access Control catalog roles

| Role Name | Role Code | Source | Notes |
|-----------|-----------|--------|-------|
| Finance Admin | `Finance Admin` | `catalog.ts` | Large default permission set |
| Super Admin | `Super Admin` | `catalog.ts` | All permissions |
| Administrator | `Administrator` | `catalog.ts` | All permissions |
| Principal | `Principal` | `catalog.ts` | Default: `view`-containing IDs |
| Center Head | `Center Head` | `catalog.ts` | Default: view-* |
| Teacher | `Teacher` | `catalog.ts` | Teacher-family defaults |
| Senior Teacher | `Senior Teacher` | `catalog.ts` | Teacher-family defaults |
| Head Teacher | `Head Teacher` | `catalog.ts` | Teacher-family defaults |

### 8.2 Staff profile roles (`STAFF_ROLES`)

Same names as above plus **`Super User`** (normalized → Super Admin via `normalizeAccessRoleName`).

**Numeric/UUID role codes from backend:** `NOT CONFIRMED FROM FRONTEND CODE` (roleId = role name string).

---

## 9. Permission Inventory

**Source:** `ACCESS_CONTROL_CATEGORIES` in `src/lib/access-control/catalog.ts`  
**Aggregate:** `ALL_PERMISSION_IDS` (~195 IDs)

### Categories (module keys)

| Category id | Label | Example permission codes |
|-------------|-------|--------------------------|
| `center-management` | Center Management | `cm-staff-view`, `cm-stu-add`, `cm-rooms-create`, `cm-ac-settings`, … |
| `student-attendance` | Student Attendance | `sa-record`, `sa-update`, `sl-view`, `sl-approve`, … |
| `staff-attendance` | Staff Attendance | `sta-record`, `stl-approve`, … |
| `messages` | Messages | `msg-parent-send`, `msg-staff-announce`, … |
| `calendar` | Calendar | `cal-view`, `cal-ss-edit`, … |
| `billing` | Billing | `bill-view-module`, `bill-inv-create`, `bill-record-payment`, … |
| `assessment` | Assessment | `as-view`, `as-add-obs`, `as-view-journey`, … |
| `ai-features` | AI features | `ai-use`, `ai-configure` |
| `lessons` | Lessons | `les-view`, `les-plan-edit`, … |
| `programs` | Programs | `prog-view`, `prog-assign`, … |
| `enquiries` | Enquiries | `enq-view`, `enq-form-*`, `enq-wa-*`, `enq-fb-configure` |
| `safety` | Safety | `safe-cctv`, `safe-bus-view`, `safe-bus-edit` |
| `parent-communication` | Parent communication | `pc-post-*`, `pc-notes-*`, `pc-concern-*`, `pc-nl-*` |
| `tour-management` | Tour Management | `tour-appt-*`, `tour-cal-*`, … |
| `forms` | Forms | `form-stu-*`, `form-stf-*` |
| `tools` | Tools | `tools-id-cards`, `tools-certificates` |
| `multi-center` | Multi Center | `mc-view`, `mc-switch`, `mc-edit` |
| `reports` | Reports | `rep-stu-att`, `rep-billing`, … |

**Empty permission groups in catalog (no IDs):** `subsidy`, `quickbooks`, `learning-journey`, `enq-sms`, `enq-phone-calls`, `daily-report`.

---

## 10. Role × Permission Matrix

Defaults from `defaultCheckedForRole` (before Settings overrides in localStorage):

| Role | Default rule (code) |
|------|---------------------|
| Super Admin / Administrator | **All** `ALL_PERMISSION_IDS` |
| Finance Admin | Explicit large curated Set (~130) |
| Teacher / Senior Teacher / Head Teacher | IDs containing `view` ∪ prefixes `sa-`/`sl-`/`msg-`/`cal-`/`les-`/`pc-` |
| Principal / Center Head / others | IDs containing `view` |

**Runtime matrix after Settings edits:** stored per role in `panacea.ac.rolePermissions` — **environment-specific**; cannot hard-code a final ✓/— matrix from static files alone for every cell.

| Module access (route ANY) | Super Admin* | Teacher* | Finance Admin* |
|---------------------------|-------------:|---------:|---------------:|
| Dashboard | ✓ | ✓ | ✓ |
| Students list | ✓ | ? | ✓ (typical defaults) |
| Staff edit/delete buttons | ✓ | — (unless granted) | ? |
| Billing invoices | ✓ | ? | ✓ (typical) |
| AI features routes | ? | ? | ? |

\*After defaults; Settings can change. `?` = depends on seeded/edited set — do not invent.

```text
File: src/lib/access-control/catalog.ts
Function: defaultCheckedForRole
Evidence: Super Admin/Administrator → all; Finance Admin → Set; teachers → filtered; else view-*
```

---

## 11. Screen-by-Screen Functionality

### 11.1 Dashboard `/dashboard`

- **Purpose:** Center KPIs, widgets, quick actions  
- **UI:** Cards, charts, feeds, permission-gated widgets (`PermissionGate`)  
- **Data:** Local / derived — **no HTTP inventory**  
- **Status:** FULLY IMPLEMENTED (frontend)

### 11.2 Center Management

| Screen | Actions confirmed | Status |
|--------|-------------------|--------|
| Students list | Search/filter, add student, open profile, bulk upload | FULLY |
| Student profile | Tabs (info, parents, billing, immunization, progress, messages, …) | FULLY / some niches PARTIAL |
| Staff list | View; edit/delete gated by `cm-staff-edit` / `cm-staff-delete` | FULLY |
| Staff add/edit | Full form + rooms/groups/shift | FULLY |
| Rooms / Groups / Labels | CRUD-style local operations | FULLY |
| Email templates | Template CRUD + automations UI | FULLY |
| Bulk student/staff upload | Parse CSV/XLSX, validate, import to store | FULLY (local) |

### 11.3 Program

- List / Dashboard / Movement — FULLY (local stores `programsStore`, `programAssignmentsStore`)

### 11.4 Attendance & Leaves

| Screen | Actions | Status |
|--------|---------|--------|
| Student / Staff attendance | Mark status, QR, PDF export | FULLY |
| Leaves panels | Create/edit/approve/deny | FULLY (local + dual RBAC matrices) |
| Ratio / Forecast | Views from stores | FULLY |
| Translate/Reports buttons | Toast “coming soon” | PLACEHOLDER |

### 11.5 Parent Communication

- Activities, notes, concerns, newsletters, resource center, daily reports — FULLY UI + mock/local  
- Unused stub: `ParentCommStubPage`

### 11.6 Messages

- Parent messages, staff messages, announcements — FULLY (local messaging stores)

### 11.7 Billing & Accounting

| Screen | CRUD / actions | Status |
|--------|----------------|--------|
| Dashboard | KPIs from invoice store | FULLY |
| Invoices list/detail | Create/edit/clone/cancel/delete, record payment, refund, PDF preview/download, reminders UI | FULLY (local) |
| Fee plan | Create/edit plans, components, discounts, tax | FULLY |
| Payments / Balances | Lists, credit/deposit history, allocation | FULLY |
| Customize PDF | Settings UI | PARTIAL — **settings not wired into live PDF generators** |
| Fee reminders | Mounts EmailTemplates with billing context | PARTIAL |

### 11.8 Enquiries

| Screen | Actions | Status |
|--------|---------|--------|
| List + Add/Edit modal | Zod-validated CRUD, stages/sources | FULLY |
| Dashboard | Pipeline stats | FULLY |
| Forms builder / PDF | Form builder, PDF export | FULLY |
| Marketing automations / email campaigns | CRUD + statuses | FULLY (local) |
| Tour appointments | CRUD + calendars | FULLY |
| Tasks `/tasks` | Task board/list | FULLY |
| Facebook / WhatsApp | UI marked Coming soon | PLACEHOLDER / COMING SOON |
| Excel import/export | xlsx + jsPDF | FULLY (local) |

### 11.9 Calendar / Progress / Learning / Forms / Tools / Reports / Settings

All present as deep interactive UIs backed by local/mock stores — classified **FULLY IMPLEMENTED (frontend)** with **Backend/API-dependent but implemented on frontend** for persistence (local only).

### 11.10 Help / Language / Profile / Notifications

| Screen | Status |
|--------|--------|
| Help product guide (in-app) | PARTIAL — “Full article content coming soon” toast in places |
| Language | UI ONLY — session preference demo |
| Profile | FULLY shell; some tabs COMING SOON |
| Notifications | FULLY (local) |

---

## 12. Form Inventory

### Validation approach

| Area | Approach |
|------|----------|
| Enquiries | Zod schemas + RHF — strongest typed validation |
| Most admin modules | Imperative `useState` + ad-hoc checks |

### Representative forms

| Form | Screen | Mode | Key fields (confirmed) |
|------|--------|------|------------------------|
| Add/Edit Enquiry | `AddEnquiryModal` | create/edit/view | studentName, stage, gender, DOB, contacts, parents, source, program, notes, customValues |
| Custom Field Builder | Enquiries | create/edit | label, type, required, options |
| Add Student | `StudentsPage` | create | name, preferredName, gender, status, admissionDate, roomId |
| Staff Form | `StaffFormScreen` | create/edit | name, dob, gender, email, phone, address, role, joiningDate, rooms, groups, shifts |
| Parent / Pickup / Emergency / Allergy | Student profile modals | create/edit | respective contact/medical fields |
| Create Invoice | `CreateInvoicePage` | create/edit/clone | students, dates, period, lines, discounts, notes, emailParent |
| Create Fee Plan | `CreateFeePlanPage` | create/edit | name, status, program, frequency, schedule, lines, students, taxMode |
| Record Payment | `RecordPaymentOverlay` | create | amount, mode, date, credit, reference, proof image |
| Refund | `RefundReceiptModals` | create | amount, mode, date, addAsCredit, reference |
| Student/Staff Leave | Leave panels | create/edit | type, from, to, reason, file |
| Tax / Fee Component / Discount | Billing modals | create/edit | name, rates, prices, codes |

**API Field mapping:** Store field names only — **no backend DTO mapping confirmed**.

---

## 13. API Inventory

| Method | Endpoint | Module | Purpose | Status |
|--------|----------|--------|---------|--------|
| GET | `{NEXT_PUBLIC_API_URL}/auth/parent/otp/send?email=` | Parent auth | Send OTP | FRONTEND CALL CONFIRMED — BACKEND NOT VERIFIED; skipped if env unset |
| — | `GET /api/v1/me/permissions` | Access control | Documented contract | **LOCAL ONLY** (`fetchMePermissions`) |
| GET | blob:/object URL | Invoice PdfViewer | Load PDF bytes | LOCAL |

**No** `apiPost` / `apiPut` / `apiDelete`. **No** Authorization headers.

All other CRUD persists via `*Store.ts` → `localStorage` (or in-memory for `activityLogStore`).

---

## 14. Data Table / List Inventory

| Pattern | Implementation |
|---------|----------------|
| Tables | Custom CSS tables (`ui-table` / module classes) — not a single shared DataTable package |
| Search | Client-side string filters (varies by page) |
| Filters | Status / room / date / stage dropdowns |
| Sort | Client-side column sorts where implemented |
| Pagination | Mix of client paging / “show more” — **server pagination NOT CONFIRMED** |
| Row actions | Menus: view/edit/delete/preview |
| Empty/loading | Module-specific empty states + skeletons |
| Export | CSV / XLSX / PDF from client |

Notable lists: Students, Staff, Invoices, Payments, Balances, Enquiries, Forms, Fee plans, Campaigns, Tasks, Reports catalog.

---

## 15. Search / Filter / Sort Functionality

| Module | Search | Filters | Sort | Server-side |
|--------|--------|---------|------|-------------|
| Students | Yes | Status, room, etc. | Client | No |
| Staff | Yes | Status/role | Client | No |
| Invoices | Yes | Status/kind | Client | No |
| Enquiries | Yes | Stage/source | Client | No |
| Parent invoices | Yes | paid/pending/overdue | Client | No |
| Reports | Catalog search | Category | Client | No |

Debouncing: used in some UIs (e.g. Product Guide marketing search); **not universal**.

---

## 16. Workflow & Status Analysis

| Module | Status values | Where changed |
|--------|---------------|---------------|
| Invoices | Due, Paid, Overdue, Pending, Upcoming, Draft, Refund, Cancelled | Payment/refund/cancel + `resolveCenterInvoiceStatus` |
| Fee plans | Active, Completed, Draft, Paused | Fee plan editor |
| Students | Active, Inactive, On Hold, Withdrawn, Signed up, Transferred, Graduated | Profile / add form |
| Staff | Active, Inactive | Staff form |
| Labels | Active, Inactive | Labels page |
| Immunization doses | Done, Pending, Overdue, Exempt | Immunization tab |
| Leaves | Pending, Approved, Denied | Leave panels |
| Day attendance | pending, checked-in, checked-out, absent | Attendance pages |
| Enquiry stages | Stored, Admitted, Interested, Waitlisted, Lost (+ custom) | Enquiry modal |
| Enquiry forms | draft, published | Forms |
| Automations | Active, Draft, Paused | Marketing |
| Email campaigns | Draft, Scheduled, Sending, Sent, Paused, Failed | Campaigns |
| Progress records | draft, published | Progress create |

**Who can change:** Generally any authenticated user who can open the screen — **action-level permission rarely enforced** except Staff delete/edit and some dashboard widgets.

---

## 17. File Upload / Download Analysis

| Capability | Screens | Tech |
|------------|---------|------|
| Bulk CSV/XLSX import | Students bulk, Staff bulk, Enquiry import | `xlsx`, parsers |
| Image upload | Parent/pickup photos, payment proof, invoice logo, progress media | FileReader / accept image |
| Document upload | Immunization docs, leave files, notes media | accept pdf/doc/image |
| Invoice/Receipt PDF | Billing + Parent | `@react-pdf/renderer` |
| Deposit/Credit PDF | Balances history | `jspdf` |
| Attendance PDF / QR PNG | Attendance pages | `jspdf`, canvas/QR |
| Enquiry PDF / Excel | Enquiries | `jspdf`, `xlsx` |
| Cloud storage (S3 etc.) | — | **NOT CONFIRMED** |

---

## 18. Notification & Feedback Analysis

| Mechanism | Pattern |
|-----------|---------|
| Toasts | Local `useState` + CSS classes (`cm-toast`, `bi-toast`, `enq-toast`, `InvoiceActionToast`, …) — **no shared toast library** |
| Confirmations | Modal confirmations for delete/cancel |
| Access denied | `AccessDenied` component |
| Loading | Skeletons / spinners per module |
| Empty states | Per-module |
| `uiOverlay` | Modal/Drawer scroll lock only — not notifications |

---

## 19. Dashboard Analysis

| Dashboard | Location | Role-specific? |
|-----------|----------|----------------|
| Admin Dashboard | `/dashboard` | Yes — widgets via `PermissionGate` / `hasAnyPermission` |
| Billing Dashboard | `/billing-accounting` | Route-gated by billing perms |
| Enquiries Dashboard | `/enquiries/dashboard` | Route-gated |
| Program Dashboard | `/program/dashboard` | Route-gated |
| All-centers dashboard helpers | `organization/allCentersDashboard.ts` | Center scope |

Charts use Recharts; data from local stores.

---

## 20. Settings Analysis

Single route `/settings?section=…`:

| Section id | Purpose | Typical perm |
|------------|---------|--------------|
| programs | Program settings | `cm-ac-settings`, `prog-view` |
| access-control | Edit role→permission checkboxes | `cm-ac-settings` (+ save authz) |
| roles | Role list UI | `cm-ac-settings` |
| activity-posts / attendance / billing / forms / lesson | Domain settings | settings + domain view keys |
| bus-tracking / cctv | Safety settings | `safe-bus-*`, `safe-cctv` |
| staff-leave-management | Leave policies | `stl-view` + settings |
| school-details / vaccine-library / email-templates / other-settings | Org config | `cm-ac-settings` / email |

**System vs org vs user:** All frontend-local; **no server settings API confirmed**.

---

## 21. Shared Components

| Component | Path | Role |
|-----------|------|------|
| `AppShell` | `components/app/AppShell.tsx` | Admin chrome |
| `RouteGuard` / `AccessDenied` / `AuthorizationProvider` / `PermissionGate` | `components/auth/*` | Authz |
| `Modal` / `Drawer` | shared UI | Overlays (+ `uiOverlay`) |
| Design system classes | `globals.css` (`ui-btn`, `ui-input`, `ui-table`, …) | Panacea DS |
| `CenterSwitcher` | organization | Multi-center UI |
| Invoice PDF stack | `billing-accounting/invoice-pdf/*` | Shared staff/parent PDF |
| ChatWidget | landing/help | FAB chat |

**No** single generic `DataTable` / `FormBuilder` framework package — module-local implementations.

---

## 22. Dependencies Between Modules

```text
Organization / Center
  ↓
Students + Staff + Rooms + Groups
  ↓
Attendance / Leaves ← Rooms/Staff/Students
  ↓
Parent Communication / Messages ← Students/Parents
  ↓
Billing (Invoices, Fee Plans) ← Students / Programs / Labels
  ↓
Reports ← Attendance / Billing / Enquiries / Students

Programs ← Students assignments
Progress / Learning ← Students / Lessons
Enquiries → Tour → Admission Forms → Students (pipeline)
Settings Access Control → all module visibility
```

---

## 23. Fully Implemented Features

*(Frontend-complete flows with local persistence)*

- Dashboard widgets (permission-aware)
- Students / Staff / Rooms / Groups / Labels / Email templates (CRUD-style)
- Program list, dashboard, movement
- Student & staff attendance + leaves + ratio + forecast UIs
- Parent communication suite (mock/local)
- Messages (parent/staff/announcements)
- Billing: invoices, payments, balances, fee plans, PDF invoice/receipt generation
- Enquiries CRM (list, stages, sources, forms, campaigns, tour, tasks)
- Calendar suite
- Progress tracking + learning/assessment + forms + tools + reports catalog
- Settings sections including Access Control editor
- Parent portal (timeline, messages, invoices PDF, calendar, lessons)
- Marketing site + Product Guide

---

## 24. Partially Implemented Features

| Feature | Gap |
|---------|-----|
| Fee Reminders nav item | Reuses Email Templates; not dedicated reminder product |
| Invoice PDF Customize | Settings UI not applied by live PDF documents |
| Help Product Guide (in-app) | Some content “coming soon” |
| Profile tabs | Some sections marked coming soon |
| Action-level RBAC | Catalog rich; most pages not gated beyond route |
| Parent OTP HTTP | Optional; falls back to local |
| `me/permissions` | Local mock of future API |

---

## 25. UI-Only Features

| Feature | Evidence |
|---------|----------|
| Language page | Local preference demo (~minimal) |
| Social login | Demo identity binding |
| Forgot password | Toast only |

---

## 26. Placeholder / Coming Soon Features

| Feature | Evidence |
|---------|----------|
| WhatsApp / Facebook enquiry integrations | Explicit Coming soon UIs |
| Attendance Translate / Reports toasts | Placeholder toasts |
| Voice recording (message parents) | Coming soon |
| Suggestions/Translate/Emoji in editors | Coming soon |
| Unused stubs | `ComingSoonPage`, `ParentCommStubPage`, `AttendancePlaceholderPage`, `CalendarSubPlaceholder` (not mounted by routes) |
| Empty catalog groups | Subsidy, Quickbooks, SMS, Phone Calls, Daily Report perms empty |

---

## 27. Unused / Potentially Deprecated Functionality

| Item | Notes |
|------|-------|
| Stub placeholder pages | Present but unused by routes |
| `ParentCommunicationPage` legacy | Not hub route |
| `/appointments`, `/tour-management` | Redirect aliases |
| Many catalog permission IDs | No route rule and no `PermissionGate` usage found |
| `ai-use` / `ai-configure` / `mc-*` | Weak or no route wiring found |
| `authorization.selftest.ts` | Not a CI suite by itself |
| Customize PDF settings store | Not consumed by PDF generators |

---

## 28. Preliminary Web vs Mobile Classification

> Preliminary only — not a product decision.

| Classification | Examples |
|----------------|----------|
| **MOBILE CANDIDATE** | Attendance mark, leaves approve, messages, parent timeline, parent invoices view/pay, notifications, student quick profile, enquiry quick add, QR check-in |
| **WEB + MOBILE** | Dashboard KPIs (simplified), invoice view/download, calendar day view, concerns/notes |
| **WEB-OPTIMIZED** | Fee plan builder, enquiry form builder, email campaign builder, reports catalog, rooms capacity UI, progress boards |
| **WEB-ONLY CANDIDATE** | Access Control matrix, bulk Excel import, PDF customize, marketing automations, multi-column reports, settings bus/CCTV dense config |
| **NEEDS PRODUCT DECISION** | Billing record payment + refunds, program movement, full student profile editing, tools ID cards |

---

## 29. Role-Specific Mobile Candidates

### ROLE: Super Admin / Administrator

**Existing web:** All modules (default all permissions)  
**Potential mobile:** Ops dashboards, attendance, messaging, approvals, billing glance  
**Potential web only:** Access control editor, bulk imports, builders  
**Needs decision:** Full billing CRUD on mobile

### ROLE: Finance Admin

**Existing web:** Broad billing + many modules (large default set)  
**Potential mobile:** Invoices list, record payment, balances, reminders  
**Potential web only:** Fee plan structure, tax/discount setup, PDF customize  
**Needs decision:** Refunds / debit notes on mobile

### ROLE: Principal / Center Head

**Existing web:** Default view-* heavy  
**Potential mobile:** Dashboard, attendance overview, enquiries pipeline, messages  
**Potential web only:** Deep settings, builders  
**Needs decision:** Edit permissions beyond view

### ROLE: Teacher / Senior Teacher / Head Teacher

**Existing web:** Attendance, messages, calendar, lessons, parent communication (defaults)  
**Potential mobile:** Attendance, leaves, messages, activities/posts, observations  
**Potential web only:** Lesson plan mapping boards, curriculum admin  
**Needs decision:** Assessment create vs view-only

### ROLE: Parent (portal — not in AC catalog)

**Existing web:** Timeline, messages, calendar, lessons, invoices, resources  
**Potential mobile:** **Primary** — high frequency parent workflows  
**Potential web only:** Dense invoice history tables  
**Needs decision:** Payment gateway integration (not confirmed in frontend)

---

## 30. Web-Only Candidate Features

- Settings → Access Control / Roles matrix  
- Bulk student/staff Excel import  
- Enquiry Form Builder + PDF form designer  
- Email Campaign builder + automation graphs  
- Invoice PDF customization studio  
- Reports with wide multi-column exports  
- Fee plan schedule engine UI  
- Rooms/groups advanced capacity configuration  

---

## 31. Features Requiring Product Decision

1. Whether Flutter Admin talks to a **new backend** vs continuing local demo  
2. Action-level RBAC parity (today mostly route-level)  
3. Parent payments: UI exists; **gateway NOT CONFIRMED**  
4. Multi-center (`mc-*`) vs single-center mobile scope  
5. AI features (`ai-use`) — catalog only / weak wiring  
6. Facebook/WhatsApp — ship or defer  
7. In-app Help vs marketing Product Guide as source of truth  

---

## 32. Master Module × Screen × Role × Permission × API Matrix

| Module | Submodule / Screen | Route | Roles | Permissions (route ANY) | APIs | CRUD | Status | Mobile |
|--------|-------------------|-------|-------|-------------------------|------|------|--------|--------|
| Dashboard | Home | `/dashboard` | authenticated | (none) | LOCAL | R | FULLY | WEB+MOBILE |
| CM | Students | `/center-management/students` | AC roles w/ perms | `cm-students-view-page`, `cm-stu-view` | LOCAL | CRUD | FULLY | WEB+MOBILE |
| CM | Student detail | `/center-management/students/[id]` | same | same | LOCAL | RU | FULLY | WEB-OPTIMIZED |
| CM | Staff | `/center-management/staff` | + action gates | `cm-staff-view` (+ edit/delete) | LOCAL | CRUD | FULLY | WEB+MOBILE |
| CM | Rooms/Groups/Labels/Email | respective | AC | rooms/groups/settings/email | LOCAL | CRUD | FULLY | WEB-OPTIMIZED |
| Program | List/Dash/Movement | `/program*` | AC | `prog-*` | LOCAL | CRUD | FULLY | NEEDS DECISION |
| Attendance | Student/Staff/Leaves | `/attendance-leaves/*` | AC | `sa-*`/`sta-*`/`sl-*`/`stl-*` | LOCAL | CRUD | FULLY | MOBILE CANDIDATE |
| PC | Activities…Resource | `/parent-communication/*` | AC | `pc-*` | LOCAL | CRUD | FULLY | MOBILE CANDIDATE |
| Messages | Parent/Staff/Announce | `/messages/*` | AC | `msg-*` | LOCAL | CRUD | FULLY | MOBILE CANDIDATE |
| Billing | Invoices/Payments/… | `/billing-accounting/*` | AC | `bill-*` | LOCAL | CRUD | FULLY/PARTIAL | NEEDS DECISION |
| Enquiries | CRM + Tour + Tasks | `/enquiries*`, `/tasks` | AC | `enq-*`, tour | LOCAL | CRUD | FULLY/PARTIAL | WEB+MOBILE |
| Calendar | Schedules/Meals/… | `/calendar/*` | AC | `cal-*` | LOCAL | CRUD | FULLY | WEB+MOBILE |
| Progress | Grid…Journey | `/progress-tracking/*` | AC | `as-*`, `les-plan-*` | LOCAL | CRUD | FULLY | WEB-OPTIMIZED |
| Learning | Lessons/Assess/… | `/learning-assessment/*` | AC | `les-*`, `as-*` | LOCAL | CRUD | FULLY | WEB-OPTIMIZED |
| Forms | All/Admission | `/forms*` | AC | `form-*` | LOCAL | CRUD | FULLY | WEB-ONLY CANDIDATE |
| Tools | ID/Certificates | `/tools*` | AC | `tools-*` | LOCAL | CRUD | FULLY | NEEDS DECISION |
| Reports | Catalog | `/reports` | AC | `rep-*` | LOCAL | R+Export | FULLY | WEB-ONLY CANDIDATE |
| Settings | Sections | `/settings` | AC | `cm-ac-settings`+ | LOCAL | RU | FULLY | WEB-ONLY CANDIDATE |
| Parent | Portal suite | `/parent/*` | Parent session | (no AC IDs) | LOCAL (+ optional OTP GET) | CRUD-ish | FULLY | MOBILE CANDIDATE |

---

## 33. Master Role × Permission Matrix

Static defaults (before localStorage overrides):

| Capability area | Super Admin | Administrator | Finance Admin | Principal | Center Head | Teacher* |
|-----------------|------------:|--------------:|--------------:|----------:|------------:|---------:|
| All permissions | ✓ | ✓ | — (subset) | — | — | — |
| View-* defaults | ✓ | ✓ | ✓ (many) | ✓ | ✓ | ✓ (subset) |
| Teacher-family prefixes | ✓ | ✓ | varies | — | — | ✓ |
| Editable in Settings UI | ✓† | ✓† | ✓† | ✓† | ✓† | ✓† |

\*Includes Senior/Head Teacher family defaults.  
†If user has `cm-ac-settings`.

**Exact cell-by-cell ✓/— after Settings:** `NOT CONFIRMED FROM FRONTEND CODE` for a given environment — read `panacea.ac.rolePermissions` at runtime.

---

## 34. Critical Findings

1. **No production backend integration** for admin CRUD — localStorage is the system of record.  
2. **No JWT / middleware** — security is client-side only.  
3. **RBAC catalog is sophisticated but under-enforced** at action level.  
4. **Unknown routes allow access** (`pathAllows` default true).  
5. **Staff email/password login is not the staff path** — phone OTP / social demo.  
6. **Parent and staff auth are isolated** (clearing each other on OTP start).  
7. **PDF invoice customize settings are orphaned** from generators.  
8. **Dual leave permission systems** (catalog vs leave store matrices).  

---

## 35. Missing / Incomplete Functionality

- Real REST/GraphQL APIs for modules  
- Token-based auth + refresh  
- Server-side authorization  
- Payment gateway for parent Pay Now  
- Live WhatsApp/Facebook integrations  
- Wired AI features  
- Server pagination / sync / conflict handling  
- Audit logs beyond in-memory activity log  
- Subsidy / Quickbooks groups (empty)  

---

## 36. Risks / Inconsistencies Found

| Risk | Detail |
|------|--------|
| Security | Session forgeable via DevTools |
| RBAC false sense | Fine permissions unused on most actions |
| Data loss | localStorage clears / multi-device diverge |
| Nav vs routes | Reports `hasChildren: true` with no children |
| Fee reminders | Misaligned with dedicated product expectation |
| Role aliases | Super User vs Super Admin |
| Custom roles in Settings | May not seed in `ACCESS_CONTROL_ROLES` cleanly |
| Marketing vs Admin Product Guide | Two help experiences |

---

## 37. Recommendations Before Flutter Development

1. **Backend API audit / contract first** — do not treat stores as production APIs.  
2. **Define mobile RBAC** from catalog IDs, then enforce server-side.  
3. **Close the route allow-by-default hole** before mirroring guards in Flutter.  
4. **Pick P0 mobile modules:** Parent portal + Teacher attendance/messaging + Finance invoice view.  
5. **Reuse domain models** (especially `CenterInvoice`, students, attendance statuses) as DTO seeds.  
6. **Defer builders** (forms, campaigns, fee-plan engine, access-control matrix) to web unless product mandates.  
7. **Resolve payment** (parent Pay Now) with product + backend before mobile billing.  
8. **Unify leave RBAC** with catalog permissions.  
9. **Document env**: `NEXT_PUBLIC_API_URL` behavior for OTP.  
10. **Use this audit as baseline**; version it when backend lands.

---

# Concise Summary

1. **Total modules found:** 19 admin nav modules + parent portal + marketing surfaces  
2. **Total screens/routes found:** ~121 admin pages + 14 parent + ~40 public/marketing (approx.)  
3. **Total roles found:** 8 catalog roles + staff roles (incl. Super User alias); Parent separate  
4. **Total permissions found:** ~195 catalog IDs  
5. **Total APIs found:** 1 optional real HTTP (`GET .../auth/parent/otp/send`); me/permissions local-only  
6. **Fully implemented (frontend):** Majority of admin/parent operational UIs (~most nav modules)  
7. **Partially implemented:** Fee reminders, PDF customize wiring, Help content, Profile tabs, action RBAC, OTP HTTP  
8. **UI-only:** Language page, social login demo, forgot-password toast  
9. **Placeholder/Coming Soon:** WhatsApp/Facebook, various toasts, unused stub pages, empty catalog groups  
10. **Potential Web-only:** Access control matrix, bulk import, builders, dense reports, PDF studio  
11. **Potential Mobile candidates:** Attendance, messages, parent portal, notifications, invoice view, enquiry quick actions  
12. **Major RBAC findings:** Rich local catalog; route/nav filtering; sparse button gates; unknown routes allowed; leave dual-system  
13. **Major inconsistencies:** localStorage-as-backend; customize PDF orphaned; Reports children empty; staff email login path  
14. **Major missing functionality:** Real APIs, JWT, server authz, payment gateway, live channel integrations  
15. **Top recommendations:** Backend contracts → mobile RBAC → P0 parent/teacher/finance flows → defer builders to web  

---

**Document status:** Complete for frontend-code evidence as of audit date.  
**Next phase (out of scope):** Mobile RBAC + Mobile Feature Classification + Flutter Screen Architecture.  
**No Flutter implementation was started. No application code was modified.**
