# Center Dashboard — Complete Functional Report (Flutter Design Spec)

**Source of truth:** Panacea frontend `DashboardHome` + `src/data/dashboard.ts`  
**Route:** `/dashboard`  
**Component:** `src/components/app/DashboardHome.tsx`  
**Data contract:** `src/data/dashboard.types.ts` → `DashboardBundle`  
**Data today:** Frontend mock (`DASHBOARD_DATA`) — **no live dashboard API**  
**Also referenced:** Illumine-style “Hams Kids Dashboard” screenshot (visual/layout inspiration)

**Purpose of this document:** Step-by-step inventory of every dashboard section so Flutter can implement mobile UI/UX (Phase 3) without guessing.

---

## 0. How to read this report

| Label | Meaning |
|-------|---------|
| **WEB (code)** | Confirmed in Panacea `DashboardHome` |
| **SCREENSHOT** | Visible on Hams Kids reference image (may differ slightly from code labels) |
| **FLUTTER** | Recommended mobile presentation |

---

## 1. Page identity & shell

### 1.1 Route & entry

| Item | Value |
|------|-------|
| Path | `/dashboard` |
| Page file | `src/app/(app)/dashboard/page.tsx` |
| Main UI | `DashboardHome` |
| Nav module | `dashboard` in `APP_MODULES` (always visible when authenticated) |
| Auth | Requires staff session (`AppShell` + `RouteGuard`) |
| RBAC for page | Authenticated only (empty `anyOf`) |
| Widget RBAC | Individual widgets gated by permissions (see §12) |

### 1.2 Header (WEB code)

| Element | Behavior |
|---------|----------|
| Eyebrow | `"Center Dashboard"` or `"Organization Overview"` (All Centers) |
| Title | `"{scopeLabel} Dashboard"` or `"All Centers Dashboard"` |
| Date picker | `dateValue` state (ISO `yyyy-mm-dd`), displayed as `dd/mm/yyyy` |
| Decorative | `DashboardButterfly` (CSS/SVG) |
| Ambient bg | Soft gradient mesh (`.dash-ambient`) |

**SCREENSHOT header extras (not all in Panacea dash header):** breadcrumb “Current Institution / Hams Kids Dashboard”, global search, refresh, fullscreen, profile/settings icons — those live mainly in **AppShell**, not inside `DashboardHeader`.

### 1.3 Center scope

| Mode | Behavior |
|------|----------|
| Single center | Uses `DASHBOARD_DATA` |
| All centers | Uses `buildAllCentersDashboard()` + shows `OrgCentersStrip` |

**FLUTTER:** Top app bar with center name + date; optional center switcher in More menu.

### 1.4 Loading

- Boot delay via `useDashboardBoot(320)` + auth ready  
- Shows `DashboardSkeleton` until ready  

**FLUTTER:** Shimmer skeleton matching widget cards.

---

## 2. Top KPI row (4 cards) — step by step

**Component:** `KpiStatsRow` + expand panel `KpiDetailPanel`  
**Permission gate:** ANY of `cm-students-view-page`, `cm-staff-view`, `sa-record`, `sta-record`, `bill-view-dashboard`

### 2.1 Cards (order left → right)

| # | KPI id | Label | Sample value | Tone | Icon |
|---|--------|-------|--------------|------|------|
| 1 | `rooms` | Rooms | `6` | pink | 📘 |
| 2 | `staff` | Staff | `18` | purple | 👥 |
| 3 | `students` | Students | `42` | green | 🧒 |
| 4 | `ratio` | Student/Staff | `2.3:1` (live-recalc) | coral | 🔎 |

### 2.2 Interactions

1. User taps a KPI card.  
2. Card becomes **selected** (`aria-pressed`); others dim.  
3. `KpiDetailPanel` expands below with section title.  
4. Tap same KPI again → collapse (`activeKpi = null`).  
5. Close button on panel also collapses.  
6. Numeric KPIs animate count-up (`AnimatedKpiValue`).  
7. Ratio value is **computed live** from attendance `students.in / staff.in` when staff.in > 0.

