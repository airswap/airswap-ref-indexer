import axios from "axios";

const tokens = [
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
    "0x0000000000000000000000000000000000000000", // ETH
    "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
    "0x27054b13b1b798b345b591a4d22e6562d47ea75a", // AST
];

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
            await axios.post("http://localhost:4001/", {
                jsonrpc: "2.0",
                id: "1",
                method: "addOrder",
                params: {
                    nonce: "nonce",
                    expiry: "1653807874951",
                    signerWallet: "signerWallet",
                    signerToken: signerToken,
                    signerAmount: `${index}`,
                    senderWallet: "senderWallet",
                    senderToken: senderToken,
                    senderAmount: "10",
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
