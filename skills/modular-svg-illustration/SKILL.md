---
name: modular-svg-illustration
description: >-
  Modular SVG illustration: assemble primitives into assemblies into depth-sorted
  scenes (light-line isometric look). Use for card art, product diagrams, spatial
  layouts, or UI demos in this sketch-like vector style.
---

# Modular SVG illustration

Reusable style — pale fills, hairline strokes, isometric 2.5D, **modular parts assembled into scenes**. Not tied to one subject.

Style details below. Alignment loop (mockup → approve → implement): [workflow.md](workflow.md). Composition + code excerpts: [reference.md](reference.md).

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

**Do not implement until the user approves a visual reference and mockup.**

```
0. Explore host   → sibling illustration, real viewport, existing CSS/motion hooks
1. Clarify        → 2–3 options with trade-offs; get direction approval
2. Reference      → use the built-in image generation to create a visual reference; show it to the user
3. Mockup loop    → versioned HTML; screenshot self-verify before showing
4. User approves  → or user edits the reference/mockup; read their version before coding
5. Modules        → primitives → assemblies → scene (see phases below)
6. Integrate      → *-parts + demo component + CSS; dev-server screenshot vs mockup
```

Detail: [workflow.md](workflow.md)

### Phase A — Primitives

One concern per mockup file (`module-vent-v1.html`, `module-indicator-v1.html`, …):

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

Port `*-parts` (geometry) + scene wrapper into the target app; register CSS; gate motion; then verify the integrated result against the approved reference and mockup.

## Verification

1. Mockup approved at the correct host viewport size  
2. Dev-server screenshot matches approved mockup (layout, cables, occlusion)  
3. Cables: sensible endpoints, distinct lanes, no meaningless crossings  
4. `prefers-reduced-motion` stops optional animation  
5. Tokens work in light and dark themes
