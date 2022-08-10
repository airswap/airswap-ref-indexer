import { forgeIndexedOrder } from '../../Fixtures';
import axios, { AxiosResponse } from "axios";
import { OrderClient } from '../OrderClient';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function axios200Response(data: object): AxiosResponse<any> {
    return {
        data: data,
        status: 200,
        statusText: "OK",
        config: {},
        headers: {}
    }
};

describe("Order client", () => {
    it("Get orders", async () => {
        mockedAxios.get.mockImplementation((url: string) => {
            expect(url).toBe("my_url/orders/")
            return Promise.resolve(axios200Response({}));
        });
        const response = await new OrderClient().getOrders("my_url");
        expect(response).toBeDefined();
    });
});