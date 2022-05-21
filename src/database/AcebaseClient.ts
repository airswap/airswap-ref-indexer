import { AceBase, DataReferencesArray } from 'acebase';
import crypto from "crypto";
import { Order } from '../model/Order.js';
import { TransactionStatus } from '../model/TransactionStatus.js';
import { AceBaseLocalSettings } from './../../node_modules/acebase/index.d';
import { Database } from './Database.js';

const ENTRY_REF = "orders";

export class AceBaseClient implements Database {

    private db: AceBase;

    constructor(databaseName: string) {
        const options = { logLevel: 'verbose', storage: { path: '.' } } as AceBaseLocalSettings; // optional settings
        this.db = new AceBase(databaseName, options);  // Creates or opens a database with name "mydb"
        this.db.ready(() => { this.db.ref(ENTRY_REF).remove() });
    }
    getOrderBy(fromToken: string, toToken: string, minFromToken: number, maxFromToken: number, minToToken: number, maxToToken: number): Promise<Record<string, Order>> {
        throw new Error('Method not implemented.');
    }

    close(): Promise<void> {
        return this.db.close()
    }

    addOrder(order: Order): void {
        this.db.ref(ENTRY_REF).push(order);
    }

    addAll(orders: Record<string, Order>): void {
        Object.keys(orders).forEach(id => {
            this.addOrder(orders[id]);
        });
    }

    async editOrder(id: string, status: TransactionStatus): Promise<void> {
        const order = await this.db.query(ENTRY_REF)
            .filter('id', '==', id)
            .get({ snapshots: false }) as DataReferencesArray;
        console.log(order);
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
        const query = await this.db.query(ENTRY_REF)
            .filter('id', '==', id)
            .get();
        return query.length == 1;
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