### 2.3 KPI detail panels (expand content)

#### A) Rooms overview (`active === 'rooms'`)

**Aggregate stats**

| Stat | Formula / source |
|------|------------------|
| Active rooms | `rooms.length` |
| Avg occupancy | average of `occupancyPct` |
| Children placed | sum of `room.students` |
| Staff assigned | sum of `room.staff` |

**Per-room card fields (`RoomRecord`)**

| Field | Type | Example |
|-------|------|---------|
| `name` | string | Sunshine Room |
| `students` | number | 10 |
| `staff` | number | 3 |
| `capacity` | number | 12 |
| `ageRange` | string | 2y–3y |
| `occupancyPct` | number | 83 |
| `status` | `active` \| `quiet` \| `full` | active |

**UI per room:** name, status chip, student/staff counts, age range, occupancy progress bar.

**SCREENSHOT alignment:** Rooms grid with Active status + capacity bars — same idea.

#### B) Staff overview (`active === 'staff'`)

List of `StaffRecord`:

| Field | Values |
|-------|--------|
| name, role, room | text |
| status | `Active` \| `On Leave` \| `Pending` |
| initials | avatar letters |

#### C) Students overview (`active === 'students'`)

List of `StudentRecord`:

| Field | Values |
|-------|--------|
| name, age, room | text |
| status | `Active` \| `On Leave` \| `Pending` |
| initials | avatar letters |

Also shows **age group breakdown** (`ageGroups`: label + count).

#### D) Student/Staff ratio (`active === 'ratio'`)

From `ratioInsights`:

| Field | Example |
|-------|---------|
| target | `1:4` |
| current | `1:2.3` |
| compliantRooms | 5 |
| watchRooms | 1 |
| byRoom[] | room, ratio, status `ok` \| `watch` |

**FLUTTER:** Horizontal scroll of 4 KPI chips; tap opens bottom sheet / full-screen detail (not an inline expand on small phones).

---

## 3. Row: Today’s summary + Quick actions + Weekly attendance

**Shown when:** attendance OR activity permissions.

### 3.1 Today’s summary — `TodaySummaryWidget`

| Field | Sample (code) | SCREENSHOT variant |
|-------|---------------|--------------------|
| Check-ins | 40 | Present (40) |
| Check-outs | 6 | Checked-in (6) |
| Posts | 20 | Early (20)* |
| Messages | 11 | Delayed (11)* |
| utilization % | 74 | Progress bar |

\*Screenshot labels differ; **implement Flutter from WEB code fields** unless product wants screenshot labels.

**UI:** 2×2 metric cells + utilization progress track.

### 3.2 Quick actions — `QuickActionsWidget`

**Permission:** ANY of `sa-record`, `pc-post-add`, `enq-add-update`, `bill-record-payment`

| id | Title | Description | Navigates to |
|----|-------|-------------|--------------|
| qa1 | Mark attendance | Check students and staff in or out | `/attendance-leaves` |
| qa2 | New enquiry | Capture a parent lead quickly | `/enquiries` |
| qa3 | Create invoice | Bill families for the month | `/billing-accounting` |
| qa4 | Post update | Share news with parents | `/parent-communication` |

**SCREENSHOT:** Mark attendance, New enquiry, Generate invoice, Post a photo — same intent.

**FLUTTER:** Horizontal chip row or FAB speed-dial; filter by role permissions.

### 3.3 Weekly attendance — `WeeklyAttendanceWidget`

| Field | Type |
|-------|------|
| day | Mon…Sat (code has 6 days; screenshot shows Sun too — optional) |
| present | number |
| absent | number |

**UI:** Stacked bar per day (present + absent), legend Present/Absent.  
**FLUTTER:** `fl_chart` bar chart; tap day → tooltip.

---

## 4. Attendance overview block

