import { Order } from '@airswap/typescript';
import { AceBaseClient } from "../AcebaseClient";
import { OtcOrder } from '../../model/OtcOrder';
import { InMemoryDatabase } from '../InMemoryDatabase';
import { Database } from '../Database';

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
        test("inMemoryDb", async () => { await getOtcOrderByFlter(inMemoryDatabase); });
        test("acebaseDb", async () => { await getOtcOrderByFlter(acebaseClient); });
    });

    describe("Should add & get OtcOrder", () => {
        test("inMemoryDb", async () => { await getAndAddOtcOrder(inMemoryDatabase); });
        test("acebaseDb", async () => { await getAndAddOtcOrder(acebaseClient); });
    });

    describe("Should add all & get orders", () => {
        test("inMemoryDb", async () => { await addAllAndGetOders(acebaseClient); });
        test("acebaseDb", async () => { await addAllAndGetOders(inMemoryDatabase); });
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

    async function getOtcOrderByFlter(db: Database) {
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
            signerAmount: 2,
            senderToken: "senderToken",
            senderAmount: 100,
            v: "v",
            r: "r",
            s: "s"
        } as unknown as Order;

        const otcOrder1 = new OtcOrder(order1, 1653138423537, "id1");
        const otcOrder2 = new OtcOrder(order2, 1653138423537, "id2");
        const otcOrder3 = new OtcOrder(order3, 1653138423537, "id3");
        await db.addOrder(otcOrder1);
        await db.addOrder(otcOrder2);
        await db.addOrder(otcOrder3);

        const ordersFromToken = await db.getOrderBy("signerToken");
        expect(ordersFromToken).toEqual({ "id1": otcOrder1, "id3": otcOrder3 });

        const anotherToken = await db.getOrderBy(undefined, "another");
        expect(anotherToken).toEqual({ "id2": otcOrder2 });

        const minSignerAmountFromToken = await db.getOrderBy(undefined, undefined, 15);
        expect(minSignerAmountFromToken).toEqual({ "id2": otcOrder2 });

        const maxSignerAmountFromToken = await db.getOrderBy(undefined, undefined, undefined, 5);
        expect(maxSignerAmountFromToken).toEqual({ "id1": otcOrder1, "id3": otcOrder3 });

        const minSenderAmount = await db.getOrderBy(undefined, undefined, undefined, undefined, 20);
        expect(minSenderAmount).toEqual({ "id3": otcOrder3 });

        const maxSenderAmount = await db.getOrderBy(undefined, undefined, undefined, undefined, undefined, 15);
        expect(maxSenderAmount).toEqual({ "id1": otcOrder1, "id2": otcOrder2 });

        const specificOne = await db.getOrderBy("signerToken", "senderToken", 0, 5, 1, 3);
        expect(specificOne).toEqual({ "id1": otcOrder1 });

        return Promise.resolve();
    }

    async function getAndAddOtcOrder(db: Database) {
        const otcOrder = forgeOtcOrder();

        await db.addOrder(otcOrder);
        const orders = await db.getOrders();

        expect(orders).toEqual({ id: otcOrder });
        return Promise.resolve();
    }

    async function addAllAndGetOders(db: Database) {
        const otcOrder = forgeOtcOrder();
        const anotherOrder = forgeOtcOrder();
        anotherOrder.id = "another_id";

        await db.addAll({ "id": otcOrder, "another_id": anotherOrder });
        const orders = await db.getOrders();

        expect(orders).toEqual({ "id": otcOrder, "another_id": anotherOrder });
        return Promise.resolve();
    }

    async function shouldDeleteOtcOrder(db: Database) {
        const otcOrder = forgeOtcOrder();
        await db.addOrder(otcOrder);

        await db.deleteOrder("id");
        const orders = await db.getOrders();

        expect(orders).toEqual({});
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

        expect(orderExists).toEqual({id: otcOrder});
        return Promise.resolve();
    }

    async function renturnsNullOnUnknownId(db: Database) {
        const otcOrder = forgeOtcOrder();
        await db.addOrder(otcOrder);

        const orderExists = await db.getOrder("unknownId");

        expect(orderExists).toBe(null);
        return Promise.resolve();
    }

    async function hashObject(db: Database) {
        const otcOrder = new OtcOrder(forgeOrder("1653138423547"), new Date(1653138423537).getTime(), "id");

        const id = db.generateId(otcOrder);

        expect(id).toBe("7ce9b3e1b35f046bbafc49999f784471a36e7e3e0910d524414ec31eac2af74d");
        return Promise.resolve();
    }
});

function forgeOtcOrder(expectedAddedDate = new Date().getTime(), expiryDate = new Date().getTime() + 10) {
    return new OtcOrder(forgeOrder(`${expiryDate}`), expectedAddedDate, "id");
}

function forgeOrder(expiryDate: string): Order {
    return {
        nonce: "nonce",
        expiry: expiryDate,
        signerWallet: "signerWallet",
        signerToken: "dai",
        signerAmount: "5",
        senderToken: "ETH",
        senderAmount: "10",
        v: "v",
        r: "r",
        s: "s"
    };
}