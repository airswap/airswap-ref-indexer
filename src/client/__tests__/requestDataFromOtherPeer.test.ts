import { Database } from './../../database/Database';
import { Peers } from './../../peer/Peers';
import { OrderClient } from './../OrderClient';
import { requestDataFromOtherPeer } from "../requestDataFromOtherPeer";

let fakeDb: Partial<Database>;
let fakePeers: Partial<Peers>;
let fakeClient: Partial<OrderClient>;

describe("requestDataFromOtherPeer", () => {
    beforeEach(() => {
        fakeClient = {
            getOrders: jest.fn()
        }
        fakePeers = {
            addPeers: jest.fn(),
            getConnectablePeers: jest.fn()
        };
        fakeDb = {
            addAll: jest.fn(),
        };
    });

    test("Nominal", async () => {
        // @ts-ignore
        fakePeers.getConnectablePeers.mockImplementation(() => ["http://first_node/", "http://seconde_node/"]);
        // @ts-ignore
        fakeClient.getOrders.mockImplementation(() => Promise.resolve({ data: { orders: [{ order: "yay" }] } }));

        await requestDataFromOtherPeer(["http://first_node/", "http://seconde_node/"], fakeDb as Database, fakePeers as Peers, fakeClient as OrderClient);

        expect(fakePeers.addPeers).toHaveBeenCalledWith(["http://first_node/", "http://seconde_node/"]);
        expect(fakePeers.getConnectablePeers).toHaveBeenCalledTimes(2);
        expect(fakeClient.getOrders).toHaveBeenCalledWith("http://first_node/");
        expect(fakeDb.addAll).toHaveBeenCalledWith([{ order: "yay" }]);
    });

    test("No connectable peers", async () => {
        // @ts-ignore
        fakePeers.getConnectablePeers.mockImplementation(() => []);
        // @ts-ignore
        fakeClient.getOrders.mockImplementation(() => Promise.resolve({ data: { orders: [{ order: "yay" }] } }));

        await requestDataFromOtherPeer(["http://first_node/"], fakeDb as Database, fakePeers as Peers, fakeClient as OrderClient);

        expect(fakePeers.addPeers).toHaveBeenCalledWith(["http://first_node/"]);
        expect(fakePeers.getConnectablePeers).toHaveBeenCalledTimes(1);
        expect(fakeClient.getOrders).not.toHaveBeenCalled();
        expect(fakeDb.addAll).not.toHaveBeenCalled();
    });

    test("No peers", async () => {
        // @ts-ignore
        fakePeers.getConnectablePeers.mockImplementation(() => []);
        // @ts-ignore
        fakeClient.getOrders.mockImplementation(() => Promise.resolve({ data: { orders: [{ order: "yay" }] } }));

        await requestDataFromOtherPeer([], fakeDb as Database, fakePeers as Peers, fakeClient as OrderClient);

        expect(fakePeers.addPeers).not.toHaveBeenCalled();
        expect(fakePeers.getConnectablePeers).toHaveBeenCalledTimes(1);
        expect(fakeClient.getOrders).not.toHaveBeenCalled();
        expect(fakeDb.addAll).not.toHaveBeenCalled();
    });
});