**Component:** `AttendanceOverview`  
**Permission:** ANY of `sa-record`, `sa-update`, `sta-record`, `sta-update`

### 4.1 Scope toggle

| Scope | Data key |
|-------|----------|
| Center | `data.attendance.center` |
| Class | `data.attendance.class` |

Changing scope updates leave stats, status grid, and live ratio ring.  
Also updates top KPI ratio (uses live `in` counts).

### 4.2 Leave links (left column)

All link to `/attendance-leaves`:

| Metric | Field | Color hex |
|--------|-------|-----------|
| Students on leave today | `studentLeave` | `#3D7A55` (success / green text) |
| Staff on leave today | `staffLeave` | `#8A7040` (warning / orange text) |
| Students absent from 3 days | `absentFrom3Days` | `#E53935` (danger / red text) |

### 4.3 Status table

| Row \ Col | In `#3D7A55` | Out `#8A7040` | Absent `#E53935` | Pending `#5D5FEF` |
|-----------|----|-----|--------|---------|
| Students | `students.in` | `students.out` | `students.absent` | `students.pending` |
| Staff | `staff.in` | `staff.out` | `staff.absent` | `staff.pending` |

Sample center: Students 28/4/2/8 · Staff 12/2/1/3.

### 4.4 Live ratio ring — `LiveRatioRing`

- Displays students.in : staff.in (e.g. 28:12)  
- Circular gauge visualization  

**FLUTTER:** Segmented control Center/Class; compact table; circular progress for ratio; leave rows as tappable list tiles.

---

## 5. Activity + Upcoming + Parent communication row

Shown when activity OR calendar OR parent-comm permissions.

### 5.1 Daily activities — `ActivitySummaryWidget`

**Permission:** `pc-post-view` OR `as-view-obs` OR `as-view`

| Field | Sample |
|-------|--------|
| incidents | 1 |
| photos | 14 |
| videos | 3 |
| announcements | 2 |
| approvalPending | 1 |

**SCREENSHOT also shows:** Total (21) — can compute as sum of categories for mobile.

**FLUTTER:** Stat chips grid; tap “approval pending” → activities awaiting approval (future API).

### 5.2 Important dates / Upcoming — `UpcomingEventsWidget`

Uses:

| List | Fields |
|------|--------|
| `upcomingEvents` | title, when, room |
| `upcomingBirthdays` | name, when, room |
| `upcomingHolidays` | title, when |

**SCREENSHOT:** Vertical timeline “Upcoming Event / Birthday / Holiday”.

**FLUTTER:** Tabbed list (Events | Birthdays | Holidays) or single timeline with type icons.

### 5.3 Parent communication status — `ParentCommunicationWidget`

**Permission:** ANY of `pc-post-view`, `pc-notes-view`, `pc-concern-view`, `pc-nl-create`

| Field | Sample |
|-------|--------|
| concernsPending | 2 |
| concernsReportedToday | 1 |
| notesPending | 3 |
| notesCreatedToday | 5 |
| leavesPending | 1 |
| leavesOutToday | 3 |

**SCREENSHOT:** Concerns / Notes / Leaves pending counts.

**FLUTTER:** Three pending cards with deep links to Concerns / Notes / Leaves modules.

---

## 6. Recent activity + Enquiries row

### 6.1 Recent activity — `RecentActivityWidget`

| Field | Type |
|-------|------|
| id | string |
| title | string |
| meta | string |
| time | relative string |
| tone | `info` \| `success` \| `warning` \| `danger` |

Sample items: Announcement approved, Student checked in, Leave request posted, Debit note due soon, Photo activity drafted.

**FLUTTER:** Timeline list; tone → left border color.

### 6.2 Enquiries & admissions — `EnquiriesWidget`

**Permission:** `enq-view` OR `enq-add-update`

| Field | Sample |
|-------|--------|
| newEnquiries | 7 |
| totalAdmissions | 4 |
| followupOverdue | 2 |
| periodLabel | This Month |
| chart[] | label + value (0–1 normalized bars: Walk-in, Website, Referral, Social, Other) |

