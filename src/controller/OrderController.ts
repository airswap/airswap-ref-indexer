
import { isValidOrder } from '@airswap/utils';
import { Request, Response } from "express";
import { Database } from "../database/Database.js";
import { Peers } from "../peer/Peers.js";
import { mapAnyToOrder } from '../mapper/mapAnyToOrder.js';
import { OtcOrder } from '../model/OtcOrder.js';
import { Order } from '@airswap/typescript';

const validationDurationInWeek = 1;

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

        if (!request.body || Object.keys(request.body).length == 0 || !isValidOrder(request.body.order)) {
            response.sendStatus(400);
            return;
        }

        const order = mapAnyToOrder(request.body.order);
        if (!amountAreValid(order) || !isDateInRange(order.expiry)) {
            response.sendStatus(400);
            return;
        }

        const id = this.database.generateId(new OtcOrder(order, request.body.addedOn));
        const orderExists = await this.database.orderExists(id);
        if (orderExists) {
            console.log("already exists")
            response.sendStatus(204);
            return;
        }

        const otcOrder = new OtcOrder(order, request.body.addedOn || `${new Date().getTime()}`, id);
        this.database.addOrder(otcOrder);
        this.peers.broadcast(request.method, request.url, request.body);
        response.sendStatus(204);
    }

    deleteOrder = async (request: Request, response: Response) => {
        if (!this.isDebugMode) {
            response.sendStatus(404);
            return;
        }
        console.log("R<---", request.method, request.url, request.body);
        if (!request.params.orderId) {
            response.sendStatus(400);
            return;
        }

        if (!this.database.orderExists(request.params.orderId)) {
            response.sendStatus(404);
            return;
        }

        this.database.deleteOrder(request.params.orderId);
        this.peers.broadcast(request.method, request.url, request.body);
        response.sendStatus(204);
    }

    getOrders = async (request: Request, response: Response) => {
        console.log("R<---", request.method, request.url, request.body);
        let orders = undefined;
        if (request.params.orderId) {
            orders = await this.database.getOrder(request.params.orderId);
        }
        else if (Object.keys(request.query).length === 0) {
            orders = await this.database.getOrders();
        }
        else {
            orders = await this.database.getOrderBy(
                request.query.signerToken as string,
                request.query.senderToken as string,
                request.query.minSignerAmount ? +request.query.minSignerAmount : undefined,
                request.query.maxSignerAmount ? +request.query.maxSignerAmount : undefined,
                request.query.minSenderAmount ? +request.query.minSenderAmount : undefined,
                request.query.maxSenderAmount ? +request.query.maxSenderAmount : undefined,
            );
        }
        response.json({ orders });
    }
}

function isDateInRange(date: string) {
    if (!isNumeric(date)) {
        return false;
    }

    let maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + validationDurationInWeek * 7);
    return +date < maxDate.getTime();
}

function amountAreValid(order: Order) {
    return isNumeric(order.senderAmount) && isNumeric(order.signerAmount)
}

function isNumeric(value: string) {
    return value !== undefined && value !== null && value.trim() !== "" && !isNaN(+value) && +value > 0
}