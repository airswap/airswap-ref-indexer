import { getRegistry } from "../getRegistry";
import { Peers } from './../../peer/Peers';

jest.mock('../../indexers/index');
jest.mock('./../Web3RegistryClient');

describe("getRegistry", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("Conf is not complete", () => {
        expect(getRegistry(true, {}, {} as Peers)).toBe(null);
        expect(getRegistry(true, { REGISTRY: "registryAddress", NETWORK: "rinkeby" }, {} as Peers)).toBe(null);
        expect(getRegistry(true, { REGISTRY: "registryAddress", API_KEY: "infura"}, {} as Peers)).toBe(null);
    });    

    test("ok smart contract", () => {
        const newLocal = getRegistry(true, { REGISTRY: "registryAddress", API_KEY: "infura", NETWORK: "rinkeby" }, {} as Peers);
        expect(newLocal!.constructor.name).toBe("Web3RegistryClient");
    });

    test("ok http", () => {
        const newLocal = getRegistry(false, { REGISTRY: "registryAddress" }, {} as Peers);
        expect(newLocal!.constructor.name).toBe("HttpRegistryClient");
    });
});