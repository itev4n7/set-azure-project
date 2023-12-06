import {app, InvocationContext} from '@azure/functions';
import {CognitiveServicesCredentials} from "@azure/ms-rest-azure-js";
import {ComputerVisionClient} from "@azure/cognitiveservices-computervision";
import {BlobServiceClient} from "@azure/storage-blob";
import {CosmosClient} from "@azure/cosmos";
import * as process from "process";

export async function serviceBusTopicTrigger(message: any, context: InvocationContext): Promise<void> {
    try {
        context.log('Service bus topic function processed message:', message);

        const itemId = message.id
        const blobName = message.blobName;
        if (!blobName && !itemId) {
            context.log('Please provide an id and blobName!')
            return;
        }

        const credentials = new CognitiveServicesCredentials(process.env.COMPUTER_VISION_KEY!);
        const clientVision = new ComputerVisionClient(credentials, process.env.COMPUTER_VISION_ENDPOINT!);

        const connectionString = process.env.BLOB_STORAGE_CONNECTION_STRING!;
        const containerName = 'webapiblobcontainer'
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const imageBuffer = await blockBlobClient.downloadToBuffer();

        const describedImage = await clientVision.describeImageInStream(imageBuffer);
        const labels = describedImage.captions!.map(caption => caption.text!);

        const endpoint = process.env.COSMO_DB_ENDPOINT!;
        const key = process.env.COSMO_DB_KEY!;
        const databaseId = 'webapimaindb';
        const containerId = 'webapidatacontainer';
        const clientCosmo = new CosmosClient({endpoint, key});
        const database = clientCosmo.database(databaseId);
        const container = database.container(containerId);

        let updatedResource = (await container.items.query(`SELECT * FROM c WHERE c.id = '${itemId}'`).fetchAll()).resources[0];
        if (!updatedResource) {
            context.log('Item not found!')
            return;
        }
        updatedResource.labels = labels;
        updatedResource.timeUpdated = new Date().toISOString();
        updatedResource.status = 'analyzed'
        const {resource} = await container.item(itemId).replace(updatedResource);
        context.log(`Labels updated for this blob: blobName=${blobName}`)
        context.log('Updated resource: ', resource)
    } catch (error: any) {
        context.log('Error: ', error.message)
    }
}

app.serviceBusTopic('serviceBusTopicTrigger', {
    connection: "SERVICE_BUS_CONNECTION_STRING",
    subscriptionName: 'subscription1',
    topicName: 'webapitopic',
    handler: serviceBusTopicTrigger
});