import { FiltersResponse } from "@airswap/types";
import { Filters } from "../../database/filter/Filters.js";
import { mapToFilterResponse } from "../mapFilterToFilterResponse.js";

describe("mapFilterToFilterResponse", () => {
    it("map correctly", () => {
        const filters = new Filters();
        filters.addSenderToken("usdc", BigInt(10))
        filters.addSignerToken("usdt", BigInt(10))
        const expected: FiltersResponse = {
            senderToken:{
                usdc: {
                    min: "10",
                    max: "10"
                }
            },
            signerToken: {
                usdt: {
                    min: "10",
                    max: "10"
                }
            }
        }
        
        const result = mapToFilterResponse(filters);

        expect(result).toEqual(expected)
    })
});