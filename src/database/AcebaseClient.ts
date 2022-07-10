import { AceBase, DataReference } from 'acebase';
import crypto from "crypto";
import { computePagination } from '../controller/pagination/index.js';
import { mapAnyToDbOrder } from '../mapper/mapAnyToOrder.js';
import { IndexedOrder } from '../model/IndexedOrder.js';
import { AceBaseLocalSettings } from './../../node_modules/acebase/index.d';
import { OrderResponse } from './../model/response/OrderResponse.js';
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
    private ref: DataReference;

    constructor(databaseName: string, deleteOnStart = false) {
        this.filters = new Filters();
        const options = { storage: { path: '.' }, logLevel: 'log' } as AceBaseLocalSettings;
        this.db = new AceBase(databaseName, options);
        this.db.ready(() => {
            if (deleteOnStart) {
                this.erase();
            }
        });

        this.ref = this.db.ref(ENTRY_REF);
        this.db.indexes.create(`${ENTRY_REF}`, 'hash');
        this.db.indexes.create(`${ENTRY_REF}`, 'addedOn');
        this.db.indexes.create(`${ENTRY_REF}`, "approximatedSignerAmount");
        this.db.indexes.create(`${ENTRY_REF}`, "approximatedSenderAmount");
        // this.db.indexes.create(`${ENTRY_REF}`, "signerToken"); https://github.com/appy-one/acebase/issues/124
        // this.db.indexes.create(`${ENTRY_REF}`, "senderToken");
    }

    getFilters(): Promise<Filters> {
        return Promise.resolve(this.filters);
    }

    async getOrderBy(requestFilter: RequestFilter): Promise<OrderResponse> {
        const query = this.ref.query();

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

        const isAscSort = requestFilter.sortOrder == SortOrder.ASC;
        if (requestFilter.sortField == SortField.SIGNER_AMOUNT) {
            query.sort('approximatedSignerAmount', isAscSort)
        } else if (requestFilter.sortField == SortField.SENDER_AMOUNT) {
            query.sort('approximatedSenderAmount', isAscSort)
        }

        const totalResults = await query.take(1000000).count()
        const entriesSkipped = (requestFilter.page - 1) * elementPerPage;
        const data = await query.skip(entriesSkipped).take(elementPerPage).get();
        const mapped = data.reduce((total, indexedOrder) => {
            const mapped = this.datarefToRecord(indexedOrder.val());
            return { ...total, ...mapped };
        }, {});
        const pagination = computePagination(elementPerPage, totalResults, requestFilter.page);
        return Promise.resolve(new OrderResponse(mapped, pagination, totalResults));
    }

    close(): Promise<void> {
        return this.db.close()
    }

    async addOrder(indexedOrder: IndexedOrder): Promise<void> {
        let toAdd = { ...indexedOrder, ...indexedOrder.order };
        //@ts-ignore
        delete toAdd.order;
        await this.ref.push(toAdd);
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
        await this.ref.query()
            .filter('hash', '==', hash)
            .remove();
        return Promise.resolve();
    }

    async getOrder(hash: string): Promise<OrderResponse> {
        const query = await this.ref.query()
            .filter('hash', '==', hash)
            .get();
        const serializedOrder = query.values()?.next()?.value?.val();
        if (!serializedOrder) {
            return Promise.resolve(new OrderResponse({}, computePagination(elementPerPage, 0), 1));
        }
        const result: Record<string, IndexedOrder> = {};
        result[hash] = this.datarefToRecord(serializedOrder)[hash];
        return Promise.resolve(new OrderResponse(result, computePagination(elementPerPage, 1), 1));
    }

    async getOrders(): Promise<OrderResponse> {
        const data = await this.ref.query().take(1000000).get(); // bypass default limitation 
        const totalResults = await this.ref.query().take(1000000).count();
        let mapped = {};
        data.forEach(dataSnapshot => {
            const mapp = this.datarefToRecord(dataSnapshot.val());
            mapped = { ...mapped, ...mapp };
        });
        return Promise.resolve(new OrderResponse(mapped, computePagination(totalResults, totalResults), totalResults));
    }

    async erase() {
        this.filters = new Filters();
        return await this.db.ref(ENTRY_REF).remove();
    }

    private datarefToRecord(data: any): Record<string, IndexedOrder> {
        const mapped: Record<string, IndexedOrder> = {};
        mapped[data.hash] = new IndexedOrder(mapAnyToDbOrder(data), data.addedOn, data.hash)
        return mapped;
    }

    async orderExists(hash: string): Promise<boolean> {
        return await this.ref.query()
            .filter('hash', '==', hash).exists();
    }

    generateHash(indexedOrder: IndexedOrder) {
        const lightenOrder = { ...indexedOrder.order };
        //@ts-ignore
        delete lightenOrder.approximatedSenderAmount
        //@ts-ignore
        delete lightenOrder.approximatedSignerAmount
        const stringObject = JSON.stringify(lightenOrder);
        const hashed = crypto.createHash("sha256").update(stringObject, "utf-8");
        return hashed.digest("hex");
    }
}