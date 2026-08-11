# NEW-DESIGN-DRAFT.md — TaskGlowTimer frontend structural redesign

> STRUCTURAL design draft. Target component/token/pattern architecture that removes the redundancy and dead code the audit found, WITHOUT changing the visual design. Every proposal renders pixel-identical to the current app unless explicitly flagged NOT behavior-preserving.
>
> Run: `2026-08-11-taskglowtimer-ui-audit-cleanup` · Revision: `design-draft-r1` · Preference pointer: `skillset-saves/preferences/taste.md`
> Problem statement: `TaskGlowTimer/CURRENT-DESIGN-SYSTEM.md` (audit-r1). Visual foundation (LOCKED): `skillset-saves/preferences/taste.md`, `skillset-saves/runs/2026-08-09-arlabs-design-system/design-system/DESIGN.md`.

This is a design document, not code. No source files were changed. Each proposal is tagged `[SAFE-NOW]` (behavior-preserving, mechanically verifiable) or `[STAGED]` (larger/riskier, needs equivalence testing) for the optimization phase. Class strings quoted below are copied verbatim from the current source so the shared primitives can be authored to emit byte-identical markup.

---

## 0. Non-negotiable constraint

The VOX Canvas r2.1 visual language is APPROVED and frozen: violet `#9977FF`, Archivo 900 display, Outfit body, JetBrains Mono labels, cream/ink palette, soft-neo radii (6/12/16/4px), 1.5/3/4px ink borders (1/1.5/2px dark), zero-blur translucent-ink offset shadows plus the single violet emphasis shadow, springy selection lift, radar-ping, inverse ink-panel dark idiom, dot-grid paper. **No proposal in this draft introduces, removes, or alters a color, type face, size, radius, border width, shadow, motion curve, or spacing value that reaches the screen.** Every extraction is a code-structure move: the same class strings, relocated behind a shared component or token indirection. Where a structural change could theoretically alter a pixel, it is flagged `[STAGED]` and Major in §8.

---

## 1. Target component taxonomy (3-tier)

### Tier A — design-system primitives to EXTRACT (`components/ui/`)

Each primitive is authored to emit the **exact** class string currently hand-rolled at its call sites, so output is byte-identical. Props exist only to cover the variation already present in the duplicates.

#### A1. `Kbd` — shortcut chip  `[SAFE-NOW]`
Traces to audit §5.4 (Major, "Duplicated kbd-chip markup") and DESIGN.md §5 (kbd chip is first-class furniture).

Collapses **5 duplicate sites**:
- `timer.tsx:570` and `timer.tsx:572` — `px-1.5 py-0.5 rounded-code border-thin border-border bg-card shadow-neo-sm text-foreground`
- `GoalsList.tsx:16` — same + `font-bold`
- `QueuedTasksList.tsx:54` — same + `font-bold`
- `HelpPanel.tsx:63` — `min-w-[80px] px-2 py-1 text-[10px] font-mono font-bold ... text-center flex-shrink-0` (the wide variant)

Proposed API:
```
<Kbd>{children}</Kbd>                       // default chip (meta strip, empty-state hints)
<Kbd className="min-w-[80px] ... text-center flex-shrink-0">…</Kbd>  // HelpPanel wide variant via className passthrough
```
Before (repeated 5x):
```
<kbd className="px-1.5 py-0.5 rounded-code border-thin border-border bg-card shadow-neo-sm font-bold text-foreground">G</kbd>
```
After:
```
<Kbd className="font-bold">G</Kbd>
```
Base class constant lives once in `Kbd`; per-site extras (`font-bold`, the wide HelpPanel geometry) pass through `className` and merge via `cn()`. Because the merged class list is identical to today's hand-rolled string, rendering is unchanged.

#### A2. `EmptyState` — empty-list block  `[SAFE-NOW]`
Traces to audit §5.3 (Major, "Duplicated empty-state block").

