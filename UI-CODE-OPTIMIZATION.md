# UI-CODE-OPTIMIZATION.md — TaskGlowTimer SAFE-NOW cleanup plan

> ORDERED, executable optimization plan. Turns the approved structural draft
> (`NEW-DESIGN-DRAFT.md`, `design-draft-r1`) into a safe, behavior-preserving
> cleanup. Applies ONLY the 8 `[SAFE-NOW]` proposals from the draft's §8 ledger
> (rows 1–8). Every STAGED item (rows 9–15, 17–20, plus the feature-folder reorg
> row 16) is BACKLOG only and MUST NOT be applied in this run.
>
> Run: `2026-08-11-taskglowtimer-ui-audit-cleanup` · Revision: `optimization-plan-r1`
> Branch: `ui-audit-cleanup` · Baseline commit: `7cceea6` · Preference pointer: `skillset-saves/preferences/taste.md`
> Problem statement: `TaskGlowTimer/CURRENT-DESIGN-SYSTEM.md` (audit-r1). Structural draft: `TaskGlowTimer/NEW-DESIGN-DRAFT.md` (design-draft-r1, approved).

This is a PLANNING document. No source files are changed by writing it. The
classification SAFE-NOW / STAGED from the draft is authoritative and is not
reclassified here.

> Path note: the git repository root is `TaskGlowTimer/` itself (`.git` lives at
> `TaskGlowTimer/.git`). All git commands below run from `TaskGlowTimer/`. All
> `client/src/...` paths below are relative to `TaskGlowTimer/`. `npm run check`
> and `npm run build` run from `TaskGlowTimer/` (scripts confirmed in
> `package.json`: `"check": "tsc"`, `"build": "vite build && esbuild ..."`).

---

## 0. Non-negotiable constraint (inherited)

VOX Canvas r2.1 is frozen. No proposal in this batch introduces, removes, or
alters any color, type face, size, radius, border width, shadow, motion curve,
or spacing value that reaches the screen. Every extraction relocates the exact
same class string behind a shared component or a token-indirection; the merged
class list rendered at each call site is byte-identical to today. The three
genuinely visual STAGED items (draft rows 17/19/20) are explicitly OUT of scope.

The `cn()` helper is `twMerge(clsx(inputs))` (`client/src/lib/utils.ts:4`). It is
already the app's merge utility. Every new primitive composes its base constant
first, then the passthrough `className`, so `twMerge` resolves collisions
last-wins in the same order the hand-authored strings already imply. For the
specific classes migrated here there are **no colliding utility properties**
(the base constant and each call-site extra touch disjoint properties), so
`twMerge` is a pure concatenation for these inputs and the output is identical.

---

## 1. Execution order (dependency-ordered checklist)

Sequenced to minimize churn: primitives first (`Kbd`, then `EmptyState` which
consumes `Kbd`), then migrate call sites, then deletions (no dependency on the
primitives), then the `toggleTheme` dedupe, then the pure documentation edits.
One commit per step (see §5).

- [ ] **Step 1 — Create `Kbd` primitive.** New file `client/src/components/ui/Kbd.tsx`. No call-site edits yet. Touches: 1 new file.
- [ ] **Step 2 — Migrate the 5 kbd call sites to `<Kbd>`.** Touches: `client/src/pages/timer.tsx`, `client/src/components/GoalsList.tsx`, `client/src/components/QueuedTasksList.tsx`, `client/src/components/HelpPanel.tsx`.
- [ ] **Step 3 — Create `EmptyState` primitive (consumes `Kbd`).** New file `client/src/components/ui/EmptyState.tsx`. Touches: 1 new file.
- [ ] **Step 4 — Migrate the 3 empty-state call sites to `<EmptyState>`.** Touches: `client/src/components/GoalsList.tsx`, `client/src/components/QueuedTasksList.tsx`, `client/src/components/CompletedTasksList.tsx`.
- [ ] **Step 5 — Delete the 3 dead components.** Delete `client/src/components/CurrentGoal.tsx`, `client/src/components/GoalSelector.tsx`, `client/src/components/StatusIndicator.tsx`. No importer edits needed (0 consumers). Touches: 3 deletions.
- [ ] **Step 6 — Delete dangling tailwind tokens.** Touches: `tailwind.config.ts`.
- [ ] **Step 7 — Single `toggleTheme` helper.** New file `client/src/lib/theme.ts`; dedupe `ThemeToggle.tsx` + the `Shift+M` branch in `timer.tsx`. Touches: 1 new file, `client/src/components/ThemeToggle.tsx`, `client/src/pages/timer.tsx`.
- [ ] **Step 8 — Documentation edits.** Two-layer token model comment header in `client/src/index.css` + a note in `tailwind.config.ts`; retire `TaskGlowTimer/design_guidelines.md`. Touches: `client/src/index.css`, `tailwind.config.ts`, `design_guidelines.md`.
- [ ] **Invariant (Step 8b, guardrail — NOT an edit): retain the global focus-visible ring** at `client/src/index.css:242`. No step may add `outline-none`. Verified by grep, not changed.

