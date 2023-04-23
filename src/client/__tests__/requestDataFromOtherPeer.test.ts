import { Database } from './../../database/Database';
import { Peers } from './../../peer/Peers';
import { Server } from '@airswap/libraries';
import { requestDataFromOtherPeer } from "../requestDataFromOtherPeer";
import { forgeDbOrderERC20, forgeDbOrderMarketPlace, forgeFullOrderERC20, forgeFullOrderMarketPlace } from '../../Fixtures';

let fakeDb: Partial<Database>;
let fakePeers: Partial<Peers>;

jest.mock('@airswap/libraries', () => ({
    Server: {
        at: jest.fn()
    }
}));


describe("requestDataFromOtherPeer", () => {
    beforeEach(() => {
        fakePeers = {
            addPeers: jest.fn(),
            getConnectablePeers: jest.fn()
        };
        fakeDb = {
            addAllOrderERC20: jest.fn(),
            addAllOrderMarketPlace: jest.fn(),
        };
        //@ts-ignore
        Server.at.mockClear()
    });

    test("Nominal", async () => {
        // @ts-ignore
        fakePeers.getConnectablePeers.mockImplementation(() => ["http://first_node/", "http://second_node/"]);
        const mockGetOrdersERC20 = jest.fn()
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({ orders: [{ hash: "hash", addedOn: 123, order: forgeFullOrderERC20(1) }] })
        const mockGetOrdersMarketPlace = jest.fn()
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce({ orders: [{ hash: "hash", addedOn: 123, order: forgeFullOrderMarketPlace(1) }] })
        // @ts-ignore
        Server.at.mockImplementation(() => ({
            getOrdersERC20: mockGetOrdersERC20, getOrders: mockGetOrdersMarketPlace
        }))

        await requestDataFromOtherPeer(["http://first_node/", "http://second_node/"], fakeDb as Database, fakePeers as Peers);

        expect(fakePeers.addPeers).toHaveBeenCalledWith(["http://first_node/", "http://second_node/"]);
        expect(fakePeers.getConnectablePeers).toHaveBeenCalledTimes(1);
        expect(Server.at).toHaveBeenNthCalledWith(1, "http://first_node/");
        expect(Server.at).toHaveBeenNthCalledWith(2, "http://second_node/");
        expect(mockGetOrdersERC20).toHaveBeenCalledTimes(2);
        expect(mockGetOrdersMarketPlace).toHaveBeenCalledTimes(2);
        expect(fakeDb.addAllOrderERC20).toHaveBeenCalledWith({ hash: { hash: "hash", addedOn: 123, order: forgeDbOrderERC20(1) } });
        expect(fakeDb.addAllOrderMarketPlace).toHaveBeenCalledWith({ hash: { hash: "hash", addedOn: 123, order: forgeDbOrderMarketPlace(1) } });
    });

    test("No connectable peers", async () => {
        // @ts-ignore
        fakePeers.getConnectablePeers.mockImplementation(() => []);

        const mockGetOrdersERC20 = jest.fn();
        const mockGetOrders = jest.fn();
        //@ts-ignore
        Server.at.mockImplementation(() => ({
            getOrdersERC20: mockGetOrdersERC20, getOrders: mockGetOrders
        }))
        await requestDataFromOtherPeer(["http://first_node/"], fakeDb as Database, fakePeers as Peers);

        expect(fakePeers.addPeers).toHaveBeenCalledWith(["http://first_node/"]);
        expect(fakePeers.getConnectablePeers).toHaveBeenCalledTimes(1);
        expect(mockGetOrdersERC20).not.toHaveBeenCalled();
        expect(mockGetOrders).not.toHaveBeenCalled();
        expect(fakeDb.addAllOrderERC20).not.toHaveBeenCalled();
        expect(fakeDb.addAllOrderMarketPlace).not.toHaveBeenCalled();
    });

    test("No peers", async () => {
        // @ts-ignore
        fakePeers.getConnectablePeers.mockImplementation(() => []);
        const mockGetOrdersERC20 = jest.fn();
        const mockGetOrders = jest.fn();
        //@ts-ignore
        Server.at.mockImplementation(() => ({
            getOrdersERC20: mockGetOrdersERC20, getOrders: mockGetOrders
        }))

        await requestDataFromOtherPeer([], fakeDb as Database, fakePeers as Peers);

        expect(fakePeers.addPeers).not.toHaveBeenCalled();
        expect(fakePeers.getConnectablePeers).toHaveBeenCalledTimes(1);
        expect(Server.at).not.toHaveBeenCalled();
        expect(fakeDb.addAllOrderERC20).not.toHaveBeenCalled();
        expect(fakeDb.addAllOrderMarketPlace).not.toHaveBeenCalled();
    });
});