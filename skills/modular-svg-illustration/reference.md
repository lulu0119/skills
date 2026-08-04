# Technical reference — modular SVG illustration

Self-contained excerpts for assembling **modular SVG illustrations** (light-line isometric look). Datacenter/rack filenames in the bundled repo demos are examples only — the same language applies to any subject.

## Reference viewports

| Illustration | Width | Height |
|--------------|-------|--------|
| Spatial isometric scene | 640px | 200px |
| Framed front-panel stack | 421px | 200px |

## Module order

### Primitives

| Module | Role |
|--------|------|
| `isoProject` + face matrices | 2.5D projection |
| Slotted / perforated rects | Texture fills |
| Indicator ellipses | Status dots with optional pulse |
| Rotor ellipses | Spinning elements on top plane |
| Connector path + flow overlay | Base stroke + optional highlight |
| Ground quad | Plane marker or grouping pad |

### Assemblies

| Module | Role |
|--------|------|
| Stacked slices | Repeated horizontal units on one face |
| Box solid | Top + side faces, optional facing flip |
| Accessory block | Smaller volume beside a main solid |
| Framed face | Inset panel with zones (mesh, vents, bays, controls) |

### Scene

| Concern | Notes |
|---------|-------|
| Placements | `gx, gz, height, unit count, facing` |
| Connectors | Ground-plane polylines; right-angle multi-segment lanes; optional off-canvas legs |
| Draw order | See [composition rules](#composition-rules) |
| Fit | Bake transform from visible bounds into viewBox |

## Composition rules

Hard constraints distilled from real iteration — apply to any spatial scene in this style.

### Solids

| Rule | Detail |
|------|--------|
| Uniform unit width | One `UNIT_W` for every cabinet; large ≠ scaled-up small — differ by **height (U count)** and accessories only |
| Square footprint | Rack depth = width |
| Orientation | `facing: "L" \| "R"` — true 90° turn via face matrices, not a mirror hack |
| Volume | Distinct top / main / side fill levels — must read as solid, not folded paper |
| 1U slice | Vertical vents + small indicator ellipse + drive-bay square; derive from host front-panel module when available |
| Accessory | Low rooftop chiller beside main solid — fans on **top plane**, sky-facing ellipses; side faces get horizontal bar vents |

### Ground and grouping

| Rule | Detail |
|------|--------|
| Carpet | Shared pad under a main solid + its accessory (= one site) |
| Pad | Per-node floor marker for satellite solids |
| Draw order | **Cables → carpet/pads (cover joints) → solids depth-sorted** |
| Occlusion | Flowing highlight on cables is occluded by nearer solids — same depth sort as geometry |

### Cables and data flow

| Rule | Detail |
|------|--------|
| Routing | All links on the ground plane; L-shaped lanes with distinct paths |
| Topology | Hub-and-spoke from core to sites; a few legs may extend off-canvas |
| Data motion | Soft `stroke-dashoffset` flow along path — **not** traveling dots or balls |
| Audit | Endpoints at pad/center anchors; no meaningless crossings; should read clean, not messy |

### Host alignment

| Rule | Detail |
|------|--------|
| Viewport | Measure from the real demo component, not a default |
| Tokens | Reuse sibling illustration palette (`PANEL_C` / `ISO_C` style) for visual consistency |
| CSS | Register keyframes in host stylesheet; reuse existing animation class names when present |
| Files | `*-iso-parts.tsx` + `*Demo.tsx`, mirroring existing `*-parts` pattern |

## Projection and face matrices

```js
const ISO_CX = 0.866
const ISO_SY = 0.5

function isoProject(x, y, z) {
  return [(x - z) * ISO_CX, (x + z) * ISO_SY - y]
}
function matTop(gx, gz, hh) {
  return [ISO_CX, ISO_SY, -ISO_CX, ISO_SY, (gx - gz) * ISO_CX, (gx + gz) * ISO_SY - hh]
}
function matLeftFace(gx, gz, wZ) {
  return [ISO_CX, ISO_SY, 0, -1, (gx - gz - wZ) * ISO_CX, (gx + gz + wZ) * ISO_SY]
}
function matRightFace(gx, gz, wX) {
  return [-ISO_CX, ISO_SY, 0, -1, (gx + wX - gz) * ISO_CX, (gx + wX + gz) * ISO_SY]
}
function mstr(m) {
  return `matrix(${m.map((v) => v.toFixed(4)).join(" ")})`
}
```

## Theme tokens

Spatial scene palette:

```js
const ISO_C = {
  top: "var(--color-card)",
  main: "color-mix(in oklch, var(--color-foreground) 4%, var(--color-card))",
  side: "color-mix(in oklch, var(--color-foreground) 9%, var(--color-card))",
  edge: "var(--color-border)",
  soft: "color-mix(in oklch, var(--color-foreground) 13%, transparent)",
  rail: "color-mix(in oklch, var(--color-foreground) 16%, transparent)",
  vent: "color-mix(in oklch, var(--color-foreground) 20%, transparent)",
  bay: "color-mix(in oklch, var(--color-foreground) 4%, transparent)",
  accent: "var(--color-primary)",
  fanRim: "color-mix(in oklch, var(--color-foreground) 28%, transparent)",
  pad: "color-mix(in oklch, var(--color-foreground) 5%, var(--color-card))",
  padEdge: "color-mix(in oklch, var(--color-foreground) 11%, transparent)",
  carpet: "color-mix(in srgb, var(--color-primary) 8%, var(--color-card))",
}
```

Framed front-panel palette:

```js
const PANEL_C = {
  body: "color-mix(in oklch, var(--color-foreground) 4%, var(--color-card))",
  edge: "var(--color-border)",
  face: "var(--color-card)",
  line: "color-mix(in oklch, var(--color-foreground) 13%, transparent)",
  vent: "color-mix(in oklch, var(--color-foreground) 8%, transparent)",
  fill: "color-mix(in oklch, var(--color-foreground) 4%, transparent)",
  accent: "var(--color-primary)",
  accentSoft: "color-mix(in oklch, var(--color-primary) 14%, transparent)",
}
```

## Spatial primitives

Stacked 1U slice on a rack face (vents, LED ellipse, bay rect):

```js
const LED_SEQ = ["#10b981", "#38bdf8", "#f59e0b"]

function unit1U(v0, uh, index, accent) {
  const ix0 = 1, ix1 = UNIT_W - 1
  const vpad = uh * 0.24, vy = v0 + vpad, vh = uh - vpad * 2
  const midv = v0 + uh / 2
  const ventW = (ix1 - ix0) * 0.46, ventCount = 5, ventStep = ventW / ventCount
  const ledX = ix0 + ventW + (ix1 - ix0) * 0.1
  const bayW = Math.min(vh, (ix1 - ix0) * 0.2)
  const bayX = ix1 - bayW - 0.6
  let s = `<line x1="${ix0}" y1="${v0 + uh}" x2="${ix1}" y2="${v0 + uh}" stroke="${ISO_C.rail}" stroke-width="0.28"/>`
  for (let i = 0; i < ventCount; i++) {
    s += `<rect x="${ix0 + i * ventStep + ventStep * 0.28}" y="${vy}" width="${ventStep * 0.4}" height="${vh}" fill="${ISO_C.vent}"/>`
  }
  s += `<ellipse cx="${ledX}" cy="${midv}" rx="0.42" ry="0.42" fill="${accent ? ISO_C.accent : LED_SEQ[index % 3]}" class="iso-led-pulse"/>`
  s += `<rect x="${bayX}" y="${midv - bayW / 2}" width="${bayW}" height="${bayW}" fill="${ISO_C.bay}" stroke="${ISO_C.soft}" stroke-width="0.22"/>`
  return s
}
```

Ground pad and cable lane:

```js
function isoGroundQuad(minX, maxX, minZ, maxZ, variant) {
  const corners = [[minX, minZ], [maxX, minZ], [maxX, maxZ], [minX, maxZ]]
  const d = corners.map(([x, z], i) => {
    const [sx, sy] = isoProject(x, 0, z)
    return `${i ? "L" : "M"}${sx.toFixed(2)} ${sy.toFixed(2)}`
  }).join(" ")
  const fill = variant === "carpet" ? ISO_C.carpet : ISO_C.pad
  return `<path d="${d} Z" fill="${fill}" stroke="${ISO_C.padEdge}" stroke-width="0.45"/>`
}

function isoCable(points, delay) {
  const d = points.map(([x, z], i) => {
    const [sx, sy] = isoProject(x, 0.3, z)
    return `${i ? "L" : "M"}${sx.toFixed(2)} ${sy.toFixed(2)}`
  }).join(" ")
  return `<g>
    <path d="${d}" class="iso-cable"/>
    <path d="${d}" class="iso-cable-flow" style="animation-delay:${delay.toFixed(2)}s"/>
  </g>`
}
```

Top-plane fan (ellipse + spin group):

```js
// Inside matTop(gx, gz, hh) group:
`<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r}" fill="${ISO_C.top}" stroke="${ISO_C.fanRim}" stroke-width="0.45"/>
<g class="iso-fan-spin" style="transform-box:fill-box;transform-origin:center">
  ${fanBlades}
  <ellipse cx="${cx}" cy="${cy}" rx="${r * 0.18}" ry="${r * 0.18}" fill="${ISO_C.top}" stroke="${ISO_C.fanRim}" stroke-width="0.3"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${r * 0.07}" ry="${r * 0.07}" fill="${ISO_C.accent}"/>
