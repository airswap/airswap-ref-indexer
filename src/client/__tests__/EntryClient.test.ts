import axios, { AxiosResponse } from "axios";
import { Entry } from '../../model/Entry';
import { TransactionStatus } from './../../model/TransactionStatus';
import { EntryClient } from './../EntryClient';
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

describe("Entry client", () => {
    it("add entry", async () => {
        const entry = new Entry("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS);

        mockedAxios.post.mockImplementation((url: string, data: any) => {
            expect(url).toBe("my_url/entries/")
            expect(data).toEqual(entry)
            return Promise.resolve(axios200Response({}));
        });
        const response = await new EntryClient().addEntry("my_url", entry)
        expect(response).toBeDefined();
    });

    it("get entries", async () => {
        mockedAxios.get.mockImplementation((url: string) => {
            expect(url).toBe("my_url/entries/")
            return Promise.resolve(axios200Response({}));
        });
        const response = await new EntryClient().getEntries("my_url");
        expect(response).toBeDefined();
    });

    it("edit entry", async () => {
        mockedAxios.put.mockImplementation((url: string, data: any) => {
            expect(url).toBe("my_url/entries/entry_id")
            expect(data).toEqual({ status: "DONE" })
            return Promise.resolve(axios200Response({}));
        });
        const response = await new EntryClient().editEntry("my_url", "entry_id", TransactionStatus.DONE);
        expect(response).toBeDefined();
    });

    describe("Broadcast", () => {
        it("should rebuild PUT request", async () => {
            mockedAxios.put.mockImplementation((url: string, data: any) => {
                expect(url).toBe("a_url")
                expect(data).toEqual({ key: "value" })
                return Promise.resolve(axios200Response({}));
            });
            const response = await new EntryClient().sendTo("PUT", "a_url", { key: "value" });
            expect(response).toBeDefined();
        });

        it("should rebuild get request", async () => {
            mockedAxios.get.mockImplementation((url: string, data: any) => {
                expect(url).toBe("a_url")
                expect(data).toBeUndefined()
                return Promise.resolve(axios200Response({}));
            });
            const response = await new EntryClient().sendTo("GET", "a_url", { key: "value" });
            expect(response).toBeDefined();
        });

        it("should rebuild post request", async () => {
            mockedAxios.post.mockImplementation((url: string, data: any) => {
                expect(url).toBe("a_url")
                expect(data).toEqual({ key: "value" });
                return Promise.resolve(axios200Response({}));
            });
            const response = await new EntryClient().sendTo("POST", "a_url", { key: "value" });
            expect(response).toBeDefined();
        });

        it("should not rebuild delete request", async () => {
            mockedAxios.delete.mockImplementation((url: string, data: any) => {
                return Promise.reject();
            });
            await new EntryClient().sendTo("DELETE", "a_url", { key: "value" });
            expect(mockedAxios.delete).not.toHaveBeenCalled();
        });
    });
});  