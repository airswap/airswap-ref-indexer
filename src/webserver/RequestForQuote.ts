import { ErrorResponse } from './../model/ErrorResponse.js';
import { JsonRpcResponse } from './../model/JsonRpcResponse.js';
import { Express, Request, Response } from "express";
import { OrderController } from './../controller/OrderController';
import { RootController } from './../controller/RootController';

export class RequestForQuote {
    private server: Express;
    private orderController: OrderController;
    private rootController: RootController;

    private methods = ["getOrders", "addOrder"]

    constructor(server: Express, orderController: OrderController, rootController: RootController) {
        this.server = server;
        this.orderController = orderController;
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
                    const result = await this.orderController.getOrderService(params, params.orderHash);
                    response.json(new JsonRpcResponse(id, result));
                    break;
                case "addOrder":
                    try {
                        await this.orderController.addOrderService(request.body);
                        response.json(new JsonRpcResponse(id, undefined));
                    } catch (error) {
                        response.json(new JsonRpcResponse(id, new ErrorResponse(-(+(error as Error).message), "")))
                    }
                    break;
            }
        });
    }

}
