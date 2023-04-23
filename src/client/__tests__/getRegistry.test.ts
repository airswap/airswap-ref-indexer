import { getRegistry } from "../getRegistry";
import { Peers } from './../../peer/Peers';

jest.mock('./../Web3RegistryClient');

describe("getRegistry", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("Conf is not complete", () => {
        expect(getRegistry({}, {} as Peers)).toBe(null);
        expect(getRegistry({ NETWORK: "rinkeby" }, {} as Peers)).toBe(null);
        expect(getRegistry({ API_KEY: "infura"}, {} as Peers)).toBe(null);
    });    

    test("ok smart contract", () => {
        const newLocal = getRegistry({ API_KEY: "infura", NETWORK: "rinkeby" }, {} as Peers);
        expect(newLocal!.constructor.name).toBe("Web3RegistryClient");
    });
});