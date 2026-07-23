'use strict';

const { test, expect } = require('@playwright/test');

test('najnovšie vydanie sa načíta a filtre fungujú', async ({ page, request }) => {
  const externalRequests = [];
  page.on('request', req => {
    const url = new URL(req.url());
    if (url.origin !== 'http://127.0.0.1:4173') externalRequests.push(req.url());
  });

  const response = await request.get('/events.json');
  expect(response.ok()).toBeTruthy();
  const data = await response.json();

  await page.goto('/');
  await expect(page.locator('#article')).toBeVisible();
  await expect(page.locator('#event-rows tr')).toHaveCount(data.events.length);
  await expect(page.locator('#result-count')).toHaveText(String(data.events.length));

  const militaryCount = data.events.filter(event => event.theme === 'military').length;
  await page.selectOption('#theme', 'military');
  await expect(page.locator('#event-rows tr')).toHaveCount(militaryCount);

  await page.fill('#search', 'text-ktorý-neexistuje-987654321');
  await expect(page.locator('#empty-state')).toBeVisible();
  await page.locator('#reset').click();
  await expect(page.locator('#event-rows tr')).toHaveCount(data.events.length);
  expect(externalRequests).toEqual([]);
});

for (const width of [320, 768, 1440]) {
  test(`stránka nepretečie pri šírke ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.waitForSelector('#event-rows tr');
    const overflow = await page.evaluate(() => ({
      body: document.body.scrollWidth - document.body.clientWidth,
      document: document.documentElement.scrollWidth - document.documentElement.clientWidth
    }));
    expect(overflow.body).toBeLessThanOrEqual(1);
    expect(overflow.document).toBeLessThanOrEqual(1);
  });
}

test('hlavička databázy neprekrýva prvý riadok udalostí', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForSelector('#event-rows tr');
  await page.locator('#database').scrollIntoViewIfNeeded();

  const header = await page.locator('thead th').first().boundingBox();
  const firstRow = await page.locator('#event-rows tr').first().boundingBox();

  expect(header).not.toBeNull();
  expect(firstRow).not.toBeNull();
  expect(firstRow.y).toBeGreaterThanOrEqual(header.y + header.height - 1);
});

test('tlač rozbalí podrobnosti a obnoví pôvodný stav', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#event-rows tr');
  const before = await page.locator('details').evaluateAll(items => items.map(item => item.open));
  await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  expect(await page.locator('details').evaluateAll(items => items.every(item => item.open))).toBeTruthy();
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  expect(await page.locator('details').evaluateAll(items => items.map(item => item.open))).toEqual(before);
});

test('archív sprístupní nemenné vydanie a návrat na aktuálnu stránku', async ({ page }) => {
  await page.goto('/archive/');
  await expect(page.getByRole('heading', { name: 'Archív vydaní' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Otvoriť vydanie' }).first()).toBeVisible();
  await page.getByRole('link', { name: 'Otvoriť vydanie' }).first().click();
  await expect(page.locator('#article')).toBeVisible();
  await expect(page.locator('#archive-link')).toHaveAttribute('href', '../');
});
