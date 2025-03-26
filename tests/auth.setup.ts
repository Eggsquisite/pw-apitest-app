import { test as setup, expect as assert } from '@playwright/test';
import user from '../.auth/user.json';
import fs from 'fs' // file sync library to write/read files etc


// file with saved authenticated state
const authFile = '.auth/user.json'

setup('authentication', async({page, request}) => {
    // CODE THAT GOES THRU UI
    // await page.goto('https://conduit.bondaracademy.com/');
    // await page.getByText('Sign in').click()
    // await page.getByRole('textbox', {name: "Email"}).fill('marctest@test.com')
    // await page.getByRole('textbox', {name: "Password"}).fill('Marcp@ss123')
    // await page.getByRole('button').click()
    // await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags')

    // // Make sure app is fully logged in before saving
    // await page.context().storageState({path: authFile})

    const loginResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
          "user":{"email":"marctest@test.com","password":"Marcp@ss123"}
        }
      })
    assert(loginResponse.status()).toEqual(200)
    
    const responseBody = await loginResponse.json() // Give us representation of response
    const accessToken = responseBody.user.token
    // Update user.json
    user.origins[0].localStorage[0].value = accessToken
    fs.writeFileSync(authFile, JSON.stringify(user))

    // built in feature in node.js - env variable
    process.env['ACCESS_TOKEN'] = accessToken
})