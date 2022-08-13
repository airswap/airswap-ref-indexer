import { Peers } from './../../peer/Peers';
import { RegistryClient } from './../RegistryClient';
import { registerInNetwork } from "../registerInNetwork";

let fakeClient: Partial<RegistryClient>;
let fakePeers: Partial<Peers>;

describe("Register In Netowrk", () => {

    beforeEach(() => {
        fakeClient = {
            sendIpToRegistry : jest.fn()
        }
        fakePeers = {
            broadcastMyHostToOtherPeer: jest.fn()
        };
    });

    test("nominal", async () => {
        await registerInNetwork(fakeClient as RegistryClient, "host", fakePeers as Peers);
        expect(fakeClient.sendIpToRegistry).toHaveBeenCalledWith("host")
        expect(fakePeers.broadcastMyHostToOtherPeer).toHaveBeenCalledWith()
    });
});