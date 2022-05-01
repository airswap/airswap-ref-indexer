import { Entry } from './../model/Entry.js';
import { TransactionStatus } from './../model/TransactionStatus.js';
export interface Database {
    addEntry(entry: Entry, entryId: string): void;

    addAll(entries: Record<string, Entry>): void;

    editEntry(id: string, status: TransactionStatus): void;

    getEntry(id: string): Entry;

    getEntries(): Record<string, Entry>;

    entryExists(id: string): boolean;

    generateId(entry: Entry): string;

    isIdConsistent(entry: Entry, expectedId: string): boolean;
}