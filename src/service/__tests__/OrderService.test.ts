import { FiltersResponse } from '@airswap/types';
import { Web3SwapERC20Client } from '../../client/Web3SwapERC20Client';
import { Database } from '../../database/Database';
import { forgeDbOrderERC20, forgeFullOrderERC20, forgeIndexedOrderERC20, forgeIndexedOrderResponseERC20, forgeOrderResponse } from '../../Fixtures';
import { IndexedOrder } from '../../model/IndexedOrder';
import { Filters } from './../../database/filter/Filters';
import { OrderService } from './../../service/OrderService';

jest
    .useFakeTimers()
    .setSystemTime(new Date(1653900784706));

describe("Order service", () => {

    let fakeDb: Partial<Database>;
    let fakeWeb3SwapClient: Partial<Web3SwapERC20Client>;

    beforeEach(() => {
        fakeDb = {
            getOrdersERC20: jest.fn(() => Promise.resolve({ orders: { "aze": forgeIndexedOrderResponseERC20(1653900784696, 1653900784706) }, pagination: { first: "1", last: "1" }, ordersForQuery: 1 })),
            getOrderERC20: jest.fn(() => Promise.resolve({ orders: { "aze": forgeIndexedOrderResponseERC20(1653900784696, 1653900784706) }, pagination: { first: "1", last: "1" }, ordersForQuery: 1 })),
            getOrderERC20By: jest.fn(() => Promise.resolve({ orders: { "aze": forgeIndexedOrderResponseERC20(1653900784696, 1653900784706) }, pagination: { first: "1", last: "1" }, ordersForQuery: 1 })),
            getFiltersERC20: jest.fn(() => Promise.resolve({ signerToken: { "ETH": { min: BigInt(10), max: BigInt(10) } }, senderToken: { "dai": { min: BigInt(5), max: BigInt(5) } } } as unknown as Filters) as Promise<Filters>),
            addOrderERC20: jest.fn(() => Promise.resolve()),
            orderERC20Exists: jest.fn(() => Promise.resolve(true)),
            generateHash: jest.fn(),
            deleteOrderERC20: jest.fn(() => Promise.resolve()),
        };
        fakeWeb3SwapClient = {
            connectToChain: jest.fn()
        }
    })

    describe('Get orders', () => {
        test("get all", async () => {
            const expected = forgeOrderResponse();

            const result = await new OrderService(fakeDb as Database, fakeWeb3SwapClient as Web3SwapERC20Client).getOrdersERC20({});

            expect(fakeDb.getOrdersERC20).toHaveBeenCalled();
            expect(result).toEqual(expected);
        });

        test("get all with filters", async () => {
            const filters = new Filters();
            filters.signerToken = { "ETH": { min: BigInt(10), max: BigInt(10) } };
            filters.senderToken = { "dai": { min: BigInt(5), max: BigInt(5) } };
            const expectedFilters: FiltersResponse = {
                signerToken: {
                    ETH: { min: "10", max: "10" }
                },
                senderToken: {
                    dai: { min: "5", max: "5" }
                }
            }
            const expected = forgeOrderResponse(expectedFilters);

            const result = await new OrderService(fakeDb as Database, fakeWeb3SwapClient as Web3SwapERC20Client).getOrdersERC20({ filters: true } as Record<string, any>);

            expect(fakeDb.getOrdersERC20).toHaveBeenCalled();
            expect(fakeDb.getFiltersERC20).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expected);
        });

        test("get by hash", async () => {
            const expected = forgeOrderResponse();

            const result = await new OrderService(fakeDb as Database, fakeWeb3SwapClient as Web3SwapERC20Client).getOrdersERC20({ hash: "aze" });

            expect(fakeDb.getOrderERC20).toHaveBeenCalledWith("aze");
            expect(result).toEqual(expected);
        });

        test("get by filters", async () => {
            const body = {
                minSignerAmount: 200,
                maxSignerAmount: 200,
                minSenderAmount: 2,
                maxSenderAmount: 20,
                signerTokens: ["eth"],
                senderTokens: ["dai"]
            };

            const expected = forgeOrderResponse();

            const result = await new OrderService(fakeDb as Database, fakeWeb3SwapClient as Web3SwapERC20Client).getOrdersERC20(body);

            expect(fakeDb.getOrderERC20By).toHaveBeenCalledWith({
                maxSenderAmount: BigInt(20),
                maxSignerAmount: BigInt(200),
                minSenderAmount: BigInt(2),
                minSignerAmount: BigInt(200),
                page: 1,
                senderTokens: ["dai"],
                signerTokens: ["eth"]
            });
            expect(result).toEqual(expected);
        });


        test("get but data are null", async () => {
            await expect(async () => {
                // @ts-ignore
                await new OrderService(fakeDb as Database).getOrdersERC20(null, undefined)
            }).rejects.toThrow("Incorrect query");

            expect(fakeDb.orderERC20Exists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrderERC20).toHaveBeenCalledTimes(0);
        });
    });

    describe("Add Order", () => {
        test("Add order nominal & broadcast", async () => {
            const order = forgeFullOrderERC20(1653900784796);
            const expectedForgeHash = new IndexedOrder(forgeDbOrderERC20(1653900784796), 1653900784706, undefined);
            const expected = forgeIndexedOrderERC20(1653900784706, 1653900784796);
            expected.hash = "a";

            //@ts-ignore
            fakeDb.generateHash.mockImplementation((order) => {
                expect(order).toEqual(expectedForgeHash); // https://github.com/facebook/jest/issues/7950
                return "a";
            });
            //@ts-ignore
            fakeDb.orderERC20Exists.mockImplementation(() => false);

            await new OrderService(fakeDb as Database, fakeWeb3SwapClient as Web3SwapERC20Client).addOrderERC20(order);

            expect(fakeDb.generateHash).toHaveBeenCalledTimes(1);
            expect(fakeDb.orderERC20Exists).toHaveBeenCalledWith("a");
            expect(fakeDb.addOrderERC20).toHaveBeenCalledWith(expected);
            expect(fakeWeb3SwapClient.connectToChain).toHaveBeenCalledWith(5); 
        });

        test("Add order missing data", async () => {
            const orderMissingExpiry = forgeIndexedOrderERC20(1653900784696, 1653900784706);
            // @ts-ignore
            orderMissingExpiry.order.expiry = undefined;

            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapClient as Web3SwapERC20Client).addOrderERC20(orderMissingExpiry)
            }).rejects.toThrow();

            expect(fakeDb.orderERC20Exists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrderERC20).toHaveBeenCalledTimes(0);
        });

        test("Add order invalid data", async () => {
            const orderBadValueSenderAmount = forgeFullOrderERC20(1653900784696);
            orderBadValueSenderAmount.senderAmount = "a";

            const orderBadValueSignerAmount = forgeFullOrderERC20(1653900784696);
            orderBadValueSignerAmount.signerAmount = "a";

            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapClient as Web3SwapERC20Client).addOrderERC20(orderBadValueSenderAmount)
            }).rejects.toThrow();
            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapClient as Web3SwapERC20Client).addOrderERC20(orderBadValueSignerAmount)
            }).rejects.toThrow("Number fields are incorrect");

            expect(fakeDb.orderERC20Exists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrderERC20).toHaveBeenCalledTimes(0);
        });

        test("Add order invalid date", async () => {
            const orderDateNotInRange = forgeFullOrderERC20(1653900784696);
            orderDateNotInRange.expiry = `${new Date().getTime()}${1000 * 3600 * 24 * 100}`;

            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapClient as Web3SwapERC20Client).addOrderERC20(orderDateNotInRange)
            }).rejects.toThrow("Invalid expiry date");

            expect(fakeDb.orderERC20Exists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrderERC20).toHaveBeenCalledTimes(0);
        });

        test("Missing order", async () => {
            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapClient as Web3SwapERC20Client).addOrderERC20({})
            }).rejects.toThrow("No body");

            expect(fakeDb.orderERC20Exists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrderERC20).toHaveBeenCalledTimes(0);
        });

        test("Add: already added", async () => {
            const order = forgeFullOrderERC20(1653900784796);

            //@ts-ignore
            fakeDb.generateHash.mockImplementation(() => "a");
            //@ts-ignore
            fakeDb.orderERC20Exists.mockImplementation(() => true);

            const expected = forgeIndexedOrderERC20(1653900784706, 1653900784796);
            //@ts-ignore
            expected.hash = undefined;

            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapClient as Web3SwapERC20Client).addOrderERC20(order)
            }).rejects.toThrow("Already exists");

            expect(fakeDb.generateHash).toHaveBeenCalledWith(expected);
            expect(fakeDb.orderERC20Exists).toHaveBeenCalledWith("a");
            expect(fakeDb.addOrderERC20).toHaveBeenCalledTimes(0);
        });
    });

});