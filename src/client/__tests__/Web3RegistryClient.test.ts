import { Peers } from './../../peer/Peers';
import { ContractInterface } from 'ethers';
import { Web3RegistryClient } from './../Web3RegistryClient';
import { ethers } from "ethers";

jest.mock('ethers');
const mockedEther = ethers as jest.Mocked<typeof ethers>;

describe("Web3RegistryClient", () => {
    const apiKey = "apikey";
    const network = 5;
    const abi = [] as ContractInterface;
    let fakePeers: Partial<Peers>;

    beforeEach(() => {
        fakePeers = {
            addPeer: jest.fn(),
            addPeers: jest.fn(),
            clear: jest.fn()
        };
    });

    it("Should get other peers and ignore empty ones", async () => {
        //@ts-ignore
        mockedEther.providers.InfuraProvider = {
            getWebSocketProvider: jest.fn()
        };
        //@ts-ignore
        mockedEther.Contract = function () {
            return ({
                getURLs: () => ["peer1", ''],
                on: jest.fn(),
            });
        }
        const web3Client = new Web3RegistryClient(apiKey, network, fakePeers as Peers);

        const peers = await web3Client.getPeersFromRegistry();

        expect(peers).toEqual(["peer1"]);
    });

    it("Should return empty if result is undefined", async () => {
        //@ts-ignore
        mockedEther.providers.InfuraProvider = {
            getWebSocketProvider: jest.fn()
        };
        //@ts-ignore
        mockedEther.Contract = function () {
            return ({
                getURLs: () => undefined,
                on: jest.fn(),
            });
        }
        const web3Client = new Web3RegistryClient(apiKey, network, fakePeers as Peers);

        const peers = await web3Client.getPeersFromRegistry();

        expect(peers).toEqual([]);
    });

    it("Should add peer on event", async () => {
        const mockedOn = jest.fn((eventName, callback) => {
            callback("from", "to", {
                args: {
                    account: 'an_account',
                    url: 'http://localhost/'
                }
            });
        });
        //@ts-ignore
        mockedEther.providers.InfuraProvider = {
            getWebSocketProvider: jest.fn()
        };
        //@ts-ignore
        mockedEther.Contract = function () {
            return ({
                getURLs: () => [],
                on: mockedOn,
            });
        }
        new Web3RegistryClient(apiKey, network, fakePeers as Peers);
        expect(mockedOn).toHaveBeenCalledTimes(1);
        expect(fakePeers.addPeer).toHaveBeenCalledWith('http://localhost/');
    });

    it("Should remove peer on event", async () => {
        const mockedOn = jest.fn();
        const mockGetUrl = jest.fn(() => ['a_first_one', '']);
        //@ts-ignore
        mockedEther.providers.InfuraProvider = {
            getWebSocketProvider: jest.fn()
        };
        //@ts-ignore
        mockedEther.Contract = function () {
            return ({
                getURLs: mockGetUrl,
                on: mockedOn,
            });
        }

        await new Web3RegistryClient(apiKey, network, fakePeers as Peers)
            .onSetURLEvent("from", "to", {
                args: {
                    account: "an_account",
                    url: ''
                }
            });

        expect(mockedOn).toHaveBeenCalledTimes(1);
        expect(mockGetUrl).toHaveBeenCalledTimes(1);
        expect(fakePeers.clear).toHaveBeenCalledTimes(1);
        expect(fakePeers.addPeers).toHaveBeenCalledWith(['a_first_one']);
        expect(fakePeers.addPeer).not.toHaveBeenCalled();
    });
});