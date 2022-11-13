import { HealthCheckResponse } from '@airswap/libraries/build/src/Indexer';
import { Order } from '@airswap/typescript';
import bodyParser from "body-parser";
import express from 'express';
import http from "http";
import supertest from "supertest";
import { forgeJsonRpcResponse, forgeOrderResponse } from '../../Fixtures';
import { Peers } from '../../peer/Peers';
import { ClientError } from './../../model/error/ClientError';
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
    });

    afterEach(() => {
        jest.clearAllMocks();
        server.close();
    });

    describe("GET *", () => {
        test("should give basic info", done => {
            const result: HealthCheckResponse = { registry: "registry", peers: [], databaseOrders: 100 };
            const expected = {
                "jsonrpc": "2.0",
                "id": "-1",
                result
            };
            // @ts-ignore
            fakeRootService.get.mockImplementation(() => Promise.resolve(result));

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


    describe("Add Order", () => {
        test("Add order nominal & broadcast", done => {
            const order = forgeOrder(1653900784696);
            const payload = { id: "-1", method: "addOrder", params: [order] };
            new RequestForQuote(webserver, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).run();
            supertest(webserver)
                .post("/")
                .type("json")
                .send(payload)
                .then(response => {
                    expect(response.body).toEqual({ id: "-1", "jsonrpc": "2.0", "result": { "message": "Added" } });
                    expect(response.statusCode).toBe(201);
                    expect(fakeOrderService.addOrder).toHaveBeenCalledWith(order);
                    expect(fakePeers.broadcast).toHaveBeenCalledWith("POST", "/", payload);
                    done();
                });
        });

        test("Add order error, no broadcast", done => {
            const order = forgeOrder(1653900784696);
            const payload = { id: "-1", method: "addOrder", params: [order] };

            fakeOrderService.addOrder = jest.fn().mockImplementation(() => {
                throw new ClientError("an error");
            })
            new RequestForQuote(webserver, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).run();

            supertest(webserver)
                .post("/")
                .type("json")
                .send(payload)
                .then(response => {
                    expect(response.body).toEqual({ id: "-1", "jsonrpc": "2.0", "result": { "code": 400, "message": "an error" } });
                    expect(response.statusCode).toBe(400);
                    expect(fakeOrderService.addOrder).toHaveBeenCalledWith(order);
                    expect(fakePeers.broadcast).not.toHaveBeenCalled();
                    done();
                });
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