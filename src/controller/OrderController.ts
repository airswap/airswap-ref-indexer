import { OrderResponse } from './../model/OrderResponse';
import { Order } from '@airswap/typescript';
import { isValidOrder } from '@airswap/utils';
import { Request, Response } from "express";
import { mapAnyToRequestFilter } from '../mapper/mapAnyToRequestFilter.js';
import { Database } from "../database/Database.js";
import { mapAnyToOrder } from '../mapper/mapAnyToOrder.js';
import { OtcOrder } from '../model/OtcOrder.js';
import { Peers } from "../peer/Peers.js";
import { isDateInRange, isNumeric } from '../validator/index.js';

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
        if (!areNumberFieldsValid(order) || !isDateInRange(order.expiry, validationDurationInWeek)) {
            response.sendStatus(400);
            return;
        }

        const addedTimestamp = isNumeric(request.body.addedOn) ? +request.body.addedOn : new Date().getTime();
        const otcOrder = new OtcOrder(order, addedTimestamp);
        const id = this.database.generateId(otcOrder);
        const orderExists = await this.database.orderExists(id);
        if (orderExists) {
            console.log("already exists")
            response.sendStatus(204);
            return;
        }

        otcOrder.id = id;
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
        let orders: OrderResponse = undefined;
        if (request.params.orderId) {
            orders = await this.database.getOrder(request.params.orderId);
        }
        else if (Object.keys(request.query).filter(key => key !== "filters").length === 0) {
            orders = await this.database.getOrders();
        }
        else {
            orders = await this.database.getOrderBy(mapAnyToRequestFilter(request.query));
        }
        let result = { ...orders, filters: undefined };
        if (request.query.filters) {
            const filters = await this.database.getFilters();
            result.filters = filters;
        }
        response.json(result);
    }
}

function areNumberFieldsValid(order: Order) {
    return isNumeric(order.senderAmount) && isNumeric(order.signerAmount) && isNumeric(order.expiry)
}