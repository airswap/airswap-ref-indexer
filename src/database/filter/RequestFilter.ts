import { SortField } from './SortField';
import { SortOrder } from './SortOrder';

export class RequestFilter {
    signerTokens?: string[];
    senderTokens?: string[];
    minSignerAmount?: BigInt;
    maxSignerAmount?: BigInt;
    minSenderAmount?: BigInt;
    maxSenderAmount?: BigInt;
    page!: number;
    sortField?: SortField;
    sortOrder?: SortOrder;
    maxAddedDate?: number;
}