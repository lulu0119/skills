# Workflow — align requirements before drawing

This skill teaches **how the illustration should look**. Get aligned in the browser first, then implement.

## The loop

```
Explore host → clarify intent (2–3 options) → HTML mockups → user approves
  → read user-edited mockup if any → modular implementation → screenshot verify → deslop
```

**Do not implement until the mockup is approved.** The mockup is the contract.

## Step 0 — Explore the host project

Before any mockup:

1. Find a **sibling illustration** in the app (e.g. an existing `*-parts.tsx` + demo card) and match its token palette, stroke weight, and animation hooks.
2. Read the **host viewport** from the real component (card width × 200px demo area), not a guessed size.
3. Note existing CSS keyframes and `prefers-reduced-motion` / `useReducedMotion` patterns — reuse names where possible.

## Step 1 — Clarify direction

Before drawing:

- Ask clarifying questions (one batch at a time when possible)
- Offer 2–3 approaches with trade-offs (e.g. isometric vs perspective vs scatter)
- Get design approval before writing production code

## Step 2 — Mockup iteration

Put versioned mockups in the host project under a scratch path the user can ignore (e.g. `.scratch/illustration-mockups/` — add that folder to `.gitignore` if needed). Single-file HTML is fine.

| Practice | Rule |
|----------|------|
| Aspect ratio | Match the real card viewport from step 0 |
| Versions | `v1`, `v2`, … — one file per iteration; keep history |
| Comparisons | Show 2–3 options side by side for early decisions (projection, building style) |
| Self-verify | Screenshot the mockup **before** showing the user; fix obvious issues first |
| User edits | If the user tweaks positions/lines in the mockup, **read their version** before implementing |

Each iteration should address **one batch of feedback**. Do not skip ahead to the full scene until primitives and assemblies are readable.

## Step 3 — Approval gate

Proceed to implementation only when:

- Projection and style direction are chosen
- Layout, proportions, and cable topology are approved
- User says to implement (or edits the final mockup and asks you to match it)

## Step 4 — Modular implementation

Mirror the host's existing parts pattern:

```
*-iso-parts.tsx   # geometry: projection, primitives, assemblies
*Demo.tsx         # compose scene, fit transform, depth sort
app/styles/*.css  # keyframes + non-scaling-stroke; gate reduced motion
```

Derive simplified primitives from an existing detailed module when one exists (e.g. front-panel 1U → stacked iso 1U slice).

## Step 5 — Verify and finish

1. Screenshot on the **live dev server** at the real card size — compare to the approved mockup
2. Run type/lint on touched files
3. Audit cables: sensible endpoints, distinct lanes, no meaningless crossings (see [reference.md](reference.md#composition-rules))
4. **`deslop`** before declaring done
5. Do not commit unless asked

## What “align requirements” means

You are **training the agent's eye**, not just generating SVG:

- Early drafts will be wrong (wrong projection, wrong proportions, wrong metaphor)
- Each round narrows constraints until the agent draws what you mean
- The approved mockup + [reference.md](reference.md) composition rules are the spec — not the first prompt
