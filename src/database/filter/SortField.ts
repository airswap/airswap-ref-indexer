export enum SortField {
    SIGNER_AMOUNT = "SIGNER_AMOUNT",
    SENDER_AMOUNT = "SENDER_AMOUNT"
}

export function toSortField(key: string) : SortField {
    if (key === null || key === undefined || !(typeof key === 'string')) {
        return undefined;
      }
      const upperCaseValue = key.toUpperCase();
      const match = Object.keys(SortField).filter(s => s === upperCaseValue);
      return match.length === 1 ? match[0] as SortField : undefined;
}