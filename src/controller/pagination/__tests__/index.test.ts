import { Pagination } from './../../../model/Pagination';
import { computePagination } from '../index.js';
describe("Pagination", () => {
    it("should return default pagination 1,1 if less than max result", () => {
        const expected = new Pagination("1", "1");

        const result = computePagination(100, 10, 1);

        expect(result).toEqual(expected);
    });

    it("should compute pagination", () => {
        const expected = new Pagination("1", "10", "2");

        const result = computePagination(10, 100, 1);

        expect(result).toEqual(expected);
    });

    it("should compute pagination with missing page", () => {
        const expected = new Pagination("1", "10", "2");

        const result = computePagination(10, 100);

        expect(result).toEqual(expected);
    });

    it("should compute pagination next and previous", () => {
        const expected = new Pagination("1", "10", "3", "1");

        const result = computePagination(10, 100, 2);

        expect(result).toEqual(expected);
    });

    it("should not compute pagination next, if already on last page", () => {
        const expected = new Pagination("1", "10", undefined, "9");

        const result = computePagination(10, 100, 10);

        expect(result).toEqual(expected);
    });

    it("Return pagination 1,1 if no results", () => {
        const expected = new Pagination("1", "1");

        const result = computePagination(10, 0, 1);

        expect(result).toEqual(expected);
    });

    it("Return pagination min,max and previous to max if page is too superior to maximum", () => {
        const expected = new Pagination("1", "5", undefined, "5");

        const result = computePagination(10, 50, 9);

        expect(result).toEqual(expected);
    });
});