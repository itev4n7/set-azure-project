import axios from 'axios';
import {uploadImage} from '../services/azure_blob_storage';

process.env.BLOB_STORAGE_CONNECTION_STRING = 'Dummy_Connection_String';
const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock('axios');

const mockBlobServiceClient = {
    getContainerClient: jest.fn().mockReturnValue({
        getBlockBlobClient: jest.fn().mockReturnValue({
            upload: jest.fn(),
        }),
    }),
};
jest.mock('@azure/storage-blob', () => ({
    BlobServiceClient: {
        fromConnectionString: jest.fn(() => mockBlobServiceClient),
    },
}));

describe('Image handling functionality', () => {
    beforeEach(() => {
        mockedAxios.get.mockResolvedValue({data: 'arraybuffer'});
        jest.clearAllMocks();
    });

    it('should upload image', async () => {
        const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1025px-Cat03.jpg';
        await uploadImage(imageUrl);
        expect(mockBlobServiceClient.getContainerClient).toHaveBeenCalledTimes(1);
        expect(mockBlobServiceClient.getContainerClient().getBlockBlobClient).toHaveBeenCalledTimes(1);
        expect(mockBlobServiceClient.getContainerClient().getBlockBlobClient().upload).toHaveBeenCalledTimes(1);
    });
});