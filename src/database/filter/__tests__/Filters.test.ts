import { Filters } from '../Filters';
describe("Filters", () => {

    let filters: Filters;

    beforeEach(() => {
        filters = new Filters();
    });

    describe("sender Token", () => {
        test("add new senderToken", () => {
            filters.addSenderToken("eth", BigInt(BigInt(10)));

            expect(filters.senderToken).toEqual({ "eth": { min: BigInt(10), max: BigInt(10) } });
        });

        test("Cannot add new sender token if value is negative", () => {
            filters.addSenderToken("eth", BigInt(BigInt(-10)));

            expect(filters.senderToken).toEqual({});
        });

        test("add new sender token", () => {
            filters.addSenderToken("dai", BigInt(11));

            expect(filters.senderToken).toEqual({ "dai": { min: BigInt(11), max: BigInt(11) } });
        });

        test("update min sender token", () => {
            filters.addSenderToken("dai", BigInt(11));
            filters.addSenderToken("DAI", BigInt(9));

            expect(filters.senderToken).toEqual({ "dai": { min: BigInt(9), max: BigInt(11) } });
        });

        test("update max sender token", () => {
            filters.addSenderToken("dai", BigInt(11));
            filters.addSenderToken("DAI", BigInt(100));

            expect(filters.senderToken).toEqual({ "dai": { min: BigInt(11), max: BigInt(100) } });
        });

        test("add Multiple sender token", () => {
            filters.addSenderToken("eth", BigInt(11));
            filters.addSenderToken("dai", BigInt(100));

            expect(filters.senderToken).toEqual({ "dai": { min: BigInt(100), max: BigInt(100) }, "eth": { min: BigInt(11), max: BigInt(11) } });
        });

        test("Multiple edit one", () => {
            filters.addSenderToken("eth", BigInt(11));
            filters.addSenderToken("dai", BigInt(100));
            filters.addSenderToken("dai", BigInt(50));

            expect(filters.senderToken).toEqual({
                "dai": {
                    min: BigInt(50), max: BigInt(100)
                }, "eth": { min: BigInt(11), max: BigInt(11) }
            });
        });
    });

    describe("signer Token", () => {
        test("add new signer token", () => {
            filters.addSignerToken("eth", BigInt(10));

            expect(filters.signerToken).toEqual({ "eth": { min: BigInt(10), max: BigInt(10) } });
        });

        test("Cannot add new signer token if value is negative", () => {
            filters.addSignerToken("eth", BigInt(-10));

            expect(filters.signerToken).toEqual({});
        });

        test("add new signer token", () => {
            filters.addSignerToken("dai", BigInt(11));

            expect(filters.signerToken).toEqual({ "dai": { min: BigInt(11), max: BigInt(11) } });
        });

        test("update min signer token", () => {
            filters.addSignerToken("dai", BigInt(11));
            filters.addSignerToken("DAI", BigInt(9));

            expect(filters.signerToken).toEqual({ "dai": { min: BigInt(9), max: BigInt(11) } });
        });

        test("update max signer token", () => {
            filters.addSignerToken("dai", BigInt(11));
            filters.addSignerToken("DAI", BigInt(100));

            expect(filters.signerToken).toEqual({ "dai": { min: BigInt(11), max: BigInt(100) } });
        });

        test("add Multiple signer token", () => {
            filters.addSignerToken("eth", BigInt(11));
            filters.addSignerToken("dai", BigInt(100));

            expect(filters.signerToken).toEqual({ "dai": { min: BigInt(100), max: BigInt(100) }, "eth": { min: BigInt(11), max: BigInt(11) } });
        });

        test("Multiple edit one", () => {
            filters.addSignerToken("eth", BigInt(11));
            filters.addSignerToken("dai", BigInt(100));
            filters.addSignerToken("dai", BigInt(50));

            expect(filters.signerToken).toEqual({ "dai": { min: BigInt(50), max: BigInt(100) }, "eth": { min: BigInt(11), max: BigInt(11) } });
        });
    });
});