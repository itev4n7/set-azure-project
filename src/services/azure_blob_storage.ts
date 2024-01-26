import {BlobServiceClient} from '@azure/storage-blob';
import * as process from 'process';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid';

const connectionString = process.env.BLOB_STORAGE_CONNECTION_STRING!;
const containerName = 'webapiblobcontainer'

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)

export async function uploadImage(imageUrl: string) {
    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const imageResponse = await axios.get(imageUrl, {responseType: 'arraybuffer'});
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');
        const blobName = `image_${uuidv4()}.jpg`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(imageBuffer, imageBuffer.length);
        return blockBlobClient
    } catch (error: any) {
        console.log('uploadImage:', error)
        throw error;
    }
}

export async function downloadImage(blobName: string) {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return await blockBlobClient.downloadToBuffer();
}
