import {ServiceBusClient} from '@azure/service-bus';
import * as process from 'process';

const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING!;
const topicName = 'webapitopic'

export async function sendMessage(messageBody: object) {
    const sbClient = new ServiceBusClient(connectionString);
    const sender = sbClient.createSender(topicName);
    const message = {
        body: messageBody
    };
    await sender.sendMessages(message);
    await sbClient.close()
    await sender.close();
}
