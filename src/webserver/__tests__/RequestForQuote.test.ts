import { Order } from '@airswap/typescript';
import bodyParser from "body-parser";
import express from 'express';
import http from "http";
import supertest from "supertest";
import { forgeJsonRpcResponse, forgeOrderResponse } from '../../Fixtures';
import { Peers } from '../../peer/Peers';
import { OrderService } from './../../service/OrderService';
import { RootService } from './../../service/RootService';
import { RequestForQuote } from './../RequestForQuote';

jest
    .useFakeTimers()
    .setSystemTime(new Date(1653900784706));

describe("Order controller", () => {

    let fakePeers: Partial<Peers>;
    let fakeOrderService: Partial<OrderService>;
    let fakeRootService: Partial<RootService>;
    let webserver: express.Express;
    let server: http.Server;

    beforeEach(() => {
        webserver = express();
        webserver.use(bodyParser.json());
        server = webserver.listen(9875, () => { console.log("listening") });

        fakeRootService = {
            get: jest.fn()
        }
        fakePeers = {
            getPeers: jest.fn(() => []),
            broadcast: jest.fn()
        };
        fakeOrderService = {
            getOrders: jest.fn(),
            addOrder: jest.fn()
        }
        fakeOrderService.methods = { "getOrders": "getOrders" }
    });

    afterEach(() => {
        jest.clearAllMocks();
        server.close();
    });

    describe("GET *", () => {
        test("should give basic info", done => {
            const expected = {
                peers: [],
                registry: "registry",
                database: 100,
            };
            // @ts-ignore
            fakeRootService.get.mockImplementation(() => Promise.resolve(expected));

            new RequestForQuote(webserver, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).run();
            supertest(webserver)
                .get("/")
                .then(response => {
                    expect(response.body).toEqual(expected);
                    expect(response.statusCode).toBe(200);
                    done();
                });
        });
    });

    describe("POST *", () => {
        test("should return 404 on unknow method", done => {
            const expected = {
                id: "-1",
                jsonrpc: "2.0",
                result: {
                    code: 404,
                    message: "Method does not exist."
                }
            };
            new RequestForQuote(webserver, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).run();
            supertest(webserver)
                .post("/")
                .type("json")
                .send({ id: "-1", method: "unknonwn" })
                .then(response => {
                    expect(response.body).toEqual(expected);
                    expect(response.statusCode).toBe(404);
                    done();
                });
        });

        test("should return 400 if params is not an array", done => {
            const expected = {
                id: "-1",
                jsonrpc: "2.0",
                result: {
                    code: 400,
                    message: "Empty params"
                }
            };
            new RequestForQuote(webserver, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).run();
            supertest(webserver)
                .post("/")
                .type("json")
                .send({ id: "-1", method: "getOrders", params: {} })
                .then(response => {
                    expect(response.body).toEqual(expected);
                    expect(response.statusCode).toBe(400);
                    done();
                });
        });
    });

    describe('Get orders', () => {
        test("nominal", (done) => {
            const expected = forgeJsonRpcResponse("-1", forgeOrderResponse());
            fakeOrderService.getOrders = jest.fn().mockResolvedValue(forgeOrderResponse());

            new RequestForQuote(webserver, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).run();
            supertest(webserver)
                .post("/")
                .type("json")
                .send({ id: "-1", method: "getOrders", params: [{ filters: true }] })
                .then(response => {
                    expect(response.body).toEqual(expected);
                    expect(response.statusCode).toBe(200);
                    expect(fakeOrderService.getOrders).toHaveBeenCalledWith({ "filters": true });
                    done();
                });
        });
    });


    //     describe("Add Order", () => {
    //         test("Add order nominal & broadcast", async () => {
    //             const order = forgeOrder(1653900784696);
    //             const mockRequest = {
    //                 body: order,
    //                 params: {},
    //                 method: "POST",
    //                 url: "/"
    //             } as Request;

    //             const mockResponse = {
    //                 json: jest.fn(),
    //                 sendStatus: jest.fn(),
    //             } as Partial<Response>;

    //             await new RequestForQuote(express, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).addOrder(mockRequest, mockResponse as Response);

    //             expect(fakeOrderService.addOrder).toHaveBeenCalledWith(order);
    //             expect(fakePeers.broadcast).toHaveBeenCalledWith("POST", "/", order);
    //             expect(mockResponse.sendStatus).toHaveBeenCalledWith(201);
    //         });

    //         test("Add order missing data", async () => {
    //             const orderMissingExpiry = forgeOrder(1653900784696);
    //             // @ts-ignore
    //             orderMissingExpiry.expiry = undefined;

    //             const mockRequestOrderMissingexpiry = {
    //                 body: orderMissingExpiry,
    //                 params: {},
    //                 method: "POST",
    //                 url: "/"
    //             } as Request;

    //             const mockResponse = {
    //                 status: jest.fn(),
    //                 send: jest.fn(),
    //             } as Partial<Response>;

    //             fakeOrderService.addOrder = jest.fn().mockImplementationOnce(() => {
    //                 throw new ClientError("Order incomplete");
    //             });
    //             await new RequestForQuote(express, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).addOrder(mockRequestOrderMissingexpiry, mockResponse as Response);

    //             expect(fakeOrderService.addOrder).toHaveBeenCalledWith(orderMissingExpiry);
    //             expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
    //             expect(mockResponse.status).toHaveBeenCalledWith(400);
    //             expect(mockResponse.send).toHaveBeenCalledWith("Order incomplete");
    //         });

    //         test("Add: already added", async () => {
    //             const order = forgeOrder(1653900784696);
    //             const mockRequest = {
    //                 body: order,
    //                 params: {},
    //                 method: "POST",
    //                 url: "/"
    //             } as Request;

    //             const mockResponse = {
    //                 status: jest.fn(),
    //                 send: jest.fn(),
    //             } as Partial<Response>;

    //             const expected = forgeIndexedOrder(1653900784706, 1653900784696);
    //             //@ts-ignore
    //             expected.hash = undefined;

    //             fakeOrderService.addOrder = jest.fn().mockImplementationOnce(() => {
    //                 throw new AlreadyExistsError();
    //             });

    //             await new RequestForQuote(express, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).addOrder(mockRequest, mockResponse as Response);

    //             expect(fakeOrderService.addOrder).toHaveBeenCalledWith(order);
    //             expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
    //             expect(mockResponse.status).toHaveBeenCalledWith(204);
    //             expect(mockResponse.send).toHaveBeenCalledWith("Already exists");
    //         });
    //     });
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