**SCREENSHOT:** Conversion ratio + line chart by source — Flutter can use line/area or bar; data model currently provides **source share bars**.

**FLUTTER:** KPI trio + chart; CTA “New enquiry”.

---

## 7. Billing + Installations row

### 7.1 Billing & accounting — `BillingWidget`

**Permission:** ANY of `bill-view-dashboard`, `bill-view-module`, `rep-billing`

| Field | Sample |
|-------|--------|
| totalBilled | 186400 |
| totalCollected | 152200 |
| currency | INR |
| periodLabel | This Month |
| ageing[] | label, value (count), color |

**Ageing buckets (code):**

| Label | Color token |
|-------|-------------|
| 1-15 days | green |
| 16-30 days | yellow |
| 31-45 days | pink |
| 45+ days | red |

**Format money:** INR (same family as invoices `₹` + en-IN).

**FLUTTER:** Two big amounts + horizontal ageing bars; tap → Invoices list filtered overdue.

### 7.2 Installations — `InstallationsWidget`

**Permission:** `cm-ac-install-report`

| Field | Sample |
|-------|--------|
| parentsInstalled | 28 |
| parentsNotInstalled | 14 |
| staffInstalled | 15 |
| staffNotInstalled | 3 |

**SCREENSHOT:** Donut charts Admin/Staff — Flutter: two donuts or stacked progress (Parents / Staff app install).

---

## 8. Bottom feeds

**Permission:** ANY of `pc-post-view`, `cal-view`, `enq-view`

### 8.1 Notifications — part of `FeedWidgets`

| Field | Type |
|-------|------|
| title | string |
| when | string |
| unread | boolean |

Unread rows styled differently.

### 8.2 Announcements — part of `FeedWidgets`

| Field | Type |
|-------|------|
| title | string |
| body | string |
| when | string |

### 8.3 Dates feed — `DatesFeedWidget`

Calendar highlights combining birthdays / holidays / events (tabbed or stacked — see component for exact layout).

**FLUTTER:** Bottom section “Alerts” with Notifications + Announcements; dates already covered in Upcoming widget — avoid duplication on mobile by merging.

---

## 9. Full data model for Flutter (`DashboardBundle`)

Copy this as your Dart model shape:

```text
DashboardBundle
├── kpis: DashboardKpi[]
├── attendance: { center, class } → AttendanceSnapshot
├── rooms: RoomRecord[]
├── staff: StaffRecord[]
├── students: StudentRecord[]
├── activity: { incidents, photos, videos, announcements, approvalPending }
├── parentCommunication: { concerns*, notes*, leaves* }
├── enquiries: { newEnquiries, totalAdmissions, followupOverdue, periodLabel, chart[] }
├── billing: { totalBilled, totalCollected, currency, periodLabel, ageing[] }
├── installations: { parentsInstalled/Not, staffInstalled/Not }
├── weeklyAttendance: { day, present, absent }[]
├── ageGroups: { label, count }[]
├── quickActions: { id, title, description, href }[]
├── recentActivities: ActivityItem[]
├── announcements[]
├── notifications[]
├── upcomingBirthdays[] / upcomingHolidays[] / upcomingEvents[]
├── todaySummary: { checkIns, checkOuts, posts, messages, utilization }
└── ratioInsights: { target, current, compliantRooms, watchRooms, byRoom[] }
```

Types file: `src/data/dashboard.types.ts`.

---

## 10. Vertical page order (web) — implement mobile as scroll sections

```text
1. Header (title + date)
2. [All Centers strip if org scope]
3. KPI row (4 cards)
4. KPI detail panel (conditional)
5. Today’s summary | Quick actions | Weekly attendance
6. Attendance overview (leave + table + ratio ring)
7. Activity summary | Upcoming dates | Parent communication
8. Recent activity | Enquiries
9. Billing | Installations
10. Notifications | Announcements
11. Dates feed
```

