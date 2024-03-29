import { BigNumber, ethers } from 'ethers';
import { Database } from '../../database/Database';
import { Web3SwapClient } from './../Web3SwapClient';
import { Swap } from '@airswap/libraries';
import { forgeDbOrder } from '../../Fixtures';

jest.mock('@airswap/libraries', () => ({
    Swap: {
        getContract: () => jest.fn()
    }
}));

jest.mock("ethers", () => {
    const original = { ...jest.requireActual("ethers") };
    original.providers = jest.fn()
    return original
});

jest.useFakeTimers();

const mockedEther = ethers as jest.Mocked<typeof ethers>;

describe("Web3SwapClient", () => {
    const apiKey = "apikey";
    const network = 5;
    let fakeDatabase: Partial<Database>;

    beforeEach(() => {
        fakeDatabase = {
            deleteOrder: jest.fn(),
            getLastCheckedBlock: jest.fn(),
            setLastCheckedBlock: jest.fn()
        };
    });

    describe("addContractIfNotExists", () => {
        it("Add another network", async () => {
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
                //@ts-ignore
                WebSocketProvider: jest.fn(),
            };
            //@ts-ignore
            Swap.getContract = jest.fn(() => ({ address: "an_address" }))

            const client = new Web3SwapClient(apiKey, fakeDatabase as Database);
            await client.connectToChain(5);

            expect(mockedEther.providers.WebSocketProvider).toHaveBeenCalledWith("wss://goerli.infura.io/ws/v3/apikey");
        });

        it("Network is not found", async () => {
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
            };
            //@ts-ignore
            Swap.getContract = jest.fn(() => ({ on: jest.fn() }))

            const client = new Web3SwapClient(apiKey, fakeDatabase as Database);
            await client.connectToChain("aze");

            expect(mockedEther.providers.JsonRpcProvider).not.toHaveBeenCalled();
        });

        it("Network can't be added twice", async () => {
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
                //@ts-ignore
                WebSocketProvider: jest.fn(),
            };
            //@ts-ignore
            Swap.getContract = jest.fn(() => ({ address: "an_address" }))

            const client = new Web3SwapClient(apiKey, fakeDatabase as Database);
            await client.connectToChain(5);
            await client.connectToChain(5);

            expect(mockedEther.providers.WebSocketProvider).toHaveBeenCalledTimes(1)
            expect(mockedEther.providers.WebSocketProvider).toBeCalledWith("wss://goerli.infura.io/ws/v3/apikey")
        });
    });

    it("Should remove order on event Swap", (done) => {
        const mockQueryFilter = jest.fn((event, start, end) => {
            if (event === "Swap") {
                return ([{
                    args: {
                        nonce: { _hex: "0xf5", _isBigNumber: true },
                        signerWallet: "a_wAll3t"
                    }
                }])
            } else {
                return []
            }
        });

        //@ts-ignore
        Swap.getContract = jest.fn((provider, chainId) => ({
            address: "an_address" + chainId,
            queryFilter: mockQueryFilter,
            filters: {
                Cancel: () => "Cancel",
                Swap: () => "Swap"
            }
        }))
        //@ts-ignore
        mockedEther.providers = {
            //@ts-ignore
            JsonRpcProvider: jest.fn(),
            //@ts-ignore
            WebSocketProvider: jest.fn(() => ({ getBlockNumber: () => Promise.resolve(0) })),
        };

        new Web3SwapClient(apiKey, fakeDatabase as Database).connectToChain(network);

        jest.advanceTimersByTimeAsync(11000);
        // @ts-ignore
        fakeDatabase.deleteOrder.mockImplementation((nonce, wallet) => {
            expect(nonce).toEqual("245");
            expect(wallet).toEqual("a_wall3t");
            expect(mockQueryFilter).toHaveBeenCalledWith("Swap", -5, 0);
            done()
        })
    });

    it("Should remove order on event Cancel", (done) => {
        const mockQueryFilter = jest.fn((event, start, end) => {
            if (event === "Cancel") {
                return ([{
                    args: {
                        nonce: { _hex: "0xf5", _isBigNumber: true },
                        signerWallet: "a_wAll3t"
                    }
                }])
            } else {
                return []
            }
        });
        //@ts-ignore
        Swap.getContract = jest.fn((provider, chainId) => ({
            address: "an_address" + chainId,
            queryFilter: mockQueryFilter,
            filters: {
                Cancel: () => "Cancel",
                Swap: () => "Swap"
            }
        }))
        //@ts-ignore
        mockedEther.providers = {
            //@ts-ignore
            JsonRpcProvider: jest.fn(),
            //@ts-ignore
            WebSocketProvider: jest.fn(() => ({ getBlockNumber: () => Promise.resolve(0) })),
        };

        new Web3SwapClient(apiKey, fakeDatabase as Database).connectToChain(network);

        // @ts-ignore
        fakeDatabase.deleteOrder.mockImplementation((nonce, wallet) => {
            expect(nonce).toEqual("245");
            expect(wallet).toEqual("a_wall3t");
            expect(mockQueryFilter).toHaveBeenCalledWith("Cancel", -5, 0);
            done()
        })

        jest.advanceTimersByTimeAsync(11000);
    });

    it("Should start from last savedBlock", (done) => {
        const mockQueryFilter = jest.fn((event, start, end) => {
            expect(event).toEqual("Cancel");
            expect(start).toEqual(15);
            expect(end).toEqual(50);
            done()
            return []
        });
        //@ts-ignore
        Swap.getContract = jest.fn((provider, chainId) => ({
            address: "an_address" + chainId,
            queryFilter: mockQueryFilter,
            filters: {
                Cancel: () => "Cancel",
                Swap: () => "Swap"
            }
        }))
        //@ts-ignore
        mockedEther.providers = {
            //@ts-ignore
            JsonRpcProvider: jest.fn(),
            //@ts-ignore
            WebSocketProvider: jest.fn(() => ({ getBlockNumber: () => Promise.resolve(50) })),
        };

        //@ts-ignore
        fakeDatabase.getLastCheckedBlock.mockImplementation(() => Promise.resolve(20))

        new Web3SwapClient(apiKey, fakeDatabase as Database).connectToChain(network);

        jest.advanceTimersByTimeAsync(11000);
    });

    describe("Do nothing", () => {
        it("no results", () => {
            const mockQueryFilter = jest.fn((event, start, end) => {
                return []
            });
            //@ts-ignore
            Swap.getContract = jest.fn((provider, chainId) => ({
                address: "an_address" + chainId,
                queryFilter: mockQueryFilter,
                filters: {
                    Cancel: () => "Cancel",
                    Swap: () => "Swap"
                }
            }))
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
                //@ts-ignore
                WebSocketProvider: jest.fn(() => ({ getBlockNumber: () => Promise.resolve(0) })),
            };

            new Web3SwapClient(apiKey, fakeDatabase as Database).connectToChain(network);

            jest.advanceTimersByTime(11000);
            expect(fakeDatabase.deleteOrder).not.toHaveBeenCalled();
        });

        it("args is undefined", () => {
            const mockQueryFilter = jest.fn((event, start, end) => {
                return [{ args: undefined }]
            });
            //@ts-ignore
            Swap.getContract = jest.fn((provider, chainId) => ({
                address: "an_address" + chainId,
                queryFilter: mockQueryFilter,
                filters: {
                    Cancel: () => "Cancel",
                    Swap: () => "Swap"
                }
            }))
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
                //@ts-ignore
                WebSocketProvider: jest.fn(() => ({ getBlockNumber: () => Promise.resolve(0) })),
            };

            new Web3SwapClient(apiKey, fakeDatabase as Database).connectToChain(network);

            jest.advanceTimersByTime(11000);
            expect(fakeDatabase.deleteOrder).not.toHaveBeenCalled();
        });

        it("nonce is undefined", () => {
            const mockQueryFilter = jest.fn((event, start, end) => {
                return ([{
                    args: {
                        nonce: { _hex: undefined, _isBigNumber: true },
                        signerWallet: "a_wAll3t"
                    }
                }])
            });
            //@ts-ignore
            Swap.getContract = jest.fn((provider, chainId) => ({
                address: "an_address" + chainId,
                queryFilter: mockQueryFilter,
                filters: {
                    Cancel: () => "Cancel",
                    Swap: () => "Swap"
                }
            }))
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
                //@ts-ignore
                WebSocketProvider: jest.fn(() => ({ getBlockNumber: () => Promise.resolve(0) })),
            };

            new Web3SwapClient(apiKey, fakeDatabase as Database).connectToChain(network);

            jest.advanceTimersByTime(11000);
            expect(fakeDatabase.deleteOrder).not.toHaveBeenCalled();
        });
    });

    describe("isValidOrder", () => {
        it("should return true, ignore 'SenderAllowanceLow', 'SenderBalanceLow'", async () => {
            const mockCheck = jest.fn().mockResolvedValue([
                [
                    '0x53656e646572416c6c6f77616e63654c6f770000000000000000000000000000',
                    '0x53656e64657242616c616e63654c6f7700000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000'
                ],
                BigNumber.from(0x02)
            ])
            // @ts-ignore
            Swap.getContract = jest.fn((provider, chainId) => ({
                address: "an_address" + chainId,
                queryFilter: jest.fn(),
                filters: {
                    Cancel: () => "Cancel",
                    Swap: () => "Swap"
                },
                check: mockCheck
            }))
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
                //@ts-ignore
                WebSocketProvider: jest.fn(() => ({ getBlockNumber: () => Promise.resolve(0) })),
            };

            const swapClient = new Web3SwapClient(apiKey, fakeDatabase as Database);
            await swapClient.connectToChain(network);

            const isValid = await swapClient.isValidOrder(forgeDbOrder(1));
            expect(isValid).toBe(true)
        })

        it("should return false", async () => {
            const mockCheck = jest.fn().mockResolvedValue([
                [
                    '0x53656e646572416c6c6f77616e63654c6f770000000000000000000000000000',
                    '0x53656e64657242616c616e63654c6f7700000000000000000000000000000000',
                    '0x5369676e6174757265496e76616c696400000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000000000000000000000000000'
                ],
                BigNumber.from(0x03)
            ])
            // @ts-ignore
            Swap.getContract = jest.fn((provider, chainId) => ({
                address: "an_address" + chainId,
                queryFilter: jest.fn(),
                filters: {
                    Cancel: () => "Cancel",
                    Swap: () => "Swap"
                },
                check: mockCheck
            }))
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
                //@ts-ignore
                WebSocketProvider: jest.fn(() => ({ getBlockNumber: () => Promise.resolve(0) })),
            };

            const swapClient = new Web3SwapClient(apiKey, fakeDatabase as Database);
            swapClient.connectToChain(network);

            const isValid = await swapClient.isValidOrder(forgeDbOrder(1));
            expect(isValid).toBe(false)
        })
    })
});