</g>`
```

## Spatial scene assembly

Depth key and draw order:

```js
function depthKey(p) {
  return p.gx + UNIT_W + (p.gz + RACK_DEPTH)
}

function renderOverviewScene() {
  const fit = computeFitTransform() // bounds → translate + scale into viewBox
  const cables = CABLES.map((pts, i) => isoCable(pts, i * 0.7)).join("")
  const carpet = isoGroundQuad(CARPET.minX, CARPET.maxX, CARPET.minZ, CARPET.maxZ, "carpet")
  const pads = edgeRacks.map((r) =>
    isoGroundQuad(r.gx - PAD, r.gx + UNIT_W + PAD, r.gz - PAD, r.gz + RACK_DEPTH + PAD, "pad")
  ).join("")
  const solids = [...racks, cooling]
    .map((r) => ({ key: depthKey(r), svg: isoSolid(r) }))
    .sort((a, b) => a.key - b.key)
    .map((s) => s.svg)
    .join("")
  // draw order: cables → carpet/pads (hide joints) → depth-sorted solids
  return `<g transform="${fit}">${cables}${carpet}${pads}${solids}</g>`
}
```

Fit transform pattern:

```js
function computeFitTransform(pts, viewW, viewH, pad = 4) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1])
  const x = Math.min(...xs), y = Math.min(...ys)
  const w = Math.max(...xs) - x, h = Math.max(...ys) - y
  const scale = Math.min((viewW - 2 * pad) / w, (viewH - 2 * pad) / h)
  const tx = pad - x * scale + (viewW - 2 * pad - w * scale) / 2
  const ty = pad - y * scale + (viewH - 2 * pad - h * scale) / 2
  return `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})`
}
```

