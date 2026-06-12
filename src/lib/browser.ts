import { chromium, type Browser } from 'playwright';

const CHROMIUM_PATH = process.env.CHROMIUM_PATH
  || '/root/.cloakbrowser/chromium-146.0.7680.177.3/chrome';

// Singleton browser — shared across all sessions
let browser: Browser | null = null;

export async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless: true,
      executablePath: CHROMIUM_PATH,
      args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
    });
  }
  return browser;
}

export async function closeBrowser() {
  if (browser && browser.isConnected()) {
    await browser.close();
    browser = null;
  }
}
