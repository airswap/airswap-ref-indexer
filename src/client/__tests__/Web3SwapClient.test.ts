import { ContractInterface, ethers } from 'ethers';
import { forgeDbOrder } from '../../Fixtures';
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

            const client = new Web3SwapClient(apiKey, abi as ContractInterface, fakeDatabase as Database);
            client.addContractIfNotExists("another_address", "5");

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

            const client = new Web3SwapClient(apiKey, abi as ContractInterface, fakeDatabase as Database);
            client.addContractIfNotExists("another_address", "5");

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
                getNetwork: jest.fn(() => ({ chainId: 5, name: "a_custom" }))
            };
            //@ts-ignore
            mockedEther.Contract = function () {
                return ({
                    on: jest.fn(),
                });
            }

            const client = new Web3SwapClient(apiKey, abi as ContractInterface, fakeDatabase as Database);
            client.addContractIfNotExists("another_address", "5");
            client.addContractIfNotExists("another_address", "5");

            expect(mockedEther.providers.getNetwork).toHaveBeenCalledWith(5);
            expect(mockedEther.providers.InfuraProvider.getWebSocketProvider).toHaveBeenCalledTimes(1);
        });
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
        new Web3SwapClient(apiKey, abi as ContractInterface, fakeDatabase as Database).addContractIfNotExists(registryAddress, network);
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
        new Web3SwapClient(apiKey, abi as ContractInterface, fakeDatabase as Database).addContractIfNotExists(registryAddress, network);
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
            new Web3SwapClient(apiKey, abi as ContractInterface, fakeDatabase as Database).addContractIfNotExists(registryAddress, network);
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
            new Web3SwapClient(apiKey, abi as ContractInterface, fakeDatabase as Database).addContractIfNotExists(registryAddress, network);
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
            new Web3SwapClient(apiKey, abi as ContractInterface, fakeDatabase as Database).addContractIfNotExists(registryAddress, network);
            expect(fakeDatabase.deleteOrder).not.toHaveBeenCalled();
        });
    });

    describe("isValidOrder", () => {
        it("Is valid", async () => {
            const dbOrder = forgeDbOrder(321);
            const mockCheck = jest.fn().mockResolvedValue(true);
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                InfuraProvider: {
                    getWebSocketProvider: jest.fn()
                },
                //@ts-ignore
                getNetwork: jest.fn(() => ({ chainId: 5, name: "a_custom" }))
            };
            //@ts-ignore
            mockedEther.Contract = function () {
                return ({
                    on: jest.fn(),
                    check: mockCheck
                });
            }
            const client = new Web3SwapClient(apiKey, abi, fakeDatabase as Database);
            client.addContractIfNotExists(dbOrder.swapContract, dbOrder.chainId);
            
            const isValid = await client.isValidOrder(dbOrder);

            expect(isValid).toBeTruthy();
            expect(mockCheck).toHaveBeenCalledWith(
                "0x0000000000000000000000000000000000000000",
                "nonce",
                0.321,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                "5",
                "0x0000000000000000000000000000000000000000",
                "10",
                "28",
                "0x3e1010e70f178443d0e3437464db2f910be150259cfcbe8916a6267247bea0f7",
                "0x5a12fdf12c2b966a98d238916a670bdfd83e207e54a9c7d0af923839582de79f"
            );
        });

        it("Is invalid", async () => {
            const dbOrder = forgeDbOrder(321);
            const mockCheck = jest.fn().mockResolvedValue(false);
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                InfuraProvider: {
                    getWebSocketProvider: jest.fn()
                },
                //@ts-ignore
                getNetwork: jest.fn(() => ({ chainId: 5, name: "a_custom" }))
            };
            //@ts-ignore
            mockedEther.Contract = function () {
                return ({
                    on: jest.fn(),
                    check: mockCheck
                });
            }
            const client = new Web3SwapClient(apiKey, abi, fakeDatabase as Database);
            client.addContractIfNotExists(dbOrder.swapContract, dbOrder.chainId);
            
            const isValid = await client.isValidOrder(dbOrder);

            expect(isValid).toBeFalsy();
            expect(mockCheck).toHaveBeenCalledWith(
                "0x0000000000000000000000000000000000000000",
                "nonce",
                0.321,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                "5",
                "0x0000000000000000000000000000000000000000",
                "10",
                "28",
                "0x3e1010e70f178443d0e3437464db2f910be150259cfcbe8916a6267247bea0f7",
                "0x5a12fdf12c2b966a98d238916a670bdfd83e207e54a9c7d0af923839582de79f"
            );
        });

        it("Return false on error and log", async () => {
            const dbOrder = forgeDbOrder(321);
            const errorDesc = "An error has been received so I must crash"
            const mockCheck = jest.fn().mockRejectedValue(errorDesc);
            const logSpy = jest.spyOn(console, 'error');
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                InfuraProvider: {
                    getWebSocketProvider: jest.fn()
                },
                //@ts-ignore
                getNetwork: jest.fn(() => ({ chainId: 5, name: "a_custom" }))
            };
            //@ts-ignore
            mockedEther.Contract = function () {
                return ({
                    on: jest.fn(),
                    check: mockCheck
                });
            }
            const client = new Web3SwapClient(apiKey, abi, fakeDatabase as Database);
            client.addContractIfNotExists(dbOrder.swapContract, dbOrder.chainId);
            
            const isValid = await client.isValidOrder(dbOrder);

            expect(isValid).toBeFalsy();
            expect(mockCheck).toHaveBeenCalledWith(
                "0x0000000000000000000000000000000000000000",
                "nonce",
                0.321,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
                "5",
                "0x0000000000000000000000000000000000000000",
                "10",
                "28",
                "0x3e1010e70f178443d0e3437464db2f910be150259cfcbe8916a6267247bea0f7",
                "0x5a12fdf12c2b966a98d238916a670bdfd83e207e54a9c7d0af923839582de79f"
            );
            expect(logSpy).toHaveBeenCalledWith(errorDesc);
        });

        it("Network was not registered", async () => {
            const dbOrder = forgeDbOrder(321);
            const mockCheck = jest.fn().mockResolvedValue(false);
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                InfuraProvider: {
                    getWebSocketProvider: jest.fn()
                },
                //@ts-ignore
                getNetwork: jest.fn()
            };
            //@ts-ignore
            mockedEther.Contract = function () {
                return ({
                    on: jest.fn(),
                    check: mockCheck
                });
            }
            const client = new Web3SwapClient(apiKey, abi, fakeDatabase as Database);
            client.addContractIfNotExists(dbOrder.swapContract, dbOrder.chainId);
            
            const isValid = await client.isValidOrder(dbOrder);

            expect(isValid).toBeFalsy();
            expect(mockCheck).not.toHaveBeenCalled();
        });
    });
});