## Framed front-panel primitives

Perforated mesh and horizontal vent slots:

```js
function meshRect(x, y, w, h, cell = 2.4) {
  const cols = Math.max(2, Math.floor(w / cell))
  const rows = Math.max(2, Math.floor(h / cell))
  const cw = w / cols, ch = h / rows, r = Math.min(cw, ch) * 0.28
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0.8" fill="${PANEL_C.fill}" stroke="${PANEL_C.edge}" stroke-width="0.4"/>`
  for (let i = 0; i < cols * rows; i++) {
    const col = i % cols, row = Math.floor(i / cols)
    s += `<circle cx="${x + col * cw + cw / 2}" cy="${y + row * ch + ch / 2}" r="${r}" fill="${PANEL_C.vent}"/>`
  }
  return s
}

function horizVent(x, y, w, h, slots) {
  const slotW = w / slots
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0.8" fill="${PANEL_C.face}" stroke="${PANEL_C.edge}" stroke-width="0.4"/>`
  for (let i = 0; i < slots; i++) {
    s += `<rect x="${x + i * slotW + slotW * 0.32}" y="${y + 1.2}" width="${slotW * 0.36}" height="${h - 2.4}" rx="0.25" fill="${PANEL_C.vent}"/>`
  }
  return s
}
```

Status LED and chassis frame:

```js
function statusLed(cx, cy, on, color, glowId) {
  if (!on) return `<circle cx="${cx}" cy="${cy}" r="0.9" fill="${PANEL_C.line}"/>`
  return `<g>
    <circle cx="${cx}" cy="${cy}" r="2.3" fill="${color}" opacity="0.35" filter="url(#${glowId})" class="iso-led-pulse"/>
    <circle cx="${cx}" cy="${cy}" r="1" fill="${color}"/>
  </g>`
}

