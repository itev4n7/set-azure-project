import {app, HttpRequest, HttpResponseInit, InvocationContext} from "@azure/functions";
import {CognitiveServicesCredentials} from "@azure/ms-rest-azure-js";
import {ComputerVisionClient} from "@azure/cognitiveservices-computervision";
import {BlobServiceClient} from "@azure/storage-blob";
import {CosmosClient} from "@azure/cosmos";
import * as process from "process";

export async function httpTriggerFunctionApp(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const endpoint = process.env.COSMO_DB_ENDPOINT!;
    const key = process.env.COSMO_DB_KEY!;
    const connectionString = process.env.BLOB_STORAGE_CONNECTION_STRING!;
    const databaseId = 'webapimaindb';
    const containerId = 'webapidatacontainer';
    const containerName = 'webapiblobcontainer'

    const itemId = request.query.get('id');

    if (!itemId) {
        context.log('itemId is not defined!')
        return {body: `Please provide an id, to update labels, endpoint: ${endpoint}`};
    }

    const clientCosmo = new CosmosClient({endpoint, key});
    const database = clientCosmo.database(databaseId);
    const container = database.container(containerId);
    const resourceById = (await container.items.query(`SELECT * FROM c WHERE c.id = '${itemId}'`).fetchAll()).resources[0];
    if (!resourceById) {
        context.log('Item not found!')
        return {body: 'Item not found!'};
    }
    const blobName = resourceById.blobName
    const credentials = new CognitiveServicesCredentials(process.env.COMPUTER_VISION_KEY!);
    //issue with deploy here! idk why function app service is not deploying without any error due to this lib
    const clientVision = new ComputerVisionClient(credentials, process.env.COMPUTER_VISION_ENDPOINT!);

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const imageBuffer = await blockBlobClient.downloadToBuffer();

    const describedImage = await clientVision.describeImageInStream(imageBuffer);
    resourceById.labels = describedImage.captions!.map(caption => caption.text!);
    resourceById.timeUpdated = new Date().toISOString();
    resourceById.status = 'analyzed'
    const {resource} = await container.item(itemId).replace(resourceById);
    context.log(`Labels updated for this blob: blobName=${blobName}`)
    context.log('Updated resource: ', resource)
    return {body: `Image analyzed for ${itemId}!`};
}

app.http('httpTriggerFunctionApp', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: httpTriggerFunctionApp
});
