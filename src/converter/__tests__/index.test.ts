import { toNumber, toStrings } from '../index'

describe("converter", () => {

    describe("toNumber", () => {
        test("should return undefined", () => {
            expect(toNumber("a")).toBeUndefined();
            expect(toNumber("1a")).toBeUndefined();
            expect(toNumber("a1")).toBeUndefined();
            expect(toNumber("")).toBeUndefined();
            expect(toNumber(" ")).toBeUndefined();
            expect(toNumber(null)).toBeUndefined();
            expect(toNumber(undefined)).toBeUndefined();
            //@ts-ignore
            expect(toNumber({})).toBeUndefined();
            //@ts-ignore
            expect(toNumber([])).toBeUndefined();
        });

        test("should return a number", () => {
            expect(toNumber("1")).toEqual(1);
            //@ts-ignore
            expect(toNumber(2)).toEqual(2);
        });
    });
    
    describe("toStrings", () => {
        test("should return undefined", () => {
            expect(toStrings("")).toBeUndefined();
            expect(toStrings(" ")).toBeUndefined();
            expect(toStrings(null)).toBeUndefined();
            expect(toStrings(undefined)).toBeUndefined();
            //@ts-ignore
            expect(toStrings({})).toBeUndefined();
            //@ts-ignore
            expect(toStrings([])).toBeUndefined();
        });

        test("should map to array", () => {
            expect(toStrings("a")).toEqual(["a"]);
            expect(toStrings("a,b")).toEqual(["a", "b"]);
        });

    });
});