import { forgeDbOrderERC20, forgeFullOrderERC20 } from '../../Fixtures';
import { mapAllIndexedOrderResponseToDbOrderERC20 } from '../mapIndexedOrderResponseToDbOrderERC20';

describe('mapIndexedOrderResponseToDbOrderERC20', () => {
  it('Nominal', () => {
    const parameter = {
      hash: {
        hash: 'hash',
        order: forgeFullOrderERC20(1),
        addedOn: 1
      }
    };
    const expected = {
      hash: {
        hash: 'hash',
        order: forgeDbOrderERC20(1),
        addedOn: 1
      }
    };

    const result = mapAllIndexedOrderResponseToDbOrderERC20(parameter);

    expect(result).toEqual(expected);
  });

  it('Ignore inconsistent data', () => {
    const parameter = {
      hash: {
        hash: 'hash',
        order: forgeFullOrderERC20(1),
        addedOn: 1
      },
      hash2: {},
      hash3: {
        order: forgeFullOrderERC20(1),
        addedOn: 1
      },
      hash4: {
        hash: 'hash4',
        addedOn: 1
      },
      hash5: {
        hash: 'hash5',
        order: forgeFullOrderERC20(1)
      },
      hash6: undefined,
      hash7: 'toto'
    };
    const expected = {
      hash: {
        hash: 'hash',
        order: forgeDbOrderERC20(1),
        addedOn: 1
      }
    };

    //@ts-ignore
    const result = mapAllIndexedOrderResponseToDbOrderERC20(parameter);

    expect(result).toEqual(expected);
  });
});
