import { toNumber, toArray } from '../index'

describe("converter", () => {

    describe("toNumber", () => {
        test("should return undefined", () => {
            expect(toNumber("a")).toBeUndefined();
            expect(toNumber("1a")).toBeUndefined();
            expect(toNumber("a1")).toBeUndefined();
            expect(toNumber("")).toBeUndefined();
            expect(toNumber(" ")).toBeUndefined();
            //@ts-ignore
            expect(toNumber(null)).toBeUndefined();
            //@ts-ignore
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

    describe("toArray", () => {
        test("should return undefined", () => {
            //@ts-ignore
            expect(toArray("")).toBeUndefined();
            //@ts-ignore
            expect(toArray(1)).toBeUndefined();
            //@ts-ignore
            expect(toArray(null)).toBeUndefined();
            //@ts-ignore
            expect(toArray(undefined)).toBeUndefined();
            //@ts-ignore
            expect(toArray({})).toBeUndefined();
        });

        test("should map to array", () => {            
            expect(toArray([])).toEqual([]);
            expect(toArray(["a"])).toEqual(["a"]);
            //@ts-ignore
            expect(toArray(["a", 1, "", " "])).toEqual(["a"]);
        });

    });
});