import axios from 'axios';
import { BroadcastClient } from "./BroadcastClient.js";
import { Entry } from './../model/Entry.js';
import { TransactionStatus } from './../model/TransactionStatus.js';

const entryPath = "/entries/";
export class EntryClient implements BroadcastClient {
    async getEntries(url: string) {
        console.log("S---> GET", url + entryPath);
        return await axios.get(url + entryPath)
    }
    async addEntry(url: string, entry: Entry) {
        console.log("S---> POST", url + entryPath, entry);
        return await axios.post(url + entryPath, entry)
    }
    async editEntry(url: string, entryId: string, status: TransactionStatus) {
        console.log("S---> PUT", url + entryPath + entryId, { status });
        return await axios.put(url + entryPath + entryId, {
            status
        });
    }

    async sendTo(method: string, url: string, data?: any) {
        console.log("S--->", method, url, data);
        try {
            switch (method) {
                case "GET":
                    return await axios.get(url);
                case "POST":
                    return await axios.post(url, data);
                case "PUT":
                    return await axios.put(url, data);
                case "DELETE":
                    return await axios.delete(url);
            }
        } catch (e) {
            console.log("Client did not answer !", method, url, data, e);
        }
    }
}