import { getDatabase } from '../getDatabase.js';

describe('getDatabase', () => {
    it("should return null", async() => {
        expect(await getDatabase(true, "adb", 10)).toBeNull();
    });

    it("should return inmemory", async() => {
        const client = await getDatabase(true, "IN_MEMORY", 10);
        expect(client!.constructor.name).toBe("InMemoryDatabase");
    });

    it("should return acebase", async() => {
        const client = await getDatabase(true, "ACEBASE", 10);
        expect(client!.constructor.name).toBe("AceBaseClient");
    });
    
});