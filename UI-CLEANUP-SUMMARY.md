# UI/UX Audit & Cleanup — Summary

Run: `2026-08-11-taskglowtimer-ui-audit-cleanup` · Branch: `ui-audit-cleanup` (off `main` @ `7cceea6`) · Status: applied, gated, **not merged**.

## Goal
Audit the TaskGlowTimer frontend (messy/redundant after the r1→r5 reskin), document current + target state, and apply a behavior-preserving cleanup — **without changing the approved VOX Canvas r2.1 visuals**.

## Deliverables (repo root)
| File | What it is |
|---|---|
| `CURRENT-DESIGN-SYSTEM.md` | As-built audit: 0 Critical / 8 Major / 9 Minor / 6 Info, with file:line evidence |
| `NEW-DESIGN-DRAFT.md` | Target structural architecture (20 proposals, 8 safe-now / 12 staged), visuals locked |
| `UI-CODE-OPTIMIZATION.md` | Ordered execution plan + verification + staged backlog |
| `UI-CLEANUP-SUMMARY.md` | This file |

## What was applied (5 commits, net −279 LOC)
| Change | Detail |
|---|---|
| Extract `Kbd` primitive | Collapsed 5 duplicated kbd-chip sites → 1 (`components/ui/Kbd.tsx`) |
| Extract `EmptyState` primitive | Collapsed 3 duplicated empty-state blocks → 1 (`components/ui/EmptyState.tsx`) |
| Delete dead components | `CurrentGoal`, `GoalSelector`, `StatusIndicator` (~118 LOC, zero importers) |
| Single theme helper | `lib/theme.ts` `toggleTheme()`; deduped `ThemeToggle` + timer `Shift+M` |
| Remove dangling tailwind tokens | `*-border`, `chart`, `sidebar`, `status` — undefined + unused config surface |
| Document token layers | Two-layer model (locked theme vs app tokens) in `index.css` + `tailwind.config.ts` |
| Retire stale doc | `design_guidelines.md` (pre-reskin Linear/Apple/Inter) → pointer |

## Verification (behavior-preservation contract — all passed)
- `tsc` clean · `vite build` clean (1686 modules)
- Visual parity both themes: rendered kbd class sets byte-identical; screenshots match r2.1
- QA walkthrough: 11/11 (theme toggle via Shift+M + button, add-goal, kbd borders, no console errors)
- **Regression caught + fixed:** the `Kbd` primitive first used `tailwind-merge`, which dropped the custom `border-thin` utility (misread as a color) — chips lost their border. Fixed with `clsx` + a size variant; re-verified.

## NOT done — deferred (staged backlog, needs a follow-up run)
- `timer.tsx` decomposition (`useTimerBoard` / `useTimerKeyboard` / `hydrate.ts`) — the 809-LOC god component
- `SelectionCard` / `GoalChip` / `Panel`+`StatCell` extractions (need class-diff proof)
- id-based task identity fix (currently `title`+`startTime`)
- 3 genuinely-visual items needing sign-off: disabled-Done state, larger clear-goal target, toast red literals → token

## Open decisions (yours)
1. Merge `ui-audit-cleanup` → `main` (currently at `7cceea6`; nothing merged).
2. Green-light the staged backlog as a follow-up run.

## Full evidence
Git: `git log --stat 7cceea6..HEAD`. Run log + gate verdicts: `skillset-saves/runs/2026-08-11-taskglowtimer-ui-audit-cleanup/` (`_audit-trail.md`, `build/apply-gate-verdict.md`, `review/cleanup-*.png`).
