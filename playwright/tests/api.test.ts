import {expect, test} from '@playwright/test'

test.describe('API tests for set-azure-project', function () {
    let id = ''
    test('post new image', async function ({request}) {
        const urlWithPhoto = 'https://set-azure-project-web-app-dev.azurewebsites.net/image?imageUrl=https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1025px-Cat03.jpg'
        const headers = {'Content-Type': 'application/json'}
        const response = await request.post(urlWithPhoto, {headers})
        const responseJson = await response.json()
        console.log('responseJson: ', responseJson)
        expect(response.status()).toEqual(200)
        const regex = /id=([^,]+)/;
        id = responseJson.body.match(regex)[1]
    })

    test('get image by id', async function ({request}) {
        const urlGetImage = `https://set-azure-project-web-app-dev.azurewebsites.net/image?id=${id}`
        const response = await request.get(urlGetImage)
        const responseJson = await response.json()
        console.log(responseJson)
        expect(response.status()).toEqual(200)
        expect(responseJson.body.id).toEqual(id)
        expect(responseJson.body.blobName).toBeDefined()
        expect(responseJson.body.blobUrl).toBeDefined()
    })
})