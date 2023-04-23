import { FullOrder, IndexedOrder as IndexedOrderResponse, OrderResponse, RequestFilterERC20, RequestFilter, SortField, SortOrder } from '@airswap/types';
import { AceBase, AceBaseLocalSettings, DataReference } from 'acebase';
import crypto from "crypto";
import fs from "fs";
import { computePagination } from '../mapper/pagination/index.js';
import { mapAnyToFullOrderERC20 } from '../mapper/mapAnyToFullOrderERC20.js';
import { IndexedOrder } from '../model/IndexedOrder.js';
import { Database } from './Database.js';
import { Filters } from './filter/Filters.js';
import { FullOrderERC20 } from '@airswap/types';
import { DbOrderERC20, DbOrder } from '../model/DbOrderTypes.js';
import { mapAnyToFullOrder } from '../mapper/mapAnyToFullOrder.js';

const ENTRY_REF_ERC20 = "erc20Orders";
const ENTRY_REF_ORDERS = "orders";
const elementPerPage = 20;

export class AceBaseClient implements Database {

    private db!: AceBase;
    private filters!: Filters;
    private refERC20!: DataReference;
    private refOrders!: DataReference;

    public async connect(databaseName: string, deleteOnStart = false): Promise<void> {
        const options = { storage: { path: '.' }, logLevel: 'error' } as AceBaseLocalSettings;
        const dbName = `${databaseName}.acebase`;
        if (deleteOnStart && fs.existsSync(dbName)) {
            await fs.promises.rm(dbName, { recursive: true });
        }
        this.db = new AceBase(databaseName, options);
        return new Promise((resolve, reject) => {
            this.db.ready(() => {
                this.refERC20 = this.db.ref(ENTRY_REF_ERC20);
                this.db.indexes.create(`${ENTRY_REF_ERC20}`, 'hash');
                this.db.indexes.create(`${ENTRY_REF_ERC20}`, 'addedOn');
                this.db.indexes.create(`${ENTRY_REF_ERC20}`, "order/approximatedSignerAmount");
                this.db.indexes.create(`${ENTRY_REF_ERC20}`, "order/approximatedSenderAmount");
                this.db.indexes.create(`${ENTRY_REF_ERC20}`, "order/signerToken");
                this.db.indexes.create(`${ENTRY_REF_ERC20}`, "order/senderToken");

                this.refOrders = this.db.ref(ENTRY_REF_ORDERS);
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, 'hash');
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, 'addedOn');
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, "order/expiry");
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, "order/signer/wallet");
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, "order/sender/wallet");
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, "order/sender/approximatedAmount");
                this.db.indexes.create(`${ENTRY_REF_ORDERS}`, "order/signer/approximatedAmount");
                resolve();
            });
        });
    }

    public constructor() {
        this.filters = new Filters();
    }

    async addOrder(indexedOrder: IndexedOrder<DbOrder>): Promise<void> {
        await this.refOrders.push(indexedOrder);
        return Promise.resolve();
    }
    async addAllOrder(indexedOrders: Record<string, IndexedOrder<DbOrder>>): Promise<void> {
        await Promise.all(Object.keys(indexedOrders).map(async hash => {
            await this.addOrder(indexedOrders[hash]);
        }));
        return Promise.resolve();
    }
    async deleteOrder(nonce: string, signerWallet: string): Promise<void> {
        await this.refOrders.query()
            .filter('order/nonce', '==', nonce)
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
                pagination: computePagination(elementPerPage, 0),
                ordersForQuery: 0
            });
        }
        const result: Record<string, IndexedOrderResponse<FullOrder>> = {};
        result[hash] = this.datarefToOrder(serializedOrder)[hash];
        return Promise.resolve({
            orders: result,
            pagination: computePagination(elementPerPage, 1),
            ordersForQuery: 1
        });
    }
    async getOrders(): Promise<OrderResponse<FullOrder>> {
        const data = await this.refOrders.query().take(1000000).get(); // bypass default limitation 
        const totalResults = await this.refOrders.query().take(1000000).count();
        let mapped = {} as Record<string, IndexedOrderResponse<FullOrder>>;
        data.forEach(dataSnapshot => {
            const mapp = this.datarefToOrder(dataSnapshot.val());
            mapped = { ...mapped, ...mapp };
        });
        return Promise.resolve({
            orders: mapped,
            pagination: computePagination(totalResults, totalResults),
            ordersForQuery: totalResults
        });
    }
    async getOrderBy(requestFilter: RequestFilter): Promise<OrderResponse<FullOrder>> {
        const query = this.refOrders.query();

        if (requestFilter.senderAddress != undefined) {
            query.filter('order/sender/wallet', '==', requestFilter.senderAddress);
        }
        if (requestFilter.signerAddress != undefined) {
            query.filter('order/signer/wallet', '==', requestFilter.signerAddress);
        }

        const isAscSort = requestFilter.sortOrder == SortOrder.ASC;
        if (requestFilter.sortField == SortField.SIGNER_AMOUNT) {
            query.sort('order/signer/approximatedAmount', isAscSort)
        } else if (requestFilter.sortField == SortField.SENDER_AMOUNT) {
            query.sort('order/sender/approximatedAmount', isAscSort)
        } else if (requestFilter.sortField == SortField.EXPIRY) {
            query.sort('order/expiry', isAscSort)
        }

        const totalResults = await query.take(1000000).count()
        const entriesSkipped = (requestFilter.page - 1) * elementPerPage;
        const data = await query.skip(entriesSkipped).take(elementPerPage).get();
        const mapped = data.reduce((total, indexedOrder) => {
            const mapped = this.datarefToOrder(indexedOrder.val());
            return { ...total, ...mapped };
        }, {} as Record<string, IndexedOrderResponse<FullOrder>>);
        const pagination = computePagination(elementPerPage, totalResults, requestFilter.page);
        return Promise.resolve({
            orders: mapped,
            pagination: pagination,
            ordersForQuery: totalResults
        });
    }
    async orderExists(hash: string): Promise<boolean> {
        return await this.refOrders.query()
            .filter('hash', '==', hash).exists();
    }

    async getFiltersERC20(): Promise<Filters> {
        return Promise.resolve(this.filters);
    }

    async getOrderERC20By(requestFilter: RequestFilterERC20): Promise<OrderResponse<FullOrderERC20>> {
        const query = this.refERC20.query();

        if (requestFilter.signerTokens != undefined) {
            query.filter('order/signerToken', 'in', requestFilter.signerTokens);
        }
        if (requestFilter.senderTokens != undefined) {
            query.filter('order/senderToken', 'in', requestFilter.senderTokens);
        }
        if (requestFilter.minSenderAmount != undefined) {
            query.filter('order/approximatedSenderAmount', '>=', requestFilter.minSenderAmount);
        }
        if (requestFilter.maxSenderAmount != undefined) {
            query.filter('order/approximatedSenderAmount', '<=', requestFilter.maxSenderAmount);
        }
        if (requestFilter.minSignerAmount != undefined) {
            query.filter('order/approximatedSignerAmount', '>=', requestFilter.minSignerAmount);
        }
        if (requestFilter.maxSignerAmount != undefined) {
            query.filter('order/approximatedSignerAmount', '<=', requestFilter.maxSignerAmount);
        }
        if (requestFilter.maxAddedDate != undefined) {
            query.filter('addedOn', '>=', requestFilter.maxAddedDate);
        }

        const isAscSort = requestFilter.sortOrder == SortOrder.ASC;
        if (requestFilter.sortField == SortField.SIGNER_AMOUNT) {
            query.sort('order/approximatedSignerAmount', isAscSort)
        } else if (requestFilter.sortField == SortField.SENDER_AMOUNT) {
            query.sort('order/approximatedSenderAmount', isAscSort)
        }

        const totalResults = await query.take(1000000).count()
        const entriesSkipped = (requestFilter.page - 1) * elementPerPage;
        const data = await query.skip(entriesSkipped).take(elementPerPage).get();
        const mapped = data.reduce((total, indexedOrder) => {
            const mapped = this.datarefToERC20(indexedOrder.val());
            return { ...total, ...mapped };
        }, {} as Record<string, IndexedOrderResponse<FullOrderERC20>>);
        const pagination = computePagination(elementPerPage, totalResults, requestFilter.page);
        return Promise.resolve({
            orders: mapped,
            pagination: pagination,
            ordersForQuery: totalResults
        });
    }

    close(): Promise<void> {
        return this.db.close()
    }

    async addOrderERC20(indexedOrder: IndexedOrder<DbOrderERC20>): Promise<void> {
        await this.refERC20.push(indexedOrder);
        const order = indexedOrder.order as DbOrderERC20
        this.filters.addSignerToken(order.signerToken, order.approximatedSignerAmount);
        this.filters.addSenderToken(order.senderToken, order.approximatedSenderAmount);
        return Promise.resolve();
    }

    async addAllOrderERC20(orders: Record<string, IndexedOrder<DbOrderERC20>>): Promise<void> {
        await Promise.all(Object.keys(orders).map(async hash => {
            await this.addOrderERC20(orders[hash]);
        }));
        return Promise.resolve();
    }

    async deleteOrderERC20(nonce: string, signerWallet: string): Promise<void> {
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
                pagination: computePagination(elementPerPage, 0),
                ordersForQuery: 0
            });
        }
        const result: Record<string, IndexedOrderResponse<FullOrderERC20>> = {};
        result[hash] = this.datarefToERC20(serializedOrder)[hash];
        return Promise.resolve({
            orders: result,
            pagination: computePagination(elementPerPage, 1),
            ordersForQuery: 1
        });
    }

    async getOrdersERC20(): Promise<OrderResponse<FullOrderERC20>> {
        const data = await this.refERC20.query().take(1000000).get(); // bypass default limitation 
        const totalResults = await this.refERC20.query().take(1000000).count();
        let mapped = {} as Record<string, IndexedOrderResponse<FullOrderERC20>>;
        data.forEach(dataSnapshot => {
            const mapp = this.datarefToERC20(dataSnapshot.val());
            mapped = { ...mapped, ...mapp };
        });
        return Promise.resolve({
            orders: mapped,
            pagination: computePagination(totalResults, totalResults),
            ordersForQuery: totalResults
        });
    }

    async erase() {
        this.filters = new Filters();
        await this.db.ref(ENTRY_REF_ERC20).remove();
        return await this.db.ref(ENTRY_REF_ORDERS).remove();
    }

    private datarefToERC20(data: any): Record<string, IndexedOrderResponse<FullOrderERC20>> {
        const mapped: Record<string, IndexedOrderResponse<FullOrderERC20>> = {};
        mapped[data.hash] = {
            order: mapAnyToFullOrderERC20(data.order),
            addedOn: data.addedOn,
            hash: data.hash
        };
        return mapped;
    }

    private datarefToOrder(data: any): Record<string, IndexedOrderResponse<FullOrder>> {
        const mapped: Record<string, IndexedOrderResponse<FullOrder>> = {};
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

    generateHash(indexedOrder: IndexedOrder<DbOrderERC20>) {
        const lightenOrder = { ...indexedOrder.order };
        //@ts-ignore
        delete lightenOrder.approximatedSenderAmount;
        //@ts-ignore
        delete lightenOrder.approximatedSignerAmount;
        const stringObject = JSON.stringify(lightenOrder);
        const hashed = crypto.createHash("sha256").update(stringObject, "utf-8");
        return hashed.digest("hex");
    }
}