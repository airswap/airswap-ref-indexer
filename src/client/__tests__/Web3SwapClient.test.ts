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
        new Web3SwapClient(apiKey, registryAddress, abi as ContractInterface, network, fakeDatabase as Database);
        expect(mockedOn).toHaveBeenCalledTimes(2);
        expect(fakeDatabase.deleteOrder).toHaveBeenCalledTimes(1);
        expect(fakeDatabase.deleteOrder).toHaveBeenCalledWith("245", "a_wallet");
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
        new Web3SwapClient(apiKey, registryAddress, abi as ContractInterface, network, fakeDatabase as Database);
        expect(mockedOn).toHaveBeenCalledTimes(2);
        expect(fakeDatabase.deleteOrder).toHaveBeenCalledTimes(1);
        expect(fakeDatabase.deleteOrder).toHaveBeenCalledWith("245", "a_wallet");
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
            new Web3SwapClient(apiKey, registryAddress, abi as ContractInterface, network, fakeDatabase as Database);
            expect(fakeDatabase.deleteOrder).not.toHaveBeenCalled();
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
            new Web3SwapClient(apiKey, registryAddress, abi as ContractInterface, network, fakeDatabase as Database);
            expect(fakeDatabase.deleteOrder).not.toHaveBeenCalled();
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
            new Web3SwapClient(apiKey, registryAddress, abi as ContractInterface, network, fakeDatabase as Database);
            expect(fakeDatabase.deleteOrder).not.toHaveBeenCalled();
        });
    });
});