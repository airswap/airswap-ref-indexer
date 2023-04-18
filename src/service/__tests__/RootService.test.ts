import { Database } from '../../database/Database';
import { forgeIndexedOrderResponse } from '../../Fixtures';
import { Peers } from '../../peer/Peers';
import { RootService } from '../RootService';

describe("Root service", () => {

    let fakeDb: Partial<Database>;
    let fakePeers: Partial<Peers>;
    let registryAddress = "registry";
    const indexedOrderResponse = forgeIndexedOrderResponse(1653854738949, 1653854738959);

    beforeEach(() => {
        fakeDb = {
            getOrdersERC20: jest.fn(() => Promise.resolve(
                {
                    orders: { "aze": indexedOrderResponse },
                    pagination: {
                        first: "1",
                        last: "1"
                    },
                    ordersForQuery: 1
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
            databaseOrders: 1,
            peers: [],
            network: 1,
        };

        const result = await new RootService(fakePeers as Peers, fakeDb as Database, 1).get();

        expect(result).toEqual(expected);
    });
});