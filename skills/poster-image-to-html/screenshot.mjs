import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const canvasWidth = 896; // w-4xl
const htmlFile = "index.html";
const outputFile = "output-2x.png";

const htmlPath = path.join(__dirname, htmlFile);
const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;

const browser = await chromium.launch();
const context = await browser.newContext({
    deviceScaleFactor: 2,
    viewport: { width: canvasWidth, height: 800 },
});
const page = await context.newPage();
await page.goto(fileUrl, { waitUntil: "networkidle" });
await page.waitForFunction(
    () => typeof lucide !== "undefined" && document.querySelector("svg"),
);
await page.locator("body > div").screenshot({ path: path.join(__dirname, outputFile) });
await browser.close();

console.log(`Saved ${outputFile} (${canvasWidth * 2}px wide, 2x device scale)`);
