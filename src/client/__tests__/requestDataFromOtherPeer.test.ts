import { Database } from './../../database/Database';
import { Peers } from './../../peer/Peers';
import { Server } from '@airswap/libraries';
import { requestDataFromOtherPeer } from "../requestDataFromOtherPeer";
import { forgeDbOrder, forgeFullOrderERC20 } from '../../Fixtures';

let fakeDb: Partial<Database>;
let fakePeers: Partial<Peers>;

jest.mock('@airswap/libraries');
const mockServer = Server as jest.Mocked<typeof Server>;

describe("requestDataFromOtherPeer", () => {
    beforeEach(() => {
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
        fakePeers.getConnectablePeers.mockImplementation(() => ["http://first_node/", "http://second_node/"]);
        const mockGetOrders = jest.fn()
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({ orders: [{ hash: "hash", addedOn: 123, order: forgeFullOrderERC20(1) }] })

        // @ts-ignore
        mockServer.at.mockImplementation(() => ({ getOrdersERC20: mockGetOrders }))

        await requestDataFromOtherPeer(["http://first_node/", "http://second_node/"], fakeDb as Database, fakePeers as Peers);

        expect(fakePeers.addPeers).toHaveBeenCalledWith(["http://first_node/", "http://second_node/"]);
        expect(fakePeers.getConnectablePeers).toHaveBeenCalledTimes(1);
        expect(mockServer.at).toHaveBeenNthCalledWith(1, "http://first_node/");
        expect(mockServer.at).toHaveBeenNthCalledWith(2, "http://second_node/");
        expect(mockGetOrders).toHaveBeenCalledTimes(2);
        expect(fakeDb.addAll).toHaveBeenCalledWith({ hash: { hash: "hash", addedOn: 123, order: forgeDbOrder(1) } });
    });

    test("No connectable peers", async () => {
        // @ts-ignore
        fakePeers.getConnectablePeers.mockImplementation(() => []);

        const mockGetOrders = jest.fn();
        //@ts-ignore
        mockServer.mockImplementation(jest.fn(() => ({ getOrders: mockGetOrders })))

        await requestDataFromOtherPeer(["http://first_node/"], fakeDb as Database, fakePeers as Peers);

        expect(fakePeers.addPeers).toHaveBeenCalledWith(["http://first_node/"]);
        expect(fakePeers.getConnectablePeers).toHaveBeenCalledTimes(1);
        expect(mockGetOrders).not.toHaveBeenCalled();
        expect(fakeDb.addAll).not.toHaveBeenCalled();
    });

    test("No peers", async () => {
        // @ts-ignore
        fakePeers.getConnectablePeers.mockImplementation(() => []);
        const mockGetOrders = jest.fn();
        //@ts-ignore
        mockServer.mockImplementation(jest.fn(() => ({ getOrders: mockGetOrders })))

        await requestDataFromOtherPeer([], fakeDb as Database, fakePeers as Peers);

        expect(fakePeers.addPeers).not.toHaveBeenCalled();
        expect(fakePeers.getConnectablePeers).toHaveBeenCalledTimes(1);
        expect(mockServer).not.toHaveBeenCalled();
        expect(fakeDb.addAll).not.toHaveBeenCalled();
    });
});