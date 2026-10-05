# Student Schedule — Deep-Dive

> **Status: ⚠️ PLACEHOLDER in the current build.** The route `/calendar/student-schedule` renders a "Coming soon" placeholder (`CalendarSubPlaceholder`). There is **no implementation yet** in `ChilldCare_FrontEnd`.
>
> This document does three things:
> 1. Explains exactly what **Student Schedule** is and how it works in a childcare platform.
> 2. Maps the **working reference implementation** (`app/` → `StaffSchedulePage.tsx` + `ScheduleEntry` model) that shows the pattern to follow.
> 3. Specifies the **ideal Panacea build** — data model, UI, interactions, persistence — and a step-by-step build plan, so implementing it later is mechanical.

---

## 1. What is Student Schedule?

> **In plain words:** It's the classroom's weekly timetable — the "what happens and when" of a daycare/school day. Think of it as the daily routine poster you'd see on a classroom wall ("09:00 Morning Circle → 10:30 Art → 11:00 Outdoor…"), but digital and interactive.

A **weekly timetable of activities for each classroom (and by extension each student)** — the "what happens and when" of a daycare/school day.

Concretely it answers:
- **What activity** happens (Morning Circle, Art Studio, Outdoor Play, Story Time, Music…).
- **When** — which day (date) and time slot.
- **Where** — which room/classroom.
- **Who** — which staff member(s) lead it, and implicitly which students (the students assigned to that room).

It's the **student-facing counterpart to Staff Schedule** (which is about *staff shifts/duties*). Where Staff Schedule answers "which teacher works when," Student Schedule answers "what do the kids do when."

**Why it exists:**
- **Parents** want to know their child's day — what they did, when lunch was, when they napped. A visible schedule builds trust and keeps them in the loop.
- **Staff** need a shared plan for the week so everyone knows what's happening in each room and who's leading it.
- **The center** needs a predictable routine — Montessori work cycles, nap windows, meals, outdoor time — because young children thrive on consistency.

**A real-world analogy:** Student Schedule is to a classroom what a **TV guide** is to channels. Each room is a channel; each day is a column; each activity is a show with a time slot. You look at the guide to know what's on, when, and where.

---

## 2. How it works (domain model)

> **In plain words:** Everything is built from tiny building blocks called **entries**. One entry = one activity, on one day, at one time, in one room, led by certain staff. The whole schedule is just a big list of these entries.

A schedule is a collection of **entries**. Each entry is a single time-boxed activity:

```
ScheduleEntry {
  id         — unique id
  date       — "YYYY-MM-DD" (e.g. "2026-08-03")
  time       — "HH:mm" (e.g. "09:00")
  title      — activity name (e.g. "Morning Circle")
  type?      — optional category tag (e.g. "Activity")
  roomId?    — the classroom it happens in
  staffIds[] — staff leading it
  staffNames[] — denormalized staff names (so the UI can render without lookups)
}
```

> **Reading the model in English:** "On 2026-08-03 at 09:00 there's **Morning Circle** in this room, led by these staff members." That's a single entry. Add a hundred similar entries and you have a month of schedules.

**Key ideas:**

- **It's room-scoped, not student-scoped.** Students belong to rooms, so a room's schedule *is* the students' schedule. There's no per-student entry in the reference model — per-student views are just filtering by the room.
  > *Why this matters:* You never have to create "Aarav's Monday schedule" separately. Aarav is in Sunshine Room → Sunshine Room's schedule *is* his schedule. If a child moves rooms, their schedule automatically changes — nothing per-child to update.

- **Denormalization.** `staffNames` is stored on the entry so lists render instantly. Same pattern the rest of this codebase uses (names duplicated onto rows).
  > *Why this matters:* If the UI had to look up "who is staff id `staff-5`?" every time it drew a chip, it would need extra lookups on every render. By copying the *name* onto the entry, the page can draw instantly. The trade-off: if a staff member's name changes, old entries keep the old name — acceptable for a demo.

