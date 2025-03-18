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

  // https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch() // complete API call and return result
    const responseBody = await response.json() // response.body() will return a string, we want to update first article so easier to return json
    responseBody.articles[0].title = "This is a test title"
    responseBody.articles[0].description = "This is a test description"

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })

  await page.goto('https://conduit.bondaracademy.com/');
});

test('has title', async ({ page }) => {
  // Expect a title "to contain" a substring.
  expect(await page.locator('.navbar-brand').textContent()).toEqual('conduit');
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');

  await expect(page.locator('app-article-list h1').nth(0)).toContainText('This is a test title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a test description')
  
  // adding timeout because assert is too quick, once pass/fail Playwright stops execution including mocking
  await page.waitForTimeout(1000) 
});