import { getNodeUrl } from '../getNodeUrl.js';

jest.mock('../ip_helper');

describe("getNodeUrl", () => {
    it("should return local ip", async () => {
        const host = await getNodeUrl("8080", "1", undefined);
        expect(host).toBe("http://192.168.0.0:8080/");
    });
    it("should public ip ", async () => {
        const host = await getNodeUrl("8080", "0", undefined);
        expect(host).toBe("http://90.58.26.3:8080/");
    });
    it("should return node url", async () => {
        const host = await getNodeUrl("8080", "0", "http://nodeUrl.com/");
        expect(host).toBe("http://nodeUrl.com/");
    });
});