Collapses **3 duplicate sites**:
- `GoalsList.tsx:14` — `py-6 font-mono text-[10px] uppercase tracking-label text-muted-foreground leading-relaxed`, headline "Empty stack", hint "press `G` · add a goal"
- `QueuedTasksList.tsx:52` — `py-4 …` (same recipe, different top padding), headline "Queue is dry", hint "press `Q` · line up the next task"
- `CompletedTasksList.tsx:38` — `py-6 …`, headline "Nothing banked yet", hint "finish a task on the clock<br />and it lands here"

Proposed API:
```
interface EmptyStateProps {
  headline: string;
  hint: React.ReactNode;      // ReactNode so hints keep <Kbd> and <br/> exactly as today
  className?: string;         // carries the py-4 / py-6 difference
}
```
Before/after sketch:
```
// before (GoalsList)
<div className="py-6 font-mono text-[10px] uppercase tracking-label text-muted-foreground leading-relaxed">
  <div className="font-bold">Empty stack</div>
  <div className="mt-2">press <kbd …>G</kbd> · add a goal</div>
</div>
// after
<EmptyState className="py-6" headline="Empty stack"
  hint={<>press <Kbd className="font-bold">G</Kbd> · add a goal</>} />
```
The wrapper, `font-bold` headline, and `mt-2` hint line are the shared shell; `py-*` passes through. Identical DOM.

> Note: QueuedTasksList's empty state is currently wrapped in an extra `<div className="flex flex-col gap-2">` (`QueuedTasksList.tsx:51`). Preserving that wrapper keeps output identical; it can stay at the call site around `<EmptyState/>`.

#### A3. `SelectionCard` — shared neo selection-card shell  `[STAGED]`
Traces to audit §5.2 (Major, "Copy-pasted neo card class cluster across four cards").

Collapses the selection-card idiom in **3 sites** (the audit says "four cards" counting the concept; three carry the full duplicated cluster):
- `CompletedTask.tsx:28` — `w-full min-h-11 text-left … rounded-card bg-card text-card-foreground border-thin hover-elevate active-elevate-2 transition-transform duration-fast ease-neo` + ternary `isSelected ? "border-primary neo-selected" : "border-border shadow-neo-sm"`
- `GoalCard.tsx:22` — same base with `bg-primary text-primary-foreground … dark:bg-card dark:text-card-foreground` and ternary `isSelected ? "border-foreground dark:border-primary dark:text-primary neo-selected" : "border-border shadow-neo-sm"`
- `QueuedTask.tsx:38` — `group flex items-center gap-2 min-h-11 … rounded-card border-thin cursor-move hover-elevate active-elevate-2 transition-transform duration-fast ease-neo` + ternary `isSelected ? "bg-muted border-primary neo-selected" : "bg-muted border-border shadow-neo-sm"`

The three share the invariant spine: `min-h-11 rounded-card border-thin hover-elevate active-elevate-2 transition-transform duration-fast ease-neo` and the selected/unselected border+shadow ternary `isSelected ? "border-primary neo-selected" : "border-border shadow-neo-sm"`. They diverge on element type (`button` vs `div`), surface fill (`bg-card` / `bg-primary … dark:bg-card` / `bg-muted`), layout (`text-left pl-16 pr-4 py-3` vs `flex items-center gap-2 py-2 px-3`), cursor (`cursor-move`), the `group` marker, and GoalCard's non-standard selected class (`border-foreground dark:border-primary dark:text-primary`, which differs from the other two).

