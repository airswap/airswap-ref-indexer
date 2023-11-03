import { Web3RegistryClient } from "../Web3RegistryClient";
import { getRegistry } from "../getRegistry";
import { Peers } from "../../peer/Peers";

jest.mock("../Web3RegistryClient");

describe("getRegistry", () => {
    let fakeWebRegistryClient: Partial<Web3RegistryClient>;

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("Conf is not complete", async () => {
        expect(await getRegistry({}, {} as Peers, [])).toBe(null);
        expect(await getRegistry({ NETWORK: "rinkeby" }, {} as Peers, [])).toBe(null);
        expect(await getRegistry({ API_KEY: "infura" }, {} as Peers, [5])).toBe(null);
    });

    test("ok smart contract", async () => {
        const registry = await getRegistry({ API_KEY: "infura", NETWORK: "rinkeby" }, {} as Peers, [5]);
        expect(registry!.constructor.name).toBe("Web3RegistryClient");
        expect(registry!.connect).toHaveBeenCalledWith(5);
    });
});
