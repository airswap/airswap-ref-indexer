import { forgeDbOrder, forgeIndexedOrder } from '../../Fixtures';
import { IndexedOrder } from '../../model/IndexedOrder';
import { AceBaseClient } from "../AcebaseClient";
import { Database } from '../Database';
import { InMemoryDatabase } from '../InMemoryDatabase';
import { DbOrder } from './../../model/DbOrder';
import { OrderResponse } from './../../model/OrderResponse';
import { Pagination } from './../../model/Pagination.js';
import { SortField } from './../filter/SortField';
import { SortOrder } from './../filter/SortOrder';

describe("Database implementations", () => {
    let inMemoryDatabase: InMemoryDatabase;
    let acebaseClient: AceBaseClient;

    beforeAll(() => {
        inMemoryDatabase = new InMemoryDatabase();
        acebaseClient = new AceBaseClient("dbtest", true);
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
        const order1 = {
            nonce: "nonce",
            expiry: 1653138423537,
            signerWallet: "signerWallet",
            signerToken: "signerToken",
            signerAmount: "2",
            approximatedSignerAmount: 2,
            senderToken: "senderToken",
            senderAmount: "1",
            approximatedSenderAmount: 1,
            v: "v",
            r: "r",
            s: "s"
        } as DbOrder;
        const order2 = {
            nonce: "nonce",
            expiry: 1653138423537,
            signerWallet: "signerWallet",
            signerToken: "blip",
            signerAmount: "20",
            approximatedSignerAmount: 20,
            senderToken: "another",
            senderAmount: "10",
            approximatedSenderAmount: 10,
            v: "v",
            r: "r",
            s: "s"
        } as DbOrder;
        const order3 = {
            nonce: "nonce",
            expiry: 1653138423537,
            signerWallet: "signerWallet",
            signerToken: "signerToken",
            signerAmount: "3",
            approximatedSignerAmount: 3,
            senderToken: "senderToken",
            senderAmount: "100",
            approximatedSenderAmount: 100,
            v: "v",
            r: "r",
            s: "s"
        } as DbOrder;

        const otcOrder1 = new IndexedOrder(order1, 1653138423537, "id1");
        const otcOrder2 = new IndexedOrder(order2, 1653138423527, "id2");
        const otcOrder3 = new IndexedOrder(order3, 1653138423517, "id3");
        await db.addOrder(otcOrder1);
        await db.addOrder(otcOrder2);
        await db.addOrder(otcOrder3);

        const ordersFromToken = await db.getOrderBy({ page: 1, signerTokens: ["signerToken"] });
        expect(ordersFromToken).toEqual(new OrderResponse({ "id1": otcOrder1, "id3": otcOrder3 }, new Pagination("1", "1")));

        const anotherToken = await db.getOrderBy({ page: 1, senderTokens: ["another"] });
        expect(anotherToken).toEqual(new OrderResponse({ "id2": otcOrder2 }, new Pagination("1", "1")));

        const minSignerAmountFromToken = await db.getOrderBy({ page: 1, minSignerAmount: 15 });
        expect(minSignerAmountFromToken).toEqual(new OrderResponse({ "id2": otcOrder2 }, new Pagination("1", "1")));

        const maxSignerAmountFromToken = await db.getOrderBy({ page: 1, maxSignerAmount: 5 });
        expect(maxSignerAmountFromToken).toEqual(new OrderResponse({ "id1": otcOrder1, "id3": otcOrder3 }, new Pagination("1", "1")));

        const minSenderAmount = await db.getOrderBy({ page: 1, minSenderAmount: 20 });
        expect(minSenderAmount).toEqual(new OrderResponse({ "id3": otcOrder3 }, new Pagination("1", "1")));

        const maxSenderAmount = await db.getOrderBy({ page: 1, maxSenderAmount: 15 });
        expect(maxSenderAmount).toEqual(new OrderResponse({ "id1": otcOrder1, "id2": otcOrder2 }, new Pagination("1", "1")));

        const senderAmountAsc = await db.getOrderBy({ page: 1, sortField: SortField.SENDER_AMOUNT, sortOrder: SortOrder.ASC });
        expect(Object.keys(senderAmountAsc.orders)).toEqual(["id1", "id2", "id3"]);

        const senderAmountDesc = await db.getOrderBy({ page: 1, sortField: SortField.SENDER_AMOUNT, sortOrder: SortOrder.DESC, senderTokens: ["senderToken"] });
        expect(Object.keys(senderAmountDesc.orders)).toEqual(["id3", "id1"]);

        const signerAmountAsc = await db.getOrderBy({ page: 1, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.ASC });
        expect(Object.keys(signerAmountAsc.orders)).toEqual(["id1", "id3", "id2"]);

        const signerAmountDesc = await db.getOrderBy({ page: 1, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.DESC, signerTokens: ["signerToken"] });
        expect(Object.keys(signerAmountDesc.orders)).toEqual(["id3", "id1"]);

        const maxAddedOn = await db.getOrderBy({ page: 1, maxAddedDate: 1653138423527 });
        expect(maxAddedOn).toEqual(new OrderResponse({ "id1": otcOrder1, "id2": otcOrder2 }, new Pagination("1", "1")));

        const specificOne = await db.getOrderBy({
            page: 1,
            signerTokens: ["signerToken"],
            senderTokens: ["senderToken"],
            minSignerAmount: 0,
            maxSignerAmount: 5,
            minSenderAmount: 1,
            maxSenderAmount: 3,
        });
        expect(specificOne).toEqual(new OrderResponse({ "id1": otcOrder1 }, new Pagination("1", "1")));

        return Promise.resolve();
    }

    async function getAndAddOtcOrder(db: Database) {
        const indexedOrder = forgeIndexedOrder();

        await db.addOrder(indexedOrder);
        const orders = await db.getOrders();

        expect(orders).toEqual(new OrderResponse({ hash: indexedOrder }, new Pagination("1", "1")));
        return Promise.resolve();
    }

    async function addAllAndGetOrders(db: Database) {
        const indexedOrder = forgeIndexedOrder();
        const anotherOrder = forgeIndexedOrder();
        anotherOrder.hash = "another_hash";

        await db.addAll({ "hash": indexedOrder, "another_hash": anotherOrder });
        const orders = await db.getOrders();

        expect(orders).toEqual(new OrderResponse({ "hash": indexedOrder, "another_hash": anotherOrder }, new Pagination("1", "1")));
        return Promise.resolve();
    }

    async function shouldAddfiltersOnOtcAdd(db: Database) {
        const indexedOrder = forgeIndexedOrder();
        const anotherOrder = forgeIndexedOrder();
        anotherOrder.hash = "another_hash";
        anotherOrder.order.senderAmount = "15";
        anotherOrder.order.approximatedSenderAmount = 15;
        anotherOrder.order.signerAmount = "50";
        anotherOrder.order.approximatedSignerAmount = 50;

        await db.addAll({ "hash": indexedOrder, "another_hash": anotherOrder });
        const filters = await db.getFilters();

        expect(filters).toEqual({
            senderToken: { "eth": { max: 15, min: 10 } },
            signerToken: { "dai": { max: 50, min: 5 } }
        });
        return Promise.resolve();
    }

    async function shouldDeleteOtcOrder(db: Database) {
        const indexedOrder = forgeIndexedOrder();
        await db.addOrder(indexedOrder);

        await db.deleteOrder("hash");
        const orders = await db.getOrders();

        expect(orders).toEqual(new OrderResponse({}, new Pagination("1", "1")));
        return Promise.resolve();
    }

    async function otcOrderExists(db: Database) {
        const indexedOrder = forgeIndexedOrder();
        await db.addOrder(indexedOrder);

        const orderExists = await db.orderExists("hash");

        expect(orderExists).toBe(true);
        return Promise.resolve();
    }

    async function otcOrderDoesNotExist(db: Database) {
        const indexedOrder = forgeIndexedOrder();
        await db.addOrder(indexedOrder);

        const orderExists = await db.orderExists("unknownHash");

        expect(orderExists).toBe(false);
        return Promise.resolve();
    }

    async function addOtcOrder(db: Database) {
        const indexedOrder = forgeIndexedOrder();
        await db.addOrder(indexedOrder);

        const orderExists = await db.getOrder("hash");

        expect(orderExists).toEqual(new OrderResponse({ hash: indexedOrder }, new Pagination("1", "1")));
        return Promise.resolve();
    }

    async function renturnsNullOnUnknownHash(db: Database) {
        const indexedOrder = forgeIndexedOrder();
        await db.addOrder(indexedOrder);

        const orderExists = await db.getOrder("unknownHash");

        expect(orderExists).toEqual(new OrderResponse({}, new Pagination("1", "1")));
        return Promise.resolve();
    }

    async function hashObject(db: Database) {
        const indexedOrder = new IndexedOrder(forgeDbOrder(1653138423547), new Date(1653138423537).getTime(), "hash");

        const hash = db.generateHash(indexedOrder);

        expect(hash).toBe("5e2f80a0d08dfbfee6bf22dc0bb636694ab3a2ee59aeef1fffb1dc13b1bcc547");
        return Promise.resolve();
    }
});