Proposed API — a **slot/shell** primitive that owns only the invariant spine + the standard selection ternary, with surface/layout/element supplied by the consumer:
```
interface SelectionCardProps {
  as?: 'button' | 'div';               // element type (default 'button')
  isSelected?: boolean;
  selectedClassName?: string;          // GoalCard overrides the default selected classes
  className?: string;                  // per-card surface + layout (bg-*, padding, flex, cursor, group)
  ...passthrough (onClick, draggable, drag handlers, data-testid, aria, children)
}
```
Default composition:
```
cn(
  "min-h-11 rounded-card border-thin hover-elevate active-elevate-2 transition-transform duration-fast ease-neo",
  className,
  isSelected
    ? (selectedClassName ?? "border-primary neo-selected")
    : "border-border shadow-neo-sm",
)
```
Consumers become thin:
```
// CompletedTask
<SelectionCard as="button" isSelected={isSelected}
  className="w-full text-left relative pl-16 pr-4 py-3 bg-card text-card-foreground"
  data-testid={`card-task-${id}`} onClick={onClick}> … </SelectionCard>

// GoalCard (overrides selected classes to match today exactly)
<SelectionCard as="button" isSelected={isSelected}
  className="w-full text-left px-4 py-3 bg-primary text-primary-foreground dark:bg-card dark:text-card-foreground"
  selectedClassName="border-foreground dark:border-primary dark:text-primary neo-selected"
  data-testid={`card-goal-${goal.id}`} …> … </SelectionCard>

// QueuedTask
<SelectionCard as="div" isSelected={isSelected}
  className="group flex items-center gap-2 py-2 px-3 bg-muted cursor-move"
  draggable data-testid={`queued-task-${id}`} …> … </SelectionCard>
```

**Why `[STAGED]`, not SAFE-NOW:** Tailwind class *order* matters when utilities collide, and this refactor reorders the concatenation (base spine first, then per-card `className`, then the selection ternary) relative to today's hand-authored order. For these specific classes there is no colliding-property overlap (surface/layout classes don't conflict with the spine), so the computed style should be identical — but proving it requires a rendered-DOM class diff, not a static read. GoalCard's `selectedClassName` override is the sharp edge: its selected state is `border-foreground dark:border-primary dark:text-primary` (not the default `border-primary`), and mis-wiring it would visibly change the goal-card selected border. Extraction is safe *only if* the override is passed exactly. Verify with a class-string snapshot test per card in both selected/unselected × light/dark before landing.

#### A4. `GoalChip` — violet goal token  `[STAGED]`
Traces to audit §5.5 (Major, "Two divergent goal-chip renderings for the same concept").

Collapses **2 live sites** (+2 dead/overlapping the audit names):
- `CompletedTask.tsx:51` — abbrev badge: `px-1.5 py-0.5 text-[10px] font-mono font-black tracking-label rounded-md bg-primary text-primary-foreground border-thin border-border`
- `TaskDetailsPanel.tsx:94` — full name: `inline-block px-2 py-1 rounded-md text-sm font-semibold bg-primary text-primary-foreground border-thin border-border`
- (dead `CurrentGoal.tsx:19` is deleted in §5, not migrated; the `timer.tsx:684` truth-strip goal name is NOT a chip — it is a bare `font-display` heading with no chip background, so it is intentionally NOT migrated.)

The two live sites share `rounded-md bg-primary text-primary-foreground border-thin border-border` but differ in padding and type (`text-[10px] font-mono font-black tracking-label` badge vs `text-sm font-semibold` label). Proposed API with a size variant that reproduces each exactly:
```
<GoalChip variant="badge">{abbrev}</GoalChip>   // px-1.5 py-0.5 text-[10px] font-mono font-black tracking-label
<GoalChip variant="label">{title}</GoalChip>    // inline-block px-2 py-1 text-sm font-semibold
```
Shared base: `rounded-md bg-primary text-primary-foreground border-thin border-border`.

**Why `[STAGED]`:** only two consumers with genuinely different type/padding; the variant map must reproduce both byte-for-byte. Low risk but crosses a component boundary and needs a snapshot check. Could be de-scoped to a later run without loss.

### Tier B — feature components (consume the primitives)

No new components; the existing presentational components are refactored to consume Tier A and to receive state from the new hooks (§2). Ownership after refactor:

