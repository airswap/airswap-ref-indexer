import { isNumeric } from "../validator/index.js";

export function toStrings(value: string, separator = ","): string[] | undefined {
    return value !== undefined && value !== null && (typeof value == "string") && value.trim() != "" ? value.split(separator) : undefined;
}

export function toNumber(value: string): number | undefined {
    return isNumeric(value) ? +value : undefined
}