import { DbOrderFilter } from 'model/DbOrderTypes.js';
import { toNumber, toArray, toBigInt, toString } from '../converter/index.js';
import { isNumeric } from '../validator/index.js';
import { toSortField, toSortOrder } from '@airswap/libraries';

export function mapAnyToOrderFilter(data: any, maxResultByQuery: number): DbOrderFilter {
  let limit = maxResultByQuery;
  if (isNumeric(data.limit)) {
    const requestedLimit = toNumber(data.limit)!;
    if (requestedLimit < limit) {
      limit = requestedLimit;
    }
  }

  let offset = 0;
  if (isNumeric(data.offset)) {
    const requestedOffset = toNumber(data.offset)!;
    if (requestedOffset > 0) {
      offset = requestedOffset;
    }
  }

  return {
    chainId: toNumber(data.chainId),
    excludeNonces: toArray(data.excludeNonces),
    nonce: toString(data.nonce),
    senderIds: toArray(data.senderIds),
    signerIds: toArray(data.signerIds),
    signerWallet: data.signerWallet?.toLocaleLowerCase(),
    signerMinAmount: toBigInt(data.signerMinAmount),
    signerMaxAmount: toBigInt(data.signerMaxAmount),
    signerTokens: toArray(data.signerTokens),
    senderWallet: data.senderWallet?.toLocaleLowerCase(),
    senderMinAmount: toBigInt(data.senderMinAmount),
    senderMaxAmount: toBigInt(data.senderMaxAmount),
    senderTokens: toArray(data.senderTokens),
    sortField: toSortField(data.sortField),
    sortOrder: toSortOrder(data.sortOrder),
    offset,
    limit
  };
}