| Feature area | Components | Consumes |
|---|---|---|
| Goal | `GoalInput`, `GoalCard`, `GoalsList` | `SelectionCard`, `EmptyState`, `Kbd` |
| Task queue | `QueueInput`, `QueuedTask`, `QueuedTasksList` | `SelectionCard`, `EmptyState`, `Kbd` |
| Timer / instrument | `BrandBadge`, `CircularTimer`, `TimerControls`, `StickyNote`, `RewardStack`, `RewardIcon` | (unchanged markup) `Panel`/`StatCell` (§1 Tier A optional, see below) |
| Completed / banked | `CompletedTask`, `CompletedTasksList`, `TaskRewards` | `SelectionCard`, `EmptyState`, `GoalChip` |
| Detail | `TaskDetailsPanel` | `GoalChip` |
| Overlays | `HelpPanel`, `ThemeToggle` | `Kbd` |

#### Optional Tier-A: `Panel` + `StatCell` for the instrument panel  `[STAGED]`
Traces to audit §5.6 (the instrument panel is ~95 lines of inline JSX in `timer.tsx:652-745`) and DESIGN.md §5 ("inverse steering card" / instrument-panel furniture named as a first-class idiom). This is a **presentational extraction of the god-page's markup**, complementary to the state split in §2.

- `Panel` — wraps `panel-ink rounded-hub border-thin border-border shadow-neo-accent overflow-hidden` (`timer.tsx:652`) with head-strip / body / cascade slots.
- `StatCell` — the truth-strip cell recipe repeated **3x** in `timer.tsx:665-708` (`px-4 py-3 border-r panel-hairline-soft` + `font-display font-black text-xl text-primary leading-tight` value + `font-mono text-[8px] uppercase tracking-label panel-muted` caption). The third cell (current goal, `:681`) is a variant with a clear button and truncation.

Tagged `[STAGED]` because it moves a large block of the page's JSX; output is identical but it is not a mechanical dead-code delete. Recommend landing it together with the timer decomposition (§2), not in the SAFE-NOW batch.

### Tier C — page composition
`pages/timer.tsx` becomes a thin composition shell: it calls the state hooks (§2), lays out the three columns + instrument `Panel`, and passes state/handlers down. Target size after decomposition: page JSX only, well under 200 LOC (from 809). See §2 for the module boundaries.

---

## 2. Decomposing the `timer.tsx` god component  `[STAGED]`

Traces to audit §5.6 (Major, "god component"), §5.7 (Major, "two parallel selected-task state shapes"), §7 ("all state in pages/timer.tsx"). 809 LOC, 14 `useState` (`:37-55`), a ~180-line inline keyboard reducer (`:365-551`), hydration mapping (`:97-187`), reward consolidation, and every handler.

**Target module boundaries** (behavior identical; this is a move-and-wrap, not a rewrite):

1. **`hooks/useTimerBoard.ts` — the state core.** Owns the 14 `useState` fields, `intervalRef`, the tick/medal `useEffect` (`:189-227`), the hydration `useEffect` (`:97-187`), `consolidateRewards`, and the domain handlers (`handlePlayPause`, `handleDone`, `handleAddToQueue`, `handleAddGoal`, `handleQuickStart`, promote/clear goal, reorder, select). Wires `usePersistence`. Returns a typed board object `{ state, actions }`. Optionally exposed via a `TimerBoardContext` so children read without prop-drilling, but drilling is fine to keep the diff small — either is behavior-preserving.

2. **`hooks/useTimerKeyboard.ts` — the keyboard module.** The entire `keydown` handler (`:365-551`) moves here as a hook that takes the board's state + actions and installs/removes the listener. This isolates the ~180-line reducer and its dependency array. No behavior change: same key map, same `isInputFocused` guard, same `preventDefault`.
   - Sub-move `[SAFE-NOW]`-adjacent: the `Shift+M` theme-toggle branch (`:376-388`) currently duplicates `ThemeToggle.tsx:20-30` (audit §5.9). Route both through one `lib/theme.ts` `toggleTheme()` helper. This is a small dedupe that produces identical DOM/localStorage effects. Tag `[SAFE-NOW]` on its own; it rides along with the keyboard extraction.

3. **`lib/hydrate.ts` — pure hydration mapping.** The wire→view mapping (`:108-186`: goals split, queued/completed mapping, session/reward reconstruction, medal-backfill loop) extracted as pure functions (`hydrateGoals`, `hydrateTasks`, `hydrateSession`). Deterministic, unit-testable, called by `useTimerBoard`'s hydration effect.