> **Feature-folder reorg (draft row 16) is OUT of this run's apply scope.**
> The draft marks it `SAFE-NOW*` but recommends bundling it with the STAGED
> extractions so imports move once. Applying it now would churn the import graph
> twice (once here for `ui/Kbd`/`ui/EmptyState`, again in the STAGED run for
> `SelectionCard`/`GoalChip`/`Panel`/hooks). It is NOT trivially free (every
> `@/components/*` and relative import in `timer.tsx` and the lists would move).
> **DEFER it explicitly to the STAGED run.** This run places the two new
> primitives in the already-existing `client/src/components/ui/` directory only,
> introducing no new folders.

---

## 2. Per-step specification

### Step 1 — Create `Kbd` (`client/src/components/ui/Kbd.tsx`)

Base class constant copied verbatim from the meta-strip chip
(`timer.tsx:570-572`), which is the common denominator of all 5 sites:

`px-1.5 py-0.5 rounded-code border-thin border-border bg-card shadow-neo-sm text-foreground`

The `GoalsList`/`QueuedTasksList` sites add `font-bold`; the HelpPanel site is
the wide variant with a different geometry — both pass through `className`.

Full source to create (byte-for-byte authored to reproduce today's markup):

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const KBD_BASE =
  "px-1.5 py-0.5 rounded-code border-thin border-border bg-card shadow-neo-sm text-foreground";

interface KbdProps {
  children: ReactNode;
  className?: string;
}

export default function Kbd({ children, className }: KbdProps) {
  return <kbd className={cn(KBD_BASE, className)}>{children}</kbd>;
}
```

**HelpPanel wide-variant note.** The HelpPanel chip
(`HelpPanel.tsx:63`) is currently
`min-w-[80px] px-2 py-1 text-[10px] font-mono font-bold rounded-code bg-card text-foreground border-thin border-border shadow-neo-sm text-center flex-shrink-0`.
It overrides base padding (`px-2 py-1` vs `px-1.5 py-0.5`). Because `twMerge`
resolves colliding padding utilities last-wins and the passthrough className is
concatenated after `KBD_BASE`, `px-2 py-1` from the call site wins over the base
`px-1.5 py-0.5`, `min-w-[80px]` / `text-center` / `flex-shrink-0` / `font-bold`
/ `text-[10px]` / `font-mono` are additive, and `rounded-code bg-card
text-foreground border-thin border-border shadow-neo-sm` are identical in both
lists so they no-op. Resulting class set is identical to today. **This is the
one migration in the batch where `twMerge` actually resolves a collision
(padding), so it must be verified by rendered-class diff, not eyeballing — see
§3 Step 2 and the riskier-than-claimed flag in §8.**

### Step 2 — Migrate 5 kbd call sites

**2a. `timer.tsx:570` and `timer.tsx:572`** (meta strip). Add import
`import Kbd from "@/components/ui/Kbd";` to the timer import block (§1 lines
1–19 of `timer.tsx`).

Before:
```tsx
<kbd className="px-1.5 py-0.5 rounded-code border-thin border-border bg-card shadow-neo-sm text-foreground">Shift</kbd>
{' '}
<kbd className="px-1.5 py-0.5 rounded-code border-thin border-border bg-card shadow-neo-sm text-foreground">M</kbd>
```
After:
```tsx
<Kbd>Shift</Kbd>
{' '}
<Kbd>M</Kbd>
```
(These two carry no extra classes, so `className` is omitted; merged output = `KBD_BASE`, identical.)

**2b. `GoalsList.tsx:16`.** Add import `import Kbd from "./ui/Kbd";`.
Before → After:
```tsx
// before
press <kbd className="px-1.5 py-0.5 rounded-code border-thin border-border bg-card shadow-neo-sm font-bold text-foreground">G</kbd> · add a goal
// after
press <Kbd className="font-bold">G</Kbd> · add a goal
```
> Note: today's site orders `... shadow-neo-sm font-bold text-foreground`; the
> `Kbd` output is `... shadow-neo-sm text-foreground font-bold`. `font-bold`
> (font-weight) and `text-foreground` (color) do not collide, so the computed
> style is identical; only source-order of two non-conflicting tokens differs.
> This line is also removed entirely in Step 4 (folded into `EmptyState`); see
> the ordering note below.

**2c. `QueuedTasksList.tsx:54`.** Same transform as 2b (`import Kbd from "./ui/Kbd";`). Also removed in Step 4.

**2d. `HelpPanel.tsx:63`.** Add import `import Kbd from "./ui/Kbd";`.
Before:
```tsx
<kbd className="min-w-[80px] px-2 py-1 text-[10px] font-mono font-bold rounded-code bg-card text-foreground border-thin border-border shadow-neo-sm text-center flex-shrink-0">
  {item.key}
</kbd>
```
After:
```tsx
<Kbd className="min-w-[80px] px-2 py-1 text-[10px] font-mono font-bold text-center flex-shrink-0">
  {item.key}
</Kbd>
```
(`rounded-code bg-card text-foreground border-thin border-border shadow-neo-sm`
are dropped from the call site because they are in `KBD_BASE`; `px-2 py-1`
overrides the base padding via `twMerge`. Verify by class diff.)

> **Ordering interaction with Step 4:** the `GoalsList` and `QueuedTasksList`
> kbd sites (2b, 2c) live INSIDE the empty-state blocks that Step 4 replaces
> with `<EmptyState hint={...} />`. Doing Step 2 first then Step 4 means those
> two `<Kbd>` tags are authored once in Step 2 and simply relocated into the
> `hint` prop in Step 4 — no re-authoring. This is why `Kbd` precedes
> `EmptyState` in the order. Only the `timer.tsx` (2a) and `HelpPanel` (2d)
> kbd migrations are terminal (not touched again by Step 4).

`cn()` merge note: all 5 sites — base first, call-site className second; disjoint
properties except HelpPanel padding (handled last-wins by `twMerge`).

### Step 3 — Create `EmptyState` (`client/src/components/ui/EmptyState.tsx`)

Shared shell copied verbatim from the three empty-state blocks
(`GoalsList.tsx:14-17`, `QueuedTasksList.tsx:52-55`, `CompletedTasksList.tsx:38-41`).
The invariant shell is
`font-mono text-[10px] uppercase tracking-label text-muted-foreground leading-relaxed`
with a `font-bold` headline and an `mt-2` hint line. The per-site `py-4`/`py-6`
passes through `className`.

Full source to create:
```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const EMPTY_STATE_BASE =
  "font-mono text-[10px] uppercase tracking-label text-muted-foreground leading-relaxed";

interface EmptyStateProps {
  headline: string;
  hint: ReactNode;
  className?: string;
}

export default function EmptyState({ headline, hint, className }: EmptyStateProps) {
  return (
    <div className={cn(EMPTY_STATE_BASE, className)}>
      <div className="font-bold">{headline}</div>
      <div className="mt-2">{hint}</div>
    </div>
  );
}
```
`hint` is `ReactNode` so it carries `<Kbd>` and `<br />` exactly as today.

### Step 4 — Migrate 3 empty-state call sites

**4a. `GoalsList.tsx:12-19`.** Add import `import EmptyState from "./ui/EmptyState";` (keep the `Kbd` import from Step 2).
Before:
```tsx
if (goals.length === 0) {
  return (
    <div className="py-6 font-mono text-[10px] uppercase tracking-label text-muted-foreground leading-relaxed">
      <div className="font-bold">Empty stack</div>
      <div className="mt-2">press <Kbd className="font-bold">G</Kbd> · add a goal</div>
    </div>
  );
}
```
After:
```tsx
if (goals.length === 0) {
  return (
    <EmptyState
      className="py-6"
      headline="Empty stack"
      hint={<>press <Kbd className="font-bold">G</Kbd> · add a goal</>}
    />
  );
}
```

**4b. `QueuedTasksList.tsx:49-58`.** Add import `import EmptyState from "./ui/EmptyState";`.
Before:
```tsx
if (tasks.length === 0) {
  return (
    <div className="flex flex-col gap-2">
      <div className="py-4 font-mono text-[10px] uppercase tracking-label text-muted-foreground leading-relaxed">
        <div className="font-bold">Queue is dry</div>
        <div className="mt-2">press <Kbd className="font-bold">Q</Kbd> · line up the next task</div>
      </div>
    </div>
  );
}
```
After (the outer `flex flex-col gap-2` wrapper is PRESERVED at the call site to keep the DOM identical — draft §1 A2 note):
```tsx
if (tasks.length === 0) {
  return (
    <div className="flex flex-col gap-2">
      <EmptyState
        className="py-4"
        headline="Queue is dry"
        hint={<>press <Kbd className="font-bold">Q</Kbd> · line up the next task</>}
      />
    </div>
  );
}
```

**4c. `CompletedTasksList.tsx:36-43`.** Add import `import EmptyState from "./ui/EmptyState";`. No `Kbd` here (hint has a `<br />`, no chip).
Before:
```tsx
if (tasks.length === 0) {
  return (
    <div className="py-6 font-mono text-[10px] uppercase tracking-label text-muted-foreground leading-relaxed">
      <div className="font-bold">Nothing banked yet</div>
      <div className="mt-2">finish a task on the clock<br />and it lands here</div>
    </div>
  );
}
```
After:
```tsx
if (tasks.length === 0) {
  return (
    <EmptyState
      className="py-6"
      headline="Nothing banked yet"
      hint={<>finish a task on the clock<br />and it lands here</>}
    />
  );
}
```

`cn()` merge note: `EMPTY_STATE_BASE` first, then `py-4`/`py-6`. `py-*` does not
collide with anything in the base (base has no vertical padding), so it is
additive; identical output.

### Step 5 — Delete 3 dead components

Delete outright (0 importers confirmed by grep — the only `CurrentGoal` matches
in the tree are the `currentGoal`/`setCurrentGoal` *state* symbol in `timer.tsx`
and `use-persistence.ts`, not the component):
- `client/src/components/CurrentGoal.tsx` (40 LOC)
- `client/src/components/GoalSelector.tsx` (43 LOC)
- `client/src/components/StatusIndicator.tsx` (35 LOC)

No edits to any other file. `git rm` the three paths.

### Step 6 — Delete dangling tailwind tokens (`tailwind.config.ts`)

Remove the following, all confirmed dangling (defined in config, never defined in
`index.css`, never consumed by any component — audit §4/§8, grep count 0):

- `primary.border: "var(--primary-border)",` (`:66`)
- `secondary.border: "var(--secondary-border)",` (`:71`)
- `muted.border: "var(--muted-border)",` (`:76`)
- `accent.border: "var(--accent-border)",` (`:81`)
- `destructive.border: "var(--destructive-border)",` (`:86`)
- the entire `chart` block (`:89-95`)
- the entire `sidebar` block (`:96-101`)
- the entire `"sidebar-primary"` block (`:102-106`)
- the entire `"sidebar-accent"` block (`:107-111`)
- the entire `status` block (`:112-117`)

**KEEP** (real, defined app tokens, actually consumed):
- `card.border: "hsl(var(--card-border) / <alpha-value>)"` (`:56`) — consumed by `ui/card.tsx`.
- `popover.border: "hsl(var(--popover-border) / <alpha-value>)"` (`:61`).

After deletion, each of `primary`/`secondary`/`muted`/`accent`/`destructive`
retains only its `DEFAULT` + `foreground` keys. Tailwind emits only *used*
utilities, so removing these unused color entries cannot change any generated
CSS — zero render impact.

### Step 7 — Single `toggleTheme` helper

Create `client/src/lib/theme.ts`. Extract the exact add/remove-`dark`-class +
`localStorage.setItem('theme', …)` effect that is duplicated in
`ThemeToggle.tsx:20-30` and `timer.tsx:376-388`.

Full source to create:
```ts
export type Theme = "light" | "dark";

/** Apply a theme to the document root + persist it. Single source of truth
 *  for the dark-class toggle used by ThemeToggle and the Shift+M shortcut. */
export function applyTheme(theme: Theme): void {
  localStorage.setItem("theme", theme);
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

/** Read the current theme from the document root (not localStorage), matching
 *  the Shift+M branch's source of truth. */
export function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Flip and apply; returns the new theme so callers can sync React state. */
export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === "light" ? "dark" : "light";
  applyTheme(next);
  return next;
}
```

**Call site A — `ThemeToggle.tsx:20-30`.** Add import
`import { toggleTheme } from "@/lib/theme";`. The component keeps its local
`theme` state for the icon; `toggleTheme()` returns the new value so the state
stays in sync.
Before:
```tsx
const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  localStorage.setItem('theme', newTheme);

  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
```
After (rename local handler to avoid shadowing the imported helper):
```tsx
const handleToggle = () => {
  setTheme(toggleTheme());
};
```
…and update the button `onClick={handleToggle}`.

> Note: `ThemeToggle`'s mount `useEffect` (`:8-18`) reads `localStorage` and sets
> the initial class; that is initialization, not the toggle path, and is left
> as-is (or may optionally call `applyTheme(initialTheme)` — behavior-identical).
> Keep it unchanged to stay minimal.

**Call site B — `timer.tsx:376-388`** (the `Shift+M` branch). Add import
`import { toggleTheme } from "@/lib/theme";`.
Before:
```tsx
if (e.key === 'M' && e.shiftKey && !isInputFocused) {
  e.preventDefault();
  const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', newTheme);

  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  return;
}
```
After:
```tsx
if (e.key === 'M' && e.shiftKey && !isInputFocused) {
  e.preventDefault();
  toggleTheme();
  return;
}
```
The helper reads the current theme from the DOM class (`currentTheme()`),
exactly as the old inline branch did, so the localStorage value written and the
class toggled are identical. `data-testid`, DOM, and localStorage effects are
unchanged.

> Known pre-existing behavior preserved: the `Shift+M` branch does NOT update
> `ThemeToggle`'s internal React `theme` state (they were never wired), so the
> toggle-button icon can lag after a Shift+M press until the next ThemeToggle
> re-render. This is existing behavior; the dedupe does not change it. Do not
> "fix" it in this batch (it would be a behavior change).

### Step 8 — Documentation edits (no render impact)

**8a. Two-layer token model comment in `index.css`.** Insert a comment header
block (immediately after the existing tokens banner at `index.css:5-9`, before
`:root`) documenting the split. No token values change.
```css
/* ==========================================================================
   TWO-LAYER TOKEN MODEL
   THEME layer (r2.1, LOCKED — do not edit): color roles, radii, borders,
     shadows, motion, texture. On-spec per audit §2.
   APP layer (owner-ruled legitimate app tokens): --panel, --panel-foreground;
     --popover*, --card-border; --font-size-*; --leading-*; --tracking-nav;
     --space-*; --badge-outline, --button-outline,
     --opaque-button-border-intensity, --elevate-1, --elevate-2.
   No token value changes in this cleanup; this note is documentary only.
   ========================================================================== */
```

**8b. Note in `tailwind.config.ts`.** Add a short comment above the `colors:`
block (`:47`) pointing to the two-layer model and recording that the dangling
`--*-border`/`sidebar`/`chart`/`status` surface was removed in this cleanup:
```ts
/* Colors map r2.1 THEME tokens + owner-ruled APP tokens (see index.css
   TWO-LAYER TOKEN MODEL header). Dangling shadcn scaffolding
   (--*-border / sidebar* / chart* / status.*) removed 2026-08-11. */
```

**8c. Retire `design_guidelines.md`.** Replace its 227-line body with a one-line
pointer (preferred over deletion so the path does not 404 for anyone who
bookmarked it):
```
# Superseded. See CURRENT-DESIGN-SYSTEM.md (as-built) and the VOX Canvas r2.1
# design system (skillset-saves/runs/2026-08-09-arlabs-design-system/design-system/DESIGN.md).
```
(Full deletion via `git rm` is an acceptable alternative — the audit permits
either. The pointer is recommended.)

**8d. Focus-visible invariant (guardrail, NOT an edit).** `index.css:242`
`:focus-visible { outline: 3px solid hsl(var(--ring)); outline-offset: 2px }`
stays exactly as-is. None of the new primitives (`Kbd`, `EmptyState`) add
`outline-none`. Verified by grep in §3.

---

## 3. Per-step verification

Run after EACH step. `npm run check` (tsc) must PASS at every step. All grep
commands run from `TaskGlowTimer/`.

**Step 1 (Kbd created):**
- `npm run check` → PASS.
- `test -f client/src/components/ui/Kbd.tsx`.

**Step 2 (kbd sites migrated):**
- `npm run check` → PASS.
- `grep -rn "<kbd" client/src` → **0 matches** (all 5 inline `<kbd` replaced by `<Kbd`).
- `grep -rn "<Kbd" client/src/pages/timer.tsx client/src/components/GoalsList.tsx client/src/components/QueuedTasksList.tsx client/src/components/HelpPanel.tsx | wc -l` → **5**.
- Rendered-class check (HelpPanel padding collision): confirm the HelpPanel chip's computed class set (post-`twMerge`) contains `px-2 py-1` and NOT `px-1.5 py-0.5`. Do via a class-string snapshot render of `<Kbd className="min-w-[80px] px-2 py-1 text-[10px] font-mono font-bold text-center flex-shrink-0">` and diff against the pre-migration literal string set.

**Step 3 (EmptyState created):**
- `npm run check` → PASS.
- `test -f client/src/components/ui/EmptyState.tsx`.

**Step 4 (empty states migrated):**
- `npm run check` → PASS.
- `grep -rn "font-mono text-\[10px\] uppercase tracking-label text-muted-foreground leading-relaxed" client/src/components/GoalsList.tsx client/src/components/QueuedTasksList.tsx client/src/components/CompletedTasksList.tsx` → **0 matches** (inline empty-state shells gone).
- `grep -rn "<EmptyState" client/src/components | wc -l` → **3**.
- Confirm the QueuedTasksList outer `<div className="flex flex-col gap-2">` wrapper is still present around `<EmptyState/>`.

**Step 5 (dead components deleted):**
- `npm run check` → PASS.
- `test ! -e client/src/components/CurrentGoal.tsx && test ! -e client/src/components/GoalSelector.tsx && test ! -e client/src/components/StatusIndicator.tsx`.
- `grep -rn "CurrentGoal\b\|GoalSelector\|StatusIndicator" client/src` → **0 component references** (the only remaining hits must be the lowercase `currentGoal`/`setCurrentGoal` state symbol; assert no `import ... CurrentGoal/GoalSelector/StatusIndicator` line: `grep -rn "import.*\\(CurrentGoal\\|GoalSelector\\|StatusIndicator\\)" client/src` → **0**).

**Step 6 (dangling tokens deleted):**
- `npm run check` → PASS.
- `grep -nE "primary-border|secondary-border|muted-border|accent-border|destructive-border|sidebar|chart-[1-5]|status\\." tailwind.config.ts` → **0 matches**.
- `grep -rnE "\\b(border-primary|border-secondary|border-muted|border-accent|border-destructive)\\b|bg-chart-|sidebar|bg-status-" client/src` → **0 matches** (confirms nothing consumed them).
- Sanity: `grep -n "card-border\|popover-border" tailwind.config.ts` → **2 matches** (kept tokens intact).

**Step 7 (toggleTheme dedupe):**
- `npm run check` → PASS.
- `test -f client/src/lib/theme.ts`.
- `grep -rn "classList.add('dark')\|classList.add(\"dark\")" client/src` → **1 match** (only inside `lib/theme.ts`). Same for `classList.remove('dark')`. i.e. the toggle logic exists in exactly one place. (Note: `ThemeToggle.tsx`'s init `useEffect` retains its own `classList.add/remove('dark')` unless refactored to `applyTheme`; if left as-is, expect **2** matches and document that the init path is intentionally separate. Prefer refactoring init to `applyTheme(initialTheme)` to reach the single-source **1** — behavior-identical.)
- `grep -n "toggleTheme" client/src/pages/timer.tsx client/src/components/ThemeToggle.tsx` → both files import/use the helper.

**Step 8 (docs):**
- `npm run check` → PASS (no code change, but run for consistency).
- `grep -n "TWO-LAYER TOKEN MODEL" client/src/index.css` → **1**.
- `grep -n "Superseded" design_guidelines.md` → **1** (if pointer chosen) OR `test ! -e design_guidelines.md` (if deleted).
- Focus-visible invariant: `grep -n "focus-visible" client/src/index.css` → **1** (line ~242, unchanged); `grep -rn "outline-none" client/src/components/ui/Kbd.tsx client/src/components/ui/EmptyState.tsx` → **0**.

---

## 4. Batch verification gate (behavior-preservation contract)

The whole 8-item batch must satisfy ALL of the following before it lands. If any
fails, do NOT merge — revert the offending step (§5).

1. **`tsc` PASS.** `npm run check` clean.
2. **`vite build` PASS.** `npm run build` completes without error (build runs `vite build` then the esbuild server bundle).
3. **VISUAL PARITY vs the r2.1 baseline, both themes.** "Visual parity" is
   defined here as: on the **5 migrated surfaces** — (a) the meta-strip kbd
   chips (`timer.tsx` Shift / M), (b) the HelpPanel kbd chips, (c) the GoalsList
   empty state, (d) the QueuedTasksList empty state, (e) the CompletedTasksList
   empty state — the **rendered class string is identical** to the
   pre-migration string (set-equality after `twMerge` normalization; source
   order of non-colliding tokens may differ but the resolved utility set must
   match), AND a **pixel diff is zero** on those regions.
   - Reference shots (running instrument, both themes): `skillset-saves/runs/2026-08-09-arlabs-design-system/review/screenshots/r5-running-light.png` and `…/r5-running-dark.png`, plus the living-system shots in that review folder.
   - Harness: the run's headless `playwright-core` harness renders the app in
     both `light` and `dark`, captures the 5 surfaces, and diffs against the
     references. Because the kbd chips appear in the running-instrument shots
     and the empty states require an empty column, capture the empty states from
     a fresh (no goals / empty queue / no banked task) seed in both themes; diff
     against a baseline capture taken from `7cceea6` on the same seed (the r5
     references cover the kbd chips directly; the three empty-state regions are
     diffed against a `7cceea6` baseline capture since the r5 shots show
     populated columns).
   - PASS criterion: pixel diff = 0 on all 5 regions in both themes AND the
     class-set equality holds for all 5.
4. **QA walkthrough, zero defects.** Manual/harness pass over:
   - Keyboard flow: `t`/`q`/`g` focus; `Enter` start/promote; `Space` pause/resume; `Cmd/Ctrl+Enter` complete; `c`/`Q`/`G` select-first; `↑/↓`/`k`/`j` navigate; `d` delete; `T` restore; `Escape` deselect; **`Shift+M` toggles theme** (the deduped path — verify class + localStorage flip in both directions).
   - Add / promote / complete / delete: add a goal, add a queued task, quick-start (promote), complete a task to banked, delete a completed and a queued task.
   - Reload persistence: perform the above, reload, confirm hydrated state matches.
   - Empty-state rendering: with zero goals / empty queue / no banked tasks, confirm all three `<EmptyState>` blocks render with correct headline + hint (kbd chips in Goals/Queue, `<br/>` in Completed).
   Zero defects required.

Gate summary: `tsc` PASS · `vite build` PASS · pixel+class parity on 5 surfaces ×
2 themes · QA walkthrough zero defects. Only then does the batch merge.

---

## 5. Rollback

- **Branch:** `ui-audit-cleanup`. **Baseline commit:** `7cceea6` (confirmed present;
  git root is `TaskGlowTimer/`).
- **Commit strategy:** **one commit per SAFE-NOW step (8 commits + the 2 primitive-creation
  commits fold into their migration).** Concretely, 8 logical commits:
  1. `feat(ui): add Kbd primitive + migrate 5 kbd sites` (Steps 1–2)
  2. `feat(ui): add EmptyState primitive + migrate 3 empty states` (Steps 3–4)
  3. `chore: delete 3 dead components (CurrentGoal/GoalSelector/StatusIndicator)` (Step 5)
  4. `chore(tailwind): delete dangling tokens (sidebar/chart/status/*-border)` (Step 6)
  5. `refactor(theme): single toggleTheme helper (dedupe ThemeToggle + Shift+M)` (Step 7)
  6. `docs: document two-layer token model in index.css/tailwind.config` (Step 8a/8b)
  7. `docs: retire stale design_guidelines.md` (Step 8c)
  8. (focus-visible is an invariant — no commit)
  Keeping the primitive creation in the same commit as its migration avoids an
  intermediate commit with an unused export (cleaner `tsc`/lint per commit).
- **Per-step revert:** each step is an isolated commit, so a single failing step
  reverts with `git revert <sha>` (safe on a shared branch) without disturbing
  the others. Since steps are dependency-ordered, reverting a primitive-creation
  commit (1 or 2) requires reverting its dependents first; reverting the later
  independent steps (3–7) is standalone.
- **Full reset:** if batch parity fails wholesale, `git reset --hard 7cceea6`
  returns to baseline. Because every commit is small and self-contained, prefer
  targeted `git revert` over a full reset unless multiple steps fail.
- **Pre-merge tag:** tag the tip before merge (`git tag pre-cleanup-safe-now`) so
  the whole batch can be dropped in one move if post-merge parity regresses.

---

## 6. STAGED backlog (roadmap for a future run — DO NOT apply now)

Prioritized and sequenced. All 12 STAGED items from the draft's §8 ledger (rows
9–20 excluding the 8 applied here; row 16 feature-reorg is included as deferred).
Do NOT apply any of these under this run's look-preserving mandate.

**Wave 1 — extractions with class-diff proof (no behavior change intended):**

| # | Item | Draft ref | Depends on | Risk | Verification required |
|---|---|---|---|---|---|
| B1 | Extract `SelectionCard` (3 sites: `CompletedTask`, `GoalCard`, `QueuedTask`) | §1 A3, row 9 | none (but see B7 reorg) | Med — class-ORDER reordering; GoalCard `selectedClassName` override is the sharp edge | Rendered class-string snapshot per card, selected/unselected × light/dark; preserve `data-testid` for `GoalTaskConnections` |
| B2 | Extract `GoalChip` (2 live sites: `CompletedTask:51`, `TaskDetailsPanel:94`) | §1 A4, row 10 | none | Low | Snapshot the `badge` and `label` variants byte-for-byte |
| B3 | Extract `Panel` + `StatCell` (instrument panel, `timer.tsx:652-745`) | §1 optional Tier-A, row 11 | best landed with B4 (timer decomposition) | Med — large JSX move | Class-string parity on the panel + 3 stat cells; recommend bundling with B4 |

**Wave 2 — timer decomposition + correctness (must land together):**

| # | Item | Draft ref | Depends on | Risk | Verification required |
|---|---|---|---|---|---|
| B4 | `useTimerBoard` state hook | §2.1, row 12 | — | High — render identity / effect ordering | Full keyboard matrix, tick/medal cadence, hydration-from-seed, offline path |
| B5 | `useTimerKeyboard` module (~180-line reducer) | §2.2, row 13 | B4 | High — dependency-array reproduction | Same keyboard matrix; identical `preventDefault`/guard behavior |
| B6 | `lib/hydrate.ts` pure hydration mapping | §2.3, row 14 | B4 | Med | Unit tests on `hydrateGoals`/`hydrateTasks`/`hydrateSession` vs seeded server state |
| B7 | id-based task identity (fold `selectedQueuedTaskId`) | §4, row 15 | **bundle with B4/B5** (threads selection logic) | Med — changes collision edge-case behavior (intended) | Keyboard matrix + duplicate-title/same-start collision test; no visual impact |

> B7 explicitly bundles with B4/B5 (draft §4: "must land with the §2 state
> refactor"). B4/B5/B7 are a single reviewed change.

**Wave 3 — file organization (deferred from this run):**

| # | Item | Draft ref | Depends on | Risk | Verification |
|---|---|---|---|---|---|
| B8 | Feature-folder reorg (`goal/`, `queue/`, `timer/`, `completed/`, `overlay/`) | §5, row 16 | do WITH B1/B2/B3 so imports move once | Low (path-only) but wide diff | `tsc` PASS; grep no broken imports; no markup change |

**Wave 4 — visual / a11y items requiring OWNER SIGN-OFF (NOT behavior-preserving):**

| # | Item | Draft ref | Risk / visual | Verification |
|---|---|---|---|---|
| B9 | Disabled `Done` state (empty sticky) | §6, row 17 | **YES — Minor-visual.** Needs owner sign-off | Confirm disabled styling comes from existing `ui/button.tsx` disabled classes; screenshot review of Done in empty state |
| B10 | Enlarge clear-goal touch target (24px→44px) | §6, row 19 | **YES — Minor-visual (layout shift in truth strip).** Needs owner sign-off | Layout review of truth-strip cell |
| B11 | Toast red literals → `--destructive` token | §3, row 20 | **YES — Major-visual on destructive toast.** Out of scope; separate approval | Destructive-toast color review |

**Wave 5 — invisible a11y (bundle with feature refactor):**

| # | Item | Draft ref | Risk | Verification |
|---|---|---|---|---|
| B12 | ARIA labels on textareas + `aria-expanded` on HelpPanel toggle | §6, row 18 | Low, no pixel change | Screen-reader-name snapshot; bundle with B1–B3 so tests catch regressions |

Recommended landing order: **B1+B2+B3+B8 (extractions + reorg, one review)** →
**B4+B5+B7 (state core + correctness)** → **B6** → **B12** → **B9/B10/B11 only
after explicit owner sign-off.**

---

## 7. Metrics

**LOC delta (expected):**
- Dead-component removal: −118 LOC (`CurrentGoal` 40 + `GoalSelector` 43 + `StatusIndicator` 35). (Step 5)
- Dangling tailwind tokens: ~−30 LOC from `tailwind.config.ts` (5 `*.border` lines + chart 7 + sidebar 3 blocks + status 6). (Step 6)
- `toggleTheme` dedupe: ThemeToggle handler ~−8 LOC, Shift+M branch ~−9 LOC, minus new `lib/theme.ts` ~+22 LOC → net ~+5 LOC but −1 duplicated source of truth. (Step 7)
- Kbd/EmptyState extraction: two new files (~14 + ~20 LOC = +34) offset by shorter call sites (5 kbd strings collapse; 3 empty-state blocks collapse ~−18 LOC net at call sites) → roughly LOC-neutral to slightly positive at the file level, but −8 duplicated markup instances.
- `design_guidelines.md`: −227 LOC if deleted, or −225 (replaced by 2-line pointer). (Step 8c)

**Net LOC:** roughly **−340 to −365 LOC** across the batch (dominated by the
227-line stale doc + 118 dead LOC + ~30 config), before counting the ~+56 LOC of
new primitive/helper files. **Net ≈ −290 LOC** of shipped/maintained code.

**File-count delta:**
- New files: `+3` (`ui/Kbd.tsx`, `ui/EmptyState.tsx`, `lib/theme.ts`).
- Deleted files: `−3` (3 dead components) and `−1` if `design_guidelines.md` is deleted (or ±0 if replaced with a pointer).
- **Net file count: 0** (if guidelines replaced with pointer) or **−1** (if deleted).

**Redundancy count (before → after):**
- kbd chip markup sites: **5 → 1** (single `Kbd` primitive).
- empty-state blocks: **3 → 1** (single `EmptyState` primitive).
- theme-toggle logic sources: **2 → 1** (single `toggleTheme` helper).
- dead components: **3 → 0**.
- dangling config token blocks: **~10 → 0** (`chart`, `sidebar`, `sidebar-primary`, `sidebar-accent`, `status`, + 5 `*.border`).

---

## 8. Risk flags — SAFE-NOW items riskier than the draft implies (re-gate these)

1. **`Kbd` HelpPanel wide variant is the one true collision in the batch (Step 2d).**
   The draft treats all `Kbd` migrations as pure passthrough, but the HelpPanel
   site overrides base padding (`px-1.5 py-0.5` → `px-2 py-1`). That means the
   output depends on `twMerge` resolving a *colliding* property last-wins, not on
   simple concatenation. It is still behavior-preserving (last-wins gives
   `px-2 py-1`, matching today), but it is NOT a byte-identical string move — it
   is a byte-identical *resolved-set* move. **Verify with a rendered-class diff
   on the HelpPanel chip specifically**, not a static read. Low probability of a
   defect, but it is the single spot where the "same class string, relocated"
   claim is technically inexact. Re-gate.

2. **`grep "<kbd"` → 0 assumes no `<kbd` survives anywhere.** Confirmed today's
   count is exactly 5 and all 5 are migrated, so the assertion is valid — but if
   any future merge reintroduces an inline `<kbd`, the gate must stay strict.
   Low risk; noted for the gate.

3. **`toggleTheme` single-source assertion is muddied by ThemeToggle's init
   effect (Step 7).** `ThemeToggle.tsx:8-18` also calls
   `classList.add/remove('dark')` on mount. Unless that init path is refactored
   to `applyTheme(initialTheme)`, the "toggle logic in exactly one place" grep
   returns 2, not 1. Recommend refactoring init to `applyTheme` (behavior-
   identical) so the single-source claim holds; flagged so the gate expects the
   right count.

4. **Pre-existing Shift+M / ThemeToggle-icon desync is preserved, not fixed.**
   The Shift+M path does not update ThemeToggle's React state, so the icon can
   lag. The dedupe keeps this exactly as-is. Call it out in QA so a tester does
   not log it as a regression introduced by the dedupe.

5. **Empty-state class-order note (Step 2b/2c).** `Kbd` emits
   `... shadow-neo-sm text-foreground font-bold` where the original had
   `... shadow-neo-sm font-bold text-foreground`. Non-colliding (weight vs
   color), so identical computed style — but included in the class-set parity
   check to be safe.

Everything else in the SAFE-NOW batch (dead-component delete, dangling-token
delete, doc edits, focus-visible invariant) is genuinely mechanical with zero
render impact and matches the draft's risk assessment.
