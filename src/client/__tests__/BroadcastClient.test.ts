import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { BroadcastClient } from "../BroadcastClient";
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

function axios200Response(data: object): Partial<AxiosResponse<any>> {
    return {
        data: data,
        status: 200,
        statusText: "OK",
        config: {} as InternalAxiosRequestConfig,
        headers: {}
    };
}

describe("Broadcast", () => {
    it("should rebuild PUT request", async () => {
        mockedAxios.put.mockImplementation((url: string, data: any) => {
            expect(url).toBe("a_url");
            expect(data).toEqual({ key: "value" });
            return Promise.resolve(axios200Response({}));
        });
        const response = await new BroadcastClient().broadcastTo("PUT", "a_url", { key: "value" });
        expect(response).toBeDefined();
    });

    it("should rebuild get request", async () => {
        mockedAxios.get.mockImplementation((url: string, data: any) => {
            expect(url).toBe("a_url");
            expect(data).toBeUndefined();
            return Promise.resolve(axios200Response({}));
        });
        const response = await new BroadcastClient().broadcastTo("GET", "a_url", { key: "value" });
        expect(response).toBeDefined();
    });

    it("should rebuild post request", async () => {
        mockedAxios.post.mockImplementation((url: string, data: any) => {
            expect(url).toBe("a_url");
            expect(data).toEqual({ key: "value" });
            return Promise.resolve(axios200Response({}));
        });
        const response = await new BroadcastClient().broadcastTo("POST", "a_url", { key: "value" });
        expect(response).toBeDefined();
    });

    it("should rebuild delete request", async () => {
        mockedAxios.delete.mockImplementation((url: string, data: any) => {
            expect(url).toBe("a_url");
            expect(data).toBeUndefined();
            return Promise.resolve(axios200Response({}));
        });
        const response = await new BroadcastClient().broadcastTo("DELETE", "a_url", { key: "value" });
        expect(response).toBeDefined();
    });
});
