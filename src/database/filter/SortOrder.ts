export enum SortOrder {
    ASC ="ASC",
    DESC ="DESC"
}

export function toSortOrder(key: string) : SortOrder {
    if (key === null || key === undefined || !(typeof key === 'string')) {
        return undefined;
      }
      const upperCaseValue = key.toUpperCase();
      const match = Object.keys(SortOrder).filter(s => s === upperCaseValue);
      return match.length === 1 ? match[0] as SortOrder : undefined;
}