**FLUTTER recommended order (single column):**

```text
1. App bar + date
2. KPI horizontal list
3. Quick actions (chips)
4. Today summary
5. Attendance card (toggle + ratio + key counts)
6. Pending parent-comm (concerns/notes/leaves)
7. Weekly attendance chart
8. Recent activity (limit 5 + See all)
9. Enquiries snapshot
10. Billing snapshot (if finance perms)
11. Notifications / Announcements
```

Hide sections without permission (mirror §12).

---

## 11. Interactions & navigation map

| UI control | Action |
|------------|--------|
| KPI tap | Expand/collapse detail |
| Quick action | Navigate to module href |
| Leave metric links | `/attendance-leaves` |
| Attendance scope toggle | Switch center/class dataset |
| Enquiry CTA | `/enquiries` (implied) |
| Date change | Updates header display (data still mock — **API later**) |
| Center scope (shell) | Rebuild dashboard bundle |

---

## 12. Permission matrix (widget visibility)

| Widget | Show when user has ANY of |
|--------|---------------------------|
| KPI row + detail | `cm-students-view-page`, `cm-staff-view`, `sa-record`, `sta-record`, `bill-view-dashboard` |
| Today summary / Weekly / Attendance overview | `sa-record`, `sa-update`, `sta-record`, `sta-update` |
| Quick actions | `sa-record`, `pc-post-add`, `enq-add-update`, `bill-record-payment` |
| Activity summary / Recent activity | `pc-post-view`, `as-view-obs`, `as-view` |
| Upcoming events | `cal-view`, `cal-ss-view` |
| Parent communication | `pc-post-view`, `pc-notes-view`, `pc-concern-view`, `pc-nl-create` |
| Enquiries | `enq-view`, `enq-add-update` |
| Billing | `bill-view-dashboard`, `bill-view-module`, `rep-billing` |
| Installations | `cm-ac-install-report` |
| Feeds (notifications/announcements/dates) | `pc-post-view`, `cal-view`, `enq-view` |

**Role impact (from Phase 2):**

| Mobile role | Typical visible blocks |
|-------------|------------------------|
| Teacher | KPI, Today, Quick (attendance/post), Weekly, Attendance, Activity, Parent-comm, Recent, Feeds |
| Finance | KPI, Billing, Enquiries?, Quick invoice, maybe limited attendance |
| Leader | Broad view widgets |
| Admin | Nearly all |
| Parent | **Not this dashboard** — parent has Timeline home |

---

## 13. Color code sheet (Flutter theme — exact hex from code)

**Sources:** `src/app/globals.css` (design tokens) + `src/components/app/dashboard.css` (dashboard-specific).

### 13.1 Core Panacea brand tokens

| Token name (CSS) | Hex | Flutter use |
|------------------|-----|-------------|
| `--color-accent` / `--panacea-purple` | `#5D5FEF` | Primary buttons, links, focus, present bars, accents |
| `--color-accent-hover` / `--panacea-purple-deep` | `#4B51E0` | Pressed/hover primary |
| `--color-accent-soft` / `--panacea-lavender` | `#E8F2FF` | Soft chips, selected rows, icon soft bg |
| `--color-accent-soft-deep` | `#D6E4FF` | Stronger soft accent / borders |
| `--modal-header-bg` / `--form-section-bg` | `#DEECFF` | Soft header bands |
| `--color-input-bg` | `#F8FAFC` | Input fills |
| `--color-close` | `#E53935` | Destructive / close |

### 13.2 Surfaces & text

| Token | Hex | Flutter use |
|-------|-----|-------------|
| `--color-white` / `--card-bg` / `--sidebar-bg` | `#FFFFFF` | Cards, sidebar, navbar |
| `--color-bg` / `--page-bg` | `#FAFAF7` | Page background |
| `--text-primary` / `--text` | `#1F2937` | Headings, primary body |
| `--text-secondary` / `--text-muted` | `#6B7280` | Captions, meta |
| `--text-inverse` | `#FFFFFF` | Text on accent buttons |
| `--border` | `#E8EDF5` | Card/table borders |
| `--border-strong` | `#D7E0EC` | Stronger dividers |

