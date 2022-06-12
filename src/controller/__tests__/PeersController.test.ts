import { Request, Response } from 'express';
import { Peers } from './../../peer/Peers';
import { PeersController } from './../PeersController';
describe("OtcOrder controller", () => {
    let fakePeers: Partial<Peers>;

    beforeEach(() => {
        fakePeers = {
            getPeers: jest.fn(() => ["other_peer_url"]),
            containsUnknownPeers: jest.fn(),
            addPeers: jest.fn(),
            broadcast: jest.fn(),
            removePeer: jest.fn(),
            peerExists: jest.fn()
        };
    })

    test("get peers", () => {
        const mockRequest = {
            body: undefined,
            params: {},
            method: "GET",
            url: "/peers"
        } as Request;

        const mockResponse = {
            json: jest.fn()
        } as Partial<Response>;

        const expected: string[] = ["other_peer_url"];

        new PeersController(fakePeers as Peers).getPeers(mockRequest, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith(expected);
    });

    describe("Add peer", () => {
        test("Add peer nominal & broadcast", () => {
            const mockRequest = {
                body: { urls: ["other_peer_url"] },
                params: {},
                method: "POST",
                url: "/peers"
            } as Request;

            const mockResponse = {
                json: jest.fn(),
                sendStatus: jest.fn(),
            } as Partial<Response>;

            //@ts-ignore
            fakePeers.containsUnknownPeers.mockImplementation(() => true);

            const expected: string[] = ["other_peer_url"];

            new PeersController(fakePeers as Peers).addPeers(mockRequest, mockResponse as Response);

            expect(fakePeers.containsUnknownPeers).toHaveBeenCalledWith(expected);
            expect(fakePeers.addPeers).toHaveBeenCalledWith(expected);
            expect(fakePeers.broadcast).toHaveBeenCalledWith("POST", "/peers", { "urls": ["other_peer_url"] });
        });

        test("Add: already added", () => {
            const mockRequest = {
                body: { urls: ["other_peer_url"] },
                params: {},
                method: "POST",
                url: "/peers"
            } as Request;

            const mockResponse = {
                json: jest.fn(),
                sendStatus: jest.fn(),
            } as Partial<Response>;

            //@ts-ignore
            fakePeers.containsUnknownPeers.mockImplementation(() => false);

            const expected: string[] = ["other_peer_url"];

            new PeersController(fakePeers as Peers).addPeers(mockRequest, mockResponse as Response);

            expect(fakePeers.containsUnknownPeers).toHaveBeenCalledWith(expected);
            expect(fakePeers.addPeers).toHaveBeenCalledTimes(0);
            expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
            expect(mockResponse.sendStatus).toHaveBeenCalledWith(204);
        });

        test("Missing url", () => {
            const mockRequest = {
                body: {},
                params: {},
                method: "POST",
                url: "/peers"
            } as Request;

            const mockResponse = {
                json: jest.fn(),
                sendStatus: jest.fn(),
            } as Partial<Response>;

            new PeersController(fakePeers as Peers).addPeers(mockRequest, mockResponse as Response);

            expect(fakePeers.containsUnknownPeers).toHaveBeenCalledTimes(0);
            expect(fakePeers.addPeers).toHaveBeenCalledTimes(0);
            expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
            expect(mockResponse.sendStatus).toHaveBeenCalledWith(400);
        });
    });

    describe("Remove peer", () => {
        test("Remove peer nominal & broadcast", () => {
            const mockRequest = {
                body: undefined,
                params: { peerUrl: "to_remove" } as Record<string, any>,
                method: "DELETE",
                url: "/peers/to_remove"
            } as Request;

            const mockResponse = {
                json: jest.fn(),
                sendStatus: jest.fn(),
            } as Partial<Response>;

            //@ts-ignore
            fakePeers.peerExists.mockImplementation(() => true);

            const expected = "to_remove";

            new PeersController(fakePeers as Peers).removePeer(mockRequest, mockResponse as Response);

            expect(fakePeers.peerExists).toHaveBeenCalledWith(expected);
            expect(fakePeers.removePeer).toHaveBeenCalledWith(expected);
            expect(fakePeers.broadcast).toHaveBeenCalledWith("DELETE", "/peers/to_remove", undefined);
            expect(mockResponse.sendStatus).toHaveBeenCalledWith(204);
        });

        test("Add: unknonwn id", () => {
            const mockRequest = {
                body: undefined,
                params: { peerUrl: "to_remove" } as Record<string, any>,
                method: "DELETE",
                url: "/peers/to_remove"
            } as Request;

            const mockResponse = {
                json: jest.fn(),
                sendStatus: jest.fn(),
            } as Partial<Response>;

            //@ts-ignore
            fakePeers.peerExists.mockImplementation(() => false);

            const expected = "to_remove";

            new PeersController(fakePeers as Peers).removePeer(mockRequest, mockResponse as Response);

            expect(fakePeers.peerExists).toHaveBeenCalledWith(expected);
            expect(fakePeers.removePeer).toHaveBeenCalledTimes(0);
            expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
            expect(mockResponse.sendStatus).toHaveBeenCalledWith(204);
        });

        test("Remove: missing url", () => {
            const mockRequest = {
                body: undefined,
                params: {} as Record<string, any>,
                method: "DELETE",
                url: "/peers/"
            } as Request;

            const mockResponse = {
                json: jest.fn(),
                sendStatus: jest.fn(),
            } as Partial<Response>;

            //@ts-ignore
            fakePeers.peerExists.mockImplementation(() => false);

            new PeersController(fakePeers as Peers).removePeer(mockRequest, mockResponse as Response);

            expect(fakePeers.peerExists).toHaveBeenCalledTimes(0);
            expect(fakePeers.removePeer).toHaveBeenCalledTimes(0);
            expect(fakePeers.broadcast).toHaveBeenCalledTimes(0);
            expect(mockResponse.sendStatus).toHaveBeenCalledWith(400);
        });
    });
});