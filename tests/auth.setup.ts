import { test as setup } from '@playwright/test';


// file with saved authenticated state
const authFile = '.auth/user.json'

setup('authentication', async({page}) => {
    await page.goto('https://conduit.bondaracademy.com/');
    await page.getByText('Sign in').click()
    await page.getByRole('textbox', {name: "Email"}).fill('marctest@test.com')
    await page.getByRole('textbox', {name: "Password"}).fill('Marcp@ss123')
    await page.getByRole('button').click()
    await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags')

    // Make sure app is fully logged in before saving
    await page.context().storageState({path: authFile})
})