import { AlreadyExistsError } from './../../model/error/AlreadyExists';
import { ClientError } from './../../model/error/ClientError';

import { Order } from '@airswap/typescript';
import { Database } from '../../database/Database';
import { forgeDbOrder, forgeIndexedOrder, forgeOrderResponse } from '../../Fixtures';
import { IndexedOrder } from '../../model/IndexedOrder';
import { Pagination } from '../../model/Pagination.js';
import { Filters } from './../../database/filter/Filters';
import { OrderResponse } from './../../model/response/OrderResponse';
import { OrderService } from './../../service/OrderService';

jest
    .useFakeTimers()
    .setSystemTime(new Date(1653900784706));

describe("Order service", () => {

    let fakeDb: Partial<Database>;

    beforeEach(() => {
        fakeDb = {
            getOrders: jest.fn(() => Promise.resolve(new OrderResponse({ "aze": forgeIndexedOrder(1653900784696, 1653900784706) }, new Pagination("1", "1"), 1))),
            getOrder: jest.fn(() => Promise.resolve(new OrderResponse({ "aze": forgeIndexedOrder(1653900784696, 1653900784706) }, new Pagination("1", "1"), 1))),
            getOrderBy: jest.fn(() => Promise.resolve(new OrderResponse({ "aze": forgeIndexedOrder(1653900784696, 1653900784706) }, new Pagination("1", "1"), 1))),
            getFilters: jest.fn(() => Promise.resolve({ signerToken: { "ETH": { min: 10, max: 10 } }, senderToken: { "dai": { min: 5, max: 5 } } } as unknown as Filters) as Promise<Filters>),
            addOrder: jest.fn(() => Promise.resolve()),
            orderExists: jest.fn(() => Promise.resolve(true)),
            generateHash: jest.fn(),
            deleteOrder: jest.fn(() => Promise.resolve()),
        };
    })

    describe('Get orders', () => {
        test("get all", async () => {
            const expected = forgeOrderResponse();

            const result = await new OrderService(fakeDb as Database).getOrders({}, undefined);

            expect(fakeDb.getOrders).toHaveBeenCalled();
            expect(result).toEqual(expected);
        });

        test("get all with filers", async () => {
            const expectedFilters = new Filters();
            expectedFilters.signerToken = { "ETH": { min: 10, max: 10 } };
            expectedFilters.senderToken = { "dai": { min: 5, max: 5 } };
            const expected = forgeOrderResponse(expectedFilters);

            const result = await new OrderService(fakeDb as Database).getOrders({ filters: true } as Record<string, any>, undefined);

            expect(fakeDb.getOrders).toHaveBeenCalled();
            expect(fakeDb.getFilters).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expected);
        });

        test("get by hash", async () => {
            const expected = forgeOrderResponse();

            const result = await new OrderService(fakeDb as Database).getOrders({ orderHash: "aze" }, "aze");

            expect(fakeDb.getOrder).toHaveBeenCalledWith("aze");
            expect(result).toEqual(expected);
        });

        test("get by filters", async () => {
            const body = {
                minSignerAmount: 200,
                maxSignerAmount: 200,
                minSenderAmount: 2,
                maxSenderAmount: 20,
                signerTokens: "eth",
                senderTokens: "dai"
            };

            const expected = forgeOrderResponse();

            const result = await new OrderService(fakeDb as Database).getOrders(body, undefined);

            expect(fakeDb.getOrderBy).toHaveBeenCalledWith({
                maxSenderAmount: 20,
                maxSignerAmount: 200,
                minSenderAmount: 2,
                minSignerAmount: 200,
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
            }).rejects.toThrow(ClientError);

            expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
        });
    });

    describe("Add Order", () => {
        test("Add order nominal & broadcast", async () => {
            const order = forgeOrder(1653900784696);
            const expectedForgeHash = new IndexedOrder(forgeDbOrder(1653900784696), 1653900784706, undefined);
            const expected = forgeIndexedOrder(1653900784706, 1653900784696);
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
            const orderBadValueSenderAmount = forgeOrder(1653900784696);
            orderBadValueSenderAmount.senderAmount = "a";

            const orderBadValueSignerAmount = forgeOrder(1653900784696);
            orderBadValueSignerAmount.signerAmount = "a";

            await expect(async () => {
                await new OrderService(fakeDb as Database).addOrder(orderBadValueSenderAmount)
            }).rejects.toThrow();
            await expect(async () => {
                await new OrderService(fakeDb as Database).addOrder(orderBadValueSignerAmount)
            }).rejects.toThrow(ClientError);

            expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
        });

        test("Add order invalid date", async () => {
            const orderDateNotInRange = forgeOrder(1653900784696);
            orderDateNotInRange.expiry = `${new Date().getTime()}${1000 * 3600 * 24 * 100}`;

            await expect(async () => {
                await new OrderService(fakeDb as Database).addOrder(orderDateNotInRange)
            }).rejects.toThrow(ClientError);

            expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
        });

        test("Missing order", async () => {
            await expect(async () => {
                await new OrderService(fakeDb as Database).addOrder({})
            }).rejects.toThrow(ClientError);

            expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
        });

        test("Add: already added", async () => {
            const order = forgeOrder(1653900784696);

            //@ts-ignore
            fakeDb.generateHash.mockImplementation(() => "a");
            //@ts-ignore
            fakeDb.orderExists.mockImplementation(() => true);

            const expected = forgeIndexedOrder(1653900784706, 1653900784696);
            //@ts-ignore
            expected.hash = undefined;

            await expect(async () => {
                await new OrderService(fakeDb as Database).addOrder(order)
            }).rejects.toThrow(AlreadyExistsError);

            expect(fakeDb.generateHash).toHaveBeenCalledWith(expected);
            expect(fakeDb.orderExists).toHaveBeenCalledWith("a");
            expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
        });
    });

});

function forgeOrder(expiryDate: number): Order {
    return {
        nonce: "nonce",
        expiry: `${expiryDate}`,
        signerWallet: "signerWallet",
        signerToken: "dai",
        signerAmount: "5",
        senderToken: "ETH",
        senderAmount: "10",
        v: "v",
        r: "r",
        s: "s"
    };
}