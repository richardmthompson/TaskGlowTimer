# CURRENT-DESIGN-SYSTEM.md — TaskGlowTimer frontend "as-built" audit

> Diagnostic, read-only. Documents what the TaskGlowTimer frontend design system **currently is** and the **code-quality problems** in how it is implemented. No code was changed. Every finding cites a real path:line or named symbol.
>
> Run: `2026-08-11-taskglowtimer-ui-audit-cleanup` · Revision: `audit-r1` · Preference pointer: `skillset-saves/preferences/taste.md`
> Reference specs read: `skillset-saves/runs/2026-08-09-arlabs-design-system/design-system/DESIGN.md`, `.../tokens.css`, `skillset-saves/preferences/taste.md`.

---

## 1. Summary

The app is a single-screen focus timer ("VoxPlan · Focus Instrument") built on Vite + React + TypeScript + Tailwind v3 + shadcn (new-york) primitives, routed by `wouter`, with server state via `@tanstack/react-query`. It was reskinned to the **VOX Canvas r2.1** design system: warm cream paper with a dot-grid texture, warm-ink foreground, a single locked **violet** primary accent (mint demoted to a secondary highlight), soft-neo radii (6/12/16/4px), hard zero-blur translucent-ink offset shadows plus one violet emphasis shadow, springy selection lift, a radar-ping reserved for the running timer dial, and engineer's furniture (kbd chips, title-block stamp, labeled goal→task wires). Dark mode is the **inverse ink-panel idiom** (surfaces stay ink, borders become creme hairlines, interiors go flat, violet moves to text/accents). Tokens are consumed as `hsl(var(--token))` via Tailwind color mappings and are faithful to the r2.1 spec: **all reference tokens are present and none are missing** (comm on token names shows zero missing). The design system as-authored is coherent and on-spec.

The **code implementation**, however, carries meaningful cruft: three fully dead components, a stale pre-reskin guidelines file, copy-pasted card/empty-state/neo-button class clusters that should be shared, a leftover shadcn config surface (chart/sidebar/status colors and `--*-border` tokens) that no token defines and nothing uses, an 809-line `timer.tsx` god-page holding all state and a ~180-line keyboard reducer inline, and a few off-system one-offs in the retained shadcn `toast.tsx`. UI/UX states are partially covered (empty and error states are handled; loading and disabled states are largely absent).

### Findings count by severity

| Severity | Count | Meaning |
|---|---:|---|
| Critical | 0 | Breaks behavior or accessibility |
| Major | 8 | Significant redundancy / inconsistency worth fixing |
| Minor | 9 | Polish |
| Info | 6 | Context |
| **Total** | **23** | |

No Critical findings: the shipped UI renders, is keyboard-navigable, has a focus-visible ring, and is on-token. The problems are redundancy, dead code, and state-coverage gaps.

---

## 2. Design foundations as-built

Source of truth for tokens: `TaskGlowTimer/client/src/index.css` (`:root` lines 12–127, `.dark` lines 130–188). Tailwind mapping: `TaskGlowTimer/tailwind.config.ts`. All values below were read directly from those files and cross-checked against `DESIGN.md` §1–4.

### Color roles (match the r2.1 spec)

| Role | Light (`index.css`) | Dark (`index.css`) | Matches DESIGN.md §1? |
|---|---|---|---|
| `--background` | `43 41% 91%` #F2EDE0 | `34 16% 8%` #191612 | Yes |
| `--foreground` | `27 13% 13%` #26211D | `43 41% 91%` | Yes |
| `--card` / `--card-foreground` | `45 60% 96%` / ink | `33 15% 12%` / creme | Yes |
| `--primary` (VIOLET) | `255 100% 73%` #9977FF | same | Yes |
| `--primary-foreground` | ink `27 13% 13%` | ink | Yes (ink-on-violet 4.89 PASS) |
| `--primary-deep` (text accent) | `254 61% 56%` #6A4BD4 | `255 100% 73%` | Yes (light 5.03 on creme) |
| `--secondary` | ink | `33 14% 25%` #4A4238 | Yes |
| `--accent` (MINT highlight) | `149 51% 48%` #3BB878 | `154 89% 67%` #62F6B5 | Yes |
| `--muted` / `--muted-foreground` | `43 30% 87%` / `29 12% 37%` | `33 15% 16%` / `32 13% 61%` | Yes |
| `--border` / `--input` | ink / ink | `36 6% 34%` / `37 5% 48%` | Yes (dark hairlines) |
| `--ring` (focus) | ink `27 13% 13%` | violet `255 100% 73%` | Yes (light INK, dark VIOLET) |
| `--destructive` | `0 100% 41%` #D00000 | `0 100% 35%` #B30000 | Yes |

