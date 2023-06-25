import { FullOrder, FullOrderERC20, OrderFilter, OrderParty } from "@airswap/types";

type Modify<T, R> = Omit<T, keyof R> & R;

export type DbOrderERC20 = Modify<FullOrderERC20, {
    nonce: number;
    expiry: number;
    approximatedSignerAmount: bigint;
    approximatedSenderAmount: bigint;
}>

export type DbOrderParty = Modify<OrderParty, {
    approximatedAmount: bigint;
}>
export type DbOrder = Modify<FullOrder, {
    nonce: number;
    expiry: number;
    signer: DbOrderParty;
    sender: DbOrderParty;
}>

export type DbOrderFilter = Modify<OrderFilter, {
    nonce?: number;
    signerMinAmount?: bigint;
    signerMaxAmount?: bigint;
    senderMinAmount?: bigint;
    senderMaxAmount?: bigint;
}>