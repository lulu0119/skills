---
name: pr-review-slides
description: "Create Slidev decks that review a GitHub PR: show the diff and explain why each change was written that way. Use when asked to make PR review slides or explain a PR with slides."
---

# PR Review Slides

## Workflow

1. Read the PR with `gh pr view <n>` (add `--repo <owner/repo>` when you are not inside the repository) or the GitHub API. Record the title, draft state, base/head SHAs, head repo/ref, commit list, and changed-file stats.
2. Check out the head branch locally; do not overwrite an existing same-name branch. Review the PR as-is, do not rebase it:

   ```bash
   git fetch <remote> <head-ref>
   git switch -c pr-<n> <head-ref>
   ```

3. Analyze the PR's own diff: `git diff <base-ref>...HEAD --stat`, then read the hunks of every changed file. For each meaningful hunk, work out what it does, why it is written this way, and what a reviewer should watch.
4. Build the deck in a working directory outside the repository, for example `~/pr-<n>-review-slides` (reuse an existing Slidev project when one is available).
5. Verify with `pnpm build`, then `pnpm exec slidev --port 3031` and open http://localhost:3031/.
6. Do not push the slides into the repository. PR maintenance (rebase, push, description edits) is out of scope; only do it when the user asks for it separately.

## Deck structure

- Cover and overview: title, draft state, base/head SHAs, `+/-` stats, one-sentence summary.
- Commit list with each commit's responsibility.
- Per-file sections: paste the actual `git diff` hunks in ```` ```diff ```` fences, then explain what the code does, why it is written that way, line-by-line key points, and what changed relative to main.
- Test plan and verification results that were actually run (commands, pass/fail, evidence paths).
- Review concerns and questions table: risks, gaps, follow-ups.
- References: PR link and file paths.

## Slidev project gotchas

- Latest `@slidev/cli` is `52.x` (no `0.` prefix). `package.json` needs both `@slidev/cli` and `@slidev/theme-default`.
- Set `mdc: false` in the `slides.md` frontmatter. With `mdc: true`, `{ ... }` inside inline code is parsed as attributes and breaks rendering (`InvalidCharacterError: Invalid qualified name`).
- Global CSS must live in `styles/index.css`. A `<style>` block inside `slides.md` is scoped to that slide only.
- Keep dense slides readable: small fonts (body ~11.5px, code ~8.5px, tables ~9px), `pre { max-height: 38vh; overflow: auto }`, and `overflow-y: auto` on `.slidev-layout`.
- Verify with `pnpm build` before serving, and watch the dev-server log for runtime errors.

## Review quality

- Cover the whole PR diff, not just headline files.
- Redact secrets (API keys, tokens) in pasted evidence and logs.
- Separate PR-introduced issues from pre-existing ones by checking the same file on the base branch before claiming a regression.
- Flag stale descriptions (for example, files renamed or removed in the final branch) and correct the PR body if the user asks.
