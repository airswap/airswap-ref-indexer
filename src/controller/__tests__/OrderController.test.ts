import { AlreadyExistsError } from './../../model/error/AlreadyExists';
import { Order } from '@airswap/typescript';
import { Request, Response } from 'express';
import { Database } from '../../database/Database';
import { forgeIndexedOrder, forgeOrderResponse } from '../../Fixtures';
import { Peers } from '../../peer/Peers';
import { OrderController } from '../OrderController';
import { Filters } from './../../database/filter/Filters';
import { ClientError } from './../../model/error/ClientError';
import { OrderService } from './../../service/OrderService';

jest
    .useFakeTimers()
    .setSystemTime(new Date(1653900784706));

describe("Order controller", () => {

    let fakeDb: Partial<Database>;
    let fakePeers: Partial<Peers>;
    let fakeOrderService: Partial<OrderService>;

    beforeEach(() => {
        fakeDb = {
            deleteOrder: jest.fn(() => Promise.resolve()),
            orderExists: jest.fn(() => Promise.resolve(true))
        };
        fakePeers = {
            getPeers: jest.fn(() => []),
            broadcast: jest.fn()
        };
        fakeOrderService = {
            getOrders: jest.fn(),
            addOrder: jest.fn()
        }
    });

    describe("Delete Order", () => {
        test("Missing hash", async () => {
            const mockRequest = {
                body: {},
                params: {},
                method: "DELETE",
                url: "/"
            } as Request;

            const mockResponse = {
                json: jest.fn(),
                sendStatus: jest.fn(),
            } as Partial<Response>;

            await new OrderController(fakePeers as Peers, fakeOrderService as OrderService, fakeDb as Database).deleteOrder(mockRequest, mockResponse as Response);

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

            await new OrderController(fakePeers as Peers, fakeOrderService as OrderService, fakeDb as Database).deleteOrder(mockRequest, mockResponse as Response);

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

            await new OrderController(fakePeers as Peers, fakeOrderService as OrderService, fakeDb as Database).deleteOrder(mockRequest, mockResponse as Response);

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
                method: "POST",
                url: "/"
            } as Request;

            const mockResponse = {
                json: jest.fn()
            } as Partial<Response>;

            const expected = [forgeOrderResponse()];
            fakeOrderService.getOrders = jest.fn().mockResolvedValue(expected);

            await new OrderController(fakePeers as Peers, fakeOrderService as OrderService).getOrders(mockRequest, mockResponse as Response);

            expect(fakeOrderService.getOrders).toHaveBeenCalledWith({}, undefined);
            expect(mockResponse.json).toHaveBeenCalledWith(expected);
        });

        test("get all with filers", async () => {
            const mockRequest = {
                body: {},
                params: {},
                query: { filters: true } as Record<string, any>,
                method: "POST",
                url: "/"
            } as Request;

            const mockResponse = {
                json: jest.fn()
            } as Partial<Response>;

            const expectedFilters = new Filters();
            expectedFilters.signerToken = { "ETH": { min: 10, max: 10 } };
            expectedFilters.senderToken = { "dai": { min: 5, max: 5 } };
            
            const expected = [forgeOrderResponse()];
            fakeOrderService.getOrders = jest.fn().mockResolvedValue(expected);

            await new OrderController(fakePeers as Peers, fakeOrderService as OrderService).getOrders(mockRequest, mockResponse as Response);

            expect(fakeOrderService.getOrders).toHaveBeenCalledWith({ "filters": true }, undefined);
            expect(mockResponse.json).toHaveBeenCalledWith(expected);
        });

        test("get by hash", async () => {
            const mockRequest = {
                body: {},
                params: { orderHash: "aze" },
                query: {},
                method: "POST",
                url: "/"
            } as unknown as Request;

            const mockResponse = {
                json: jest.fn()
            } as Partial<Response>;

            const expected = [forgeOrderResponse()];
            fakeOrderService.getOrders = jest.fn().mockResolvedValue(expected);

            await new OrderController(fakePeers as Peers, fakeOrderService as OrderService).getOrders(mockRequest, mockResponse as Response);

            expect(fakeOrderService.getOrders).toHaveBeenCalledWith({}, "aze");
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
                    signerTokens: ["eth"],
                    senderTokens: ["dai"]
                },
                method: "POST",
                url: "/"
            } as unknown as Request;

            const mockResponse = {
                json: jest.fn()
            } as Partial<Response>;

            const expected = [forgeOrderResponse()];
            fakeOrderService.getOrders = jest.fn().mockResolvedValue(expected);

            await new OrderController(fakePeers as Peers, fakeOrderService as OrderService).getOrders(mockRequest, mockResponse as Response);

            expect(fakeOrderService.getOrders).toHaveBeenCalledWith({
                maxSenderAmount: 20,
                maxSignerAmount: 200,
                minSenderAmount: 2,
                minSignerAmount: 200,
                senderTokens: ["dai"],
                signerTokens: ["eth"]
            }, undefined);
            expect(mockResponse.json).toHaveBeenCalledWith(expected);
        });
    });

    describe("Add Order", () => {
        test("Add order nominal & broadcast", async () => {
            const order = forgeOrder(1653900784696);
            const mockRequest = {
                body: order,
                params: {},
                method: "POST",
                url: "/"
            } as Request;

            const mockResponse = {
                json: jest.fn(),
                sendStatus: jest.fn(),
            } as Partial<Response>;

            await new OrderController(fakePeers as Peers, fakeOrderService as OrderService).addOrder(mockRequest, mockResponse as Response);

            expect(fakeOrderService.addOrder).toHaveBeenCalledWith(order);
            expect(fakePeers.broadcast).toHaveBeenCalledWith("POST", "/", order);
            expect(mockResponse.sendStatus).toHaveBeenCalledWith(201);
        });

        test("Add order missing data", async () => {
            const orderMissingExpiry = forgeOrder(1653900784696);
            // @ts-ignore
            orderMissingExpiry.expiry = undefined;

            const mockRequestOrderMissingexpiry = {
                body: orderMissingExpiry,
                params: {},
                method: "POST",
                url: "/"
            } as Request;

            const mockResponse = {
                status: jest.fn(),
                send: jest.fn(),
            } as Partial<Response>;

            fakeOrderService.addOrder = jest.fn().mockImplementationOnce(() => {
                throw new ClientError("Order incomplete");
            });
            await new OrderController(fakePeers as Peers, fakeOrderService as OrderService).addOrder(mockRequestOrderMissingexpiry, mockResponse as Response);

            expect(fakeOrderService.addOrder).toHaveBeenCalledWith(orderMissingExpiry);
            expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.send).toHaveBeenCalledWith("Order incomplete");
        });

        test("Add: already added", async () => {
            const order = forgeOrder(1653900784696);
            const mockRequest = {
                body: order,
                params: {},
                method: "POST",
                url: "/"
            } as Request;

            const mockResponse = {
                status: jest.fn(),
                send: jest.fn(),
            } as Partial<Response>;

            const expected = forgeIndexedOrder(1653900784706, 1653900784696);
            //@ts-ignore
            expected.hash = undefined;    
            
            fakeOrderService.addOrder = jest.fn().mockImplementationOnce(() => {
                throw new AlreadyExistsError();
            });

            await new OrderController(fakePeers as Peers, fakeOrderService as OrderService).addOrder(mockRequest, mockResponse as Response);

            expect(fakeOrderService.addOrder).toHaveBeenCalledWith(order);
            expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
            expect(mockResponse.status).toHaveBeenCalledWith(204);
            expect(mockResponse.send).toHaveBeenCalledWith("Already exists");   
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