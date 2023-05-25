import { Database } from '../../database/Database';
import { forgeIndexedOrderResponseERC20, forgeIndexedOrderResponse } from '../../Fixtures';
import { Peers } from '../../peer/Peers';
import { RootService } from '../RootService';

describe("Root service", () => {

    let fakeDb: Partial<Database>;
    let fakePeers: Partial<Peers>;
    const indexedOrderResponseERC20 = forgeIndexedOrderResponseERC20(1653854738949, 1653854738959);
    const indexedOrderResponse = forgeIndexedOrderResponse(1653854738949, 1653854738959);

    beforeEach(() => {
        fakeDb = {
            getOrdersERC20: jest.fn(() => Promise.resolve(
                {
                    orders: { "aze": indexedOrderResponseERC20 },
                    pagination: {
                        limit: 10,
                        offset: 0,
                        resultsForQuery: 2
                    }
                }
            )),
            getOrders: jest.fn(() => Promise.resolve(
                {
                    orders: { "aze": indexedOrderResponse },
                    pagination: {
                        limit: 10,
                        offset: 0,
                        resultsForQuery: 2
                    }
                }
            )),
        };
        fakePeers = {
            getPeers: jest.fn(() => [])
        };
    })

    test("get", async () => {
        const expected =
        {
            databaseOrders: 2,
            databaseOrdersERC20: 2,
            peers: [],
            network: 5,
            registry: '0x05545815a5579d80Bd4c380da3487EAC2c4Ce299',
        };

        const result = await new RootService(fakePeers as Peers, fakeDb as Database, 5).get();

        expect(result).toEqual(expected);
    });
});