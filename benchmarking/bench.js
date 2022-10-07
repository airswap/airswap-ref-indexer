import axios from "axios";
import { AddressZero } from "@ethersproject/constants";

const tokens = [
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
    AddressZero, // ETH
    "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
    "0x27054b13b1b798b345b591a4d22e6562d47ea75a", // AST
];

async function bench() {
    let lastDate = new Date().getTime();
    let shift = 0;
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
        shift++;
        const expiryInSeconds = `${(new Date().getTime() + shift * 60000) / 1000}`;
        try {
            await axios.post("http://localhost:4001/", {
                jsonrpc: "2.0",
                id: "1",
                method: "addOrder",
                params: [
                    {
                        nonce: "nonce",
                        expiry: expiryInSeconds,
                        signerWallet: AddressZero,
                        signerToken: signerToken,
                        signerAmount: `${index}`,
                        senderWallet: AddressZero,
                        senderToken: senderToken,
                        senderAmount: "10",
                        protocolFee: "4",
                        r: "0x3e1010e70f178443d0e3437464db2f910be150259cfcbe8916a6267247bea0f7",
                        s: "0x5a12fdf12c2b966a98d238916a670bdfd83e207e54a9c7d0af923839582de79f",
                        v: "28",
                        chainId: "5",
                        swapContract: AddressZero,
                    },
                ],
            });
        } catch (error) {
            console.log(error);
        }
    }
}

bench();
