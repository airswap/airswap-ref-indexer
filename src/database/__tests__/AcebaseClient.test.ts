import { AceBaseClient } from "../AcebaseClient";
import { Entry } from './../../model/Entry';
import { TransactionStatus } from './../../model/TransactionStatus';

describe("ace base implementation", () => {
    let db = new AceBaseClient("dbtest");

    beforeEach(() => {
        db = new AceBaseClient("dbtest");
    });

    afterEach(async () => {
        await db.close();
    });

    test("Should add & get entry", async () => {
        const entry = new Entry("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS, "id");

        await db.addEntry(entry);
        const entries = await db.getEntries();

        expect(entries).toEqual({ id: entry });
    });

    test("Should add all & get entries", async () => {
        const entry = new Entry("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS, "id");
        const anotherEntry = new Entry("another", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS, "another_id");

        await db.addAll({ "id": entry, "another_id": anotherEntry });
        const entries = await db.getEntries();

        expect(entries).toEqual({ "id": entry, "another_id": anotherEntry });
    });

    test("Should edit entry", async () => {
        const expected = new Entry("by", "from", "to", 3, 4, TransactionStatus.DONE, "id");
        const entry = new Entry("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS, "id");
        await db.addEntry(entry);

        await db.editEntry("id", TransactionStatus.DONE);
        const entries = await db.getEntries();

        expect(entries).toEqual({ id: expected });
    });

    test("Should return true if entry exists", async () => {
        const entry = new Entry("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS, "id");
        await db.addEntry(entry);

        const entryExists = await db.entryExists("id");

        expect(entryExists).toBe(true);
    });

    test("Should return false if entry does not exist", async () => {
        const entry = new Entry("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS, "id");
        await db.addEntry(entry);

        const entryExists = await db.entryExists("unknownId");

        expect(entryExists).toBe(false);
    });

    test("Should return entry", async () => {
        const entry = new Entry("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS, "id");
        await db.addEntry(entry);

        const entryExists = await db.getEntry("id");

        expect(entryExists).toEqual(entry);
    });

    test("Should not return entry", async () => {
        const entry = new Entry("by", "from", "to", 3, 4, TransactionStatus.IN_PROGRESS, "id");
        await db.addEntry(entry);

        const entryExists = await db.getEntry("unknownId");

        expect(entryExists).toBe(null);
    });

    test("sha 256 does not change", () => {
        const entry = new Entry("by", "from", "to", 3, 4);

        const id = db.generateId(entry);

        expect(id).toBe("6d9844c1f4bb9a47aea4c9752782b300085ec376e7ea90f7f966349465dda064");
    });
});