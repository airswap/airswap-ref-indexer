import { AceBaseClient } from "../AcebaseClient";
import { Order } from './../../model/Order';
import { TransactionStatus } from './../../model/TransactionStatus';

describe("ace base implementation", () => {
    let db = new AceBaseClient("dbtest");

    beforeEach(() => {
        db = new AceBaseClient("dbtest");
    });

    afterEach(async () => {
        await db.close();
    });

    test("Should add & get order", async () => {
        const order = forgeOrder();

        await db.addOrder(order);
        const orders = await db.getOrders();

        expect(orders).toEqual({ id: order });
    });

    test("Should add all & get orders", async () => {
        const order = forgeOrder();
        const anotherOrder = new Order("from", "fromToken", "toToken", 1, 2, new Date(), TransactionStatus.IN_PROGRESS, "another_id");

        await db.addAll({ "id": order, "another_id": anotherOrder });
        const orders = await db.getOrders();

        expect(orders).toEqual({ "id": order, "another_id": anotherOrder });
    });

    test("Should edit order", async () => {
        const expected = new Order("from", "fromToken", "toToken", 1, 2, new Date(), TransactionStatus.DONE, "id");
        const order = forgeOrder();
        await db.addOrder(order);

        await db.editOrder("id", TransactionStatus.DONE);
        const orders = await db.getOrders();

        expect(orders).toEqual({ id: expected });
    });

    test("Should return true if order exists", async () => {
        const order = forgeOrder();
        await db.addOrder(order);

        const orderExists = await db.orderExists("id");

        expect(orderExists).toBe(true);
    });

    test("Should return false if order does not exist", async () => {
        const order = forgeOrder();
        await db.addOrder(order);

        const orderExists = await db.orderExists("unknownId");

        expect(orderExists).toBe(false);
    });

    test("Should return order", async () => {
        const order = forgeOrder();
        await db.addOrder(order);

        const orderExists = await db.getOrder("id");

        expect(orderExists).toEqual(order);
    });

    test("Should not return order", async () => {
        const order = forgeOrder();
        await db.addOrder(order);

        const orderExists = await db.getOrder("unknownId");

        expect(orderExists).toBe(null);
    });

    test("sha 256 does not change", () => {
        const order = new Order("from", "fromToken", "toToken", 1, 2, new Date(1653138423537));

        const id = db.generateId(order);

        expect(id).toBe("29b99e53a54a918da4a074474966d3a96360f63d7e643b62db5c1166427b9223");
    });
});

function forgeOrder() {
    return new Order("from", "fromToken", "toToken", 1, 2, new Date(), TransactionStatus.IN_PROGRESS, "id");
}
