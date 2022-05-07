import axios, { AxiosResponse } from "axios";
import { PeersClient } from './../PeersClient';
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

describe("Peers client", () => {
    it("add peer", async () => {
        mockedAxios.post.mockImplementation((url: string, data: any) => {
            expect(url).toBe("url_to/peers/")
            expect(data).toEqual({ urls: ["new_peer"] })
            return Promise.resolve(axios200Response({}));
        });
        const response = await new PeersClient().addPeer("url_to", "new_peer");
        expect(response).toBeDefined();
    });

    it("get peers", async () => {
        mockedAxios.get.mockImplementation((url: string) => {
            expect(url).toBe("url_to/peers/")
            return Promise.resolve(axios200Response({}));
        });
        const response = await new PeersClient().getPeers("url_to");
        expect(response).toBeDefined();
    });

    it("remove peers", async () => {
        mockedAxios.delete.mockImplementation((url: string, data: any) => {
            expect(url).toBe("url_to/peers/peer_id")
            expect(data).toBeUndefined()
            return Promise.resolve(axios200Response({}));
        });
        const response = await new PeersClient().removePeer("url_to", "peer_id");
        expect(response).toBeDefined();
    });

    describe("Broadcast", () => {
        it("should not rebuild put request", async () => {
            mockedAxios.put.mockImplementation((url: string, data: any) => {
                return Promise.reject();
            });
            await new PeersClient().sendTo("PUT", "a_url", { key: "value" });
            expect(mockedAxios.put).not.toHaveBeenCalled();
        });

        it("should rebuild get request", async () => {
            mockedAxios.get.mockImplementation((url: string, data: any) => {
                expect(url).toBe("a_url")
                expect(data).toBeUndefined()
                return Promise.resolve(axios200Response({}));
            });
            const response = await new PeersClient().sendTo("GET", "a_url", { key: "value" });
            expect(response).toBeDefined();
        });

        it("should rebuild post request", async () => {
            mockedAxios.post.mockImplementation((url: string, data: any) => {
                expect(url).toBe("a_url")
                expect(data).toEqual({ key: "value" });
                return Promise.resolve(axios200Response({}));
            });
            const response = await new PeersClient().sendTo("POST", "a_url", { key: "value" });
            expect(response).toBeDefined();
        });

        it("should rebuild delete request", async () => {
            mockedAxios.delete.mockImplementation((url: string, data: any) => {
                expect(url).toBe("a_url")
                expect(data).toBeUndefined()
                return Promise.resolve(axios200Response({}));
            });
            const response = await new PeersClient().sendTo("DELETE", "a_url", { key: "value" });
            expect(response).toBeDefined();
        });
    });

});  