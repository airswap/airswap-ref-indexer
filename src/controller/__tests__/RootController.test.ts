import { Request, Response } from 'express';
import { Database } from '../../database/Database';
import { Order } from './../../model/Order';
import { Peers } from './../../peer/Peers';
import { RootController } from './../RootController';
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
                    signerWallet: "signerWallet",
                    signerToken: "signerToken",
                    senderToken: "senderToken",
                    senderAmount: 1,
                    signerAmount: 2,
                    expiry: new Date(1653138423537),
                },
            },
            peers: [],
            registry: "registry",
        };

        await new RootController(fakePeers as Peers, fakeDb as Database, registryAddress).get(mockRequest, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith(expected);
    });
});

function forgeOrder() {
    return new Order("signerWallet", "signerToken", "senderToken", 1, 2, new Date(1653138423537));
}
