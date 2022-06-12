import { OrderResponse } from './../../model/OrderResponse';
import { Order } from '@airswap/typescript';
import { OtcOrder } from '../../model/OtcOrder';
import { AceBaseClient } from "../AcebaseClient";
import { Database } from '../Database';
import { SortField } from '../filter/SortField';
import { InMemoryDatabase } from '../InMemoryDatabase';
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

    describe('get OtcOrder by filter', () => {
        test("inMemoryDb", async () => { await getOtcOrderByFilter(inMemoryDatabase); });
        test("acebaseDb", async () => { await getOtcOrderByFilter(acebaseClient); });
    });

    describe("Should add & get OtcOrder", () => {
        test("inMemoryDb", async () => { await getAndAddOtcOrder(inMemoryDatabase); });
        test("acebaseDb", async () => { await getAndAddOtcOrder(acebaseClient); });
    });

    describe("Should set filters when adding OtcOrder", () => {
        test("inMemoryDb", async () => { await shouldAddfiltersOnOtcAdd(inMemoryDatabase); });
        test("acebaseDb", async () => { await shouldAddfiltersOnOtcAdd(acebaseClient); });
    });

    describe("Should add all & get orders", () => {
        test("inMemoryDb", async () => { await addAllAndGetOrders(inMemoryDatabase); });
        test("acebaseDb", async () => { await addAllAndGetOrders(acebaseClient); });
    });

    describe("Should delete OtcOrder", () => {
        test("inMemoryDb", async () => { await shouldDeleteOtcOrder(inMemoryDatabase); });
        test("acebaseDb", async () => { await shouldDeleteOtcOrder(acebaseClient); });
    });

    describe("Should return true if OtcOrder exists", () => {
        test("inMemoryDb", async () => { await otcOrderExists(inMemoryDatabase); });
        test("acebaseDb", async () => { await otcOrderExists(acebaseClient); });
    });

    describe("Should return false if OtcOrder does not exist", () => {
        test("inMemoryDb", async () => { await otcOrderDoesNotExist(inMemoryDatabase); });
        test("acebaseDb", async () => { await otcOrderDoesNotExist(acebaseClient); });
    });

    describe("Should return OtcOrder", () => {
        test("inMemoryDb", async () => { await addOtcOrder(inMemoryDatabase); });
        test("acebaseDb", async () => { await addOtcOrder(acebaseClient); });
    });

    describe("Should not return OtcOrder", () => {
        test("inMemoryDb", async () => { await renturnsNullOnUnknownId(inMemoryDatabase); });
        test("acebaseDb", async () => { await renturnsNullOnUnknownId(acebaseClient); });
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
            signerAmount: 2,
            senderToken: "senderToken",
            senderAmount: 1,
            v: "v",
            r: "r",
            s: "s"
        } as unknown as Order;
        const order2 = {
            nonce: "nonce",
            expiry: 1653138423537,
            signerWallet: "signerWallet",
            signerToken: "blip",
            signerAmount: 20,
            senderToken: "another",
            senderAmount: 10,
            v: "v",
            r: "r",
            s: "s"
        } as unknown as Order;
        const order3 = {
            nonce: "nonce",
            expiry: 1653138423537,
            signerWallet: "signerWallet",
            signerToken: "signerToken",
            signerAmount: 3,
            senderToken: "senderToken",
            senderAmount: 100,
            v: "v",
            r: "r",
            s: "s"
        } as unknown as Order;

        const otcOrder1 = new OtcOrder(order1, 1653138423537, "id1");
        const otcOrder2 = new OtcOrder(order2, 1653138423527, "id2");
        const otcOrder3 = new OtcOrder(order3, 1653138423517, "id3");
        await db.addOrder(otcOrder1);
        await db.addOrder(otcOrder2);
        await db.addOrder(otcOrder3);

        const ordersFromToken = await db.getOrderBy({ page: 1, signerTokens: ["signerToken"] });
        expect(ordersFromToken).toEqual(new OrderResponse({ "id1": otcOrder1, "id3": otcOrder3 }, 1));

        const anotherToken = await db.getOrderBy({ page: 1, senderTokens: ["another"] });
        expect(anotherToken).toEqual(new OrderResponse({ "id2": otcOrder2 }, 1));

        const minSignerAmountFromToken = await db.getOrderBy({ page: 1, minSignerAmount: 15 });
        expect(minSignerAmountFromToken).toEqual(new OrderResponse({ "id2": otcOrder2 }, 1));

        const maxSignerAmountFromToken = await db.getOrderBy({ page: 1, maxSignerAmount: 5 });
        expect(maxSignerAmountFromToken).toEqual(new OrderResponse({ "id1": otcOrder1, "id3": otcOrder3 }, 1));

        const minSenderAmount = await db.getOrderBy({ page: 1, minSenderAmount: 20 });
        expect(minSenderAmount).toEqual(new OrderResponse({ "id3": otcOrder3 }, 1));

        const maxSenderAmount = await db.getOrderBy({ page: 1, maxSenderAmount: 15 });
        expect(maxSenderAmount).toEqual(new OrderResponse({ "id1": otcOrder1, "id2": otcOrder2 }, 1));

        const senderAmountAsc = await db.getOrderBy({ page: 1, sortField: SortField.SENDER_AMOUNT, sortOrder: SortOrder.ASC });
        expect(senderAmountAsc).toEqual(new OrderResponse({ "id1": otcOrder1, "id2": otcOrder2, "id3": otcOrder3 }, 1));

        const senderAmountDesc = await db.getOrderBy({ page: 1, sortField: SortField.SENDER_AMOUNT, sortOrder: SortOrder.DESC });
        expect(senderAmountDesc).toEqual(new OrderResponse({ "id3": otcOrder3, "id2": otcOrder2, "id1": otcOrder1 }, 1));

        const signerAmountAsc = await db.getOrderBy({ page: 1, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.ASC });
        expect(signerAmountAsc).toEqual(new OrderResponse({ "id1": otcOrder1, "id3": otcOrder3, "id2": otcOrder2 }, 1));

        const signerAmountDesc = await db.getOrderBy({ page: 1, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.DESC });
        expect(signerAmountDesc).toEqual(new OrderResponse({ "id2": otcOrder2, "id3": otcOrder3, "id1": otcOrder1 }, 1));

        const maxAddedOn = await db.getOrderBy({ page: 1, maxAddedDate: 1653138423527 });
        expect(maxAddedOn).toEqual(new OrderResponse({ "id1": otcOrder1, "id2": otcOrder2 }, 1));

        const specificOne = await db.getOrderBy({
            page: 1,
            signerTokens: ["signerToken"],
            senderTokens: ["senderToken"],
            minSignerAmount: 0,
            maxSignerAmount: 5,
            minSenderAmount: 1,
            maxSenderAmount: 3,
        });
        expect(specificOne).toEqual(new OrderResponse({ "id1": otcOrder1 }, 1));

        return Promise.resolve();
    }

    async function getAndAddOtcOrder(db: Database) {
        const otcOrder = forgeOtcOrder();

        await db.addOrder(otcOrder);
        const orders = await db.getOrders();

        expect(orders).toEqual(new OrderResponse({ id: otcOrder }, 1));
        return Promise.resolve();
    }

    async function addAllAndGetOrders(db: Database) {
        const otcOrder = forgeOtcOrder();
        const anotherOrder = forgeOtcOrder();
        anotherOrder.id = "another_id";

        await db.addAll({ "id": otcOrder, "another_id": anotherOrder });
        const orders = await db.getOrders();

        expect(orders).toEqual(new OrderResponse({ "id": otcOrder, "another_id": anotherOrder }, 1));
        return Promise.resolve();
    }

    async function shouldAddfiltersOnOtcAdd(db: Database) {
        const otcOrder = forgeOtcOrder();
        const anotherOrder = forgeOtcOrder();
        anotherOrder.id = "another_id";
        //@ts-ignore
        anotherOrder.order.senderAmount = 15;
        //@ts-ignore
        anotherOrder.order.signerAmount = 50;

        await db.addAll({ "id": otcOrder, "another_id": anotherOrder });
        const filters = await db.getFilters();

        expect(filters).toEqual({
            senderToken: { "ETH": { max: 15, min: 10 } },
            signerToken: { "dai": { max: 50, min: 5 } }
        });
        return Promise.resolve();
    }

    async function shouldDeleteOtcOrder(db: Database) {
        const otcOrder = forgeOtcOrder();
        await db.addOrder(otcOrder);

        await db.deleteOrder("id");
        const orders = await db.getOrders();

        expect(orders).toEqual(new OrderResponse({}, 0));
        return Promise.resolve();
    }

    async function otcOrderExists(db: Database) {
        const otcOrder = forgeOtcOrder();
        await db.addOrder(otcOrder);

        const orderExists = await db.orderExists("id");

        expect(orderExists).toBe(true);
        return Promise.resolve();
    }

    async function otcOrderDoesNotExist(db: Database) {
        const otcOrder = forgeOtcOrder();
        await db.addOrder(otcOrder);

        const orderExists = await db.orderExists("unknownId");

        expect(orderExists).toBe(false);
        return Promise.resolve();
    }

    async function addOtcOrder(db: Database) {
        const otcOrder = forgeOtcOrder();
        await db.addOrder(otcOrder);

        const orderExists = await db.getOrder("id");

        expect(orderExists).toEqual(new OrderResponse({ id: otcOrder }, 1));
        return Promise.resolve();
    }

    async function renturnsNullOnUnknownId(db: Database) {
        const otcOrder = forgeOtcOrder();
        await db.addOrder(otcOrder);

        const orderExists = await db.getOrder("unknownId");

        expect(orderExists).toEqual(new OrderResponse(null, 0));
        return Promise.resolve();
    }

    async function hashObject(db: Database) {
        const otcOrder = new OtcOrder(forgeOrder(1653138423547), new Date(1653138423537).getTime(), "id");

        const id = db.generateId(otcOrder);

        expect(id).toBe("98b83b6bd932edba78e8221f783495bee4c761ea71f758f3e76bffc137699670");
        return Promise.resolve();
    }
});

function forgeOtcOrder(expectedAddedDate = new Date().getTime(), expiryDate = new Date().getTime() + 10) {
    return new OtcOrder(forgeOrder(expiryDate), expectedAddedDate, "id");
}

function forgeOrder(expiryDate: number): Order {
    return {
        nonce: "nonce",
        //@ts-ignore
        expiry: expiryDate,
        signerWallet: "signerWallet",
        signerToken: "dai",
        //@ts-ignore
        signerAmount: 5,
        senderToken: "ETH",
        //@ts-ignore
        senderAmount: 10,
        v: "v",
        r: "r",
        s: "s"
    };
}