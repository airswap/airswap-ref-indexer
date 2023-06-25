import { SortField, SortOrder, OrderFilter, Order } from '@airswap/types';
import { Web3SwapERC20Client } from '../../client/Web3SwapERC20Client';
import { Web3SwapClient } from '../../client/Web3SwapClient';
import { Database } from '../../database/Database';
import { forgeDbOrder, forgeDbOrderERC20, forgeFullOrder, forgeFullOrderERC20, forgeIndexedOrder, forgeIndexedOrderERC20, forgeIndexedOrderResponse, forgeIndexedOrderResponseERC20, forgeOrderERC20Response, forgeOrderResponse } from '../../Fixtures';
import { OrderService } from './../../service/OrderService';
import { AddressZero } from '@ethersproject/constants';

jest
    .useFakeTimers()
    .setSystemTime(new Date(1653900784706));

describe("Order service", () => {

    let fakeDb: Partial<Database>;
    let fakeWeb3SwapERC20Client: Partial<Web3SwapERC20Client>;
    let fakeWeb3SwapClient: Partial<Web3SwapClient>;
    const maxResultByQuery = 20;

    beforeEach(() => {
        fakeDb = {
            getOrdersERC20: jest.fn(() => Promise.resolve({ orders: { "aze": forgeIndexedOrderResponseERC20(1653900784696, 1653900784706) }, pagination: { limit: 10, offset: 0, total: 1 } })),
            getOrders: jest.fn(() => Promise.resolve({ orders: { "aze": forgeIndexedOrderResponse(1653900784696, 1653900784706) }, pagination: { limit: 10, offset: 0, total: 1 } })),
            getOrderERC20: jest.fn(() => Promise.resolve({ orders: { "aze": forgeIndexedOrderResponseERC20(1653900784696, 1653900784706) }, pagination: { limit: 10, offset: 0, total: 1 } })),
            getOrder: jest.fn(() => Promise.resolve({ orders: { "aze": forgeIndexedOrderResponse(1653900784696, 1653900784706) }, pagination: { limit: 10, offset: 0, total: 1 } })),
            getOrdersERC20By: jest.fn(() => Promise.resolve({ orders: { "aze": forgeIndexedOrderResponseERC20(1653900784696, 1653900784706) }, pagination: { limit: 10, offset: 0, total: 1 } })),
            getOrdersBy: jest.fn(() => Promise.resolve({ orders: { "aze": forgeIndexedOrderResponse(1653900784696, 1653900784706) }, pagination: { limit: 10, offset: 0, total: 1 } })),
            getTokens: jest.fn(() => Promise.resolve(["eth"])),
            addOrderERC20: jest.fn(() => Promise.resolve()),
            addOrder: jest.fn(() => Promise.resolve()),
            orderERC20Exists: jest.fn(() => Promise.resolve(true)),
            orderExists: jest.fn(() => Promise.resolve(true)),
            generateHash: jest.fn(),
            generateHashERC20: jest.fn(),
            deleteOrderERC20: jest.fn(() => Promise.resolve()),
        };
        fakeWeb3SwapERC20Client = {
            connectToChain: jest.fn()
        }
        fakeWeb3SwapClient = {
            connectToChain: jest.fn()
        }
    })

    describe('Get orders ERC20', () => {
        test("get all", async () => {
            const expected = forgeOrderERC20Response();

            const result = await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).getOrdersERC20({});

            expect(fakeDb.getOrdersERC20).toHaveBeenCalled();
            expect(result).toEqual(expected);
        });

        test("get by hash", async () => {
            const expected = forgeOrderERC20Response();

            const result = await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).getOrdersERC20({ hash: "aze" });

            expect(fakeDb.getOrderERC20).toHaveBeenCalledWith("aze");
            expect(result).toEqual(expected);
        });

        test("get by filters", async () => {
            const body: OrderFilter = {
                signerMinAmount: "200",
                signerMaxAmount: "200",
                senderMinAmount: "2",
                senderMaxAmount: "20",
                signerTokens: ["eth"],
                senderTokens: ["dai"],
                offset: 0,
                limit: 20,
            };

            const expected = forgeOrderERC20Response();

            const result = await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).getOrdersERC20(body);

            expect(fakeDb.getOrdersERC20By).toHaveBeenCalledWith({
                senderMaxAmount: BigInt(20),
                signerMaxAmount: BigInt(200),
                senderMinAmount: BigInt(2),
                signerMinAmount: BigInt(200),
                limit: 20,
                offset: 0,
                senderTokens: ["dai"],
                signerTokens: ["eth"],
            });
            expect(result).toEqual(expected);
        });


        test("get but data are null", async () => {
            await expect(async () => {
                // @ts-ignore
                await new OrderService(fakeDb as Database).getOrdersERC20(null, undefined)
            }).rejects.toThrow("Incorrect query");

            expect(fakeDb.orderERC20Exists).toHaveBeenCalledTimes(0);
            expect(fakeDb.getOrderERC20).toHaveBeenCalledTimes(0);
            expect(fakeDb.getOrdersERC20).toHaveBeenCalledTimes(0);
            expect(fakeDb.getOrdersERC20By).toHaveBeenCalledTimes(0);
        });
    });

    describe('Get orders', () => {
        test("get all", async () => {
            const expected = forgeOrderResponse();

            const result = await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).getOrders({});

            expect(fakeDb.getOrders).toHaveBeenCalled();
            expect(result).toEqual(expected);
        });

        test("get by hash", async () => {
            const expected = forgeOrderResponse();

            const result = await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).getOrders({ hash: "aze" });

            expect(fakeDb.getOrder).toHaveBeenCalledWith("aze");
            expect(result).toEqual(expected);
        });

        test("get by filters", async () => {
            const body: OrderFilter = {
                sortField: SortField.EXPIRY,
                sortOrder: SortOrder.ASC,
                signerWallet: AddressZero,
                senderWallet: AddressZero,
                offset: 0,
                limit: 20
            };

            const expected = forgeOrderResponse();

            const result = await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).getOrders(body);

            expect(fakeDb.getOrdersBy).toHaveBeenCalledWith({
                sortField: SortField.EXPIRY,
                sortOrder: SortOrder.ASC,
                signerWallet: AddressZero,
                senderWallet: AddressZero,
                offset: 0,
                limit: 20
            });
            expect(result).toEqual(expected);
        });


        test("get but data are null", async () => {
            await expect(async () => {
                // @ts-ignore
                await new OrderService(fakeDb as Database).getOrders(null, undefined)
            }).rejects.toThrow("Incorrect query");

            expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
            expect(fakeDb.getOrder).toHaveBeenCalledTimes(0);
            expect(fakeDb.getOrders).toHaveBeenCalledTimes(0);
            expect(fakeDb.getOrdersBy).toHaveBeenCalledTimes(0);
        });
    });

    describe("Add Order ERC 20", () => {
        test("Add order nominal & broadcast", async () => {
            const order = forgeFullOrderERC20(1653900784796);
            const expectedForgeHash = { order: forgeDbOrderERC20(1653900784796), addedOn: 1653900784706 }
            const expected = forgeIndexedOrderERC20(1653900784706, 1653900784796);
            expected.hash = "a";

            //@ts-ignore
            fakeDb.generateHashERC20.mockImplementation((order) => {
                expect(order).toEqual(expectedForgeHash); // https://github.com/facebook/jest/issues/7950
                return "a";
            });
            //@ts-ignore
            fakeDb.orderERC20Exists.mockImplementation(() => false);

            await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).addOrderERC20(order);

            expect(fakeDb.generateHashERC20).toHaveBeenCalledTimes(1);
            expect(fakeDb.orderERC20Exists).toHaveBeenCalledWith("a");
            expect(fakeDb.addOrderERC20).toHaveBeenCalledWith(expected);
            expect(fakeWeb3SwapERC20Client.connectToChain).toHaveBeenCalledWith(5);
        });

        test("Add order missing data", async () => {
            const orderMissingExpiry = forgeIndexedOrderERC20(1653900784696, 1653900784706);
            // @ts-ignore
            orderMissingExpiry.order.expiry = undefined;

            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).addOrderERC20(orderMissingExpiry)
            }).rejects.toThrow();

            expect(fakeDb.orderERC20Exists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrderERC20).toHaveBeenCalledTimes(0);
            expect(fakeWeb3SwapERC20Client.connectToChain).toHaveBeenCalledTimes(0);
        });

        test("Add order invalid data", async () => {
            const orderBadValueSenderAmount = forgeFullOrderERC20(1653900784696);
            orderBadValueSenderAmount.senderAmount = "a";

            const orderBadValueSignerAmount = forgeFullOrderERC20(1653900784696);
            orderBadValueSignerAmount.signerAmount = "a";

            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).addOrderERC20(orderBadValueSenderAmount)
            }).rejects.toThrow();
            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).addOrderERC20(orderBadValueSignerAmount)
            }).rejects.toThrow("Number fields are incorrect");

            expect(fakeDb.orderERC20Exists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrderERC20).toHaveBeenCalledTimes(0);
            expect(fakeWeb3SwapERC20Client.connectToChain).toHaveBeenCalledTimes(0);
        });

        test("Add order invalid date", async () => {
            const orderDateNotInRange = forgeFullOrderERC20(1653900784696);
            orderDateNotInRange.expiry = '0';

            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).addOrderERC20(orderDateNotInRange)
            }).rejects.toThrow("Invalid expiry date");

            expect(fakeDb.orderERC20Exists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrderERC20).toHaveBeenCalledTimes(0);
            expect(fakeWeb3SwapERC20Client.connectToChain).toHaveBeenCalledTimes(0);
        });

        test("Missing order", async () => {
            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).addOrderERC20({})
            }).rejects.toThrow("No body");

            expect(fakeDb.orderERC20Exists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrderERC20).toHaveBeenCalledTimes(0);
            expect(fakeWeb3SwapERC20Client.connectToChain).toHaveBeenCalledTimes(0);
        });

        test("Add: already added", async () => {
            const order = forgeFullOrderERC20(1653900784796);

            //@ts-ignore
            fakeDb.generateHashERC20.mockImplementation(() => "a");
            //@ts-ignore
            fakeDb.orderERC20Exists.mockImplementation(() => true);

            const expected = forgeIndexedOrderERC20(1653900784706, 1653900784796);
            //@ts-ignore
            expected.hash = undefined;

            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).addOrderERC20(order)
            }).rejects.toThrow("Already exists");

            expect(fakeDb.generateHashERC20).toHaveBeenCalledWith(expected);
            expect(fakeDb.orderERC20Exists).toHaveBeenCalledWith("a");
            expect(fakeDb.addOrderERC20).toHaveBeenCalledTimes(0);
            expect(fakeWeb3SwapERC20Client.connectToChain).toHaveBeenCalledTimes(0);
        });
    });

    describe("Add Order", () => {
        test("Add order nominal & broadcast", async () => {
            const order = forgeFullOrder(1653900784796);
            const expectedForgeHash = { order: forgeDbOrder(1653900784796), addedOn: 1653900784706 }
            const expected = forgeIndexedOrder(1653900784706, 1653900784796);
            expected.hash = "a";

            //@ts-ignore
            fakeDb.generateHash.mockImplementation((order) => {
                expect(order).toEqual(expectedForgeHash); // https://github.com/facebook/jest/issues/7950
                return "a";
            });
            //@ts-ignore
            fakeDb.orderExists.mockImplementation(() => false);

            await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).addOrder(order);

            expect(fakeDb.generateHash).toHaveBeenCalledTimes(1);
            expect(fakeDb.orderExists).toHaveBeenCalledWith("a");
            expect(fakeDb.addOrder).toHaveBeenCalledWith(expected);
            expect(fakeWeb3SwapClient.connectToChain).toHaveBeenCalledWith(5);
        });

        test("Add order missing data", async () => {
            const orderMissingExpiry = forgeIndexedOrder(1653900784696, 1653900784706);
            // @ts-ignore
            orderMissingExpiry.order.expiry = undefined;

            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).addOrder(orderMissingExpiry)
            }).rejects.toThrow();

            expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
            expect(fakeWeb3SwapClient.connectToChain).toHaveBeenCalledTimes(0);
        });

        test("Add order invalid data", async () => {
            const orderBadValueSenderAmount = forgeFullOrder(1653900784696);
            orderBadValueSenderAmount.sender.amount = "b";

            const orderBadValueSignerAmount = forgeFullOrder(1653900784696);
            orderBadValueSignerAmount.signer.amount = "a";

            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).addOrder(orderBadValueSenderAmount)
            }).rejects.toThrow();
            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).addOrder(orderBadValueSignerAmount)
            }).rejects.toThrow("Number fields are incorrect");

            expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
            expect(fakeWeb3SwapClient.connectToChain).toHaveBeenCalledTimes(0);
        });

        test("Add order invalid date", async () => {
            const orderDateNotInRange = forgeFullOrder(1653900784696);
            orderDateNotInRange.expiry = '0';

            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).addOrder(orderDateNotInRange)
            }).rejects.toThrow("Invalid expiry date");

            expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
            expect(fakeWeb3SwapClient.connectToChain).toHaveBeenCalledTimes(0);
        });

        test("Missing order", async () => {
            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).addOrder({})
            }).rejects.toThrow("No body");

            expect(fakeDb.orderExists).toHaveBeenCalledTimes(0);
            expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
            expect(fakeWeb3SwapClient.connectToChain).toHaveBeenCalledTimes(0);
        });

        test("Add: already added", async () => {
            const order = forgeFullOrder(1653900784796);

            //@ts-ignore
            fakeDb.generateHash.mockImplementation(() => "a");
            //@ts-ignore
            fakeDb.orderExists.mockImplementation(() => true);

            const expected = forgeIndexedOrder(1653900784706, 1653900784796);
            //@ts-ignore
            expected.hash = undefined;

            await expect(async () => {
                await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).addOrder(order)
            }).rejects.toThrow("Already exists");

            expect(fakeDb.generateHash).toHaveBeenCalledWith(expected);
            expect(fakeDb.orderExists).toHaveBeenCalledWith("a");
            expect(fakeDb.addOrder).toHaveBeenCalledTimes(0);
            expect(fakeWeb3SwapClient.connectToChain).toHaveBeenCalledTimes(0);
        });
    });

    describe("Get Tokens", () => {
        it("retirn added", async () => {
            const expected = ["eth"];
            const filters = await new OrderService(fakeDb as Database, fakeWeb3SwapERC20Client as Web3SwapERC20Client, fakeWeb3SwapClient as Web3SwapClient, maxResultByQuery).getTokens()
            expect(fakeDb.getTokens).toHaveBeenCalled()
            expect(filters).toEqual(expected)
        })
    })
});