### 13.3 Pastel brand palette

| Token | Hex | Flutter use |
|-------|-----|-------------|
| `--color-beige` | `#EDE8D0` | Soft warning surfaces, holiday tones |
| `--color-mint` | `#D0EDDA` | Success soft bg, sidebar hover |
| `--color-lavender` | `#D0D5ED` | Soft purple surfaces, sidebar active |
| `--color-blush` | `#EDD0E4` | Soft danger/blush surfaces |

### 13.4 Semantic status colors

| Token | Hex | Soft bg hex | Flutter use |
|-------|-----|-------------|-------------|
| `--color-success` / `--panacea-teal` | `#3D7A55` | `#D0EDDA` (`--color-success-bg`) | Present, In, success tones |
| `--color-warning` | `#8A7040` | `#EDE8D0` (`--color-warning-bg`) | Warning / leave cues |
| `--color-danger` | `#E53935` | `#EDD0E4` (`--color-danger-bg`) | Absent, overdue, danger |
| `--color-info` | `#5D5FEF` | `#E8F2FF` (`--color-info-bg`) | Info / pending accent |

**Attendance cell text classes (map to semantics):**

| Class / meaning | Preferred hex |
|-----------------|---------------|
| In / Present / green text | `#3D7A55` |
| Out / orange text | `#8A7040` (warning) or dashboard orange accents |
| Absent / red text | `#E53935` |
| Pending / blue-accent text | `#5D5FEF` |

### 13.5 KPI card tones (exact gradients from `dashboard.css`)

| KPI | `tone` | Right-panel gradient (start → mid → end) | Value text |
|-----|--------|------------------------------------------|------------|
| Rooms | `pink` | `#FFE6F2` → `#F7B6D4` → `#ED70A8` | `#9B1048` |
| Staff | `purple` | `#EEF0FF` → `#D0D5ED` → `#B8BFF5` | `#4B51E0` (accent-hover) |
| Students | `green` | `#EAF8EF` → `#D0EDDA` → `#A8D9B8` | `#3D7A55` (success) |
| Ratio | `coral` | `#FDF2F8` → `#FBCFE8` → `#F9A8D4` | `#9D174D` |

**KPI card chrome:**

| Element | Hex / value |
|---------|-------------|
| Card fill | `#FFFFFF` → `#FCFCFD` (subtle) |
| Default border | `rgba(232, 237, 245, 0.95)` ≈ `#E8EDF5` |
| Selected ring (accent) | `#5D5FEF` glow `rgba(93, 95, 239, 0.45)` |
| Rooms selected / pink focus | border `#F472B6`, glow `rgba(244, 114, 182, 0.18)` |
| Date chip border | `#C4B5FD` |
| Date chip fill | `#FFFFFF` → `#F5F3FF` → `#FDF2F8` |
| Date icon / accent text | `#5D5FEF` |
| Title gradient text | `#8B5CF6` → `#EC4899` (eyebrow) · `#1E293B` → `#334155` (title) |

### 13.6 Charts & progress

| Element | Hex |
|---------|-----|
| Weekly **Present** bar | `#7A7CF5` → `#5D5FEF` |
| Weekly **Absent** bar | `#F7B6D4` → `#ED70A8` |
| Present legend dot | `#5D5FEF` |
| Absent legend dot | `#ED70A8` |
| Utilization / progress fill | `#ED70A8` → `#5D5FEF` (or accent `#5D5FEF` → `#8B8DF5`) |
| Progress track | `#E8EDF5` / `#F1F4F9` |
| Chart grid lines | `#EEF2F7` |
| Billing ageing **green** (`.dash-age-green`) | `#3D7A55` |
| Billing ageing **yellow** (`.dash-age-yellow`) | `#C4A35A` |
| Billing ageing **pink** (`.dash-age-pink`) | `#D9789A` |
| Billing ageing **red** (`.dash-age-red`) | `#E53935` |
| Ageing legend off | `#E5E7EB` |
| Age horizontal bar fill (alt) | `#ED70A8` → `#5D5FEF` |
| Progress fill (`.dash-progressFill`) | `#5D5FEF` → `#8B8DF5` |

