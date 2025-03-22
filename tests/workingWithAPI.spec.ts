import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json'

const username = 'marc_user_here'
const email = 'marctest@test.com';
const pass = 'Marcp@ss123'


test.beforeEach(async ({page}) => {
  // when want to mock API, need to configure in playwright before browser makes call to API
  // await page.route('https://conduit-api.bondaracademy.com/api/tags', async route => { // request URL 
  await page.route('*/**/api/tags', async route => { // match any pattern before /api/tags
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  }) 

  await page.goto('https://conduit.bondaracademy.com/');
  await page.getByText('Sign in').click()
  await page.getByRole('textbox', {name: "Email"}).fill('marctest@test.com')
  await page.getByRole('textbox', {name: "Password"}).fill('Marcp@ss123')
  await page.getByRole('button').click()
});


test('has title', async ({ page }) => {
  // https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch() // complete API call and return result
    const responseBody = await response.json() // response.body() will return a string, we want to update first article so easier to return json
    responseBody.articles[0].title = "This is a MOCK test title"
    responseBody.articles[0].description = "This is a MOCK test description"

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })

  // Refresh page to trigger API change
  await page.getByText('Global Feed').click()

  // Expect a title "to contain" a substring.
  expect(await page.locator('.navbar-brand').textContent()).toEqual('conduit');
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');

  await expect(page.locator('app-article-list h1').nth(0)).toContainText('This is a MOCK test title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a MOCK test description')
  
  // adding timeout because assert is too quick, once pass/fail Playwright stops execution including mocking
  await page.waitForTimeout(1000) 
});


test('Delete article', async({page, request}) =>{
  const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user":{"email":"marctest@test.com","password":"Marcp@ss123"}
    }
  })

  const responseBody = await loginResponse.json() // Give us representation of response
  const accessToken = responseBody.user.token
  //console.log(responseBody)
  // prints this: {
  //   user: {
  //     email: 'marctest@test.com',
  //     username: 'marc_user_here',
  //     bio: null,
  //     image: 'https://conduit-api.bondaracademy.com/images/smiley-cyrus.jpeg',
  //     token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoyMjcxNX0sImlhdCI6MTc0MjM3NjA5NywiZXhwIjoxNzQ3NTYwMDk3fQ.0d_fDg4c_4AvPVIgi8JNM5sTpfKBixcXxx-VWwcxh1c'
  //   }
  // }

  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article":{"title":"test title article","description":"etst","body":"test","tagList":[]}
    },
    headers: {
      Authorization: `Token ${accessToken}`
    },
  })
  expect(articleResponse.status()).toEqual(201)

  await page.getByText('Global Feed').click()
  await page.getByText('test title article').click()
  await page.getByRole('button', {name: "Delete Article"}).first().click()
  await page.getByText('Global Feed').click()

  await expect(page.locator('app-article-list h1').nth(0)).not.toContainText('test title article')
});