- **One entry = one activity occurrence.** Recurring routines (e.g. "Circle every morning") are modeled as separate entries per date, not as a recurrence rule. Simple, and matches the reference.
  > *Why this matters:* A "repeat every weekday" rule sounds elegant but adds complexity (exceptions, holidays, overrides). Storing one entry per occurrence is dumb but bulletproof — you can delete or edit a single Tuesday without affecting the other days.

---

## 3. Reference implementation (the pattern to copy)

> **In plain words:** Before building our own, look at how the sibling `app/` project already solved the same problem with a **Staff Schedule**. It's a working, proven layout — we copy its structure, swap "staff" for "rooms," and restyle it in Panacea's purple.

The sibling project `app/` has a working **Staff Schedule** page that is the direct template for a Student Schedule. Files:

- Data model: `app/src/data/types.ts` → `ScheduleEntry` (above), part of `AppData` (a Zustand store slice persisted to `localStorage`).
- Seed data: `app/src/data/seed.literal.ts` + `app/src/data/seed.generated.ts` (entries like Morning Circle 09:00, Art Studio 10:30, Outdoor Play 11:00, Story Time 14:00, Music 15:00).
- Page: `app/src/pages/calendar/StaffSchedulePage.tsx`.

### 3.1 Layout & navigation

```
[PageHeader: "Staff Schedule"]        [Export Schedule]  [+ Add Schedule]
[FilterBar: Date Range (◀ 08/08 – 14/08 ▶) | Staff | Room | Shift]
[Summary: hours & shifts per staff]
[Grid: rows = staff, columns = 7 days (Mon–Sun)]
       each cell = list of schedule-entry chips for that staff+day
       leave days show a "On leave" tag
```

> **Reading the layout:** Think of it as a **spreadsheet**. Rows are people (staff), columns are the 7 days of the week, and each little box (cell) is that person's to-do list for that day — shown as small colored chips, one per activity. A chip sitting in "Priya × Monday" means Priya has an activity that Monday.

- **Week navigation**: ◀ / ▶ buttons shift `weekStart` by 7 days; the header shows `DD/MM/YYYY – DD/MM/YYYY` for the 7-day window. Days are computed as `weekStart + 0..6`.
  > *In plain words:* ◀ moves you back one whole week, ▶ moves forward one whole week. The label always tells you exactly which dates you're looking at.
- **Filters**: staff, room, shift (Morning 05–12 / Afternoon 12–17 / Evening 17–23 / All). Shift filtering buckets entries by the *hour* of `time`.
  > *In plain words:* The **shift** filter is a quick way to say "show me only morning things" — anything whose start hour is between 5am and noon, for example. Useful when a room is very busy and you want to declutter.
- **Row/cell semantics**: each row is a person; each column a day; a cell contains that person's entries for that day (filtered by shift). Staff with an approved/pending leave overlapping a day show a leave indicator instead.
- **Add Schedule** → navigates to a create form (a separate route in the reference) that writes a new `ScheduleEntry` into the store.
- **Visual style**: entry chips are light teal (`#e8f7f9` bg, `#0f6e7c` text) — in Panacea this must become the purple accent `#5D5FEF` / `--color-accent-soft` palette, per the design system.

### 3.2 Derived data (what the page computes, not stores)

> **In plain words:** The store is dumb — it just holds a flat list of entries. All the clever stuff (which week are we on, what fits in each cell, how many hours is Priya working) is **computed on the fly** by the page. This keeps the data simple and the display flexible.

- `days` — the 7 dates of the visible week.
- `activeStaff` — staff filtered by status + the staff/room filters.
- `entriesFor(staffId, day)` — `scheduleEntries.filter(date matches && staffIds includes staff && inShift(time))`.
- `staffSummary` — counts of shifts and hours per staff across the week (demo: 1 hour per entry).
- `leaveOnDay(staffId, day)` — finds an approved/pending leave covering that day.

This is the crucial pattern: **the store holds flat entries; everything the UI shows is computed.** A Student Schedule would do the same: store flat entries; compute room×day×time cells.

---

## 4. Ideal Panacea Student Schedule — spec

> **In plain words:** Here's the blueprint for building the real feature. We take the reference's proven spreadsheet-style layout but flip it — **rows = rooms** (instead of staff) — because that's how a *student* schedule is read: "what's happening in Sunshine Room today?"

