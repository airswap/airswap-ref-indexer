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
        const order = new Order("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS, "id");

        await db.addOrder(order);
        const orders = await db.getorders();

        expect(orders).toEqual({ id: order });
    });

    test("Should add all & get orders", async () => {
        const order = new Order("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS, "id");
        const anotherOrder = new Order("another", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS, "another_id");

        await db.addAll({ "id": order, "another_id": anotherOrder });
        const orders = await db.getorders();

        expect(orders).toEqual({ "id": order, "another_id": anotherOrder });
    });

    test("Should edit order", async () => {
        const expected = new Order("by", "from", "to", 3, 4, TransactionStatus.DONE, "id");
        const order = new Order("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS, "id");
        await db.addOrder(order);

        await db.editOrder("id", TransactionStatus.DONE);
        const orders = await db.getorders();

        expect(orders).toEqual({ id: expected });
    });

    test("Should return true if order exists", async () => {
        const order = new Order("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS, "id");
        await db.addOrder(order);

        const orderExists = await db.orderExists("id");

        expect(orderExists).toBe(true);
    });

    test("Should return false if order does not exist", async () => {
        const order = new Order("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS, "id");
        await db.addOrder(order);

        const orderExists = await db.orderExists("unknownId");

        expect(orderExists).toBe(false);
    });

    test("Should return order", async () => {
        const order = new Order("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS, "id");
        await db.addOrder(order);

        const orderExists = await db.getOrder("id");

        expect(orderExists).toEqual(order);
    });

    test("Should not return order", async () => {
        const order = new Order("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS, "id");
        await db.addOrder(order);

        const orderExists = await db.getOrder("unknownId");

        expect(orderExists).toBe(null);
    });

    test("sha 256 does not change", () => {
        const order = new Order("by", "from", "to", 3, 4);

        const id = db.generateId(order);

        expect(id).toBe("6d9844c1f4bb9a47aea4c9752782b300085ec376e7ea90f7f966349465dda064");
    });
});