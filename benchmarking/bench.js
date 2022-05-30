import axios from "axios";

async function bench() {
    let lastDate = new Date().getTime();
    for (let index = 1; index < 5000; index++) {
        if (index % 100 === 0) {
            const now = new Date().getTime();
            const elapsed = now - lastDate;
            console.log(index, elapsed, elapsed / 100, "ms/rq");
            lastDate = now;
        }

        try {
            await axios.post("http://localhost:4001/orders", {
                "order": {
                    "nonce": "nonce",
                    "expiry": 1653807874951,
                    "signerWallet": "signerWallet",
                    "signerToken": "dai",
                    "signerAmount": index,
                    "protocolFee": 0.20,
                    "senderWallet": "senderWallet",
                    "senderToken": "ETH",
                    "senderAmount": 10,
                    "r":"r",
                    "s":"s",
                    "v":"v"
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
}

bench();
