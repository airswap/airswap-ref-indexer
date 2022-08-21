import { Order } from '@airswap/typescript';
import { isValidFullOrder } from '@airswap/utils';
import { FiltersResponse } from '../database/filter/FiltersResponse.js';
import { Database } from '../database/Database.js';
import { mapAnyToDbOrder } from '../mapper/mapAnyToDbOrder.js';
import { mapAnyToRequestFilter } from '../mapper/mapAnyToRequestFilter.js';
import { isDateInRange, isNumeric } from '../validator/index.js';
import { AlreadyExistsError } from './../model/error/AlreadyExists.js';
import { ClientError } from './../model/error/ClientError.js';
import { IndexedOrder } from './../model/IndexedOrder.js';
import { OrderResponse } from './../model/response/OrderResponse.js';

const validationDurationInWeek = 1;

export const METHODS = { getOrders: "getOrders", addOrder: "addOrder" } as Record<string, string>;
export class OrderService {
    private database: Database;

    constructor(database: Database) {
        this.database = database;

        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter((name) => name !== "constructor").sort();
        if (!(methods.length === Object.keys(METHODS).length && methods.every((value: string) => value === METHODS[value]))) {
            console.error("Diverging:", methods, METHODS)
            throw new Error("Hardcoded method names & real are diverging");
        }
    }

    public async addOrder(body: any): Promise<void> {
        if (!body || Object.keys(body).length == 0) {
            throw new ClientError("No body");
        }
        if (!isValidFullOrder(body)) {
            throw new ClientError("Missing fields");
        }
        if (!areNumberFieldsValid(body)) {
            throw new ClientError("Number fields are incorrect");
        }
        if (!isDateInRange(body.expiry, validationDurationInWeek)) {
            throw new ClientError("Invalid expiry date");
        }

        const dbOrder = mapAnyToDbOrder(body);
        const addedTimestamp = isNumeric(body.addedOn) ? +body.addedOn : new Date().getTime();
        const indexedOrder = new IndexedOrder(dbOrder, addedTimestamp);
        const hash = this.database.generateHash(indexedOrder);
        const orderExists = await this.database.orderExists(hash);        
        if (orderExists) {
            throw new AlreadyExistsError();
        }

        indexedOrder.hash = hash;
        await this.database.addOrder(indexedOrder);
        return Promise.resolve();
    }

    public async getOrders(query: Record<string, any>): Promise<OrderResponse> {
        if (query === undefined || query === null) {
            throw new ClientError("Incorrect query");
        }
        let orders: OrderResponse;
        if (query.hash) {
            orders = await this.database.getOrder(query.hash);
        }
        else if (Object.keys(query).filter(key => key !== "filters").length === 0) {
            orders = await this.database.getOrders();
        }
        else {
            orders = await this.database.getOrderBy(mapAnyToRequestFilter(query));
        }
        
        if (query.filters) {
            const filters = await this.database.getFilters();
            orders.filters = new FiltersResponse(filters);
        }
        return Promise.resolve(orders);
    }
}


function areNumberFieldsValid(order: Order) {
    return isNumeric(order.senderAmount) && isNumeric(order.signerAmount) && isNumeric(order.expiry)
}