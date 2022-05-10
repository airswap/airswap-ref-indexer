import { Entry } from './../model/Entry.js';
import { TransactionStatus } from './../model/TransactionStatus.js';
export interface Database {
    addEntry(entry: Entry): void;

    addAll(entries: Record<string, Entry>): void;

    editEntry(id: string, status: TransactionStatus): void;

    getEntry(id: string): Promise<Entry>;
    
    getEntries(): Promise<Record<string, Entry>>;

    entryExists(id: string): Promise<boolean>;

    generateId(entry: Entry): string;

    isIdConsistent(entry: Entry, expectedId: string): boolean;
}