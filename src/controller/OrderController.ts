import { OrderResponse } from './../model/OrderResponse';
import { Order } from '@airswap/typescript';
import { isValidOrder } from '@airswap/utils';
import { Request, Response } from "express";
import { mapAnyToRequestFilter } from '../mapper/mapAnyToRequestFilter.js';
import { Database } from "../database/Database.js";
import { mapAnyToDbOrder } from '../mapper/mapAnyToOrder.js';
import { IndexedOrder } from '../model/IndexedOrder.js';
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

        if (!request.body
            || Object.keys(request.body).length == 0
            || !isValidOrder(request.body)
            || !areNumberFieldsValid(request.body)
            || !isDateInRange(request.body?.expiry, validationDurationInWeek)
        ) {
            response.sendStatus(400);
            return;
        }

        const order = mapAnyToDbOrder(request.body);
        const addedTimestamp = isNumeric(request.body.addedOn) ? +request.body.addedOn : new Date().getTime();
        const indexedOrder = new IndexedOrder(order, addedTimestamp);
        const hash = this.database.generateHash(indexedOrder);
        const orderExists = await this.database.orderExists(hash);
        if (orderExists) {
            console.log("already exists")
            response.sendStatus(204);
            return;
        }

        indexedOrder.hash = hash;
        this.database.addOrder(indexedOrder);
        this.peers.broadcast(request.method, request.url, request.body);
        response.sendStatus(204);
    }

    deleteOrder = async (request: Request, response: Response) => {
        if (!this.isDebugMode) {
            response.sendStatus(404);
            return;
        }
        console.log("R<---", request.method, request.url, request.body);
        if (!request.params.orderHash) {
            response.sendStatus(400);
            return;
        }

        if (!this.database.orderExists(request.params.orderHash)) {
            response.sendStatus(404);
            return;
        }

        this.database.deleteOrder(request.params.orderHash);
        this.peers.broadcast(request.method, request.url, request.body);
        response.sendStatus(204);
    }

    getOrders = async (request: Request, response: Response) => {
        console.log("R<---", request.method, request.url, request.body);
        let orders: OrderResponse = undefined;
        if (request.params.orderHash) {
            orders = await this.database.getOrder(request.params.orderHash);
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