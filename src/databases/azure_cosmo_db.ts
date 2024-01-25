import {CosmosClient, Resource} from '@azure/cosmos';
import {ImageDataModel, ImageStatus} from '../models/image_data_model';
import * as process from 'process';

const endpoint = process.env.COSMO_DB_ENDPOINT!;
const key = process.env.COSMO_DB_KEY!;
const databaseId = 'webapimaindb';
const containerId = 'webapidatacontainer';
const client = new CosmosClient({endpoint, key});
const database = client.database(databaseId);
const container = database.container(containerId);

export async function getItemById(itemId: string) {
    try {
        const resource = await container.items.query(`SELECT * FROM c WHERE c.id = '${itemId}'`).fetchAll();
        if (resource.resources[0]) {
            return resource.resources[0];
        } else {
            return false;
        }
    } catch (error) {
        console.log('Error getting item:', error);
        throw error;
    }
}

export async function getAllItems() {
    try {
        return await container.items.readAll().fetchAll()
    } catch (error: any) {
        console.log('Error getting items:', error);
        throw error;
    }
}

export async function addItem(item: ImageDataModel) {
    try {
        const {resource} = await container.items.create(item);
        return resource;
    } catch (error) {
        console.log('Error adding item:', error);
        throw error;
    }
}

export async function updateItemLabels(itemId: string, labels: string[]) {
    try {
        const updatedResource: ImageDataModel & Resource = await getItemById(itemId);
        if (updatedResource) {
            updatedResource.labels = labels;
            updatedResource.timeUpdated = new Date().toISOString();
            updatedResource.status = ImageStatus.ANALYZED
            const {resource} = await container.item(itemId).replace(updatedResource);
            return resource;
        } else {
            console.log('Item not found!');
            return undefined;
        }
    } catch (error) {
        console.log('Error updating item:', error);
        throw error;
    }
}

export async function deleteItemById(itemId: string) {
    try {
        const {resource: existingItem} = await container.item(itemId).read();
        if (existingItem) {
            await container.item(itemId, existingItem.partitionKey).delete();
            return true
        } else {
            return false
        }
    } catch (error: any) {
        console.error('Error removing item:', error);
        throw error
    }
}

