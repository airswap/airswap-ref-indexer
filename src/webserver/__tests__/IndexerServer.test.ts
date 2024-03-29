import bodyParser from "body-parser";
import express from 'express';
import http from "http";
import supertest from "supertest";
import { forgeFullOrder, forgeFullOrderERC20, forgeJsonRpcResponse, forgeOrderERC20Response, forgeOrderResponse } from '../../Fixtures';
import { Peers } from '../../peer/Peers';
import { ClientError } from './../../model/error/ClientError';
import { OrderService } from './../../service/OrderService';
import { RootService } from './../../service/RootService';
import { IndexerServer } from './../IndexerServer';
import { HealthCheckResponse } from "../../model/response/HealthCheckResponse";

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
            getOrdersERC20: jest.fn(),
            getOrders: jest.fn(),
            addOrderERC20: jest.fn(),
            addOrder: jest.fn()
        }
    });

    afterEach(() => {
        jest.clearAllMocks();
        server.close();
    });

    describe("GET *", () => {
        test("should give basic info", done => {
            const result: HealthCheckResponse = { registry: "registry", peers: [], databaseOrders: 100, databaseOrdersERC20: 100, networks: ["5"] };
            const expected = {
                "jsonrpc": "2.0",
                "id": "-1",
                result
            };
            // @ts-ignore
            fakeRootService.get.mockImplementation(() => Promise.resolve(result));

            new IndexerServer(webserver, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).run();
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
            new IndexerServer(webserver, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).run();
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
            new IndexerServer(webserver, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).run();
            supertest(webserver)
                .post("/")
                .type("json")
                .send({ id: "-1", method: "getOrdersERC20", params: {} })
                .then(response => {
                    expect(response.body).toEqual(expected);
                    expect(response.statusCode).toBe(400);
                    done();
                });
        });
    });

    describe('Get orders', () => {
        test("erc20", (done) => {
            const expected = forgeJsonRpcResponse("-1", forgeOrderERC20Response());
            fakeOrderService.getOrdersERC20 = jest.fn().mockResolvedValue(forgeOrderERC20Response());

            new IndexerServer(webserver, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).run();

            supertest(webserver)
                .post("/")
                .type("json")
                .send({ id: "-1", method: "getOrdersERC20", params: [{ filters: true }] })
                .then(response => {
                    expect(response.body).toEqual(expected);
                    expect(response.statusCode).toBe(200);
                    expect(fakeOrderService.getOrdersERC20).toHaveBeenCalledWith({ "filters": true });
                    done();
                });
        });

        test("ERC 721", (done) => {
            const expected = forgeJsonRpcResponse("-1", forgeOrderResponse());
            fakeOrderService.getOrders = jest.fn().mockResolvedValue(forgeOrderResponse());

            new IndexerServer(webserver, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).run();

            supertest(webserver)
                .post("/")
                .type("json")
                .send({ id: "-1", method: "getOrders", params: [{}] })
                .then(response => {
                    expect(response.body).toEqual(expected);
                    expect(response.statusCode).toBe(200);
                    expect(fakeOrderService.getOrders).toHaveBeenCalled();
                    done();
                });
        });
    });


    describe("Add Order", () => {
        describe('erc20', () => {
            test("Add order nominal & broadcast", done => {
                const order = forgeFullOrderERC20(1653900784696);
                const payload = { id: "-1", method: "addOrderERC20", params: [order] };
                new IndexerServer(webserver, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).run();
                supertest(webserver)
                    .post("/")
                    .type("json")
                    .send(payload)
                    .then(response => {
                        expect(response.body).toEqual({ id: "-1", "jsonrpc": "2.0", "result": { "message": "Added" } });
                        expect(response.statusCode).toBe(201);
                        expect(fakeOrderService.addOrderERC20).toHaveBeenCalledWith(order);
                        expect(fakePeers.broadcast).toHaveBeenCalledWith("POST", "/", payload);
                        done();
                    });
            });

            test("Add order error, no broadcast", done => {
                const order = forgeFullOrderERC20(1653900784696);
                const payload = { id: "-1", method: "addOrderERC20", params: [order] };

                fakeOrderService.addOrderERC20 = jest.fn().mockImplementation(() => {
                    throw new ClientError("an error");
                })
                new IndexerServer(webserver, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).run();

                supertest(webserver)
                    .post("/")
                    .type("json")
                    .send(payload)
                    .then(response => {
                        expect(response.body).toEqual(
                            {
                                id: "-1", "jsonrpc": "2.0",
                                "result": {
                                    "code": 400,
                                    "message": "an error"
                                }
                            });
                        expect(response.statusCode).toBe(400);
                        expect(fakeOrderService.addOrderERC20).toHaveBeenCalledWith(order);
                        expect(fakePeers.broadcast).not.toHaveBeenCalled();
                        done();
                    });
            });

            test("getTokens", done => {
                const payload = { id: "-1", method: "getTokens", params: [{}] };
                const filterResponse: any = {
                    senderToken: {
                        "0x0000000000000000000000000000000000000000" : {
                            min: "10",
                            max: "10",
                        }
                    },
                    signerToken: {
                        "0x0000000000000000000000000000000000000001" : {
                            min: "10",
                            max: "10",
                        }
                    }
                }
                fakeOrderService.getTokens = jest.fn().mockImplementation(() => {
                    return filterResponse
                })

                new IndexerServer(webserver, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).run();

                supertest(webserver)
                    .post("/")
                    .type("json")
                    .send(payload)
                    .then(response => {
                        expect(response.body).toEqual(
                            {
                                jsonrpc: "2.0",
                                id: "-1",
                                result: {
                                    ...filterResponse
                                }
                            });
                        expect(response.statusCode).toBe(200);
                        expect(fakeOrderService.getTokens).toHaveBeenCalled();
                        expect(fakePeers.broadcast).not.toHaveBeenCalled();
                        done();
                    });
            });
        });

        describe('Order', () => {
            test("Add order nominal & broadcast", done => {
                const order = forgeFullOrder(1653900784696);
                const payload = { id: "-1", method: "addOrder", params: [order] };
                new IndexerServer(webserver, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).run();
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
                const order = forgeFullOrder(1653900784696);
                const payload = { id: "-1", method: "addOrder", params: [order] };

                fakeOrderService.addOrder = jest.fn().mockImplementation(() => {
                    throw new ClientError("an error");
                })
                new IndexerServer(webserver, fakeOrderService as OrderService, fakeRootService as RootService, fakePeers as Peers).run();

                supertest(webserver)
                    .post("/")
                    .type("json")
                    .send(payload)
                    .then(response => {
                        expect(response.body).toEqual(
                            {
                                id: "-1", "jsonrpc": "2.0",
                                "result": {
                                    "code": 400,
                                    "message": "an error"
                                }
                            });
                        expect(response.statusCode).toBe(400);
                        expect(fakeOrderService.addOrder).toHaveBeenCalledWith(order);
                        expect(fakePeers.broadcast).not.toHaveBeenCalled();
                        done();
                    });
            });
        });
    })
});