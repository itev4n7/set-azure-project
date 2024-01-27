import {BlobServiceClient} from '@azure/storage-blob';
import * as process from 'process';
import axios from 'axios';
import {v4 as uuidv4} from 'uuid';

const containerName = 'webapiblobcontainer'

let blobServiceClient: BlobServiceClient;

export function getBlobServiceClient() {
    const connectionString = process.env.BLOB_STORAGE_CONNECTION_STRING!;
    if (!blobServiceClient) {
        blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    }
    return blobServiceClient;
}

export async function uploadImage(imageUrl: string) {
    try {
        const containerClient = getBlobServiceClient().getContainerClient(containerName);
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
    const containerClient = getBlobServiceClient().getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return await blockBlobClient.downloadToBuffer();
}
