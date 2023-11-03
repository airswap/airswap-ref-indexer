import { Peers } from './../../peer/Peers';
import { Web3RegistryClient } from './../Web3RegistryClient';
import { ethers } from 'ethers';
import { RegistryV4 } from '@airswap/libraries';

jest.mock('@airswap/libraries', () => ({
  RegistryV4: {
    getContract: () => jest.fn()
  }
}));

jest.mock('ethers');
const mockedEther = ethers as jest.Mocked<typeof ethers>;

describe('Web3RegistryClient', () => {
  const apiKey = 'apikey';
  const network = 5;
  let fakePeers: Partial<Peers>;

  beforeEach(() => {
    fakePeers = {
      addPeer: jest.fn(),
      addPeers: jest.fn(),
      clear: jest.fn()
    };
  });

  it('Should get other peers and ignore empty ones', async () => {
    mockedEther.providers = {
      //@ts-ignore
      JsonRpcProvider: jest.fn(),
      //@ts-ignore
      WebSocketProvider: jest.fn()
    };

    //@ts-ignore
    RegistryV4.getContract = jest.fn(() => ({ on: jest.fn() }));
    //@ts-ignore
    RegistryV4.getServerURLs = () => Promise.resolve(['peer1', '']);

    const web3Client = new Web3RegistryClient(apiKey, fakePeers as Peers);
    await web3Client.connect(network);

    expect(fakePeers.addPeers).toHaveBeenCalledWith(['peer1']);
  });

  it('Should not connect twice', async () => {
    mockedEther.providers = {
      //@ts-ignore
      JsonRpcProvider: jest.fn(),
      //@ts-ignore
      WebSocketProvider: jest.fn()
    };

    //@ts-ignore
    RegistryV4.getContract = jest.fn(() => ({ on: jest.fn() }));
    //@ts-ignore
    RegistryV4.getServerURLs = () => Promise.resolve(['peer1', '']);

    const web3Client = new Web3RegistryClient(apiKey, fakePeers as Peers);
    await web3Client.connect(network);
    await web3Client.connect(network);

    expect(web3Client.getConnectedChains()).toEqual(['5']);
  });

  it('Should return empty if result is undefined', async () => {
    mockedEther.providers = {
      //@ts-ignore
      JsonRpcProvider: jest.fn(),
      //@ts-ignore
      WebSocketProvider: jest.fn()
    };
    //@ts-ignore
    RegistryV4.getContract = jest.fn(() => ({ on: jest.fn() }));
    //@ts-ignore
    RegistryV4.getServerURLs = () => undefined;

    const web3Client = new Web3RegistryClient(apiKey, fakePeers as Peers);
    await web3Client.connect(network);
    const peers = await web3Client.getPeersFromRegistry();

    expect(peers).toEqual([]);
  });

  it('Should add peer on event', async () => {
    const mockedOn = jest.fn((eventName, callback) => {
      callback('from', 'to', {
        args: {
          account: 'an_account',
          url: 'http://localhost/'
        }
      });
    });
    mockedEther.providers = {
      //@ts-ignore
      JsonRpcProvider: jest.fn(),
      //@ts-ignore
      WebSocketProvider: jest.fn()
    };
    //@ts-ignore
    RegistryV4.getContract = jest.fn(() => ({ on: mockedOn }));
    //@ts-ignore
    RegistryV4.getServerURLs = () => [];

    await new Web3RegistryClient(apiKey, fakePeers as Peers).connect(network);

    // expect(mockedOn).toHaveBeenCalledTimes(1);
    expect(fakePeers.addPeer).toHaveBeenCalledWith('http://localhost/');
  });

  it('Should remove peer on event', async () => {
    const mockedOn = jest.fn();
    const mockGetUrl = jest.fn(() => ['a_first_one', '', undefined]);
    mockedEther.providers = {
      //@ts-ignore
      JsonRpcProvider: jest.fn(),
      //@ts-ignore
      WebSocketProvider: jest.fn()
    };

    //@ts-ignore
    RegistryV4.getContract = jest.fn(() => ({ on: mockedOn }));
    //@ts-ignore
    RegistryV4.getServerURLs = mockGetUrl;

    const web3Client = new Web3RegistryClient(apiKey, fakePeers as Peers);
    await web3Client.connect(network);
    await web3Client.onSetURLEvent('from', 'to', {
      args: {
        account: 'an_account',
        url: ''
      }
    });

    expect(mockedOn).toHaveBeenCalledTimes(1);
    expect(mockGetUrl).toHaveBeenCalledTimes(2); // connect + getPeers
    expect(fakePeers.clear).toHaveBeenCalledTimes(1);
    expect(fakePeers.addPeers).toHaveBeenCalledWith(['a_first_one']);
    expect(fakePeers.addPeer).not.toHaveBeenCalled();
  });
});
