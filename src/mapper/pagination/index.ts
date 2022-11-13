import { Pagination } from '@airswap/libraries/build/src/Indexer';

const DEFAULT_MIN_MAX = "1";
export function computePagination(elementPerPage: number, totalResults: number, actualPage: number = 1): Pagination {
    if (totalResults === 0) {
        return { first: DEFAULT_MIN_MAX, last: DEFAULT_MIN_MAX };
    }

    const totalPages = Math.ceil(totalResults / elementPerPage);
    const nextPage = actualPage >= totalPages ? undefined : `${actualPage + 1}`;
    let previousPage;
    if (actualPage > totalPages) {
        previousPage = `${totalPages}`;
    } else if (totalPages <= 0) {
        previousPage = `${DEFAULT_MIN_MAX}`;
    } else {
        previousPage = actualPage >= 2 ? `${actualPage - 1}` : undefined;
    }

    return {
        first: DEFAULT_MIN_MAX,
        last: `${totalPages > 0 ? totalPages : DEFAULT_MIN_MAX}`,
        prev: previousPage,
        next: nextPage,
    };
}