The goal: mirror Staff Schedule but **room-first** (rows = rooms, or a room/class selector), on the Panacea design system and the app's existing conventions.

### 4.1 Data model (new)

`src/types/studentSchedule.ts`:

```ts
export type ScheduleEntryType = 'Activity' | 'Meal' | 'Nap' | 'Outdoor' | 'Circle' | 'Special';

export type StudentScheduleEntry = {
  id: string;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:mm
  title: string;
  type: ScheduleEntryType;
  roomId: string;      // FK to rooms
  roomName: string;    // denormalized
  staffIds: string[];
  staffNames: string[];
  durationMins?: number; // optional
};
```

> **Reading the model in English:** "On `2026-08-03` at `09:00`, **Morning Circle** happens in **Sunshine Room** (that's `roomId`/`roomName`), led by `Priya Nair` (that's `staffNames`), and it's a **Circle** activity (`type`), roughly `30` minutes long."
>
> The `type` field is what gives the schedule its color coding — Meals, Naps, Activities all look different so a glance tells you the shape of the day. `roomName` and `staffNames` are copied onto the entry (denormalized) so the grid can draw instantly without lookups.

### 4.2 Store (new) — follow the app's established pattern

`src/components/modules/calendar/student-schedule/store.ts`:
- localStorage key: `panacea.calendar.studentSchedule`
- `loadEntries()` / `saveEntries()` with seed fallback (same shape as `lessons/store.ts`, `resource-center/store.ts`).
- `addEntry`, `updateEntry`, `removeEntry` helpers that persist.
- Seed file: `src/lib/mock/mockStudentSchedule.ts` — a week of entries (Mon–Fri) for the 4 seed rooms (Sunshine, Rainbow, Star, Nest) with realistic Montessori activities, meals, naps, outdoor, story time.

> **In plain words:** This is the same localStorage recipe used by every other module. The first time someone opens the page, it seeds a realistic week (Morning Circle 09:00, Snack 10:15, Outdoor 11:00, Lunch 12:00, Nap 12:30, Story 14:00…) for each room. From then on, any edit is saved to the browser and survives refresh.

### 4.3 UI (new) — room × day grid

```
[PageHeader "Student Schedule"]       [Export (demo)]  [+ Add Entry]
[FilterBar: Week (◀ Mon 03 Aug – Sun 09 Aug ▶) | Room | Type | (optional) Staff]
[Summary chips: Activities this week · Rooms scheduled · Hours]
[Grid: rows = rooms, columns = 7 days]
       cell = entries for that room+day, colored by type, time shown
[Row totals per room]
```

> **Reading the layout:** Same spreadsheet idea, but now **rows are rooms**. Reading it is natural: look across "Sunshine Room" and you see its whole week — Monday has Circle + Art + Nap, Tuesday has Circle + Music + Outdoor, and so on.

