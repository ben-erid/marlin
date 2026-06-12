import type { Page } from 'playwright';

const BASE_URL = 'https://projects.co.id/';

export async function ensureLoggedIn(page: Page): Promise<boolean> {
  await page.goto(BASE_URL + 'user/my_orders', { timeout: 30_000 });
  await page.waitForTimeout(2_000);

  const content = await page.content();
  if (content.includes('LoginActivity__user_name') || page.url().includes('/login')) {
    return false; // need to login
  }
  return true; // already logged in
}

export async function doLogin(page: Page, username: string, password: string): Promise<boolean> {
  await page.goto(BASE_URL + 'public/home/login', { timeout: 30_000 });
  await page.waitForTimeout(2_000);

  await page.fill('#LoginActivity__user_name', username);
  await page.fill('#LoginActivity__password', password);
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(6_000);

  const url = page.url();
  if (url.includes('/login') || url.includes('/login')) {
    return false;
  }
  return true;
}

export async function getLoggedInUsername(page: Page): Promise<string | null> {
  const username = await page.locator('a:has-text("Logged in as")').first().textContent().catch(() => null);
  if (username) {
    return username.replace('Logged in as ', '').trim();
  }
  return null;
}
