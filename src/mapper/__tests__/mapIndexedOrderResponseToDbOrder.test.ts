import { forgeDbOrder, forgeFullOrder } from '../../Fixtures';
import { mapAllIndexedOrderResponseToDbOrder } from '../mapIndexedOrderResponseToDbOrder';

describe('mapIndexedOrderResponseToDbOrder', () => {
  it('Nominal', () => {
    const parameter = {
      hash: {
        hash: 'hash',
        order: forgeFullOrder(1),
        addedOn: 1
      }
    };
    const expected = {
      hash: {
        hash: 'hash',
        order: forgeDbOrder(1),
        addedOn: 1
      }
    };

    const result = mapAllIndexedOrderResponseToDbOrder(parameter);

    expect(result).toEqual(expected);
  });

  it('Ignore inconsistent data', () => {
    const parameter = {
      hash: {
        hash: 'hash',
        order: forgeFullOrder(1),
        addedOn: 1
      },
      hash2: {},
      hash3: {
        order: forgeFullOrder(1),
        addedOn: 1
      },
      hash4: {
        hash: 'hash4',
        addedOn: 1
      },
      hash5: {
        hash: 'hash5',
        order: forgeFullOrder(1)
      },
      hash6: undefined,
      hash7: 'toto'
    };
    const expected = {
      hash: {
        hash: 'hash',
        order: forgeDbOrder(1),
        addedOn: 1
      }
    };

    //@ts-ignore
    const result = mapAllIndexedOrderResponseToDbOrder(parameter);

    expect(result).toEqual(expected);
  });
});