- **Week picker**: ◀/▶ arrows + range label (copy the reference's `weekStart ± 7` logic).
  > *In plain words:* ◀ = previous week, ▶ = next week, and the label ("Mon 03 Aug – Sun 09 Aug") tells you the exact window.
- **Room rows**: rows come from `rooms` seed (`src/lib/moduleData.ts`: Sunshine, Rainbow, Star, Nest). If a room filter is chosen, only that row shows.
- **Type filter**: buckets entries by `type` (or a Shift-style Morning/Afternoon/Evening filter on the hour, like the reference).
- **Entry chip**: `HH:mm · Title` in a type-colored pill (Activity=accent, Meal=mint, Nap=lavender, Outdoor=mint, Circle=accent, Special=blush). Clicking an entry opens a **Drawer** with full details (title, type, date, time, room, staff, duration) + Edit/Delete.
  > *In plain words:* Each activity is a small colored pill showing the time and name — "09:00 · Morning Circle". The color tells you the kind of activity at a glance (yellow-ish for meals, purple for activities, etc.). Click a pill to open a side panel with the full details.
- **+ Add Entry modal**: date (default today), time, title, type select, room select, staff multi-select (from `staff` seed), optional duration. Save persists.
- **Edit** reopens the same modal pre-filled; **Delete** has a confirm dialog.
- **Mobile**: the 7-column grid collapses — either a horizontal-scroll week or a day-selector showing one day at a time (matching the app's responsive conventions).

### 4.4 Interactions checklist (how you'd use it)

> **In plain words:** The complete user journey, step by step.

1. **See the week** — open Student Schedule; default shows the current week.
2. **Move weeks** — ◀ / ▶; the label shows the exact range.
3. **Focus a room** — Room filter dropdown.
4. **Add an activity** — + Add Entry → fill the form → Save → chip appears in that room's day cell.
5. **Check a day** — read the chips in that day's column; times are visible.
6. **Drill in** — click a chip → drawer with details; Edit or Delete from there.
7. **Filter by type** — show only Meals, or only Activities, etc.

---

## 5. Where it fits in the app

> **In plain words:** The sidebar link and the route already exist — they just point at a placeholder. Building the feature means replacing that placeholder with a real page, exactly like I did for Resource Center and Manage.

- **Nav**: already registered — `src/lib/modules.ts` → Calendar → `{ id: 'student-schedule', label: 'Student Schedule', href: '/calendar/student-schedule' }`. The route page already exists as a placeholder; you'd **replace the placeholder** with the real page (same as I did for Resource Center / Manage).
- **Route file**: `src/app/(app)/calendar/student-schedule/page.tsx` — swap `CalendarSubPlaceholder` for the new component.
- **Design system**: use `PageHeader`, `Modal`/`Drawer`, `ui-btn*`, `ui-filter`, `mod-panel`; Panacea purple tokens only. The reference's teal chips (`#e8f7f9`/`#0f6e7c`) map to `--color-accent-soft`/`--color-accent`.
- **Sibling pages**: Staff Schedule (`/calendar/staff-schedule`), Staff Holidays, Birthday Calendar, School Calendar, Meal Planner are the natural neighbors — same patterns.

---

## 6. Step-by-step build plan (when you implement)

> **In plain words:** The order to build it in, and why. Each step produces something testable before moving to the next — types first (the vocabulary), then data (the facts), then storage (the memory), then the screen (the face), then polish.

1. `src/types/studentSchedule.ts` — types (as §4.1).
   > Define the vocabulary first: what an "entry" is and what kinds of activities exist. Everything else builds on this.
2. `src/lib/mock/mockStudentSchedule.ts` — a week of seeded entries for the 4 rooms.
   > Create realistic sample data (Morning Circle, Snack, Outdoor, Lunch, Nap, Story…) so the page has something to show the moment it exists.
3. `src/components/modules/calendar/student-schedule/store.ts` — load/save/add/update/remove (localStorage `panacea.calendar.studentSchedule`).
   > Add the memory layer: seed on first load, persist edits, survive refresh.
4. `src/components/modules/calendar/student-schedule/StudentSchedulePage.tsx` — week grid, filters, summary, drawer, modal; wire into `student-schedule/page.tsx`.
   > Build the screen: the room × day spreadsheet, the week picker, filters, the add/edit modal, and the details drawer. This is the bulk of the work.
5. `student-schedule.css` — grid + chips using Panacea tokens.
   > Style it — the grid lines, the colored pills, responsive behavior on mobile.
6. Build (`npm run build`) + dev-verify all routes.
   > Make sure it compiles and that `/calendar/student-schedule` (plus its neighbors) renders without errors.

---

## 7. Reference links

- **Reference page (copy the pattern):** `app/src/pages/calendar/StaffSchedulePage.tsx`
- **Reference model:** `app/src/data/types.ts` → `ScheduleEntry`; seed in `app/src/data/seed.literal.ts` / `seed.generated.ts`
- **Current placeholder (to replace):** `src/components/modules/calendar/CalendarSubPlaceholder.tsx`
- **Current route:** `src/app/(app)/calendar/student-schedule/page.tsx`
- **Panacea design rules:** `docs/DESIGN_SYSTEM.md` + `.cursor/rules/panacea-design-system.mdc`