> Note on dark `--border`/`--input`: `index.css:165` uses `36 6% 34%` (#5C5851) and `:167` `37 5% 48%`, matching the r2.1 hairline narrative in the file's own comments; `DESIGN.md:38-39` lists the older `33 14% 25%` value. This is an intentional r2.1 refinement recorded in the index.css comments (lines 163–167), not drift.

### Type, radii, borders, shadows, motion, texture (all present, on-spec)

- **Type families** (`index.css:82-84`): `--font-sans: Outfit`, `--font-mono: JetBrains Mono`, `--font-display: Archivo`. Headings h1–h3 forced to display family + tight tracking (`index.css:236-239`). Matches DESIGN.md §2 (no serif).
- **Type scale** (`index.css:87-94`): modular 1.25, base 16px, xs→4xl. App-layer tokens (see §4).
- **Radii** (`index.css:63-66`): `--radius 6px`, `--radius-card 12px`, `--radius-hub 16px`, `--radius-code 4px`. Mapped in `tailwind.config.ts:11-20` (`rounded-card/hub/code`, plus `sm/md`=6px, `lg`=12, `xl`=16). Matches DESIGN.md §3.
- **Border widths** (`index.css:69-71` light, `179-181` dark): thin/frame/heavy = 1.5/3/4px light, 1/1.5/2px dark. Mapped `tailwind.config.ts:21-25` (`border-thin/frame/heavy`). Matches DESIGN.md §3.
- **Shadows** (`index.css:73-79`): `--shadow-neo-sm/neo/lg` translucent ink offsets + `--shadow-neo-accent` (violet 6px6px). Dark collapses sm/neo/lg to `none` (`index.css:185-187`); only the violet accent survives. Mapped `tailwind.config.ts:26-31`. Matches DESIGN.md §3.
- **Motion** (`index.css:120-126`): durations fast/default/slow/spring = 120/200/300/320ms; `--ease` + `--ease-spring`. `@keyframes radar-ping` (`index.css:191-194`); `.neo-selected` spring lift (`index.css:271-276`); `.radar-ring` (`index.css:279-286`). `prefers-reduced-motion` block strips transforms/pings and collapses durations (`index.css:197-220`). `shake-error` keyframe lives in `tailwind.config.ts:133-142` (not index.css). Matches DESIGN.md §4.
- **Texture** (`index.css:55, 172, 228-233`): `--paper-dot` radial dot-grid on `body`, 26px cell (`--paper-cell`), untextured cards. Matches DESIGN.md §3.
- **Furniture idioms present in code**: kbd chips (`timer.tsx:570-572`, `HelpPanel.tsx:63`, `GoalsList.tsx:16`, `QueuedTasksList.tsx:54`), title-block stamp (`timer.tsx:765-771`), accent rule (`BrandBadge.tsx:25`), inverse steering/ink panel (`timer.tsx:652` via `.panel-ink` + `shadow-neo-accent`), radar-ping (`CircularTimer.tsx:27-32`).

**Verdict:** the authored design foundation is faithful to r2.1. No theme drift found in the token layer.

---

## 3. Component catalog

Import graph derived from `import` statements under `client/src`. "Used-by" excludes self and type-only re-exports where noted. LOC from `wc -l`.

| Component | Purpose | LOC | Used by | Status |
|---|---|---:|---|---|
| `pages/timer.tsx` | Main screen; owns ALL app state + keyboard reducer + persistence wiring | 809 | `App.tsx` (route `/`) | **Active — overloaded (god component)** |
| `pages/not-found.tsx` | 404 fallback route | 21 | `App.tsx` | Active |
| `App.tsx` | Providers (QueryClient, Tooltip, Toaster) + wouter router | 29 | `main.tsx` | Active |
| `BrandBadge.tsx` | Masthead wordmark + coin badge + accent rule | 31 | `timer.tsx` | Active |
| `CircularTimer.tsx` | SVG dial, timer digits, radar-ping while running | 79 | `timer.tsx` | Active |
| `TimerControls.tsx` | Play/Pause + Done neo buttons | 45 | `timer.tsx` | Active |
| `StickyNote.tsx` | Current-task textarea (violet fill / dark ink), shake-on-error | 45 | `timer.tsx` | Active |
| `RewardStack.tsx` | Vertical medal/diamond stack for running task | 35 | `timer.tsx` | Active |
| `RewardIcon.tsx` | Single medal (violet) or diamond (mint) icon w/ count | 49 | `RewardStack`, `TaskRewards` | Active |
| `TaskRewards.tsx` | Compact reward summary on a completed card | 32 | `CompletedTask` | Active |
| `CompletedTask.tsx` | One completed-task card (times, goal abbrev, rewards) | 60 | `CompletedTasksList` | Active |
| `CompletedTasksList.tsx` | List + empty state + goal-abbrev derivation; exports `CompletedTaskData` | 62 | `timer.tsx` (+ type import in `GoalTaskConnections`) | Active |
| `QueuedTask.tsx` | One queued-task row (drag handle, index, quick-start) | 64 | `QueuedTasksList` | Active |
| `QueuedTasksList.tsx` | Drag-reorder list + empty state; exports `QueuedTaskData` | 78 | `timer.tsx` | Active |
| `QueueInput.tsx` | Queue add textarea (`forwardRef`) | 37 | `timer.tsx` | Active |
| `GoalInput.tsx` | Goal add textarea (`forwardRef`) | 36 | `timer.tsx` | Active |
| `GoalCard.tsx` | One goal card (violet light / ink dark), Enter-to-promote | 34 | `GoalsList` | Active |
| `GoalsList.tsx` | Goal stack list + empty state | 34 | `timer.tsx` | Active |
| `GoalTaskConnections.tsx` | SVG bezier wires goal→completed task via `data-testid` DOM queries + polling | 117 | `timer.tsx` | **Active — fragile (see §5)** |
| `TaskDetailsPanel.tsx` | Detail panel for a selected completed/queued task | 103 | `timer.tsx` | Active |
| `HelpPanel.tsx` | Floating help toggle + keyboard-shortcut reference | 92 | `timer.tsx` | Active |
| `ThemeToggle.tsx` | Light/dark toggle button (localStorage) | 47 | `timer.tsx` | Active |
| `CurrentGoal.tsx` | Standalone "current goal" chip w/ clear button | 40 | **none** | **DEAD** |
| `GoalSelector.tsx` | Chip-row goal picker | 43 | **none** | **DEAD** |
| `StatusIndicator.tsx` | "Working on…" animated dots / "paused" text | 35 | **none** | **DEAD** |

### `ui/` primitives (shadcn new-york, retained)

| Primitive | LOC | Used by | Status |
|---|---:|---|---|
| `ui/button.tsx` | 62 | `ThemeToggle.tsx` only | Active (1 consumer) |
| `ui/card.tsx` | 85 | `pages/not-found.tsx` only | Active (1 consumer; exports 6 parts, only `Card`+`CardContent` used) |
| `ui/toast.tsx` | 127 | `ui/toaster.tsx` | Active (indirect) |
| `ui/toaster.tsx` | 33 | `App.tsx` | Active |
| `ui/tooltip.tsx` | 30 | `App.tsx` (`TooltipProvider` only) | Active (provider only; `TooltipContent` never rendered) |

### Hooks / lib / types

| File | LOC | Purpose | Status |
|---|---:|---|---|
| `hooks/use-persistence.ts` | 239 | react-query mutations/query wrapping the `/api/*` seam; offline detection; debounced title save | Active |
| `hooks/use-toast.ts` | 191 | shadcn toast reducer/store | Active (via `use-persistence` + `toaster`) |
| `lib/queryClient.ts` | 57 | QueryClient + `apiRequest` + `getQueryFn` | Active (`queryClient` used; `apiRequest` used by hook; `getQueryFn` default) |
| `lib/utils.ts` | 6 | `cn()` (clsx + tailwind-merge) | Active |
| `types/goal.ts` | 5 | `Goal` interface | Active |
| `types/reward.ts` | 14 | `Reward`, `RewardType`, `RewardSummary` | Active |

---

## 4. Token & styling audit

### Theme layer vs app layer

**Theme layer** (r2.1 design-system tokens — color roles, radii, borders, shadows, motion, texture): fully present and on-spec (see §2). Name-level diff of `index.css` `:root` against the reference `tokens.css` shows **zero missing tokens**.

**App layer** (extra tokens beyond the r2.1 theme spec — *ruled a legitimate app token layer by the owner, documented as such, NOT flagged as drift*):
`--panel`, `--panel-foreground` (`index.css:58-59, 173-174`); `--popover`, `--popover-foreground`, `--popover-border` (`:28-30, 144-146`); `--card-border` (`:26, 142`); `--font-size-xs … --font-size-4xl` (`:87-94`); `--leading-none/tight/normal/relaxed` (`:97-100`); `--tracking-nav` (`:107`); `--space-0 … --space-8` (`:110-118`); `--badge-outline`, `--button-outline`, `--opaque-button-border-intensity`, `--elevate-1`, `--elevate-2` (`:14-18, 131-135`, the retained shadcn elevate overlay system). **Info** — these are the intended app token layer.

### Off-system / stale / dangling values (code-quality)

- **[Major] Config references tokens that no CSS defines.** `tailwind.config.ts` maps `--primary-border` (`:66`), `--secondary-border` (`:71`), `--muted-border` (`:76`), `--accent-border` (`:81`), `--destructive-border` (`:86`), `--sidebar*` (`:96-111`) and `--chart-1..5` (`:89-95`). None of these `--*-border`/`--sidebar*`/`--chart*` tokens exist in `index.css` (grep count = 0). So `border-primary` etc. resolve to the literal string `var(--primary-border)` → an invalid/absent color. Leftover shadcn scaffolding; not consumed by any component (grep for `sidebar`/`chart-`/`bg-status` in components = none). Dead config surface.
- **[Major] Hardcoded off-token `status.*` palette in config.** `tailwind.config.ts:112-117` defines `status.online/away/busy/offline` as raw `rgb(...)` literals (e.g. `rgb(34 197 94)`) — not `hsl(var(--token))`. Unused by any component, but it is a hardcoded off-system color block sitting in the theme.
- **[Minor] Off-system red literals in retained toast.** `ui/toast.tsx:78` uses `text-red-300`, `text-red-50`, `ring-red-400`, `ring-offset-red-600` (default Tailwind palette, not the `--destructive` token). Only reachable via a destructive toast; the app fires one destructive toast ("Offline mode", `use-persistence.ts:65-69`) but does not render a `ToastClose` variant that trips these, so low blast radius. Still off-token.
- **[Minor] Inline token strings via arbitrary Tailwind values** (functionally correct, stylistically inconsistent with the `text-*`/`border-*` utility convention):
  `TimerControls.tsx:39` `text-[hsl(var(--panel-foreground))]`; `StickyNote.tsx:36` `border-[hsl(var(--panel-foreground))]`; `QueuedTask.tsx:46` `text-[hsl(var(--primary-deep))]`. SVG strokes in `CircularTimer.tsx:46,54,66` and `GoalTaskConnections.tsx:110` use raw `hsl(var(--…))` — legitimate for SVG (no utility exists), noted as Info.
- **[Info] No hardcoded hex/rgb colors in any component or page** (grep for `#hex`/`rgba(` in `components/` + `pages/` = 0 matches). Color discipline in the app layer is clean; the violations above are all in retained shadcn scaffolding (config + toast).
- **[Minor] Ad-hoc arbitrary sizing values** are widespread but mostly reasonable layout math: `max-w-[1200px]`, `h-[calc(100vh-3rem)]`, `w-[28%]`, `w-[300px]`, `max-w-[620px]` (`timer.tsx:563,582,647,776`), `text-[8px]/[9px]/[10px]` micro-labels (many). These bypass the `--font-size-*` / `--space-*` app tokens; the type-scale tokens are effectively unused by the components, which reach for arbitrary `text-[Npx]` instead.

---

## 5. Redundancy & ambiguity register

Each item is severity-tagged and cited. "As-built system" issues vs "code-quality" issues are labeled.

1. **[Major] Three dead components ship in the tree.** `CurrentGoal.tsx` (40 LOC), `GoalSelector.tsx` (43 LOC), `StatusIndicator.tsx` (35 LOC) have **no importer** anywhere under `client/src` (verified: only self-references). Their responsibilities were absorbed into `timer.tsx` — the truth-strip current-goal chip (`timer.tsx:681-708`) duplicates `CurrentGoal`; the instrument-panel status word (`timer.tsx:658-660`, `isRunning ? 'Running' : …`) duplicates `StatusIndicator`. ~118 LOC of dead code + duplicated concepts.

2. **[Major] Copy-pasted "neo card" class cluster across four cards.** The list-card recipe `w-full … rounded-card … border-thin hover-elevate active-elevate-2 transition-transform duration-fast ease-neo` with a selected/unselected ternary (`isSelected ? "border-… neo-selected" : "border-border shadow-neo-sm"`) is duplicated in `CompletedTask.tsx:28-32`, `GoalCard.tsx:22-26`, and `QueuedTask.tsx:38-42`. Three near-identical selection-card idioms with no shared primitive.

3. **[Major] Duplicated empty-state block.** The empty-list markup `py-… font-mono text-[10px] uppercase tracking-label text-muted-foreground leading-relaxed` with a bold headline + hint line is copy-pasted in `CompletedTasksList.tsx:37-42`, `GoalsList.tsx:13-18`, and `QueuedTasksList.tsx:51-56`. No shared `EmptyState` component.

4. **[Major] Duplicated kbd-chip markup.** The chip recipe `px-… rounded-code border-thin border-border bg-card shadow-neo-sm … text-foreground` is hand-rolled in `timer.tsx:570-572`, `GoalsList.tsx:16`, `QueuedTasksList.tsx:54`, and `HelpPanel.tsx:63` (with a `min-w-[80px]` variant). DESIGN.md §5 names the kbd chip a first-class furniture idiom; the code has no `Kbd` component.

5. **[Major] Two divergent "goal chip" renderings for the same concept.** A goal rendered as a violet chip appears with different class strings in `CompletedTask.tsx:51` (`px-1.5 py-0.5 … rounded-md bg-primary … border-thin border-border`, the abbrev badge), `TaskDetailsPanel.tsx:94` (`px-2 py-1 rounded-md … bg-primary …`), the dead `CurrentGoal.tsx:19`, and the truth-strip goal name (`timer.tsx:684`). Same visual concept, four ad-hoc implementations; ambiguous single source of truth for "goal token".

6. **[Major] `timer.tsx` is a god component.** 809 LOC holding every piece of app state (14 `useState` at `:37-55`), the full ~180-line keyboard-shortcut reducer inline (`:365-551`), hydration mapping (`:97-187`), reward consolidation, and all handlers. No context, no reducer extraction, no sub-hooks. All child components are pure/presentational; all logic and prop-drilling originate here.

7. **[Major] Two parallel "selected task" state shapes cause ambiguity.** `timer.tsx` tracks both `selectedTask` (a tagged union carrying `title`/`startTime`, `:46-50`) and `selectedQueuedTaskId` (`:51`) and reconciles them by hand throughout the keyboard handler. Completed tasks are matched by **`title` + `startTime`** rather than `id` (`:424, 428, 445, 452, 503, 527`) — ambiguous/duplicate-prone identity (two tasks with the same title and start minute collide), even though a stable `id` exists on `CompletedTaskData`.

8. **[Minor] `GoalTaskConnections` couples via DOM `data-testid` queries + polling.** `GoalTaskConnections.tsx:45-49` locates cards with `document.querySelector('[data-testid="card-goal-…"]')` and recomputes bezier paths on a `setInterval(…, 500)` (`:83-89`). This wires layout to test-id strings and repaints twice a second regardless of change — fragile presentation coupling, not a token issue.

9. **[Minor] Duplicated theme-toggle logic in two places.** The add/remove-`dark`-class + `localStorage.setItem('theme', …)` logic exists in both `ThemeToggle.tsx:20-30` and inline in the `Shift+M` handler in `timer.tsx:376-388`. Two sources of truth for theming, and neither reads system `prefers-color-scheme`.

10. **[Minor] `ui/card.tsx` exports 6 parts; only `Card`+`CardContent` are used** (in `not-found.tsx`). `CardHeader/Title/Description/Footer` are unused exports. Also `card.tsx:12` hardcodes a `shadcn-card` class and `border-card-border` (which resolves to the app `--card-border` token — OK) but is a near-orphan primitive with one consumer.

11. **[Minor] `CircularTimer` computes `hours` but the dial arc assumes a 30-min cycle.** `CircularTimer.tsx:12-16` renders `HH:MM:SS`, while `totalSeconds` defaults to 1800 and `progress` clamps at 1 (`:20`); past 30 min the ring is full but the clock keeps counting — intended, but the `hours` field is effectively always `00` for the reward cadence. Minor semantic ambiguity.

12. **[Minor] `RewardIcon` uses inline `style={{fontSize}}` instead of a class** (`RewardIcon.tsx:41`) for the diamond count, bypassing the type scale.

13. **[Info] `not-found.tsx` uses `font-display` heading** (`:11`) — consistent with the design system, good.

14. **[Info] `tooltip.tsx` is wired as a provider but no `TooltipContent` is ever rendered** — the tooltip primitive is dead weight beyond the provider wrapper (`App.tsx:21`).

---

## 6. UI/UX state & accessibility coverage

Per-flow matrix. ✔ handled · ✘ missing/absent · — not applicable.

| Flow | Empty | Loading | Error | Disabled | Focus-visible | ARIA / keyboard |
|---|:--:|:--:|:--:|:--:|:--:|---|
| **Timer run/pause/complete** | — | ✘ | ✘ | ✘ | ✔ (global ring) | Play/Pause `aria-label` + `data-testid` (`TimerControls.tsx:25,38`); Space toggles, Cmd/Ctrl+Enter completes (`timer.tsx:370,456`) |
| **Goal add** | — | ✘ | partial (client trim only) | ✘ | ✔ | textarea, `g` focuses (`timer.tsx:411`); Enter adds (`GoalInput.tsx:11`); no `aria-label` on textarea |
| **Goal select/promote/clear** | ✔ (`GoalsList.tsx:13`) | ✘ | — | ✘ | ✔ | Enter promotes (`GoalCard.tsx:11`, `timer.tsx:489`); clear button `aria-label` (`timer.tsx:693`) |
| **Task queue add** | ✔ (`QueuedTasksList.tsx:51`) | ✘ | partial (trim) | ✘ | ✔ | `q` focuses (`timer.tsx:406`); textarea has no `aria-label` |
| **Queue promote (quick-start)** | — | ✘ | ✔ shake if sticky occupied (`timer.tsx:344-348`, `StickyNote` `showError`) | ✘ | ✔ | quick-start button `aria-label` (`QueuedTask.tsx:57`); Enter promotes (`timer.tsx:416`) |
| **Queue reorder (drag)** | — | — | — | — | ✘ (native drag, no keyboard alt) | HTML5 drag only; **no keyboard reorder**, no `aria` drag semantics |
| **Task complete → banked** | ✔ empty banked state (`CompletedTasksList.tsx:37`) | ✘ | ✘ | ✘ | ✔ | `d` deletes, `T` restores (`timer.tsx:421,438`) |
| **Task details panel** | — | — | — | — | ✔ | close `aria-label` (`TaskDetailsPanel.tsx:62`); Escape/click-outside close (`timer.tsx:390`, `TaskDetailsPanel.tsx:34`) |
| **Help** | — | — | — | — | ✔ | toggle button, `data-testid` (`HelpPanel.tsx:80`); no `aria-expanded` |
| **Theme toggle** | — | — | — | — | ✔ | button `title` + `data-testid` (`ThemeToggle.tsx:37-38`); Shift+M (`timer.tsx:376`) |
| **Offline / persistence** | — | ✘ (no hydration spinner) | ✔ toast (`use-persistence.ts:65`) | — | — | app renders empty defaults on hydration failure (`timer.tsx:102-106`) |

### Accessibility signals

- **Focus ring:** global `:focus-visible { outline: 3px solid hsl(var(--ring)); outline-offset: 2px }` (`index.css:242-245`) — INK in light, VIOLET in dark, per r2.1. **[Info] Good.**
- **Touch targets:** most interactive controls meet ~44px (`min-h-11`, `h-11 w-11`, `w-12 h-12`): `TimerControls.tsx:10`, `QueuedTask.tsx:54`, `TaskDetailsPanel.tsx:63`, `HelpPanel.tsx:82`. **[Minor]** the clear-goal `✕` in the truth strip is `min-h-6 min-w-6` (`timer.tsx:695`) — ~24px, below the 44px guideline.
- **ARIA:** only 11 `aria-*` attributes across the app; add textareas (`GoalInput`, `QueueInput`, `StickyNote`) have placeholders but no `aria-label`; `HelpPanel` toggle lacks `aria-expanded`; drag-reorder has no accessible affordance. **[Minor] gaps, not breaks.**
- **Loading states:** **[Major-adjacent, tagged Minor]** there is no loading/skeleton anywhere; on cold hydration the screen shows empty defaults until state arrives (`timer.tsx:97-101` gates on `persistence.ready`). No spinner or optimistic placeholder.
- **Disabled states:** the only `disabled:` styling lives in retained shadcn `ui/button.tsx:8` and `ui/toast.tsx:63`; **no app control is ever disabled** (e.g. Done is clickable with an empty sticky; it just no-ops via `currentTask.trim()` guard at `timer.tsx:262`). Contrast values are inherited from the measured r2.1 palette (DESIGN.md §1) since colors are token-driven.

---

## 7. Architecture & data-seam notes

- **File organization:** flat `components/` (22 files) + `components/ui/` (5 shadcn primitives) + `pages/` (2) + `hooks/` (2) + `lib/` (2) + `types/` (2). No feature folders; presentational components are cleanly separated from the one stateful page.
- **State management:** **all in `pages/timer.tsx`** via `useState`/`useRef`/`useEffect` (no Context, no reducer, no Zustand/Redux). Props are drilled one level to pure children. Server state via react-query lives behind the `usePersistence` hook. This is the central architectural smell (see §5.6).
- **Frontend↔API seam:** `hooks/use-persistence.ts` is the single seam. It uses **react-query** `useQuery` for one-shot hydration (`GET /api/state?since=<localMidnightMs>`, `:84-97`) and `useMutation` for writes: `POST /api/goals`, `PUT /api/goals/current`, `POST /api/tasks`, `DELETE /api/tasks/:id`, `PUT /api/queue/order`, `PATCH /api/session` (`:120-158`). Writes are **fire-and-forget optimistic** — local React state is the source of truth for the UI; the server is written through. Title save is debounced ~600ms (`:205-216`) with a supersede guard (`:194-201`). Offline detection flips only on `TypeError` network failures, not HTTP errors (`:109-118`), surfaced via toast. `lib/queryClient.ts` provides `apiRequest` + a default `getQueryFn`; the global `QueryClient` disables refetch/retry with `staleTime: Infinity` (`:44-56`).
- **Theming / dark mode:** class-based (`darkMode: ["class"]`, `tailwind.config.ts:4`). `ThemeToggle.tsx` and the inline `Shift+M` handler (`timer.tsx:376-388`) both toggle `document.documentElement.classList` and persist to `localStorage['theme']`. **No FOUC guard / no inline pre-hydration script** and **no `prefers-color-scheme` fallback** — default is `'light'` (`ThemeToggle.tsx:6,10`). Duplicated toggle logic (see §5.9).
- **Stale artifact:** `TaskGlowTimer/design_guidelines.md` (227 LOC) is the **pre-reskin** guidelines — it names "Linear/Apple HIG", "Inter" font, and a minimal white aesthetic (`design_guidelines.md:5,20`), all of which contradict the shipped VOX Canvas r2.1 system (Archivo/Outfit/JetBrains Mono, cream paper, violet). **[Major] It is now inaccurate and should be marked superseded or removed** — it is the one document most likely to mislead a future contributor.

---

## 8. Appendix: raw inventory

### File LOC (client/src, .ts/.tsx/.css)

```
809  pages/timer.tsx
239  hooks/use-persistence.ts
191  hooks/use-toast.ts
127  components/ui/toast.tsx
117  components/GoalTaskConnections.tsx
103  components/TaskDetailsPanel.tsx
 92  components/HelpPanel.tsx
 85  components/ui/card.tsx
 79  components/CircularTimer.tsx
 78  components/QueuedTasksList.tsx
 64  components/QueuedTask.tsx
 62  components/ui/button.tsx
 62  components/CompletedTasksList.tsx
 60  components/CompletedTask.tsx
 57  lib/queryClient.ts
 49  components/RewardIcon.tsx
 47  components/ThemeToggle.tsx
 45  components/StickyNote.tsx
 45  components/TimerControls.tsx
 43  components/GoalSelector.tsx        (DEAD)
 40  components/CurrentGoal.tsx         (DEAD)
 37  components/QueueInput.tsx
 36  components/GoalInput.tsx
 35  components/RewardStack.tsx
 35  components/StatusIndicator.tsx     (DEAD)
 34  components/GoalCard.tsx
 34  components/GoalsList.tsx
 33  components/ui/toaster.tsx
 32  components/TaskRewards.tsx
 31  components/BrandBadge.tsx
 30  components/ui/tooltip.tsx
 21  pages/not-found.tsx
 14  types/reward.ts
 358 index.css (tokens + utilities)
  6  lib/utils.ts
  5  types/goal.ts
```
Also: `App.tsx` 29 · `main.tsx` 5. `client/src` total ≈ 2858 LOC (components/pages/hooks/lib/types).

### Import-graph summary (used-by → count)

```
timer.tsx        imports 13 app components + BrandBadge + ThemeToggle + usePersistence
App.tsx          -> timer, not-found, Toaster, TooltipProvider, queryClient
CompletedTask    <- CompletedTasksList
CompletedTasksList <- timer   (type CompletedTaskData also imported by GoalTaskConnections)
GoalCard         <- GoalsList
QueuedTask       <- QueuedTasksList
RewardIcon       <- RewardStack, TaskRewards
TaskRewards      <- CompletedTask
ui/button        <- ThemeToggle          (1 consumer)
ui/card          <- not-found            (1 consumer)
ui/toast         <- ui/toaster
ui/toaster       <- App
ui/tooltip       <- App                  (Provider only)
use-toast        <- use-persistence, ui/toaster
CurrentGoal      <- (none)  DEAD
GoalSelector     <- (none)  DEAD
StatusIndicator  <- (none)  DEAD
```

### Token diff (index.css `:root` vs reference tokens.css)

- Missing from app: **none**.
- App-layer additions (owner-ruled legitimate, not drift): `--panel`, `--panel-foreground`, `--popover*`, `--card-border`, `--font-size-*` (8), `--leading-*` (4), `--tracking-nav`, `--space-*` (9), `--badge-outline`, `--button-outline`, `--opaque-button-border-intensity`, `--elevate-1`, `--elevate-2`.
- Config-only dangling references (defined in `tailwind.config.ts`, undefined in any CSS): `--primary-border`, `--secondary-border`, `--muted-border`, `--accent-border`, `--destructive-border`, `--sidebar*`, `--chart-1..5`; plus hardcoded `status.*` rgb block.

### Could-not-verify / caveats

- **Runtime contrast/behavior not measured.** Per instructions the app was not run; contrast figures are the r2.1 *measured* values from `DESIGN.md §1` (token values in `index.css` match the spec, so those ratios hold as authored). Actual rendered contrast/FOUC were not re-measured.
- **Backend API shapes** (`/api/state`, `/api/tasks`, etc.) were inferred from `use-persistence.ts` request/response types only; server code is out of scope and was not read, so the exact server contract is asserted only from the client seam.
- **Dead-component determination** is based on static `import` grep over `client/src`; if any component is referenced dynamically or from outside `client/src` (none found), the "DEAD" label would need revisiting. No such references were found.
