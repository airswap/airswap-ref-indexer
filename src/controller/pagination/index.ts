import { Pagination } from './../../model/Pagination.js';

const DEFAULT_MIN_MAX = "1";
export function computePagination(elementPerPage: number, totalResults: number, actualPage: number = 1) {
    if (totalResults === 0) {
        return new Pagination(DEFAULT_MIN_MAX, DEFAULT_MIN_MAX);
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

    return new Pagination(DEFAULT_MIN_MAX, `${totalPages > 0 ? totalPages : DEFAULT_MIN_MAX}`, nextPage, previousPage);
}