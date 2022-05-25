import { Request, Response } from 'express';
import { Database } from '../../database/Database';
import { Order } from '../../model/Order';
import { Peers } from '../../peer/Peers';
import { OrderController } from '../OrderController';

describe("Order controller", () => {

    let fakeDb: Partial<Database>;
    let fakePeers: Partial<Peers>;

    beforeEach(() => {
        fakeDb = {
            getOrders: jest.fn(() => Promise.resolve(({ "aze": forgeOrder() })) as Promise<Record<string, Order>>),
            getOrder: jest.fn(() => Promise.resolve(forgeOrder()) as Promise<Order>),
            getOrderBy: jest.fn(() => Promise.resolve(({ "aze": forgeOrder() })) as Promise<Record<string, Order>>),
            addOrder: jest.fn(() => Promise.resolve()),
            orderExists: jest.fn(() => Promise.resolve(true)),
            generateId: jest.fn(),
            deleteOrder: jest.fn(() => Promise.resolve()),
        };
        fakePeers = {
            getPeers: jest.fn(() => []),
            broadcast: jest.fn()
        };
    })

    describe("When debug mode enabled", () => {
        describe("Delete Order", () => {
            test("Missing id", async () => {
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
                    params: { orderId: "a" } as Record<string, any>,
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
                const order = forgeOrder();
                const mockRequest = {
                    body: {},
                    params: { orderId: "a" } as Record<string, any>,
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

                const expected =
                {
                    orders: {
                        aze: {
                            signerWallet: "signerWallet",
                            signerToken: "signerToken",
                            senderToken: "senderToken",
                            senderAmount: 1,
                            signerAmount: 2,
                            expiry: new Date(1653138423537),
                        },
                    }
                };

                await new OrderController(fakePeers as Peers, fakeDb as Database).getOrders(mockRequest, mockResponse as Response);

                expect(fakeDb.getOrders).toHaveBeenCalled();
                expect(mockResponse.json).toHaveBeenCalledWith(expected);
            });

            test("get by id", async () => {
                const mockRequest = {
                    body: undefined,
                    params: { orderId: "aze" },
                    query: {},
                    method: "GET",
                    url: "/orders"
                } as unknown as Request;

                const mockResponse = {
                    json: jest.fn()
                } as Partial<Response>;

                const expected =
                {
                    orders:
                    {
                        signerWallet: "signerWallet",
                        signerToken: "signerToken",
                        senderToken: "senderToken",
                        senderAmount: 1,
                        signerAmount: 2,
                        expiry: new Date(1653138423537),
                    }
                };

                await new OrderController(fakePeers as Peers, fakeDb as Database).getOrders(mockRequest, mockResponse as Response);

                expect(fakeDb.getOrder).toHaveBeenCalledWith("aze");
                expect(mockResponse.json).toHaveBeenCalledWith(expected);
            });

            test("get by filters", async () => {
                const mockRequest = {
                    body: undefined,
                    params: { orderId: undefined },
                    query: {
                        minSignerAmount: 200,
                        maxSignerAmount: 200,
                        minSenderAmount: 2,
                        maxSenderAmount: 20,
                        signerToken: "eth",
                        senderToken: "dai"
                    },
                    method: "GET",
                    url: "/orders"
                } as unknown as Request;

                const mockResponse = {
                    json: jest.fn()
                } as Partial<Response>;

                const expected =
                {
                    orders: {
                        aze: {
                            signerWallet: "signerWallet",
                            signerToken: "signerToken",
                            senderToken: "senderToken",
                            senderAmount: 1,
                            signerAmount: 2,
                            expiry: new Date(1653138423537),
                        }
                    }
                };

                await new OrderController(fakePeers as Peers, fakeDb as Database).getOrders(mockRequest, mockResponse as Response);

                expect(fakeDb.getOrderBy).toHaveBeenCalledWith("eth", "dai", 200, 200, 2, 20);
                expect(mockResponse.json).toHaveBeenCalledWith(expected);
            });
        });

        describe("Add Order", () => {
            test("Add order nominal & broadcast", async () => {
                const order = forgeOrder();
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
                fakeDb.generateId.mockImplementation(() => "a");
                //@ts-ignore
                fakeDb.orderExists.mockImplementation(() => false);

                const expected = forgeOrder();
                expected.id = "a";

                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequest, mockResponse as Response);

                expect(fakeDb.generateId).toHaveBeenCalledWith(order);
                expect(fakeDb.orderExists).toHaveBeenCalledWith("a");
                expect(fakeDb.addOrder).toHaveBeenCalledWith(expected);
                expect(fakePeers.broadcast).toHaveBeenCalledWith("POST", "/orders", expected);
                expect(mockResponse.sendStatus).toHaveBeenCalledWith(204);
            });

            test("Add order missing data", async () => {
                const orderMissingFromToken = {
                    signerWallet: "signerWallet",
                    // signerToken: "signerToken",
                    senderToken: "senderToken",
                    senderAmount: 1,
                    signerAmount: 2,
                    expiry: 1653138423537,
                };

                const orderMissingFrom = {
                    // signerWallet: "signerWallet",
                    signerToken: "signerToken",
                    senderToken: "senderToken",
                    senderAmount: 1,
                    signerAmount: 2,
                    expiry: 1653138423537,
                };

                const orderMissingToToken = {
                    signerWallet: "signerWallet",
                    signerToken: "signerToken",
                    // senderToken: "senderToken",
                    senderAmount: 1,
                    signerAmount: 2,
                    expiry: 1653138423537,
                };

                const orderMissingAmountFromToken = {
                    signerWallet: "signerWallet",
                    signerToken: "signerToken",
                    senderToken: "senderToken",
                    // senderAmount: 1,
                    signerAmount: 2,
                    expiry: 1653138423537,
                };

                const orderMissingAmountToToken = {
                    signerWallet: "signerWallet",
                    signerToken: "signerToken",
                    senderToken: "senderToken",
                    senderAmount: 1,
                    // signerAmount: 2,
                    expiry: 1653138423537,
                };

                const orderMissingexpiry = {
                    signerWallet: "signerWallet",
                    signerToken: "signerToken",
                    senderToken: "senderToken",
                    senderAmount: 1,
                    signerAmount: 2,
                    // expiry: 1653138423537,
                };

                const mockRequestOrderMissingFromToken = {
                    body: orderMissingFromToken,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;

                const mockRequestOrderMissingFrom = {
                    body: orderMissingFrom,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;

                const mockRequestOrderMissingToToken = {
                    body: orderMissingToToken,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;

                const mockRequestOrderMissingAmountFromToken = {
                    body: orderMissingAmountFromToken,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;

                const mockRequestOrderMissingAmountToToken = {
                    body: orderMissingAmountToToken,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;
                const mockRequestOrderMissingexpiry = {
                    body: orderMissingexpiry,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;

                const mockResponse = {
                    json: jest.fn(),
                    sendStatus: jest.fn(),
                } as Partial<Response>;

                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequestOrderMissingFrom, mockResponse as Response);
                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequestOrderMissingFromToken, mockResponse as Response);
                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequestOrderMissingToToken, mockResponse as Response);
                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequestOrderMissingAmountFromToken, mockResponse as Response);
                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequestOrderMissingAmountToToken, mockResponse as Response);
                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequestOrderMissingexpiry, mockResponse as Response);

                expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
                expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
                expect(mockResponse.sendStatus).toHaveBeenCalledWith(400);
            });

            test("Add order invalid data", async () => {
                const orderBadValueAmountFromToken = {
                    signerWallet: "signerWallet",
                    signerToken: "signerToken",
                    senderToken: "senderToken",
                    senderAmount: "a",
                    signerAmount: 2,
                    expiry: 1653138423537,
                };
                const mockRequestOrderBadValueAmountFromToken = {
                    body: orderBadValueAmountFromToken,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;

                const orderBadValueAmountToToken = {
                    signerWallet: "signerWallet",
                    signerToken: "signerToken",
                    senderToken: "senderToken",
                    senderAmount: 1,
                    signerAmount: "b",
                    expiry: 1653138423537,
                };
                const mockRequestOrderBadValueAmountToToken = {
                    body: orderBadValueAmountToToken,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;

                const mockResponse = {
                    json: jest.fn(),
                    sendStatus: jest.fn(),
                } as Partial<Response>;

                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequestOrderBadValueAmountFromToken, mockResponse as Response);
                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequestOrderBadValueAmountToToken, mockResponse as Response);


                expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
                expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
                expect(mockResponse.sendStatus).toHaveBeenCalledWith(400);
            });

            test("Add order invalid date", async () => {
                const orderDateNotInRange = {
                    signerWallet: "signerWallet",
                    signerToken: "signerToken",
                    senderToken: "senderToken",
                    senderAmount: 1,
                    signerAmount: 2,
                    expiry: new Date().getTime() + (1000 * 3600 * 24 * 90),
                };
                const mockRequestOrderDateNotInRange = {
                    body: orderDateNotInRange,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;

                const mockResponse = {
                    json: jest.fn(),
                    sendStatus: jest.fn(),
                } as Partial<Response>;

                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequestOrderDateNotInRange, mockResponse as Response);


                expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
                expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
                expect(mockResponse.sendStatus).toHaveBeenCalledWith(400);
            });

            test("Add: already added", async () => {
                const order = forgeOrder();
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
                fakeDb.generateId.mockImplementation(() => "a");
                //@ts-ignore
                fakeDb.orderExists.mockImplementation(() => true);

                const expected = order;
                expected.id = "a";

                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequest, mockResponse as Response);

                expect(fakeDb.generateId).toHaveBeenCalledWith(expected);
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
                params: { orderId: "a" } as Record<string, any>,
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

function forgeOrder() {
    return new Order("signerWallet", "signerToken", "senderToken", 1, 2, new Date(1653138423537));
}