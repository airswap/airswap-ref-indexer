import axios, { AxiosResponse } from "axios";
import { Order } from '../../model/Order';
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
    it("add order", async () => {
        const order = forgeOrder();

        mockedAxios.post.mockImplementation((url: string, data: any) => {
            expect(url).toBe("my_url/orders/")
            expect(data).toEqual(order)
            return Promise.resolve(axios200Response({}));
        });
        const response = await new OrderClient().addOrder("my_url", order)
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

    it("delete order", async () => {
        mockedAxios.delete.mockImplementation((url: string, data: any) => {
            expect(url).toBe("my_url/orders/order_id")
            expect(data).toBeUndefined();
            return Promise.resolve(axios200Response({}));
        });
        const response = await new OrderClient().delete("my_url", "order_id");
        expect(response).toBeDefined();
    });
});  

function forgeOrder() {
    return new Order("from", "signerToken", "senderToken", 1, 2, new Date(1653138423537));
}