4. **`pages/timer.tsx` — composition only.** Renders columns + `Panel` from Tier A/B, consuming `useTimerBoard()` and calling `useTimerKeyboard(board)`.

**Why `[STAGED]` (all four):** moving state into a hook/context changes render identity and effect-dependency wiring. It is behavior-preserving *by intent*, but React re-render timing, effect ordering, and the giant keyboard dependency array (`:551`) must be reproduced exactly. This needs equivalence testing (the full keyboard-shortcut matrix, hydration from a seeded server state, the tick/medal cadence, offline path) — not a mechanical transform. Land it as its own reviewed change, after the SAFE-NOW batch.

**Bundled correctness fix (see §4):** the state split should adopt id-based task identity at the same time, because both touch the same selection logic.

---

## 3. Token layering

Traces to audit §4 and §8 (token diff).

### Codify the two-layer model (documentation move, `[SAFE-NOW]`)
- **THEME layer (r2.1, LOCKED):** color roles, radii, borders, shadows, motion, texture — all present and on-spec per audit §2. Do not touch.
- **APP layer (owner-ruled legitimate):** `--panel`, `--panel-foreground`; `--popover`, `--popover-foreground`, `--popover-border`; `--card-border`; `--font-size-xs…4xl`; `--leading-none/tight/normal/relaxed`; `--tracking-nav`; `--space-0…8`; `--badge-outline`, `--button-outline`, `--opaque-button-border-intensity`, `--elevate-1`, `--elevate-2`.

Record this split as a comment header block in `index.css` and a short note in `tailwind.config.ts`. No token values change; purely documentary.

### Delete DANGLING tailwind tokens  `[SAFE-NOW]`
Traces to audit §4 (two Major findings: "Config references tokens that no CSS defines", "Hardcoded off-token status.* palette"). These are defined in `tailwind.config.ts`, never defined in `index.css`, and never consumed by any component (audit grep count = 0). Deleting the config entries is dead-code removal with zero render impact.

Delete from `tailwind.config.ts`:
- `primary.border: "var(--primary-border)"` (`:66`)
- `secondary.border: "var(--secondary-border)"` (`:71`)
- `muted.border: "var(--muted-border)"` (`:76`)
- `accent.border: "var(--accent-border)"` (`:81`)
- `destructive.border: "var(--destructive-border)"` (`:86`)
- the entire `chart` block, `chart-1..5` (`:89-95`)
- the entire `sidebar`, `sidebar-primary`, `sidebar-accent` blocks (`:96-111`)
- the entire `status` block — `online/away/busy/offline` raw `rgb()` literals (`:112-117`)

**Keep** `card.border` (`:56` → `--card-border`, a defined app token, consumed by `ui/card.tsx:12`) and `popover.border` (`:61` → `--popover-border`, a defined app token). These are real; only the undefined `--*-border`/`--sidebar*`/`--chart*` and the off-system `status.*` rgb block go.

Mechanically verifiable: after deletion, grep confirms no component references `border-primary`/`border-secondary`/`border-muted`/`border-accent`/`border-destructive`/`bg-chart-*`/`*sidebar*`/`bg-status-*`. Since Tailwind only emits utilities that are used, removing unused color entries cannot change any generated CSS.

### Off-token red literals in retained toast  `[STAGED / defer]`
Audit §4 Minor: `ui/toast.tsx:78` uses `text-red-300/red-50/ring-red-400/ring-offset-red-600` instead of `--destructive`. Swapping to token classes **would change rendered color** on a destructive toast (currently reachable only via the offline toast, which does not trip the `ToastClose` variant). This is NOT behavior-preserving at the pixel level for that variant — flag Major-visual, `[STAGED]`, out of scope for a look-preserving pass. Leave as-is or address under a separate visual-tweak approval.

