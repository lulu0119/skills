/** Composed isometric data-center scene (modules → scene). */
(function (global) {
  const UNIT_W = 12
  const RACK_DEPTH = 12
  const ISO_CX = 0.866
  const ISO_SY = 0.5

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
    pad: "color-mix(in oklch, var(--color-foreground) 5%, var(--color-card))",
    padEdge: "color-mix(in oklch, var(--color-foreground) 11%, transparent)",
    carpet: "color-mix(in srgb, var(--color-primary) 8%, var(--color-card))",
    fanRim: "color-mix(in oklch, var(--color-foreground) 28%, transparent)",
  }
  const LED_SEQ = ["#10b981", "#38bdf8", "#f59e0b"]

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
    s += `<ellipse cx="${ledX}" cy="${midv}" rx="0.42" ry="0.42" fill="${accent ? ISO_C.accent : LED_SEQ[index % 3]}" class="iso-led-pulse" style="animation-delay:${((index * 0.16) % 2).toFixed(2)}s"/>`
    s += `<rect x="${bayX}" y="${midv - bayW / 2}" width="${bayW}" height="${bayW}" fill="${ISO_C.bay}" stroke="${ISO_C.soft}" stroke-width="0.22"/>`
    return s
  }

  function isoRack(gx, gz, hh, units, facing, accentUnit) {
    const wX = UNIT_W, wZ = RACK_DEPTH, top = 1.4, bot = 1.2
    const uh = (hh - top - bot) / units
    const sideMat = facing === "L" ? matRightFace(gx, gz, wX) : matLeftFace(gx, gz, wZ)
    const mainMat = facing === "L" ? matLeftFace(gx, gz, wZ) : matRightFace(gx, gz, wX)
    let unitsSvg = ""
    for (let i = 0; i < units; i++) unitsSvg += unit1U(top + i * uh, uh, i, i === accentUnit)
    return `<g>
      <g transform="${mstr(matTop(gx, gz, hh))}">
        <rect x="0" y="0" width="${wX}" height="${wZ}" fill="${ISO_C.top}" stroke="${ISO_C.edge}" stroke-width="0.5"/>
        <rect x="1.1" y="1.1" width="${wX - 2.2}" height="${wZ - 2.2}" fill="none" stroke="${ISO_C.soft}" stroke-width="0.3"/>
      </g>
      <g transform="${mstr(sideMat)}">
        <rect x="0" y="0" width="12" height="${hh}" fill="${ISO_C.side}" stroke="${ISO_C.edge}" stroke-width="0.5"/>
        <line x1="4" y1="1.5" x2="4" y2="${hh - 1.5}" stroke="${ISO_C.soft}" stroke-width="0.3"/>
        <line x1="8" y1="1.5" x2="8" y2="${hh - 1.5}" stroke="${ISO_C.soft}" stroke-width="0.3"/>
      </g>
      <g transform="${mstr(mainMat)}">
        <rect x="0" y="0" width="${UNIT_W}" height="${hh}" fill="${ISO_C.main}" stroke="${ISO_C.edge}" stroke-width="0.5"/>
        ${unitsSvg}
      </g>
    </g>`
  }

  function isoCoolingUnit(gx, gz, hh) {
    const w = UNIT_W, d = RACK_DEPTH
    const bars = [1, 2, 3, 4].map((k) => hh * (k / 5))
    const cx = w / 2, cy = d / 2, r = Math.min(w, d) * 0.4, blades = 9
    let fanBlades = ""
    for (let b = 0; b < blades; b++) {
      const a0 = (b / blades) * Math.PI * 2, a1 = a0 + 0.85
      fanBlades += `<line x1="${cx + Math.cos(a0) * r * 0.2}" y1="${cy + Math.sin(a0) * r * 0.2}" x2="${cx + Math.cos(a1) * r * 0.9}" y2="${cy + Math.sin(a1) * r * 0.9}" stroke="${ISO_C.rail}" stroke-width="0.5" stroke-linecap="round"/>`
    }
    const barLines = bars.map((yy) => `<line x1="1.4" y1="${yy}" x2="${w - 1.4}" y2="${yy}" stroke="${ISO_C.vent}" stroke-width="0.9"/>`).join("")
    return `<g>
      <g transform="${mstr(matRightFace(gx, gz, w))}">
        <rect x="0" y="0" width="${d}" height="${hh}" fill="${ISO_C.side}" stroke="${ISO_C.edge}" stroke-width="0.5"/>
      </g>
      <g transform="${mstr(matLeftFace(gx, gz, d))}">
        <rect x="0" y="0" width="${w}" height="${hh}" fill="${ISO_C.main}" stroke="${ISO_C.edge}" stroke-width="0.5"/>
        ${barLines}
      </g>
      <g transform="${mstr(matTop(gx, gz, hh))}">
        <rect x="0" y="0" width="${w}" height="${d}" fill="${ISO_C.top}" stroke="${ISO_C.edge}" stroke-width="0.5"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r}" fill="${ISO_C.top}" stroke="${ISO_C.fanRim}" stroke-width="0.45"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${r * 0.78}" ry="${r * 0.78}" fill="none" stroke="${ISO_C.soft}" stroke-width="0.3"/>
        <g class="iso-fan-spin" style="transform-box:fill-box;transform-origin:center">
          ${fanBlades}
          <ellipse cx="${cx}" cy="${cy}" rx="${r * 0.18}" ry="${r * 0.18}" fill="${ISO_C.top}" stroke="${ISO_C.fanRim}" stroke-width="0.3"/>
          <ellipse cx="${cx}" cy="${cy}" rx="${r * 0.07}" ry="${r * 0.07}" fill="${ISO_C.accent}"/>
        </g>
      </g>
    </g>`
  }

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

  function isoBoxScreenPoints(gx, gz, hh) {
    const pts = []
    for (const x of [gx, gx + UNIT_W])
      for (const z of [gz, gz + RACK_DEPTH])
        for (const y of [0, hh]) pts.push(isoProject(x, y, z))
    return pts
  }

  const RACKS = [
    { id: "core", gx: 34, gz: 28, hh: 30, units: 14, facing: "L", accentUnit: 8 },
    { id: "edge-left", gx: 4, gz: 58, hh: 15, units: 7, facing: "R" },
    { id: "edge-front", gx: 34, gz: 58, hh: 15, units: 7, facing: "L" },
    { id: "edge-right", gx: 70, gz: 10, hh: 15, units: 7, facing: "R" },
  ]
  const COOLING = { gx: 48, gz: 28, hh: 8 }
  const CARPET_PAD = 2.6, PLATFORM_PAD = 2.4
  const VIEW_W = 320, VIEW_H = 100, FIT_PAD = 4

  function groundCenter(p) {
    return [p.gx + UNIT_W / 2, p.gz + RACK_DEPTH / 2]
  }
  function depthKey(p) {
    return p.gx + UNIT_W + (p.gz + RACK_DEPTH)
  }

  const coreCenter = groundCenter(RACKS[0])
  const leftCenter = groundCenter(RACKS[1])
  const frontCenter = groundCenter(RACKS[2])
  const rightCenter = groundCenter(RACKS[3])

  const CABLES = [
    [coreCenter, [leftCenter[0], coreCenter[1]], leftCenter],
    [coreCenter, [coreCenter[0], frontCenter[1]], frontCenter],
    [coreCenter, [rightCenter[0], coreCenter[1]], rightCenter],
    [rightCenter, [rightCenter[0], -70]],
    [rightCenter, [150, rightCenter[1]]],
    [leftCenter, [leftCenter[0], 130]],
    [leftCenter, [-70, leftCenter[1]]],
  ]

  const CARPET = {
    minX: Math.min(RACKS[0].gx, COOLING.gx) - CARPET_PAD,
    maxX: Math.max(RACKS[0].gx + UNIT_W, COOLING.gx + UNIT_W) + CARPET_PAD,
    minZ: Math.min(RACKS[0].gz, COOLING.gz) - CARPET_PAD,
    maxZ: Math.max(RACKS[0].gz + RACK_DEPTH, COOLING.gz + RACK_DEPTH) + CARPET_PAD,
  }

  function computeFitTransform() {
    const pts = []
    RACKS.forEach((r) => pts.push(...isoBoxScreenPoints(r.gx, r.gz, r.hh)))
    pts.push(...isoBoxScreenPoints(COOLING.gx, COOLING.gz, COOLING.hh))
    function groundRect(minX, maxX, minZ, maxZ) {
      for (const [x, z] of [[minX, minZ], [maxX, minZ], [maxX, maxZ], [minX, maxZ]])
        pts.push(isoProject(x, 0, z))
    }
    groundRect(CARPET.minX, CARPET.maxX, CARPET.minZ, CARPET.maxZ)
    for (const r of [RACKS[1], RACKS[2], RACKS[3]]) {
      groundRect(r.gx - PLATFORM_PAD, r.gx + UNIT_W + PLATFORM_PAD, r.gz - PLATFORM_PAD, r.gz + RACK_DEPTH + PLATFORM_PAD)
    }
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1])
    const x = Math.min(...xs), y = Math.min(...ys)
    const w = Math.max(...xs) - x, h = Math.max(...ys) - y
    const scale = Math.min((VIEW_W - 2 * FIT_PAD) / w, (VIEW_H - 2 * FIT_PAD) / h)
    const tx = FIT_PAD - x * scale + (VIEW_W - 2 * FIT_PAD - w * scale) / 2
    const ty = FIT_PAD - y * scale + (VIEW_H - 2 * FIT_PAD - h * scale) / 2
    return `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})`
  }

  function renderOverviewScene() {
    const fit = computeFitTransform()
    const cables = CABLES.map((pts, i) => isoCable(pts, i * 0.7)).join("")
    const carpet = isoGroundQuad(CARPET.minX, CARPET.maxX, CARPET.minZ, CARPET.maxZ, "carpet")
    const pads = [RACKS[1], RACKS[2], RACKS[3]].map((r) =>
      isoGroundQuad(r.gx - PLATFORM_PAD, r.gx + UNIT_W + PLATFORM_PAD, r.gz - PLATFORM_PAD, r.gz + RACK_DEPTH + PLATFORM_PAD, "pad")
    ).join("")
    const solids = [
      ...RACKS.map((r) => ({ key: depthKey(r), svg: isoRack(r.gx, r.gz, r.hh, r.units, r.facing, r.accentUnit) })),
      { key: depthKey(COOLING), svg: isoCoolingUnit(COOLING.gx, COOLING.gz, COOLING.hh) },
    ].sort((a, b) => a.key - b.key).map((s) => s.svg).join("")

    return `<g transform="${fit}">${cables}${carpet}${pads}${solids}</g>`
  }

  global.renderOverviewScene = renderOverviewScene
})(typeof window !== "undefined" ? window : globalThis)
