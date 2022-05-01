import { Request, Response } from 'express';
import { Database } from '../../database/Database';
import { Entry } from './../../model/Entry';
import { TransactionStatus } from './../../model/TransactionStatus';
import { Peers } from './../../peer/Peers';
import { HomeController } from './../HomeController';
describe("Home controller", () => {

    let fakeDb: Partial<Database>;
    let fakePeers: Partial<Peers>;
    let registryAddress = "registry";
    const entry = new Entry("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS);

    beforeEach(() => {
        fakeDb = {
            getEntries: jest.fn(() => ({ "aze": entry }) as Record<string, Entry>)
        };
        fakePeers = {
            getPeers: jest.fn(() => [])
        };
    })

    test("/", () => {
        const mockRequest = {
            body: undefined,
            params: {},
            method: "GET",
            url: "/"
        } as Request;

        const mockResponse = {
            json: jest.fn()
        } as Partial<Response>;

        const expected =
        {
            database: {
                aze: {
                    by: "by",
                    from: "from",
                    nb: 3,
                    price: 4,
                    status: "IN_PROGRESS",
                    to: "to",
                },
            },
            peers: [],
            registry: "registry",
        };

        new HomeController(fakePeers as Peers, fakeDb as Database, registryAddress).get(mockRequest, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith(expected);
    });
});