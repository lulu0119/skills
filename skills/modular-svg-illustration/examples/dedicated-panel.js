/** Port of dedicated-server-front-parts.tsx + WhyChooseDedicatedDemo.tsx */
(function (global) {
  const PANEL_VB_W = 304
  const VB_H = { 1: 24, 2: 48, 4: 96 }
  const U_PX = 24
  const VARIANTS = [
    { units: 1, label: "1U" },
    { units: 2, label: "2U" },
    { units: 4, label: "4U" },
  ]

  const FACE_WIDTH_MM = 445
  const INNER_FACE_HEIGHT_MM = { 2: 78, 4: 165 }
  const BAY_35_MM = { w: 101.6, h: 24 }
  const BAY_25_MM = { w: 69, h: 15 }
  const IO_STRIP_W = 12
  const RACK_HANDLE_W = 3
  const RACK_HANDLE_BODY_INSET = 3

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
  const LED = { green: "#10b981", cyan: "#38bdf8", amber: "#f59e0b", blue: "#60a5fa" }
  const TONES_3 = ["green", "cyan", "amber"]

  function mmAcrossFace(mm, faceW) {
    return (mm / FACE_WIDTH_MM) * faceW
  }
  function mmAcrossInnerHeight(mm, innerH, units) {
    return (mm / INNER_FACE_HEIGHT_MM[units]) * innerH
  }
  function horizVentSlots(w) {
    return Math.max(6, Math.round(w / 3.4))
  }
  function ioStripCenterSpacing(span, ledCount) {
    return ledCount > 0 ? span / ledCount : 0
  }

  function getPanelLayout(vbW, vbH) {
    const earW = 5
    const bodyX = earW
    const bodyW = vbW - earW * 2
    const bodyY = 2
    const bodyH = vbH - 4
    const faceX = bodyX + 4
    const faceW = bodyW - 8
    const pad = 3
    const innerY = bodyY + pad
    const innerH = bodyH - pad * 2
    const handleLeftX = bodyX + RACK_HANDLE_BODY_INSET
    const handleRightX = bodyX + bodyW - RACK_HANDLE_BODY_INSET - RACK_HANDLE_W
    const contentX = handleLeftX + RACK_HANDLE_W + pad
    return { bodyX, bodyW, bodyY, bodyH, faceX, faceW, pad, innerY, innerH, handleLeftX, handleRightX, contentX }
  }

  function getCoolingZone(L, units) {
    const startX = L.contentX
    const gap = L.faceW * 0.018
    if (units === 1) {
      const zoneW = L.faceW * 0.3
      return { zoneW, gap, startX, endX: startX + zoneW + gap }
    }
    if (units === 2) {
      const zoneW = L.faceW * 0.34
      return { zoneW, gap, startX, endX: startX + zoneW + gap }
    }
    const zoneW = L.faceW * 0.4
    return { zoneW, gap, startX, endX: startX + zoneW + gap }
  }

  function getDriveCageMetrics(L, units) {
    const aspect = BAY_35_MM.w / BAY_35_MM.h
    if (units === 2) {
      const rows = 3
      const cols = 1
      const gapY = 1.1
      const gapX = 0
      const bayH = mmAcrossInnerHeight(BAY_35_MM.h, L.innerH, 2)
      const bayW = Math.min(mmAcrossFace(BAY_35_MM.w, L.faceW), bayH * aspect)
      return { bayW, bayH, cageW: bayW, cageH: bayH * rows + gapY * (rows - 1), cols, rows, gapX, gapY, formFactor: "3.5" }
    }
    const rows = 6
    const cols = 2
    const gapY = 1.1
    const gapX = 1.4
    const maxBayH = (L.innerH - gapY * (rows - 1)) / rows
    let bayH = Math.min(mmAcrossInnerHeight(BAY_35_MM.h, L.innerH, 4), maxBayH)
    let bayW = Math.min(mmAcrossFace(BAY_35_MM.w, L.faceW), bayH * aspect)
    const z = getCoolingZone(L, 4)
    const maxCageW = L.handleRightX - z.gap - z.endX - z.gap
    const maxBayW = (maxCageW - gapX * (cols - 1)) / cols
    bayW = Math.min(bayW, Math.max(0, maxBayW))
    bayH = Math.min(bayH, bayW / aspect)
    return {
      bayW,
      bayH,
      cageW: bayW * cols + gapX * (cols - 1),
      cageH: bayH * rows + gapY * (rows - 1),
      cols,
      rows,
      gapX,
      gapY,
      formFactor: "3.5",
    }
  }

  function meshRect(x, y, w, h, cell = 2.4) {
    const cols = Math.max(2, Math.floor(w / cell))
    const rows = Math.max(2, Math.floor(h / cell))
    const cw = w / cols
    const ch = h / rows
    const r = Math.min(cw, ch) * 0.28
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0.8" fill="${PANEL_C.fill}" stroke="${PANEL_C.edge}" stroke-width="0.4"/>`
    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
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

  function statusLed(cx, cy, on, color, glowId) {
    if (!on) return `<circle cx="${cx}" cy="${cy}" r="0.9" fill="${PANEL_C.line}"/>`
    return `<g>
      <circle cx="${cx}" cy="${cy}" r="2.3" fill="${color}" opacity="0.35" filter="url(#${glowId})" class="iso-led-pulse"/>
      <circle cx="${cx}" cy="${cy}" r="1" fill="${color}"/>
    </g>`
  }

  function powerButton(cx, cy, r = 2.8) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${PANEL_C.face}" stroke="${PANEL_C.edge}" stroke-width="0.45"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.42}" fill="${PANEL_C.accentSoft}"/>`
  }

  function coolingFan(cx, cy, r, active, blades = 9) {
    const hubR = r * 0.24
    const sweep = ((Math.PI * 2) / blades) * 1.15
    let bladeSvg = ""
    for (let i = 0; i < blades; i++) {
      const a = (i / blades) * Math.PI * 2
      bladeSvg += `<line x1="${cx + Math.cos(a) * hubR}" y1="${cy + Math.sin(a) * hubR}" x2="${cx + Math.cos(a + sweep) * (r - 1.6)}" y2="${cy + Math.sin(a + sweep) * (r - 1.6)}" stroke="${PANEL_C.line}" stroke-width="${Math.max(0.4, r * 0.06)}" stroke-linecap="round"/>`
    }
    return `<g>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${PANEL_C.fill}" stroke="${PANEL_C.edge}" stroke-width="0.5"/>
      <circle cx="${cx}" cy="${cy}" r="${r - 1.1}" fill="none" stroke="${PANEL_C.line}" stroke-width="0.35"/>
      <g class="${active ? "iso-fan-spin" : ""}" style="transform-box:fill-box;transform-origin:center">
        ${bladeSvg}
        <circle cx="${cx}" cy="${cy}" r="${hubR}" fill="${PANEL_C.face}" stroke="${PANEL_C.edge}" stroke-width="0.4"/>
        <circle cx="${cx}" cy="${cy}" r="${hubR * 0.42}" fill="${PANEL_C.accent}"/>
      </g>
    </g>`
  }

  function fanBay(x, y, w, h, active) {
    const gap = w * 0.07
    const cell = (w - gap) / 2
    const r = Math.min(cell, h) / 2 - 0.6
    const cy = y + h / 2
    return coolingFan(x + cell / 2, cy, r, active) + coolingFan(x + cell + gap + cell / 2, cy, r, active)
  }

  function driveBay(x, y, w, h, formFactor = "3.5") {
    const latchW = formFactor === "3.5" ? 2.6 : 2
    const ledW = 1.2
    const ledH = Math.min(h - 2, formFactor === "3.5" ? 2.6 : 1.8)
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0.6" fill="${PANEL_C.face}" stroke="${PANEL_C.edge}" stroke-width="0.45"/>
      <rect x="${x + 0.8}" y="${y + 0.9}" width="${latchW}" height="${h - 1.8}" rx="0.3" fill="${PANEL_C.line}"/>
      <rect x="${x + latchW + 1.6}" y="${y + 1}" width="${Math.max(0, w - latchW - ledW - 3.6)}" height="${h - 2}" rx="0.25" fill="${PANEL_C.fill}"/>
      <rect x="${x + w - ledW - 1}" y="${y + h / 2 - ledH / 2}" width="${ledW}" height="${ledH}" rx="0.25" fill="${PANEL_C.accent}"/>`
  }

  function driveGrid(x, y, cols, rows, bayW, bayH, gapX, gapY, formFactor) {
    let s = ""
    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      s += driveBay(x + col * (bayW + gapX), y + row * (bayH + gapY), bayW, bayH, formFactor)
    }
    return s
  }

  function rackHandle(x, y, h) {
    return `<rect x="${x}" y="${y}" width="${RACK_HANDLE_W}" height="${h}" rx="0.6" fill="${PANEL_C.fill}" stroke="${PANEL_C.edge}" stroke-width="0.4"/>
      <rect x="${x + RACK_HANDLE_W / 2 - 0.35}" y="${y + 1.5}" width="0.7" height="${Math.max(0, h - 3)}" rx="0.35" fill="${PANEL_C.accent}"/>`
  }

  function rackHandles(L) {
    return rackHandle(L.handleLeftX, L.innerY, L.innerH) + rackHandle(L.handleRightX, L.innerY, L.innerH)
  }

  function ioStrip(x, y, h, units, active, glowId, w) {
    const tones = units === 4 ? ["green", "cyan", "amber", "blue"] : units === 2 ? TONES_3 : ["green"]
    const powerR = units === 1 ? 2 : 2.35
    const inset = units === 1 ? 3 : 4.5
    if (w !== undefined) {
      const stripH = Math.min(h - 2.8, IO_STRIP_W)
      const stripY = y + (h - stripH) / 2
      const cy = stripY + stripH / 2
      const powerCx = x + w - inset
      const ledLeft = x + inset
      const spacing = ioStripCenterSpacing(powerCx - ledLeft, tones.length)
      const leds = tones.map((t, i) => statusLed(ledLeft + i * spacing, cy, active, LED[t], glowId)).join("")
      return `<rect x="${x}" y="${stripY}" width="${w}" height="${stripH}" rx="0.6" fill="${PANEL_C.fill}" stroke="${PANEL_C.edge}" stroke-width="0.4"/>${leds}${powerButton(powerCx, cy, powerR)}`
    }
    const cx = x + IO_STRIP_W / 2
    const powerCy = y + h - inset
    const ledTop = y + inset
    const spacing = ioStripCenterSpacing(powerCy - ledTop, tones.length)
    const leds = tones.map((t, i) => statusLed(cx, ledTop + i * spacing, active, LED[t], glowId)).join("")
    return `<rect x="${x}" y="${y}" width="${IO_STRIP_W}" height="${h}" rx="0.6" fill="${PANEL_C.fill}" stroke="${PANEL_C.edge}" stroke-width="0.4"/>${leds}${powerButton(cx, powerCy, powerR)}`
  }

  function controlBoard(x, y, w, h, active, glowId) {
    const stripW = w * 0.48
    const ventX = x + stripW + w * 0.04
    const ventW = w - stripW - w * 0.04
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0.8" fill="${PANEL_C.fill}" stroke="${PANEL_C.edge}" stroke-width="0.4"/>
      ${ioStrip(x + 1.4, y, h, 4, active, glowId, stripW - 2.8)}
      ${horizVent(ventX, y + 1.4, ventW, h - 2.8, horizVentSlots(ventW))}`
  }

  function coolingLeftZone(L, units, active, glowId) {
    const z = getCoolingZone(L, units)
    if (units === 1) return meshRect(z.startX, L.innerY, z.zoneW, L.innerH, 2.2)
    if (units === 2) return fanBay(z.startX, L.innerY, z.zoneW, L.innerH, active)
    const fanH = L.innerH * 0.62
    const boardGap = L.innerH * 0.04
    const boardY = L.innerY + fanH + boardGap
    const boardH = L.innerH - fanH - boardGap
    return fanBay(z.startX, L.innerY, z.zoneW, fanH, active) + controlBoard(z.startX, boardY, z.zoneW, boardH, active, glowId)
  }

  function driveRightZone(L, units, active, glowId) {
    const z = getCoolingZone(L, units)
    const cage = getDriveCageMetrics(L, units)
    const ioX = z.endX
    const driveX = units === 4 ? ioX + z.gap : ioX + IO_STRIP_W + z.gap
    const driveY = L.innerY + (L.innerH - cage.cageH) / 2
    const fillerX = driveX + cage.cageW + z.gap
    const fillerW = L.handleRightX - z.gap - fillerX
    let s = ""
    if (units === 2) s += ioStrip(ioX, L.innerY, L.innerH, 2, active, glowId)
    s += driveGrid(driveX, driveY, cage.cols, cage.rows, cage.bayW, cage.bayH, cage.gapX, cage.gapY, cage.formFactor)
    if (fillerW > 8) s += horizVent(fillerX, L.innerY, fillerW, L.innerH, horizVentSlots(fillerW))
    return s
  }

  function serverFrontFace(units, L, active, glowId) {
    if (units === 1) {
      const z = getCoolingZone(L, 1)
      const ioX = z.endX
      const driveW = mmAcrossFace(BAY_25_MM.w, L.faceW)
      const driveX = L.handleRightX - z.gap - driveW
      const ventX = ioX + IO_STRIP_W + z.gap
      const ventW = driveX - z.gap - ventX
      return coolingLeftZone(L, 1, active, glowId)
        + ioStrip(ioX, L.innerY, L.innerH, 1, active, glowId)
        + horizVent(ventX, L.innerY, ventW, L.innerH, horizVentSlots(ventW))
        + driveBay(driveX, L.innerY, driveW, L.innerH, "2.5")
        + rackHandles(L)
    }
    return coolingLeftZone(L, units, active, glowId) + driveRightZone(L, units, active, glowId) + rackHandles(L)
  }

  function chassisFrame(vbW, vbH, inner) {
    const earW = 5
    const bodyX = earW
    const bodyW = vbW - earW * 2
    const bodyY = 2
    const bodyH = vbH - 4
    const faceX = bodyX + 4
    const faceW = bodyW - 8
    const earCx = 2 + earW / 2
    const holeR = Math.min(0.8, bodyH * 0.05)
    const holeYs = [bodyY + bodyH * 0.22, bodyY + bodyH * 0.78]
    let ears = ""
    holeYs.forEach((cy) => {
      ears += `<circle cx="${earCx}" cy="${cy}" r="${holeR}" fill="${PANEL_C.vent}" stroke="${PANEL_C.edge}" stroke-width="0.3"/>
        <circle cx="${vbW - earCx}" cy="${cy}" r="${holeR}" fill="${PANEL_C.vent}" stroke="${PANEL_C.edge}" stroke-width="0.3"/>`
    })
    return `${ears}
      <rect x="2" y="${bodyY}" width="${earW}" height="${bodyH}" rx="0.4" fill="${PANEL_C.body}" stroke="${PANEL_C.edge}" stroke-width="0.45"/>
      <rect x="${vbW - earW - 2}" y="${bodyY}" width="${earW}" height="${bodyH}" rx="0.4" fill="${PANEL_C.body}" stroke="${PANEL_C.edge}" stroke-width="0.45"/>
      <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="0.8" fill="${PANEL_C.body}" stroke="${PANEL_C.edge}" stroke-width="0.6"/>
      <rect x="${faceX}" y="${bodyY + 1}" width="${faceW}" height="${bodyH - 2}" rx="0.5" fill="${PANEL_C.face}" stroke="${PANEL_C.edge}" stroke-width="0.4"/>
      ${inner}`
  }

  function renderServerSvg(units, active) {
    const h = VB_H[units]
    const L = getPanelLayout(PANEL_VB_W, h)
    const glowId = "glow-" + units + "-" + Math.random().toString(36).slice(2, 8)
    const ratio = PANEL_VB_W / h
    return `<div class="rack-svg-aspect" style="aspect-ratio:${ratio}">
      <svg viewBox="0 0 ${PANEL_VB_W} ${h}" aria-hidden="true">
        <defs><filter id="${glowId}" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="1.1"/></filter></defs>
        ${chassisFrame(PANEL_VB_W, h, serverFrontFace(units, L, active, glowId))}
      </svg>
    </div>`
  }

  function initDedicatedRackDemo(stackId, viewportId, opts = {}) {
    const stack = document.getElementById(stackId)
    const viewport = document.getElementById(viewportId)
    if (!stack || !viewport) return

    const cycleMs = opts.cycleMs ?? 3000
    let index = 0
    let paused = false
    let timer = null
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    function selectRow(i) {
      if (index === i && paused) return
      paused = true
      index = i
      render()
      scheduleCycle()
    }

    function render() {
      stack.innerHTML = VARIANTS.map((v, i) => {
        const selected = index === i
        const rowHeight = U_PX * v.units
        return `<div class="rack-row${selected ? " is-selected" : ""}" data-index="${i}" style="height:${rowHeight}px">
          <button type="button" class="rack-label${selected ? " is-selected" : ""}">${v.label}</button>
          <div class="rack-svg-wrap">${selected ? `<div class="iso-fade-in">${renderServerSvg(v.units, true)}</div>` : ""}</div>
        </div>`
      }).join("")
    }

    function scheduleCycle() {
      if (timer) clearInterval(timer)
      timer = null
      if (reduceMotion || paused) return
      timer = setInterval(() => {
        index = (index + 1) % VARIANTS.length
        render()
      }, cycleMs)
    }

    if (!stack.dataset.isoBound) {
      stack.dataset.isoBound = "1"
      stack.addEventListener(
        "mouseenter",
        (e) => {
          const row = e.target.closest(".rack-row")
          if (!row || !stack.contains(row)) return
          selectRow(Number(row.dataset.index))
        },
        true,
      )
      stack.addEventListener("click", (e) => {
        const row = e.target.closest(".rack-row")
        if (!row || !stack.contains(row)) return
        selectRow(Number(row.dataset.index))
      })
      viewport.addEventListener("mouseleave", () => {
        paused = false
        scheduleCycle()
      })
    }

    render()
    scheduleCycle()
  }

  global.initDedicatedRackDemo = initDedicatedRackDemo
  global.renderServerSvg = renderServerSvg
})(typeof window !== "undefined" ? window : globalThis)
