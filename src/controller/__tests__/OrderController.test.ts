import { Request, Response } from 'express';
import { Database } from '../../database/Database';
import { Order } from '../../model/Order';
import { Peers } from '../../peer/Peers';
import { OrderController } from '../OrderController';
import { TransactionStatus } from './../../model/TransactionStatus';

describe("Order controller", () => {

    let fakeDb: Partial<Database>;
    let fakePeers: Partial<Peers>;

    beforeEach(() => {
        fakeDb = {
            getOrders: jest.fn(() => Promise.resolve(({ "aze": forgeOrder(TransactionStatus.IN_PROGRESS) })) as Promise<Record<string, Order>>),
            getOrder: jest.fn(() => Promise.resolve(forgeOrder(TransactionStatus.IN_PROGRESS)) as Promise<Order>),
            getOrderBy: jest.fn(() => Promise.resolve(({ "aze": forgeOrder(TransactionStatus.IN_PROGRESS) })) as Promise<Record<string, Order>>),
            addOrder: jest.fn(() => Promise.resolve()),
            orderExists: jest.fn(() => Promise.resolve(true)),
            generateId: jest.fn(),
            editOrder: jest.fn(() => Promise.resolve()),
        };
        fakePeers = {
            getPeers: jest.fn(() => []),
            broadcast: jest.fn()
        };
    })

    describe("When debug mode enabled", () => {
        describe("Edit Order", () => {
            test("Missing id", async () => {
                const mockRequest = {
                    body: { status: TransactionStatus.DONE },
                    params: {},
                    method: "PUT",
                    url: "/orders"
                } as Request;

                const mockResponse = {
                    json: jest.fn(),
                    sendStatus: jest.fn(),
                } as Partial<Response>;

                await new OrderController(fakePeers as Peers, fakeDb as Database, true).editOrder(mockRequest, mockResponse as Response);

                expect(mockResponse.sendStatus).toHaveBeenCalledWith(400);
                expect(fakeDb.editOrder).toHaveBeenCalledTimes(0);
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
            });


            test("Missing status", async () => {
                const mockRequest = {
                    body: {},
                    params: { orderId: "a" } as Record<string, any>,
                    method: "PUT",
                    url: "/orders/a"
                } as Request;

                const mockResponse = {
                    json: jest.fn(),
                    sendStatus: jest.fn(),
                } as Partial<Response>;

                await new OrderController(fakePeers as Peers, fakeDb as Database, true).editOrder(mockRequest, mockResponse as Response);

                expect(mockResponse.sendStatus).toHaveBeenCalledWith(400);
                expect(fakeDb.editOrder).toHaveBeenCalledTimes(0);
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
            });

            test("Given status does not exists", async () => {
                const mockRequest = {
                    body: { status: "bla" },
                    params: { orderId: "a" } as Record<string, any>,
                    method: "PUT",
                    url: "/orders/a"
                } as Request;

                const mockResponse = {
                    json: jest.fn(),
                    sendStatus: jest.fn(),
                } as Partial<Response>;

                //@ts-ignore
                fakeDb.orderExists.mockImplementation(() => false);

                await new OrderController(fakePeers as Peers, fakeDb as Database, true).editOrder(mockRequest, mockResponse as Response);

                expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
                expect(fakeDb.editOrder).toHaveBeenCalledTimes(0);
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
            });

            test("Order does not exists", async () => {
                const mockRequest = {
                    body: { status: TransactionStatus.DONE },
                    params: { orderId: "a" } as Record<string, any>,
                    method: "PUT",
                    url: "/orders/a"
                } as Request;

                const mockResponse = {
                    json: jest.fn(),
                    sendStatus: jest.fn(),
                } as Partial<Response>;

                //@ts-ignore
                fakeDb.orderExists.mockImplementation(() => false);

                await new OrderController(fakePeers as Peers, fakeDb as Database, true).editOrder(mockRequest, mockResponse as Response);

                expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
                expect(fakeDb.editOrder).toHaveBeenCalledTimes(0);
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
            });

            test("Order already up to date", async () => {
                const order = forgeOrder(TransactionStatus.DONE);
                const mockRequest = {
                    body: { status: TransactionStatus.DONE },
                    params: { orderId: "a" } as Record<string, any>,
                    method: "PUT",
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

                await new OrderController(fakePeers as Peers, fakeDb as Database, true).editOrder(mockRequest, mockResponse as Response);

                expect(mockResponse.sendStatus).toHaveBeenCalledWith(204);
                expect(fakeDb.orderExists).toHaveBeenCalledWith("a");
                expect(fakeDb.getOrder).toHaveBeenCalledWith("a");
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
            });

            test("Edit order", async () => {
                const order = forgeOrder(TransactionStatus.IN_PROGRESS);
                const mockRequest = {
                    body: { status: TransactionStatus.DONE },
                    params: { orderId: "a" } as Record<string, any>,
                    method: "PUT",
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

                await new OrderController(fakePeers as Peers, fakeDb as Database, true).editOrder(mockRequest, mockResponse as Response);

                expect(mockResponse.sendStatus).toHaveBeenCalledWith(204);
                expect(fakeDb.orderExists).toHaveBeenCalledWith("a");
                expect(fakeDb.getOrder).toHaveBeenCalledWith("a");
                expect(fakeDb.editOrder).toHaveBeenCalledWith("a", TransactionStatus.DONE);
                expect(fakePeers.broadcast).toHaveBeenCalledWith("PUT", "/orders/a", { "status": "DONE" });
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
                            from: "from",
                            fromToken: "fromToken",
                            toToken: "toToken",
                            amountFromToken: 1,
                            amountToToken: 2,
                            expirationDate: new Date(1653138423537),
                            status: "IN_PROGRESS",
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
                        from: "from",
                        fromToken: "fromToken",
                        toToken: "toToken",
                        amountFromToken: 1,
                        amountToToken: 2,
                        expirationDate: new Date(1653138423537),
                        status: "IN_PROGRESS",
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
                        minAmountToToken: 200,
                        maxAmountToToken: 200,
                        minAmountFromToken: 2,
                        maxAmountFromToken: 20,
                        fromToken: "eth",
                        toToken: "dai"
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
                            from: "from",
                            fromToken: "fromToken",
                            toToken: "toToken",
                            amountFromToken: 1,
                            amountToToken: 2,
                            expirationDate: new Date(1653138423537),
                            status: "IN_PROGRESS",
                        }
                    }
                };

                await new OrderController(fakePeers as Peers, fakeDb as Database).getOrders(mockRequest, mockResponse as Response);

                expect(fakeDb.getOrderBy).toHaveBeenCalledWith("eth", "dai", 2, 20, 200, 200);
                expect(mockResponse.json).toHaveBeenCalledWith(expected);
            });
        });

        describe("Add Order", () => {
            test("Add order nominal & broadcast", async () => {
                const order = forgeOrder(TransactionStatus.DONE);
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

                const expected = forgeOrder(TransactionStatus.IN_PROGRESS);
                expected.id = "a";

                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequest, mockResponse as Response);

                expect(fakeDb.generateId).toHaveBeenCalledWith(order);
                expect(fakeDb.orderExists).toHaveBeenCalledWith("a");
                expect(fakeDb.addOrder).toHaveBeenCalledWith(expected);
                expect(fakePeers.broadcast).toHaveBeenCalledWith("POST", "/orders", expected);
                expect(mockResponse.sendStatus).toHaveBeenCalledWith(204);
            });

            test("Add order without specified status & broadcast", async () => {
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

                const expected = forgeOrder(TransactionStatus.IN_PROGRESS);
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
                    from: "from",
                    // fromToken: "fromToken",
                    toToken: "toToken",
                    amountFromToken: 1,
                    amountToToken: 2,
                    expirationDate: 1653138423537,
                };

                const orderMissingFrom = {
                    // from: "from",
                    fromToken: "fromToken",
                    toToken: "toToken",
                    amountFromToken: 1,
                    amountToToken: 2,
                    expirationDate: 1653138423537,
                };

                const orderMissingToToken = {
                    from: "from",
                    fromToken: "fromToken",
                    // toToken: "toToken",
                    amountFromToken: 1,
                    amountToToken: 2,
                    expirationDate: 1653138423537,
                };

                const orderMissingAmountFromToken = {
                    from: "from",
                    fromToken: "fromToken",
                    toToken: "toToken",
                    // amountFromToken: 1,
                    amountToToken: 2,
                    expirationDate: 1653138423537,
                };

                const orderMissingAmountToToken = {
                    from: "from",
                    fromToken: "fromToken",
                    toToken: "toToken",
                    amountFromToken: 1,
                    // amountToToken: 2,
                    expirationDate: 1653138423537,
                };

                const orderMissingExpirationDate = {
                    from: "from",
                    fromToken: "fromToken",
                    toToken: "toToken",
                    amountFromToken: 1,
                    amountToToken: 2,
                    // expirationDate: 1653138423537,
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
                const mockRequestOrderMissingExpirationDate = {
                    body: orderMissingExpirationDate,
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
                await new OrderController(fakePeers as Peers, fakeDb as Database).addOrder(mockRequestOrderMissingExpirationDate, mockResponse as Response);

                expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
                expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
                expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
                expect(mockResponse.sendStatus).toHaveBeenCalledWith(400);
            });

            test("Add order invalid data", async () => {
                const orderBadValueAmountFromToken = {
                    from: "from",
                    fromToken: "fromToken",
                    toToken: "toToken",
                    amountFromToken: "a",
                    amountToToken: 2,
                    expirationDate: 1653138423537,
                };
                const mockRequestOrderBadValueAmountFromToken = {
                    body: orderBadValueAmountFromToken,
                    params: {},
                    method: "POST",
                    url: "/orders"
                } as Request;                
                
                const orderBadValueAmountToToken = {
                    from: "from",
                    fromToken: "fromToken",
                    toToken: "toToken",
                    amountFromToken: 1,
                    amountToToken: "b",
                    expirationDate: 1653138423537,
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
                    from: "from",
                    fromToken: "fromToken",
                    toToken: "toToken",
                    amountFromToken: 1,
                    amountToToken: 2,
                    expirationDate: new Date().getTime()+(1000*3600*24*90),
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

        test("Edit order", async () => {
            const mockRequest = {
                body: { status: TransactionStatus.DONE },
                params: { orderId: "a" } as Record<string, any>,
                method: "PUT",
                url: "/orders/a"
            } as Request;

            const mockResponse = {
                sendStatus: jest.fn(),
            } as Partial<Response>;

            await new OrderController(fakePeers as Peers, fakeDb as Database).editOrder(mockRequest, mockResponse as Response);

            expect(mockResponse.sendStatus).toHaveBeenCalledWith(404);
            expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
            expect(fakeDb.getOrder).toHaveBeenCalledTimes(0);
            expect(fakeDb.editOrder).toHaveBeenCalledTimes(0);
            expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
        });
    });
});

function forgeOrder(transactionStatus?: TransactionStatus) {
    return new Order("from", "fromToken", "toToken", 1, 2, new Date(1653138423537), transactionStatus);
}