import { FullOrder, IndexedOrder, OrderResponse, OrderFilter, SortField, SortOrder } from '@airswap/types';
import { AceBase, AceBaseLocalSettings, DataReference } from 'acebase';
import crypto from "crypto";
import fs from "fs";
import { mapAnyToFullOrderERC20 } from '../mapper/mapAnyToFullOrderERC20.js';
import { Database } from './Database.js';
import { FullOrderERC20 } from '@airswap/types';
import { DbOrderERC20, DbOrder, DbOrderParty, DbOrderFilter } from '../model/DbOrderTypes.js';
import { mapAnyToFullOrder } from '../mapper/mapAnyToFullOrder.js';

const ENTRY_REF_ERC20 = "erc20Orders";
const ENTRY_REF_ORDERS = "orders";

export class AceBaseClient implements Database {

    private db!: AceBase;
    private tokens: string[];
    private refERC20!: DataReference;
    private refOrders!: DataReference;

    public async connect(databaseName: string, deleteOnStart = false, databasePath: string): Promise<void> {
        const options = { storage: { path: databasePath }, logLevel: 'error' } as AceBaseLocalSettings;
        const dbName = `${databaseName}.acebase`;
        if (deleteOnStart && fs.existsSync(dbName)) {
            console.log("ACEBASE - Removing previous data...")
            await fs.promises.rm(dbName, { recursive: true });
        }
        this.db = new AceBase(databaseName, options);
        return new Promise((resolve, reject) => {
            this.db.ready(() => {
                this.refERC20 = this.db.ref(ENTRY_REF_ERC20);
                this.db.indexes.create(`${ENTRY_REF_ERC20}`, 'hash');
                this.db.indexes.create(`${ENTRY_REF_ERC20}`, 'addedOn');
                this.db.indexes.create(`${ENTRY_REF_ERC20}`, 'order/nonce');
                this.db.indexes.create(`${ENTRY_REF_ERC20}`, "order/approximatedSignerAmount");
                this.db.indexes.create(`${ENTRY_REF_ERC20}`, "order/approximatedSenderAmount");
                this.db.indexes.create(`${ENTRY_REF_ERC20}`, "order/signerToken");
                this.db.indexes.create(`${ENTRY_REF_ERC20}`, "order/senderToken");
                this.db.indexes.create(`${ENTRY_REF_ERC20}`, "order/senderWallet");
                this.db.indexes.create(`${ENTRY_REF_ERC20}`, "order/signerWallet");

                this.refOrders = this.db.ref(ENTRY_REF_ORDERS);
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, 'hash');
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, 'addedOn');
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, 'order/nonce');
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, "order/expiry");
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, "order/signer/wallet");
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, "order/sender/wallet");
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, "order/sender/approximatedAmount");
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, "order/signer/approximatedAmount");
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, "order/sender/token");
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, "order/signer/token");
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, "order/signer/id");
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, "order/sender/id");
                resolve();
            });
        });
    }

    public constructor() {
        this.tokens = [];
    }

    async addOrder(indexedOrder: IndexedOrder<DbOrder>): Promise<void> {
        await this.refOrders.query()
            .filter('order/signer/id', '==', indexedOrder.order.signer.id)
            .remove();
        await this.refOrders.push(indexedOrder);
        this.addToken(indexedOrder.order.signer.token)
        this.addToken(indexedOrder.order.sender.token)
        return Promise.resolve();
    }
    async addAllOrder(indexedOrders: Record<string, IndexedOrder<DbOrder>>): Promise<void> {
        await Promise.all(Object.keys(indexedOrders).map(async hash => {
            await this.addOrder(indexedOrders[hash]);
        }));
        return Promise.resolve();
    }
    async deleteOrder(nonce: number, signerWallet: string): Promise<void> {
        await this.refOrders.query()
            .filter('order/nonce', '==', nonce)
            .filter('order/signer/wallet', '==', signerWallet)
            .remove();
        return Promise.resolve();
    }
    async deleteExpiredOrder(timestampInSeconds: number): Promise<void> {
        await this.refOrders.query()
            .filter('order/expiry', '<', timestampInSeconds)
            .remove();
        return Promise.resolve();
    }
    async getOrder(hash: string): Promise<OrderResponse<FullOrder>> {
        const query = await this.refOrders.query()
            .filter('hash', '==', hash)
            .get();
        const serializedOrder = query.values()?.next()?.value?.val();
        if (!serializedOrder) {
            return Promise.resolve({
                orders: {},
                pagination: {
                    limit: 1,
                    offset: 0,
                    total: 0,
                },
            });
        }
        const result: Record<string, IndexedOrder<FullOrder>> = {};
        result[hash] = this.datarefToOrder(serializedOrder)[hash];
        return Promise.resolve({
            orders: result,
            pagination: {
                limit: 1,
                offset: 0,
                total: 1,
            },
        });
    }
    async getOrders(): Promise<OrderResponse<FullOrder>> {
        const data = await this.refOrders.query().take(1000000).get(); // bypass default limitation 
        const totalResults = await this.refOrders.query().take(1000000).count();
        let mapped = {} as Record<string, IndexedOrder<FullOrder>>;
        data.forEach(dataSnapshot => {
            const mapp = this.datarefToOrder(dataSnapshot.val());
            mapped = { ...mapped, ...mapp };
        });
        return Promise.resolve({
            orders: mapped,
            pagination: {
                limit: -1,
                offset: 0,
                total: totalResults,
            },
        });
    }
    async getOrdersBy(orderFilter: DbOrderFilter): Promise<OrderResponse<FullOrder>> {
        const query = this.refOrders.query();

        if (orderFilter.nonce != undefined) {
            query.filter('order/nonce', '==', orderFilter.nonce);
        }
        if (orderFilter.senderWallet != undefined) {
            query.filter('order/sender/wallet', '==', orderFilter.senderWallet);
        }
        if (orderFilter.signerWallet != undefined) {
            query.filter('order/signer/wallet', '==', orderFilter.signerWallet);
        }
        if (orderFilter.signerTokens != undefined) {
            query.filter('order/signer/token', 'in', orderFilter.signerTokens);
        }
        if (orderFilter.senderTokens != undefined) {
            query.filter('order/sender/token', 'in', orderFilter.senderTokens);
        }
        if (orderFilter.senderMinAmount != undefined) {
            query.filter('order/sender/approximatedAmount', '>=', orderFilter.senderMinAmount);
        }
        if (orderFilter.senderMaxAmount != undefined) {
            query.filter('order/sender/approximatedAmount', '<=', orderFilter.senderMaxAmount);
        }
        if (orderFilter.signerMinAmount != undefined) {
            query.filter('order/signer/approximatedAmount', '>=', orderFilter.signerMinAmount);
        }
        if (orderFilter.signerMaxAmount != undefined) {
            query.filter('order/signer/approximatedAmount', '<=', orderFilter.signerMaxAmount);
        }
        if (orderFilter.signerIds != undefined) {
            query.filter('order/signer/id', 'in', orderFilter.signerIds);
        }
        if (orderFilter.senderIds != undefined) {
            query.filter('order/sender/id', 'in', orderFilter.senderIds);
        }

        const isAscSort = orderFilter.sortOrder == SortOrder.ASC;
        if (orderFilter.sortField == SortField.SIGNER_AMOUNT) {
            query.sort('order/signer/approximatedAmount', isAscSort)
        } else if (orderFilter.sortField == SortField.SENDER_AMOUNT) {
            query.sort('order/sender/approximatedAmount', isAscSort)
        } else if (orderFilter.sortField == SortField.EXPIRY) {
            query.sort('order/expiry', isAscSort)
        } else if (orderFilter.sortField == SortField.NONCE) {
            query.sort('order/nonce', isAscSort)
        }

        const totalResults = await query.take(1000000).count()
        const entriesSkipped = orderFilter.offset;
        const data = await query.skip(entriesSkipped).take(entriesSkipped + orderFilter.limit).get();
        const mapped = data.reduce((total, indexedOrder) => {
            const mapped = this.datarefToOrder(indexedOrder.val());
            return { ...total, ...mapped };
        }, {} as Record<string, IndexedOrder<FullOrder>>);
        return Promise.resolve({
            orders: mapped,
            pagination: {
                limit: orderFilter.limit,
                offset: orderFilter.offset,
                total: totalResults,
            },
        });
    }
    async orderExists(hash: string): Promise<boolean> {
        return await this.refOrders.query()
            .filter('hash', '==', hash).exists();
    }

    getTokens(): Promise<string[]> {
        return Promise.resolve(this.tokens);
    }

    private addToken(token: string) {
        if (!this.tokens.includes(token)) {
            this.tokens.push(token);
        }
    }

    async getOrdersERC20By(orderFilter: DbOrderFilter): Promise<OrderResponse<FullOrderERC20>> {
        const query = this.refERC20.query();

        if (orderFilter.nonce != undefined) {
            query.filter('order/nonce', '==', orderFilter.nonce);
        }
        if (orderFilter.signerTokens != undefined) {
            query.filter('order/signerToken', 'in', orderFilter.signerTokens);
        }
        if (orderFilter.senderTokens != undefined) {
            query.filter('order/senderToken', 'in', orderFilter.senderTokens);
        }
        if (orderFilter.senderMinAmount != undefined) {
            query.filter('order/approximatedSenderAmount', '>=', orderFilter.senderMinAmount);
        }
        if (orderFilter.senderMaxAmount != undefined) {
            query.filter('order/approximatedSenderAmount', '<=', orderFilter.senderMaxAmount);
        }
        if (orderFilter.signerMinAmount != undefined) {
            query.filter('order/approximatedSignerAmount', '>=', orderFilter.signerMinAmount);
        }
        if (orderFilter.signerMaxAmount != undefined) {
            query.filter('order/approximatedSignerAmount', '<=', orderFilter.signerMaxAmount);
        }
        if (orderFilter.senderWallet != undefined) {
            query.filter('order/senderWallet', '==', orderFilter.senderWallet);
        }
        if (orderFilter.signerWallet != undefined) {
            query.filter('order/signerWallet', '==', orderFilter.signerWallet);
        }

        const isAscSort = orderFilter.sortOrder == SortOrder.ASC;
        if (orderFilter.sortField == SortField.SIGNER_AMOUNT) {
            query.sort('order/approximatedSignerAmount', isAscSort)
        } else if (orderFilter.sortField == SortField.SENDER_AMOUNT) {
            query.sort('order/approximatedSenderAmount', isAscSort)
        } else if (orderFilter.sortField == SortField.EXPIRY) {
            query.sort('order/expiry', isAscSort)
        } else if (orderFilter.sortField == SortField.NONCE) {
            query.sort('order/nonce', isAscSort)
        }

        const totalResults = await query.take(1000000).count()
        const entriesSkipped = orderFilter.offset;
        const data = await query.skip(entriesSkipped).take(entriesSkipped + orderFilter.limit).get();
        const mapped = data.reduce((total, indexedOrder) => {
            const mapped = this.datarefToERC20(indexedOrder.val());
            return { ...total, ...mapped };
        }, {} as Record<string, IndexedOrder<FullOrderERC20>>);
        return Promise.resolve({
            orders: mapped,
            pagination: {
                limit: orderFilter.limit,
                offset: orderFilter.offset,
                total: totalResults,
            },
        });
    }

    close(): Promise<void> {
        return this.db.close()
    }

    async addOrderERC20(indexedOrder: IndexedOrder<DbOrderERC20>): Promise<void> {
        await this.refERC20.push(indexedOrder);
        const order = indexedOrder.order as DbOrderERC20
        this.addToken(indexedOrder.order.signerToken)
        this.addToken(indexedOrder.order.senderToken)
        return Promise.resolve();
    }

    async addAllOrderERC20(orders: Record<string, IndexedOrder<DbOrderERC20>>): Promise<void> {
        await Promise.all(Object.keys(orders).map(async hash => {
            await this.addOrderERC20(orders[hash]);
        }));
        return Promise.resolve();
    }

    async deleteOrderERC20(nonce: number, signerWallet: string): Promise<void> {
        await this.refERC20.query()
            .filter('order/nonce', '==', nonce)
            .filter('order/signerWallet', '==', signerWallet)
            .remove();
        return Promise.resolve();
    }

    async deleteExpiredOrderERC20(timestampInSeconds: number) {
        await this.refERC20.query()
            .filter('order/expiry', '<', timestampInSeconds)
            .remove();
        return Promise.resolve();
    }

    async getOrderERC20(hash: string): Promise<OrderResponse<FullOrderERC20>> {
        const query = await this.refERC20.query()
            .filter('hash', '==', hash)
            .get();
        const serializedOrder = query.values()?.next()?.value?.val();
        if (!serializedOrder) {
            return Promise.resolve({
                orders: {},
                pagination: {
                    limit: 1,
                    offset: 0,
                    total: 0,
                },
            });
        }
        const result: Record<string, IndexedOrder<FullOrderERC20>> = {};
        result[hash] = this.datarefToERC20(serializedOrder)[hash];
        return Promise.resolve({
            orders: result,
            pagination: {
                limit: 1,
                offset: 0,
                total: 1,
            },
        });
    }

    async getOrdersERC20(): Promise<OrderResponse<FullOrderERC20>> {
        const data = await this.refERC20.query().take(1000000).get(); // bypass default limitation 
        const totalResults = await this.refERC20.query().take(1000000).count();
        let mapped = {} as Record<string, IndexedOrder<FullOrderERC20>>;
        data.forEach(dataSnapshot => {
            const mapp = this.datarefToERC20(dataSnapshot.val());
            mapped = { ...mapped, ...mapp };
        });
        return Promise.resolve({
            orders: mapped,
            pagination: {
                limit: -1,
                offset: 0,
                total: totalResults,
            },
        });
    }

    async erase() {
        this.tokens = [];
        await this.db.ref(ENTRY_REF_ERC20).remove();
        return await this.db.ref(ENTRY_REF_ORDERS).remove();
    }

    private datarefToERC20(data: any): Record<string, IndexedOrder<FullOrderERC20>> {
        const mapped: Record<string, IndexedOrder<FullOrderERC20>> = {};
        mapped[data.hash] = {
            order: mapAnyToFullOrderERC20(data.order),
            addedOn: data.addedOn,
            hash: data.hash
        };
        return mapped;
    }

    private datarefToOrder(data: any): Record<string, IndexedOrder<FullOrder>> {
        const mapped: Record<string, IndexedOrder<FullOrder>> = {};
        mapped[data.hash] = {
            order: mapAnyToFullOrder(data.order),
            addedOn: data.addedOn,
            hash: data.hash
        };
        return mapped;
    }

    async orderERC20Exists(hash: string): Promise<boolean> {
        return await this.refERC20.query()
            .filter('hash', '==', hash).exists();
    }

    generateHashERC20(indexedOrderERC20: IndexedOrder<DbOrderERC20>): string {
        const lightenOrder: Partial<DbOrderERC20> = { ...indexedOrderERC20.order };
        if (lightenOrder.approximatedSenderAmount) {
            delete lightenOrder.approximatedSenderAmount
        }
        if (lightenOrder.approximatedSignerAmount) {
            delete lightenOrder.approximatedSignerAmount
        }
        const stringObject = JSON.stringify(lightenOrder);
        const hashed = crypto.createHash("sha256").update(stringObject, "utf-8");
        return hashed.digest("hex");
    }

    generateHash(indexedOrder: IndexedOrder<DbOrder>): string {
        const signer: Partial<DbOrderParty> = { ...indexedOrder.order.signer };
        const sender: Partial<DbOrderParty> = { ...indexedOrder.order.sender };
        delete signer.approximatedAmount
        delete sender.approximatedAmount
        const lightenOrder = { ...indexedOrder.order, signer, sender }
        const stringObject = JSON.stringify(lightenOrder);
        const hashed = crypto.createHash("sha256").update(stringObject, "utf-8");
        return hashed.digest("hex");
    }
}