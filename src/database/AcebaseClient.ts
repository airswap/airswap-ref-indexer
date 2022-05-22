import { AceBase, DataReferencesArray } from 'acebase';
import crypto from "crypto";
import { Order } from '../model/Order.js';
import { TransactionStatus } from '../model/TransactionStatus.js';
import { AceBaseLocalSettings } from './../../node_modules/acebase/index.d';
import { Database } from './Database.js';

const ENTRY_REF = "orders";

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
        this.db.indexes.create(`${ENTRY_REF}`, 'from');
        this.db.indexes.create(`${ENTRY_REF}`, 'fromToken');
        this.db.indexes.create(`${ENTRY_REF}`, 'toToken');
        this.db.indexes.create(`${ENTRY_REF}`, 'amountFromToken');
        this.db.indexes.create(`${ENTRY_REF}`, 'amountToToken');
    }

    async getOrderBy(fromToken: string = undefined, toToken: string = undefined, minFromToken: number = undefined, maxFromToken: number = undefined,
        minToToken: number = undefined, maxToToken: number = undefined): Promise<Record<string, Order>> {
        const query = await this.db.query(ENTRY_REF);

        if (fromToken != undefined) {
            query.filter('fromToken', '==', fromToken);
        }
        if (toToken != undefined) {
            query.filter('toToken', '==', toToken);
        }
        if (minFromToken != undefined) {
            query.filter('amountFromToken', '>=', minFromToken);
        }
        if (maxFromToken != undefined) {
            query.filter('amountFromToken', '<=', maxFromToken);
        }
        if (minToToken != undefined) {
            query.filter('amountToToken', '>=', minToToken);
        }
        if (maxToToken != undefined) {
            query.filter('amountToToken', '<=', maxToToken);
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

    async addOrder(order: Order): Promise<void> {
        await this.db.ref(ENTRY_REF).push(order);
        return Promise.resolve();
    }

    async addAll(orders: Record<string, Order>): Promise<void> {
        await Promise.all(Object.keys(orders).map(async id => {
            await this.addOrder(orders[id]);
        }));
        return Promise.resolve();
    }

    async editOrder(id: string, status: TransactionStatus): Promise<void> {
        const order = await this.db.query(ENTRY_REF)
            .filter('id', '==', id)
            .get({ snapshots: false }) as DataReferencesArray;
        const tmp = await order[0].get();
        const storedOrder = this.datarefToRecord(tmp.val())[id];
        storedOrder.status = status;
        order[0].set(storedOrder);
        return Promise.resolve();
    }

    async getOrder(id: string): Promise<Order> {
        const query = await this.db.query(ENTRY_REF)
            .filter('id', '==', id)
            .get();
        const serializedOrder = query.values()?.next()?.value?.val();
        if (!serializedOrder) {
            return Promise.resolve(null);
        }
        return Promise.resolve(this.datarefToRecord(serializedOrder)[id]);
    }

    async getOrders(): Promise<Record<string, Order>> {
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

    private datarefToRecord(data): Record<string, Order> {
        const mapped: Record<string, Order> = {};
        mapped[data.id] = new Order(
            data.from,
            data.fromToken,
            data.toToken,
            +data.amountFromToken,
            +data.amountToToken,
            data.expirationDate,
            data.status,
            data.id,
        );
        return mapped;
    }

    async orderExists(id: string): Promise<boolean> {
        return await this.db.query(ENTRY_REF)
            .filter('id', '==', id).exists();
    }

    generateId(order: Order) {
        const lightenOrder = this.extractData(order);
        const stringObject = JSON.stringify(lightenOrder);
        const hashed = crypto.createHash("sha256").update(stringObject, "utf-8");
        return hashed.digest("hex");
    }

    private extractData(order: Order) {
        const lightenOrder = new Order(
            order.from,
            order.fromToken,
            order.toToken,
            order.amountFromToken,
            order.amountToToken,
            order.expirationDate
        );
        return lightenOrder;
    }
}