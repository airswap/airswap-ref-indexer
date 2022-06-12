import { Filters } from '../Filters';
describe("Filters", () => {

    describe("sender Token", () => {
        test("add new senderToken", () => {
            const filters = new Filters();
    
            filters.addSenderToken("eth", 10);
    
            expect(filters.senderToken).toEqual({ "eth": { min: 10, max: 10 } });
        });
    
        test("add new sender token", () => {
            const filters = new Filters();
    
            filters.addSenderToken("dai", 11);
    
            expect(filters.senderToken).toEqual({ "dai": { min: 11, max: 11 } });
        });
    
        test("update min sender token", () => {
            const filters = new Filters();
    
            filters.addSenderToken("dai", 11);
            filters.addSenderToken("dai", 9);
    
            expect(filters.senderToken).toEqual({ "dai": { min: 9, max: 11 } });
        });
    
        test("update max sender token", () => {
            const filters = new Filters();
    
            filters.addSenderToken("dai", 11);
            filters.addSenderToken("dai", 100);
    
            expect(filters.senderToken).toEqual({ "dai": { min: 11, max: 100 } });
        });

        test("add Multiple sender token", () => {
            const filters = new Filters();
    
            filters.addSenderToken("eth", 11);
            filters.addSenderToken("dai", 100);
    
            expect(filters.senderToken).toEqual({ "dai": { min: 100, max: 100 }, "eth": { min: 11, max: 11 } });
        });

        test("Multiple edit one", () => {
            const filters = new Filters();
    
            filters.addSenderToken("eth", 11);
            filters.addSenderToken("dai", 100);
            filters.addSenderToken("dai", 50);
    
            expect(filters.senderToken).toEqual({ "dai": { min: 50, max: 100 }, "eth": { min: 11, max: 11 } });
        });
    });

    describe("signer Token", () => {
        test("add new signer token", () => {
            const filters = new Filters();
    
            filters.addSignerToken("eth", 10);
    
            expect(filters.signerToken).toEqual({ "eth": { min: 10, max: 10 } });
        });
    
        test("add new signer token", () => {
            const filters = new Filters();
    
            filters.addSignerToken("dai", 11);
    
            expect(filters.signerToken).toEqual({ "dai": { min: 11, max: 11 } });
        });
    
        test("update min signer token", () => {
            const filters = new Filters();
    
            filters.addSignerToken("dai", 11);
            filters.addSignerToken("dai", 9);
    
            expect(filters.signerToken).toEqual({ "dai": { min: 9, max: 11 } });
        });
    
        test("update max signer token", () => {
            const filters = new Filters();
    
            filters.addSignerToken("dai", 11);
            filters.addSignerToken("dai", 100);
    
            expect(filters.signerToken).toEqual({ "dai": { min: 11, max: 100 } });
        });

        test("add Multiple signer token", () => {
            const filters = new Filters();
    
            filters.addSignerToken("eth", 11);
            filters.addSignerToken("dai", 100);
    
            expect(filters.signerToken).toEqual({ "dai": { min: 100, max: 100 }, "eth": { min: 11, max: 11 } });
        });

        test("Multiple edit one", () => {
            const filters = new Filters();
    
            filters.addSignerToken("eth", 11);
            filters.addSignerToken("dai", 100);
            filters.addSignerToken("dai", 50);
    
            expect(filters.signerToken).toEqual({ "dai": { min: 50, max: 100 }, "eth": { min: 11, max: 11 } });
        });
    });
});