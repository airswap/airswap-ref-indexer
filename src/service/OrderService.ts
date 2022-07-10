import { Order } from '@airswap/typescript';
import { isValidOrder } from '@airswap/utils';
import { Database } from '../database/Database.js';
import { mapAnyToDbOrder } from '../mapper/mapAnyToOrder.js';
import { mapAnyToRequestFilter } from '../mapper/mapAnyToRequestFilter.js';
import { isDateInRange, isNumeric } from '../validator/index.js';
import { AlreadyExistsError } from './../model/error/AlreadyExists.js';
import { ClientError } from './../model/error/ClientError.js';
import { IndexedOrder } from './../model/IndexedOrder.js';
import { OrderResponse } from './../model/response/OrderResponse.js';

const validationDurationInWeek = 1;

export class OrderService {
    public methods = { getOrders: "getOrders", addOrder: "addOrder" } as Record<string, string>;
    private database: Database;

    constructor(database: Database) {
        this.database = database;

        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter((name) => name !== "constructor").sort();
        if (!(methods.length === Object.keys(this.methods).length && methods.every((value: string) => value === this.methods[value]))) {
            console.error("Diverging:", methods, this.methods)
            throw new Error("Hardcoded method names & real are diverging");
        }
    }

    public async addOrder(body: any): Promise<void> {
        if (!body
            || Object.keys(body).length == 0
            || !isValidOrder(body)
            || !areNumberFieldsValid(body)
            || !isDateInRange(body.expiry, validationDurationInWeek)
        ) {
            throw new ClientError("Order incomplete");
        }

        const order = mapAnyToDbOrder(body);
        const addedTimestamp = isNumeric(body.addedOn) ? +body.addedOn : new Date().getTime();
        const indexedOrder = new IndexedOrder(order, addedTimestamp);
        const hash = this.database.generateHash(indexedOrder);
        const orderExists = await this.database.orderExists(hash);
        if (orderExists) {
            throw new AlreadyExistsError();
        }

        indexedOrder.hash = hash;
        this.database.addOrder(indexedOrder);
        return Promise.resolve();
    }

    public async getOrders(query: Record<string, any>, orderHash?: string): Promise<any> {
        if (query === undefined || query === null) {
            throw new ClientError("Incorrect query");
        }
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