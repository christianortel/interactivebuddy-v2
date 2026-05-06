import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const executablePath = [
  chromium.executablePath(),
  resolve(".playwright-browsers/chromium-1217/chrome-win64/chrome.exe"),
  resolve(".playwright-browsers/chromium-headless-shell-1217/chrome-headless-shell-win64/chrome-headless-shell.exe")
].find((candidate) => candidate && existsSync(candidate));

if (!executablePath) {
  throw new Error("Playwright Chromium executable was not found. Run `npx playwright install chromium` or restore the repo-local .playwright-browsers directory.");
}

process.stdout.write(executablePath);
