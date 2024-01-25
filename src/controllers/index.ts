import * as dotenv from 'dotenv';

dotenv.config();
import express from 'express';
import {uploadImage} from '../services/azure_blob_storage';
import {addItem, deleteItemById, getAllItems, getItemById} from '../databases/azure_cosmo_db';
import {v4 as uuidv4} from 'uuid';
import {ImageDataModel, ImageStatus} from '../models/image_data_model';
import {sendMessage} from '../services/azure_service_bus';

export const app = express();

app.get('/images', async (req, res) => {
    try {
        const response = await getAllItems()
        res.send({
            status: 200,
            body: response
        })
    } catch (error: any) {
        res.send({
            status: 500,
            body: `Error during get images metadata: ${error.message}`
        })
    }
})

app.get('/image', async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            res.send({
                status: 400,
                body: 'Please provide an id in the query parameters'
            });
            return;
        }
        const response = await getItemById(id.toString())
        if (response) {
            res.send({
                status: 200,
                body: response
            })
        } else {
            res.send({
                status: 404,
                body: `Item with id "${id}" not found.`
            })
        }
    } catch (error: any) {
        res.send({
            status: 500,
            body: `Error during get image metadata: ${error.message}`
        })
    }
})

app.post('/image', async (req, res) => {
    try {
        const imageUrl = req.query.imageUrl!.toString();
        if (!imageUrl) {
            res.send({
                status: 400,
                body: 'Please provide an image URL in the query parameters'
            });
            return;
        }
        const blobUploadResult = await uploadImage(imageUrl)
        const imageMetadataItem: ImageDataModel = {
            id: uuidv4(),
            blobName: blobUploadResult.name,
            blobUrl: blobUploadResult.url,
            timeAdded: new Date().toISOString(),
            timeUpdated: new Date().toDateString(),
            labels: [],
            status: ImageStatus.PENDING
        }
        console.log(imageMetadataItem)
        await addItem(imageMetadataItem)
        const body = {
            id: imageMetadataItem.id,
            blobName: imageMetadataItem.blobName,
            blobUrl: imageMetadataItem.blobUrl,
        }
        await sendMessage(body)
        res.send({
            status: 200,
            body: `Image uploaded successfully: id=${imageMetadataItem.id}, blobName=${imageMetadataItem.blobName}, blobUrl=${imageMetadataItem.blobUrl}`
        })
    } catch (error: any) {
        res.send({
            status: 500,
            body: `Error uploading image: ${error.message}`
        })
    }
})

app.delete('/image', async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) {
            res.send({
                status: 400,
                body: 'Please provide an id in the query parameters'
            });
            return;
        }
        const response = await deleteItemById(id.toString())
        if (response) {
            res.send({
                status: 200,
                body: `Item with id "${id}" deleted successfully.`
            })
        } else {
            res.send({
                status: 404,
                body: `Item with id "${id}" not found.`
            })
        }
    } catch (error: any) {
        res.send({
            status: 500,
            body: `Error during deleting image metadata: ${error.message}`
        })
    }
})

app.get('*', (req, res) => {
    res.send({
        title: '404',
        errorText: 'Page Not Found'
    })
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});