function chassisFrame(vbW, vbH, inner) {
  const earW = 5, bodyX = earW, bodyW = vbW - earW * 2, bodyY = 2, bodyH = vbH - 4
  const faceX = bodyX + 4, faceW = bodyW - 8
  return `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="0.8" fill="${PANEL_C.body}" stroke="${PANEL_C.edge}" stroke-width="0.6"/>
    <rect x="${faceX}" y="${bodyY + 1}" width="${faceW}" height="${bodyH - 2}" rx="0.5" fill="${PANEL_C.face}" stroke="${PANEL_C.edge}" stroke-width="0.4"/>
    ${inner}`
}
```

Panel layout helper (inset face, rack ears, handle columns):

```js
function getPanelLayout(vbW, vbH) {
  const earW = 5, bodyX = earW, bodyW = vbW - earW * 2
  const bodyY = 2, bodyH = vbH - 4, pad = 3
  const faceX = bodyX + 4, faceW = bodyW - 8
  const innerY = bodyY + pad, innerH = bodyH - pad * 2
  const handleLeftX = bodyX + 3, handleRightX = bodyX + bodyW - 3 - 3
  const contentX = handleLeftX + 3 + pad
  return { bodyX, bodyW, bodyY, bodyH, faceX, faceW, pad, innerY, innerH, handleLeftX, handleRightX, contentX }
}
```

## CSS classes and keyframes

```css
.iso-scene :is(path, line, rect, ellipse, circle) { vector-effect: non-scaling-stroke; }

.iso-cable {
  fill: none;
  stroke: color-mix(in oklch, var(--color-foreground) 22%, transparent);
  stroke-width: 0.45;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.iso-cable-flow {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 1;
  stroke-linecap: round;
  opacity: 0.5;
}

@media (prefers-reduced-motion: no-preference) {
  .iso-led-pulse { animation: iso-led-pulse 2.4s ease-in-out infinite; }
  .iso-fan-spin {
    transform-box: fill-box;
    transform-origin: center;
    animation: iso-fan-spin 3.6s linear infinite;
  }
  .iso-cable-flow {
    stroke-dasharray: 3 64;
    animation: iso-cable-flow 3.4s linear infinite;
  }
}
@keyframes iso-fan-spin { to { transform: rotate(360deg); } }
@keyframes iso-led-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
@keyframes iso-cable-flow { to { stroke-dashoffset: -67; } }

@media (prefers-reduced-motion: reduce) {
  .iso-led-pulse, .iso-fan-spin, .iso-cable-flow { animation: none; }
  .iso-cable-flow { opacity: 0; }
}
```

## Full interactive demos (optional)

If the GitHub repo is cloned, runnable HTML lives at `examples/overview-datacenter.html` and `examples/dedicated-server-rack.html`. The excerpts above are sufficient for standalone skill use.
