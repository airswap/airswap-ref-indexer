import { ethers } from 'ethers';
import { Database } from '../../database/Database';
import { Web3SwapClient } from './../Web3SwapClient';
import { Swap } from '@airswap/libraries';

jest.mock('@airswap/libraries', () => ({
    Swap: {
        getContract: () => jest.fn()
    }
}));

jest.mock('ethers');
jest.useFakeTimers();

const mockedEther = ethers as jest.Mocked<typeof ethers>;

describe("Web3SwapClient", () => {
    const apiKey = "apikey";
    const network = 5;
    let fakeDatabase: Partial<Database>;

    beforeEach(() => {
        fakeDatabase = {
            deleteOrder: jest.fn(),
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
            Swap.getContract = jest.fn(() => ({ address: "an_address" }))

            const client = new Web3SwapClient(apiKey, fakeDatabase as Database);
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
            Swap.getContract = jest.fn(() => ({ on: jest.fn() }))

            const client = new Web3SwapClient(apiKey, fakeDatabase as Database);
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
            Swap.getContract = jest.fn(() => ({ address: "an_address" }))

            const client = new Web3SwapClient(apiKey, fakeDatabase as Database);
            client.connectToChain(5);
            client.connectToChain(5);

            expect(mockedEther.providers.WebSocketProvider).toHaveBeenCalledTimes(1)
            expect(mockedEther.providers.WebSocketProvider).toBeCalledWith("wss://goerli.infura.io/ws/v3/apikey")
        });
    });

    it("Should remove order on event Swap", async () => {
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

        jest.advanceTimersByTime(11000);
        // @ts-ignore
        fakeDatabase.deleteOrder.mockImplementation((nonce, wallet) => {
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
        // @ts-ignore
        fakeDatabase.deleteOrder.mockImplementation((nonce, wallet) => {
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
});