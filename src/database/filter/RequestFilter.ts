import { SortField } from './SortField';
import { SortOrder } from './SortOrder';

export class RequestFilter {
    signerTokens?: string[];
    senderTokens?: string[];
    minSignerAmount?: number;
    maxSignerAmount?: number;
    minSenderAmount?: number;
    maxSenderAmount?: number;
    // @todo: use it
    page?: number;
    sortField?: SortField;
    sortOrder?: SortOrder;
    maxAddedDate?: number;
}



