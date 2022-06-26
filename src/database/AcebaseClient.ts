import { computePagination } from '../controller/pagination/index.js';
import { AceBase } from 'acebase';
import crypto from "crypto";
import { mapAnyToOrder } from '../mapper/mapAnyToOrder.js';
import { IndexedOrder } from '../model/IndexedOrder.js';
import { AceBaseLocalSettings } from './../../node_modules/acebase/index.d';
import { OrderResponse } from './../model/OrderResponse.js';
import { Database } from './Database.js';
import { Filters } from './filter/Filters.js';
import { RequestFilter } from './filter/RequestFilter';
import { SortField } from './filter/SortField.js';
import { SortOrder } from './filter/SortOrder.js';

const ENTRY_REF = "otcOrders";
const elementPerPage = 20;

export class AceBaseClient implements Database {

    private db: AceBase;
    private filters: Filters;

    constructor(databaseName: string, deleteOnStart = false) {
        this.filters = new Filters();
        const options = { storage: { path: '.' } } as AceBaseLocalSettings;
        this.db = new AceBase(databaseName, options);
        this.db.ready(() => {
            if (deleteOnStart) {
                this.erase();
            }
        });
        this.db.indexes.create(`${ENTRY_REF}`, 'hash');
        this.db.indexes.create(`${ENTRY_REF}`, 'addedOn');
        this.db.indexes.create(`${ENTRY_REF}`, "signerToken");
        this.db.indexes.create(`${ENTRY_REF}`, "approximatedSignerAmount");
        this.db.indexes.create(`${ENTRY_REF}`, "senderToken");
        this.db.indexes.create(`${ENTRY_REF}`, "approximatedSenderAmount");
    }

    getFilters(): Promise<Filters> {
        return Promise.resolve(this.filters);
    }

    async getOrderBy(requestFilter: RequestFilter): Promise<OrderResponse> {
        const query = await this.db.query(`${ENTRY_REF}`);

        if (requestFilter.signerTokens != undefined) {
            query.filter('signerToken', 'in', requestFilter.signerTokens);
        }
        if (requestFilter.senderTokens != undefined) {
            query.filter('senderToken', 'in', requestFilter.senderTokens);
        }
        if (requestFilter.minSenderAmount != undefined) {
            query.filter('approximatedSenderAmount', '>=', requestFilter.minSenderAmount);
        }
        if (requestFilter.maxSenderAmount != undefined) {
            query.filter('approximatedSenderAmount', '<=', requestFilter.maxSenderAmount);
        }
        if (requestFilter.minSignerAmount != undefined) {
            query.filter('approximatedSignerAmount', '>=', requestFilter.minSignerAmount);
        }
        if (requestFilter.maxSignerAmount != undefined) {
            query.filter('approximatedSignerAmount', '<=', requestFilter.maxSignerAmount);
        }
        if (requestFilter.maxAddedDate != undefined) {
            query.filter('addedOn', '>=', requestFilter.maxAddedDate);
        }
        if (requestFilter.sortField == SortField.SIGNER_AMOUNT) {
            query.sort('approximatedSignerAmount', requestFilter.sortOrder == SortOrder.ASC)
        } else if (requestFilter.sortField == SortField.SENDER_AMOUNT) {
            query.sort('approximatedSenderAmount', requestFilter.sortOrder == SortOrder.ASC)
        }
        const totalResults = await query.count();
        const data = await query.skip((requestFilter.page - 1) * elementPerPage).take(elementPerPage + 1).get();
        let mapped = {};
        data.forEach(d => {
            const mapp = this.datarefToRecord(d.val());
            mapped = { ...mapped, ...mapp };
        });
        const pagination = computePagination(elementPerPage, totalResults, requestFilter.page);
        return Promise.resolve(new OrderResponse(mapped, pagination));
    }

    close(): Promise<void> {
        return this.db.close()
    }

    async addOrder(indexedOrder: IndexedOrder): Promise<void> {
        let toAdd = { ...indexedOrder, ...indexedOrder.order };
        delete toAdd.order;
        await this.db.ref(ENTRY_REF).push(toAdd);
        this.filters.addSignerToken(indexedOrder.order.signerToken, indexedOrder.order.approximatedSignerAmount);
        this.filters.addSenderToken(indexedOrder.order.senderToken, indexedOrder.order.approximatedSenderAmount);
        return Promise.resolve();
    }

    async addAll(orders: Record<string, IndexedOrder>): Promise<void> {
        await Promise.all(Object.keys(orders).map(async hash => {
            await this.addOrder(orders[hash]);
        }));
        return Promise.resolve();
    }

    async deleteOrder(hash: string): Promise<void> {
        await this.db.query(ENTRY_REF)
            .filter('hash', '==', hash)
            .remove();
        return Promise.resolve();
    }

    async getOrder(hash: string): Promise<OrderResponse> {
        const query = await this.db.query(ENTRY_REF)
            .filter('hash', '==', hash)
            .get();
        const serializedOrder = query.values()?.next()?.value?.val();
        if (!serializedOrder) {
            return Promise.resolve(new OrderResponse(null, computePagination(elementPerPage, 0)));
        }
        const result = {};
        result[hash] = this.datarefToRecord(serializedOrder)[hash];
        return Promise.resolve(new OrderResponse(result, computePagination(elementPerPage, 1)));
    }

    async getOrders(): Promise<OrderResponse> {
        const data = await this.db.query(ENTRY_REF).take(1000000).get(); // bypass default limitation 
        const totalResults = await this.db.query(ENTRY_REF).take(1000000).count();
        let mapped = {};
        data.forEach(d => {
            const mapp = this.datarefToRecord(d.val());
            mapped = { ...mapped, ...mapp };
        });
        return Promise.resolve(new OrderResponse(mapped, computePagination(elementPerPage, totalResults)));
    }

    async erase() {
        this.filters = new Filters();
        return await this.db.ref(ENTRY_REF).remove();
    }

    private datarefToRecord(data): Record<string, IndexedOrder> {
        const mapped: Record<string, IndexedOrder> = {};
        mapped[data.hash] = new IndexedOrder(mapAnyToOrder(data), data.addedOn, data.hash)
        return mapped;
    }

    async orderExists(hash: string): Promise<boolean> {
        return await this.db.query(ENTRY_REF)
            .filter('hash', '==', hash).exists();
    }

    generateHash(indexedOrder: IndexedOrder) {
        const lightenOrder = { ...indexedOrder.order };
        delete lightenOrder.approximatedSenderAmount
        delete lightenOrder.approximatedSignerAmount
        const stringObject = JSON.stringify(lightenOrder);
        const hashed = crypto.createHash("sha256").update(stringObject, "utf-8");
        return hashed.digest("hex");
    }
}