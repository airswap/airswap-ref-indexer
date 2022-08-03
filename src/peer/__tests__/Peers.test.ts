import { BroadcastClient } from './../../client/BroadcastClient';
import { PeersClient } from '../../client/PeersClient';
import { Database } from '../../database/Database';
import { Peers } from './../Peers';
describe("Peers", () => {

    let fakeDb: Partial<Database>;
    let fakePeersClient: Partial<PeersClient>;
    let fakeBroadcastClient: Partial<BroadcastClient>;

    beforeEach(() => {
        fakeDb = {};
        fakeBroadcastClient = {
            broadcastTo: jest.fn()
        };
        fakePeersClient = {
            addPeer: jest.fn(),
            removePeer: jest.fn()
        };
    })

    describe('Add', () => {
        test("can't add several times the same url", () => {
            const peer = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
            peer.addPeer("a_url");
            peer.addPeer("a_url");
            peer.addPeer("a_url");

            expect(peer.getPeers()).toEqual(["a_url"]);
        });

        test("can't add several times url set", () => {
            const peer = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
            peer.addPeers(["a_url", "another"]);
            peer.addPeers(["a_url", "another", "a_third"]);

            expect(peer.getPeers()).toEqual(["a_url", "another", "a_third"]);
        });
    });

    describe("remove", () => {
        test("Do nothing if peers list is empty", () => {
            const peer = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
            peer.removePeer("a_url");
            expect(peer.getPeers()).toEqual([]);
        });

        test("Do nothing if peers list is empty", () => {
            const peer = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
            peer.addPeer("a_url");
            peer.addPeer("another_url");
            peer.removePeer("a_url");
            expect(peer.getPeers()).toEqual(["another_url"]);
        });
    });

    describe("peerExists", () => {
        test("return false if peers is empty", () => {
            const peer = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
            expect(peer.peerExists("not_in_list")).toBe(false);
        });

        test("return false if unknonwn", () => {
            const peer = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
            peer.addPeer("a_url");
            expect(peer.peerExists("not_in_list")).toBe(false);
        });

        test("return true if knonwn", () => {
            const peer = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
            peer.addPeer("a_url");
            peer.addPeer("another_one");
            expect(peer.peerExists("a_url")).toBe(true);
        });
    });

    describe("getConnectablePeers", () => {
        test("return empty if peers is empty", () => {
            const peer = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
            expect(peer.getConnectablePeers()).toEqual([]);
        });

        test("return empty if peers only contains self url", () => {
            const peer = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
            peer.addPeer("http://localhost/");
            expect(peer.getConnectablePeers()).toEqual([]);
        });

        test("returns other peers if exists", () => {
            const peer = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
            peer.addPeer("http://localhost/");
            peer.addPeer("http://a_url/");
            peer.addPeer("http://another_one/");
            expect(peer.getConnectablePeers()).toEqual(["http://a_url/", "http://another_one/"]);
        });
    });

    describe("containsUnknownPeers", () => {
        test("return false if peers is empty", () => {
            const peer = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
            expect(peer.containsUnknownPeers([])).toBe(false);
        });

        test("return true if peers is empty", () => {
            const peer = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
            expect(peer.containsUnknownPeers(['a_url'])).toBe(true);
        });

        test("containsUnknownPeers return false if peers is already knonwn", () => {
            const peer = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
            peer.addPeers(['another', 'a_url']);
            expect(peer.containsUnknownPeers(['a_url', 'another'])).toBe(false);
        });

        test("containsUnknownPeers return true if one of peers is unknonwn", () => {
            const peer = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
            peer.addPeer("a_url");
            peer.addPeer("another_one");
            expect(peer.containsUnknownPeers(['a_url', 'another', 'a_third'])).toBe(true);
        });
    });

    describe("broadcasting", () => {
        describe("broadcast", () => {
            test("do nothing if peers only contains local url", () => {
                const peers = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
                peers.addPeer("http://localhost/");
                peers.broadcast("GET", "a_url", undefined);
                expect(fakeBroadcastClient.broadcastTo).toHaveBeenCalledTimes(0);
            });

            test("broadcast method to others", () => {
                const peers = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
                peers.addPeers(["http://localhost/", "http://another/", "http://a_third/"]);
                peers.broadcast("POST", "/a_url", { key: "body" });
                expect(fakeBroadcastClient.broadcastTo).toHaveBeenNthCalledWith(1, "POST", "http://another/a_url", { "key": "body" });
                expect(fakeBroadcastClient.broadcastTo).toHaveBeenNthCalledWith(2, "POST", "http://a_third/a_url", { "key": "body" });
            });
        });

        describe("broadcastMyHostToOtherPeer", () => {
            test("do nothing if peers only contains local url", () => {
                const peers = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
                peers.addPeer("http://localhost/");
                peers.broadcastMyHostToOtherPeer();
                expect(fakePeersClient.addPeer).toHaveBeenCalledTimes(0);
            });

            test("broadcast method to others", () => {
                const peers = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
                peers.addPeers(["http://localhost/", "http://another/", "http://a_third/"]);
                peers.broadcastMyHostToOtherPeer();
                expect(fakePeersClient.addPeer).toHaveBeenNthCalledWith(1, "http://another/", "http://localhost/");
                expect(fakePeersClient.addPeer).toHaveBeenNthCalledWith(2, "http://a_third/", "http://localhost/");
            });
        });

        describe("broadcastDisconnectionToOtherPeer", () => {
            test("do nothing if peers only contains local url", () => {
                const peers = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
                peers.addPeer("http://localhost/");
                peers.broadcastDisconnectionToOtherPeer();
                expect(fakePeersClient.removePeer).toHaveBeenCalledTimes(0);
            });

            test("broadcast method to others", () => {
                const peers = new Peers(fakeDb as Database, "http://localhost/", fakePeersClient as PeersClient, fakeBroadcastClient as BroadcastClient, false);
                peers.addPeers(["http://localhost/", "http://another/", "http://a_third/"]);
                peers.broadcastDisconnectionToOtherPeer();
                expect(fakePeersClient.removePeer).toHaveBeenNthCalledWith(1, "http://another/", "http://localhost/");
                expect(fakePeersClient.removePeer).toHaveBeenNthCalledWith(2, "http://a_third/", "http://localhost/");
            });
        });
    });
});