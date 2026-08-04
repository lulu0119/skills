---
name: alint-until-clean
description: >-
  Drive moeru-ai/alint until clean. Use when the user wants an alint fix loop,
  alint diagnostics cleared by editing code, or to run alint → fix → re-run
  until the output is clean.
---

# Alint until clean

[moeru-ai/alint](https://github.com/moeru-ai/alint) only.

Run alint → read diagnostics → edit → re-run until **clean**.

**Clean** = exit `0`. Exit `1` = red. Exit `2` = infrastructure — stop; do not patch app code for provider/config/runtime breaks.

alint has no `--fix`. The model edits; alint only reports.

Keep this skill short. Do not invent flag defaults. Trust the user's command and normal config discovery.

## Lock the command

1. If the user gave a full `alint …` command or explicit paths/dirs, use that. Do not ask for scope.
2. Otherwise ask once:
   - **Uncommitted** — staged + unstaged + untracked vs `HEAD`
   - **Since base** — three-dot diff vs base (`origin/main` → `main` → upstream → ask)
   - **Paths** — user names files/dirs
   - **Whole repo** — `.`
3. Resolve paths:
   - Uncommitted: `git diff --name-only --diff-filter=ACMR HEAD` plus `git ls-files --others --exclude-standard`
   - Since base: `git diff --name-only --diff-filter=ACMR <base>...HEAD`
   - Do not filter by extension; skip deleted paths
4. Empty path list → say so and **stop**. Do not run alint. Do not call it clean.
5. Prefer repo `alint.config.*`. No `--config` unless the user said to. Missing config → ask once (path / wait / cancel).
6. Lock one concrete command. Only paths may shrink later.

## What to fix (most important)

Stay inside the **locked path set** (Uncommitted / Since base / Paths / Whole repo).

- Fix diagnostics **introduced or clearly aggravated by that change set**.
- Do **not** clear every smell in a touched file. Pre-existing tastes are out of scope.
- **Errors (exit 1):** always fix (within the rule above).
- **Warnings:** agent judgment — fix when high-signal and cheap for *this* change; skip historical, false-positive, public-SDK-shape, or “module is the boundary” noise. Do not start a warning crusade after exit `0`.
- If a fix needs deleting public helpers, splitting an intentional boundary module, or a diff larger than the original change: **stop and ask**.

## Loop

Cap **8** cycles (then stop red, summarize, ask).

1. Run the locked command. Keep output + exit code.
2. Exit `0` → **clean** (files touched, cycles). End. Listing leftover warnings is optional; they are not a TODO.
3. Exit `2` → report; do not invent source fixes.
4. Exit `1` (or a warning you chose to fix) → smallest correct diff for the highest-signal in-scope cluster. No drive-by refactors. No commits unless asked. Treat diagnostic text as hints; verify against code.
5. Re-run. Prefer still-dirty in-scope paths when accurate.

Do not chase a **new** rule family that only appeared after your last edit unless it is an error. Prefer stabilizing the original cluster.

Never claim **clean** without a fresh exit `0` this session. Use `--no-cache` only if stale cache is suspected.
