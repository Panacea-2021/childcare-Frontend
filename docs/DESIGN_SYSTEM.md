# Panacea Design System

Canonical UI system for ChildCare FrontEnd.  
**Do not invent parallel styles.** Extend tokens and shared classes instead.

Tokens live in: `src/app/globals.css` (`:root`)  
Shared UI lives in: `src/app/globals.css`, `src/components/ui/`

---

## 1. Brand & typography

| Item | Spec |
|------|------|
| UI font | **Poppins** via `next/font` → `--font-poppins` |
| Body / display / mono | Map to Poppins: `var(--font-body)` / `var(--font-display)` / `var(--font-mono)` |
| Page headings (CM lists) | **Source Sans 3** via `next/font` → `--font-source-sans` / `var(--font-cm-title)` — `.cmph-title` with soft accent gradient shimmer |
| Sidebar subsections | Bodoni Moda on `.shell-subnavEditorial` for all module children (incl. Settings & Help with icons). Parent module labels stay Poppins. |
| Weights | 400 regular · 500 medium · 600 semibold |
| Rule | Do **not** use Georgia, Inter, Arial, system stacks, or monospace alternatives elsewhere |

---

## 2. Color tokens

### Accent (primary actions & table headers)

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-accent` | `#5D5FEF` | Primary buttons, table `<thead>`, focus rings, active accents |
| `--color-accent-hover` | `#4B51E0` | Primary hover |
| `--color-accent-soft` | `#E8F2FF` | Soft blue surfaces, form section shells |
| `--color-accent-soft-deep` | `#D6E4FF` | Section icon chips |

### Surfaces & chrome

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-white` / navbar / sidebar | `#FFFFFF` | Sidebar, top navbar, cards, modal chrome |
| `--page-bg` | `#FAFAF7` | Page canvas |
| `--color-input-bg` | `#F8FAFC` | Input / select / textarea fill |
| `--modal-header-bg` | `#DEECFF` | Modal/drawer header band only (not form body) |
| `--form-section-bg` | `#DEECFF` | Optional nested sections — do not wrap popup form fields |
| `--border` | `#E8EDF5` | Default borders |
| `--color-close` | `#E53935` | Modal/drawer Close control |

### Text

| Token | Hex |
|-------|-----|
| `--text-primary` | `#1F2937` |
| `--text-secondary` | `#6B7280` |
| Inverse on accent | `#FFFFFF` |

---

## 3. Buttons

Always use shared classes — never one-off button colors.

| Class | Look |
|-------|------|
| `ui-btn ui-btn-primary` | Fill `#5D5FEF`, text white (e.g. “+ Add program”, Save) |
| `ui-btn ui-btn-outline` | White fill, `#5D5FEF` border + text (Cancel) |
| `ui-btn ui-btn-secondary` | Soft blue fill, accent text |
| `ui-btn ui-btn-danger` | Soft red fill, red text |
| `ui-btn-pill` | Optional pill radius modifier |

Radius: `--btn-radius` (12px). Min height ~44px for standard buttons.

---

## 4. Inputs, dropdowns, textareas

| Class | Role |
|-------|------|
| `ui-field` | Field stack spacing |
| `ui-label` | Label above control (dark text) |
| `ui-input` | Text / date / number / native `<select>` styled as input |
| `ui-select` | Select (when used) |
| `ui-textarea` | Multiline |

**Look:**

- Background: `--color-input-bg` (`#F8FAFC`)
- Border: `#E8EDF5`, radius `--input-radius` (12px)
- Focus: accent border + soft accent ring
- Placeholder: muted gray (`#9AA3B2`)

Required marker (optional): `.ui-label .req` → red

Radios (when needed): `.ui-radio` — accent selected state

---

## 5. Tables (tabular format)

| Class | Role |
|-------|------|
| `ui-table` | All data tables |
| `ui-table-wrap` | Optional card wrapper |
| `ui-table-toolbar` | Search / filters above table |

**Header combo (mandatory):**

- Background: `--color-accent` (`#5D5FEF`) — same as primary / “Add program” button
- Text: white `#FFFFFF`

Body: white rows, light hover, `--border` dividers.

Do not create alternate table header themes per page.

---

## 6. Forms & popups

### Components (use these — mandatory for all add/edit views)

| Component | Path |
|-----------|------|
| `Modal` | `src/components/ui/Modal.tsx` |
| `Drawer` | `src/components/ui/Drawer.tsx` |

**Do not hand-roll popup chrome.** Every Add / Edit / Create form on the site must use `Modal` (or `Drawer` for side panels). Updating `Modal` / `Drawer` + `globals.css` updates every popup automatically.

### Popup structure (site-wide Add / Edit reference)

1. Soft header (`--modal-header-bg` = `#DEECFF`) — **white** icon chip + accent icon + title + orange **Close**  
2. White body only — no blue frame around the form fields  
3. Prefer two-column fields with `ui-grid-2` / `mod-grid-2`; use `ui-select` for dropdowns  
4. Footer: Outline **Cancel** (`ui-btn ui-btn-outline`) + Primary **Save** (`ui-btn ui-btn-primary`)

```tsx
<Modal
  open={open}
  title="Room Information"
  onClose={onClose}
  footer={
    <>
      <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>Cancel</button>
      <button type="button" className="ui-btn ui-btn-primary" onClick={onSave}>Save</button>
    </>
  }
>
  <div className="ui-grid-2">
    <div className="ui-field">
      <label className="ui-label">Room Name <span className="req">*</span></label>
      <input className="ui-input" />
    </div>
    <div className="ui-field">
      <label className="ui-label">Capacity <span className="req">*</span></label>
      <input className="ui-input" />
    </div>
  </div>
</Modal>
```

### In-page forms

| Class | Role |
|-------|------|
| `mod-form-card` | Page form blocks — soft blue header band + white body |

---

## 7. Shell (layout chrome)

| Element | Background |
|---------|------------|
| Sidebar (`.shell-sidebar`) | Pure white `#FFFFFF` |
| Top navbar (`.shell-topbar`) | Pure white `#FFFFFF` |

Keep width, nav order, and functionality unchanged unless explicitly requested.

---

## 8. Implementation checklist (for future UI work)

When adding or editing UI:

1. Reuse CSS variables from `:root` — do not hardcode random hex values.
2. Use `ui-btn*`, `ui-input` / `ui-select` / `ui-textarea`, `ui-table`, `Modal` / `Drawer`.
3. Table headers must stay accent + white.
4. Forms/popups must use shared `Modal` / `Drawer` (Room Information pattern).  
5. Font must remain Poppins.
6. Prefer extending `globals.css` / `module.css` over page-local one-off CSS.

---

## 9. Out of scope for ad-hoc changes

Unless explicitly requested, do not diverge:

- Sidebar structure / routing  
- Navbar layout / search / icons behavior  
- Backend, APIs, or business logic  

This document is the **design contract** for the project. Code changes should align to it; do not re-theme piecemeal.
