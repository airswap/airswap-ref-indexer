import axios from "axios";

const tokens = ["BTC", "ETH", "DAI", "AST"];

async function bench() {
    let lastDate = new Date().getTime();
    for (let index = 1; index < 100; index++) {
        if (index % 100 === 0) {
            const now = new Date().getTime();
            const elapsed = now - lastDate;
            console.log(index, elapsed, elapsed / 100, "ms/rq");
            lastDate = now;
        }
        const signerToken = tokens[Math.floor(Math.random() * tokens.length)];
        const senderToken = tokens.filter((name) => name !== signerToken)[
            Math.floor(Math.random() * (tokens.length - 1))
        ];
        
        try {
            await axios.post("http://localhost:4001/orders", {
                order: {
                    nonce: "nonce",
                    expiry: 1653807874951,
                    signerWallet: "signerWallet",
                    signerToken: signerToken,
                    signerAmount: index,
                    senderWallet: "senderWallet",
                    senderToken: senderToken,
                    senderAmount: 10,
                    r: "r",
                    s: "s",
                    v: "v",
                },
            });
        } catch (error) {
            console.log(error);
        }
    }
}

bench();
