import { Order } from '@airswap/typescript';
import { Request, Response } from 'express';
import { Database } from '../../database/Database';
import { OtcOrder } from '../../model/OtcOrder';
import { Peers } from '../../peer/Peers';
import { OrderController } from '../OrderController';

describe("Order controller", () => {

    let fakeDb: Partial<Database>;
    let fakePeers: Partial<Peers>;

    beforeEach(() => {
        fakeDb = {
            getOrders: jest.fn(() => Promise.resolve(({ "aze": forgeOtcOrder(1653900784696, 1653900784706) })) as Promise<Record<string, OtcOrder>>),
            getOrder: jest.fn(() => Promise.resolve({ "aze": forgeOtcOrder(1653900784696, 1653900784706) })),
            getOrderBy: jest.fn(() => Promise.resolve(({ "aze": forgeOtcOrder(1653900784696, 1653900784706) })) as Promise<Record<string, OtcOrder>>),
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
                const order = forgeOtcOrder();
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
                            addedOn: 1653900784696,
                            id: "id",
                            order: {
                                expiry: "1653900784706",
                                nonce: "nonce",
                                r: "r",
                                s: "s",
                                senderAmount: "10",
                                senderToken: "ETH",
                                signerAmount: "5",
                                signerToken: "dai",
                                signerWallet: "signerWallet",
                                v: "v",
                            },
                        },
                    },
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
                    orders: {
                        aze: {
                            addedOn: 1653900784696,
                            id: "id",
                            order: {
                                expiry: "1653900784706",
                                nonce: "nonce",
                                r: "r",
                                s: "s",
                                senderAmount: "10",
                                senderToken: "ETH",
                                signerAmount: "5",
                                signerToken: "dai",
                                signerWallet: "signerWallet",
                                v: "v",
                            },
                        },
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
                            addedOn: 1653900784696,
                            id: "id",
                            order: {
                                expiry: "1653900784706",
                                nonce: "nonce",
                                r: "r",
                                s: "s",
                                senderAmount: "10",
                                senderToken: "ETH",
                                signerAmount: "5",
                                signerToken: "dai",
                                signerWallet: "signerWallet",
                                v: "v",
                            },
                        },
                    }
                };

                await new OrderController(fakePeers as Peers, fakeDb as Database).getOrders(mockRequest, mockResponse as Response);

                expect(fakeDb.getOrderBy).toHaveBeenCalledWith("eth", "dai", 200, 200, 2, 20);
                expect(mockResponse.json).toHaveBeenCalledWith(expected);
            });
        });

        describe("Add Order", () => {
            test("Add order nominal & broadcast", async () => {
                const expectedForgeId = forgeOtcOrder(1653900784696, 1653900784706);
                expectedForgeId.id = undefined;
                const expected = forgeOtcOrder(1653900784696, 1653900784706);
                expected.id = "a";
                const order = forgeOtcOrder(1653900784696, 1653900784706);                
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

                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequest, mockResponse as Response);

                expect(fakeDb.generateId).toHaveBeenCalledWith(expectedForgeId);
                expect(fakeDb.orderExists).toHaveBeenCalledWith("a");
                expect(fakeDb.addOrder).toHaveBeenCalledWith(expected);
                expect(fakePeers.broadcast).toHaveBeenCalledWith("POST", "/orders", order);
                expect(mockResponse.sendStatus).toHaveBeenCalledWith(204);
            });

            test("Add order missing data", async () => {
                const orderMissingexpiry = forgeOtcOrder();
                orderMissingexpiry.order.expiry = undefined;

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

                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequestOrderMissingexpiry, mockResponse as Response);

                expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
                expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
                expect(mockResponse.sendStatus).toHaveBeenCalledWith(400);
            });

            test("Add order invalid data", async () => {
                const orderBadValueSenderAmount = forgeOtcOrder();
                orderBadValueSenderAmount.order.senderAmount = "a";

                const mockRequestOrderBadValueSenderAmount = {
                    body: orderBadValueSenderAmount,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;

                const orderBadValueSignerAmount = forgeOtcOrder();
                orderBadValueSignerAmount.order.signerAmount = "a";

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
                const orderDateNotInRange = forgeOtcOrder();
                orderDateNotInRange.order.expiry = `${new Date().getTime()}${1000 * 3600 * 24 * 100}`;

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
                const order = forgeOtcOrder(1653900784696, 1653900784706);
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
                expected.id = undefined;

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

function forgeOtcOrder(expectedAddedDate = new Date().getTime(), expiryDate = new Date().getTime() + 10) {
    return new OtcOrder(forgeOrder(`${expiryDate}`), expectedAddedDate, "id");
}

function forgeOrder(expiryDate: string): Order {
    return {
        nonce: "nonce",
        expiry: expiryDate,
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