### Arbitrary `text-[Npx]` vs `--font-size-*`  `[STAGED / defer]`
Audit §4 Minor: components reach for `text-[8px]/[9px]/[10px]` instead of the `--font-size-*` app tokens. Converting could shift rendering if any arbitrary value doesn't map exactly to a token step. Behavior-preserving ONLY where the arbitrary value equals a token value; otherwise it's a visual change. Defer; not needed for the cleanup goal.

---

## 4. Data-model correctness — id-based task identity  `[STAGED]`

Traces to audit §5.7 (Major). Completed-task identity currently uses `title` + `startTime` at `timer.tsx:424, 428, 445, 452, 503, 527` (and the `selectedTaskId` derivation at `:608`). Two completed tasks with the same title and same start minute collide, even though a stable `id` exists on `CompletedTaskData` (`:274` on create, `:136` on hydrate).

**Change:** the `selectedTask` union (`:46-50`) carries `id` for the completed case as well as the queued case; all `completedTasks.find(t => t.title === … && t.startTime === …)` lookups (delete `:424/:428`, restore `:445/:452`, up/down nav `:503/:527`) become `completedTasks.find(t => t.id === selectedTask.id)` / `.filter(t => t.id !== selectedTask.id)`. The `selectedTaskId` computation at `timer.tsx:608` collapses to `selectedTask?.type === 'completed' ? selectedTask.id : null`.

This also resolves audit §5.7's "two parallel selected-task state shapes": with `id` on both branches, `selectedQueuedTaskId` becomes redundant with `selectedTask.id` and can be folded away inside `useTimerBoard`.

