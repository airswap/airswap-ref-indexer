import { Request, Response } from "express";
import { Database } from "../database/Database.js";
import { stringToTransactionStatus, TransactionStatus } from '../model/TransactionStatus.js';
import { Peers } from "../peer/Peers.js";

export class OrderController {

    private peers: Peers;
    private database: Database;
    private isDebugMode: boolean;

    constructor(peers: Peers, database: Database, isDebugMode: boolean = false) {
        this.peers = peers;
        this.database = database;
        this.isDebugMode = isDebugMode;
    }

    addOrder = async (request: Request, response: Response) => {
        console.log("R<---", request.method, request.url, request.body);
        const order = request.body;

        if (!order || Object.keys(order).length == 0) {
            response.sendStatus(400);
            return;
        }

        const id = this.database.generateId(order);

        const orderExists = await this.database.orderExists(id);
        if (orderExists) {
            response.sendStatus(204);
            return;
        }

        order.id = id;
        if (!order.status) {
            order.status = TransactionStatus.IN_PROGRESS;
        }

        this.database.addOrder(order);
        this.peers.broadcast(request.method, request.url, request.body);
        response.sendStatus(204);
    }

    editOrder = async (request: Request, response: Response) => {
        if (!this.isDebugMode) {
            response.sendStatus(404);
            return;
        }
        console.log("R<---", request.method, request.url, request.body);
        if (!request.params.orderId || !request.body.status) {
            response.sendStatus(400);
            return;
        }

        const status = stringToTransactionStatus(request.body.status)
        if (status === TransactionStatus.UNKNOWN) {
            response.sendStatus(403);
            return;
        }

        if (!this.database.orderExists(request.params.orderId)) {
            response.sendStatus(403);
            return;
        }

        const order = await this.database.getOrder(request.params.orderId);
        if (order.status == status) {
            response.sendStatus(204);
            return;
        }

        this.database.editOrder(request.params.orderId, status);
        this.peers.broadcast(request.method, request.url, request.body);
        response.sendStatus(204);
    }

    getorders = async (request: Request, response: Response) => {
        console.log("R<---", request.method, request.url, request.body);
        const orders = await this.database.getorders();
        response.json({ orders });
    }
}