### 13.7 Widget / status chip surfaces

| Surface | Hex |
|---------|-----|
| Widget card bg | `#FFFFFF` |
| Widget border | `#E8EDF5` (~95% opacity) |
| Soft success chip | bg `#EAF8EF`, text `#3D7A55`, border `#CFE9D8` |
| Soft warning chip | bg `#FFF7E8`, text `#8A7040`, border `#F0E0C0` |
| Soft danger chip | bg `#FFE9EA`, text `#E53935`, border `#F0C8CB` |
| Soft accent chip | bg `#E8F2FF`, text `#4B51E0` |
| Unread / feed highlight | `#FBFCFE` or accent-soft `#E8F2FF` |
| Timeline tone borders | info `#5D5FEF`, success `#3D7A55`, warning `#8A7040`, danger `#E53935` |

### 13.8 Upcoming dates accent colors (dashboard)

| Type (CSS class) | Label text | Card fill gradient | Border |
|------------------|------------|--------------------|--------|
| Event (`.dash-upcomingEvent`) | `#8A7040` | `#FFFDF6` → `#EDE8D0` | `rgba(237, 232, 208, 0.9)` |
| Birthday (`.dash-upcomingBirthday`) | `#B44D7A` | `#FFF7FB` → `#EDD0E4` | `rgba(237, 208, 228, 0.9)` |
| Holiday (`.dash-upcomingHoliday`) | `#5A63B8` | `#F5F7FF` → `#D0D5ED` | `rgba(208, 213, 237, 0.9)` |

### 13.9 Page ambient background (decorative)

| Gradient blob | RGBA |
|---------------|------|
| Accent wash | `rgba(93, 95, 239, 0.08)` |
| Mint wash | `rgba(208, 237, 218, 0.35)` |
| Beige wash | `rgba(237, 232, 208, 0.28)` |

### 13.10 Radius & elevation (pair with colors)

| Token | Value |
|-------|-------|
| `--card-radius` / widget | `18px` |
| `--radius-md` | `12px` |
| `--radius-pill` | `999px` |
| Card shadow | `0 10px 30px rgba(31, 41, 55, 0.07), 0 2px 8px rgba(31, 41, 55, 0.04)` |
| Elevated / selected | `0 12px 40px rgba(15, 23, 42, 0.12)` + accent ring |

### 13.11 Suggested Flutter `Color` constants

```dart
// Brand
static const accent = Color(0xFF5D5FEF);
static const accentHover = Color(0xFF4B51E0);
static const accentSoft = Color(0xFFE8F2FF);
static const accentSoftDeep = Color(0xFFD6E4FF);

// Surfaces
static const white = Color(0xFFFFFFFF);
static const pageBg = Color(0xFFFAFAF7);
static const border = Color(0xFFE8EDF5);
static const textPrimary = Color(0xFF1F2937);
static const textSecondary = Color(0xFF6B7280);

// Pastels
static const beige = Color(0xFFEDE8D0);
static const mint = Color(0xFFD0EDDA);
static const lavender = Color(0xFFD0D5ED);
static const blush = Color(0xFFEDD0E4);

// Semantic
static const success = Color(0xFF3D7A55);
static const warning = Color(0xFF8A7040);
static const danger = Color(0xFFE53935);

// KPI
static const kpiRoomsEnd = Color(0xFFED70A8);
static const kpiRoomsText = Color(0xFF9B1048);
static const kpiRatioText = Color(0xFF9D174D);
static const kpiPinkBorder = Color(0xFFF472B6);

// Charts
static const presentBar = Color(0xFF5D5FEF);
static const absentBar = Color(0xFFED70A8);
```

