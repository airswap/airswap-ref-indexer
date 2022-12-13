import { FiltersResponse } from '@airswap/libraries';
import { Database } from '../../database/Database';
import { forgeDbOrder, forgeFullOrder, forgeIndexedOrder, forgeIndexedOrderResponse, forgeOrderResponse } from '../../Fixtures';
import { IndexedOrder } from '../../model/IndexedOrder';
import { Filters } from './../../database/filter/Filters';
import { OrderService } from './../../service/OrderService';

jest
    .useFakeTimers()
    .setSystemTime(new Date(1653900784706));

describe("Order service", () => {

    let fakeDb: Partial<Database>;

    beforeEach(() => {
        fakeDb = {
            getOrders: jest.fn(() => Promise.resolve({ orders: { "aze": forgeIndexedOrderResponse(1653900784696, 1653900784706) }, pagination: { first: "1", last: "1" }, ordersForQuery: 1 })),
            getOrder: jest.fn(() => Promise.resolve({ orders: { "aze": forgeIndexedOrderResponse(1653900784696, 1653900784706) }, pagination: { first: "1", last: "1" }, ordersForQuery: 1 })),
            getOrderBy: jest.fn(() => Promise.resolve({ orders: { "aze": forgeIndexedOrderResponse(1653900784696, 1653900784706) }, pagination: { first: "1", last: "1" }, ordersForQuery: 1 })),
            getFilters: jest.fn(() => Promise.resolve({ signerToken: { "ETH": { min: BigInt(10), max: BigInt(10) } }, senderToken: { "dai": { min: BigInt(5), max: BigInt(5) } } } as unknown as Filters) as Promise<Filters>),
            addOrder: jest.fn(() => Promise.resolve()),
            orderExists: jest.fn(() => Promise.resolve(true)),
            generateHash: jest.fn(),
            deleteOrder: jest.fn(() => Promise.resolve()),
        };
    })

    describe('Get orders', () => {
        test("get all", async () => {
            const expected = forgeOrderResponse();

            const result = await new OrderService(fakeDb as Database).getOrders({});

            expect(fakeDb.getOrders).toHaveBeenCalled();
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

            const result = await new OrderService(fakeDb as Database).getOrders({ filters: true } as Record<string, any>);

            expect(fakeDb.getOrders).toHaveBeenCalled();
            expect(fakeDb.getFilters).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expected);
        });

        test("get by hash", async () => {
            const expected = forgeOrderResponse();

            const result = await new OrderService(fakeDb as Database).getOrders({ hash: "aze" });

            expect(fakeDb.getOrder).toHaveBeenCalledWith("aze");
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

            const result = await new OrderService(fakeDb as Database).getOrders(body);

            expect(fakeDb.getOrderBy).toHaveBeenCalledWith({
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
                await new OrderService(fakeDb as Database).getOrders(null, undefined)
            }).rejects.toThrow("Incorrect query");

            expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
        });
    });

    describe("Add Order", () => {
        test("Add order nominal & broadcast", async () => {
            const order = forgeFullOrder(1653900784796);
            const expectedForgeHash = new IndexedOrder(forgeDbOrder(1653900784796), 1653900784706, undefined);
            const expected = forgeIndexedOrder(1653900784706, 1653900784796);
            expected.hash = "a";

            //@ts-ignore
            fakeDb.generateHash.mockImplementation((order) => {
                expect(order).toEqual(expectedForgeHash); // https://github.com/facebook/jest/issues/7950
                return "a";
            });
            //@ts-ignore
            fakeDb.orderExists.mockImplementation(() => false);

            await new OrderService(fakeDb as Database).addOrder(order);

            expect(fakeDb.generateHash).toHaveBeenCalledTimes(1);
            expect(fakeDb.orderExists).toHaveBeenCalledWith("a");
            expect(fakeDb.addOrder).toHaveBeenCalledWith(expected);
        });

        test("Add order missing data", async () => {
            const orderMissingExpiry = forgeIndexedOrder(1653900784696, 1653900784706);
            // @ts-ignore
            orderMissingExpiry.order.expiry = undefined;

            await expect(async () => {
                await new OrderService(fakeDb as Database).addOrder(orderMissingExpiry)
            }).rejects.toThrow();

            expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
        });

        test("Add order invalid data", async () => {
            const orderBadValueSenderAmount = forgeFullOrder(1653900784696);
            orderBadValueSenderAmount.senderAmount = "a";

            const orderBadValueSignerAmount = forgeFullOrder(1653900784696);
            orderBadValueSignerAmount.signerAmount = "a";

            await expect(async () => {
                await new OrderService(fakeDb as Database).addOrder(orderBadValueSenderAmount)
            }).rejects.toThrow();
            await expect(async () => {
                await new OrderService(fakeDb as Database).addOrder(orderBadValueSignerAmount)
            }).rejects.toThrow("Number fields are incorrect");

            expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
        });

        test("Add order invalid date", async () => {
            const orderDateNotInRange = forgeFullOrder(1653900784696);
            orderDateNotInRange.expiry = `${new Date().getTime()}${1000 * 3600 * 24 * 100}`;

            await expect(async () => {
                await new OrderService(fakeDb as Database).addOrder(orderDateNotInRange)
            }).rejects.toThrow("Invalid expiry date");

            expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
        });

        test("Missing order", async () => {
            await expect(async () => {
                await new OrderService(fakeDb as Database).addOrder({})
            }).rejects.toThrow("No body");

            expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
        });

        test("Add: already added", async () => {
            const order = forgeFullOrder(1653900784796);

            //@ts-ignore
            fakeDb.generateHash.mockImplementation(() => "a");
            //@ts-ignore
            fakeDb.orderExists.mockImplementation(() => true);

            const expected = forgeIndexedOrder(1653900784706, 1653900784796);
            //@ts-ignore
            expected.hash = undefined;

            await expect(async () => {
                await new OrderService(fakeDb as Database).addOrder(order)
            }).rejects.toThrow("Already exists");

            expect(fakeDb.generateHash).toHaveBeenCalledWith(expected);
            expect(fakeDb.orderExists).toHaveBeenCalledWith("a");
            expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
        });
    });

});