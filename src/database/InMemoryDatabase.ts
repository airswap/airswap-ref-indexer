import crypto from "crypto";
import { Database } from './Database.js';
import { TransactionStatus } from '../model/TransactionStatus.js';
import { Entry } from '../model/Entry.js';

export class InMemoryDatabase implements Database {
  database: Record<string, Entry>;

  constructor() {
    this.database = {};
  }

  addEntry = (entry: Entry, entryId: string) => {
    this.database[entryId] = entry;
    return { key: entryId, value: entry };
  }

  addAll = (entries: Record<string, Entry>) => {
    this.database = { ...entries };
  }

  editEntry = (id: string, status: TransactionStatus) => {
    this.database[id]!.status = status;
  }

  getEntry = (id: string) => {
    return this.database[id];
  }

  getEntries = () => {
    return this.database;
  }

  entryExists = (id: string) => {
    return Object.keys(this.database).indexOf(id) != -1;
  }

  generateId(entry: Entry) {
    const stringObject = JSON.stringify(entry);
    const hashed = crypto.createHash("sha256").update(stringObject, "utf-8");
    return hashed.digest("hex");
  }
  
  isIdConsistent(entry: Entry, expectedId: string) {
    return this.generateId(entry) == expectedId;
  }
}