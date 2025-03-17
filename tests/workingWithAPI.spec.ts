import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'

test.beforeEach(async ({page}) => {
  // when want to mock API, need to configure in playwright before browser makes call to API
  // await page.route('https://conduit-api.bondaracademy.com/api/tags', async route => { // request URL 
  await page.route('*/**/api/tags', async route => { // match any pattern before /api/tags
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  }) 

  await page.goto('https://conduit.bondaracademy.com/');
});

test('has title', async ({ page }) => {
  // Expect a title "to contain" a substring.
  expect(await page.locator('.navbar-brand').textContent()).toEqual('conduit');
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  
  // adding timeout because assert is too quick, once pass/fail Playwright stops execution including mocking
  await page.waitForTimeout(1000) 
});