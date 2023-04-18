import { ContractInterface, ethers } from 'ethers';
import { Database } from '../../database/Database';
import { Web3SwapClient } from './../Web3SwapClient';

jest.mock('ethers');
const mockedEther = ethers as jest.Mocked<typeof ethers>;

describe("Web3SwapClient", () => {
    const apiKey = "apikey";
    const network = "rinkeby";
    const abi = [] as ContractInterface;
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
                InfuraProvider: {
                    getWebSocketProvider: jest.fn()
                },
                getNetwork: jest.fn(() => ({ chainId: 5, name: "a_custom" }))
            };
            //@ts-ignore
            mockedEther.Contract = function () {
                return ({
                    on: jest.fn(),
                });
            }

            const client = new Web3SwapClient(apiKey, fakeDatabase as Database);
            client.connectToChain(5);

            expect(mockedEther.providers.getNetwork).toHaveBeenCalledWith(5);
            expect(mockedEther.providers.InfuraProvider.getWebSocketProvider).toHaveBeenCalledWith("a_custom", "apikey");
        });

        it("Network is not found", () => {
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                InfuraProvider: {
                    getWebSocketProvider: jest.fn()
                },
                //@ts-ignore
                getNetwork: jest.fn(() => undefined)
            };
            //@ts-ignore
            mockedEther.Contract = function () {
                return ({
                    on: jest.fn(),
                });
            }

            const client = new Web3SwapClient(apiKey, fakeDatabase as Database);
            client.connectToChain(5);

            expect(mockedEther.providers.getNetwork).toHaveBeenCalledWith(5);
            expect(mockedEther.providers.InfuraProvider.getWebSocketProvider).not.toHaveBeenCalled();
        });

        it("Network can't be added twice", () => {
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                InfuraProvider: {
                    getWebSocketProvider: jest.fn()
                },
                //@ts-ignore
                getNetwork: jest.fn(() => undefined)
            };
            //@ts-ignore
            mockedEther.Contract = function () {
                return ({
                    on: jest.fn(),
                });
            }

            const client = new Web3SwapClient(apiKey, fakeDatabase as Database);
            client.connectToChain(5);
            client.connectToChain(5);

            expect(mockedEther.providers.getNetwork).toHaveBeenCalledWith(5);
            expect(mockedEther.providers.InfuraProvider.getWebSocketProvider).not.toHaveBeenCalled();
        });
    });

    it("Should remove order on event SwapERC20", async () => {
        const mockedOn = jest.fn((eventName, callback) => {
            if (eventName === "SwapERC20") {
                callback({ _hex: "0xf5", _isBigNumber: true }, 3221654, "a_wallet");
            }
        });
        //@ts-ignore
        mockedEther.providers.InfuraProvider = {
            getWebSocketProvider: jest.fn()
        };
        //@ts-ignore
        mockedEther.Contract = function () {
            return ({
                on: mockedOn,
            });
        }
        new Web3SwapClient(apiKey, fakeDatabase as Database).connectToChain(network);
        expect(mockedOn).toHaveBeenCalledTimes(2);
        expect(fakeDatabase.deleteOrderERC20).toHaveBeenCalledTimes(1);
        expect(fakeDatabase.deleteOrderERC20).toHaveBeenCalledWith("245", "a_wallet");
    });

    it("Should remove order on event Cancel", async () => {
        const mockedOn = jest.fn((eventName, callback) => {
            if (eventName === "Cancel") {
                callback({ _hex: "0xf5", _isBigNumber: true }, "a_wallet");
            }
        });
        //@ts-ignore
        mockedEther.providers.InfuraProvider = {
            getWebSocketProvider: jest.fn()
        };
        //@ts-ignore
        mockedEther.Contract = function () {
            return ({
                on: mockedOn,
            });
        }
        new Web3SwapClient(apiKey, fakeDatabase as Database).connectToChain(network);
        expect(mockedOn).toHaveBeenCalledTimes(2);
        expect(fakeDatabase.deleteOrderERC20).toHaveBeenCalledTimes(1);
        expect(fakeDatabase.deleteOrderERC20).toHaveBeenCalledWith("245", "a_wallet");
    });

    describe("Do nothing", () => {
        it("event is undefined", () => {
            const mockedOn = jest.fn((eventName, callback) => {
                callback();
            });
            //@ts-ignore
            mockedEther.providers.InfuraProvider = {
                getWebSocketProvider: jest.fn()
            };
            //@ts-ignore
            mockedEther.Contract = function () {
                return ({
                    on: mockedOn,
                });
            }
            new Web3SwapClient(apiKey, fakeDatabase as Database).connectToChain(network);
            expect(fakeDatabase.deleteOrderERC20).not.toHaveBeenCalled();
        });

        it("empty nonce", () => {
            const mockedOn = jest.fn((eventName, callback) => {
                callback({});
            });
            //@ts-ignore
            mockedEther.providers.InfuraProvider = {
                getWebSocketProvider: jest.fn()
            };
            //@ts-ignore
            mockedEther.Contract = function () {
                return ({
                    on: mockedOn,
                });
            }
            new Web3SwapClient(apiKey, fakeDatabase as Database).connectToChain(network);
            expect(fakeDatabase.deleteOrderERC20).not.toHaveBeenCalled();
        });

        it("nonce has no value", () => {
            const mockedOn = jest.fn((eventName, callback) => {
                callback({ _hex: undefined, _isBigNumber: true }, "a_wallet");
            });
            //@ts-ignore
            mockedEther.providers.InfuraProvider = {
                getWebSocketProvider: jest.fn()
            };
            //@ts-ignore
            mockedEther.Contract = function () {
                return ({
                    on: mockedOn,
                });
            }
            new Web3SwapClient(apiKey, fakeDatabase as Database).connectToChain(network);
            expect(fakeDatabase.deleteOrderERC20).not.toHaveBeenCalled();
        });
    });
});