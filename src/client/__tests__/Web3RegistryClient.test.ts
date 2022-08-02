import { Peers } from './../../peer/Peers';
import { ContractInterface } from 'ethers';
import { Web3RegistryClient } from './../Web3RegistryClient';
import { ethers } from "ethers";

jest.mock('ethers');
const mockedEther = ethers as jest.Mocked<typeof ethers>;

describe("Web3RegistryClient", () => {
    const apiKey = "apikey";
    const registryAddress = "registryAddres";
    const network = "rinkeby";
    const abi = [] as ContractInterface;
    let fakePeers: Partial<Peers>;

    beforeEach(() => {
        fakePeers = {
            addPeer: jest.fn(),
        };
    });

    it("Should get other peers", async () => {
        mockedEther.providers = {
            //@ts-ignore
            InfuraProvider: jest.fn(() => ({
                on: jest.fn()
            }))
        };
        //@ts-ignore
        mockedEther.Contract = function () {
            return ({
                getURLs: () => ["peer1"]
            });
        }
        const web3Client = new Web3RegistryClient(apiKey, registryAddress, abi as ContractInterface, network, fakePeers as Peers);

        const peers = await web3Client.getPeersFromRegistry();

        expect(peers).toEqual(["peer1"]);
    });

    it("Should return empty if result is undefined", async () => {
        mockedEther.providers = {
            //@ts-ignore
            InfuraProvider: jest.fn(() => ({
                on: jest.fn()
            }))
        };
        //@ts-ignore
        mockedEther.Contract = function () {
            return ({
                getURLs: () => undefined
            });
        }
        const web3Client = new Web3RegistryClient(apiKey, registryAddress, abi as ContractInterface, network, fakePeers as Peers);

        const peers = await web3Client.getPeersFromRegistry();

        expect(peers).toEqual([]);
    });

    it("Should add peer on event", async () => {
        const mockedOn = jest.fn((filter, callback) => {
            callback("sender", "url");
        });
        mockedEther.providers = {
            //@ts-ignore
            InfuraProvider: jest.fn(() => ({
                on: mockedOn
            }))
        };
        //@ts-ignore
        mockedEther.Contract = function () {
            return ({
                getURLs: () => []
            });
        }
        new Web3RegistryClient(apiKey, registryAddress, abi as ContractInterface, network, fakePeers as Peers);
        expect(mockedOn).toHaveBeenCalledTimes(1);
        expect(fakePeers.addPeer).toHaveBeenCalledWith("url");
    });
});