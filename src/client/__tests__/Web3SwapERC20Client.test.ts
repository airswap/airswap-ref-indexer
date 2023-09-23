import { BigNumber, ethers } from 'ethers';
import { Database } from '../../database/Database';
import { Web3SwapERC20Client } from './../Web3SwapERC20Client';
import { SwapERC20 } from '@airswap/libraries';
import { forgeDbOrderERC20 } from '../../Fixtures';

jest.mock('@airswap/libraries', () => ({
    SwapERC20: {
        getContract: () => jest.fn()
    }
}));

jest.mock("ethers", () => {
    const original = jest.requireActual("ethers");
    return {
        ...original,
        ethers: jest.fn()
    };
});
jest.useFakeTimers();

const mockedEther = ethers as jest.Mocked<typeof ethers>;

describe("Web3SwapERC20Client", () => {
    const apiKey = "apikey";
    const network = 5;
    let fakeDatabase: Partial<Database>;

    beforeEach(() => {
        fakeDatabase = {
            deleteOrderERC20: jest.fn(),
        };
    });

    describe("addContractIfNotExists", () => {
        it("Add another network", () => {
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
                //@ts-ignore
                WebSocketProvider: jest.fn(),
            };
            //@ts-ignore
            SwapERC20.getContract = jest.fn(() => ({ address: "an_address" }))

            const client = new Web3SwapERC20Client(apiKey, fakeDatabase as Database);
            client.connectToChain(5);

            expect(mockedEther.providers.WebSocketProvider).toHaveBeenCalledWith("wss://goerli.infura.io/ws/v3/apikey");
        });

        it("Network is not found", () => {
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
            };
            //@ts-ignore
            SwapERC20.getContract = jest.fn(() => ({ on: jest.fn() }))

            const client = new Web3SwapERC20Client(apiKey, fakeDatabase as Database);
            client.connectToChain("aze");

            expect(mockedEther.providers.JsonRpcProvider).not.toHaveBeenCalled();
        });

        it("Network can't be added twice", () => {
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
                //@ts-ignore
                WebSocketProvider: jest.fn(),
            };
            //@ts-ignore
            SwapERC20.getContract = jest.fn(() => ({ address: "an_address" }))

            const client = new Web3SwapERC20Client(apiKey, fakeDatabase as Database);
            client.connectToChain(5);
            client.connectToChain(5);

            expect(mockedEther.providers.WebSocketProvider).toHaveBeenCalledTimes(1)
            expect(mockedEther.providers.WebSocketProvider).toBeCalledWith("wss://goerli.infura.io/ws/v3/apikey")
        });
    });

    it("Should remove order on event SwapERC20", async () => {
        const mockQueryFilter = jest.fn((event, start, end) => {
            if (event === "SwapERC20") {
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
        SwapERC20.getContract = jest.fn((provider, chainId) => ({
            address: "an_address" + chainId,
            queryFilter: mockQueryFilter,
            filters: {
                Cancel: () => "Cancel",
                SwapERC20: () => "SwapERC20"
            }
        }))
        //@ts-ignore
        mockedEther.providers = {
            //@ts-ignore
            JsonRpcProvider: jest.fn(),
            //@ts-ignore
            WebSocketProvider: jest.fn(() => ({ getBlockNumber: () => Promise.resolve(0) })),
        };

        new Web3SwapERC20Client(apiKey, fakeDatabase as Database).connectToChain(network);

        jest.advanceTimersByTime(11000);
        // @ts-ignore
        fakeDatabase.deleteOrderERC20.mockImplementation((nonce, wallet) => {
            expect(nonce).toEqual(245);
            expect(wallet).toEqual("a_wall3t");
        })
    });

    it("Should remove order on event Cancel", async () => {
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
        SwapERC20.getContract = jest.fn((provider, chainId) => ({
            address: "an_address" + chainId,
            queryFilter: mockQueryFilter,
            filters: {
                Cancel: () => "Cancel",
                SwapERC20: () => "SwapERC20"
            }
        }))
        //@ts-ignore
        mockedEther.providers = {
            //@ts-ignore
            JsonRpcProvider: jest.fn(),
            //@ts-ignore
            WebSocketProvider: jest.fn(() => ({ getBlockNumber: () => Promise.resolve(0) })),
        };

        new Web3SwapERC20Client(apiKey, fakeDatabase as Database).connectToChain(network);

        jest.advanceTimersByTime(11000);
        // @ts-ignore
        fakeDatabase.deleteOrderERC20.mockImplementation((nonce, wallet) => {
            expect(nonce).toEqual(245,);
            expect(wallet).toEqual("a_wall3t");
        })
    });

    describe("Do nothing", () => {
        it("no results", () => {
            const mockQueryFilter = jest.fn((event, start, end) => {
                return []
            });
            //@ts-ignore
            SwapERC20.getContract = jest.fn((provider, chainId) => ({
                address: "an_address" + chainId,
                queryFilter: mockQueryFilter,
                filters: {
                    Cancel: () => "Cancel",
                    SwapERC20: () => "SwapERC20"
                }
            }))
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
                //@ts-ignore
                WebSocketProvider: jest.fn(() => ({ getBlockNumber: () => Promise.resolve(0) })),
            };

            new Web3SwapERC20Client(apiKey, fakeDatabase as Database).connectToChain(network);

            jest.advanceTimersByTime(11000);
            expect(fakeDatabase.deleteOrderERC20).not.toHaveBeenCalled();
        });

        it("args is undefined", () => {
            const mockQueryFilter = jest.fn((event, start, end) => {
                return [{ args: undefined }]
            });
            //@ts-ignore
            SwapERC20.getContract = jest.fn((provider, chainId) => ({
                address: "an_address" + chainId,
                queryFilter: mockQueryFilter,
                filters: {
                    Cancel: () => "Cancel",
                    SwapERC20: () => "SwapERC20"
                }
            }))
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
                //@ts-ignore
                WebSocketProvider: jest.fn(() => ({ getBlockNumber: () => Promise.resolve(0) })),
            };

            new Web3SwapERC20Client(apiKey, fakeDatabase as Database).connectToChain(network);

            jest.advanceTimersByTime(11000);
            expect(fakeDatabase.deleteOrderERC20).not.toHaveBeenCalled();
        });

        it("args is undefined", () => {
            const mockQueryFilter = jest.fn((event, start, end) => {
                return ([{
                    args: {
                        nonce: { _hex: undefined, _isBigNumber: true },
                        signerWallet: "a_wAll3t"
                    }
                }])
            });
            //@ts-ignore
            SwapERC20.getContract = jest.fn((provider, chainId) => ({
                address: "an_address" + chainId,
                queryFilter: mockQueryFilter,
                filters: {
                    Cancel: () => "Cancel",
                    SwapERC20: () => "SwapERC20"
                }
            }))
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
                //@ts-ignore
                WebSocketProvider: jest.fn(() => ({ getBlockNumber: () => Promise.resolve(0) })),
            };

            new Web3SwapERC20Client(apiKey, fakeDatabase as Database).connectToChain(network);

            jest.advanceTimersByTime(11000);
            expect(fakeDatabase.deleteOrderERC20).not.toHaveBeenCalled();
        });
    });

    describe("isValidOrder", () => {
        it("should return true, ignore 'SenderAllowanceLow', 'SenderBalanceLow'", async () => {
            const mockCheck = jest.fn().mockResolvedValue([
                BigNumber.from(0x02),
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
                ]
            ])
            // @ts-ignore
            SwapERC20.getContract = jest.fn((provider, chainId) => ({
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

            const swapClient = new Web3SwapERC20Client(apiKey, fakeDatabase as Database);
            swapClient.connectToChain(network);

            const isValid = await swapClient.isValidOrder(forgeDbOrderERC20(1));
            expect(isValid).toBe(true)
        })

        it("should return false", async () => {
            const mockCheck = jest.fn().mockResolvedValue([
                BigNumber.from(0x03),
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
            ])
            // @ts-ignore
            SwapERC20.getContract = jest.fn((provider, chainId) => ({
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

            const swapClient = new Web3SwapERC20Client(apiKey, fakeDatabase as Database);
            swapClient.connectToChain(network);

            const isValid = await swapClient.isValidOrder(forgeDbOrderERC20(1));
            expect(isValid).toBe(false)
        })
    })
});