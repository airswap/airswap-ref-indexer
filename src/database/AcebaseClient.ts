import { AceBase } from 'acebase';
import crypto from "crypto";
import { Entry } from '../model/Entry.js';
import { TransactionStatus } from '../model/TransactionStatus.js';
import { AceBaseLocalSettings } from './../../node_modules/acebase/index.d';
import { Database } from './Database.js';

const ENTRY_REF = "entries";

export class AceBaseClient implements Database {

    private db: AceBase;

    constructor() {
        const options = { logLevel: 'verbose', storage: { path: '.' } } as AceBaseLocalSettings; // optional settings
        this.db = new AceBase('mydb', options);  // Creates or opens a database with name "mydb"
        this.db.ready(() => { console.log("database is ready"); });
    }

    addEntry(entry: Entry, entryId: string): void {
        entry.id = entryId;
        console.log("addEntry", entry)
        this.db.ref(ENTRY_REF).push(entry);
    }

    addAll(entries: Record<string, Entry>): void {
        Object.keys(entries).forEach(id => {
            this.addEntry(entries[id], id);
        })
    }
    editEntry(id: string, status: TransactionStatus): void {
        throw new Error('Method not implemented.');
    }

    async getEntry(id: string): Promise<Entry> {
        const query = await this.db.query(ENTRY_REF)
            .filter('id', '==', id)
            .get();
        return Promise.resolve(this.datarefToRecord(query)[id]);
    }

    async getEntries(): Promise<Record<string, Entry>> {
        const data = await this.db.query(ENTRY_REF).get();
        let mapped = {};
        data.forEach(d => {
            const mapp = this.datarefToRecord(d.val());
            mapped = { ...mapped, ...mapp };
        });
        return Promise.resolve(mapped);
    }

    private datarefToRecord(data): Record<string, Entry> {
        const mapped: Record<string, Entry> = {};
        mapped[data.id] = new Entry(data.by, data.from, data.to, +data.nb, +data.price, data.status);
        return mapped;
    }

    async entryExists(id: string): Promise<boolean> {
        const query = await this.db.query(ENTRY_REF)
            .filter('id', '==', id)
            .get();
        console.log("entryExists", query);
        return query.length == 1;
    }

    generateId(entry: Entry) {
        const lightenEntry = this.extractData(entry);
        console.log("generateId", entry, lightenEntry);
        const stringObject = JSON.stringify(lightenEntry);
        const hashed = crypto.createHash("sha256").update(stringObject, "utf-8");
        return hashed.digest("hex");
    }

    isIdConsistent(entry: Entry, expectedId: string) {
        const id = this.generateId(entry);
        console.log("isIdConsistent", entry, expectedId, id);
        return id == expectedId;
    }

    private extractData(entry: Entry) {
        const lightenEntry = new Entry(
            entry.by,
            entry.from,
            entry.to,
            entry.nb,
            entry.price
        );
        return lightenEntry;
    }
}