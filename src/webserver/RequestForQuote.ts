import { Express, Request, Response } from "express";
import { ErrorResponse } from '../model/response/ErrorResponse.js';
import { JsonRpcResponse } from '../model/response/JsonRpcResponse.js';
import { OrderService } from './../service/OrderService.js';
import { RootController } from './../controller/RootController.js';

export class RequestForQuote {
    private server: Express;
    private orderService: OrderService;
    private rootController: RootController;

    private methods = ["getOrders", "addOrder"]

    constructor(server: Express, OrderService: OrderService, rootController: RootController) {
        this.server = server;
        this.orderService = OrderService;
        this.rootController = rootController;
    }

    async run() {
        this.server.get('*', async (request: Request, response: Response) => {
            console.log("R<---", request.method, request.url, request.body);
            const result = await this.rootController.getService();
            response.json(result);
        });

        this.server.post('*', async (request: Request, response: Response) => {
            console.log("R<---", request.method, request.url, request.body);
            const { id, method, params } = request.body;

            if (this.methods.indexOf(method) === -1) {
                response.json(new JsonRpcResponse(id, new ErrorResponse(-404, "Method not found.")));
            }

            switch (method) {
                case "getOrders":
                    const result = await this.orderService.getOrders(params, params.orderHash);
                    response.json(new JsonRpcResponse(id, result));
                    break;
                case "addOrder":
                    try {
                        await this.orderService.addOrder(params);
                        response.json(new JsonRpcResponse(id, undefined));
                    } catch (error) {
                        response.json(new JsonRpcResponse(id, new ErrorResponse(-(+(error as Error).message), "")))
                    }
                    break;
            }
        });
    }

}
