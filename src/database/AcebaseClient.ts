import { AceBase } from 'acebase';
import crypto from "crypto";
import { mapAnyToOrder } from '../mapper/mapAnyToOrder.js';
import { OtcOrder } from '../model/OtcOrder.js';
import { AceBaseLocalSettings } from './../../node_modules/acebase/index.d';
import { Database } from './Database.js';

const ENTRY_REF = "otcOrders";

export class AceBaseClient implements Database {

    private db: AceBase;

    constructor(databaseName: string, deleteOnStart = false) {
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

    async getOrderBy(signerToken?: string, senderToken?: string, minSignerAmount?: number, maxSignerAmount?: number, minSenderAmount?: number, maxSenderAmount?): Promise<Record<string, OtcOrder>> {
        const query = await this.db.query(`${ENTRY_REF}`);

        if (signerToken != undefined) {
            query.filter('signerToken', '==', signerToken);
        }
        if (senderToken != undefined) {
            query.filter('senderToken', '==', senderToken);
        }
        if (minSenderAmount != undefined) {
            query.filter('senderAmount', '>=', minSenderAmount);
        }
        if (maxSenderAmount != undefined) {
            query.filter('senderAmount', '<=', maxSenderAmount);
        }
        if (minSignerAmount != undefined) {
            query.filter('signerAmount', '>=', minSignerAmount);
        }
        if (maxSignerAmount != undefined) {
            query.filter('signerAmount', '<=', maxSignerAmount);
        }

        const data = await query.take(100).get();
        let mapped = {};
        data.forEach(d => {
            const mapp = this.datarefToRecord(d.val());
            mapped = { ...mapped, ...mapp };
        });
        return Promise.resolve(mapped);
    }

    close(): Promise<void> {
        return this.db.close()
    }

    async addOrder(otcOrder: OtcOrder): Promise<void> {
        let toAdd = { ...otcOrder, ...otcOrder.order};
        delete toAdd.order;
        await this.db.ref(ENTRY_REF).push(toAdd);
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

    async getOrder(id: string): Promise<Record<string, OtcOrder>> {
        const query = await this.db.query(ENTRY_REF)
            .filter('id', '==', id)
            .get();
        const serializedOrder = query.values()?.next()?.value?.val();
        if (!serializedOrder) {
            return Promise.resolve(null);
        }
        const result = {};
        result[id] = this.datarefToRecord(serializedOrder)[id];
        return Promise.resolve(result);
    }

    async getOrders(): Promise<Record<string, OtcOrder>> {
        const data = await this.db.query(ENTRY_REF).get();
        let mapped = {};
        data.forEach(d => {
            const mapp = this.datarefToRecord(d.val());
            mapped = { ...mapped, ...mapp };
        });
        return Promise.resolve(mapped);
    }

    async erase() {
        return await this.db.ref(ENTRY_REF).remove();
    }

    private datarefToRecord(data): Record<string, OtcOrder> {
        const mapped: Record<string, OtcOrder> = {};
        mapped[data.id] = new OtcOrder(mapAnyToOrder(data), data.addedOn, data.id)
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