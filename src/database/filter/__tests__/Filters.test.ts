import { Filters } from '../Filters';
describe("Filters", () => {

    describe("sender Token", () => {
        test("add new senderToken", () => {
            const filters = new Filters();

            filters.addSenderToken("eth", Number(10));

            expect(filters.senderToken).toEqual({ "eth": { min: Number(10), max: Number(10) } });
        });

        test("add new sender token", () => {
            const filters = new Filters();

            filters.addSenderToken("dai", Number(11));

            expect(filters.senderToken).toEqual({ "dai": { min: Number(11), max: Number(11) } });
        });

        test("update min sender token", () => {
            const filters = new Filters();

            filters.addSenderToken("dai", Number(11));
            filters.addSenderToken("dai", Number(9));

            expect(filters.senderToken).toEqual({ "dai": { min: Number(9), max: Number(11) } });
        });

        test("update max sender token", () => {
            const filters = new Filters();

            filters.addSenderToken("dai", Number(11));
            filters.addSenderToken("dai", Number(100));

            expect(filters.senderToken).toEqual({ "dai": { min: Number(11), max: Number(100) } });
        });

        test("add Multiple sender token", () => {
            const filters = new Filters();

            filters.addSenderToken("eth", Number(11));
            filters.addSenderToken("dai", Number(100));

            expect(filters.senderToken).toEqual({ "dai": { min: Number(100), max: Number(100) }, "eth": { min: Number(11), max: Number(11) } });
        });

        test("Multiple edit one", () => {
            const filters = new Filters();

            filters.addSenderToken("eth", Number(11));
            filters.addSenderToken("dai", Number(100));
            filters.addSenderToken("dai", Number(50));

            expect(filters.senderToken).toEqual({ "dai": { min: Number(50), max: Number(100) }, "eth": { min: Number(11), max: Number(11) } });
        });
    });

    describe("signer Token", () => {
        test("add new signer token", () => {
            const filters = new Filters();

            filters.addSignerToken("eth", Number(10));

            expect(filters.signerToken).toEqual({ "eth": { min: Number(10), max: Number(10) } });
        });

        test("add new signer token", () => {
            const filters = new Filters();

            filters.addSignerToken("dai", Number(11));

            expect(filters.signerToken).toEqual({ "dai": { min: Number(11), max: Number(11) } });
        });

        test("update min signer token", () => {
            const filters = new Filters();

            filters.addSignerToken("dai", Number(11));
            filters.addSignerToken("dai", Number(9));

            expect(filters.signerToken).toEqual({ "dai": { min: Number(9), max: Number(11) } });
        });

        test("update max signer token", () => {
            const filters = new Filters();

            filters.addSignerToken("dai", Number(11));
            filters.addSignerToken("dai", Number(100));

            expect(filters.signerToken).toEqual({ "dai": { min: Number(11), max: Number(100) } });
        });

        test("add Multiple signer token", () => {
            const filters = new Filters();

            filters.addSignerToken("eth", Number(11));
            filters.addSignerToken("dai", Number(100));

            expect(filters.signerToken).toEqual({ "dai": { min: Number(100), max: Number(100) }, "eth": { min: Number(11), max: Number(11) } });
        });

        test("Multiple edit one", () => {
            const filters = new Filters();

            filters.addSignerToken("eth", Number(11));
            filters.addSignerToken("dai", Number(100));
            filters.addSignerToken("dai", Number(50));

            expect(filters.signerToken).toEqual({ "dai": { min: Number(50), max: Number(100) }, "eth": { min: Number(11), max: Number(11) } });
        });
    });
});