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
        await acebaseClient.connect("dbtest", true, '.');
        await inMemoryDatabase.connect("dbtest", true, '.');
    });

    beforeEach(async () => {
        await inMemoryDatabase.erase();
        await acebaseClient.erase();
    });

    afterAll(async () => {
        await inMemoryDatabase.close();
        await acebaseClient.close();
    });

    describe('get by Request Filters', () => {
        describe('orderErc20', () => {
            test("inMemoryDb", async () => { await getOrdersERC20By(inMemoryDatabase); });
            test("acebaseDb", async () => { await getOrdersERC20By(acebaseClient); });
        })
        describe('order', () => {
            test("inMemoryDb", async () => { await getOrdersBy(inMemoryDatabase); });
            test("acebaseDb", async () => { await getOrdersBy(acebaseClient); });
        })
    });

    describe("Should add & get", () => {
        describe('orderErc20', () => {
            test("inMemoryDb", async () => { await getAndAddERC20Order(inMemoryDatabase); });
            test("acebaseDb", async () => { await getAndAddERC20Order(acebaseClient); });
        })
        describe("Order", () => {
            test("inMemoryDb", async () => { await getAndAddOrder(inMemoryDatabase); });
            test("acebaseDb", async () => { await getAndAddOrder(acebaseClient); });
        })
    });

    describe("Should set filters when adding orderErc20", () => {
        test("inMemoryDb", async () => { await shouldAddfiltersOnER20CAdd(inMemoryDatabase); });
        test("acebaseDb", async () => { await shouldAddfiltersOnER20CAdd(acebaseClient); });
    });

    describe("Should add all & get", () => {
        describe('OrderErc20', () => {
            test("inMemoryDb", async () => { await addAllAndGetOrdersERC20(inMemoryDatabase); });
            test("acebaseDb", async () => { await addAllAndGetOrdersERC20(acebaseClient); });
        })

        describe('Order', () => {
            test("inMemoryDb", async () => { await addAllAndGetOrders(inMemoryDatabase); });
            test("acebaseDb", async () => { await addAllAndGetOrders(acebaseClient); });
        })
    });

    describe("Should delete", () => {
        describe('orderErc20', () => {
            test("inMemoryDb", async () => { await shouldDeleteERC20Order(inMemoryDatabase); });
            test("acebaseDb", async () => { await shouldDeleteERC20Order(acebaseClient); });
        })
        describe('Order', () => {
            test("inMemoryDb", async () => { await shouldDeleteOrder(inMemoryDatabase); });
            test("acebaseDb", async () => { await shouldDeleteOrder(acebaseClient); });
        })
    });

    describe("Should delete expired", () => {
        describe('orderErc20', () => {
            test("inMemoryDb", async () => { await shouldDeleteExpiredERC20Order(inMemoryDatabase); });
            test("acebaseDb", async () => { await shouldDeleteExpiredERC20Order(acebaseClient); });
        })

        describe('Order', () => {
            test("inMemoryDb", async () => { await shouldDeleteExpiredOrder(inMemoryDatabase); });
            test("acebaseDb", async () => { await shouldDeleteExpiredOrder(acebaseClient); });
        })
    });

    describe("Should return true if exists", () => {
        describe('orderErc20', () => {
            test("inMemoryDb", async () => { await ERC20OrderExists(inMemoryDatabase); });
            test("acebaseDb", async () => { await ERC20OrderExists(acebaseClient); });
        })

        describe('Order', () => {
            test("inMemoryDb", async () => { await orderExists(inMemoryDatabase); });
            test("acebaseDb", async () => { await orderExists(acebaseClient); });
        })
    });

    describe("Should return false if does not exist", () => {
        describe('orderErc20', () => {
            test("inMemoryDb", async () => { await ERC20OrderDoesNotExist(inMemoryDatabase); });
            test("acebaseDb", async () => { await ERC20OrderDoesNotExist(acebaseClient); });
        })

        describe('Order', () => {
            test("inMemoryDb", async () => { await orderDoesNotExist(inMemoryDatabase); });
            test("acebaseDb", async () => { await orderDoesNotExist(acebaseClient); });
        })
    });

    describe("Should return", () => {
        describe('orderErc20', () => {
            test("inMemoryDb", async () => { await addERC20Order(inMemoryDatabase); });
            test("acebaseDb", async () => { await addERC20Order(acebaseClient); });
        })
        describe('Order', () => {
            test("inMemoryDb", async () => { await addOrder(inMemoryDatabase); });
            test("acebaseDb", async () => { await addOrder(acebaseClient); });
        })
    });


    describe("Should not return", () => {
        describe('orderErc20', () => {
            test("inMemoryDb", async () => { await renturnsNullOnUnknownHashERC20(inMemoryDatabase); });
            test("acebaseDb", async () => { await renturnsNullOnUnknownHashERC20(acebaseClient); });
        })
        describe('Order', () => {
            test("inMemoryDb", async () => { await renturnsNullOnUnknownHash(inMemoryDatabase); });
            test("acebaseDb", async () => { await renturnsNullOnUnknownHash(acebaseClient); });
        })
    });

    describe("sha 256 does not change", () => {
        describe("orderErc20", () => {
            test("inMemoryDb", async () => { await hashOrderERC20(inMemoryDatabase); });
            test("acebaseDb", async () => { await hashOrderERC20(acebaseClient); });
        })
        describe("Order", () => {
            test("inMemoryDb", async () => { await hashOrder(inMemoryDatabase); });
            test("acebaseDb", async () => { await hashOrder(acebaseClient); });
        })
    });

    describe("Specific Order", () => {
        describe("tokenId should be unique", () => {
            test("inMemoryDb", async () => { await tokenIDIsUnique(inMemoryDatabase); });
            test("acebaseDb", async () => { await tokenIDIsUnique(acebaseClient); });
        })
    });

    async function getOrdersERC20By(db: Database) {
        const dbOrder1: DbOrderERC20 = {
            nonce: "123",
            expiry: 1653138423535,
            signerWallet: "signerWallet1",
            signerToken: "signerToken",
            signerAmount: "2",
            approximatedSignerAmount: BigInt(2),
            senderToken: "senderToken",
            senderAmount: "1",
            approximatedSenderAmount: BigInt(1),
            v: "v",
            r: "r",
            s: "s",
            chainId: 15,
            swapContract: AddressZero,
            protocolFee: "4",
            senderWallet: "senderWallet1",
        };
        const order1: FullOrderERC20 = {
            nonce: "123",
            expiry: "1653138423535",
            signerWallet: "signerWallet1",
            signerToken: "signerToken",
            signerAmount: "2",
            senderToken: "senderToken",
            senderAmount: "1",
            v: "v",
            r: "r",
            s: "s",
            protocolFee: "4",
            senderWallet: "senderWallet1",
            chainId: 15,
            swapContract: AddressZero
        };
        const dbOrder2: DbOrderERC20 = {
            nonce: "124",
            expiry: 1653138423536,
            signerWallet: "signerWallet2",
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
            senderWallet: "senderWallet2",
        };
        const order2: FullOrderERC20 = {
            nonce: "124",
            expiry: "1653138423536",
            signerWallet: "signerWallet2",
            signerToken: "blip",
            signerAmount: "20",
            senderToken: "another",
            senderAmount: "10",
            v: "v",
            r: "r",
            s: "s",
            protocolFee: "4",
            senderWallet: "senderWallet2",
            chainId: 5,
            swapContract: AddressZero
        };
        const dbOrder3: DbOrderERC20 = {
            nonce: "1",
            expiry: 1653138423537,
            signerWallet: "signerWallet3",
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
            senderWallet: "senderWallet3",
        };
        const order3: FullOrderERC20 = {
            nonce: "1",
            expiry: "1653138423537",
            signerWallet: "signerWallet3",
            signerToken: "signerToken",
            signerAmount: "3",
            senderToken: "senderToken",
            senderAmount: "100",
            v: "v",
            r: "r",
            s: "s",
            protocolFee: "4",
            senderWallet: "senderWallet3",
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

        const ordersFromToken = await db.getOrdersERC20By({ offset: 0, limit: 10, signerTokens: ["signerToken"] });
        expect(ordersFromToken).toEqual({
            orders: { "id1": expectedERC20Order1, "id3": expectedERC20Order3 },
            pagination: {
                limit: 10,
                offset: 0,
                total: 2
            },
        });

        const anotherToken = await db.getOrdersERC20By({ offset: 0, limit: 10, senderTokens: ["another"] });
        expect(anotherToken).toEqual({
            orders: { "id2": expectedERC20Order2 },
            pagination: {
                limit: 10,
                offset: 0,
                total: 1
            },
        });

        const minSignerAmountFromToken = await db.getOrdersERC20By({ offset: 0, limit: 10, signerMinAmount: BigInt(15) });
        expect(minSignerAmountFromToken).toEqual({
            orders: { "id2": expectedERC20Order2 },
            pagination: {
                limit: 10,
                offset: 0,
                total: 1
            },
        });

        const maxSignerAmountFromToken = await db.getOrdersERC20By({ offset: 0, limit: 10, signerMaxAmount: BigInt(5) });
        expect(maxSignerAmountFromToken).toEqual({
            orders: { "id1": expectedERC20Order1, "id3": expectedERC20Order3 },
            pagination: {
                limit: 10,
                offset: 0,
                total: 2
            },
        });

        const minSenderAmount = await db.getOrdersERC20By({ offset: 0, limit: 10, senderMinAmount: BigInt(20) });
        expect(minSenderAmount).toEqual({
            orders: { "id3": expectedERC20Order3 },
            pagination: {
                limit: 10,
                offset: 0,
                total: 1
            },
        });

        const maxSenderAmount = await db.getOrdersERC20By({ offset: 0, limit: 10, senderMaxAmount: BigInt(15) });
        expect(maxSenderAmount).toEqual({
            orders: { "id1": expectedERC20Order1, "id2": expectedERC20Order2 },
            pagination: {
                limit: 10,
                offset: 0,
                total: 2
            },
        });

        const senderAmountAsc = await db.getOrdersERC20By({ offset: 0, limit: 10, sortField: SortField.SENDER_AMOUNT, sortOrder: SortOrder.ASC });
        expect(Object.keys(senderAmountAsc.orders)).toEqual(["id1", "id2", "id3"]);

        const senderAmountDesc = await db.getOrdersERC20By({ offset: 0, limit: 10, sortField: SortField.SENDER_AMOUNT, sortOrder: SortOrder.DESC, senderTokens: ["senderToken"] });
        expect(Object.keys(senderAmountDesc.orders)).toEqual(["id3", "id1"]);

        const signerAmountAsc = await db.getOrdersERC20By({ offset: 0, limit: 10, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.ASC });
        expect(Object.keys(signerAmountAsc.orders)).toEqual(["id1", "id3", "id2"]);

        const signerAmountDesc = await db.getOrdersERC20By({ offset: 0, limit: 10, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.DESC, signerTokens: ["signerToken"] });
        expect(Object.keys(signerAmountDesc.orders)).toEqual(["id3", "id1"]);

        const minSignerAmountDesc = await db.getOrdersERC20By({ offset: 0, limit: 10, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.DESC });
        expect(Object.keys(minSignerAmountDesc.orders)).toEqual(["id2", "id3", "id1"]);

        const expiryAsc = await db.getOrdersERC20By({ offset: 0, limit: 10, sortField: SortField.EXPIRY, sortOrder: SortOrder.ASC });
        expect(Object.keys(expiryAsc.orders)).toEqual(["id1", "id2", "id3"]);

        const expiryDesc = await db.getOrdersERC20By({ offset: 0, limit: 10, sortField: SortField.EXPIRY, sortOrder: SortOrder.DESC });
        expect(Object.keys(expiryDesc.orders)).toEqual(["id3", "id2", "id1"]);

        const orderByNonceDESC = await db.getOrdersERC20By({ offset: 0, limit: 10, sortField: SortField.NONCE, sortOrder: SortOrder.DESC });
        expect(Object.keys(orderByNonceDESC.orders)).toEqual(["id2", "id1", "id3"]);

        const orderByNonceASC = await db.getOrdersERC20By({ offset: 0, limit: 10, sortField: SortField.NONCE, sortOrder: SortOrder.ASC });
        expect(Object.keys(orderByNonceASC.orders)).toEqual(["id3", "id1", "id2"]);

        const specificSignerWallet = await db.getOrdersERC20By({ offset: 0, limit: 10, signerWallet: order1.signerWallet });
        expect(Object.keys(specificSignerWallet.orders)).toEqual(["id1"]);

        const specifiSenderWallet = await db.getOrdersERC20By({ offset: 0, limit: 10, senderWallet: order3.senderWallet });
        expect(Object.keys(specifiSenderWallet.orders)).toEqual(["id3"]);

        const byNonce = await db.getOrdersERC20By({ offset: 0, limit: 10, nonce: "123" });
        expect(Object.keys(byNonce.orders)).toEqual(["id1"]);

        const byExcludedNonce = await db.getOrdersERC20By({ offset: 0, limit: 10, excludeNonces: ["123"] });
        expect(Object.keys(byExcludedNonce.orders)).toEqual(["id3", "id2"]);

        const byChainId = await db.getOrdersERC20By({ offset: 0, limit: 10, chainId: 15 });
        expect(Object.keys(byChainId.orders)).toEqual(["id1"]);

        const specificOne = await db.getOrdersERC20By({
            offset: 0, limit: 10,
            signerTokens: ["signerToken"],
            senderTokens: ["senderToken"],
            signerMinAmount: BigInt(0),
            signerMaxAmount: BigInt(5),
            senderMinAmount: BigInt(1),
            senderMaxAmount: BigInt(3),
        });
        expect(specificOne).toEqual({
            orders: { "id1": expectedERC20Order1, },
            pagination: {
                limit: 10,
                offset: 0,
                total: 1
            },
        });

        return Promise.resolve();
    }

    async function getOrdersBy(db: Database) {
        const dbOrder1: DbOrder = forgeDbOrder(5);
        dbOrder1.nonce = "123"
        dbOrder1.chainId = 15
        dbOrder1.sender.wallet = "aWalletAddress"
        dbOrder1.sender.amount = "1"
        dbOrder1.sender.approximatedAmount = BigInt(1)
        dbOrder1.sender.token = "senderToken1"
        dbOrder1.signer.wallet = "aWalletAddress"
        dbOrder1.signer.amount = "1"
        dbOrder1.signer.id = "1"
        dbOrder1.signer.approximatedAmount = BigInt(1)
        dbOrder1.signer.token = "signerToken1"
        const order1: FullOrder = forgeFullOrder(5);
        order1.nonce = "123"
        order1.chainId = 15
        order1.signer.wallet = "aWalletAddress"
        order1.signer.amount = "1"
        order1.signer.id = "1"
        order1.signer.token = "signerToken1"
        order1.sender.wallet = "aWalletAddress"
        order1.sender.amount = "1"
        order1.sender.token = "senderToken1"

        const dbOrder2: DbOrder = forgeDbOrder(1);
        dbOrder2.nonce = "124"
        dbOrder2.sender.wallet = "anotherWalletAddress"
        dbOrder2.sender.amount = "2"
        dbOrder2.sender.approximatedAmount = BigInt(2)
        dbOrder2.sender.token = "senderToken2"
        dbOrder2.sender.id = "aTokenId"
        dbOrder2.signer.amount = "3"
        dbOrder2.signer.id = "3"
        dbOrder2.signer.approximatedAmount = BigInt(3)
        dbOrder2.signer.token = "signerToken2"
        const order2: FullOrder = forgeFullOrder(1);
        order2.nonce = "124"
        order2.sender.wallet = "anotherWalletAddress"
        order2.sender.amount = "2"
        order2.sender.token = "senderToken2"
        order2.sender.id = "aTokenId"
        order2.signer.amount = "3"
        order2.signer.id = "3"
        order2.signer.token = "signerToken2"

        const dbOrder3: DbOrder = forgeDbOrder(3);
        dbOrder3.nonce = "1"
        dbOrder3.sender.amount = "3"
        dbOrder3.sender.approximatedAmount = BigInt(3)
        dbOrder3.sender.token = "senderToken3"
        dbOrder3.signer.wallet = "aWalletAddress"
        dbOrder3.signer.amount = "2"
        dbOrder3.signer.approximatedAmount = BigInt(2)
        dbOrder3.signer.token = "signerToken3"
        dbOrder3.signer.id = "aTokenId"
        const order3: FullOrder = forgeFullOrder(3);
        order3.nonce = "1"
        order3.sender.amount = "3"
        order3.sender.token = "senderToken3"
        order3.signer.wallet = "aWalletAddress"
        order3.signer.amount = "2"
        order3.signer.token = "signerToken3"
        order3.signer.id = "aTokenId"

        const indexedOrder1: IndexedOrder<DbOrder> = { order: dbOrder1, addedOn: 1653138423537, hash: "id1" }
        const expectedIndexedOrder1: IndexedOrder<FullOrder> = { order: order1, addedOn: 1653138423537, hash: "id1" };
        const indexedOrder2: IndexedOrder<DbOrder> = { order: dbOrder2, addedOn: 1653138423527, hash: "id2" }
        const expectedIndexedOrder2: IndexedOrder<FullOrder> = { order: order2, addedOn: 1653138423527, hash: "id2" };
        const indexedOrder3: IndexedOrder<DbOrder> = { order: dbOrder3, addedOn: 1653138423517, hash: "id3" }
        const expectedIndexedOrder3: IndexedOrder<FullOrder> = { order: order3, addedOn: 1653138423517, hash: "id3" };
        await db.addOrder(indexedOrder1);
        await db.addOrder(indexedOrder2);
        await db.addOrder(indexedOrder3);

        const ordersFromSignerAddress = await db.getOrdersBy({ offset: 0, limit: 10, signerWallet: "aWalletAddress" });
        expect(ordersFromSignerAddress).toEqual({
            orders: { "id1": expectedIndexedOrder1, "id3": expectedIndexedOrder3 },
            pagination: {
                limit: 10,
                offset: 0,
                total: 2,
            }
        });

        const ordersFromOtherSenderAddress = await db.getOrdersBy({ offset: 0, limit: 10, senderWallet: "anotherWalletAddress" });
        expect(ordersFromOtherSenderAddress).toEqual({
            orders: { "id2": expectedIndexedOrder2 },
            pagination: {
                limit: 10,
                offset: 0,
                total: 1,
            }
        });

        const senderAmountAsc = await db.getOrdersBy({ offset: 0, limit: 10, sortField: SortField.SENDER_AMOUNT, sortOrder: SortOrder.ASC });
        expect(Object.keys(senderAmountAsc.orders)).toEqual(["id1", "id2", "id3"]);

        const senderAmountDesc = await db.getOrdersBy({ offset: 0, limit: 10, sortField: SortField.SENDER_AMOUNT, sortOrder: SortOrder.DESC });
        expect(Object.keys(senderAmountDesc.orders)).toEqual(["id3", "id2", "id1"]);

        const signerAmountAsc = await db.getOrdersBy({ offset: 0, limit: 10, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.ASC });
        expect(Object.keys(signerAmountAsc.orders)).toEqual(["id1", "id3", "id2"]);

        const signerAmountDesc = await db.getOrdersBy({ offset: 0, limit: 10, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.DESC });
        expect(Object.keys(signerAmountDesc.orders)).toEqual(["id2", "id3", "id1"]);

        const orderByExpiryASC = await db.getOrdersBy({ offset: 0, limit: 10, sortField: SortField.EXPIRY, sortOrder: SortOrder.ASC });
        expect(Object.keys(orderByExpiryASC.orders)).toEqual(["id2", "id3", "id1"]);

        const orderByExpiryDESC = await db.getOrdersBy({ offset: 0, limit: 10, sortField: SortField.EXPIRY, sortOrder: SortOrder.DESC });
        expect(Object.keys(orderByExpiryDESC.orders)).toEqual(["id1", "id3", "id2"]);

        const orderByNonceDESC = await db.getOrdersBy({ offset: 0, limit: 10, sortField: SortField.NONCE, sortOrder: SortOrder.DESC });
        expect(Object.keys(orderByNonceDESC.orders)).toEqual(["id2", "id1", "id3"]);

        const orderByNonceASC = await db.getOrdersBy({ offset: 0, limit: 10, sortField: SortField.NONCE, sortOrder: SortOrder.ASC });
        expect(Object.keys(orderByNonceASC.orders)).toEqual(["id3", "id1", "id2"]);

        const minSenderAmountDesc = await db.getOrdersBy({ offset: 0, limit: 10, sortField: SortField.SENDER_AMOUNT, sortOrder: SortOrder.DESC, senderMinAmount: BigInt(2) });
        expect(Object.keys(minSenderAmountDesc.orders)).toEqual(["id3", "id2"]);

        const maxSenderAmountDesc = await db.getOrdersBy({ offset: 0, limit: 10, sortField: SortField.SENDER_AMOUNT, sortOrder: SortOrder.DESC, senderMaxAmount: BigInt(2) });
        expect(Object.keys(maxSenderAmountDesc.orders)).toEqual(["id2", "id1"]);

        const minSignerAmountDesc = await db.getOrdersBy({ offset: 0, limit: 10, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.DESC, signerMinAmount: BigInt(2) });
        expect(Object.keys(minSignerAmountDesc.orders)).toEqual(["id2", "id3"]);

        const maxSignerAmountDesc = await db.getOrdersBy({ offset: 0, limit: 10, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.DESC, signerMaxAmount: BigInt(2) });
        expect(Object.keys(maxSignerAmountDesc.orders)).toEqual(["id3", "id1"]);

        const signerTokens = await db.getOrdersBy({ offset: 0, limit: 10, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.DESC, signerTokens: ["signerToken3", "signerToken1"] });
        expect(Object.keys(signerTokens.orders)).toEqual(["id3", "id1"]);

        const senderTokens = await db.getOrdersBy({ offset: 0, limit: 10, sortField: SortField.SIGNER_AMOUNT, sortOrder: SortOrder.DESC, senderTokens: ["senderToken1", "senderToken2"] });
        expect(Object.keys(senderTokens.orders)).toEqual(["id2", "id1"]);

        const bySenderId = await db.getOrdersBy({ offset: 0, limit: 10, senderIds: ["aTokenId"] });
        expect(Object.keys(bySenderId.orders)).toEqual(["id2"]);

        const bySignerId = await db.getOrdersBy({ offset: 0, limit: 10, signerIds: ["aTokenId"] });
        expect(Object.keys(bySignerId.orders)).toEqual(["id3"]);

        const byNonce = await db.getOrdersBy({ offset: 0, limit: 10, nonce: "123" });
        expect(Object.keys(byNonce.orders)).toEqual(["id1"]);

        const byExcludedNonce = await db.getOrdersBy({ offset: 0, limit: 10, excludeNonces: ["123"] });
        expect(Object.keys(byExcludedNonce.orders)).toEqual(["id3", "id2"]);

        const byChainId = await db.getOrdersBy({ offset: 0, limit: 10, chainId: 15 });
        expect(Object.keys(byChainId.orders)).toEqual(["id1"]);

        const specificOne = await db.getOrdersBy({
            offset: 0, limit: 10,
            signerWallet: "aWalletAddress",
            senderWallet: "aWalletAddress",
        });
        expect(specificOne).toEqual({
            orders: { "id1": expectedIndexedOrder1, },
            pagination: {
                limit: 10,
                offset: 0,
                total: 1,
            }
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
                limit: -1,
                offset: 0,
                total: 1,
            }
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
                limit: -1,
                offset: 0,
                total: 1,
            }
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
                limit: -1,
                offset: 0,
                total: 2,
            },
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
                offset: 0,
                limit: -1,
                total: 2
            },
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
        const filters = await db.getTokens();

        expect(filters).toEqual(["0x0000000000000000000000000000000000000000"]);
        return Promise.resolve();
    }

    async function shouldDeleteERC20Order(db: Database) {
        const indexedOrder = forgeIndexedOrderERC20(addedOn, expiryDate);
        await db.addOrderERC20(indexedOrder);

        await db.deleteOrderERC20("123", AddressZero);
        const orders = await db.getOrdersERC20();

        expect(orders).toEqual({
            orders: {},
            pagination: {
                offset: 0,
                limit: -1,
                total: 0
            },
        });
        return Promise.resolve();
    }

    async function shouldDeleteOrder(db: Database) {
        const indexedOrder: IndexedOrder<DbOrder> = forgeIndexedOrder(addedOn, expiryDate);
        await db.addOrder(indexedOrder);

        await db.deleteOrder("123", AddressZero);
        const orders = await db.getOrders();

        expect(orders).toEqual({
            orders: {},
            pagination: {
                limit: -1,
                offset: 0,
                total: 0,
            },
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
                limit: -1,
                offset: 0,
                total: 1,
            },
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
                limit: -1,
                offset: 0,
                total: 1,
            },
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
                limit: 1,
                offset: 0,
                total: 1,
            },
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
                limit: 1,
                offset: 0,
                total: 1,
            },
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
                limit: 1,
                offset: 0,
                total: 0,
            },
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
                limit: 1,
                offset: 0,
                total: 0,
            },
        });
        return Promise.resolve();
    }

    async function hashOrderERC20(db: Database) {
        const indexedOrder = { order: forgeDbOrderERC20(1653138423547), addedOn: new Date(1653138423537).getTime(), hash: "hash" }

        const hash = db.generateHashERC20(indexedOrder);

        expect(hash).toBe("e43be220494c38a9b98c892a2871d58f7151e7f3bdc8043cd3e769d569d8247c");
        return Promise.resolve();
    }

    async function hashOrder(db: Database) {
        const indexedOrder = { order: forgeDbOrder(1653138423547), addedOn: new Date(1653138423537).getTime(), hash: "hash" }

        const hash = db.generateHash(indexedOrder);

        expect(hash).toBe("674e834981936d61708eff55802e71b6484a5f2bf35d155110437ea814c0d1bd");
        return Promise.resolve();
    }

    async function tokenIDIsUnique(db: Database) {
        const indexedOrderToOverwrite = forgeIndexedOrder(addedOn, expiryDate, "a_hash");
        const indexedOrder = forgeIndexedOrder(addedOn, expiryDate, "another_hash");
        indexedOrder.order.signer.wallet = "super_wallet"
        const expectedIndexedOrder = forgeIndexedOrderResponse(addedOn, expiryDate, "another_hash");
        expectedIndexedOrder.order.signer.wallet = "super_wallet"

        await db.addOrder(indexedOrderToOverwrite);
        await db.addOrder(indexedOrder);

        const removedOrder = await db.getOrder("a_hash");
        const existingOrder = await db.getOrder("another_hash");

        expect(removedOrder.pagination.total).toBe(0)
        expect(existingOrder).toEqual({
            orders: { another_hash: expectedIndexedOrder },
            pagination: {
                limit: 1,
                offset: 0,
                total: 1,
            },
        });
        return Promise.resolve();
    }
});