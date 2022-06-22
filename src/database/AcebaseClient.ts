import { AceBase } from 'acebase';
import crypto from "crypto";
import { mapAnyToDbOrder } from '../mapper/mapAnyToOrder.js';
import { OtcOrder } from '../model/OtcOrder.js';
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
        this.db.indexes.create(`${ENTRY_REF}`, 'id');
        this.db.indexes.create(`${ENTRY_REF}`, 'addedOn');
        this.db.indexes.create(`${ENTRY_REF}`, "signerToken");
        this.db.indexes.create(`${ENTRY_REF}`, "signerAmount");
        this.db.indexes.create(`${ENTRY_REF}`, "senderToken");
        this.db.indexes.create(`${ENTRY_REF}`, "senderAmount");
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
            query.filter('senderAmount', '>=', requestFilter.minSenderAmount);
        }
        if (requestFilter.maxSenderAmount != undefined) {
            query.filter('senderAmount', '<=', requestFilter.maxSenderAmount);
        }
        if (requestFilter.minSignerAmount != undefined) {
            query.filter('signerAmount', '>=', requestFilter.minSignerAmount);
        }
        if (requestFilter.maxSignerAmount != undefined) {
            query.filter('signerAmount', '<=', requestFilter.maxSignerAmount);
        }
        if (requestFilter.maxAddedDate != undefined) {
            query.filter('addedOn', '>=', requestFilter.maxAddedDate);
        }
        if (requestFilter.sortField == SortField.SIGNER_AMOUNT) {
            query.sort('signerAmount', requestFilter.sortOrder == SortOrder.ASC)
        } else if (requestFilter.sortField == SortField.SENDER_AMOUNT) {
            query.sort('senderAmount', requestFilter.sortOrder == SortOrder.ASC)
        }
        const totalResults = await query.count();
        const data = await query.skip((requestFilter.page - 1) * elementPerPage).take(elementPerPage + 1).get();
        let mapped = {};
        data.forEach(d => {
            const mapp = this.datarefToRecord(d.val());
            mapped = { ...mapped, ...mapp };
        });
        return Promise.resolve(new OrderResponse(mapped, Math.ceil(totalResults / elementPerPage)));
    }

    close(): Promise<void> {
        return this.db.close()
    }

    async addOrder(otcOrder: OtcOrder): Promise<void> {
        let toAdd = { ...otcOrder, ...otcOrder.order };
        delete toAdd.order;
        await this.db.ref(ENTRY_REF).push(toAdd);
        this.filters.addSignerToken(otcOrder.order.signerToken, otcOrder.order.signerAmount);
        this.filters.addSenderToken(otcOrder.order.senderToken, otcOrder.order.senderAmount);
        return Promise.resolve();
    }

    async addAll(orders: Record<string, OtcOrder>): Promise<void> {
        await Promise.all(Object.keys(orders).map(async id => {
            await this.addOrder(orders[id]);
        }));
        return Promise.resolve();
    }

    async deleteOrder(id: string): Promise<void> {
        await this.db.query(ENTRY_REF)
            .filter('id', '==', id)
            .remove();
        return Promise.resolve();
    }

    async getOrder(id: string): Promise<OrderResponse> {
        const query = await this.db.query(ENTRY_REF)
            .filter('id', '==', id)
            .get();
        const serializedOrder = query.values()?.next()?.value?.val();
        if (!serializedOrder) {
            return Promise.resolve(new OrderResponse(null, 0));
        }
        const result = {};
        result[id] = this.datarefToRecord(serializedOrder)[id];
        return Promise.resolve(new OrderResponse(result, 1));
    }

    async getOrders(): Promise<OrderResponse> {
        const data = await this.db.query(ENTRY_REF).take(1000000).get(); // bypass default limitation 
        const totalResults = await this.db.query(ENTRY_REF).take(1000000).count();
        let mapped = {};
        data.forEach(d => {
            const mapp = this.datarefToRecord(d.val());
            mapped = { ...mapped, ...mapp };
        });
        return Promise.resolve(new OrderResponse(mapped, Math.ceil(totalResults / elementPerPage)));
    }

    async erase() {
        this.filters = new Filters();
        return await this.db.ref(ENTRY_REF).remove();
    }

    private datarefToRecord(data): Record<string, OtcOrder> {
        const mapped: Record<string, OtcOrder> = {};
        mapped[data.id] = new OtcOrder(mapAnyToDbOrder(data), data.addedOn, data.id)
        return mapped;
    }

    async orderExists(id: string): Promise<boolean> {
        return await this.db.query(ENTRY_REF)
            .filter('id', '==', id).exists();
    }

    generateId(otcOrder: OtcOrder) {
        const lightenOrder = otcOrder.order;
        const stringObject = JSON.stringify(lightenOrder);
        const hashed = crypto.createHash("sha256").update(stringObject, "utf-8");
        return hashed.digest("hex");
    }
}