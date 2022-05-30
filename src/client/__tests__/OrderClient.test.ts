import { Order } from '@airswap/typescript';
import axios, { AxiosResponse } from "axios";
import { OtcOrder } from '../../model/OtcOrder';
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

describe("OtcOrder client", () => {
    it("add OtcOrder", async () => {
        const OtcOrder = forgeOtcOrder();

        mockedAxios.post.mockImplementation((url: string, data: any) => {
            expect(url).toBe("my_url/orders/")
            expect(data).toEqual(OtcOrder)
            return Promise.resolve(axios200Response({}));
        });
        const response = await new OrderClient().addOrder("my_url", OtcOrder)
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

    it("delete OtcOrder", async () => {
        mockedAxios.delete.mockImplementation((url: string, data: any) => {
            expect(url).toBe("my_url/orders/order_id")
            expect(data).toBeUndefined();
            return Promise.resolve(axios200Response({}));
        });
        const response = await new OrderClient().delete("my_url", "order_id");
        expect(response).toBeDefined();
    });
});  

function forgeOtcOrder(expectedAddedDate = new Date().getTime(), expiryDate = new Date().getTime() + 10) {
    return new OtcOrder(forgeOrder(`${expiryDate}`), expectedAddedDate, "id");
}

function forgeOrder(expiryDate: string): Order {
    return {
        nonce: "nonce",
        expiry: expiryDate,
        signerWallet: "signerWallet",
        signerToken: "dai",
        signerAmount: "5",
        senderToken: "ETH",
        senderAmount: "10",
        v: "v",
        r: "r",
        s: "s"
    };
}