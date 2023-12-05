export interface ImageDataModel {
    id: string;
    blobName: string;
    blobUrl: string;
    timeAdded: string;
    timeUpdated: string;
    labels: string[];
    status: ImageStatus;
}

export enum ImageStatus {
    PENDING = 'pending',
    ANALYZED = 'analyzed',
}