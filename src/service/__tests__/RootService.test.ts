import { Request, Response } from 'express';
import { Pagination } from '../../model/Pagination.js';
import { Database } from '../../database/Database';
import { forgeIndexedOrder } from '../../Fixtures';
import { OrderResponse } from '../../model/response/OrderResponse';
import { Peers } from '../../peer/Peers';
import { RootService } from '../RootService';
describe("Root service", () => {

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

    test("get", async () => {
        const expected =
        {
            databaseOrders: 1,
            peers: [],
            registry: "registry",
        };

        const result = await new RootService(fakePeers as Peers, fakeDb as Database, registryAddress).get();

        expect(result).toEqual(expected);
    });
});