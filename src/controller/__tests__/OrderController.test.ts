import { Request, Response } from 'express';
import { Database } from '../../database/Database';
import { Order } from '../../model/Order';
import { TransactionStatus } from '../../model/TransactionStatus';
import { Peers } from '../../peer/Peers';
import { OrderController } from '../OrderController';
describe("Order controller", () => {

    let fakeDb: Partial<Database>;
    let fakePeers: Partial<Peers>;

    function forgeOrder() {
        return new Order("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS);
    }

    beforeEach(() => {
        fakeDb = {
            getorders: jest.fn(() => Promise.resolve(({ "aze": forgeOrder() })) as Promise<Record<string, Order>>),
            addOrder: jest.fn((a) => { console.log("TU", a) }),
            getOrder: jest.fn(),
            orderExists: jest.fn(),
            generateId: jest.fn(),
            editOrder: jest.fn()
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
                const order = new Order("by", "from", "to", 3, 4, TransactionStatus.DONE);
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
                const order = new Order("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS);
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

        test("get orders", async () => {
            const mockRequest = {
                body: undefined,
                params: {},
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
                        by: "by",
                        from: "from",
                        nb: 3,
                        price: 4,
                        status: "IN_PROGRESS",
                        to: "to",
                    },
                }
            };

            await new OrderController(fakePeers as Peers, fakeDb as Database).getorders(mockRequest, mockResponse as Response);

            expect(mockResponse.json).toHaveBeenCalledWith(expected);
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

            test("Add order without specified status & broadcast", async () => {
                const order = forgeOrder();
                order.status = undefined;

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
            const order = new Order("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS);
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
