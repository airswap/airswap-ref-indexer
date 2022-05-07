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
});  