import { Request, Response } from "express";
import { OrderService } from './../service/OrderService';
import { Database } from "../database/Database.js";
import { Peers } from "../peer/Peers.js";
import { IndexedOrderError } from "../model/error/IndexedOrderError.js";
import { ClientError } from "../model/error/ClientError.js";

export class OrderController {

    private peers: Peers;
    private database?: Database; // will be deleted along with delete method when server is finished: https://github.com/airswap/airswap-indexer-node/issues/12 + https://github.com/airswap/airswap-indexer-node/issues/8
    private orderService: OrderService;

    constructor(peers: Peers, orderService: OrderService, database?: Database) {
        this.peers = peers;
        this.database = database;
        this.orderService = orderService;
    }

    addOrder = async (request: Request, response: Response) => {
        console.log("R<---", request.method, request.url, request.body);
        try {
            await this.orderService.addOrder(request.body);
            this.peers.broadcast(request.method, request.url, request.body);
            response.sendStatus(201);
        } catch (error) {
            response.status((error as IndexedOrderError).code);
            response.send((error as IndexedOrderError).message);
        }
    }

    getOrders = async (request: Request, response: Response) => {
        console.log("R<---", request.method, request.url, request.body);
        const result = await this.orderService.getOrders(request.query, request.params.orderHash);
        response.json(result);
    }

    // This method is only for debugging, see router
    deleteOrder = async (request: Request, response: Response) => {
        console.log("R<---", request.method, request.url, request.body);
        if (!request.params.orderHash) {
            response.sendStatus(400);
            return;
        }

        if (!this.database!.orderExists(request.params.orderHash)) {
            response.sendStatus(404);
            return;
        }

        this.database!.deleteOrder(request.params.orderHash);
        this.peers.broadcast(request.method, request.url, request.body);
        response.sendStatus(204);
    }    
}
