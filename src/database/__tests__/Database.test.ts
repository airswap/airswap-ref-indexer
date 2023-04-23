import { AddressZero } from '@ethersproject/constants';
import { FullOrderERC20 } from '@airswap/types';
import { forgeDbOrder, forgeIndexedOrder, forgeIndexedOrderResponse } from '../../Fixtures';
import { IndexedOrder } from '../../model/IndexedOrder';
import { AceBaseClient } from "../AcebaseClient";
import { Database } from '../Database';
import { InMemoryDatabase } from '../InMemoryDatabase';
import { DbOrder } from './../../model/DbOrder';
import { IndexedOrder as IndexedOrderResponse, SortField, SortOrder } from '@airswap/types';

describe("Database implementations", () => {
    let inMemoryDatabase: InMemoryDatabase;
    let acebaseClient: AceBaseClient;
    const addedOn = new Date().getTime();
    const expiryDate = new Date().getTime() + 10;

    beforeAll(async () => {
        inMemoryDatabase = new InMemoryDatabase();
        acebaseClient = new AceBaseClient();
        await acebaseClient.connect("dbtest", true);
        await inMemoryDatabase.connect("dbtest", true);
    });

    beforeEach(async () => {
        await inMemoryDatabase.erase();
        await acebaseClient.erase();
    });

    afterAll(async () => {
        await inMemoryDatabase.close();
        await acebaseClient.close();
    });

    describe('get IndexedOrder by filter', () => {
        test("inMemoryDb", async () => { await getOtcOrderByFilter(inMemoryDatabase); });
        test("acebaseDb", async () => { await getOtcOrderByFilter(acebaseClient); });
    });

    describe("Should add & get IndexedOrder", () => {
        test("inMemoryDb", async () => { await getAndAddOtcOrder(inMemoryDatabase); });
        test("acebaseDb", async () => { await getAndAddOtcOrder(acebaseClient); });
    });

    describe("Should set filters when adding IndexedOrder", () => {
        test("inMemoryDb", async () => { await shouldAddfiltersOnOtcAdd(inMemoryDatabase); });
        test("acebaseDb", async () => { await shouldAddfiltersOnOtcAdd(acebaseClient); });
    });

    describe("Should add all & get orders", () => {
        test("inMemoryDb", async () => { await addAllAndGetOrders(inMemoryDatabase); });
        test("acebaseDb", async () => { await addAllAndGetOrders(acebaseClient); });
    });

    describe("Should delete IndexedOrder", () => {
        test("inMemoryDb", async () => { await shouldDeleteOtcOrder(inMemoryDatabase); });
        test("acebaseDb", async () => { await shouldDeleteOtcOrder(acebaseClient); });
    });

    describe("Should delete expired IndexedOrder", () => {
        test("inMemoryDb", async () => { await shouldDeleteExpiredOtcOrder(inMemoryDatabase); });
        test("acebaseDb", async () => { await shouldDeleteExpiredOtcOrder(acebaseClient); });
    });

    describe("Should return true if IndexedOrder exists", () => {
        test("inMemoryDb", async () => { await otcOrderExists(inMemoryDatabase); });
        test("acebaseDb", async () => { await otcOrderExists(acebaseClient); });
    });

    describe("Should return false if IndexedOrder does not exist", () => {
        test("inMemoryDb", async () => { await otcOrderDoesNotExist(inMemoryDatabase); });
        test("acebaseDb", async () => { await otcOrderDoesNotExist(acebaseClient); });
    });

    describe("Should return IndexedOrder", () => {
        test("inMemoryDb", async () => { await addOtcOrder(inMemoryDatabase); });
        test("acebaseDb", async () => { await addOtcOrder(acebaseClient); });
    });

    describe("Should not return IndexedOrder", () => {
        test("inMemoryDb", async () => { await renturnsNullOnUnknownHash(inMemoryDatabase); });
        test("acebaseDb", async () => { await renturnsNullOnUnknownHash(acebaseClient); });
    });

    describe("sha 256 does not change", () => {
        test("inMemoryDb", async () => { await hashObject(inMemoryDatabase); });
        test("acebaseDb", async () => { await hashObject(acebaseClient); });
    });

    async function getOtcOrderByFilter(db: Database) {
        const dbOrder1: DbOrder = {
            nonce: "nonce",
            expiry: 1653138423537,
            signerWallet: "signerWallet",
            signerToken: "signerToken",
            signerAmount: "2",
            approximatedSignerAmount: BigInt(2),
            senderToken: "senderToken",
            senderAmount: "1",
            approximatedSenderAmount: BigInt(1),
            v: "v",
            r: "r",
            s: "s",
            chainId: 5,
            swapContract: AddressZero,
            protocolFee: "4",
            senderWallet: AddressZero,
        };
        const order1: FullOrderERC20 = {
            nonce: "nonce",
            expiry: "1653138423537",
            signerWallet: "signerWallet",
            signerToken: "signerToken",
            signerAmount: "2",
            senderToken: "senderToken",
            senderAmount: "1",
            v: "v",
            r: "r",
            s: "s",
            protocolFee: "4",
            senderWallet: AddressZero,
            chainId: 5,
            swapContract: AddressZero
        };
        const dbOrder2: DbOrder = {
            nonce: "nonce",
            expiry: 1653138423537,
            signerWallet: "signerWallet",
            signerToken: "blip",
            signerAmount: "20",
            approximatedSignerAmount: BigInt(20),
            senderToken: "another",
            senderAmount: "10",
            approximatedSenderAmount: BigInt(10),
            v: "v",
            r: "r",
            s: "s",
            chainId: 5,
            swapContract: AddressZero,
            protocolFee: "4",
            senderWallet: AddressZero,
        };
        const order2: FullOrderERC20 = {
            nonce: "nonce",
            expiry: "1653138423537",
            signerWallet: "signerWallet",
            signerToken: "blip",
            signerAmount: "20",
            senderToken: "another",
            senderAmount: "10",
            v: "v",
            r: "r",
            s: "s",
            protocolFee: "4",
            senderWallet: AddressZero,
            chainId: 5,
            swapContract: AddressZero
        };
        const dbOrder3: DbOrder = {
            nonce: "nonce",
            expiry: 1653138423537,
            signerWallet: "signerWallet",
            signerToken: "signerToken",
            signerAmount: "3",
            approximatedSignerAmount: BigInt(3),
            senderToken: "senderToken",
            senderAmount: "100",
            approximatedSenderAmount: BigInt(100),
            v: "v",
            r: "r",
            s: "s",
            chainId: 5,
            swapContract: AddressZero,
            protocolFee: "4",
            senderWallet: AddressZero,
        };
        const order3: FullOrderERC20 = {
            nonce: "nonce",
            expiry: "1653138423537",
            signerWallet: "signerWallet",
            signerToken: "signerToken",
            signerAmount: "3",
            senderToken: "senderToken",
            senderAmount: "100",
            v: "v",
            r: "r",
            s: "s",
            protocolFee: "4",
            senderWallet: AddressZero,
            chainId: 5,
            swapContract: AddressZero
        };

        const otcOrder1 = new IndexedOrder(dbOrder1, 1653138423537, "id1");
        const expectedOtcOrder1: IndexedOrderResponse<FullOrderERC20> = { order: order1, addedOn: 1653138423537, hash: "id1" };
        const otcOrder2 = new IndexedOrder(dbOrder2, 1653138423527, "id2");
        const expectedOtcOrder2: IndexedOrderResponse<FullOrderERC20> = { order: order2, addedOn: 1653138423527, hash: "id2" };
        const otcOrder3 = new IndexedOrder(dbOrder3, 1653138423517, "id3");
        const expectedOtcOrder3: IndexedOrderResponse<FullOrderERC20> = { order: order3, addedOn: 1653138423517, hash: "id3" };
        await db.addOrder(otcOrder1);
        await db.addOrder(otcOrder2);
        await db.addOrder(otcOrder3);

        const ordersFromToken = await db.getOrderERC20By({ page: 1, signerTokens: ["signerToken"] });
        expect(ordersFromToken).toEqual({
            orders: { "id1": expectedOtcOrder1, "id3": expectedOtcOrder3 },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 2
        });

        const anotherToken = await db.getOrderERC20By({ page: 1, senderTokens: ["another"] });
        expect(anotherToken).toEqual({
            orders: { "id2": expectedOtcOrder2 },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 1
        });

        const minSignerAmountFromToken = await db.getOrderERC20By({ page: 1, minSignerAmount: BigInt(15) });
        expect(minSignerAmountFromToken).toEqual({
            orders: { "id2": expectedOtcOrder2 },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 1
        });

        const maxSignerAmountFromToken = await db.getOrderERC20By({ page: 1, maxSignerAmount: BigInt(5) });
        expect(maxSignerAmountFromToken).toEqual({
            orders: { "id1": expectedOtcOrder1, "id3": expectedOtcOrder3 },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 2
        });

        const minSenderAmount = await db.getOrderERC20By({ page: 1, minSenderAmount: BigInt(20) });
        expect(minSenderAmount).toEqual({
            orders: { "id3": expectedOtcOrder3 },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 1
        });

        const maxSenderAmount = await db.getOrderERC20By({ page: 1, maxSenderAmount: BigInt(15) });
        expect(maxSenderAmount).toEqual({
            orders: { "id1": expectedOtcOrder1, "id2": expectedOtcOrder2 },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 2
        });

        const senderAmountAsc = await db.getOrderERC20By({ page: 1, sortField: SortField.SENDER_AMOUNT, sortOrder: SortOrder.ASC });
        expect(Object.keys(senderAmountAsc.orders)).toEqual(["id1", "id2", "id3"]);

        const senderAmountDesc = await db.getOrderERC20By({ page: 1, sortField: SortField.SENDER_AMOUNT, sortOrder: SortOrder.DESC, senderTokens: ["senderToken"] });
        expect(Object.keys(senderAmountDesc.orders)).toEqual(["id3", "id1"]);

        const signerAmountAsc = await db.getOrderERC20By({ page: 1, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.ASC });
        expect(Object.keys(signerAmountAsc.orders)).toEqual(["id1", "id3", "id2"]);

        const signerAmountDesc = await db.getOrderERC20By({ page: 1, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.DESC, signerTokens: ["signerToken"] });
        expect(Object.keys(signerAmountDesc.orders)).toEqual(["id3", "id1"]);

        const minSignerAmountDesc = await db.getOrderERC20By({ page: 1, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.DESC });
        expect(Object.keys(minSignerAmountDesc.orders)).toEqual(["id2", "id3", "id1"]);

        const maxAddedOn = await db.getOrderERC20By({ page: 1, maxAddedDate: 1653138423527 });
        expect(maxAddedOn).toEqual({
            orders: { "id1": expectedOtcOrder1, "id2": expectedOtcOrder2 },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 2
        });

        const specificOne = await db.getOrderERC20By({
            page: 1,
            signerTokens: ["signerToken"],
            senderTokens: ["senderToken"],
            minSignerAmount: BigInt(0),
            maxSignerAmount: BigInt(5),
            minSenderAmount: BigInt(1),
            maxSenderAmount: BigInt(3),
        });
        expect(specificOne).toEqual({
            orders: { "id1": expectedOtcOrder1, },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 1
        });

        return Promise.resolve();
    }

    async function getAndAddOtcOrder(db: Database) {
        const indexedOrder = forgeIndexedOrder(addedOn, expiryDate);
        const expectedIndexedOrder = forgeIndexedOrderResponse(addedOn, expiryDate);

        await db.addOrder(indexedOrder);
        const orders = await db.getOrdersERC20();

        expect(orders).toEqual({
            orders: { hash: expectedIndexedOrder, },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 1
        });
        return Promise.resolve();
    }

    async function addAllAndGetOrders(db: Database) {
        const indexedOrder = forgeIndexedOrder(addedOn, expiryDate);
        const anotherOrder = forgeIndexedOrder(addedOn, expiryDate);
        const expectedIndexedOrder = forgeIndexedOrderResponse(addedOn, expiryDate);
        const expectedAnotherOrder = forgeIndexedOrderResponse(addedOn, expiryDate);
        anotherOrder.hash = "another_hash";
        expectedAnotherOrder.hash = "another_hash";

        await db.addAll({ "hash": indexedOrder, "another_hash": anotherOrder });
        const orders = await db.getOrdersERC20();

        expect(orders).toEqual({
            orders: { hash: expectedIndexedOrder, "another_hash": expectedAnotherOrder },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 2
        });
        return Promise.resolve();
    }

    async function shouldAddfiltersOnOtcAdd(db: Database) {
        const indexedOrder = forgeIndexedOrder(addedOn, expiryDate);
        const anotherOrder = forgeIndexedOrder(addedOn, expiryDate);
        anotherOrder.hash = "another_hash";
        anotherOrder.order.senderAmount = "15";
        anotherOrder.order.approximatedSenderAmount = BigInt(15);
        anotherOrder.order.signerAmount = "50";
        anotherOrder.order.approximatedSignerAmount = BigInt(50);

        await db.addAll({ "hash": indexedOrder, "another_hash": anotherOrder });
        const filters = await db.getFiltersERC20();

        expect(filters).toEqual({
            senderToken: { "0x0000000000000000000000000000000000000000": { max: BigInt(15), min: BigInt(10) } },
            signerToken: { "0x0000000000000000000000000000000000000000": { max: BigInt(50), min: BigInt(5) } }
        });
        return Promise.resolve();
    }

    async function shouldDeleteOtcOrder(db: Database) {
        const indexedOrder = forgeIndexedOrder(addedOn, expiryDate);
        await db.addOrder(indexedOrder);

        await db.deleteOrderERC20("nonce", AddressZero);
        const orders = await db.getOrdersERC20();

        expect(orders).toEqual({
            orders: {},
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 0
        });
        return Promise.resolve();
    }

    async function shouldDeleteExpiredOtcOrder(db: Database) {
        const indexedOrder = forgeIndexedOrder(1000, 2000);
        const indexedOrder2 = forgeIndexedOrder(1000, 1000);
        const indexedOrder3 = forgeIndexedOrder(1000, 500000);
        await db.addOrder(indexedOrder);
        await db.addOrder(indexedOrder2);
        await db.addOrder(indexedOrder3);
        const expected = forgeIndexedOrderResponse(1000, 500000);

        await db.deleteExpiredOrderERC20(300);
        const orders = await db.getOrdersERC20();

        expect(orders).toEqual({
            orders: { hash: expected },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 1
        });
        return Promise.resolve();
    }

    async function otcOrderExists(db: Database) {
        const indexedOrder = forgeIndexedOrder(addedOn, expiryDate);
        await db.addOrder(indexedOrder);

        const orderExists = await db.orderERC20Exists("hash");

        expect(orderExists).toBe(true);
        return Promise.resolve();
    }

    async function otcOrderDoesNotExist(db: Database) {
        const indexedOrder = forgeIndexedOrder(addedOn, expiryDate);
        await db.addOrder(indexedOrder);

        const orderExists = await db.orderERC20Exists("unknownHash");

        expect(orderExists).toBe(false);
        return Promise.resolve();
    }

    async function addOtcOrder(db: Database) {
        const indexedOrder = forgeIndexedOrder(addedOn, expiryDate);
        const expectedIndexedOrder = forgeIndexedOrderResponse(addedOn, expiryDate);
        await db.addOrder(indexedOrder);

        const orderExists = await db.getOrderERC20("hash");

        expect(orderExists).toEqual({
            orders: { hash: expectedIndexedOrder },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 1
        });
        return Promise.resolve();
    }

    async function renturnsNullOnUnknownHash(db: Database) {
        const indexedOrder = forgeIndexedOrder(addedOn, expiryDate);
        await db.addOrder(indexedOrder);

        const orderExists = await db.getOrderERC20("unknownHash");

        expect(orderExists).toEqual({
            orders: {},
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 0
        });
        return Promise.resolve();
    }

    async function hashObject(db: Database) {
        const indexedOrder = new IndexedOrder(forgeDbOrder(1653138423547), new Date(1653138423537).getTime(), "hash");

        const hash = db.generateHash(indexedOrder);

        expect(hash).toBe("5cfd1a4837f91f4b690c739ecf08b26d3cfa5f69e0891a108df50b1fd0a0d892");
        return Promise.resolve();
    }
});