import { isNumeric, isDateInRange } from '../index';

jest
    .useFakeTimers()
    .setSystemTime(new Date(1));
    
describe("Validator", () => {
    describe("isNumeric", () => {
        test("should return false", () => {
            expect(isNumeric("a")).toBe(false);
            expect(isNumeric("1a")).toBe(false);
            expect(isNumeric("a1")).toBe(false);
            expect(isNumeric("")).toBe(false);
            expect(isNumeric(" ")).toBe(false);
            expect(isNumeric(null)).toBe(false);
            expect(isNumeric(undefined)).toBe(false);
            //@ts-ignore
            expect(isNumeric({})).toBe(false);
            //@ts-ignore
            expect(isNumeric([])).toBe(false);
        });

        test("should return true", () => {
            expect(isNumeric("1")).toBe(true);
            //@ts-ignore
            expect(isNumeric(2)).toBe(true);
        });
    });

    describe("isDateInRange", () => {
        test("should return false", () => {
            expect(isDateInRange("a", 0)).toBe(false);
            expect(isDateInRange("1a", 0)).toBe(false);
            expect(isDateInRange("a1", 0)).toBe(false);
            expect(isDateInRange("", 0)).toBe(false);
            expect(isDateInRange(" ", 0)).toBe(false);
            expect(isDateInRange(null, 0)).toBe(false);
            expect(isDateInRange(undefined, 0)).toBe(false);
            //@ts-ignore
            expect(isDateInRange({}, 0)).toBe(false);
            //@ts-ignore
            expect(isDateInRange([], 0)).toBe(false);
            expect(isDateInRange("604800005", 1)).toBe(false);
        });

        test("should return true", () => {
            expect(isDateInRange("604", 1)).toBe(true);
        });
    });

});