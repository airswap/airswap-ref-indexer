import { AddressZero } from '@ethersproject/constants';
import { FullOrder, FullOrderERC20 } from '@airswap/types';
import { forgeDbOrderERC20, forgeDbOrder, forgeFullOrder, forgeIndexedOrderERC20, forgeIndexedOrder, forgeIndexedOrderResponseERC20, forgeIndexedOrderResponse } from '../../Fixtures';
import { AceBaseClient } from "../AcebaseClient";
import { Database } from '../Database';
import { InMemoryDatabase } from '../InMemoryDatabase';
import { DbOrderERC20, DbOrder } from '../../model/DbOrderTypes';
import { IndexedOrder, SortField, SortOrder } from '@airswap/types';

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

    describe('get IndexedOrder by Request Filters', () => {
        describe('erc20', () => {
            test("inMemoryDb", async () => { await getOrdersERC20By(inMemoryDatabase); });
            test("acebaseDb", async () => { await getOrdersERC20By(acebaseClient); });
        })
        describe('erc20', () => {
            test("inMemoryDb", async () => { await getOrdersBy(inMemoryDatabase); });
            test("acebaseDb", async () => { await getOrdersBy(acebaseClient); });
        })
    });

    describe("Should add & get IndexedOrder", () => {
        describe('erc20', () => {

            test("inMemoryDb", async () => { await getAndAddERC20Order(inMemoryDatabase); });
            test("acebaseDb", async () => { await getAndAddERC20Order(acebaseClient); });
        })
        describe("marketplace", () => {
            test("inMemoryDb", async () => { await getAndAddOrder(inMemoryDatabase); });
            test("acebaseDb", async () => { await getAndAddOrder(acebaseClient); });
        })
    });

    describe("Should set filters when adding IndexedOrder", () => {
        test("inMemoryDb", async () => { await shouldAddfiltersOnER20CAdd(inMemoryDatabase); });
        test("acebaseDb", async () => { await shouldAddfiltersOnER20CAdd(acebaseClient); });
    });

    describe("Should add all & get orders", () => {
        describe('erc20', () => {
            test("inMemoryDb", async () => { await addAllAndGetOrdersERC20(inMemoryDatabase); });
            test("acebaseDb", async () => { await addAllAndGetOrdersERC20(acebaseClient); });
        })

        describe('marketplace', () => {
            test("inMemoryDb", async () => { await addAllAndGetOrders(inMemoryDatabase); });
            test("acebaseDb", async () => { await addAllAndGetOrders(acebaseClient); });
        })
    });

    describe("Should delete IndexedOrder", () => {
        describe('erc20', () => {
            test("inMemoryDb", async () => { await shouldDeleteERC20Order(inMemoryDatabase); });
            test("acebaseDb", async () => { await shouldDeleteERC20Order(acebaseClient); });
        })
        describe('marketplace', () => {
            test("inMemoryDb", async () => { await shouldDeleteOrder(inMemoryDatabase); });
            test("acebaseDb", async () => { await shouldDeleteOrder(acebaseClient); });
        })
    });

    describe("Should delete expired IndexedOrder", () => {
        describe('erc20', () => {
            test("inMemoryDb", async () => { await shouldDeleteExpiredERC20Order(inMemoryDatabase); });
            test("acebaseDb", async () => { await shouldDeleteExpiredERC20Order(acebaseClient); });
        })

        describe('marketplace', () => {
            test("inMemoryDb", async () => { await shouldDeleteExpiredOrder(inMemoryDatabase); });
            test("acebaseDb", async () => { await shouldDeleteExpiredOrder(acebaseClient); });
        })
    });

    describe("Should return true if IndexedOrder erc20 exists", () => {
        describe('erc20', () => {
            test("inMemoryDb", async () => { await ERC20OrderExists(inMemoryDatabase); });
            test("acebaseDb", async () => { await ERC20OrderExists(acebaseClient); });
        })

        describe('marketplace', () => {
            test("inMemoryDb", async () => { await orderExists(inMemoryDatabase); });
            test("acebaseDb", async () => { await orderExists(acebaseClient); });
        })
    });

    describe("Should return false if IndexedOrder does not exist", () => {
        describe('erc20', () => {
            test("inMemoryDb", async () => { await ERC20OrderDoesNotExist(inMemoryDatabase); });
            test("acebaseDb", async () => { await ERC20OrderDoesNotExist(acebaseClient); });
        })

        describe('marketplace', () => {
            test("inMemoryDb", async () => { await orderDoesNotExist(inMemoryDatabase); });
            test("acebaseDb", async () => { await orderDoesNotExist(acebaseClient); });
        })
    });

    describe("Should return IndexedOrder", () => {
        describe('erc20', () => {
            test("inMemoryDb", async () => { await addERC20Order(inMemoryDatabase); });
            test("acebaseDb", async () => { await addERC20Order(acebaseClient); });
        })
        describe('marketPlace', () => {
            test("inMemoryDb", async () => { await addOrder(inMemoryDatabase); });
            test("acebaseDb", async () => { await addOrder(acebaseClient); });
        })
    });


    describe("Should not return IndexedOrder", () => {
        describe('erc20', () => {
            test("inMemoryDb", async () => { await renturnsNullOnUnknownHashERC20(inMemoryDatabase); });
            test("acebaseDb", async () => { await renturnsNullOnUnknownHashERC20(acebaseClient); });
        })
        describe('marketplace', () => {
            test("inMemoryDb", async () => { await renturnsNullOnUnknownHash(inMemoryDatabase); });
            test("acebaseDb", async () => { await renturnsNullOnUnknownHash(acebaseClient); });
        })
    });

    describe("sha 256 does not change", () => {
        test("inMemoryDb", async () => { await hashObject(inMemoryDatabase); });
        test("acebaseDb", async () => { await hashObject(acebaseClient); });
    });

    async function getOrdersERC20By(db: Database) {
        const dbOrder1: DbOrderERC20 = {
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
        const dbOrder2: DbOrderERC20 = {
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
        const dbOrder3: DbOrderERC20 = {
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
        const erc20Order1: IndexedOrder<DbOrderERC20> = { order: dbOrder1, addedOn: 1653138423537, hash: "id1" };
        const expectedERC20Order1: IndexedOrder<FullOrderERC20> = { order: order1, addedOn: 1653138423537, hash: "id1" };
        const erc20Order2: IndexedOrder<DbOrderERC20> = { order: dbOrder2, addedOn: 1653138423527, hash: "id2" }
        const erc20Order3: IndexedOrder<DbOrderERC20> = { order: dbOrder3, addedOn: 1653138423517, hash: "id3" }
        const expectedERC20Order2: IndexedOrder<FullOrderERC20> = { order: order2, addedOn: 1653138423527, hash: "id2" };
        const expectedERC20Order3: IndexedOrder<FullOrderERC20> = { order: order3, addedOn: 1653138423517, hash: "id3" };
        await db.addOrderERC20(erc20Order1);
        await db.addOrderERC20(erc20Order2);
        await db.addOrderERC20(erc20Order3);

        const ordersFromToken = await db.getOrdersERC20By({ page: 1, signerTokens: ["signerToken"] });
        expect(ordersFromToken).toEqual({
            orders: { "id1": expectedERC20Order1, "id3": expectedERC20Order3 },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 2
        });

        const anotherToken = await db.getOrdersERC20By({ page: 1, senderTokens: ["another"] });
        expect(anotherToken).toEqual({
            orders: { "id2": expectedERC20Order2 },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 1
        });

        const minSignerAmountFromToken = await db.getOrdersERC20By({ page: 1, minSignerAmount: BigInt(15) });
        expect(minSignerAmountFromToken).toEqual({
            orders: { "id2": expectedERC20Order2 },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 1
        });

        const maxSignerAmountFromToken = await db.getOrdersERC20By({ page: 1, maxSignerAmount: BigInt(5) });
        expect(maxSignerAmountFromToken).toEqual({
            orders: { "id1": expectedERC20Order1, "id3": expectedERC20Order3 },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 2
        });

        const minSenderAmount = await db.getOrdersERC20By({ page: 1, minSenderAmount: BigInt(20) });
        expect(minSenderAmount).toEqual({
            orders: { "id3": expectedERC20Order3 },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 1
        });

        const maxSenderAmount = await db.getOrdersERC20By({ page: 1, maxSenderAmount: BigInt(15) });
        expect(maxSenderAmount).toEqual({
            orders: { "id1": expectedERC20Order1, "id2": expectedERC20Order2 },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 2
        });

        const senderAmountAsc = await db.getOrdersERC20By({ page: 1, sortField: SortField.SENDER_AMOUNT, sortOrder: SortOrder.ASC });
        expect(Object.keys(senderAmountAsc.orders)).toEqual(["id1", "id2", "id3"]);

        const senderAmountDesc = await db.getOrdersERC20By({ page: 1, sortField: SortField.SENDER_AMOUNT, sortOrder: SortOrder.DESC, senderTokens: ["senderToken"] });
        expect(Object.keys(senderAmountDesc.orders)).toEqual(["id3", "id1"]);

        const signerAmountAsc = await db.getOrdersERC20By({ page: 1, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.ASC });
        expect(Object.keys(signerAmountAsc.orders)).toEqual(["id1", "id3", "id2"]);

        const signerAmountDesc = await db.getOrdersERC20By({ page: 1, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.DESC, signerTokens: ["signerToken"] });
        expect(Object.keys(signerAmountDesc.orders)).toEqual(["id3", "id1"]);

        const minSignerAmountDesc = await db.getOrdersERC20By({ page: 1, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.DESC });
        expect(Object.keys(minSignerAmountDesc.orders)).toEqual(["id2", "id3", "id1"]);

        const maxAddedOn = await db.getOrdersERC20By({ page: 1, maxAddedDate: 1653138423527 });
        expect(maxAddedOn).toEqual({
            orders: { "id1": expectedERC20Order1, "id2": expectedERC20Order2 },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 2
        });

        const specificOne = await db.getOrdersERC20By({
            page: 1,
            signerTokens: ["signerToken"],
            senderTokens: ["senderToken"],
            minSignerAmount: BigInt(0),
            maxSignerAmount: BigInt(5),
            minSenderAmount: BigInt(1),
            maxSenderAmount: BigInt(3),
        });
        expect(specificOne).toEqual({
            orders: { "id1": expectedERC20Order1, },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 1
        });

        return Promise.resolve();
    }

    async function getOrdersBy(db: Database) {
        const dbOrder1: DbOrder = forgeDbOrder(5);
        dbOrder1.signer.wallet = "aWalletAddress"
        dbOrder1.sender.wallet = "aWalletAddress"
        dbOrder1.sender.amount = "1"
        dbOrder1.sender.approximatedAmount = BigInt(1)
        dbOrder1.signer.amount = "1"
        dbOrder1.signer.approximatedAmount = BigInt(1)
        const order1: FullOrder = forgeFullOrder(5);
        order1.signer.wallet = "aWalletAddress"
        order1.sender.wallet = "aWalletAddress"
        order1.sender.amount = "1"
        order1.signer.amount = "1"

        const dbOrder2: DbOrder = forgeDbOrder(1);
        dbOrder2.sender.wallet = "anotherWalletAddress"
        dbOrder2.sender.amount = "2"
        dbOrder2.sender.approximatedAmount = BigInt(2)
        dbOrder2.signer.amount = "3"
        dbOrder2.signer.approximatedAmount = BigInt(3)
        const order2: FullOrder = forgeFullOrder(1);
        order2.sender.wallet = "anotherWalletAddress"
        order2.sender.amount = "2"
        order2.signer.amount = "3"

        const dbOrder3: DbOrder = forgeDbOrder(3);
        dbOrder3.signer.wallet = "aWalletAddress"
        dbOrder3.sender.amount = "3"
        dbOrder3.sender.approximatedAmount = BigInt(3)
        dbOrder3.signer.amount = "2"
        dbOrder3.signer.approximatedAmount = BigInt(2)
        const order3: FullOrder = forgeFullOrder(3);
        order3.signer.wallet = "aWalletAddress"
        order3.sender.amount = "3"
        order3.signer.amount = "2"

        const indexedOrder1: IndexedOrder<DbOrder> = { order: dbOrder1, addedOn: 1653138423537, hash: "id1" }
        const expectedIndexedOrder1: IndexedOrder<FullOrder> = { order: order1, addedOn: 1653138423537, hash: "id1" };
        const indexedOrder2: IndexedOrder<DbOrder> = { order: dbOrder2, addedOn: 1653138423527, hash: "id2" }
        const expectedIndexedOrder2: IndexedOrder<FullOrder> = { order: order2, addedOn: 1653138423527, hash: "id2" };
        const indexedOrder3: IndexedOrder<DbOrder> = { order: dbOrder3, addedOn: 1653138423517, hash: "id3" }
        const expectedIndexedOrder3: IndexedOrder<FullOrder> = { order: order3, addedOn: 1653138423517, hash: "id3" };
        await db.addOrder(indexedOrder1);
        await db.addOrder(indexedOrder2);
        await db.addOrder(indexedOrder3);

        const ordersFromSignerAddress = await db.getOrdersBy({ page: 1, signerAddress: "aWalletAddress" });
        expect(ordersFromSignerAddress).toEqual({
            orders: { "id1": expectedIndexedOrder1, "id3": expectedIndexedOrder3 },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 2
        });

        const ordersFromOtherSenderAddress = await db.getOrdersBy({ page: 1, senderAddress: "anotherWalletAddress" });
        expect(ordersFromOtherSenderAddress).toEqual({
            orders: { "id2": expectedIndexedOrder2 },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 1
        });

        const senderAmountAsc = await db.getOrdersBy({ page: 1, sortField: SortField.SENDER_AMOUNT, sortOrder: SortOrder.ASC });
        expect(Object.keys(senderAmountAsc.orders)).toEqual(["id1", "id2", "id3"]);

        const senderAmountDesc = await db.getOrdersBy({ page: 1, sortField: SortField.SENDER_AMOUNT, sortOrder: SortOrder.DESC, signerAddress: "aWalletAddress" });
        expect(Object.keys(senderAmountDesc.orders)).toEqual(["id3", "id1"]);

        const signerAmountAsc = await db.getOrdersBy({ page: 1, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.ASC });
        expect(Object.keys(signerAmountAsc.orders)).toEqual(["id1", "id3", "id2"]);

        const signerAmountDesc = await db.getOrdersBy({ page: 1, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.DESC, signerAddress: "aWalletAddress" });
        expect(Object.keys(signerAmountDesc.orders)).toEqual(["id3", "id1"]);

        const minSignerAmountDesc = await db.getOrdersBy({ page: 1, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.DESC });
        expect(Object.keys(minSignerAmountDesc.orders)).toEqual(["id2", "id3", "id1"]);

        const orderByExpiryASC = await db.getOrdersBy({ page: 1, sortField: SortField.EXPIRY, sortOrder: SortOrder.ASC });
        expect(Object.keys(orderByExpiryASC.orders)).toEqual(["id2", "id3", "id1"]);
        const orderByExpiryDESC = await db.getOrdersBy({ page: 1, sortField: SortField.EXPIRY, sortOrder: SortOrder.DESC });
        expect(Object.keys(orderByExpiryDESC.orders)).toEqual(["id1", "id3", "id2"]);

        const specificOne = await db.getOrdersBy({
            page: 1,
            signerAddress: "aWalletAddress",
            senderAddress: "aWalletAddress",
        });
        expect(specificOne).toEqual({
            orders: { "id1": expectedIndexedOrder1, },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 1
        });

        return Promise.resolve();
    }

    async function getAndAddERC20Order(db: Database) {
        const indexedOrder = forgeIndexedOrderERC20(addedOn, expiryDate);
        const expectedIndexedOrder = forgeIndexedOrderResponseERC20(addedOn, expiryDate);

        await db.addOrderERC20(indexedOrder);
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

    async function getAndAddOrder(db: Database) {
        const indexedOrder = forgeIndexedOrder(addedOn, expiryDate);
        const expectedIndexedOrder = forgeIndexedOrderResponse(addedOn, expiryDate);

        await db.addOrder(indexedOrder);
        const orders = await db.getOrders();

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

    async function addAllAndGetOrdersERC20(db: Database) {
        const indexedOrder = forgeIndexedOrderERC20(addedOn, expiryDate);
        const anotherOrder = forgeIndexedOrderERC20(addedOn, expiryDate);
        const expectedIndexedOrder = forgeIndexedOrderResponseERC20(addedOn, expiryDate);
        const expectedAnotherOrder = forgeIndexedOrderResponseERC20(addedOn, expiryDate);
        anotherOrder.hash = "another_hash";
        expectedAnotherOrder.hash = "another_hash";

        await db.addAllOrderERC20({ "hash": indexedOrder, "another_hash": anotherOrder });
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

    async function addAllAndGetOrders(db: Database) {
        const indexedOrder = forgeIndexedOrder(addedOn, expiryDate);
        const anotherOrder = forgeIndexedOrder(addedOn, expiryDate);
        const expectedIndexedOrder = forgeIndexedOrderResponse(addedOn, expiryDate);
        const expectedAnotherOrder = forgeIndexedOrderResponse(addedOn, expiryDate);
        anotherOrder.hash = "another_hash";
        expectedAnotherOrder.hash = "another_hash";

        await db.addAllOrder({ "hash": indexedOrder, "another_hash": anotherOrder });
        const orders = await db.getOrders();

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

    async function shouldAddfiltersOnER20CAdd(db: Database) {
        const indexedOrder = forgeIndexedOrderERC20(addedOn, expiryDate);
        const anotherOrder = forgeIndexedOrderERC20(addedOn, expiryDate);
        anotherOrder.hash = "another_hash";
        (anotherOrder.order as DbOrderERC20).senderAmount = "15";
        (anotherOrder.order as DbOrderERC20).approximatedSenderAmount = BigInt(15);
        (anotherOrder.order as DbOrderERC20).signerAmount = "50";
        (anotherOrder.order as DbOrderERC20).approximatedSignerAmount = BigInt(50);

        await db.addAllOrderERC20({ "hash": indexedOrder, "another_hash": anotherOrder });
        const filters = await db.getFiltersERC20();

        expect(filters).toEqual({
            senderToken: { "0x0000000000000000000000000000000000000000": { max: BigInt(15), min: BigInt(10) } },
            signerToken: { "0x0000000000000000000000000000000000000000": { max: BigInt(50), min: BigInt(5) } }
        });
        return Promise.resolve();
    }

    async function shouldDeleteERC20Order(db: Database) {
        const indexedOrder = forgeIndexedOrderERC20(addedOn, expiryDate);
        await db.addOrderERC20(indexedOrder);

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

    async function shouldDeleteOrder(db: Database) {
        const indexedOrder: IndexedOrder<DbOrder> = forgeIndexedOrder(addedOn, expiryDate);
        await db.addOrder(indexedOrder);

        await db.deleteOrder("nonce", AddressZero);
        const orders = await db.getOrders();

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

    async function shouldDeleteExpiredERC20Order(db: Database) {
        const indexedOrder: IndexedOrder<DbOrderERC20> = forgeIndexedOrderERC20(1000, 2000, 'hash1');
        const indexedOrder2 = forgeIndexedOrderERC20(1000, 1000, 'hash2');
        const indexedOrder3 = forgeIndexedOrderERC20(1000, 500000, 'hash3');
        await db.addOrderERC20(indexedOrder);
        await db.addOrderERC20(indexedOrder2);
        await db.addOrderERC20(indexedOrder3);
        const expected = forgeIndexedOrderResponseERC20(1000, 500000, 'hash3');

        await db.deleteExpiredOrderERC20(300);
        const orders = await db.getOrdersERC20();

        expect(orders).toEqual({
            orders: { "hash3": expected },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 1
        });
        return Promise.resolve();
    }

    async function shouldDeleteExpiredOrder(db: Database) {
        const indexedOrder: IndexedOrder<DbOrder> = forgeIndexedOrder(1000, 2000, 'hash1');
        const indexedOrder2 = forgeIndexedOrder(1000, 1000, 'hash2');
        const indexedOrder3 = forgeIndexedOrder(1000, 500000, 'hash3');
        await db.addOrder(indexedOrder);
        await db.addOrder(indexedOrder2);
        await db.addOrder(indexedOrder3);
        const expected = forgeIndexedOrderResponse(1000, 500000, 'hash3');

        await db.deleteExpiredOrder(300);
        const orders = await db.getOrders();

        expect(orders).toEqual({
            orders: { "hash3": expected },
            pagination: {
                first: "1",
                last: "1"
            },
            ordersForQuery: 1
        });
        return Promise.resolve();
    }

    async function ERC20OrderExists(db: Database) {
        const indexedOrder = forgeIndexedOrderERC20(addedOn, expiryDate);
        await db.addOrderERC20(indexedOrder);

        const orderExists = await db.orderERC20Exists("hash");

        expect(orderExists).toBe(true);
        return Promise.resolve();
    }

    async function orderExists(db: Database) {
        const indexedOrder = forgeIndexedOrder(addedOn, expiryDate);
        await db.addOrder(indexedOrder);

        const orderExists = await db.orderExists("hash");

        expect(orderExists).toBe(true);
        return Promise.resolve();
    }

    async function ERC20OrderDoesNotExist(db: Database) {
        const indexedOrder = forgeIndexedOrderERC20(addedOn, expiryDate);
        await db.addOrderERC20(indexedOrder);

        const orderExists = await db.orderERC20Exists("unknownHash");

        expect(orderExists).toBe(false);
        return Promise.resolve();
    }

    async function orderDoesNotExist(db: Database) {
        const indexedOrder = forgeIndexedOrder(addedOn, expiryDate);
        await db.addOrder(indexedOrder);

        const orderExists = await db.orderExists("unknownHash");

        expect(orderExists).toBe(false);
        return Promise.resolve();
    }

    async function addERC20Order(db: Database) {
        const indexedOrder = forgeIndexedOrderERC20(addedOn, expiryDate);
        const expectedIndexedOrder = forgeIndexedOrderResponseERC20(addedOn, expiryDate);
        await db.addOrderERC20(indexedOrder);

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

    async function addOrder(db: Database) {
        const indexedOrder = forgeIndexedOrder(addedOn, expiryDate);
        const expectedIndexedOrder = forgeIndexedOrderResponse(addedOn, expiryDate);
        await db.addOrder(indexedOrder);

        const orderExists = await db.getOrder("hash");

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

    async function renturnsNullOnUnknownHashERC20(db: Database) {
        const indexedOrder = forgeIndexedOrderERC20(addedOn, expiryDate);
        await db.addOrderERC20(indexedOrder);

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

    async function renturnsNullOnUnknownHash(db: Database) {
        const indexedOrder = forgeIndexedOrder(addedOn, expiryDate);
        await db.addOrder(indexedOrder);

        const orderExists = await db.getOrder("unknownHash");

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
        const indexedOrder = { order: forgeDbOrderERC20(1653138423547), addedOn: new Date(1653138423537).getTime(), hash: "hash" }

        const hash = db.generateHash(indexedOrder);

        expect(hash).toBe("5cfd1a4837f91f4b690c739ecf08b26d3cfa5f69e0891a108df50b1fd0a0d892");
        return Promise.resolve();
    }
});