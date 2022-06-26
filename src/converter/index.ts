import { isNumeric } from "../validator/index.js";

export function toStrings(value: string, separator = ","): string[] {
    return value !== undefined && value !== null && (typeof value == "string") && value.trim() != "" ? value.split(separator) : undefined;
}

export function toNumber(value: string): number {
    return isNumeric(value) ? +value : undefined
}