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
            };
            //@ts-ignore
            Swap.getContract = jest.fn(() => ({ on: jest.fn() }))

            const client = new Web3SwapClient(fakeDatabase as Database);
            client.connectToChain(5);

            expect(mockedEther.providers.JsonRpcProvider).toHaveBeenCalledWith("https://https://goerli.infura.io/v3");
        });

        it("Network is not found", () => {
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
            };
            //@ts-ignore
            Swap.getContract = jest.fn(() => ({ on: jest.fn() }))

            const client = new Web3SwapClient(fakeDatabase as Database);
            client.connectToChain("aze");

            expect(mockedEther.providers.JsonRpcProvider).not.toHaveBeenCalled();
        });

        it("Network can't be added twice", () => {
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
            };
            //@ts-ignore
            Swap.getContract = jest.fn(() => ({ on: jest.fn() }))

            const client = new Web3SwapClient(fakeDatabase as Database);
            client.connectToChain(5);
            client.connectToChain(5);

            expect(mockedEther.providers.JsonRpcProvider).toHaveBeenCalledTimes(1)
            expect(mockedEther.providers.JsonRpcProvider).toBeCalledWith("https://https://goerli.infura.io/v3");
        });
    });

    it("Should remove order on event Swap", async () => {
        const mockedOn = jest.fn((eventName, callback) => {
            if (eventName === "Swap") {
                callback({ _hex: "0xf5", _isBigNumber: true }, "a_wAllet");
            }
        });

        //@ts-ignore
        Swap.getContract = jest.fn(() => ({ on: mockedOn }))
        //@ts-ignore
        mockedEther.providers = {
            //@ts-ignore
            JsonRpcProvider: jest.fn(),
        };

        new Web3SwapClient(fakeDatabase as Database).connectToChain(network);

        expect(mockedOn).toHaveBeenCalledTimes(2);
        expect(fakeDatabase.deleteOrder).toHaveBeenCalledTimes(1);
        expect(fakeDatabase.deleteOrder).toHaveBeenCalledWith(245, "a_wallet");
    });

    it("Should remove order on event Cancel", async () => {
        const mockedOn = jest.fn((eventName, callback) => {
            if (eventName === "Cancel") {
                callback({ _hex: "0xf5", _isBigNumber: true }, "a_waLl3t");
            }
        });
        //@ts-ignore
        mockedEther.providers = {
            //@ts-ignore
            JsonRpcProvider: jest.fn(),
        };
        //@ts-ignore
        Swap.getContract = jest.fn(() => ({ on: mockedOn }))

        new Web3SwapClient(fakeDatabase as Database).connectToChain(network);

        expect(mockedOn).toHaveBeenCalledTimes(2);
        expect(fakeDatabase.deleteOrder).toHaveBeenCalledTimes(1);
        expect(fakeDatabase.deleteOrder).toHaveBeenCalledWith(245, "a_wall3t");
    });

    describe("Do nothing", () => {
        it("event is undefined", () => {
            const mockedOn = jest.fn((eventName, callback) => {
                callback();
            });
            //@ts-ignore
            mockedEther.providers.JsonRpcProvider = jest.fn();
            //@ts-ignore
            Swap.getContract = jest.fn(() => ({ on: mockedOn }))

            new Web3SwapClient(fakeDatabase as Database).connectToChain(network);

            expect(fakeDatabase.deleteOrder).not.toHaveBeenCalled();
        });

        it("empty nonce", () => {
            const mockedOn = jest.fn((eventName, callback) => {
                callback({});
            });
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
            };
            //@ts-ignore
            Swap.getContract = jest.fn(() => ({ on: mockedOn }))

            new Web3SwapClient(fakeDatabase as Database).connectToChain(network);

            expect(fakeDatabase.deleteOrder).not.toHaveBeenCalled();
        });

        it("nonce has no value", () => {
            const mockedOn = jest.fn((eventName, callback) => {
                callback({ _hex: undefined, _isBigNumber: true }, "a_wallet");
            });
            //@ts-ignore
            mockedEther.providers = {
                //@ts-ignore
                JsonRpcProvider: jest.fn(),
            };
            //@ts-ignore
            Swap.getContract = jest.fn(() => ({ on: mockedOn }))

            new Web3SwapClient(fakeDatabase as Database).connectToChain(network);

            expect(fakeDatabase.deleteOrder).not.toHaveBeenCalled();
        });
    });
});