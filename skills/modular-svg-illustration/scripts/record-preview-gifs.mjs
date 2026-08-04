/**
 * Re-record README preview GIFs from the interactive HTML demos.
 * Usage (from this skill directory):
 *   npm i playwright && npx playwright install chromium
 *   node scripts/record-preview-gifs.mjs
 */
import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const tmpRoot = path.join(root, ".record-tmp");

const demos = [
  {
    name: "overview-datacenter",
    html: path.join(root, "examples", "overview-datacenter.html"),
    outGif: path.join(root, "docs", "overview-datacenter.gif"),
    width: 640,
    height: 200,
    // cover fan 3.6s + cable flow
    durationMs: 4000,
    fps: 20,
  },
  {
    name: "dedicated-server-rack",
    html: path.join(root, "examples", "dedicated-server-rack.html"),
    outGif: path.join(root, "docs", "dedicated-server-rack.gif"),
    width: 421,
    height: 200,
    // cycleMs 3000 — capture a full swap + settle
    durationMs: 6500,
    fps: 20,
  },
];

function fileUrl(filePath) {
  return `file:///${filePath.replace(/\\/g, "/")}`;
}

function runFfmpeg(args) {
  const result = spawnSync("ffmpeg", args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "ffmpeg failed");
  }
}

function encodeGif({ framesDir, fps, outGif, width, height }) {
  const pattern = path.join(framesDir, "frame-%04d.png");
  const palette = path.join(framesDir, "palette.png");
  // 2× capture → display size via scale; high-quality palette
  const vfBase = `fps=${fps},scale=${width}:${height}:flags=lanczos`;

  runFfmpeg([
    "-y",
    "-framerate",
    String(fps),
    "-i",
    pattern,
    "-vf",
    `${vfBase},palettegen=stats_mode=diff`,
    palette,
  ]);

  runFfmpeg([
    "-y",
    "-framerate",
    String(fps),
    "-i",
    pattern,
    "-i",
    palette,
    "-lavfi",
    `${vfBase}[x];[x][1:v]paletteuse=dither=sierra2_4a`,
    "-loop",
    "0",
    outGif,
  ]);
}

async function captureDemo(browser, demo) {
  const framesDir = path.join(tmpRoot, demo.name);
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });

  const scale = 2;
  const context = await browser.newContext({
    viewport: { width: demo.width, height: demo.height },
    deviceScaleFactor: scale,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(fileUrl(demo.html), { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const frameCount = Math.round((demo.durationMs / 1000) * demo.fps);
  const intervalMs = 1000 / demo.fps;

  for (let i = 0; i < frameCount; i++) {
    const file = path.join(framesDir, `frame-${String(i + 1).padStart(4, "0")}.png`);
    await page.locator("body").screenshot({ path: file, type: "png" });
    if (i < frameCount - 1) {
      await page.waitForTimeout(intervalMs);
    }
  }

  await context.close();
  encodeGif({
    framesDir,
    fps: demo.fps,
    outGif: demo.outGif,
    width: demo.width,
    height: demo.height,
  });

  const sizeKb = Math.round(fs.statSync(demo.outGif).size / 1024);
  console.log(`Wrote ${path.relative(root, demo.outGif)} (${sizeKb} KB, ${frameCount} frames @ ${demo.fps}fps)`);
}

fs.rmSync(tmpRoot, { recursive: true, force: true });
fs.mkdirSync(tmpRoot, { recursive: true });

const browser = await chromium.launch();
try {
  for (const demo of demos) {
    await captureDemo(browser, demo);
  }
} finally {
  await browser.close();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}

console.log("Done.");
