import { IndexedOrder, FullOrder, OrderResponse } from "@airswap/types";
import { FullOrderERC20 } from "@airswap/types";
import { isValidFullOrder, isValidFullOrderERC20 } from "@airswap/utils";
import { Database } from "../database/Database.js";
import { mapAnyToDbOrderERC20 } from "../mapper/mapAnyToDbOrderERC20.js";
import { mapAnyToOrderFilter } from "../mapper/mapAnyToOrderFilter.js";
import { isDateInRange, isNumeric } from "../validator/index.js";
import { AlreadyExistsError } from "../model/error/AlreadyExists.js";
import { ClientError } from "../model/error/ClientError.js";
import { Web3SwapERC20Client } from "../client/Web3SwapERC20Client.js";
import { DbOrderERC20, DbOrder } from "../model/DbOrderTypes.js";
import { mapAnyToDbOrder } from "../mapper/mapAnyToDbOrder.js";
import { Web3SwapClient } from "../client/Web3SwapClient";
import { InvalidSignatureException } from "../model/error/InvalidSignatureException.js";
import { Web3RegistryClient } from "client/Web3RegistryClient.js";

export const METHODS = {
    getOrdersERC20: "getOrdersERC20",
    addOrderERC20: "addOrderERC20",
    getOrders: "getOrders",
    addOrder: "addOrder",
    getTokens: "getTokens"
} as Record<string, string>;

export class OrderService {
    private database: Database;
    private web3SwapERC20Client: Web3SwapERC20Client;
    private web3SwapClient: Web3SwapClient;
    private web3RegistryClient: Web3RegistryClient;
    private maxResultByQuery: number;

    constructor(
        database: Database,
        web3ERC20SwapClient: Web3SwapERC20Client,
        web3SwapClient: Web3SwapClient,
        web3RegistryClient: Web3RegistryClient,
        maxResultByQuery: number
    ) {
        this.database = database;
        this.web3SwapERC20Client = web3ERC20SwapClient;
        this.web3SwapClient = web3SwapClient;
        this.maxResultByQuery = maxResultByQuery;
        this.web3RegistryClient = web3RegistryClient;

        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter((name) => name !== "constructor")
            .sort();
        if (!(methods.length === Object.keys(METHODS).length && methods.every((value: string) => value === METHODS[value]))) {
            console.error("Diverging:", methods, METHODS);
            throw new Error("Hardcoded method names & real are diverging");
        }
    }

    public async addOrderERC20(body: any): Promise<void> {
        if (!body || Object.keys(body).length == 0) {
            throw new ClientError("No body");
        }
        if (!isValidFullOrderERC20(body)) {
            throw new ClientError("Missing fields");
        }
        if (!areERC20NumberFieldsValid(body)) {
            throw new ClientError("Number fields are incorrect");
        }
        if (!isDateInRange(body.expiry)) {
            throw new ClientError("Invalid expiry date");
        }

        const dbOrder = mapAnyToDbOrderERC20(body);
        const addedTimestamp = isNumeric(body.addedOn) ? +body.addedOn : new Date().getTime();
        const indexedOrder: IndexedOrder<DbOrderERC20> = { order: dbOrder, addedOn: addedTimestamp };
        const hash = this.database.generateHashERC20(indexedOrder);
        const orderExists = await this.database.orderERC20Exists(hash);
        if (orderExists) {
            throw new AlreadyExistsError();
        }

        indexedOrder.hash = hash;
        const isNetworkAdded = this.web3SwapERC20Client.connectToChain(indexedOrder.order.chainId);
        await this.web3RegistryClient.connect(indexedOrder.order.chainId);
        if (!isNetworkAdded) {
            throw new ClientError("Chain ID unsupported");
        }
        const isOrderValid = await this.web3SwapERC20Client.isValidOrder(indexedOrder.order);
        if (!isOrderValid) {
            throw new InvalidSignatureException();
        }
        await this.database.addOrderERC20(indexedOrder);
        console.log("Added", indexedOrder.order);
        return Promise.resolve();
    }

    public async getOrdersERC20(query: Record<string, any>): Promise<OrderResponse<FullOrderERC20>> {
        if (query === undefined || query === null) {
            throw new ClientError("Incorrect query");
        }
        let orders: OrderResponse<FullOrderERC20>;
        if (query.hash) {
            orders = await this.database.getOrderERC20(query.hash);
        } else if (Object.keys(query).length === 0) {
            orders = await this.database.getOrdersERC20();
        } else {
            orders = await this.database.getOrdersERC20By(mapAnyToOrderFilter(query, this.maxResultByQuery));
        }
        return Promise.resolve(orders);
    }

    public async addOrder(body: any) {
        if (!body || Object.keys(body).length == 0) {
            throw new ClientError("No body");
        }
        if (!isValidFullOrder(body)) {
            throw new ClientError("Missing fields");
        }
        if (!areOrderNumberFieldsValid(body)) {
            throw new ClientError("Number fields are incorrect");
        }
        if (!isDateInRange(body.expiry)) {
            throw new ClientError("Invalid expiry date");
        }
        const dbOrder = mapAnyToDbOrder(body);
        const addedTimestamp = isNumeric(body.addedOn) ? +body.addedOn : new Date().getTime();
        const indexedOrder: IndexedOrder<DbOrder> = { order: dbOrder, addedOn: addedTimestamp };
        const hash = this.database.generateHash(indexedOrder);
        const orderExists = await this.database.orderExists(hash);
        if (orderExists) {
            throw new AlreadyExistsError();
        }

        indexedOrder.hash = hash;
        const isNetworkAdded = await this.web3SwapClient.connectToChain(indexedOrder.order.chainId);
        this.web3RegistryClient.connect(indexedOrder.order.chainId);
        if (!isNetworkAdded) {
            throw new ClientError("Chain ID unsupported");
        }
        const isOrderValid = await this.web3SwapClient.isValidOrder(body);
        if (!isOrderValid) {
            throw new InvalidSignatureException();
        }
        await this.database.addOrder(indexedOrder);
        console.log("Added", indexedOrder.order);
        return Promise.resolve();
    }

    public async getOrders(query: Record<string, any>): Promise<OrderResponse<FullOrder>> {
        if (query === undefined || query === null) {
            throw new ClientError("Incorrect query");
        }
        let orders: OrderResponse<FullOrder>;
        if (query.hash) {
            orders = await this.database.getOrder(query.hash);
        } else if (Object.keys(query).length === 0) {
            orders = await this.database.getOrders();
        } else {
            orders = await this.database.getOrdersBy(mapAnyToOrderFilter(query, this.maxResultByQuery));
        }
        return Promise.resolve(orders);
    }

    public async getTokens(): Promise<any> {
        const filters = await this.database.getTokens();
        return filters;
    }
}

function areERC20NumberFieldsValid(order: FullOrderERC20) {
    return isNumeric(order.senderAmount) && isNumeric(order.signerAmount) && isNumeric(order.expiry) && isNumeric(order.nonce);
}

function areOrderNumberFieldsValid(order: FullOrder) {
    return (
        isNumeric(order.sender.amount) &&
        isNumeric(order.signer.amount) &&
        isNumeric(order.expiry) &&
        isNumeric(order.affiliateAmount) &&
        isNumeric(order.nonce)
    );
}
