import { ethers } from 'ethers';
import { Web3RegistryClient } from '../../client/Web3RegistryClient';
import { Database } from '../../database/Database';
import { forgeIndexedOrderResponseERC20, forgeIndexedOrderResponse } from '../../Fixtures';
import { Peers } from '../../peer/Peers';
import { RootService } from '../RootService';

jest.mock('@airswap/libraries', () => ({
  RegistryV4: {
    getContract: jest.fn(() => ({ on: jest.fn() })),
    getServerURLs: jest.fn(),
    addresses: {
      5: '0xanaddrres'
    }
  }
}));
jest.mock('ethers');

describe('Root service', () => {
  let fakeDb: Partial<Database>;
  let fakePeers: Partial<Peers>;
  const indexedOrderResponseERC20 = forgeIndexedOrderResponseERC20(1653854738949, 1653854738959);
  const indexedOrderResponse = forgeIndexedOrderResponse(1653854738949, 1653854738959);

  beforeEach(() => {
    fakeDb = {
      getOrdersERC20: jest.fn(() =>
        Promise.resolve({
          orders: { aze: indexedOrderResponseERC20 },
          pagination: {
            limit: 10,
            offset: 0,
            total: 1
          }
        })
      ),
      getOrders: jest.fn(() =>
        Promise.resolve({
          orders: { aze: indexedOrderResponse },
          pagination: {
            limit: 10,
            offset: 0,
            total: 1
          }
        })
      )
    };
    fakePeers = {
      getConnectablePeers: jest.fn(() => []),
      addPeers: jest.fn()
    };
  });

  test('get', async () => {
    const expected = {
      databaseOrders: 1,
      databaseOrdersERC20: 1,
      peers: [],
      networks: ['5'],
      registry: { '5': '0xanaddrres' }
    };

    const registryClient = new Web3RegistryClient('', fakePeers as Peers);
    await registryClient.connect(5);
    const result = await new RootService(fakePeers as Peers, fakeDb as Database, registryClient).get();

    expect(result).toEqual(expected);
  });
});
