import { Order } from '@airswap/typescript';
import { isValidOrder } from '@airswap/utils';
import { Request, Response } from "express";
import { Database } from "../database/Database.js";
import { mapAnyToDbOrder } from '../mapper/mapAnyToOrder.js';
import { mapAnyToRequestFilter } from '../mapper/mapAnyToRequestFilter.js';
import { IndexedOrder } from '../model/IndexedOrder.js';
import { Peers } from "../peer/Peers.js";
import { isDateInRange, isNumeric } from '../validator/index.js';
import { OrderResponse } from './../model/OrderResponse';

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
        try {
            await this.addOrderService(request.body);
            this.peers.broadcast(request.method, request.url, request.body);
            response.sendStatus(204);
        } catch (error) {
            response.sendStatus(+(error as Error).message);
        }
    }

    async addOrderService(body: any): Promise<void> {
        if (!body
            || Object.keys(body).length == 0
            || !isValidOrder(body)
            || !areNumberFieldsValid(body)
            || !isDateInRange(body?.expiry, validationDurationInWeek)
        ) {
            throw Error("400");
        }

        const order = mapAnyToDbOrder(body);
        const addedTimestamp = isNumeric(body.addedOn) ? +body.addedOn : new Date().getTime();
        const indexedOrder = new IndexedOrder(order, addedTimestamp);
        const hash = this.database.generateHash(indexedOrder);
        const orderExists = await this.database.orderExists(hash);
        if (orderExists) {
            console.log("already exists");
            throw Error("204");
        }

        indexedOrder.hash = hash;
        this.database.addOrder(indexedOrder);
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
        if (request.query === null || typeof request.query != 'object') {
            response.sendStatus(400);
            return;
        }

        const result = await this.getOrderService(request.query, request.params.orderHash);
        response.json(result);
    }

    public async getOrderService(query: Record<string, any>, orderHash?: string): Promise<any> {
        let orders: OrderResponse;
        if (orderHash) {
            orders = await this.database.getOrder(orderHash);
        }
        else if (Object.keys(query).filter(key => key !== "filters").length === 0) {
            orders = await this.database.getOrders();
        }
        else {
            orders = await this.database.getOrderBy(mapAnyToRequestFilter(query));
        }
        let result = { ...orders };
        if (query.filters) {
            const filters = await this.database.getFilters();
            result.filters = filters;
        }
        return Promise.resolve(result);
    }
}

function areNumberFieldsValid(order: Order) {
    return isNumeric(order.senderAmount) && isNumeric(order.signerAmount) && isNumeric(order.expiry)
}