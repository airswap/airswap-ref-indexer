import { Request, Response } from "express";
import { Database } from "../database/Database.js";
import { stringToTransactionStatus, TransactionStatus } from '../model/TransactionStatus.js';
import { Peers } from "../peer/Peers.js";

export class EntryController {

    private peers: Peers;
    private database: Database;

    constructor(peers: Peers, database: Database) {
        this.peers = peers;
        this.database = database;
    }

    addEntry = async (request: Request, response: Response) => {
        console.log("R<---", request.method, request.url, request.body);
        const entryId = request.params.entryId;
        const entry = request.body;

        if (!entry || Object.keys(entry).length == 0) {
            response.sendStatus(400);
            return;
        }

        if (entryId && !this.database.isIdConsistent(entry, entryId)) {
            response.sendStatus(400);
            return;
        }

        const id = entryId || this.database.generateId(entry);
        console.log("generated ID", id)
        const entryExists = await this.database.entryExists(id);
        if (entryExists) {
            response.sendStatus(204);
            return;
        }

        entry.id = id;
        if (!entry.status) {
            entry.status = TransactionStatus.IN_PROGRESS;
        }

        this.database.addEntry(entry);
        const url = entryId ? request.url : `${request.url}/${id}`
        this.peers.broadcast(request.method, url, request.body);
        response.sendStatus(204);
    }

    editEntry = async (request: Request, response: Response) => {
        console.log("R<---", request.method, request.url, request.body);
        if (!request.params.entryId || !request.body.status) {
            response.sendStatus(400);
            return;
        }

        const status = stringToTransactionStatus(request.body.status)
        if (status === TransactionStatus.UNKNOWN) {
            response.sendStatus(403);
            return;
        }

        if (!this.database.entryExists(request.params.entryId)) {
            response.sendStatus(403);
            return;
        }

        const entry = await this.database.getEntry(request.params.entryId);
        if (entry.status == status) {
            response.sendStatus(204);
            return;
        }

        this.database.editEntry(request.params.entryId, status);
        this.peers.broadcast(request.method, request.url, request.body);
        response.sendStatus(204);
    }

    getEntries = async (request: Request, response: Response) => {
        console.log("R<---", request.method, request.url, request.body);
        const entries = await this.database.getEntries();
        response.json({ entries });
    }
}