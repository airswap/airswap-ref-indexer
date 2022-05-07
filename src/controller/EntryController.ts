import { Request, Response } from "express";
import { Database } from "../database/Database.js";
import { Peers } from "../peer/Peers.js";

export class EntryController {

    private peers: Peers;
    private database: Database;

    constructor(peers: Peers, database: Database) {
        this.peers = peers;
        this.database = database;
    }

    addEntry = (request: Request, response: Response) => {
        console.log("R<---", request.method, request.url, request.body);
        const entryId = request.params.entryId;
        const data = request.body;

        if (!data || Object.keys(data).length == 0) {
            response.sendStatus(400);
            return;
        }

        if (entryId && !this.database.isIdConsistent(data, entryId)) {
            response.sendStatus(400);
            return;
        }

        const id = entryId || this.database.generateId(data);
        if (this.database.entryExists(id)) {
            response.sendStatus(204);
            return;
        }

        this.database.addEntry(data, id);
        const url = entryId ? request.url : `${request.url}/${id}`
        this.peers.broadcast(request.method, url, request.body);
        response.sendStatus(204);
    }

    editEntry = (request: Request, response: Response) => {
        console.log("R<---", request.method, request.url, request.body);
        if (!request.params.entryId || !request.body.status) {
            response.sendStatus(400);
            return;
        }

        if (!this.database.entryExists(request.params.entryId)) {
            response.sendStatus(403);
            return;
        }

        if (this.database.getEntry(request.params.entryId).status == request.body.status) {
            response.sendStatus(204);
            return;
        }

        this.database.editEntry(request.params.entryId, request.body.status);
        this.peers.broadcast(request.method, request.url, request.body);
        response.sendStatus(204);
    }

    getEntries = (request: Request, response: Response) => {
        console.log("R<---", request.method, request.url, request.body);
        response.json({ entries: this.database.getEntries() });
    }
}