**Why `[STAGED]`:** it is a correctness improvement, so by definition it changes behavior in the collision edge case (that's the point) — not "behavior-preserving." The common path (unique tasks) is unchanged, but the union-shape change threads through the keyboard handler and the selection derivation, so it must land with the §2 state refactor and be tested against the keyboard matrix. Do NOT put in the SAFE-NOW batch. No visual impact.

---

## 5. File organization

Traces to audit §7 ("flat components/, no feature folders") and the stale-artifact finding.

### Proposed layout
```
client/src/
  components/
    ui/                      # design-system primitives (shadcn + extracted)
      button.tsx  card.tsx  toast.tsx  toaster.tsx  tooltip.tsx   (retained)
      Kbd.tsx                # NEW (A1)
      EmptyState.tsx         # NEW (A2)
      SelectionCard.tsx      # NEW (A3)
      GoalChip.tsx           # NEW (A4)
      Panel.tsx  StatCell.tsx  # NEW (optional Tier-A, instrument panel)
    goal/                    # GoalInput, GoalCard, GoalsList
    queue/                   # QueueInput, QueuedTask, QueuedTasksList
    timer/                   # BrandBadge, CircularTimer, TimerControls, StickyNote, RewardStack, RewardIcon
    completed/               # CompletedTask, CompletedTasksList, TaskRewards
    overlay/                 # HelpPanel, ThemeToggle, TaskDetailsPanel, GoalTaskConnections
  hooks/
    use-persistence.ts  use-toast.ts   (existing)
    useTimerBoard.ts         # NEW (§2.1)
    useTimerKeyboard.ts      # NEW (§2.2)
  lib/
    queryClient.ts  utils.ts   (existing)
    hydrate.ts               # NEW (§2.3)
    theme.ts                 # NEW (§2.2 sub-move: single toggleTheme)
  pages/  timer.tsx  not-found.tsx
  types/  goal.ts  reward.ts
```
The feature-folder move (`goal/`, `queue/`, …) is `[SAFE-NOW]` in isolation (pure path change + import updates, no markup change) but only pays off alongside the extractions; recommend doing it in the same reviewed change as the primitives so imports move once.

### Delete dead components  `[SAFE-NOW]`
Traces to audit §5.1 (Major, ~118 LOC dead). No importer anywhere under `client/src`:
- `components/CurrentGoal.tsx` (40 LOC)
- `components/GoalSelector.tsx` (43 LOC)
- `components/StatusIndicator.tsx` (35 LOC)

Mechanically verifiable dead-code delete: static import grep = 0 consumers (audit §8 import graph). Removes the duplicated concepts the audit flagged (truth-strip chip vs `CurrentGoal`, status word vs `StatusIndicator`).

### Retire the stale `design_guidelines.md`  `[SAFE-NOW]`
Traces to audit §7 (Major, stale artifact). `TaskGlowTimer/design_guidelines.md` (227 LOC) is the pre-reskin spec — it names "Linear/Apple HIG", "Inter", minimal white — all contradicting shipped r2.1. `CURRENT-DESIGN-SYSTEM.md` now supersedes it. **Recommendation:** delete it, or replace its body with a one-line pointer:
```
# Superseded. See CURRENT-DESIGN-SYSTEM.md (as-built) and the VOX Canvas r2.1
# design system (skillset-saves/runs/2026-08-09-arlabs-design-system/design-system/DESIGN.md).
```
Non-code doc change; no render impact.

### Dead exports / near-orphan primitives  `[STAGED / defer]`
Audit §5.10, §5.14 (Minor): `ui/card.tsx` exports 4 unused parts (only `Card`+`CardContent` used, in `not-found.tsx`); `ui/tooltip.tsx` provider is wired but no `TooltipContent` renders. Trimming unused shadcn exports is low-value and risks touching primitives that a future consumer expects; defer. No visual impact either way.

---

## 6. Accessibility / state-coverage targets

Traces to audit §6. Fold the gaps into the shared primitives as target requirements. **All are behavior-preserving relative to the locked visuals** (focus-visible is already global and stays; new `aria-*` attributes and disabled *states* do not change default rendering).

- **Focus-visible ring — RETAIN.** Global `:focus-visible { outline: 3px solid hsl(var(--ring)); outline-offset: 2px }` (`index.css:242`) is on-spec (ink light / violet dark). No change; the extractions must not add `outline-none` anywhere. `[SAFE-NOW]` (invariant to preserve).
- **`Kbd` is the single kbd target** — DESIGN.md §5 furniture; centralizing guarantees consistent chip semantics. `[SAFE-NOW]`.
- **`EmptyState` is the single empty-state primitive** — covers the empty column state uniformly. `[SAFE-NOW]`.
- **Disabled state via shared primitives `[STAGED]`.** Audit §6: "no app control is ever disabled" (e.g. Done no-ops on empty sticky, `timer.tsx:262`). Target: `TimerControls` Done accepts a `disabled` prop driven by `!currentTask.trim()`, using the *existing* `disabled:` styling already present in `ui/button.tsx:8` — no new tokens. **This changes rendering** (a disabled visual appears where none does today), so it is NOT behavior-preserving → `[STAGED]`, and needs owner sign-off because it alters the look of the Done button in the empty state. Flag Minor-visual.
- **ARIA labels on textareas `[STAGED]`.** Audit §6: `GoalInput`/`QueueInput`/`StickyNote` have placeholders but no `aria-label`; `HelpPanel` toggle lacks `aria-expanded`. Adding these attributes is invisible (no pixel change) and could be `[SAFE-NOW]` at the DOM level, but tag `[STAGED]` to bundle with the feature-component refactor so tests catch any screen-reader-name regressions. No visual impact.
- **Clear-goal touch target `[STAGED]`.** Audit §6: the truth-strip `✕` is `min-h-6 min-w-6` (~24px, `timer.tsx:695`), below the 44px taste rule. Enlarging the hit area **would change layout** in the tight truth-strip cell → NOT behavior-preserving; flag Minor-visual, `[STAGED]`, needs owner sign-off.
- **Loading / hydration state `[STAGED]`.** Audit §6/§7: no skeleton; cold hydration shows empty defaults (`timer.tsx:97-101`). Adding a loader is new UI (new rendering) → out of scope for a look-preserving pass; `[STAGED]`, note for a future run.
- **Keyboard drag-reorder `[STAGED]`.** Audit §6: queue reorder is HTML5-drag only, no keyboard alternative. New interaction; `[STAGED]`, future run.

---

## 7. Fragile coupling note (informational)

Audit §5.8 (Minor): `GoalTaskConnections.tsx` locates cards via `document.querySelector('[data-testid=…]')` and repaints on `setInterval(…, 500)`. Any refactor of the card components MUST preserve the exact `data-testid` strings (`card-goal-…`, `card-task-…`) — the `SelectionCard` extraction (§1 A3) passes `data-testid` through unchanged specifically to keep this wiring intact. Re-architecting the connection layer off DOM-polling is a larger structural change; `[STAGED]`, not required for the cleanup and out of scope here. No visual impact when test-ids are preserved.

---

## 8. Behavior-preservation ledger

| # | Proposal | Tag | Visual change? |
|---|---|---|---|
| 1 | Extract `Kbd` (5 sites) | SAFE-NOW | none |
| 2 | Extract `EmptyState` (3 sites) | SAFE-NOW | none |
| 3 | Delete 3 dead components (§5) | SAFE-NOW | none |
| 4 | Delete dangling tailwind tokens (§3) | SAFE-NOW | none |
| 5 | Retire `design_guidelines.md` (§5) | SAFE-NOW | none |
| 6 | Document two-layer token model (§3) | SAFE-NOW | none |
| 7 | Single `toggleTheme` helper (§2.2) | SAFE-NOW | none |
| 8 | Retain global focus-visible ring (§6) | SAFE-NOW | none (invariant) |
| 9 | Extract `SelectionCard` (3 sites) | STAGED | none intended; needs class-diff proof |
| 10 | Extract `GoalChip` (2 sites) | STAGED | none intended; needs snapshot |
| 11 | Extract `Panel`/`StatCell` (§1) | STAGED | none intended; large JSX move |
| 12 | `useTimerBoard` state hook (§2.1) | STAGED | none |
| 13 | `useTimerKeyboard` module (§2.2) | STAGED | none |
| 14 | `lib/hydrate.ts` pure mapping (§2.3) | STAGED | none |
| 15 | id-based task identity (§4) | STAGED | none (correctness) |
| 16 | Feature-folder reorg (§5) | SAFE-NOW* | none (*bundle with extractions) |
| 17 | Disabled Done state (§6) | STAGED | YES — Minor-visual, needs sign-off |
| 18 | ARIA labels / aria-expanded (§6) | STAGED | none |
| 19 | Enlarge clear-goal target (§6) | STAGED | YES — Minor-visual, needs sign-off |
| 20 | Toast red literals → token (§3) | STAGED | YES — Major-visual, out of scope |

**Count: 8 SAFE-NOW · 12 STAGED.** (Row 16 is SAFE-NOW in isolation but recommended bundled.) Three STAGED items (17, 19, 20) would alter rendering and are explicitly flagged for owner sign-off; the optimization plan must NOT apply them under the look-preserving mandate.

---

## 9. Taste alignment

- **No change to r2.1 tokens, idioms, or `taste.md`.** No new color, type face, size, radius, border width, shadow, motion curve, spacing value, or furniture idiom is proposed. Violet `#9977FF`, Archivo 900, cream/ink, soft-neo radii, translucent offset shadows, the single violet emphasis shadow, springy selection, radar-ping, and the inverse ink-panel dark idiom are untouched.
- **Every extraction reproduces the current class strings verbatim** behind a shared component, so `Kbd`, `EmptyState`, `SelectionCard`, `GoalChip`, `Panel`/`StatCell` render byte-identical DOM. `data-testid` strings are preserved for the connection layer.
- **Token work is deletion of undefined/unused config surface only** (`--*-border`, `--sidebar*`, `--chart*`, `status.*` rgb). Since Tailwind emits only used utilities, no generated CSS changes; the locked theme layer is not edited.
- **The three genuinely visual proposals (rows 17, 19, 20) are flagged Major/Minor and marked `[STAGED]`** with a required owner sign-off; they are excluded from the behavior-preserving batch.

Every proposal traces to a specific audit finding (§ references inline). No new problems invented; no visual redesign proposed.
