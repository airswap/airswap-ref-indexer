import { Request, Response } from 'express';
import { Database } from '../../database/Database';
import { Order } from './../../model/Order';
import { TransactionStatus } from './../../model/TransactionStatus';
import { Peers } from './../../peer/Peers';
import { HomeController } from './../HomeController';
describe("Home controller", () => {

    let fakeDb: Partial<Database>;
    let fakePeers: Partial<Peers>;
    let registryAddress = "registry";
    const order = forgeOrder();

    beforeEach(() => {
        fakeDb = {
            getOrders: jest.fn(() => Promise.resolve( ({ "aze": order })) as Promise<Record<string, Order>>),
        };
        fakePeers = {
            getPeers: jest.fn(() => [])
        };
    })

    test("/", async () => {
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
                    from: "from",
                    fromToken: "fromToken",
                    toToken: "toToken",
                    amountFromToken: 1,
                    amountToToken: 2,
                    expirationDate: new Date(1653138423537),
                    status: "IN_PROGRESS",
                },
            },
            peers: [],
            registry: "registry",
        };

        await new HomeController(fakePeers as Peers, fakeDb as Database, registryAddress).get(mockRequest, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith(expected);
    });
});

function forgeOrder() {
    return new Order("from", "fromToken", "toToken", 1, 2, new Date(1653138423537), TransactionStatus.IN_PROGRESS);
}
