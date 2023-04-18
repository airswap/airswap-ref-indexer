import { FullOrderERC20, Order, OrderParty } from "@airswap/types";

type Modify<T, R> = Omit<T, keyof R> & R;

export declare type InternalDbOrder = {
    expiry: number;
    approximatedSignerAmount: BigInt;
    approximatedSenderAmount: BigInt;
};

export type DbOrder = Modify<FullOrderERC20, {
    expiry: number;
    approximatedSignerAmount: BigInt;
    approximatedSenderAmount: BigInt;
}>

export type DbOrderParty = Modify<OrderParty, {
    amount: number;
}>
export type DbOrderMarketPlace = Modify<Order, {
    expiry: number;
    signer: DbOrderParty;
    sender: DbOrderParty;
    affiliate: DbOrderParty;
}>