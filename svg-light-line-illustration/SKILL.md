---
name: svg-light-line-illustration
description: >-
  Teaches a light-line isometric SVG illustration style —
  thin theme-token strokes, 2.5D projection, modular primitives, depth-sorted scenes,
  optional soft motion. Use when drawing card art, product diagrams, spatial layouts,
  or UI demos in this sketch-like vector illustration look. Requires Superpowers
  brainstorming + visual companion for the requirement-alignment workflow.
---

# Light-Line Isometric SVG Illustration Style

A reusable **SVG illustration style**, not a single subject or scene type.

Pale fills, hairline strokes, 2.5D isometric projection, built from small approved modules. Bundled excerpts show the style on a spatial scene (640×200) and a framed front face (421×200); any topic can use the same language.

## Prerequisite

Install [Superpowers](https://github.com/obra/superpowers). This skill covers **what to draw**; Superpowers **`brainstorming`** + **visual companion** cover **how to align requirements with the user** before implementation.

Full process: [workflow.md](workflow.md)

## Style definition

| Trait | Rule |
|-------|------|
| Medium | SVG vector illustration (not raster, not 3D render) |
| Line weight | ~0.45–0.5; `vector-effect: non-scaling-stroke` on scaled scenes (`iso-scene`) |
| Color | Semantic tokens (`--color-primary`, `--color-card`, `color-mix`) — avoid ad-hoc hex in art |
| Projection | `isoProject(x,y,z) → [(x-z)*0.866, (x+z)*0.5 - y]` |
| 2.5D forms | Circles become **ellipses** via per-face `matrix()` (top / left / right planes) |
| Composition | Atoms → assemblies → scene; **depth-sorted** layers for occlusion |
| Motion (optional) | CSS keyframes (`iso-led-pulse`, `iso-fan-spin`, `iso-cable-flow`); respect `prefers-reduced-motion` |
| Highlights (optional) | Soft flow along paths — gentle, not glowing dots |

## Reference proportions

Use as rulers, not as the only valid topics.

| Example | Viewport | What to match |
|---------|----------|---------------|
| Spatial isometric scene (nodes + links) | 640×200 | Rack solids, ground pads, cable lanes, depth sort, fit transform |
| Stacked front-panel carousel | 421×200 | Framed face zones (mesh, vents, bays, controls), hairline inset panels |

Code excerpts + composition rules: [reference.md](reference.md)

## Workflow: align first, draw last

**Do not implement until the user approves a visual companion mockup.**

```
0. Explore host   → sibling illustration, real viewport, existing CSS/motion hooks
1. Brainstorming  → Superpowers; 2–3 options; visual companion for layout/style
2. Mockup loop    → versioned HTML in .superpowers/brainstorm/; screenshot self-verify
3. User approves  → or user edits mockup; read their version before coding
4. Modules        → primitives → assemblies → scene (see phases below)
5. Integrate      → *-parts + demo component + CSS; dev-server screenshot vs mockup
```

Detail: [workflow.md](workflow.md)

### Phase A — Primitives

One concern per companion file (`module-vent-v1.html`, `module-indicator-v1.html`, …):

- Stroke weight and corner radius
- Token fills vs strokes
- Ellipse distortion on each face plane
- Optional pulse / spin / flow classes

**Do not advance until each primitive is approved.**

### Phase B — Assemblies

Reuse approved primitives only — stacked slices, rotated blocks (`facing L/R`), paired accessories, framed front faces. Show 2–3 orientation variants before scene work.

If a detailed front-panel module exists in the host app, **simplify it** into a stackable iso slice — do not invent a new vocabulary.

### Phase C — Scene

Placements, ground connectors, pads/carpets, depth sort, bake viewBox fit. Follow [composition rules](reference.md#composition-rules).

### Phase D — Integration

Port `*-parts` (geometry) + scene wrapper into the target app; register CSS; gate motion; run **deslop** before done.

## Verification

1. Mockup approved at the correct host viewport size  
2. Dev-server screenshot matches approved mockup (layout, cables, occlusion)  
3. Cables: sensible endpoints, distinct lanes, no meaningless crossings  
4. `prefers-reduced-motion` stops optional animation  
5. Tokens work in light and dark themes
