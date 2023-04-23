import { FullOrder, FullOrderERC20, OrderParty } from "@airswap/types";

type Modify<T, R> = Omit<T, keyof R> & R;

export type DbOrderERC20 = Modify<FullOrderERC20, {
    expiry: number;
    approximatedSignerAmount: bigint;
    approximatedSenderAmount: bigint;
}>

export type DbOrderParty = Modify<OrderParty, {
    approximatedAmount: bigint;
}>
export type DbOrder = Modify<FullOrder, {
    expiry: number;
    signer: DbOrderParty;
    sender: DbOrderParty;
}>
