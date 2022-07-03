import { Request, Response } from 'express';
import { Pagination } from '../../model/Pagination.js';
import { Database } from '../../database/Database';
import { forgeIndexedOrder } from '../../Fixtures';
import { OrderResponse } from './../../model/OrderResponse';
import { Peers } from './../../peer/Peers';
import { RootController } from './../RootController';
describe("Home controller", () => {

    let fakeDb: Partial<Database>;
    let fakePeers: Partial<Peers>;
    let registryAddress = "registry";
    const IndexedOrder = forgeIndexedOrder(1653854738949, 1653854738959);

    beforeEach(() => {
        fakeDb = {
            getOrders: jest.fn(() => Promise.resolve((new OrderResponse({ "aze": IndexedOrder }, new Pagination("1", "1"), 1))) as Promise<OrderResponse>),
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
                orders: {
                    aze: {
                        addedOn: 1653854738949,
                        hash: "hash",
                        order: {
                            expiry: 1653854738959,
                            nonce: "nonce",
                            r: "r",
                            s: "s",
                            senderAmount: "10",
                            approximatedSenderAmount: 10,
                            senderToken: "ETH",
                            signerAmount: "5",
                            approximatedSignerAmount: 5,
                            signerToken: "dai",
                            signerWallet: "signerWallet",
                            v: "v",

                        },
                    },
                },
                pagination: { first: "1", last: "1" },
                ordersForQuery: 1
            },
            peers: [],
            registry: "registry",
        };

        await new RootController(fakePeers as Peers, fakeDb as Database, registryAddress).get(mockRequest, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith(expected);
    });
});