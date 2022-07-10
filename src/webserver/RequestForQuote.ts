import { Express, Request, Response } from "express";
import { Peers } from './../peer/Peers.js';
import { IndexedOrderError } from '../model/error/IndexedOrderError.js';
import { NotFound } from '../model/error/NotFound.js';
import { JsonRpcResponse } from '../model/response/JsonRpcResponse.js';
import { RootController } from './../controller/RootController.js';
import { OrderService } from './../service/OrderService.js';

export class RequestForQuote {
    private server: Express;
    private orderService: OrderService;
    private rootController: RootController;
    private peers: Peers;

    constructor(server: Express, orderService: OrderService, rootController: RootController, peers: Peers) {
        this.server = server;
        this.rootController = rootController;
        this.orderService = orderService;
        this.orderService = orderService;
        this.peers = peers;
    }

    async run() {
        this.server.get('*', async (request: Request, response: Response) => {
            console.log("R<---", request.method, request.url, request.body);
            const result = await this.rootController.getService();
            response.json(result);
        });

        this.server.post('*', async (request: Request, response: Response) => {
            console.log("R<---", request.method, request.url, request.body);
            const { id, method, params = {} } = request.body;

            if (Object.keys(this.orderService.methods).indexOf(method) === -1) {
                response.json(new JsonRpcResponse(id, new NotFound("Method does not exist.")))
            }

            try {
                let result;
                switch (method) {
                    case this.orderService.methods.getOrders:
                        result = await this.orderService.getOrders(params, params?.orderHash);
                        break;
                    case this.orderService.methods.addOrder:
                        await this.orderService.addOrder(params);
                        this.peers.broadcast(request.method, request.url, request.body);
                        break;
                }
                response.json(new JsonRpcResponse(id, result));
            } catch (error) {
                response.json(new JsonRpcResponse(id, error as IndexedOrderError))
            }
        });
    }
}