Charts: stacked weekly bars; enquiry source bars; billing ageing bars; installation donuts; live ratio ring — use the hex table above.

---

## 14. States to implement in Flutter

| State | Behavior |
|-------|----------|
| Loading | Skeleton |
| Empty widget | Hide section or “No data” |
| No permission | Omit widget entirely (do not show locked cards unless product wants upsell) |
| Error (future API) | Retry on section |
| Pull-to-refresh | Reload dashboard bundle |
| Offline | Cache last bundle |

---

## 15. Screenshot vs code — known differences

| Topic | Screenshot (Hams Kids) | Panacea code |
|-------|------------------------|--------------|
| Branding | Hams Kids | Center scope label / Panacea |
| Today metrics labels | Present / Checked-in / Early / Delayed | Check-ins / Check-outs / Posts / Messages |
| Weekly chart | Includes Sunday | Mon–Sat in mock |
| Sidebar Assets / Feeds | Shown in screenshot nav | Panacea nav differs (`modules.ts`) |
| Data | Reference UI | `DASHBOARD_DATA` mock |

**Recommendation:** Design Flutter from **Panacea code contract**; use screenshot only for density/layout inspiration.

---

## 16. Flutter screen inventory (Dashboard only)

| Screen ID | Description | Priority |
|-----------|-------------|----------|
| `staff_home` / `dashboard` | Main scroll dashboard | P0 |
| `dashboard_kpi_rooms` | Rooms detail (from KPI) | P0 |
| `dashboard_kpi_staff` | Staff list sheet | P1 |
| `dashboard_kpi_students` | Students list sheet | P1 |
| `dashboard_kpi_ratio` | Ratio insights | P1 |
| `dashboard_attendance` | Full attendance overview (optional push) | P1 |

Deep links from dashboard → existing Phase 2 screens (attendance, enquiries, billing, messages, etc.).

---

## 17. Step-by-step Flutter implementation checklist

1. Define Dart models matching `DashboardBundle`.  
2. Build mock repository returning same sample numbers as `dashboard.ts`.  
3. Implement permission-aware section builder (hide by role).  
4. Build KPI cards + bottom sheet details.  
5. Quick actions → `GoRouter` / named routes.  
6. Today summary + utilization bar.  
7. Weekly attendance chart.  
8. Attendance card with Center/Class toggle + ratio ring.  
9. Parent-comm pending tiles.  
10. Recent activity list (max 5).  
11. Enquiries KPIs + chart.  
12. Billing amounts + ageing (finance roles).  
13. Installations (if `cm-ac-install-report`).  
14. Notifications / announcements.  
15. Skeleton + pull-to-refresh.  
16. Wire Phase 5 API later without changing UI sections.

---

## 18. Evidence (code)

```text
File: src/components/app/DashboardHome.tsx
Evidence: Widget composition order + permission flags

File: src/data/dashboard.types.ts
Evidence: Full DashboardBundle schema

File: src/data/dashboard.ts
Evidence: Sample values for every field

File: src/components/app/dashboard/KpiStatsRow.tsx
Evidence: KPI select / expand interaction

File: src/components/app/dashboard/AttendanceOverview.tsx
Evidence: Center/Class toggle, leave links, status grid
```

---

## 19. API note (critical)

```text
Status: FULLY IMPLEMENTED on frontend with MOCK data
Backend dashboard API: NOT CONFIRMED FROM FRONTEND CODE
Flutter must use mock → swap to GET /dashboard (or equivalent) in Phase 5
```

---

**End of report.** Use this as the Dashboard chapter of your Flutter design pack; combine with `MOBILE_PHASE2_ROLE_FEATURE_SCREEN_INVENTORY.md` for role-based section visibility.
