import {ServiceBusClient} from '@azure/service-bus';
import * as process from "process";

const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING!;
const queueName = 'webapianalyzequeue'
export async function sendMessage(messageBody: object) {
    const sbClient = new ServiceBusClient(connectionString);
    const sender = sbClient.createSender(queueName);
    const message = {
        body: messageBody
    };
    await sender.sendMessages(message);
    await sbClient.close()
    await sender.close();
}

export async function receiveMessage() {
    const sbClient = new ServiceBusClient(connectionString);
    const receiver = sbClient.createReceiver(queueName);
    const message = await receiver.receiveMessages(1, {maxWaitTimeInMs: 5000})
    if (message) {
        await receiver.completeMessage(message[0]);
        return message[0];
    } else {
        return null;
    }
}
