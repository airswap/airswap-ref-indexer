import { Filters } from '../Filters';
describe("Filters", () => {

    let filters;

    beforeEach(() => {
        filters = new Filters();
    });

    describe("sender Token", () => {
        test("add new senderToken", () => {
            filters.addSenderToken("eth", 10);

            expect(filters.senderToken).toEqual({ "eth": { min: 10, max: 10 } });
        });

        test("Cannot add new sender token if value is negative", () => {
            filters.addSenderToken("eth", -10);

            expect(filters.senderToken).toEqual({});
        });

        test("add new sender token", () => {
            filters.addSenderToken("dai", 11);

            expect(filters.senderToken).toEqual({ "dai": { min: 11, max: 11 } });
        });

        test("update min sender token", () => {
            filters.addSenderToken("dai", 11);
            filters.addSenderToken("DAI", 9);

            expect(filters.senderToken).toEqual({ "dai": { min: 9, max: 11 } });
        });

        test("update max sender token", () => {
            filters.addSenderToken("dai", 11);
            filters.addSenderToken("DAI", 100);

            expect(filters.senderToken).toEqual({ "dai": { min: 11, max: 100 } });
        });

        test("add Multiple sender token", () => {
            filters.addSenderToken("eth", 11);
            filters.addSenderToken("dai", 100);

            expect(filters.senderToken).toEqual({ "dai": { min: 100, max: 100 }, "eth": { min: 11, max: 11 } });
        });

        test("Multiple edit one", () => {
            filters.addSenderToken("eth", 11);
            filters.addSenderToken("dai", 100);
            filters.addSenderToken("dai", 50);

            expect(filters.senderToken).toEqual({
                "dai": {
                    min: 50, max: 100
                }, "eth": { min: 11, max: 11 }
            });
        });
    });

    describe("signer Token", () => {
        test("add new signer token", () => {
            filters.addSignerToken("eth", 10);

            expect(filters.signerToken).toEqual({ "eth": { min: 10, max: 10 } });
        });

        test("Cannot add new signer token if value is negative", () => {
            filters.addSignerToken("eth", -10);

            expect(filters.signerToken).toEqual({});
        });

        test("add new signer token", () => {
            filters.addSignerToken("dai", 11);

            expect(filters.signerToken).toEqual({ "dai": { min: 11, max: 11 } });
        });

        test("update min signer token", () => {
            filters.addSignerToken("dai", 11);
            filters.addSignerToken("DAI", 9);

            expect(filters.signerToken).toEqual({ "dai": { min: 9, max: 11 } });
        });

        test("update max signer token", () => {
            filters.addSignerToken("dai", 11);
            filters.addSignerToken("DAI", 100);

            expect(filters.signerToken).toEqual({ "dai": { min: 11, max: 100 } });
        });

        test("add Multiple signer token", () => {
            filters.addSignerToken("eth", 11);
            filters.addSignerToken("dai", 100);

            expect(filters.signerToken).toEqual({ "dai": { min: 100, max: 100 }, "eth": { min: 11, max: 11 } });
        });

        test("Multiple edit one", () => {
            filters.addSignerToken("eth", 11);
            filters.addSignerToken("dai", 100);
            filters.addSignerToken("dai", 50);

            expect(filters.signerToken).toEqual({ "dai": { min: 50, max: 100 }, "eth": { min: 11, max: 11 } });
        });
    });
});