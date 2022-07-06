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

describe("IndexedOrder client", () => {
    it("add IndexedOrder", async () => {
        const IndexedOrder = forgeIndexedOrder();

        mockedAxios.post.mockImplementation((url: string, data: any) => {
            expect(url).toBe("my_url/orders/")
            expect(data).toEqual(IndexedOrder)
            return Promise.resolve(axios200Response({}));
        });
        const response = await new OrderClient().addOrder("my_url", IndexedOrder)
        expect(response).toBeDefined();
    });

    it("get orders", async () => {
        mockedAxios.get.mockImplementation((url: string) => {
            expect(url).toBe("my_url/orders/")
            return Promise.resolve(axios200Response({}));
        });
        const response = await new OrderClient().getOrders("my_url");
        expect(response).toBeDefined();
    });

    it("delete IndexedOrder", async () => {
        mockedAxios.delete.mockImplementation((url: string, data: any) => {
            expect(url).toBe("my_url/orders/order_id")
            expect(data).toBeUndefined();
            return Promise.resolve(axios200Response({}));
        });
        const response = await new OrderClient().delete("my_url", "order_id");
        expect(response).toBeDefined();
    });
});