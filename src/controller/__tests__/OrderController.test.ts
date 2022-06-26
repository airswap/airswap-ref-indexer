import { Order } from '@airswap/typescript';
import { Request, Response } from 'express';
import { forgeDbOrder, forgeIndexedOrder, forgeOrderResponse } from '../../Fixtures';
import { Database } from '../../database/Database';
import { IndexedOrder } from '../../model/IndexedOrder';
import { Peers } from '../../peer/Peers';
import { OrderController } from '../OrderController';
import { Filters } from './../../database/filter/Filters';
import { OrderResponse } from './../../model/OrderResponse';
import { Pagination } from '../../model/Pagination.js';

jest
    .useFakeTimers()
    .setSystemTime(new Date(1653900784706));

describe("Order controller", () => {

    let fakeDb: Partial<Database>;
    let fakePeers: Partial<Peers>;

    beforeEach(() => {
        fakeDb = {
            getOrders: jest.fn(() => Promise.resolve(new OrderResponse({ "aze": forgeIndexedOrder(1653900784696, 1653900784706) }, new Pagination("1", "1")))),
            getOrder: jest.fn(() => Promise.resolve(new OrderResponse({ "aze": forgeIndexedOrder(1653900784696, 1653900784706) }, new Pagination("1", "1")))),
            getOrderBy: jest.fn(() => Promise.resolve(new OrderResponse({ "aze": forgeIndexedOrder(1653900784696, 1653900784706) }, new Pagination("1", "1")))),
            getFilters: jest.fn(() => Promise.resolve({ signerToken: { "ETH": { min: 10, max: 10 } }, senderToken: { "dai": { min: 5, max: 5 } } } as unknown as Filters) as Promise<Filters>),
            addOrder: jest.fn(() => Promise.resolve()),
            orderExists: jest.fn(() => Promise.resolve(true)),
            generateHash: jest.fn(),
            deleteOrder: jest.fn(() => Promise.resolve()),
        };
        fakePeers = {
            getPeers: jest.fn(() => []),
            broadcast: jest.fn()
        };
    })

    describe("When debug mode enabled", () => {
        describe("Delete Order", () => {
            test("Missing hash", async () => {
                const mockRequest = {
                    body: {},
                    params: {},
                    method: "DELETE",
                    url: "/orders"
                } as Request;

                const mockResponse = {
                    json: jest.fn(),
                    sendStatus: jest.fn(),
                } as Partial<Response>;

                await new OrderController(fakePeers as Peers, fakeDb as Database, true).deleteOrder(mockRequest, mockResponse as Response);

                expect(mockResponse.sendStatus).toHaveBeenCalledWith(400);
                expect(fakeDb.deleteOrder).toHaveBeenCalledTimes(0);
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
            });


            test("Order does not exists", async () => {
                const mockRequest = {
                    body: {},
                    params: { orderHash: "a" } as Record<string, any>,
                    method: "DELETE",
                    url: "/orders/a"
                } as Request;

                const mockResponse = {
                    json: jest.fn(),
                    sendStatus: jest.fn(),
                } as Partial<Response>;

                //@ts-ignore
                fakeDb.orderExists.mockImplementation(() => false);

                await new OrderController(fakePeers as Peers, fakeDb as Database, true).deleteOrder(mockRequest, mockResponse as Response);

                expect(mockResponse.sendStatus).toHaveBeenCalledWith(404);
                expect(fakeDb.deleteOrder).toHaveBeenCalledTimes(0);
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
            });

            test("Delete order", async () => {
                const order = forgeIndexedOrder(1653900784696, 1653900784706);
                const mockRequest = {
                    body: {},
                    params: { orderHash: "a" } as Record<string, any>,
                    method: "DELETE",
                    url: "/orders/a"
                } as Request;

                const mockResponse = {
                    json: jest.fn(),
                    sendStatus: jest.fn(),
                } as Partial<Response>;

                //@ts-ignore
                fakeDb.orderExists.mockImplementation(() => true);
                //@ts-ignore
                fakeDb.getOrder.mockImplementation(() => order);

                await new OrderController(fakePeers as Peers, fakeDb as Database, true).deleteOrder(mockRequest, mockResponse as Response);

                expect(mockResponse.sendStatus).toHaveBeenCalledWith(204);
                expect(fakeDb.orderExists).toHaveBeenCalledWith("a");
                expect(fakeDb.deleteOrder).toHaveBeenCalledWith("a");
                expect(fakePeers.broadcast).toHaveBeenCalledWith("DELETE", "/orders/a", {});
            });
        });

        describe('Get orders', () => {
            test("get all", async () => {
                const mockRequest = {
                    body: undefined,
                    params: {},
                    query: {},
                    method: "GET",
                    url: "/orders"
                } as Request;

                const mockResponse = {
                    json: jest.fn()
                } as Partial<Response>;

                const expected = forgeOrderResponse();

                await new OrderController(fakePeers as Peers, fakeDb as Database).getOrders(mockRequest, mockResponse as Response);

                expect(fakeDb.getOrders).toHaveBeenCalled();
                expect(mockResponse.json).toHaveBeenCalledWith(expected);
            });

            test("get all with filers", async () => {
                const mockRequest = {
                    body: undefined,
                    params: {},
                    query: { filters: true } as Record<string, any>,
                    method: "GET",
                    url: "/orders"
                } as Request;

                const mockResponse = {
                    json: jest.fn()
                } as Partial<Response>;

                const expectedFilters = new Filters();
                expectedFilters.signerToken = { "ETH": { min: 10, max: 10 } };
                expectedFilters.senderToken = { "dai": { min: 5, max: 5 } };
                const expected = forgeOrderResponse(expectedFilters);

                await new OrderController(fakePeers as Peers, fakeDb as Database).getOrders(mockRequest, mockResponse as Response);

                expect(fakeDb.getOrders).toHaveBeenCalled();
                expect(fakeDb.getFilters).toHaveBeenCalledTimes(1);
                expect(mockResponse.json).toHaveBeenCalledWith(expected);
            });

            test("get by hash", async () => {
                const mockRequest = {
                    body: undefined,
                    params: { orderHash: "aze" },
                    query: {},
                    method: "GET",
                    url: "/orders"
                } as unknown as Request;

                const mockResponse = {
                    json: jest.fn()
                } as Partial<Response>;


                const expected = forgeOrderResponse();

                await new OrderController(fakePeers as Peers, fakeDb as Database).getOrders(mockRequest, mockResponse as Response);

                expect(fakeDb.getOrder).toHaveBeenCalledWith("aze");
                expect(mockResponse.json).toHaveBeenCalledWith(expected);
            });

            test("get by filters", async () => {
                const mockRequest = {
                    body: undefined,
                    params: { orderHash: undefined },
                    query: {
                        minSignerAmount: 200,
                        maxSignerAmount: 200,
                        minSenderAmount: 2,
                        maxSenderAmount: 20,
                        signerTokens: "eth",
                        senderTokens: "dai"
                    },
                    method: "GET",
                    url: "/orders"
                } as unknown as Request;

                const mockResponse = {
                    json: jest.fn()
                } as Partial<Response>;

                const expected = forgeOrderResponse();

                await new OrderController(fakePeers as Peers, fakeDb as Database).getOrders(mockRequest, mockResponse as Response);

                expect(fakeDb.getOrderBy).toHaveBeenCalledWith({
                    maxSenderAmount: 20,
                    maxSignerAmount: 200,
                    minSenderAmount: 2,
                    minSignerAmount: 200,
                    page: 1,
                    senderTokens: ["dai"],
                    signerTokens: ["eth"]
                });
                expect(mockResponse.json).toHaveBeenCalledWith(expected);
            });
        });

        describe("Add Order", () => {
            test("Add order nominal & broadcast", async () => {
                const order = forgeOrder(1653900784696);
                const expectedForgeHash = new IndexedOrder(forgeDbOrder(1653900784696), 1653900784706, undefined);
                const expected = forgeIndexedOrder(1653900784706, 1653900784696);
                expected.hash = "a";
                const mockRequest = {
                    body: order,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;

                const mockResponse = {
                    json: jest.fn(),
                    sendStatus: jest.fn(),
                } as Partial<Response>;

                //@ts-ignore
                fakeDb.generateHash.mockImplementation((order) => {
                    expect(order).toEqual(expectedForgeHash); // https://github.com/facebook/jest/issues/7950
                    return "a";
                });
                //@ts-ignore
                fakeDb.orderExists.mockImplementation(() => false);

                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequest, mockResponse as Response);

                expect(fakeDb.generateHash).toHaveBeenCalledTimes(1);
                expect(fakeDb.orderExists).toHaveBeenCalledWith("a");
                expect(fakeDb.addOrder).toHaveBeenCalledWith(expected);
                expect(fakePeers.broadcast).toHaveBeenCalledWith("POST", "/orders", order);
                expect(mockResponse.sendStatus).toHaveBeenCalledWith(204);
            });

            test("Add order missing data", async () => {
                const orderMissingExpiry = forgeIndexedOrder(1653900784696, 1653900784706);
                // @ts-ignore
                orderMissingExpiry.order.expiry = undefined;

                const mockRequestOrderMissingexpiry = {
                    body: orderMissingExpiry,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;

                const mockResponse = {
                    json: jest.fn(),
                    sendStatus: jest.fn(),
                } as Partial<Response>;

                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequestOrderMissingexpiry, mockResponse as Response);

                expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
                expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
                expect(mockResponse.sendStatus).toHaveBeenCalledWith(400);
            });

            test("Add order invalid data", async () => {
                const orderBadValueSenderAmount = forgeOrder(1653900784696);
                orderBadValueSenderAmount.senderAmount = "a";

                const mockRequestOrderBadValueSenderAmount = {
                    body: orderBadValueSenderAmount,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;

                const orderBadValueSignerAmount = forgeOrder(1653900784696);
                orderBadValueSignerAmount.signerAmount = "a";

                const mockRequestOrderBadValueSignerAmount = {
                    body: orderBadValueSignerAmount,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;

                const mockResponse = {
                    json: jest.fn(),
                    sendStatus: jest.fn(),
                } as Partial<Response>;

                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequestOrderBadValueSenderAmount, mockResponse as Response);
                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequestOrderBadValueSignerAmount, mockResponse as Response);

                expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
                expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
                expect(mockResponse.sendStatus).toHaveBeenCalledWith(400);
            });

            test("Add order invalid date", async () => {
                const orderDateNotInRange = forgeOrder(1653900784696);
                orderDateNotInRange.expiry = `${new Date().getTime()}${1000 * 3600 * 24 * 100}`;

                const mockRequestOrderExpiryNotInRange = {
                    body: orderDateNotInRange,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;

                const mockResponse = {
                    json: jest.fn(),
                    sendStatus: jest.fn(),
                } as Partial<Response>;

                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequestOrderExpiryNotInRange, mockResponse as Response);


                expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
                expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
                expect(mockResponse.sendStatus).toHaveBeenCalledWith(400);
            });

            test("Add: already added", async () => {
                const order = forgeOrder(1653900784696);
                const mockRequest = {
                    body: order,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;

                const mockResponse = {
                    json: jest.fn(),
                    sendStatus: jest.fn(),
                } as Partial<Response>;

                //@ts-ignore
                fakeDb.generateHash.mockImplementation(() => "a");
                //@ts-ignore
                fakeDb.orderExists.mockImplementation(() => true);

                const expected = forgeIndexedOrder(1653900784706, 1653900784696);
                //@ts-ignore
                expected.hash = undefined;

                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequest, mockResponse as Response);

                expect(fakeDb.generateHash).toHaveBeenCalledWith(expected);
                expect(fakeDb.orderExists).toHaveBeenCalledWith("a");
                expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
                expect(mockResponse.sendStatus).toHaveBeenCalledWith(204);
            });

            test("Missing order", async () => {
                const mockRequest = {
                    body: {},
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;

                const mockResponse = {
                    json: jest.fn(),
                    sendStatus: jest.fn(),
                } as Partial<Response>;

                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequest, mockResponse as Response);

                expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
                expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
                expect(mockResponse.sendStatus).toHaveBeenCalledWith(400);
            });
        });
    });

    describe("When debug mode is disabled", () => {

        test("Delete order", async () => {
            const mockRequest = {
                body: {},
                params: { orderHash: "a" } as Record<string, any>,
                method: "DELETE",
                url: "/orders/a"
            } as Request;

            const mockResponse = {
                sendStatus: jest.fn(),
            } as Partial<Response>;

            await new OrderController(fakePeers as Peers, fakeDb as Database).deleteOrder(mockRequest, mockResponse as Response);

            expect(mockResponse.sendStatus).toHaveBeenCalledWith(404);
            expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
            expect(fakeDb.getOrder).toHaveBeenCalledTimes(0);
            expect(fakeDb.deleteOrder).toHaveBeenCalledTimes(0);
            expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
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