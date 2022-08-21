import { ContractInterface, ethers } from 'ethers';
import { Database } from '../../database/Database';
import { Web3SwapClient } from './../Web3SwapClient';

jest.mock('ethers');
const mockedEther = ethers as jest.Mocked<typeof ethers>;

describe("Web3SwapClient", () => {
    const apiKey = "apikey";
    const registryAddress = "registryAddress";
    const network = "rinkeby";
    const abi = [] as ContractInterface;
    let fakeDatabase: Partial<Database>;

    beforeEach(() => {
        fakeDatabase = {
            deleteOrder: jest.fn(),
        };
    });

    it("Should remove order on event Swap", async () => {
        const mockedOn = jest.fn((eventName, callback) => {
            if (eventName === "Swap") {
                callback("from", "to", {
                    args: {
                        nonce: "a_nonce",
                        signerWallet: "a_wallet",
                    }
                });
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
        new Web3SwapClient(apiKey, registryAddress, abi as ContractInterface, network, fakeDatabase as Database);
        expect(mockedOn).toHaveBeenCalledTimes(2);
        expect(fakeDatabase.deleteOrder).toHaveBeenCalledTimes(1);
        expect(fakeDatabase.deleteOrder).toHaveBeenCalledWith("a_nonce", "a_wallet");
    });

    it("Should remove order on event Cancel", async () => {
        const mockedOn = jest.fn((eventName, callback) => {
            if (eventName === "Cancel") {
                callback("from", "to", {
                    args: {
                        nonce: "a_nonce",
                        signerWallet: "a_wallet",
                    }
                });
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
        new Web3SwapClient(apiKey, registryAddress, abi as ContractInterface, network, fakeDatabase as Database);
        expect(mockedOn).toHaveBeenCalledTimes(2);
        expect(fakeDatabase.deleteOrder).toHaveBeenCalledTimes(1);
        expect(fakeDatabase.deleteOrder).toHaveBeenCalledWith("a_nonce", "a_wallet");
    });

    describe("Do nothing", () => {
        it("event is undefined", () => {
            const mockedOn = jest.fn((eventName, callback) => {
                callback("from", "to", undefined);
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
            new Web3SwapClient(apiKey, registryAddress, abi as ContractInterface, network, fakeDatabase as Database);
            expect(fakeDatabase.deleteOrder).not.toHaveBeenCalled();
        });
        
        it("args is undefined", () => {
            const mockedOn = jest.fn((eventName, callback) => {
                callback("from", "to", {});
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
            new Web3SwapClient(apiKey, registryAddress, abi as ContractInterface, network, fakeDatabase as Database);
            expect(fakeDatabase.deleteOrder).not.toHaveBeenCalled();
        });

        it("args is empty", () => {
            const mockedOn = jest.fn((eventName, callback) => {
                callback("from", "to", {args: {}});
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
            new Web3SwapClient(apiKey, registryAddress, abi as ContractInterface, network, fakeDatabase as Database);
            expect(fakeDatabase.deleteOrder).not.toHaveBeenCalled();
        });
    });
});