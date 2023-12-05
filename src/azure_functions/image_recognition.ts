import {HookContext, HttpRequest} from '@azure/functions';
import {ComputerVisionClient} from '@azure/cognitiveservices-computervision';
import {CognitiveServicesCredentials} from '@azure/ms-rest-azure-js';
import * as process from "process";
import {updateItemLabels} from "../databases/azure_cosmo_db";
import {ServiceBusMessage} from "@azure/service-bus";
import {downloadImage} from "../services/azure_blob_storage";
import {receiveMessage} from "../services/azure_service_bus";

const imageRecognitionTrigger = async function (context: HookContext, message: ServiceBusMessage) {
    const documentId = message.body.id
    const blobName = message.body.blobName;
    if (!blobName && !documentId) {
        context.hookData.res = {
            status: 400,
            body: 'Please pass an id and blobName in the request query!'
        };
        return;
    }

    const credentials = new CognitiveServicesCredentials(process.env.COMPUTER_VISION_KEY!);
    const client = new ComputerVisionClient(credentials, process.env.COMPUTER_VISION_ENDPOINT!);

    try {
        const imageBuffer = await downloadImage(blobName);
        const result = await client.describeImageInStream(imageBuffer);
        const labels = result.captions!.map(caption => caption.text!);
        await updateItemLabels(documentId, labels)

        // close service bus topic which already received?

        context.hookData.res = {
            status: 200,
            body: 'Labels updated for this image'
        };
    } catch (error: any) {
        context.hookData.res = {
            status: 500,
            body: error.message
        };
    }
};

export default imageRecognitionTrigger;