import { Request, Response } from "express";
import { Database } from "../database/Database.js";
import { stringToTransactionStatus, TransactionStatus } from '../model/TransactionStatus.js';
import { Peers } from "../peer/Peers.js";
import { Order } from './../model/Order';

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

        if (!request.body || Object.keys(request.body).length == 0 || !isComplete(request.body)) {
            response.sendStatus(400);
            return;
        }

        const order = request.body as Order;
        order.status = TransactionStatus.IN_PROGRESS;
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

    getOrders = async (request: Request, response: Response) => {
        console.log("R<---", request.method, request.url, request.body);
        let orders = undefined;
        if (request.params.orderId) {
            console.log("single")
            orders = await this.database.getOrder(request.params.orderId);
        }
        else if (Object.keys(request.query).length === 0) {
            console.log("All entries")
            orders = await this.database.getOrders();
        }
        else {
            console.log("some entries", Object.keys(request.query))
            orders = await this.database.getOrderBy(
                request.query.fromToken as string,
                request.query.toToken as string,
                request.query.minAmountFromToken ? +request.query.minAmountFromToken : undefined,
                request.query.maxAmountFromToken ? +request.query.maxAmountFromToken : undefined,
                request.query.minAmountToToken ? +request.query.minAmountToToken : undefined,
                request.query.maxAmountToToken ? +request.query.maxAmountToToken : undefined,
            );
        }
        response.json({ orders });
    }
}

function isComplete(order: Order): boolean {
    return isStringValid(order.from) && isStringValid(order.fromToken) && isStringValid(order.toToken) &&
        isNumberValid(order.amountFromToken) && isNumberValid(order.amountToToken) && order.expirationDate != undefined
}

function isStringValid(str: string) {
    return typeof str === "string" && str.trim().length !== 0
}

function isNumberValid(nb: number) {
    return typeof +nb === "number" && !isNaN(+nb) && +nb > 0
}
